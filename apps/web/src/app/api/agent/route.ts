import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { classifyEveLine } from "@/lib/eve-stream";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Talk to the Eve agent through the zico API gateway (apps/api), not the agent
// directly. The gateway routes /agents/butler/* to the butler agent's /eve/* API.
const API_URL = process.env.API_URL ?? "http://127.0.0.1:8787";
const AGENT_BASE = `${API_URL}/agents/butler`;

// Liveness probe for the dashboard/sidebar. 502 from the gateway means it can't
// reach the agent; anything else means the agent is up. Never invokes the model.
export async function GET() {
  try {
    const res = await fetch(`${AGENT_BASE}/`, { signal: AbortSignal.timeout(2000) });
    return NextResponse.json({ online: res.status !== 502 });
  } catch {
    return NextResponse.json({ online: false });
  }
}

type EveStart = { sessionId: string; continuationToken: string };

async function startSession(message: string): Promise<EveStart> {
  const res = await fetch(`${AGENT_BASE}/v1/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`agent returned ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as Partial<EveStart>;
  const sessionId = json.sessionId ?? res.headers.get("x-eve-session-id") ?? undefined;
  if (!sessionId || !json.continuationToken) throw new Error("no session handles from agent");
  return { sessionId, continuationToken: json.continuationToken };
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let message: string;
  let conversationId: string;
  let skipUserInsert = false;
  try {
    const body = (await req.json()) as {
      message?: unknown;
      conversationId?: unknown;
      skipUserInsert?: unknown;
    };
    if (typeof body.message !== "string" || !body.message.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }
    if (typeof body.conversationId !== "string") {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
    }
    message = body.message;
    conversationId = body.conversationId;
    skipUserInsert = body.skipUserInsert === true;
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  // Load the conversation. RLS scopes this to the signed-in user, so a missing
  // row means "not yours or doesn't exist" — either way, 404.
  const { data: convo } = await supabase
    .from("conversations")
    .select("id, eve_session_id, eve_continuation_token, title")
    .eq("id", conversationId)
    .single();
  if (!convo) return NextResponse.json({ error: "conversation not found" }, { status: 404 });

  // Persist the user's turn before calling Eve (skipped on retry, where it's
  // already stored from the failed attempt).
  if (!skipUserInsert) {
    await supabase.from("messages").insert({
      conversation_id: convo.id,
      role: "user",
      content: message,
    });
  }

  // Reuse the conversation's Eve session for memory; start one on first turn.
  // If a stored session is gone (rare — sessions live for weeks), start fresh.
  let handles: EveStart;
  try {
    if (convo.eve_session_id && convo.eve_continuation_token) {
      const res = await fetch(`${AGENT_BASE}/v1/session/${convo.eve_session_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ continuationToken: convo.eve_continuation_token, message }),
      });
      if (res.status === 404 || res.status === 410) {
        handles = await startSession(message);
      } else if (!res.ok) {
        return NextResponse.json({ error: `agent returned ${res.status}` }, { status: 502 });
      } else {
        const json = (await res.json()) as Partial<EveStart>;
        handles = {
          sessionId: json.sessionId ?? convo.eve_session_id,
          continuationToken: json.continuationToken ?? convo.eve_continuation_token,
        };
      }
    } else {
      handles = await startSession(message);
    }
  } catch (err) {
    console.error("[agent/route] failed to reach the agent:", err);
    return NextResponse.json({ error: "couldn't reach the agent" }, { status: 502 });
  }

  // Persist the (rotated) session handles, set the title from the first message,
  // and bump ordering. The continuation token changes every turn.
  await supabase
    .from("conversations")
    .update({
      eve_session_id: handles.sessionId,
      eve_continuation_token: handles.continuationToken,
      title: convo.title ?? message.slice(0, 80),
      updated_at: new Date().toISOString(),
    })
    .eq("id", convo.id);

  // Stream the turn's assistant text to the client, accumulating it to persist
  // once the turn ends.
  let upstream: Response;
  try {
    upstream = await fetch(`${AGENT_BASE}/v1/session/${handles.sessionId}/stream`);
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: `stream returned ${upstream.status}` }, { status: 502 });
    }
  } catch (err) {
    console.error("[agent/route] failed to open stream:", err);
    return NextResponse.json({ error: "stream unavailable" }, { status: 502 });
  }

  const body = upstream.body;
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const reader = body.getReader();
      let buffer = "";
      let assistant = "";

      const handleLine = (line: string): boolean => {
        const { delta, terminal } = classifyEveLine(line);
        if (delta) {
          assistant += delta;
          controller.enqueue(encoder.encode(delta));
        }
        return terminal;
      };

      try {
        let done = false;
        while (!done) {
          const { done: streamDone, value } = await reader.read();
          if (streamDone) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (handleLine(line)) {
              done = true;
              break;
            }
          }
        }
        if (!done && buffer.trim()) handleLine(buffer);
      } catch (err) {
        console.error("[agent/route] stream read error:", err);
      } finally {
        reader.releaseLock();
      }

      if (assistant.trim()) {
        await supabase
          .from("messages")
          .insert({ conversation_id: convo.id, role: "assistant", content: assistant });
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

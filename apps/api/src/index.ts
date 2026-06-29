import "./instrumentation.ts"; // must be first: registers the global tracer provider
import { httpInstrumentationMiddleware } from "@hono/otel";
import { OpenAPIHono, z } from "@hono/zod-openapi";

// Gateway → agent registry. The monorepo's agents each expose the eve HTTP API
// under /eve/v1/*; the gateway gives the frontends one stable origin and routes
// /agents/<name>/* to the matching agent. Add an agent = add a line here.
// ponytail: a plain record is the whole "gateway". Swap for service discovery
// only if agents stop being a fixed, hand-maintained set.
const AGENTS: Record<string, string> = {
  butler: process.env.AGENT_URL ?? "http://127.0.0.1:3001",
};

/**
 * Map a gateway request path to the upstream eve agent URL.
 * `/agents/butler/v1/session` → `<agentBase>/eve/v1/session`
 */
export function upstreamUrl(
  agentBase: string,
  agent: string,
  gatewayPath: string,
  search: string,
): string {
  const rest = gatewayPath.slice(`/agents/${agent}`.length) || "/";
  const url = new URL(`/eve${rest}`, agentBase);
  url.search = search;
  return url.toString();
}

const app = new OpenAPIHono();

app.use("*", httpInstrumentationMiddleware({ serviceName: "zico-api" }));

app.get("/health", (c) => c.json({ ok: true, agents: Object.keys(AGENTS) }));

// Transparent reverse proxy. Returns the upstream Response directly so NDJSON
// streams (the session event stream) pass through untouched.
app.all("/agents/:agent/*", async (c) => {
  const agent = c.req.param("agent");
  const base = AGENTS[agent];
  if (!base) {
    return c.json({ error: "unknown_agent", message: `No agent '${agent}'` }, 404);
  }

  const { search } = new URL(c.req.url);
  const target = upstreamUrl(base, agent, c.req.path, search);

  // Drop hop-by-hop host so fetch sets it from the target.
  const headers = new Headers(c.req.raw.headers);
  headers.delete("host");

  try {
    return await fetch(target, {
      method: c.req.method,
      headers,
      body: c.req.raw.body,
      redirect: "manual",
      duplex: "half", // stream the request body instead of buffering it
    });
  } catch {
    return c.json({ error: "agent_unreachable", message: `Cannot reach agent '${agent}'` }, 502);
  }
});

// ── OpenAPI document ───────────────────────────────────────────────────────
// The spec describes the gateway's public surface (`/agents/{agent}/v1/*`),
// which is what clients actually hit. Routes are registered for documentation
// only — the transparent proxy above handles the traffic, so nothing here reads
// or validates the request/response bodies (that would break NDJSON streaming).
const CreateSessionRequest = z
  .object({ message: z.string().openapi({ example: "What is the weather in Brooklyn?" }) })
  .openapi("CreateSessionRequest");

const ContinueSessionRequest = z
  .object({
    message: z.string(),
    continuationToken: z.string().openapi({ description: "Token returned by the previous turn." }),
  })
  .openapi("ContinueSessionRequest");

const SessionResponse = z
  .object({
    ok: z.boolean().optional(),
    sessionId: z.string().optional(),
    continuationToken: z
      .string()
      .optional()
      .openapi({ description: "Token used to send the next message in this session." }),
  })
  .openapi("SessionResponse");

const StreamEvent = z
  .object({
    type: z
      .string()
      .openapi({ description: "Event type, e.g. text-delta, tool-call, reasoning, finish." }),
    data: z.record(z.string(), z.unknown()).openapi({ description: "Type-specific payload." }),
  })
  .openapi("StreamEvent");

const ErrorResponse = z.object({ error: z.string(), message: z.string() }).openapi("ErrorResponse");

const agentParam = {
  name: "agent",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const, example: "butler" },
};
const sessionIdParam = {
  name: "sessionId",
  in: "path" as const,
  required: true,
  schema: { type: "string" as const },
};
const json = (schema: z.ZodTypeAny) => ({ "application/json": { schema } });

app.openAPIRegistry.registerPath({
  method: "post",
  path: "/agents/{agent}/v1/session",
  tags: ["Sessions"],
  summary: "Create a session",
  description:
    "Starts a new durable session and runs the first turn. The response includes an `x-eve-session-id` header and a `continuationToken` used to send follow-up messages.",
  request: {
    params: z.object({ agent: z.string() }),
    body: { content: json(CreateSessionRequest) },
  },
  responses: {
    202: {
      description: "Session created; first turn runs asynchronously as a durable workflow.",
      headers: { "x-eve-session-id": { schema: { type: "string" } } },
      content: json(SessionResponse),
    },
    400: { description: "Invalid request body.", content: json(ErrorResponse) },
    404: { description: "Unknown agent.", content: json(ErrorResponse) },
  },
});

app.openAPIRegistry.registerPath({
  method: "get",
  path: "/agents/{agent}/v1/session/{sessionId}/stream",
  tags: ["Sessions"],
  summary: "Attach to a session stream",
  description:
    "Streams newline-delimited JSON (NDJSON) lifecycle events for the session: token deltas, tool calls, reasoning, and turn completion.",
  parameters: [agentParam, sessionIdParam],
  responses: {
    200: {
      description: "NDJSON stream of lifecycle events.",
      content: { "application/x-ndjson": { schema: StreamEvent } },
    },
    404: { description: "Unknown session.", content: json(ErrorResponse) },
  },
});

app.openAPIRegistry.registerPath({
  method: "post",
  path: "/agents/{agent}/v1/session/{sessionId}/message",
  tags: ["Sessions"],
  summary: "Send a follow-up message",
  description:
    "Continues an existing session with another user message, using the `continuationToken` from the previous turn.",
  parameters: [agentParam, sessionIdParam],
  request: { body: { content: json(ContinueSessionRequest) } },
  responses: { 202: { description: "Follow-up turn accepted.", content: json(SessionResponse) } },
});

app.openAPIRegistry.registerPath({
  method: "post",
  path: "/agents/{agent}/v1/discord",
  tags: ["Channels"],
  summary: "Discord interactions webhook",
  description:
    "Discord HTTP Interactions endpoint for the agent's Discord channel. Set this URL as the app's Interactions Endpoint URL in the Discord Developer Portal. eve verifies the Ed25519 signature, so the gateway proxies the request through untouched.",
  parameters: [agentParam],
  request: {
    headers: z.object({
      "x-signature-ed25519": z.string().openapi({ description: "Discord request signature." }),
      "x-signature-timestamp": z.string().openapi({ description: "Discord request timestamp." }),
    }),
    body: { content: json(z.record(z.string(), z.unknown())) },
  },
  responses: {
    200: { description: "Interaction acknowledged (PONG or deferred response)." },
    401: { description: "Invalid or missing Discord signature." },
    404: { description: "Unknown agent.", content: json(ErrorResponse) },
  },
});

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "zico Agent API",
    version: "0.1.0",
    description:
      "HTTP API exposed by the zico gateway. Each session is a durable workflow: create a session, attach to its event stream, and continue the conversation with the returned continuation token.",
  },
  servers: [
    { url: "http://127.0.0.1:8787", description: "Local gateway (apps/api)" },
    { url: "https://api.garf.dev", description: "Production gateway" },
  ],
  tags: [
    { name: "Sessions", description: "Durable agent conversations" },
    { name: "Channels", description: "Inbound messaging-platform webhooks" },
  ],
});

export default {
  port: Number(process.env.PORT ?? 8787),
  fetch: app.fetch,
};

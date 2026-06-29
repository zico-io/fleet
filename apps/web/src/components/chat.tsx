"use client";

import { Avatar, AvatarFallback } from "@zico/ui/avatar";
import { Button } from "@zico/ui/button";
import { Textarea } from "@zico/ui/textarea";
import { ArrowUp, Loader2, Plus, RotateCcw, User } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Conversation,
  createConversation,
  listConversations,
  loadMessages,
} from "@/lib/conversations";
import { cn } from "@/lib/utils";

type Role = "user" | "assistant";
type Status = "streaming" | "error" | undefined;

interface Message {
  id: string;
  role: Role;
  content: string;
  status?: Status;
}

// Carries the active conversation across the two places Chat mounts (the full
// page at "/" and the side rail elsewhere); they never mount at the same time.
const ACTIVE_KEY = "zico:activeConversation";

const EXAMPLES = [
  "What's the weather in Brooklyn?",
  "Summarize my unread email",
  "Add oat milk to my shopping list",
];

function errorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  if (!raw || /failed to fetch|networkerror|load failed/i.test(raw)) {
    return "I couldn't reach the agent. Is the app running?";
  }
  return raw.length > 240 ? `${raw.slice(0, 240)}…` : raw;
}

export function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastUserText = useRef("");

  const reduce = useReducedMotion();

  // Boot: load the conversation list, pick the active one (stored, else most
  // recent, else create one), and load its transcript.
  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await listConversations();
      if (!alive) return;
      let id = localStorage.getItem(ACTIVE_KEY);
      if (!id || !list.some((c) => c.id === id)) id = list[0]?.id ?? null;
      if (!id) id = await createConversation();
      const finalList = list.some((c) => c.id === id) ? list : await listConversations();
      if (!alive) return;
      setConversations(finalList);
      setActiveId(id);
      localStorage.setItem(ACTIVE_KEY, id);
      const msgs = await loadMessages(id);
      if (!alive) return;
      setMessages(msgs);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Keep the transcript pinned to the latest message as it streams.
  // biome-ignore lint/correctness/useExhaustiveDependencies: messages is a change-trigger, not read in the body.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const setContent = useCallback((id: string, content: string, status?: Status) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content, status } : m)));
  }, []);

  const switchTo = useCallback(
    async (id: string) => {
      if (id === activeId || loading) return;
      setActiveId(id);
      localStorage.setItem(ACTIVE_KEY, id);
      setMessages(await loadMessages(id));
      inputRef.current?.focus();
    },
    [activeId, loading],
  );

  const newChat = useCallback(async () => {
    if (loading || messages.length === 0) return; // already on a fresh chat
    const id = await createConversation();
    setActiveId(id);
    localStorage.setItem(ACTIVE_KEY, id);
    setMessages([]);
    setConversations(await listConversations());
    inputRef.current?.focus();
  }, [loading, messages.length]);

  const runAgent = useCallback(
    async (text: string, assistantId: string, skipUserInsert: boolean) => {
      if (!activeId) return;
      setLoading(true);
      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, conversationId: activeId, skipUserInsert }),
        });

        if (!res.ok || !res.body) {
          const detail = await res.text().catch(() => "");
          let m = detail;
          try {
            m = JSON.parse(detail).error || detail;
          } catch {}
          throw new Error(m || `Request failed (${res.status})`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setContent(assistantId, acc, "streaming");
        }
        setContent(assistantId, acc || "(no response)", undefined);
        // Title/order may have changed on the first turn — refresh the list.
        void listConversations().then(setConversations);
      } catch (err) {
        console.error("[chat] agent error:", err);
        setContent(assistantId, errorMessage(err), "error");
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [activeId, setContent],
  );

  const send = useCallback(
    (textArg?: string) => {
      const text = (textArg ?? input).trim();
      if (!text || loading || !activeId) return;

      setInput("");
      lastUserText.current = text;
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: text },
        { id: assistantId, role: "assistant", content: "", status: "streaming" },
      ]);
      void runAgent(text, assistantId, false);
    },
    [input, loading, activeId, runAgent],
  );

  const retry = useCallback(() => {
    if (loading || !lastUserText.current) return;
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev.filter((m) => m.status !== "error"),
      { id: assistantId, role: "assistant", content: "", status: "streaming" },
    ]);
    // The user's message is already persisted from the failed attempt.
    void runAgent(lastUserText.current, assistantId, true);
  }, [loading, runAgent]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full w-full flex-col">
      {/* Conversation bar: switch past chats, start a new one. */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border py-2">
        <select
          value={activeId ?? ""}
          onChange={(e) => switchTo(e.target.value)}
          disabled={loading || conversations.length === 0}
          aria-label="Conversation"
          className="min-w-0 flex-1 truncate rounded-md bg-transparent px-2 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          {conversations.length === 0 && <option value="">New conversation</option>}
          {conversations.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title ?? "New conversation"}
            </option>
          ))}
        </select>
        <Button
          variant="ghost"
          size="sm"
          onClick={newChat}
          disabled={loading || isEmpty}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-4" />
          New
        </Button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <EmptyState reduce={reduce} onPick={(t) => send(t)} disabled={loading} />
        ) : (
          <div className="flex flex-col gap-5 py-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageRow
                  key={msg.id}
                  msg={msg}
                  reduce={reduce}
                  onRetry={retry}
                  canRetry={!loading}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="shrink-0 pb-5 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="relative rounded-2xl border border-input bg-background transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/40"
        >
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Message Eve…"
            aria-label="Message Eve"
            className="max-h-40 min-h-[52px] resize-none border-0 bg-transparent py-3.5 pr-14 pl-4 text-[15px] shadow-none focus-visible:border-0 focus-visible:ring-0 md:text-[15px] dark:bg-transparent"
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Send message"
            disabled={loading || !input.trim()}
            className="absolute right-2 bottom-2 size-9 rounded-xl"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
          </Button>
        </form>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Eve can make mistakes. Press{" "}
          <kbd className="rounded border border-border bg-muted px-1 font-mono text-[0.7rem] text-muted-foreground">
            Enter
          </kbd>{" "}
          to send,{" "}
          <kbd className="rounded border border-border bg-muted px-1 font-mono text-[0.7rem] text-muted-foreground">
            Shift+Enter
          </kbd>{" "}
          for a new line.
        </p>
      </div>
    </div>
  );
}

function EveAvatar({
  className,
  fallbackClassName,
}: {
  className?: string;
  fallbackClassName?: string;
}) {
  return (
    <Avatar className={cn("size-8", className)}>
      <AvatarFallback
        className={cn("bg-primary font-medium text-primary-foreground", fallbackClassName)}
      >
        E
      </AvatarFallback>
    </Avatar>
  );
}

function MessageRow({
  msg,
  reduce,
  onRetry,
  canRetry,
}: {
  msg: Message;
  reduce: boolean | null;
  onRetry: () => void;
  canRetry: boolean;
}) {
  const isUser = msg.role === "user";
  const isError = msg.status === "error";
  const isStreaming = msg.status === "streaming";

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex items-start gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {isUser ? (
        <Avatar className="size-8">
          <AvatarFallback className="bg-secondary text-muted-foreground">
            <User className="size-4" />
          </AvatarFallback>
        </Avatar>
      ) : (
        <EveAvatar />
      )}

      <div
        className={cn("flex min-w-0 flex-1 flex-col gap-1.5", isUser ? "items-end" : "items-start")}
      >
        <div
          className={cn(
            "max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap",
            isUser && "rounded-tr-md bg-primary text-primary-foreground",
            !isUser && !isError && "rounded-tl-md bg-muted text-foreground",
            isError &&
              "rounded-tl-md border border-destructive/30 bg-destructive/5 text-foreground",
          )}
        >
          {isStreaming && msg.content === "" ? (
            <ThinkingDots />
          ) : (
            <>
              {msg.content}
              {isStreaming && msg.content !== "" && <span className="caret" />}
            </>
          )}
        </div>

        {isError && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            disabled={!canRetry}
            className="h-7 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            Try again
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function ThinkingDots() {
  return (
    <span className="flex items-center gap-1 py-1" role="status" aria-label="Eve is thinking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="dot size-1.5 rounded-full bg-muted-foreground"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

function EmptyState({
  reduce,
  onPick,
  disabled,
}: {
  reduce: boolean | null;
  onPick: (text: string) => void;
  disabled: boolean;
}) {
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full flex-col items-center justify-center gap-6 py-10 text-center"
    >
      <EveAvatar className="size-12" fallbackClassName="text-lg" />
      <div className="space-y-2">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-balance text-foreground">
          Good day. I'm Eve.
        </h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          Ask me anything — the weather, your inbox, a quick bit of research. I'll take it from
          here.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((example) => (
          <Button
            key={example}
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onPick(example)}
            className="rounded-full font-normal text-muted-foreground hover:text-foreground"
          >
            {example}
          </Button>
        ))}
      </div>
    </motion.div>
  );
}

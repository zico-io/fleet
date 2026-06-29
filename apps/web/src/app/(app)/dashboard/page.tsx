"use client";

import { Activity, CloudSun, MessageSquare } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const MODEL = "claude-sonnet-4.6";

type Status = "checking" | "online" | "offline";

const CAPABILITIES = [
  {
    icon: MessageSquare,
    name: "Chat",
    detail: "Conversational sessions over the web and eve channels.",
  },
  {
    icon: CloudSun,
    name: "get_weather",
    detail: "Demo tool — returns mock weather for a city.",
  },
];

// Surfaced once a metrics backend records runs. Listed (not tiled) so the empty
// state teaches what will appear without pretending the numbers exist yet.
const FUTURE_METRICS = ["Sessions", "Tool calls", "Tokens", "Avg latency"];

export default function DashboardPage() {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let active = true;
    fetch("/api/agent")
      .then((r) => r.json())
      .then((d: { online?: boolean }) => active && setStatus(d.online ? "online" : "offline"))
      .catch(() => active && setStatus("offline"));
    return () => {
      active = false;
    };
  }, []);

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10"
    >
      {/* Agent identity */}
      <header className="flex items-center gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary font-serif text-xl font-semibold text-primary-foreground">
          z
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">zico</h1>
            <StatusBadge status={status} />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Personal agent ·{" "}
            <span className="font-mono text-[0.8rem] text-foreground/80">{MODEL}</span>
          </p>
        </div>
      </header>

      {/* Capabilities */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Capabilities</h2>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {CAPABILITIES.map(({ icon: Icon, name, detail }) => (
            <li key={name} className="flex items-start gap-3 px-4 py-3.5">
              <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-mono text-[0.8rem] text-foreground">{name}</p>
                <p className="text-sm text-muted-foreground">{detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Activity — honest empty state */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Activity</h2>
        <div className="rounded-xl border border-border px-6 py-10 text-center">
          <div className="mx-auto grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
            <Activity className="size-5" aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">No runs recorded yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Once a metrics backend is connected, your agent's run history and usage appear here.
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            Will track <span className="text-foreground/70">{FUTURE_METRICS.join(" · ")}</span>
          </p>
        </div>
      </section>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const label = status === "online" ? "Online" : status === "offline" ? "Offline" : "Checking…";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "online" && "bg-primary",
          status === "offline" && "bg-muted-foreground/40",
          status === "checking" && "animate-pulse bg-muted-foreground/40",
        )}
      />
      {label}
    </span>
  );
}

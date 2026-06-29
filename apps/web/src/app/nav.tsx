"use client";

import { BookText, LayoutDashboard, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Chat", icon: MessageSquare },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/docs", label: "Docs", icon: BookText },
] as const;

// Chat lives at "/"; the others own their subtree.
function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

// Desktop: a slim left rail. Warm Panel wash + hairline border set it one tonal
// step off the white content (product.md's "second neutral layer for sidebars").
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="surface hidden w-60 shrink-0 flex-col overflow-hidden lg:flex">
      <div className="px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5" aria-label="zico home">
          <span className="grid size-7 place-items-center rounded-lg bg-primary font-serif text-sm font-semibold text-primary-foreground">
            z
          </span>
          <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
            zico
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Primary">
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="size-[18px] shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <EvePresence />
      <UserMenu />
    </aside>
  );
}

// Mobile/tablet: a bottom tab bar. Same destinations, no drawer/overlay state.
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="surface flex shrink-0 items-stretch overflow-hidden lg:hidden"
      aria-label="Primary"
    >
      {links.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

type Status = "checking" | "online" | "offline";

// Butler presence at the foot of the rail. Reuses the dashboard's /api/agent
// status read so the sidebar shows, at a glance, whether Eve is reachable.
function EvePresence() {
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

  const label = status === "online" ? "Online" : status === "offline" ? "Offline" : "Checking…";

  return (
    <div className="flex items-center gap-2.5 border-t border-border px-5 py-3.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
        E
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">Eve</p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={cn(
              "size-1.5 rounded-full",
              status === "online" && "bg-primary",
              status === "offline" && "bg-muted-foreground/40",
              status === "checking" && "animate-pulse bg-muted-foreground/40",
            )}
          />
          {label}
        </p>
      </div>
    </div>
  );
}

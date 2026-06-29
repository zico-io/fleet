"use client";

import { Button } from "@zico/ui/button";
import { LogOut, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getStoredTheme, setTheme, type Theme } from "@/lib/theme";

// Foot of the sidebar: who's signed in, a theme toggle, and sign-out. The theme
// preference persists to profiles.prefs.theme (durable, cross-device) and to
// localStorage (the pre-paint cache in layout.tsx).
export function UserMenu() {
  const [name, setName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const meta = user.user_metadata as { user_name?: string; full_name?: string };
      setName(meta.user_name ?? meta.full_name ?? user.email ?? "Signed in");

      // Sync the durable theme into the local cache if they differ (e.g. set on
      // another device).
      const { data } = await supabase.from("profiles").select("prefs").eq("id", user.id).single();
      const p = (data?.prefs ?? {}) as Record<string, unknown>;
      setPrefs(p);
      const durable = p.theme as Theme | undefined;
      if (durable && durable !== getStoredTheme()) setTheme(durable);
    })();
  }, []);

  async function toggleTheme() {
    const next: Theme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    setTheme(next);
    if (userId) {
      const supabase = createClient();
      const merged = { ...prefs, theme: next };
      setPrefs(merged);
      await supabase.from("profiles").update({ prefs: merged }).eq("id", userId);
    }
  }

  async function signOut() {
    await createClient().auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="flex items-center gap-1 border-t border-border px-3 py-2.5">
      <p className="min-w-0 flex-1 truncate px-2 text-sm font-medium text-foreground">
        {name ?? "…"}
      </p>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="size-8 text-muted-foreground hover:text-foreground"
      >
        <Sun className="size-4 dark:hidden" />
        <Moon className="hidden size-4 dark:block" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={signOut}
        aria-label="Sign out"
        className="size-8 text-muted-foreground hover:text-foreground"
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  );
}

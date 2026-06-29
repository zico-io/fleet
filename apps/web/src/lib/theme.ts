// Theme is resolved to an explicit `.dark`/`.light` class on <html> by a
// pre-paint inline script (see layout.tsx) to avoid a flash. localStorage is the
// fast cache that script reads; profiles.prefs.theme in Supabase is the durable,
// cross-device source synced into it on load (see UserMenu).

export const THEME_KEY = "zico:theme";
export type Theme = "light" | "dark" | "system";

export function getStoredTheme(): Theme {
  const t = localStorage.getItem(THEME_KEY);
  return t === "light" || t === "dark" ? t : "system";
}

export function applyTheme(theme: Theme) {
  const dark =
    theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark);
}

export function setTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

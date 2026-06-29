# Supabase backend

Auth, preferences, session management, and agent chat history for the zico web
app. Supabase lives **entirely in the web app** — the Eve agent is untouched and
keeps its own durable session runtime. Next.js owns auth and the user-facing
record of conversations; the `/api/agent` route is the seam that ties a stored
conversation to an Eve session.

## One-time setup

1. **Create a Supabase project**, then copy its API keys into `.env`
   (see `.env.example`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=…
   NEXT_PUBLIC_SUPABASE_ANON_KEY=…
   SUPABASE_SERVICE_ROLE_KEY=…        # server-only, never shipped to the browser
   ```
2. **Run the migration** `supabase/migrations/0001_init.sql` — paste it into the
   Supabase SQL editor, or `supabase db push` if you use the CLI. It creates the
   tables, RLS policies, the invite trigger, and seeds the owner email.
3. **Enable GitHub auth**: Supabase dashboard → Authentication → Providers →
   GitHub. Create a GitHub OAuth app with callback
   `https://<project-ref>.supabase.co/auth/v1/callback` and paste its client
   id/secret into Supabase.
4. **Invite people**: access is allow-listed. Add emails to grant access:
   ```sql
   insert into allowed_emails (email) values ('someone@example.com');
   ```
   (`nico@garf.dev` is seeded by the migration.)

## Schema

| Table | Holds | Notes |
| --- | --- | --- |
| `profiles` | `id` (= `auth.users`), `prefs jsonb` | preferences as one blob (today: `theme`) |
| `allowed_emails` | invite allow-list | signup is rejected for emails not listed |
| `conversations` | `eve_session_id`, `eve_continuation_token`, `title` | one row per chat thread |
| `messages` | `role`, `content` | full verbatim transcript |

RLS is **own-rows**: every policy scopes reads/writes to `auth.uid()`. The
`handle_new_user` trigger gates signup on `allowed_emails` (raising rolls back the
`auth.users` insert, so a non-invited GitHub login fails and the callback
redirects to `/login?error=not-invited`) and seeds a `profiles` row.

## How it works

### Auth
`@supabase/ssr` cookie sessions. `middleware.ts` refreshes the session on every
request and redirects unauthenticated users to `/login` (only `/login` and
`/auth/*` are public). The authenticated app lives under the `(app)/` route
group so `/login` renders without the app shell. Sign-out is in the sidebar
`UserMenu`.

### Session management & memory
Each conversation reuses **one Eve session** across turns, so Eve actually
remembers context. `/api/agent` posts the first turn to `POST …/v1/session` and
every later turn to `POST …/v1/session/:sessionId` with the stored
`continuationToken`. **The continuation token rotates every turn** — the route
persists the new one each time. If a stored session is ever gone (sessions live
for weeks), it transparently starts a fresh one.

Eve's harness **auto-compacts** a long session at ~90% of the context window
(tunable via `compaction.thresholdPercent` in `agents/butler/agent/agent.ts`), so
a conversation never needs splitting — one UI conversation = one Eve session,
forever. Compaction is lossy inside Eve, but `messages` keeps the full verbatim
transcript, so the UI shows everything while Eve reasons over its compacted view.

### Chat history
The route writes the user turn and the streamed assistant turn to `messages`
(server-side, under RLS). The client streams optimistically and reloads the
transcript from Supabase on mount / conversation switch. The conversation lives
across reloads; the active one is carried between the full-page and side-rail
chat mounts via `localStorage`.

### Preferences (theme)
`profiles.prefs.theme` (`light` / `dark` / `system`). Theming is class-based: a
pre-paint inline script in `layout.tsx` sets `.dark`/`.light` on `<html>` from a
`localStorage` cache (no flash). The `UserMenu` toggle writes both the cache and
`profiles.prefs.theme` (durable, cross-device, synced back on load).

## Acceptance test

With Supabase configured and the agent + gateway running:
1. Sign in with an allow-listed GitHub email (a non-listed one → "not invited").
2. Send two turns in one conversation where the second references the first —
   Eve should remember (proves session reuse).
3. Refresh — the transcript reloads (proves persistence).
4. Toggle the theme and reload — it sticks (proves the pref persists).

## Deliberate simplifications

- No realtime sync; history reloads on mount (the page and rail never mount
  together).
- Conversation switcher is a native `<select>`; upgrade to a designed history
  popover when the list grows.
- `UserMenu` (theme + sign-out) is desktop-sidebar only — the product is
  desktop-focused.
- Theming requires JS (the app already does); no-JS users lose auto dark mode.

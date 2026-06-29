# @zico/web

Next.js 15 (App Router) front-end for the zico personal agent system.

## What it does

- **Chat (`/`)** — real-time chat UI that streams responses from the Eve agent.
- **Dashboard (`/dashboard`)** — placeholder stat cards; wire to live metrics once deployed.

## Development

From the monorepo root:

```bash
bun run dev          # starts all apps including this one on port 3000
```

Or from this directory:

```bash
bun run dev          # next dev --turbopack --port 3000
```

The app proxies chat messages through the API gateway via the `/api/agent` route
handler. Config comes from the monorepo-root `.env` (`cp .env.example .env`),
which `bun run dev` loads and every app inherits — there is no per-app env file.

## Environment variables

| Variable                        | Default                  | Description                              |
| ------------------------------- | ------------------------ | ---------------------------------------- |
| `API_URL`                       | `http://127.0.0.1:8787`  | Base URL of the zico API gateway.        |
| `NEXT_PUBLIC_SUPABASE_URL`      | —                        | Supabase project URL (auth, chat data).  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | —                        | Supabase anon key.                       |

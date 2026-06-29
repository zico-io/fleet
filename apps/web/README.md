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

The app proxies chat messages to the Eve agent via the `/api/agent` route handler.
The agent URL defaults to `http://127.0.0.1:3001` and can be overridden:

```bash
cp .env.example .env.local
# edit AGENT_URL if needed
```

## Environment variables

| Variable    | Default                    | Description                       |
| ----------- | -------------------------- | --------------------------------- |
| `AGENT_URL` | `http://127.0.0.1:3001`   | Base URL of the Eve agent server. |

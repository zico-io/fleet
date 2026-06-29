# zico

A personal agent system, built as a Bun + Turborepo monorepo.

- **`agents/butler`** — the agent itself, built on [Vercel's **eve**](https://vercel.com/docs/eve) framework (filesystem-first, durable, runs on Vercel Functions).
- **`apps/web`** — a [Next.js](https://nextjs.org) app: a **chat UI** for the agent, a starter **admin dashboard**, and the **docs** (Markdown guides at `/docs` plus an **interactive API reference** rendered by [Scalar](https://scalar.com) at `/docs/api`).

Shared code lives in `packages/`:

| Package | Purpose |
| --- | --- |
| `@zico/ui` | Shared React components (Tailwind v4) used by the web app |
| `@zico/tsconfig` | Shared `tsconfig` bases |

Linting and formatting are handled repo-wide by [Biome](https://biomejs.dev) via the root `biome.json` (a single fast pass — no per-package lint config).

## Architecture

```
┌───────────────┐  /agents/butler/v1/*  ┌───────────────┐   /eve/v1/*   ┌───────────────┐
│  apps/web     │ ────────────────────▶ │  apps/api     │ ────────────▶ │ agents/butler │
│  (Next.js)    │   NDJSON event stream │  (Hono gateway│   (NDJSON)    │ (eve)         │
│  chat + admin │ ◀──────────────────── │   :8787)      │ ◀──────────── │ :3001         │
│  + docs :3000 │                       └──────┬────────┘               └───────────────┘
└──────┬────────┘            generates /openapi.json
       │ /openapi.json  ◀───────────┘ (from its zod routes)
       │ (re-served same-origin; Scalar renders it at /docs/api)
```

The web app's `/api/agent` route proxies browser requests through the **Hono
gateway** (`apps/api`), which forwards to the eve agent's `/eve/v1/*` endpoints
and streams the NDJSON lifecycle events back to the chat UI. The gateway also
generates its own OpenAPI 3.1 document (via [`@hono/zod-openapi`](https://github.com/honojs/middleware/tree/main/packages/zod-openapi))
at `/openapi.json`; web re-serves it same-origin so Scalar can render it at `/docs/api`.

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.3 (`curl -fsSL https://bun.sh/install | bash`)
- Node.js ≥ 20

## Getting started

```bash
bun install
cp .env.example .env   # then fill in AI_GATEWAY_API_KEY / AGENT_URL
bun run dev            # runs all apps via Turborepo
```

| App | Dev URL | Command (standalone) |
| --- | --- | --- |
| Agent (eve) | http://127.0.0.1:3001 | `bun run --filter @zico/butler dev` |
| Web + docs (Next.js) | http://localhost:3000 | `bun run --filter @zico/web dev` |

> The eve agent needs model access. By default it resolves model strings (e.g.
> `anthropic/claude-sonnet-4.6`) through the **Vercel AI Gateway** — set
> `AI_GATEWAY_API_KEY`, or link the project with `bun run --filter @zico/butler exec eve link`.
> For the interactive agent REPL, run `bun run --filter @zico/butler repl`.

## Common scripts (root)

```bash
bun run dev          # all apps in dev (Turborepo)
bun run build        # build all apps
bun run lint         # Biome lint + format check across the repo
bun run format       # Biome auto-fix (format + organize imports + safe lint fixes)
bun run check-types  # typecheck all workspaces
```

## Smoke-testing the agent

```bash
# create a session
curl -i -X POST http://127.0.0.1:3001/eve/v1/session \
  -H 'content-type: application/json' \
  -d '{"message":"What is the weather in Brooklyn?"}'

# then attach to the stream using the x-eve-session-id header value
curl http://127.0.0.1:3001/eve/v1/session/<sessionId>/stream
```

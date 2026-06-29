---
title: Getting Started
description: Get zico running locally in a few steps.
---

## Prerequisites

- [Bun](https://bun.sh) >= 1.3

Install Bun if you don't have it:

```sh
curl -fsSL https://bun.sh/install | bash
```

## Install

Clone the repo and install all workspace dependencies from the monorepo root:

```sh
git clone https://github.com/zico-dev/zico
cd zico
bun install
```

## Run

Start all apps in development mode:

```sh
bun run dev
```

Or run individual apps:

```sh
# Web app only (chat, dashboard, and these docs)
bun run dev --filter @zico/web

# Agent only
bun run dev --filter @zico/butler
```

## Ports

| Service        | URL                        |
| -------------- | -------------------------- |
| Web app        | http://localhost:3000      |
| Docs           | http://localhost:3000/docs |
| Agent (Eve)    | http://localhost:3001      |

## Talking to the Agent API

Send a message to a session with curl:

```sh
# Create a session
curl -X POST http://localhost:3001/eve/v1/session \
  -H "Content-Type: application/json" \
  -d '{"agentId": "default"}'

# Send a message (replace SESSION_ID)
curl -X POST http://localhost:3001/eve/v1/session/SESSION_ID/message \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello, zico!"}'

# Stream the response
curl http://localhost:3001/eve/v1/session/SESSION_ID/stream
```

See the [API Reference](/docs/api) for full endpoint documentation.

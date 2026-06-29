---
title: Agent Concepts
description: How Eve agents work in zico — structure, tools, channels, skills, and subagents.
---

zico is built on the **Eve agent model**. Each agent is a directory under `agent/` with a well-defined structure that determines its behavior, capabilities, and communication channels.

## Agent Directory Structure

```
agent/
└── my-agent/
    ├── instructions.md   # System prompt / personality for this agent
    ├── agent.ts          # Agent entrypoint — wires tools, channels, and skills
    ├── tools/            # Tool implementations (functions the agent can call)
    ├── channels/         # I/O channels (HTTP, WebSocket, webhooks, etc.)
    ├── skills/           # Reusable capabilities shared across agents
    └── subagents/        # Child agents this agent can delegate to
```

### `instructions.md`

The agent's system prompt. Written in plain Markdown, it describes the agent's role, constraints, and any domain-specific knowledge it should have.

### `agent.ts`

The TypeScript entrypoint. This file imports and registers tools, channels, and skills, then exports the configured agent instance.

### `tools/`

Each file in `tools/` exports a tool the agent can invoke — for example, a web search, a database query, or a file operation. Tools are strongly typed and defined with a name, description, and input/output schema.

### `channels/`

Channels define how the agent communicates with the outside world. Common channels include HTTP endpoints, WebSocket handlers, and webhook receivers.

### `skills/`

Skills are reusable prompt fragments or capability modules that can be loaded into any agent. They let you share behavior (like memory management or code formatting) without duplicating tool or instruction logic.

### `subagents/`

An agent can delegate tasks to subagents — agents nested inside its own directory. The parent agent spawns subagents for specialized work and aggregates their results.

## Further Reading

- [Eve agent concepts](https://vercel.com/docs/eve/concepts) — upstream documentation for the Eve framework
- [API Reference](/docs/api) — the zico HTTP API for creating sessions and sending messages

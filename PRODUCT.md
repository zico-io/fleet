# Product

## Register

product

## Users

The owner and a small circle of invited users (a handful of trusted people, not
the public). The owner is a developer-operator who runs zico daily and is
comfortable with density; invited users are not. Both interact with the agent
("Eve", the butler) primarily through a chat conversation, and occasionally
check the dashboard to see how the agent is doing. Context of use: a focused
desktop/laptop session where the conversation is the main event.

## Product Purpose

zico is a personal agent system — a chat UI plus a starter admin dashboard for a
durable, filesystem-first agent. The product exists to make talking to your own
agent feel natural and trustworthy, and to give a clear, calm window into what
the agent is doing (sessions, tool calls, tokens, latency). Success looks like:
the chat gets out of the way so the conversation leads, and the dashboard reads
at a glance without feeling like a corporate control panel.

## Brand Personality

Warm, personal, friendly — a butler, not a control panel. Three words:
**warm, attentive, composed**. The interface should feel like a capable
assistant who is glad to help: approachable and human, never cold or clinical,
but still calm and precise. Quiet confidence over flashiness.

## Anti-references

- **Cold enterprise dashboard.** No dispassionate gray-on-white admin panels,
  no wall of identical stat cards, no corporate density-for-its-own-sake.
- **Cluttered / busy.** Stay spacious and calm even while warm; visual noise is
  the enemy. Warmth comes from color, type, and tone — not from more elements.
- Also steer away from the generic AI-chatbot clone look (sterile centered
  column of gray bubbles) and loud consumer-SaaS marketing energy
  (gradient-soaked heroes, glassmorphism).

## Design Principles

- **The conversation leads.** Chrome recedes; the agent's words are the focus.
  Every UI decision asks "does this help the conversation, or compete with it?"
- **Warmth without noise.** Approachability is carried by palette, type, and
  microcopy — never by clutter. Spacious and calm is a feature, not a gap.
- **Composed, not clinical.** Precision and restraint (Linear-grade craft),
  warmed up: soft surfaces and a gentle accent instead of cold gray.
- **Glanceable truth.** The dashboard tells you how the agent is doing in one
  read; honest empty/placeholder states over fake confidence.
- **Trustworthy by default.** Clear states, no surprises — a butler you can rely
  on.

## Accessibility & Inclusion

Target **WCAG 2.1 AA**: body text ≥4.5:1 contrast (including placeholder text),
large text ≥3:1, full keyboard navigation with visible focus states. Honor
`prefers-reduced-motion` for every animation (crossfade or instant fallback).

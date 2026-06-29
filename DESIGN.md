---
name: zico
description: A warm, composed interface for talking to your personal agent — "The Olive Study"
colors:
  primary: "oklch(0.47 0.10 115)"
  primary-hover: "oklch(0.42 0.10 115)"
  accent: "oklch(0.52 0.15 48)"
  accent-hover: "oklch(0.47 0.15 48)"
  canvas: "oklch(0.965 0.005 110)"
  bg: "oklch(1.000 0 0)"
  surface: "oklch(0.975 0.004 110)"
  ink: "oklch(0.22 0.015 110)"
  muted: "oklch(0.48 0.012 110)"
  border: "oklch(0.92 0.004 110)"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(1.75rem, 1.2rem + 2.4vw, 2.75rem)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.bg}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  shell-surface:
    backgroundColor: "{colors.bg}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.border}"
  card:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "20px"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  chat-assistant:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  chat-user:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
---

# Design System: zico

## 1. Overview

**Creative North Star: "The Olive Study"**

zico is the interface of a butler you trust — warm, attentive, composed. The
metaphor is a wood-panelled study in late-afternoon light: a calm, quiet desk
surface with the work laid out on bright sheets atop it. The shell is a soft
warm **canvas**; each region of the app — sidebar, content, nav — sits on it as
its own bright-white rounded surface, layered the way Shopify floats its panels.
A cured-olive primary and a burnt-terracotta accent do the emotional work, exactly
the way Linear lets its blue and Stripe lets its purple carry the brand. The
warmth is in the color, the type, and the gentle tonal step from canvas to
surface — never smeared across everything as decoration.

This system takes Linear-grade precision and restraint and warms it. Surfaces
are flat and quiet at rest; the conversation is the loudest thing on screen. A
single warm serif (Fraunces) signs the wordmark and the largest headings — the
butler's signature — while everything functional is set in Inter for clarity.
Density is generous, not cramped: spacious is a feature, the calm that lets a
small circle of people feel at home here.

It explicitly rejects the **cold enterprise dashboard** (no dispassionate
gray-on-white admin panels, no wall of identical stat cards) and **clutter** (no
visual noise; warmth is never an excuse to add elements). It is not a generic
AI-chatbot clone (sterile gray bubbles in a centered column) and not loud
consumer SaaS (no gradient heroes, no glassmorphism).

**Key Characteristics:**
- Layered canvas: a soft warm canvas with each shell region floating as a
  bright-white rounded surface. Warmth lives in olive + terracotta + type and the
  one-step tonal lift, never in a decorative tint.
- Flat by default — hairline borders; shadow only for the floating shell
  surfaces and as a response to state.
- One warm serif for signature moments; Inter for all working UI.
- Spacious, calm, conversation-first. The chrome recedes.

## 2. Colors

A soft warm canvas carries bright-white surfaces, with a desaturated, sun-cured olive primary and a single warm terracotta accent — restrained, the warmth carried by the brand colors and a quiet tonal layering rather than a decorative tint.

### Primary
- **Cured Olive** (`oklch(0.47 0.10 115)`): The brand's voice. Primary buttons, the user's own chat bubbles, active nav, focus rings, selection. Hover deepens to **Olive Shade** (`oklch(0.42 0.10 115)`). Always carries white text on its fill (Helmholtz-Kohlrausch: a saturated mid-tone needs white, never dark, text).

### Secondary
- **Burnt Terracotta** (`oklch(0.52 0.15 48)`): The warm-earth counterpoint olive groves are known for. Links, status pills, badges, the occasional accent rule. Hover deepens to `oklch(0.47 0.15 48)`. Distinct from primary in both hue (48° vs 115°) and feel; never used as a second primary.

### Neutral
- **Olive Ink** (`oklch(0.22 0.015 110)`): Body text and headings. A near-black warmed faintly toward olive, ~13:1 on white.
- **Muted Olive-Grey** (`oklch(0.48 0.012 110)`): Secondary text, captions, placeholders. Hits ≥4.5:1 on white — readable, not decorative-light.
- **Canvas** (`oklch(0.965 0.005 110)`): The shell background — the desk the surfaces sit on. One tonal step below white, same olive hue family, so bright-white surfaces lift cleanly off it. A structural layering device, not a warm wash; it stays out of the way.
- **Pure White** (`oklch(1.000 0 0)`): The shell surfaces and content background — the bright sheets on the desk. Literal #ffffff — no hidden warmth. Sidebar, content area, nav, and cards are all white surfaces floating on the Canvas.
- **Warm Panel** (`oklch(0.975 0.004 110)`): A subtle fill *inside* a surface — the assistant's chat bubbles, nested panels, hover washes, code blocks. A whisper off white, between Canvas and Pure White.
- **Hairline** (`oklch(0.92 0.004 110)`): Borders and dividers. The primary separator — borders carry most of the work; the canvas/surface tonal step and a faint shadow do the rest.

### Dark mode
The app ships a dark mode. Re-tune it warm and keep the layering: canvas `oklch(0.15 0.008 110)` (the darkest layer), surface/card `oklch(0.215 0.010 110)` (lifts above the canvas), ink `oklch(0.95 0.006 110)`, muted `oklch(0.68 0.010 110)`, border `oklch(1 0 0 / 0.1)`. Primary lifts to `oklch(0.56 0.11 115)`, accent to `oklch(0.64 0.14 50)`. Same study, lamps lit — the surfaces are *lighter* than the canvas here, the inverse of light mode.

### Named Rules
**The Quiet Olive Rule.** The primary olive covers ≤10% of any screen. Its restraint is the point — when everything is olive, nothing is. Warmth comes from the *presence* of olive and terracotta against white, not from drowning the page in tint.

**The Layered-Canvas Rule.** The shell background is the Canvas (one subtle tonal step off white in the olive hue family); content lives on bright-white surfaces floating atop it. The Canvas is a *structural* layering device — it must stay a near-neutral whisper, never drift into a cream, sand, or beige warm wash. Warmth comes from olive + terracotta + type, not from saturating the canvas. If the shell feels cold, fix it with the accent and the serif, never by warming the canvas. Surfaces themselves stay pure white.

## 3. Typography

**Display Font:** Fraunces (with Georgia, serif fallback)
**Body / UI Font:** Inter (with system-ui, sans-serif fallback)
**Mono Font:** JetBrains Mono (with ui-monospace fallback)

**Character:** A warm "Old Style" serif paired with a neutral humanist sans — contrast on the serif/sans axis, never two sans fighting. Fraunces brings the personal, hand-considered warmth of the butler; Inter keeps every label, message, and number unambiguous.

### Hierarchy
- **Display** (Fraunces, 500, `clamp(1.75rem, 1.2rem + 2.4vw, 2.75rem)`, 1.05): The `zico` wordmark and top-level page titles only. Use `text-wrap: balance`.
- **Headline** (Inter, 600, 1.5rem, 1.2): Section headings inside a page (e.g. "Dashboard").
- **Title** (Inter, 600, 1rem, 1.3): Card titles, panel headers, stat labels.
- **Body** (Inter, 400, 0.875rem, 1.6): Chat messages, descriptions, prose. Cap measure at 65–75ch; chat bubbles cap at ~80% column width.
- **Label** (Inter, 500, 0.75rem, +0.01em): Metadata, captions, helper text. Set in Muted Olive-Grey.
- **Mono** (JetBrains Mono, 400, 0.8125rem): Numeric metrics (tokens, latency), session IDs, code and tool output.

### Named Rules
**The One Serif Rule.** Fraunces appears only on the wordmark and the largest page title. It never sets a button, a label, body copy, or a UI control. Overused, the serif goes from signature to costume.

**The Honest Number Rule.** Every metric, latency, and ID is set in mono with tabular figures so values align and don't jitter as they update.

## 4. Elevation

This system is flat by default. Depth comes from tonal layering (Canvas → white surface → Warm Panel fill) and hairline borders, not from a shadow vocabulary. The one resting shadow that exists is the gentle lift of the shell surfaces off the Canvas; otherwise shadows are a response to state — a hovered or lifted element — never an ambient decoration sitting under every card.

### Shadow Vocabulary
- **Surface** (`box-shadow: 0 1px 2px oklch(0.22 0.015 110 / 0.04), 0 2px 6px oklch(0.22 0.015 110 / 0.05)`): The resting lift of a shell surface (sidebar, content, nav) off the Canvas. Soft and olive-tinted — it reads as the sheet lying on the desk, paired with the border and the tonal step, not as a heavy drop shadow.
- **Lift** (`box-shadow: 0 1px 2px oklch(0.22 0.015 110 / 0.06), 0 4px 12px oklch(0.22 0.015 110 / 0.08)`): Applied only on hover of an interactive card, or to a floating surface (dropdown, dialog, toast). Tinted with the olive ink, never pure black.

### Named Rules
**The Flat-By-Default Rule.** Content surfaces are flat at rest, separated by a 1px Hairline border. The only resting shadow is the **Surface** lift on the shell regions that float on the Canvas; everything else earns a shadow only as feedback to state (hover, focus, elevation above the page). A card *inside* a surface with a drop shadow at rest is wrong — give it a border instead.

## 5. Layout & Shell

The app shell is a layered composition, not edge-to-edge chrome. The `<body>` is
the Canvas; inside it, each region floats as its own white **shell surface**
(`rounded.lg` 16px, 1px Hairline border, the **Surface** resting shadow),
separated by a gutter.

- **Canvas gutter:** a consistent inset around and between surfaces — `8px`
  (`spacing.xs`) on mobile, `12px`–`16px` on desktop. The gutter *is* the
  separation; surfaces never touch each other or the viewport edge.
- **Desktop:** sidebar surface (≈240px) beside the content surface, side by side
  on the Canvas with the gutter between them.
- **Mobile/tablet:** content surface stacked above a floating bottom-nav surface,
  same gutter. The sidebar is hidden below the `lg` breakpoint.
- **Surfaces clip their content** (rounded corners + `overflow: hidden`); scroll
  lives in an inner container so the rounded frame stays intact.
- **Responsive behavior is structural** — regions collapse and restack at
  breakpoints; type does not fluidly scale.

### Named Rules
**The Floating-Surface Rule.** Every top-level region of the shell is a discrete
white surface on the Canvas — never a full-bleed bar welded to the viewport edge.
The gutter and the resting **Surface** shadow are what make the layering read.

## 6. Components

### Buttons
- **Shape:** Gently rounded (`8px`, `rounded.sm`). Padding `8px 16px`, Inter 500, 14px.
- **Primary:** Cured Olive fill, white text; hover deepens to Olive Shade. Used for the single most important action on a surface (Send).
- **Secondary:** Warm Panel fill, Olive Ink text; hover nudges one step darker. For supporting actions.
- **Ghost:** Transparent, Muted text; hover gets a faint Warm Panel wash. For low-emphasis/tertiary actions.
- **Focus:** 2px Cured Olive ring at 2px offset (`focus-visible` only). Never remove it.

### Cards / Containers
- **Corner Style:** `12px` (`rounded.md`) for cards *inside* a surface; shell surfaces themselves use `16px` (`rounded.lg`).
- **Background:** Cards sit on a white shell surface; nested fills use Warm Panel.
- **Shadow Strategy:** Flat at rest (see Elevation) — only shell surfaces carry the resting **Surface** lift. Cards get Lift on hover only.
- **Border:** 1px Hairline. This is the primary separator.
- **Internal Padding:** `20px` (`spacing.lg`).
- Never nest a card inside a card (the shell surface is not a card — a card on a surface is fine; a card on a card is not).

### Inputs / Fields
- **Style:** White fill, 1px Hairline border, `12px` radius, `12px 16px` padding, Inter 14px.
- **Placeholder:** Muted Olive-Grey (≥4.5:1) — never a faint light-gray.
- **Focus:** Border shifts to Cured Olive plus a 2px olive ring; no glow.
- **Disabled:** 50% opacity, no pointer events.

### Navigation
- **Style:** A floating shell surface, not a welded bar. **Desktop:** a left sidebar surface — `zico` wordmark in Fraunces at top, vertical links in Inter 14px, Eve presence pinned to the foot. **Mobile:** a bottom-nav surface with the same destinations as stacked icon+label tabs.
- **States:** Links are Muted at rest, Olive Ink + Warm Panel wash on hover, Cured Olive (with a faint olive tint fill) when active. No underlines until hover.
- Both nav surfaces follow the Floating-Surface Rule: rounded, bordered, lifted off the Canvas by the gutter.

### Chat Message (signature component)
The heart of the product. Two voices, clearly distinct, both calm:
- **Assistant:** Warm Panel surface, Olive Ink text, `16px` radius, left-aligned, capped at ~80% width. `whitespace-pre-wrap`. A streaming reply shows a gentle pulsing caret, never a spinner.
- **User:** Cured Olive fill, white text, `16px` radius, right-aligned, capped at ~80% width.
- **Empty state:** Centered, Muted, conversational ("Start a conversation with Eve.") — honest and warm, not a sterile placeholder.

## 7. Do's and Don'ts

### Do:
- **Do** keep the shell background on the Canvas (`oklch(0.965 0.005 110)`; in dark mode `oklch(0.15 0.008 110)`) and float bright-white surfaces on it. Let olive and terracotta carry the warmth, not the canvas tint.
- **Do** give every top-level shell region its own rounded, bordered, lifted surface separated by the gutter (The Floating-Surface Rule).
- **Do** use white text on every Cured Olive and Terracotta fill (buttons, user bubbles, badges).
- **Do** separate surfaces with 1px Hairline borders; reserve shadow for the shell surfaces' resting lift, hover, and floating elements (The Flat-By-Default Rule).
- **Do** keep Fraunces to the wordmark and the single largest title (The One Serif Rule); set everything else in Inter.
- **Do** set all metrics, IDs, and code in JetBrains Mono with tabular figures.
- **Do** keep placeholder and secondary text at Muted Olive-Grey (≥4.5:1), never a faint light-gray.
- **Do** honor `prefers-reduced-motion`: the streaming caret and any transition fall back to a crossfade or instant change.

### Don't:
- **Don't** build a **cold enterprise dashboard** — no wall of identical gray stat cards, no dispassionate gray-on-white density. Vary the layout; let real or honestly-empty data lead.
- **Don't** add **clutter** — warmth is never an excuse for more elements. Spacious and calm is the product.
- **Don't** ship the generic AI-chatbot look: a sterile centered column of gray bubbles. Keep the two voices distinct and warm.
- **Don't** let the Canvas drift into a cream/sand/beige warm wash, and don't tint the white surfaces — the Canvas stays a near-neutral whisper and warmth comes from brand + type (The Layered-Canvas Rule).
- **Don't** weld a shell region edge-to-edge to the viewport (full-bleed top bar, gutterless sidebar) — every region floats as its own surface (The Floating-Surface Rule).
- **Don't** use gradient text, `background-clip: text`, glassmorphism, or decorative blur.
- **Don't** put a colored `border-left`/`border-right` stripe on cards, messages, or callouts — use a full border or a tint.
- **Don't** let the olive exceed ~10% of a screen (The Quiet Olive Rule), and don't put dark text on a saturated olive or terracotta fill.

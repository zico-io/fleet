// Classifies a single line of Eve's NDJSON session stream. Pure so it can be
// tested without a live agent. The route buffers partial lines and feeds whole
// lines here. See eve docs: concepts/sessions-runs-and-streaming.

// Events that end a turn (or fail it). `message.completed` is NOT terminal — it
// fires once per assistant text block, including interim narration before a
// tool call.
const TERMINAL = new Set([
  "turn.completed",
  "session.waiting",
  "session.completed",
  "session.failed",
  "turn.failed",
]);

export function classifyEveLine(line: string): { delta: string; terminal: boolean } {
  const trimmed = line.trim();
  if (!trimmed) return { delta: "", terminal: false };

  let event: { type?: string; data?: { messageDelta?: string } };
  try {
    event = JSON.parse(trimmed);
  } catch {
    return { delta: "", terminal: false };
  }

  const delta =
    event.type === "message.appended" && typeof event.data?.messageDelta === "string"
      ? event.data.messageDelta
      : "";
  const terminal = typeof event.type === "string" && TERMINAL.has(event.type);
  return { delta, terminal };
}

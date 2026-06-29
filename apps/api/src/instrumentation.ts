import { BraintrustSpanProcessor } from "@braintrust/otel";
import { trace } from "@opentelemetry/api";
import { BasicTracerProvider } from "@opentelemetry/sdk-trace-base";

// Bun won't auto-instrument like Next; register a global provider that the
// @hono/otel middleware emits HTTP spans against. No NodeSDK auto-instrumentation
// (unreliable under Bun) — the middleware creates spans explicitly.
trace.setGlobalTracerProvider(
  new BasicTracerProvider({
    spanProcessors: [new BraintrustSpanProcessor({ parent: "project_name:zico-api" })],
  }),
);

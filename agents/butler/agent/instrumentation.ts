import { BraintrustExporter } from "@braintrust/otel";
import { defineInstrumentation } from "eve/instrumentation";
import { registerOTel } from "@vercel/otel";

// Presence of this file enables eve telemetry. eve auto-traces GenAI spans
// (model calls, tool calls, token usage) via the AI SDK; we just point the
// exporter at Braintrust. serviceName/parent come from the resolved agent name.
export default defineInstrumentation({
  setup: ({ agentName }) =>
    registerOTel({
      serviceName: agentName,
      traceExporter: new BraintrustExporter({
        parent: `project_name:${agentName}`,
        filterAISpans: true,
      }),
    }),
  recordInputs: true,
  recordOutputs: true,
});

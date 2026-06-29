import { BraintrustExporter } from "@braintrust/otel";
import { registerOTel } from "@vercel/otel";

// Next.js 15 loads this automatically and calls register() at startup.
export function register() {
  registerOTel({
    serviceName: "zico-web",
    traceExporter: new BraintrustExporter({
      parent: "project_name:zico-web",
      filterAISpans: false, // web has no AI spans — keep HTTP/fetch spans
    }),
  });
}

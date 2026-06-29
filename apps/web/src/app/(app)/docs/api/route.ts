import { ApiReference } from "@scalar/nextjs-api-reference";

// Interactive API reference (Scalar), ported from the retired apps/docs Astro
// site. Loads the spec from our own /openapi.json route and renders as its own
// full-screen document — the same standalone page it replaces.
export const GET = ApiReference({ url: "/openapi.json" });

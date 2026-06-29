// Re-serve the gateway's generated OpenAPI document from this origin so the
// Scalar reference (/docs/api) can fetch it same-origin (no CORS). The gateway
// (apps/api) is the source of truth — it generates the spec from its zod routes.
const API_URL = process.env.API_URL ?? "http://127.0.0.1:8787";

export const dynamic = "force-dynamic";

export async function GET() {
  const res = await fetch(`${API_URL}/openapi.json`);
  return new Response(res.body, {
    status: res.status,
    headers: { "content-type": "application/json" },
  });
}

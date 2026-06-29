# api gateway as a Cloudflare Worker (moved off Vercel).
#
# The script is the bundled output of `bun run --filter @zico/api build:worker`
# (wrangler → apps/api/dist/index.js). Build it before `tofu apply`; the sha256
# triggers a re-upload whenever the bundle changes.

locals {
  api_bundle = "${path.module}/../apps/api/dist/index.js"
}

resource "cloudflare_workers_script" "api" {
  account_id     = var.cloudflare_account_id
  script_name    = "zico-api"
  content_file   = local.api_bundle
  content_sha256 = filesha256(local.api_bundle)
  main_module    = "index.js"

  compatibility_date  = "2026-06-28"
  compatibility_flags = ["nodejs_compat"] # node built-ins + process.env population

  # App reads these via process.env.* (works under nodejs_compat).
  bindings = [
    { name = "AGENT_URL", type = "plain_text", text = local.agent_url },
    { name = "BRAINTRUST_API_KEY", type = "secret_text", text = var.braintrust_api_key },
  ]
}

# Custom domain (garf.dev is already in Cloudflare). This creates the DNS record
# + cert + route, so the Worker is reachable at https://api.garf.dev.
resource "cloudflare_workers_custom_domain" "api" {
  account_id = var.cloudflare_account_id
  hostname   = var.api_hostname
  service    = cloudflare_workers_script.api.script_name
  zone_name  = var.cloudflare_zone
}

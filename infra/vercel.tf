# Three Vercel projects for the monorepo. Each is git-connected, so a push to
# the production branch triggers a deploy — OpenTofu manages the project +
# settings + env, Vercel's git integration does the actual build/deploy.

locals {
  git = {
    type = "github"
    repo = var.github_repo
  }
  # api runs on Cloudflare Workers (see cloudflare.tf); web talks to it here.
  api_url   = coalesce(var.api_url, "https://${var.api_hostname}")
  agent_url = coalesce(var.agent_url, "https://${vercel_project.butler.name}.vercel.app")
}

# ─── apps/web (Next.js) ─────────────────────────────────────────────────────
resource "vercel_project" "web" {
  name           = "zico-web"
  framework      = "nextjs"
  root_directory = "apps/web"
  git_repository = local.git
}

resource "vercel_project_environment_variables" "web" {
  project_id = vercel_project.web.id
  variables = [
    { key = "API_URL", value = local.api_url, target = ["production", "preview"], sensitive = false },
    { key = "NEXT_PUBLIC_SUPABASE_URL", value = var.supabase_url, target = ["production", "preview"], sensitive = false },
    { key = "NEXT_PUBLIC_SUPABASE_ANON_KEY", value = var.supabase_anon_key, target = ["production", "preview"], sensitive = true },
    { key = "SUPABASE_SERVICE_ROLE_KEY", value = var.supabase_service_role_key, target = ["production", "preview"], sensitive = true },
    { key = "BRAINTRUST_API_KEY", value = var.braintrust_api_key, target = ["production", "preview"], sensitive = true },
  ]
}

# apps/api now runs on Cloudflare Workers — see cloudflare.tf.

# ─── agents/butler (eve agent) ──────────────────────────────────────────────
# ponytail: eve normally self-deploys via `eve deploy`. Managing it as a plain
# git-connected Vercel project assumes `eve build` runs as the build step —
# verify the build command in the dashboard after first deploy.
resource "vercel_project" "butler" {
  name           = "zico-butler"
  root_directory = "agents/butler"
  build_command  = "eve build"
  git_repository = local.git
}

resource "vercel_project_environment_variables" "butler" {
  project_id = vercel_project.butler.id
  variables = [
    { key = "AI_GATEWAY_API_KEY", value = var.ai_gateway_api_key, target = ["production", "preview"], sensitive = true },
    { key = "BRAINTRUST_API_KEY", value = var.braintrust_api_key, target = ["production", "preview"], sensitive = true },
    { key = "DISCORD_PUBLIC_KEY", value = var.discord_public_key, target = ["production", "preview"], sensitive = false },
    { key = "DISCORD_BOT_TOKEN", value = var.discord_bot_token, target = ["production", "preview"], sensitive = true },
    { key = "DISCORD_APPLICATION_ID", value = var.discord_application_id, target = ["production", "preview"], sensitive = false },
    { key = "DISCORD_DEPLOY_CHANNEL_ID", value = var.discord_deploy_channel_id, target = ["production", "preview"], sensitive = false },
  ]
}

output "web_url" { value = "https://${vercel_project.web.name}.vercel.app" }
output "api_url" { value = local.api_url }
output "agent_url" { value = local.agent_url }

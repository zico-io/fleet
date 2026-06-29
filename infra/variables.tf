# ─── Vercel ───────────────────────────────────────────────────────────────
variable "vercel_team" {
  description = "Vercel team slug/ID that owns the projects (null = personal account)"
  type        = string
  default     = null
}

variable "github_repo" {
  description = "GitHub repo connected to the projects, as owner/name"
  type        = string
}

# ─── Cloudflare (api Worker) ────────────────────────────────────────────────
variable "cloudflare_account_id" {
  description = "Cloudflare account ID (dashboard → Workers & Pages → Account ID)"
  type        = string
}

variable "cloudflare_zone" {
  description = "Cloudflare zone (root domain) the api Worker is served from"
  type        = string
  default     = "garf.dev"
}

variable "api_hostname" {
  description = "Public hostname for the api Worker (must be within cloudflare_zone)"
  type        = string
  default     = "api.garf.dev"
}

# ─── Supabase (existing project — imported, not created) ────────────────────
variable "supabase_org_id" {
  description = "Supabase organization slug (Org Settings → Organization slug)"
  type        = string
}

variable "supabase_project_ref" {
  description = "Ref of the existing Supabase project (the <ref> in dashboard URL)"
  type        = string
}

variable "supabase_db_password" {
  description = "Database password for the Supabase project"
  type        = string
  sensitive   = true
}

variable "supabase_region" {
  description = "Supabase project region, e.g. us-east-1"
  type        = string
}

# ─── App secrets pushed into the Vercel projects as env vars ────────────────
# Mirror of .env.example. Set via terraform.tfvars (gitignored) or TF_VAR_*.
variable "ai_gateway_api_key" {
  type      = string
  sensitive = true
}

variable "supabase_url" {
  description = "NEXT_PUBLIC_SUPABASE_URL — https://<ref>.supabase.co"
  type        = string
}

variable "supabase_anon_key" {
  type      = string
  sensitive = true
}

variable "supabase_service_role_key" {
  type      = string
  sensitive = true
}

variable "braintrust_api_key" {
  type      = string
  sensitive = true
}

variable "discord_public_key" {
  type    = string
  default = ""
}

variable "discord_bot_token" {
  type      = string
  sensitive = true
  default   = ""
}

variable "discord_application_id" {
  type    = string
  default = ""
}

variable "discord_deploy_channel_id" {
  type    = string
  default = ""
}

# Cross-service URLs. Default to each project's *.vercel.app domain; override if
# you attach custom domains.
variable "api_url" {
  description = "Public URL of the api gateway (web → api). Default: derived from project name."
  type        = string
  default     = null
}

variable "agent_url" {
  description = "Public URL of the butler agent (api → agent). Default: derived from project name."
  type        = string
  default     = null
}

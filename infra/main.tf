terraform {
  required_version = ">= 1.6"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 3.0"
    }
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

# Auth via env vars (don't put tokens in tfvars):
#   export VERCEL_API_TOKEN=...        https://vercel.com/account/tokens
#   export SUPABASE_ACCESS_TOKEN=...   https://supabase.com/dashboard/account/tokens
#   export CLOUDFLARE_API_TOKEN=...    https://dash.cloudflare.com/profile/api-tokens
provider "vercel" {
  team = var.vercel_team
}

provider "supabase" {}

provider "cloudflare" {}

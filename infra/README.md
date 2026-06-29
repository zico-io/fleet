# infra — OpenTofu

Manages, as code:
- **`zico-web`**, **`zico-butler`** — Vercel projects, git-connected. Deploys run
  via Vercel's git integration on push; OpenTofu owns settings + env vars.
- **`zico-api`** — a **Cloudflare Worker** (`cloudflare.tf`). OpenTofu uploads the
  bundled script directly, so `tofu apply` *is* the api deploy.
- the existing **Supabase** project (imported, not created).

## Use

```bash
# 1. Bundle the api Worker (OpenTofu uploads this file)
bun run --filter @zico/api build:worker   # → apps/api/dist/index.js

# 2. Apply
cd infra
cp terraform.tfvars.example terraform.tfvars   # fill it in

export VERCEL_API_TOKEN=...        # https://vercel.com/account/tokens
export SUPABASE_ACCESS_TOKEN=...   # https://supabase.com/dashboard/account/tokens
export CLOUDFLARE_API_TOKEN=...    # https://dash.cloudflare.com/profile/api-tokens

tofu init
tofu plan      # Supabase is imported, not created — expect no-op there
tofu apply
```

Re-run step 1 then `tofu apply` to ship api changes (the bundle's sha256 triggers
the re-upload). Push to the production branch for web/butler.

## Verify after first deploy

- **api (Worker)** — served at `https://api.garf.dev` (custom domain on the
  garf.dev zone). `process.env.*` reads work via `nodejs_compat`; confirm
  `AGENT_URL` resolves and hit `https://api.garf.dev/health`.
  OTel/Braintrust span flushing on Workers may need `ctx.waitUntil` — check spans
  actually land before relying on them.
- **butler** — build command is `eve build`; confirm output is picked up in Vercel.

## Notes

- Provider tokens come from env vars, never `terraform.tfvars`.
- `terraform.tfvars` and `*.tfstate` hold secrets and are gitignored.
- Supabase settings (auth/api) are intentionally not managed — see `supabase.tf`.

# The Supabase project already exists — import it into state instead of creating
# a new one. `tofu plan` will show no changes if the values below match reality.
import {
  to = supabase_project.this
  id = var.supabase_project_ref
}

resource "supabase_project" "this" {
  organization_id   = var.supabase_org_id
  name              = "zico"
  database_password = var.supabase_db_password
  region            = var.supabase_region

  # database_password is write-only on the API; ignore drift so plans stay clean.
  lifecycle {
    ignore_changes = [database_password]
  }
}

# ponytail: skipped supabase_settings (auth/api tuning) — managing it risks
# clobbering dashboard config you didn't intend to. Add it later if you want
# those under IaC: `tofu import supabase_settings.this <project_ref>`.

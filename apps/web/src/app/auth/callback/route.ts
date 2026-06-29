import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth redirect target. Exchanges the code for a session. If the user's email
// isn't on the allow-list, the signup trigger rolls back the insert and the
// exchange fails — send them back to /login with an explanation.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(origin);
  }

  return NextResponse.redirect(`${origin}/login?error=not-invited`);
}

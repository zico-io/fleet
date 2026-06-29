"use client";

import { Button } from "@zico/ui/button";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginButton() {
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setLoading(false); // otherwise the browser navigates away
  }

  return (
    <Button onClick={signIn} disabled={loading} className="w-full">
      {loading ? "Redirecting…" : "Continue with GitHub"}
    </Button>
  );
}

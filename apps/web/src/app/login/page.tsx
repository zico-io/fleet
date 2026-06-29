import { LoginButton } from "./login-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="grid h-dvh place-items-center p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <div className="grid size-12 place-items-center rounded-xl bg-primary font-serif text-xl font-semibold text-primary-foreground">
          z
        </div>
        <div className="space-y-1.5">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            Welcome to zico
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to talk to Eve. Access is invite-only.
          </p>
        </div>

        {error === "not-invited" && (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-foreground">
            That account isn't on the invite list. Ask the owner to add your GitHub email.
          </p>
        )}

        <LoginButton />
      </div>
    </div>
  );
}

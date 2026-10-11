"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, FormMessage } from "@/components/FormParts";
import type { AuthState } from "@/app/auth/actions";

const INITIAL: AuthState = { status: "idle" };

export default function AuthForm({
  mode,
  action,
  nextPath,
}: {
  mode: "signin" | "signup";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  nextPath?: string;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL);
  const isSignup = mode === "signup";
  const v = state.values ?? {};
  const e = state.errors ?? {};

  if (isSignup && state.status === "success") {
    return (
      <div className="card flex flex-col gap-4 p-6">
        <FormMessage status="success" message={state.message} />
        <p className="text-base text-muted">
          Keine E-Mail erhalten? Schauen Sie bitte im Spam-Ordner nach. Danach geht es hier weiter:
        </p>
        <Link href="/anmelden" className="btn-primary self-start">
          Zur Anmeldung
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="card flex flex-col gap-5 p-6 sm:p-7" noValidate>
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      {isSignup ? (
        <Field id="anzeigename" label="Anzeigename" hint="Optional – unter diesem Namen erscheinen Ihre Bewertungen (sonst „Stammtisch-Gast“).">
          <input id="anzeigename" name="anzeigename" className="input" maxLength={40} autoComplete="nickname" defaultValue={v.anzeigename ?? ""} />
        </Field>
      ) : null}

      <Field id="email" label="E-Mail" required error={e.email}>
        <input id="email" name="email" type="email" className="input" maxLength={120} autoComplete="email" required defaultValue={v.email ?? ""} aria-invalid={Boolean(e.email)} aria-describedby={e.email ? "email-error" : undefined} />
      </Field>

      <Field
        id="password"
        label="Passwort"
        hint={isSignup ? "Mindestens 8 Zeichen." : undefined}
        error={e.password}
      >
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          minLength={8}
          maxLength={72}
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
          aria-invalid={Boolean(e.password)}
          aria-describedby={e.password ? "password-error" : undefined}
        />
      </Field>

      <FormMessage status={state.status} message={state.status === "error" ? state.message : undefined} />

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Einen Moment …" : isSignup ? "Konto erstellen" : "Anmelden"}
      </button>

      <p className="text-sm text-muted">
        {isSignup ? (
          <>
            Schon ein Konto?{" "}
            <Link href="/anmelden" className="font-semibold text-accent">
              Hier anmelden
            </Link>
          </>
        ) : (
          <>
            Noch kein Konto?{" "}
            <Link href="/registrieren" className="font-semibold text-accent">
              Jetzt registrieren
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

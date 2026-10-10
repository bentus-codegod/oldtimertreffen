"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={formAction} className="card flex max-w-md flex-col gap-4 p-6">
      <div>
        <label htmlFor="passwort" className="label">
          Passwort
        </label>
        <input id="passwort" name="passwort" type="password" autoComplete="current-password" className="input" required />
        {state.error ? (
          <p role="alert" className="error-text">
            {state.error}
          </p>
        ) : null}
      </div>
      <button type="submit" className="btn-primary self-start" disabled={pending}>
        {pending ? "Prüfe …" : "Anmelden"}
      </button>
    </form>
  );
}

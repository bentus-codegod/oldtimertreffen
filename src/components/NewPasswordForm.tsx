"use client";

import { useActionState } from "react";
import { updatePasswordAction, type AuthState } from "@/app/auth/actions";
import { Field, FormMessage } from "@/components/FormParts";

const INITIAL: AuthState = { status: "idle" };

export default function NewPasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, INITIAL);

  return (
    <form action={action} className="card flex flex-col gap-5 p-6 sm:p-7" noValidate>
      <Field id="password" label="Neues Passwort" hint="Mindestens 8 Zeichen." required>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          required
        />
      </Field>
      <FormMessage status={state.status} message={state.status === "error" ? state.message : undefined} />
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Einen Moment …" : "Passwort speichern"}
      </button>
    </form>
  );
}

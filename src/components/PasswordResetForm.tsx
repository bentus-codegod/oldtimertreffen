"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type AuthState } from "@/app/auth/actions";
import { Field, FormMessage } from "@/components/FormParts";

const INITIAL: AuthState = { status: "idle" };

export default function PasswordResetForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, INITIAL);
  const v = state.values ?? {};

  if (state.status === "success") {
    return (
      <div className="card p-6">
        <FormMessage status="success" message={state.message} />
      </div>
    );
  }

  return (
    <form action={action} className="card flex flex-col gap-5 p-6 sm:p-7" noValidate>
      <Field id="email" label="E-Mail" required>
        <input id="email" name="email" type="email" className="input" maxLength={120} autoComplete="email" required defaultValue={v.email ?? ""} />
      </Field>
      <FormMessage status={state.status} message={state.status === "error" ? state.message : undefined} />
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Einen Moment …" : "Link zum Zurücksetzen senden"}
      </button>
    </form>
  );
}

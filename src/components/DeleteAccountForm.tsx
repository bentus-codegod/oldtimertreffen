"use client";

import { useActionState } from "react";
import { deleteAccountAction, type AuthState } from "@/app/auth/actions";
import { FormMessage } from "@/components/FormParts";

const INITIAL: AuthState = { status: "idle" };

export default function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccountAction, INITIAL);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex cursor-pointer items-start gap-3 text-base">
        <input type="checkbox" name="bestaetigung" className="mt-1 size-5 shrink-0 accent-[var(--accent)]" />
        <span>Ja, mein Konto und alle meine Erfahrungsberichte endgültig löschen. Das lässt sich nicht rückgängig machen.</span>
      </label>
      <FormMessage status={state.status} message={state.status === "error" ? state.message : undefined} />
      <button
        type="submit"
        className="btn-outline self-start border-warn text-warn hover:border-warn hover:bg-warn/10 hover:text-warn"
        disabled={pending}
      >
        {pending ? "Wird gelöscht …" : "Konto endgültig löschen"}
      </button>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitWorkshopAction, type FormState } from "@/app/actions";
import { CheckGroup, Field, FormMessage, Honeypot, arr, str } from "@/components/FormParts";
import { GEWERKE, MARKEN } from "@/lib/types";

const INITIAL: FormState = { status: "idle" };

export default function WorkshopForm() {
  const [state, formAction, pending] = useActionState(submitWorkshopAction, INITIAL);
  const v = state.values ?? {};
  const e = state.errors ?? {};

  if (state.status === "success") {
    return (
      <div className="card flex flex-col gap-4 p-6">
        <FormMessage status="success" message={state.message} />
        <p className="text-base text-muted">
          Du kannst gleich noch eine weitere Werkstatt eintragen – oder zurück zur Übersicht.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/eintragen" className="btn-outline">
            Weitere Werkstatt eintragen
          </Link>
          <Link href="/werkstaetten" className="btn-primary">
            Zur Übersicht
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="card relative flex flex-col gap-6 p-5 sm:p-7" noValidate>
      <Honeypot />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field id="name" label="Name der Werkstatt" required error={e.name}>
            <input id="name" name="name" className="input" maxLength={120} autoComplete="organization" defaultValue={str(v.name)} aria-invalid={Boolean(e.name)} aria-describedby={e.name ? "name-error" : undefined} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field id="strasse" label="Straße und Hausnummer" required error={e.strasse}>
            <input id="strasse" name="strasse" className="input" maxLength={120} autoComplete="street-address" defaultValue={str(v.strasse)} aria-invalid={Boolean(e.strasse)} aria-describedby={e.strasse ? "strasse-error" : undefined} />
          </Field>
        </div>
        <Field id="plz" label="Postleitzahl" required error={e.plz}>
          <input id="plz" name="plz" className="input" inputMode="numeric" maxLength={5} autoComplete="postal-code" defaultValue={str(v.plz)} aria-invalid={Boolean(e.plz)} aria-describedby={e.plz ? "plz-error" : undefined} />
        </Field>
        <Field id="ort" label="Ort" required error={e.ort}>
          <input id="ort" name="ort" className="input" maxLength={80} autoComplete="address-level2" defaultValue={str(v.ort) || "Hamburg"} aria-invalid={Boolean(e.ort)} aria-describedby={e.ort ? "ort-error" : undefined} />
        </Field>
        <Field id="telefon" label="Telefon" hint="Optional – wird öffentlich angezeigt." error={e.telefon}>
          <input id="telefon" name="telefon" type="tel" className="input" maxLength={30} autoComplete="tel" defaultValue={str(v.telefon)} aria-invalid={Boolean(e.telefon)} aria-describedby={e.telefon ? "telefon-error" : undefined} />
        </Field>
        <Field id="website" label="Internetseite" hint="Optional, z. B. meine-werkstatt.de" error={e.website}>
          <input id="website" name="website" className="input" maxLength={120} autoComplete="url" defaultValue={str(v.website)} aria-invalid={Boolean(e.website)} aria-describedby={e.website ? "website-error" : undefined} />
        </Field>
      </div>

      <CheckGroup legend="Welche Marken kennt die Werkstatt?" name="marken" options={MARKEN} selected={arr(v.marken)} error={e.marken} hint="„Alle Marken“ nur wählen, wenn wirklich breit aufgestellt." />
      <CheckGroup legend="Was macht die Werkstatt?" name="gewerke" options={GEWERKE} selected={arr(v.gewerke)} error={e.gewerke} />

      <Field id="hinweis" label="Besonderheiten" hint="Optional – z. B. Spezialgebiet, Modelle, Öffnungszeiten (max. 500 Zeichen)." error={e.hinweis}>
        <textarea id="hinweis" name="hinweis" rows={4} maxLength={500} className="input min-h-28" defaultValue={str(v.hinweis)} aria-invalid={Boolean(e.hinweis)} aria-describedby={e.hinweis ? "hinweis-error" : undefined} />
      </Field>

      <div>
        <label className="flex min-h-12 cursor-pointer items-start gap-3 text-base">
          <input type="checkbox" name="bestaetigung" defaultChecked={v.bestaetigung === "on"} className="mt-1 size-5 shrink-0 accent-[var(--accent)]" />
          <span>
            Die Angaben stimmen nach meinem besten Wissen. Ich bin einverstanden, dass sie nach
            Prüfung öffentlich angezeigt werden.
          </span>
        </label>
        {e.bestaetigung ? (
          <p role="alert" className="error-text">
            {e.bestaetigung}
          </p>
        ) : null}
      </div>

      <FormMessage status={state.status} message={state.message} />

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Wird gesendet …" : "Zur Prüfung einreichen"}
        </button>
        <p className="text-sm text-muted">Dein Eintrag erscheint erst nach unserer Freigabe.</p>
      </div>
    </form>
  );
}

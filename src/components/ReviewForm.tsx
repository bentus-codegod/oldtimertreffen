"use client";

import { useActionState } from "react";
import { submitReviewAction, type FormState } from "@/app/actions";
import { Field, FormMessage, Honeypot, str } from "@/components/FormParts";
import { FAHRZEUG_MARKEN, KOSTEN } from "@/lib/types";

const INITIAL: FormState = { status: "idle" };

function Segmented({
  legend,
  name,
  options,
  selected,
  error,
  required,
}: {
  legend: string;
  name: string;
  options: readonly { value: string; label: string }[];
  selected: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <fieldset>
      <legend className="label">
        {legend}
        {required ? (
          <span className="text-warn" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.value} className="cursor-pointer">
            <input type="radio" name={name} value={o.value} defaultChecked={selected === o.value} className="peer sr-only" />
            <span className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-md border border-border bg-surface px-4 text-base font-semibold peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-fg peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
              {o.label}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p role="alert" className="error-text">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

const STAR_OPTIONS = [
  { value: "1", label: "★ 1" },
  { value: "2", label: "★ 2" },
  { value: "3", label: "★ 3" },
  { value: "4", label: "★ 4" },
  { value: "5", label: "★ 5" },
] as const;

export default function ReviewForm({ workshopId, workshopName }: { workshopId: string; workshopName: string }) {
  const [state, formAction, pending] = useActionState(submitReviewAction, INITIAL);
  const v = state.values ?? {};
  const e = state.errors ?? {};

  if (state.status === "success") {
    return (
      <div className="card p-6">
        <FormMessage status="success" message={state.message} />
      </div>
    );
  }

  return (
    <form action={formAction} className="card relative flex flex-col gap-6 p-5 sm:p-7" noValidate>
      <Honeypot />
      <input type="hidden" name="workshop_id" value={workshopId} />

      <p className="text-base text-muted">
        Du warst mit deinem Klassiker bei <strong className="text-fg">{workshopName}</strong>? Erzähl
        den anderen, was los war und wie es gelaufen ist – genau solche Berichte helfen am meisten.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="fahrzeug_marke" label="Fahrzeugmarke" required error={e.fahrzeug_marke}>
          <input id="fahrzeug_marke" name="fahrzeug_marke" list="fahrzeug-marken" className="input" maxLength={40} defaultValue={str(v.fahrzeug_marke)} aria-invalid={Boolean(e.fahrzeug_marke)} aria-describedby={e.fahrzeug_marke ? "fahrzeug_marke-error" : undefined} />
          <datalist id="fahrzeug-marken">
            {FAHRZEUG_MARKEN.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </Field>
        <Field id="fahrzeug_modell" label="Modell" required hint="z. B. W123 280 E, 911 Carrera 3.2, E-Type S1" error={e.fahrzeug_modell}>
          <input id="fahrzeug_modell" name="fahrzeug_modell" className="input" maxLength={60} defaultValue={str(v.fahrzeug_modell)} aria-invalid={Boolean(e.fahrzeug_modell)} aria-describedby={e.fahrzeug_modell ? "fahrzeug_modell-error" : undefined} />
        </Field>
        <Field id="baujahr" label="Baujahr" hint="Optional" error={e.baujahr}>
          <input id="baujahr" name="baujahr" className="input" inputMode="numeric" maxLength={4} defaultValue={str(v.baujahr)} aria-invalid={Boolean(e.baujahr)} aria-describedby={e.baujahr ? "baujahr-error" : undefined} />
        </Field>
        <Field id="autor_name" label="Dein Name" hint="Optional – Vorname oder Spitzname reicht." error={e.autor_name}>
          <input id="autor_name" name="autor_name" className="input" maxLength={40} autoComplete="given-name" defaultValue={str(v.autor_name)} aria-invalid={Boolean(e.autor_name)} aria-describedby={e.autor_name ? "autor_name-error" : undefined} />
        </Field>
      </div>

      <Field id="problem_beschreibung" label="Welches Problem hattest du?" required hint="Symptome so konkret wie möglich – z. B. „springt kalt schlecht an, Leerlauf schwankt“." error={e.problem_beschreibung}>
        <textarea id="problem_beschreibung" name="problem_beschreibung" rows={4} maxLength={1500} className="input min-h-28" defaultValue={str(v.problem_beschreibung)} aria-invalid={Boolean(e.problem_beschreibung)} aria-describedby={e.problem_beschreibung ? "problem_beschreibung-error" : undefined} />
      </Field>

      <Field id="loesung" label="Was hat die Werkstatt gemacht?" hint="Optional – Diagnose und Lösung, soweit bekannt." error={e.loesung}>
        <textarea id="loesung" name="loesung" rows={3} maxLength={1500} className="input min-h-24" defaultValue={str(v.loesung)} aria-invalid={Boolean(e.loesung)} aria-describedby={e.loesung ? "loesung-error" : undefined} />
      </Field>

      <Field id="erfahrung" label="Wie war es insgesamt?" required hint="Ehrlich und sachlich: Beratung, Termintreue, Ergebnis, Umgang miteinander." error={e.erfahrung}>
        <textarea id="erfahrung" name="erfahrung" rows={4} maxLength={1500} className="input min-h-28" defaultValue={str(v.erfahrung)} aria-invalid={Boolean(e.erfahrung)} aria-describedby={e.erfahrung ? "erfahrung-error" : undefined} />
      </Field>

      <Segmented legend="Deine Bewertung" name="bewertung" options={STAR_OPTIONS} selected={str(v.bewertung)} error={e.bewertung} required />
      <Segmented legend="Die Kosten waren …" name="kosten_einordnung" options={KOSTEN} selected={str(v.kosten_einordnung)} error={e.kosten_einordnung} />
      <Segmented
        legend="Würdest du die Werkstatt weiterempfehlen?"
        name="wuerde_empfehlen"
        options={[
          { value: "ja", label: "Ja" },
          { value: "nein", label: "Nein" },
        ]}
        selected={str(v.wuerde_empfehlen)}
        error={e.wuerde_empfehlen}
        required
      />

      <div>
        <label className="flex min-h-12 cursor-pointer items-start gap-3 text-base">
          <input type="checkbox" name="bestaetigung" defaultChecked={v.bestaetigung === "on"} className="mt-1 size-5 shrink-0 accent-[var(--accent)]" />
          <span>
            Ich war selbst Kunde dieser Werkstatt und schildere meine eigene Erfahrung. Ich
            bin einverstanden, dass der Bericht nach Prüfung öffentlich angezeigt wird.
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
          {pending ? "Wird gesendet …" : "Bericht einreichen"}
        </button>
        <p className="text-sm text-muted">Erscheint erst nach unserer Prüfung.</p>
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useActionState } from "react";
import { submitWorkshopAction, type FormState } from "@/app/actions";
import { CheckGroup, Field, FormMessage, Honeypot, arr, str } from "@/components/FormParts";
import Reveal from "@/components/Reveal";
import { GEWERKE, MARKEN } from "@/lib/types";

const INITIAL: FormState = { status: "idle" };

type Role = "" | "betreiber" | "kunde";

const ROLE_CHOICES = [
  {
    value: "betreiber" as const,
    icon: "🔧",
    title: "Ich bin Werkstattbetreiber",
    text: "Meine eigene Werkstatt fehlt im Register und soll aufgenommen werden.",
  },
  {
    value: "kunde" as const,
    icon: "🚗",
    title: "Ich bin Kundin / Kunde",
    text: "Ich kenne eine gute Werkstatt, die hier noch fehlt, und möchte sie empfehlen.",
  },
];

export default function WorkshopForm() {
  const [state, formAction, pending] = useActionState(submitWorkshopAction, INITIAL);
  const [role, setRole] = useState<Role>((state.values?.rolle as Role) ?? "");
  const v = state.values ?? {};
  const e = state.errors ?? {};

  if (state.status === "success") {
    return (
      <div className="card flex flex-col gap-4 p-6">
        <FormMessage status="success" message={state.message} />
        <p className="text-base text-muted">
          Sie können gleich noch eine weitere Werkstatt eintragen – oder zurück zur Übersicht.
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

  // Schritt 1: erst die Rolle wählen (bestimmt Ansprache und Formulartexte).
  if (role === "") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-base text-muted">Zunächst: In welcher Rolle tragen Sie die Werkstatt ein?</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {ROLE_CHOICES.map((choice, i) => (
            <Reveal key={choice.value} delay={i * 80}>
              <button
                type="button"
                onClick={() => setRole(choice.value)}
                className="card group flex h-full w-full flex-col items-start gap-2 p-6 text-left transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out)] hover:-translate-y-1 hover:border-accent hover:shadow-[var(--shadow-md)]"
              >
                <span aria-hidden="true" className="text-4xl">
                  {choice.icon}
                </span>
                <span className="font-display text-xl font-bold leading-tight group-hover:text-accent">
                  {choice.title}
                </span>
                <span className="text-base text-muted">{choice.text}</span>
                <span aria-hidden="true" className="mt-auto pt-2 font-semibold text-accent">
                  Weiter →
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    );
  }

  const isOp = role === "betreiber";
  const copy = {
    nameLabel: isOp ? "Name Ihrer Werkstatt" : "Name der Werkstatt",
    markenLegend: isOp
      ? "Um welche Marken kümmert sich Ihre Werkstatt?"
      : "Um welche Marken kümmert sich die Werkstatt?",
    gewerkeLegend: isOp ? "Welche Probleme löst Ihre Werkstatt?" : "Welche Probleme löst die Werkstatt?",
    besondHint: isOp
      ? "Optional – z. B. Spezialgebiet, Modelle, Öffnungszeiten (max. 500 Zeichen)."
      : "Optional – was Sie über die Werkstatt wissen, z. B. Spezialgebiet oder Modelle (max. 500 Zeichen).",
    confirm: isOp
      ? "Die Angaben stimmen nach bestem Wissen. Ich bin damit einverstanden, dass sie nach Prüfung öffentlich angezeigt werden."
      : "Die Angaben stimmen nach meinem besten Wissen. Ich bin damit einverstanden, dass sie nach Prüfung öffentlich angezeigt werden.",
  };

  return (
    <Reveal as="div">
      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
        <span className="chip border-accent/30 bg-accent/10 text-accent">
          {isOp ? "Werkstattbetreiber" : "Kundin / Kunde"}
        </span>
        <button
          type="button"
          onClick={() => setRole("")}
          className="font-semibold text-muted underline-offset-4 hover:text-accent hover:underline"
        >
          Rolle ändern
        </button>
      </div>

      <form action={formAction} className="card relative flex flex-col gap-6 p-5 sm:p-7" noValidate>
        <Honeypot />
        <input type="hidden" name="rolle" value={role} />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id="name" label={copy.nameLabel} required error={e.name}>
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

        <div className="flex flex-col gap-3">
          <CheckGroup legend={copy.markenLegend} name="marken" options={MARKEN} selected={arr(v.marken)} error={e.marken} hint="„Alle Marken“ nur wählen, wenn wirklich breit aufgestellt." />
          <Field
            id="marken_sonstige"
            label="Weitere Marke(n) / Sonstiges"
            hint="Falls eine Marke oben fehlt – hier eintragen, mehrere mit Komma trennen (z. B. „Lancia, Saab“)."
            error={e.marken_sonstige}
          >
            <input id="marken_sonstige" name="marken_sonstige" className="input" maxLength={120} placeholder="z. B. Lancia, Saab, Rover" defaultValue={str(v.marken_sonstige)} aria-invalid={Boolean(e.marken_sonstige)} aria-describedby={e.marken_sonstige ? "marken_sonstige-error" : undefined} />
          </Field>
        </div>

        <CheckGroup legend={copy.gewerkeLegend} name="gewerke" options={GEWERKE} selected={arr(v.gewerke)} error={e.gewerke} />

        <Field id="hinweis" label="Besonderheiten" hint={copy.besondHint} error={e.hinweis}>
          <textarea id="hinweis" name="hinweis" rows={4} maxLength={500} className="input min-h-28" defaultValue={str(v.hinweis)} aria-invalid={Boolean(e.hinweis)} aria-describedby={e.hinweis ? "hinweis-error" : undefined} />
        </Field>

        <div>
          <label className="flex min-h-12 cursor-pointer items-start gap-3 text-base">
            <input type="checkbox" name="bestaetigung" defaultChecked={v.bestaetigung === "on"} className="mt-1 size-5 shrink-0 accent-[var(--accent)]" />
            <span>{copy.confirm}</span>
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
          <p className="text-sm text-muted">Ihr Eintrag erscheint erst nach unserer Freigabe.</p>
        </div>
      </form>
    </Reveal>
  );
}

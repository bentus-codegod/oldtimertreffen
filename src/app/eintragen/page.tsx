import type { Metadata } from "next";
import WorkshopForm from "@/components/WorkshopForm";

export const metadata: Metadata = {
  title: "Werkstatt eintragen",
  description:
    "Kennst du eine gute Oldtimer-Werkstatt – oder betreibst du selbst eine? Hier eintragen. Jeder Eintrag wird vor der Veröffentlichung geprüft.",
  alternates: { canonical: "/eintragen" },
};

const STEPS = [
  { title: "Du trägst ein", text: "Name, Adresse, Marken und Leistungen – dauert drei Minuten." },
  { title: "Wir prüfen", text: "Gibt es den Betrieb, stimmen Adresse und Kontakt? Wir schauen nach, bevor etwas online geht." },
  { title: "Veröffentlicht", text: "Nach der Freigabe erscheint die Werkstatt in der Liste und kann Erfahrungsberichte sammeln." },
] as const;

export default function EintragenPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-3xl">
        <p className="kicker text-accent">Mitmachen</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide sm:text-5xl">
          Werkstatt eintragen
        </h1>
        <p className="mt-3 text-lg text-muted">
          Fehlt eine Werkstatt, die sich mit Klassikern auskennt? Trag sie hier ein – egal ob es
          deine eigene ist oder die, die du seit Jahren empfiehlst.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
        <WorkshopForm />

        <aside className="card p-6" aria-labelledby="ablauf-h">
          <h2 id="ablauf-h" className="font-display text-2xl font-bold uppercase tracking-wide">
            So läuft’s
          </h2>
          <ol className="mt-4 flex flex-col gap-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span aria-hidden="true" className="font-display text-3xl font-bold leading-none text-accent">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-base font-bold">{step.title}</h3>
                  <p className="text-base text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}

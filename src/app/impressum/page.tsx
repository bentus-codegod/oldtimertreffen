import type { Metadata } from "next";
import { legalDetailsComplete, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Impressum",
  robots: { index: false },
  alternates: { canonical: "/impressum" },
};

export default function ImpressumPage() {
  const complete = legalDetailsComplete();
  const lines = SITE.legalAddress.split("|").map((l) => l.trim()).filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-bold uppercase tracking-wide">Impressum</h1>

      {!complete ? (
        <p role="alert" className="mt-6 rounded-md border border-warn/40 bg-warn/10 px-4 py-3 text-base font-medium text-warn">
          Angaben fehlen noch: Vor dem Live-Gang bitte die Umgebungsvariablen
          NEXT_PUBLIC_LEGAL_NAME, NEXT_PUBLIC_LEGAL_ADDRESS und NEXT_PUBLIC_CONTACT_EMAIL setzen.
          Ein Impressum mit echten Angaben ist für diese Seite in Deutschland Pflicht.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-6 text-base leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-bold">Angaben gemäß § 5 DDG</h2>
            <p className="mt-2">
              {SITE.legalName}
              {lines.map((line) => (
                <span key={line}>
                  <br />
                  {line}
                </span>
              ))}
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-bold">Kontakt</h2>
            <p className="mt-2">
              E-Mail: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-bold">Inhalte von Nutzern</h2>
            <p className="mt-2">
              Erfahrungsberichte und Werkstatteinträge stammen von Nutzern und geben deren Meinung
              und Wissen wieder. Sie werden vor der Veröffentlichung gesichtet, aber nicht auf jede
              Einzelangabe hin überprüft. Wenn du einen Fehler oder einen rechtsverletzenden Inhalt
              entdeckst, schreib uns bitte – wir prüfen den Hinweis zeitnah.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

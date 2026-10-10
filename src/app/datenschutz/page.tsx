import type { Metadata } from "next";
import { legalDetailsComplete, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Datenschutz",
  robots: { index: false },
  alternates: { canonical: "/datenschutz" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <div className="mt-2 flex flex-col gap-3">{children}</div>
    </section>
  );
}

export default function DatenschutzPage() {
  const complete = legalDetailsComplete();
  const lines = SITE.legalAddress.split("|").map((l) => l.trim()).filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-bold uppercase tracking-wide">Datenschutz</h1>

      {!complete ? (
        <p role="alert" className="mt-6 rounded-md border border-warn/40 bg-warn/10 px-4 py-3 text-base font-medium text-warn">
          Angaben fehlen noch: Verantwortliche Stelle bitte über NEXT_PUBLIC_LEGAL_NAME,
          NEXT_PUBLIC_LEGAL_ADDRESS und NEXT_PUBLIC_CONTACT_EMAIL hinterlegen.
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-7 text-base leading-relaxed">
        <Section title="Verantwortliche Stelle">
          <p>
            {complete ? (
              <>
                {SITE.legalName}
                {lines.map((line) => (
                  <span key={line}>
                    <br />
                    {line}
                  </span>
                ))}
                <br />
                E-Mail: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
              </>
            ) : (
              "wird ergänzt"
            )}
          </p>
        </Section>

        <Section title="Besuch der Seite">
          <p>
            Beim Aufruf der Seite verarbeitet unser Hosting-Anbieter (Vercel Inc., USA)
            technisch notwendige Verbindungsdaten wie IP-Adresse, Zeitpunkt und aufgerufene Seite in
            Server-Logfiles, um die Seite auszuliefern und abzusichern. Rechtsgrundlage ist unser
            berechtigtes Interesse an einem sicheren und stabilen Betrieb (Art. 6 Abs. 1 lit. f
            DSGVO).
          </p>
          <p>
            Wir setzen keine Analyse- oder Werbe-Tracker ein und binden keine externen Schriftarten
            oder Karten ein. Für Besucher werden keine Cookies gespeichert.
          </p>
        </Section>

        <Section title="Werkstatt eintragen und Erfahrungsbericht schreiben">
          <p>
            Wenn du eine Werkstatt einträgst oder einen Erfahrungsbericht abschickst, speichern wir
            deine Angaben (bei Werkstätten: Name, Adresse, Kontaktdaten, Marken und Leistungen; bei
            Berichten: Fahrzeug, Schilderung, Bewertung und – freiwillig – einen Namen oder
            Spitznamen) in unserer Datenbank bei Supabase. Rechtsgrundlage ist deine Einwilligung
            durch Absenden des Formulars (Art. 6 Abs. 1 lit. a DSGVO).
          </p>
          <p>
            Alle Einsendungen sind zunächst nicht öffentlich und werden von uns geprüft. Erst nach
            der Freigabe erscheinen sie auf der Seite. Bitte gib in Berichten keine
            personenbezogenen Daten Dritter an, etwa Kennzeichen oder Namen von Mitarbeitern.
          </p>
          <p>
            Du kannst jederzeit verlangen, dass dein Eintrag oder Bericht geändert oder gelöscht wird
            – schreib uns dazu eine E-Mail.
          </p>
        </Section>

        <Section title="Deine Rechte">
          <p>
            Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
            Datenübertragbarkeit und Widerspruch sowie das Recht, dich bei einer
            Datenschutz-Aufsichtsbehörde zu beschweren. Zuständig ist in Hamburg der Hamburgische
            Beauftragte für Datenschutz und Informationsfreiheit.
          </p>
        </Section>
      </div>
    </div>
  );
}

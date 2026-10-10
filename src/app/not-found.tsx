import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-6">
      <p className="kicker text-accent">Fehler 404</p>
      <h1 className="mt-2 font-display text-5xl font-bold uppercase tracking-wide">
        Die Seite ist in der Werkstatt
      </h1>
      <p className="mt-4 text-lg text-muted">
        Diese Adresse gibt es nicht (mehr). Vielleicht hilft die Übersicht weiter.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/werkstaetten" className="btn-primary">
          Alle Werkstätten
        </Link>
        <Link href="/" className="btn-outline">
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Suspense } from "react";
import ReviewCard from "@/components/ReviewCard";
import { getReviews, getWorkshops } from "@/lib/data";
import { availableMarken, countByMarke } from "@/lib/filters";
import { SITE } from "@/lib/site";

const ROADMAP = [
  { title: "Ausfahrten & Treffen", text: "Stammtische, Teilemärkte und Ausfahrten in der Region – zum Mitfahren und Dazukommen." },
  { title: "Rallyes", text: "Termine und Berichte von Oldtimer-Rallyes im Norden, von der Tagestour bis zum Wochenende." },
  { title: "Stellplätze", text: "Trockene Tiefgaragenplätze, Hallen und Winterlager für den Klassiker – anbieten und finden." },
  { title: "Kaufen & Verkaufen", text: "Ein Marktplatz unter Leuten, die wissen, was sie da vor sich haben." },
] as const;

const STEPS = [
  { n: "1", title: "Werkstatt finden", text: "Nach Marke, Leistung und Gebiet filtern – oder einfach dein Problem eintippen." },
  { n: "2", title: "Erfahrungen lesen", text: "Berichte von Leuten, die ihren Klassiker wirklich dort hingebracht haben: Problem, Lösung, Kosten." },
  { n: "3", title: "Selbst beitragen", text: "Kennst du eine gute Werkstatt? Trag sie ein. Warst du dort? Schreib einen Bericht. Alles wird vor der Veröffentlichung von Hand geprüft." },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="bg-rail text-rail-fg">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="kicker text-accent">Oldtimer-Werkstätten · {SITE.region} &amp; Umland</p>
          <h1 className="mt-3 max-w-3xl text-balance font-display text-4xl font-bold uppercase leading-[1.02] tracking-wide sm:text-6xl lg:text-7xl [overflow-wrap:anywhere]">
            {SITE.tagline}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-xl leading-relaxed text-rail-muted">
            Welche Werkstatt kennt sich mit deinem Klassiker aus? Hier findest du sie – und liest, wie
            es anderen Besitzern dort ergangen ist.
          </p>

          <Suspense fallback={<div className="mt-8 h-28" />}>
            <HeroSearch />
          </Suspense>

          <Suspense fallback={null}>
            <Stats />
          </Suspense>
        </div>
      </section>

      <Suspense fallback={null}>
        <MarkenTiles />
      </Suspense>

      <Suspense fallback={null}>
        <LatestReviews />
      </Suspense>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-3xl font-bold uppercase tracking-wide">So funktioniert’s</h2>
        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="card flex gap-4 p-5">
              <span aria-hidden="true" className="font-display text-5xl font-bold leading-none text-accent">
                {step.n}
              </span>
              <div>
                <h3 className="font-display text-xl font-bold">{step.title}</h3>
                <p className="mt-1 text-base text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-surface-2">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <p className="kicker text-muted">In Planung</p>
          <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide">
            Bald am Stammtisch
          </h2>
          <p className="mt-2 max-w-2xl text-base text-muted">
            Die Werkstattsuche ist der Anfang. Daraus soll der Treffpunkt für alles rund um den
            Oldtimer werden – Schritt für Schritt, mit Rückmeldung von euch.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROADMAP.map((item) => (
              <li key={item.title} className="rounded-lg border border-dashed border-border bg-surface p-5">
                <h3 className="font-display text-xl font-bold">{item.title}</h3>
                <p className="mt-1 text-base text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="card flex flex-col items-start gap-5 p-7 sm:p-9 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide">Du kennst eine gute Werkstatt?</h2>
            <p className="mt-2 text-base text-muted">
              Fehlt jemand in der Liste? Trag die Werkstatt ein – nach kurzer Prüfung erscheint sie
              hier. Oder du bist selbst Werkstattbetreiber: dann gehört dein Betrieb erst recht hierher.
            </p>
          </div>
          <Link href="/eintragen" className="btn-primary shrink-0">
            Werkstatt eintragen
          </Link>
        </div>
      </section>
    </>
  );
}

async function HeroSearch() {
  const { workshops } = await getWorkshops();
  const marken = availableMarken(workshops);
  return (
    <form action="/werkstaetten" role="search" className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-[1fr_16rem_auto]">
      <div>
        <label htmlFor="hero-suche" className="sr-only">
          Suche
        </label>
        <input
          id="hero-suche"
          name="suche"
          type="search"
          placeholder="Name, Ort oder Problem …"
          className="input border-transparent"
          autoComplete="off"
        />
      </div>
      <div>
        <label htmlFor="hero-marke" className="sr-only">
          Marke
        </label>
        <select id="hero-marke" name="marke" className="input border-transparent" defaultValue="">
          <option value="">Alle Marken</option>
          {marken.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-primary">
        Werkstatt finden
      </button>
    </form>
  );
}

async function Stats() {
  const [{ workshops }, reviews] = await Promise.all([getWorkshops(), getReviews()]);
  const stats = [
    { value: workshops.length, label: "Werkstätten" },
    { value: countByMarke(workshops), label: "Marken" },
    { value: reviews.length, label: reviews.length === 1 ? "Erfahrungsbericht" : "Erfahrungsberichte" },
  ];
  return (
    <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-rail-fg/20 pt-6">
      {stats.map((s) => (
        <div key={s.label}>
          <dt className="text-sm uppercase tracking-widest text-rail-muted">{s.label}</dt>
          <dd className="font-display text-4xl font-bold tabular-nums">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

async function MarkenTiles() {
  const { workshops } = await getWorkshops();
  const marken = availableMarken(workshops).filter((m) => m !== "Alle Marken");
  if (marken.length === 0) return null;
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-12 sm:px-6" aria-labelledby="marken-h">
      <h2 id="marken-h" className="font-display text-3xl font-bold uppercase tracking-wide">
        Nach Marke suchen
      </h2>
      <ul className="mt-5 flex flex-wrap gap-3">
        {marken.map((marke) => (
          <li key={marke}>
            <Link
              href={`/werkstaetten?marke=${encodeURIComponent(marke)}`}
              className="btn-outline min-h-12 text-lg"
            >
              {marke}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/werkstaetten" className="btn-primary min-h-12 text-lg">
            Alle Werkstätten →
          </Link>
        </li>
      </ul>
    </section>
  );
}

async function LatestReviews() {
  const [{ workshops }, reviews] = await Promise.all([getWorkshops(), getReviews()]);
  const byId = new Map(workshops.map((w) => [w.id, w]));
  const latest = reviews.filter((r) => byId.has(r.workshop_id)).slice(0, 3);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-12 sm:px-6" aria-labelledby="berichte-h">
      <h2 id="berichte-h" className="font-display text-3xl font-bold uppercase tracking-wide">
        Frisch vom Stammtisch
      </h2>
      {latest.length > 0 ? (
        <ul className="mt-5 grid gap-5 lg:grid-cols-3">
          {latest.map((review) => {
            const w = byId.get(review.workshop_id);
            return (
              <li key={review.id} className="flex">
                <div className="flex w-full">
                  <ReviewCard review={review} workshop={w ? { name: w.name, slug: w.slug } : undefined} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="card mt-5 p-6">
          <p className="max-w-2xl text-lg">
            Hier erscheinen die neuesten Erfahrungsberichte. Noch ist es ruhig am Tisch – sei der
            Erste und erzähl, wie es bei deiner Werkstatt gelaufen ist.
          </p>
          <Link href="/werkstaetten" className="btn-primary mt-4">
            Werkstatt wählen &amp; Bericht schreiben
          </Link>
        </div>
      )}
    </section>
  );
}

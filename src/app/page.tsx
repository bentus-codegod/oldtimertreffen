import Link from "next/link";
import { Suspense } from "react";
import Reveal from "@/components/Reveal";
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
  { n: "1", title: "Werkstatt finden", text: "Nach Marke, Leistung und Gebiet filtern – oder einfach Ihr Problem eintippen." },
  { n: "2", title: "Erfahrungen lesen", text: "Berichte von Leuten, die ihren Klassiker wirklich dort hingebracht haben: Problem, Lösung, Kosten." },
  { n: "3", title: "Selbst beitragen", text: "Kennen Sie eine gute Werkstatt? Tragen Sie sie ein. Waren Sie dort? Schreiben Sie einen Bericht. Alles wird vor der Veröffentlichung von Hand geprüft." },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-rail text-rail-fg">
        {/* ruhiger Lichtschein hinter der Überschrift */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-40 h-[32rem] w-[32rem] rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--accent) 34%, transparent), transparent)" }}
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <Reveal>
            <p className="kicker text-accent">Oldtimer-Werkstätten · {SITE.region} &amp; Umland</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-3 max-w-3xl text-balance font-display text-5xl font-bold uppercase leading-[0.98] tracking-wide sm:text-6xl lg:text-7xl [overflow-wrap:anywhere]">
              {SITE.tagline}
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-5 max-w-2xl text-pretty text-xl leading-relaxed text-rail-muted">
              Welche Werkstatt kennt sich mit Ihrem Klassiker aus? Hier finden Sie sie – und lesen,
              wie es anderen Besitzern dort ergangen ist.
            </p>
          </Reveal>

          <Reveal delay={230}>
            <Suspense fallback={<div className="mt-8 h-32" />}>
              <HeroSearch />
            </Suspense>
          </Reveal>

          <Reveal delay={320}>
            <Suspense fallback={null}>
              <Stats />
            </Suspense>
          </Reveal>
        </div>
      </section>

      <Suspense fallback={null}>
        <MarkenTiles />
      </Suspense>

      <Suspense fallback={null}>
        <LatestReviews />
      </Suspense>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <Reveal>
          <h2 className="font-display text-3xl font-bold uppercase tracking-wide sm:text-4xl">So funktioniert’s</h2>
        </Reveal>
        <ol className="mt-7 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.n} delay={i * 90} className="card flex gap-4 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
              <span aria-hidden="true" className="font-display text-5xl font-bold leading-none text-accent">
                {step.n}
              </span>
              <div>
                <h3 className="font-display text-xl font-bold">{step.title}</h3>
                <p className="mt-1 text-base text-muted">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-surface-2/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <Reveal>
            <p className="kicker text-muted">In Planung</p>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide sm:text-4xl">
              Bald am Stammtisch
            </h2>
            <p className="mt-2 max-w-2xl text-base text-muted">
              Die Werkstattsuche ist der Anfang. Daraus soll der Treffpunkt für alles rund um den
              Oldtimer werden – Schritt für Schritt, mit Rückmeldung von Ihnen.
            </p>
          </Reveal>
          <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROADMAP.map((item, i) => (
              <Reveal as="li" key={item.title} delay={i * 80} className="rounded-2xl border border-dashed border-border-strong bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60">
                <h3 className="font-display text-xl font-bold">{item.title}</h3>
                <p className="mt-1 text-base text-muted">{item.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <div className="card flex flex-col items-start gap-5 p-7 sm:p-9 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-bold uppercase tracking-wide sm:text-4xl">Sie kennen eine gute Werkstatt?</h2>
              <p className="mt-2 text-base text-muted">
                Fehlt jemand in der Liste? Tragen Sie die Werkstatt ein – nach kurzer Prüfung erscheint
                sie hier. Oder Sie betreiben selbst eine Werkstatt: dann gehört Ihr Betrieb erst recht
                hierher.
              </p>
            </div>
            <Link href="/eintragen" className="btn-primary shrink-0">
              Werkstatt eintragen
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

async function HeroSearch() {
  const { workshops } = await getWorkshops();
  const marken = availableMarken(workshops);
  return (
    <form
      action="/werkstaetten"
      role="search"
      className="mt-8 grid max-w-4xl gap-3 rounded-2xl sm:grid-cols-[1fr_15rem_auto]"
    >
      <div>
        <label htmlFor="hero-suche" className="sr-only">
          Suche
        </label>
        <input
          id="hero-suche"
          name="suche"
          type="search"
          placeholder="Name, Ort oder Problem …"
          className="input h-14 border-transparent text-lg shadow-[var(--shadow-sm)]"
          autoComplete="off"
        />
      </div>
      <div>
        <label htmlFor="hero-marke" className="sr-only">
          Marke
        </label>
        <select
          id="hero-marke"
          name="marke"
          className="select h-14 border-transparent text-lg shadow-[var(--shadow-sm)]"
          defaultValue=""
        >
          <option value="">Alle Marken</option>
          {marken.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-primary h-14 text-lg">
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
    <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-4 border-t border-rail-fg/20 pt-6">
      {stats.map((s) => (
        <div key={s.label}>
          <dt className="text-sm uppercase tracking-widest text-rail-muted">{s.label}</dt>
          <dd className="font-display text-4xl font-bold tabular-nums sm:text-5xl">{s.value}</dd>
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
    <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6" aria-labelledby="marken-h">
      <Reveal>
        <h2 id="marken-h" className="font-display text-3xl font-bold uppercase tracking-wide sm:text-4xl">
          Nach Marke suchen
        </h2>
      </Reveal>
      <ul className="mt-6 flex flex-wrap gap-3">
        {marken.map((marke, i) => (
          <Reveal as="li" key={marke} delay={i * 45}>
            <Link
              href={`/werkstaetten?marke=${encodeURIComponent(marke)}`}
              className="btn-outline min-h-12 text-lg"
            >
              {marke}
            </Link>
          </Reveal>
        ))}
        <Reveal as="li" delay={marken.length * 45}>
          <Link href="/werkstaetten" className="btn-primary min-h-12 text-lg">
            Alle Werkstätten →
          </Link>
        </Reveal>
      </ul>
    </section>
  );
}

async function LatestReviews() {
  const [{ workshops }, reviews] = await Promise.all([getWorkshops(), getReviews()]);
  const byId = new Map(workshops.map((w) => [w.id, w]));
  const latest = reviews.filter((r) => byId.has(r.workshop_id)).slice(0, 3);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6" aria-labelledby="berichte-h">
      <Reveal>
        <h2 id="berichte-h" className="font-display text-3xl font-bold uppercase tracking-wide sm:text-4xl">
          Frisch vom Stammtisch
        </h2>
      </Reveal>
      {latest.length > 0 ? (
        <ul className="mt-6 grid gap-5 lg:grid-cols-3">
          {latest.map((review, i) => {
            const w = byId.get(review.workshop_id);
            return (
              <Reveal as="li" key={review.id} delay={i * 90} className="flex">
                <div className="flex w-full">
                  <ReviewCard review={review} workshop={w ? { name: w.name, slug: w.slug } : undefined} />
                </div>
              </Reveal>
            );
          })}
        </ul>
      ) : (
        <Reveal>
          <div className="card mt-6 p-6">
            <p className="max-w-2xl text-lg">
              Hier erscheinen die neuesten Erfahrungsberichte. Noch ist es ruhig am Tisch – seien Sie
              der Erste und erzählen Sie, wie es bei Ihrer Werkstatt gelaufen ist.
            </p>
            <Link href="/werkstaetten" className="btn-primary mt-4">
              Werkstatt wählen &amp; Bericht schreiben
            </Link>
          </div>
        </Reveal>
      )}
    </section>
  );
}

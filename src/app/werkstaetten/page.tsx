import type { Metadata } from "next";
import { Suspense } from "react";
import Reveal from "@/components/Reveal";
import WorkshopDirectory from "@/components/WorkshopDirectory";
import { getReviews, getWorkshops } from "@/lib/data";
import { EMPTY_SUMMARY, groupByWorkshop, reviewSearchText, summarize, type ReviewSummary } from "@/lib/reviews";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Alle Oldtimer-Werkstätten",
  description: `Alle Oldtimer-Werkstätten in ${SITE.region} und Umland – filterbar nach Marke, Leistung und Gebiet, mit Erfahrungsberichten.`,
  alternates: { canonical: "/werkstaetten" },
};

export default function WerkstaettenPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <Reveal as="header" className="mb-8 max-w-3xl">
        <p className="kicker text-accent">Verzeichnis</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide sm:text-5xl">
          Oldtimer-Werkstätten
        </h1>
        <p className="mt-3 text-lg text-muted">
          Alle geprüften Betriebe in {SITE.region} und Umland. Tipp: Geben Sie in der Suche einfach
          Ihr Problem oder Modell ein – wir durchsuchen auch die Erfahrungsberichte.
        </p>
      </Reveal>

      <Suspense fallback={<DirectorySkeleton />}>
        <Directory />
      </Suspense>
    </div>
  );
}

async function Directory() {
  const [{ workshops, source }, reviews] = await Promise.all([getWorkshops(), getReviews()]);

  const grouped = groupByWorkshop(reviews);
  const summaries: Record<string, ReviewSummary> = {};
  const extraText: Record<string, string> = {};
  for (const w of workshops) {
    const list = grouped.get(w.id) ?? [];
    summaries[w.id] = list.length > 0 ? summarize(list) : EMPTY_SUMMARY;
    if (list.length > 0) extraText[w.id] = reviewSearchText(list);
  }

  return (
    <>
      {source === "seed" ? (
        <p className="mb-6 rounded-xl border border-border bg-surface-2 px-4 py-3 text-base text-muted">
          Vorschau-Modus: Es werden die vorab recherchierten Werkstätten gezeigt. Neue Einträge und
          Erfahrungsberichte sind erst möglich, sobald die Datenbank verbunden ist.
        </p>
      ) : null}
      <WorkshopDirectory workshops={workshops} summaries={summaries} extraText={extraText} />
    </>
  );
}

function DirectorySkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="h-56 animate-pulse rounded-2xl bg-surface-2" />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-52 animate-pulse rounded-2xl bg-surface-2" />
        ))}
      </div>
    </div>
  );
}

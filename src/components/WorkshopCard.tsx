import Link from "next/link";
import Stars from "@/components/Stars";
import type { ReviewSummary } from "@/lib/reviews";
import type { Workshop } from "@/lib/types";

const MAX_MARKEN = 4;

export default function WorkshopCard({
  workshop,
  summary,
}: {
  workshop: Workshop;
  summary?: ReviewSummary;
}) {
  const shownMarken = workshop.marken.slice(0, MAX_MARKEN);
  const moreMarken = workshop.marken.length - shownMarken.length;
  const hasReviews = Boolean(summary && summary.count > 0);

  return (
    <article className="card group relative flex flex-col gap-3 p-5 transition-shadow hover:shadow-md focus-within:shadow-md">
      <div>
        <h3 className="font-display text-2xl font-bold leading-tight">
          <Link
            href={`/werkstatt/${workshop.slug}`}
            className="text-fg no-underline after:absolute after:inset-0 after:content-[''] group-hover:text-accent"
          >
            {workshop.name}
          </Link>
        </h3>
        <p className="mt-1 text-base text-muted">
          {workshop.strasse} · {workshop.plz} {workshop.ort}
        </p>
      </div>

      <ul className="flex flex-wrap gap-2" aria-label="Marken">
        {shownMarken.map((m) => (
          <li key={m} className="chip">
            {m}
          </li>
        ))}
        {moreMarken > 0 ? <li className="chip">+{moreMarken}</li> : null}
      </ul>

      <p className="text-base">
        <span className="sr-only">Leistungen: </span>
        {workshop.gewerke.join(" · ")}
      </p>

      {workshop.hinweis ? (
        <p className="rounded-md bg-warn/10 px-3 py-2 text-sm text-warn">{workshop.hinweis}</p>
      ) : null}

      <p className="mt-auto flex items-center gap-2 pt-1 text-base">
        {hasReviews && summary ? (
          <>
            <Stars value={summary.average} />
            <span className="text-muted">
              {summary.average.toLocaleString("de-DE")} · {summary.count}{" "}
              {summary.count === 1 ? "Bericht" : "Berichte"}
            </span>
          </>
        ) : (
          <span className="text-muted">Noch keine Erfahrungsberichte</span>
        )}
      </p>
    </article>
  );
}

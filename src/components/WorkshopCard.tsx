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
    <article className="card group relative flex h-full w-full flex-col gap-3 p-5 transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out)] hover:-translate-y-1 hover:border-accent/50 hover:shadow-[var(--shadow-md)] focus-within:shadow-[var(--shadow-md)]">
      <div>
        <h3 className="font-display text-2xl font-bold leading-tight">
          <Link
            href={`/werkstatt/${workshop.slug}`}
            className="text-fg no-underline transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-accent"
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
        {moreMarken > 0 ? <li className="chip border-accent/30 bg-accent/10 text-accent">+{moreMarken}</li> : null}
      </ul>

      <p className="line-clamp-2 text-base text-fg/90">
        <span className="sr-only">Leistungen: </span>
        {workshop.gewerke.join(" · ")}
      </p>

      {workshop.hinweis ? (
        <p className="line-clamp-2 rounded-lg bg-warn/10 px-3 py-2 text-sm text-warn">{workshop.hinweis}</p>
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

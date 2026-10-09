import type { Workshop } from "@/lib/types";

function formatIndex(n: number): string {
  return String(n).padStart(2, "0");
}

export default function WorkshopCard({
  workshop,
  index,
}: {
  workshop: Workshop;
  index: number;
}) {
  const isNeu = workshop.status === "pending";

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-xs text-muted">{formatIndex(index)}</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide ${
            isNeu
              ? "bg-new/15 text-new"
              : "bg-ok/15 text-ok"
          }`}
        >
          {isNeu ? "Neu · ungeprüft" : "Recherchiert"}
        </span>
      </div>

      <h3 className="font-display text-lg font-medium leading-snug text-fg">
        {workshop.name}
      </h3>

      <p className="text-sm text-muted">
        {workshop.strasse}
        <br />
        {workshop.plz} {workshop.ort}
      </p>

      {(workshop.telefon || workshop.website) && (
        <p className="font-mono text-xs text-muted">
          {workshop.telefon && <span>{workshop.telefon}</span>}
          {workshop.telefon && workshop.website && <span> · </span>}
          {workshop.website && <span>{workshop.website}</span>}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {workshop.marken.map((m) => (
          <span
            key={m}
            className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-xs text-fg"
          >
            {m}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {workshop.gewerke.map((g) => (
          <span
            key={g}
            className="rounded-full bg-rail px-2 py-0.5 text-xs text-rail-fg"
          >
            {g}
          </span>
        ))}
      </div>

      {workshop.hinweis && (
        <p className="border-t border-border pt-2 text-xs text-muted italic">
          {workshop.hinweis}
        </p>
      )}
    </article>
  );
}

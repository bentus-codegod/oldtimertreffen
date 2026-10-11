import Link from "next/link";
import MeldenButton from "@/components/MeldenButton";
import Stars from "@/components/Stars";
import { KOSTEN, type Review } from "@/lib/types";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}

function Part({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return (
    <div>
      <h4 className="kicker text-muted">{title}</h4>
      <p className="mt-1 whitespace-pre-line text-base">{text}</p>
    </div>
  );
}

export default function ReviewCard({
  review,
  workshop,
  reportable = false,
}: {
  review: Review;
  /** Wenn gesetzt, wird der Werkstattname verlinkt (z. B. auf der Startseite). */
  workshop?: { name: string; slug: string };
  /** Zeigt den „Melden“-Link (auf der Werkstatt-Detailseite). */
  reportable?: boolean;
}) {
  const kosten = KOSTEN.find((k) => k.value === review.kosten_einordnung)?.label;
  const fahrzeug = [review.fahrzeug_marke, review.fahrzeug_modell].filter(Boolean).join(" ");

  return (
    <article className="card flex flex-col gap-4 p-5">
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div>
          <h3 className="font-display text-xl font-bold leading-tight">
            {fahrzeug}
            {review.baujahr ? <span className="font-sans text-base font-normal text-muted"> · Bj. {review.baujahr}</span> : null}
          </h3>
          {workshop ? (
            <p className="mt-0.5 text-base">
              bei{" "}
              <Link href={`/werkstatt/${workshop.slug}`} className="font-semibold">
                {workshop.name}
              </Link>
            </p>
          ) : null}
        </div>
        <Stars value={review.bewertung} className="text-xl" />
      </header>

      <Part title="Das Problem" text={review.problem_beschreibung} />
      <Part title="Was die Werkstatt gemacht hat" text={review.loesung} />
      <Part title="Wie es gelaufen ist" text={review.erfahrung} />

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 text-sm text-muted">
        <span className={review.wuerde_empfehlen ? "font-semibold text-ok" : "font-semibold text-warn"}>
          {review.wuerde_empfehlen ? "✓ Würde ich empfehlen" : "✗ Würde ich nicht empfehlen"}
        </span>
        {kosten ? <span>Kosten: {kosten}</span> : null}
        <span>
          {review.autor_name || "Ein Stammtisch-Gast"}
          {formatDate(review.created_at) ? ` · ${formatDate(review.created_at)}` : ""}
        </span>
        {reportable ? (
          <span className="ml-auto">
            <MeldenButton reviewId={review.id} />
          </span>
        ) : null}
      </footer>
    </article>
  );
}

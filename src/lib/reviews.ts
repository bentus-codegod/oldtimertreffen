import type { Review } from "@/lib/types";

export interface ReviewSummary {
  count: number;
  /** Durchschnitt 1–5, auf eine Nachkommastelle gerundet; 0 wenn keine Berichte. */
  average: number;
  /** Anteil der Berichte mit Empfehlung in Prozent (0–100). */
  recommendPercent: number;
}

export const EMPTY_SUMMARY: ReviewSummary = { count: 0, average: 0, recommendPercent: 0 };

export function summarize(reviews: Review[]): ReviewSummary {
  if (reviews.length === 0) return EMPTY_SUMMARY;
  const sum = reviews.reduce((acc, r) => acc + r.bewertung, 0);
  const recommended = reviews.filter((r) => r.wuerde_empfehlen).length;
  return {
    count: reviews.length,
    average: Math.round((sum / reviews.length) * 10) / 10,
    recommendPercent: Math.round((recommended / reviews.length) * 100),
  };
}

export function groupByWorkshop(reviews: Review[]): Map<string, Review[]> {
  const map = new Map<string, Review[]>();
  for (const review of reviews) {
    const list = map.get(review.workshop_id) ?? [];
    list.push(review);
    map.set(review.workshop_id, list);
  }
  return map;
}

/** Durchsuchbarer Text eines Berichts (Fahrzeug + Problem), für die Freitextsuche. */
export function reviewSearchText(reviews: Review[]): string {
  return reviews
    .map((r) =>
      [r.fahrzeug_marke, r.fahrzeug_modell, r.problem_beschreibung, r.loesung].join(" ")
    )
    .join(" ");
}

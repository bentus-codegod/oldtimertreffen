import type { Region, SortKey, Workshop, WorkshopFilter } from "@/lib/types";
import type { ReviewSummary } from "@/lib/reviews";

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("de");
}

/** "Hamburg (Tonndorf)" -> Hamburg, alles andere (Schenefeld, Norderstedt …) -> Umland. */
export function regionOf(workshop: Pick<Workshop, "ort">): Region {
  return normalize(workshop.ort).startsWith("hamburg") ? "Hamburg" : "Umland";
}

/**
 * Reine Filterfunktion für die Werkstattliste — bewusst ohne DOM/React-Bezug,
 * damit sie sich isoliert testen lässt (siehe filters.test.ts).
 *
 * `extraText` ordnet einer Werkstatt-id zusätzlichen Suchtext zu (z. B. die
 * Problem-Beschreibungen aus den Erfahrungsberichten), sodass eine Suche nach
 * "Vergaser W123" auch Werkstätten findet, die genau das schon gemacht haben.
 */
export function filterWorkshops(
  workshops: Workshop[],
  filter: WorkshopFilter,
  extraText: Record<string, string> = {}
): Workshop[] {
  const tokens = normalize(filter.suche).split(/\s+/).filter(Boolean);

  return workshops.filter((w) => {
    if (filter.marke && !w.marken.includes(filter.marke)) return false;
    if (filter.gewerk && !w.gewerke.includes(filter.gewerk)) return false;
    if (filter.region && regionOf(w) !== filter.region) return false;

    if (tokens.length > 0) {
      const haystack = normalize(
        [w.name, w.ort, w.plz, w.strasse, ...w.marken, ...w.gewerke, extraText[w.id] ?? ""].join(
          " "
        )
      );
      // Jedes Suchwort muss vorkommen (UND-Verknüpfung), Reihenfolge egal.
      if (!tokens.every((t) => haystack.includes(t))) return false;
    }

    return true;
  });
}

export function sortWorkshops(
  workshops: Workshop[],
  key: SortKey = "name",
  summaries: Record<string, ReviewSummary> = {}
): Workshop[] {
  const byName = (a: Workshop, b: Workshop) => a.name.localeCompare(b.name, "de");
  const list = [...workshops];
  if (key === "bewertung") {
    return list.sort(
      (a, b) =>
        (summaries[b.id]?.average ?? 0) - (summaries[a.id]?.average ?? 0) || byName(a, b)
    );
  }
  if (key === "berichte") {
    return list.sort(
      (a, b) => (summaries[b.id]?.count ?? 0) - (summaries[a.id]?.count ?? 0) || byName(a, b)
    );
  }
  return list.sort(byName);
}

/** Anzahl verschiedener konkreter Marken (ohne die Sammelbezeichnung "Alle Marken"). */
export function countByMarke(workshops: Workshop[]): number {
  const alleMarken = new Set<string>();
  workshops.forEach((w) =>
    w.marken.forEach((m) => {
      if (m !== "Alle Marken") alleMarken.add(m);
    })
  );
  return alleMarken.size;
}

/** Marken, die tatsächlich bei mindestens einer Werkstatt vorkommen, alphabetisch. */
export function availableMarken(workshops: Workshop[]): string[] {
  const set = new Set<string>();
  workshops.forEach((w) => w.marken.forEach((m) => set.add(m)));
  return [...set].sort((a, b) => {
    if (a === "Alle Marken") return 1;
    if (b === "Alle Marken") return -1;
    return a.localeCompare(b, "de");
  });
}

export function availableGewerke(workshops: Workshop[]): string[] {
  const set = new Set<string>();
  workshops.forEach((w) => w.gewerke.forEach((g) => set.add(g)));
  return [...set].sort((a, b) => a.localeCompare(b, "de"));
}

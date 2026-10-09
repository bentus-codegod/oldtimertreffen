import type { Workshop, WorkshopFilter } from "@/lib/types";

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("de");
}

/**
 * Reine Filterfunktion für die Werkstattliste — bewusst ohne DOM/React-Bezug,
 * damit sie sich isoliert testen lässt (siehe filters.test.ts).
 */
export function filterWorkshops(
  workshops: Workshop[],
  filter: WorkshopFilter
): Workshop[] {
  const suche = normalize(filter.suche);

  return workshops.filter((w) => {
    if (filter.marke && !w.marken.includes(filter.marke)) return false;
    if (filter.gewerk && !w.gewerke.includes(filter.gewerk)) return false;

    if (suche) {
      const haystack = normalize(
        [w.name, w.ort, w.plz, w.strasse, ...w.marken, ...w.gewerke].join(" ")
      );
      if (!haystack.includes(suche)) return false;
    }

    return true;
  });
}

export function sortWorkshops(workshops: Workshop[]): Workshop[] {
  return [...workshops].sort((a, b) =>
    (a.ort + a.name).localeCompare(b.ort + b.name, "de")
  );
}

export function countByMarke(workshops: Workshop[]): number {
  const alleMarken = new Set<string>();
  workshops.forEach((w) =>
    w.marken.forEach((m) => {
      if (m !== "Alle Marken") alleMarken.add(m);
    })
  );
  return alleMarken.size;
}

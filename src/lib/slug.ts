import type { Workshop, WorkshopRecord } from "@/lib/types";

/** "Mirbach & Seemann GmbH" -> "mirbach-seemann-gmbh" (deutsche Umlaute aufgelöst). */
export function slugify(input: string): string {
  return input
    .toLocaleLowerCase("de")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " und ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/**
 * Vergibt stabile, eindeutige Slugs. Bei Kollision wird die id angehängt,
 * sodass dieselbe Werkstatt immer dieselbe URL behält.
 */
export function withSlugs(records: WorkshopRecord[]): Workshop[] {
  const taken = new Set<string>();
  return records.map((record) => {
    const base = slugify(`${record.name} ${record.ort.replace(/\(.*\)/, "")}`) || "werkstatt";
    let slug = base;
    if (taken.has(slug)) slug = `${base}-${slugify(record.id).slice(0, 8)}`;
    taken.add(slug);
    return { ...record, slug };
  });
}

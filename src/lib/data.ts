import { cacheLife, cacheTag } from "next/cache";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { SEED_WORKSHOPS } from "@/data/seed-workshops";
import { withSlugs } from "@/lib/slug";
import type { Review, Workshop, WorkshopRecord } from "@/lib/types";

export type DataSource = "supabase" | "seed";

const WORKSHOP_COLUMNS =
  "id, name, strasse, plz, ort, telefon, website, marken, gewerke, hinweis, status";

const REVIEW_COLUMNS =
  "id, created_at, workshop_id, autor_name, fahrzeug_marke, fahrzeug_modell, baujahr, problem_beschreibung, loesung, erfahrung, bewertung, kosten_einordnung, wuerde_empfehlen, status";

/**
 * Alle veröffentlichten (geprüften) Werkstätten.
 * Fällt auf die statischen Seed-Daten zurück, wenn Supabase nicht konfiguriert
 * ist oder die Abfrage fehlschlägt – die Seite bleibt so immer benutzbar.
 * Ungeprüfte Einträge sind per RLS ohnehin nicht lesbar; der Filter auf
 * `verified` ist ein zweiter Sicherheitsgurt.
 */
export async function getWorkshops(): Promise<{ workshops: Workshop[]; source: DataSource }> {
  "use cache";
  cacheLife("minutes");
  cacheTag("workshops");

  const supabase = getSupabaseClient();
  if (!supabase) return { workshops: withSlugs(SEED_WORKSHOPS), source: "seed" };

  const { data, error } = await supabase
    .from("workshops")
    .select(WORKSHOP_COLUMNS)
    .eq("status", "verified")
    .order("name", { ascending: true });

  if (error || !data) {
    console.error("Supabase-Abfrage (workshops) fehlgeschlagen, nutze Seed-Daten:", error?.message);
    return { workshops: withSlugs(SEED_WORKSHOPS), source: "seed" };
  }

  return { workshops: withSlugs(data as WorkshopRecord[]), source: "supabase" };
}

/** Alle veröffentlichten Erfahrungsberichte, neueste zuerst. Ohne Datenbank: leer. */
export async function getReviews(): Promise<Review[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("reviews");

  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reparaturfaelle")
    .select(REVIEW_COLUMNS)
    .eq("status", "verified")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Supabase-Abfrage (reparaturfaelle) fehlgeschlagen:", error?.message);
    return [];
  }
  return data as Review[];
}

export async function getWorkshopBySlug(slug: string): Promise<Workshop | null> {
  const { workshops } = await getWorkshops();
  return workshops.find((w) => w.slug === slug) ?? null;
}

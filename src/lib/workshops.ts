import { getSupabaseClient } from "@/lib/supabaseClient";
import { SEED_WORKSHOPS } from "@/data/seed-workshops";
import type { NewWorkshopInput, Workshop } from "@/lib/types";

/**
 * Lädt alle Werkstätten (verified + pending) aus Supabase.
 * Fällt auf die statischen Seed-Daten zurück, wenn Supabase nicht
 * konfiguriert ist oder die Abfrage fehlschlägt — die Seite bleibt so
 * immer benutzbar, auch ohne Datenbank-Anbindung.
 */
export async function loadWorkshops(): Promise<{
  workshops: Workshop[];
  source: "supabase" | "seed";
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { workshops: SEED_WORKSHOPS, source: "seed" };
  }

  const { data, error } = await supabase
    .from("workshops")
    .select("id, name, strasse, plz, ort, telefon, website, marken, gewerke, hinweis, status")
    .order("ort", { ascending: true });

  if (error || !data) {
    console.error("Supabase-Abfrage fehlgeschlagen, nutze Seed-Daten:", error?.message);
    return { workshops: SEED_WORKSHOPS, source: "seed" };
  }

  return { workshops: data as Workshop[], source: "supabase" };
}

export type SubmitResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "invalid" | "rejected" | "unknown"; message: string };

/**
 * Reicht eine neue Werkstatt über das Selbsteintrag-Formular ein.
 * Landet dank der RLS-Policy (`workshops_public_insert_pending`) immer mit
 * status='pending' in der Datenbank, unabhängig davon was der Client schickt.
 */
export async function submitWorkshop(input: NewWorkshopInput): Promise<SubmitResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      ok: false,
      reason: "not_configured",
      message:
        "Noch keine Datenbank verbunden. Sobald Supabase eingerichtet ist, landen neue Einträge hier automatisch.",
    };
  }

  if (!input.name.trim() || !input.strasse.trim() || !input.plz.trim()) {
    return { ok: false, reason: "invalid", message: "Bitte Name, Straße und PLZ ausfüllen." };
  }

  const { error } = await supabase.from("workshops").insert({
    name: input.name.trim(),
    strasse: input.strasse.trim(),
    plz: input.plz.trim(),
    ort: input.ort.trim() || "Hamburg",
    telefon: input.telefon.trim(),
    website: input.website.trim(),
    marken: input.marken,
    gewerke: input.gewerke,
    hinweis: input.hinweis.trim(),
    status: "pending",
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("row-level security") || message.includes("permission")) {
      return {
        ok: false,
        reason: "rejected",
        message: "Der Eintrag wurde von der Datenbank abgelehnt (keine Schreibrechte).",
      };
    }
    return { ok: false, reason: "unknown", message: error.message };
  }

  return { ok: true };
}

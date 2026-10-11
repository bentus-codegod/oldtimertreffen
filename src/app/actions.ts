"use server";

import { updateTag } from "next/cache";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { isBot, validateReview, validateWorkshop, type FieldErrors } from "@/lib/validation";

export interface FormState {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: FieldErrors;
  /** Zuletzt eingegebene Werte – damit die Felder nach einem Fehler nicht leer zurückspringen. */
  values?: Record<string, string | string[]>;
}

const MULTI_VALUE_FIELDS = new Set(["marken", "gewerke"]);

function collectValues(form: FormData): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const key of new Set(form.keys())) {
    if (key.startsWith("$ACTION") || key === "firma_website") continue;
    const all = form.getAll(key).filter((v): v is string => typeof v === "string");
    out[key] = MULTI_VALUE_FIELDS.has(key) ? all : (all[0] ?? "");
  }
  return out;
}

const NOT_CONFIGURED: FormState = {
  status: "error",
  message:
    "Die Datenbank ist noch nicht verbunden – Einträge können im Moment nicht gespeichert werden.",
};

const GENERIC_ERROR: FormState = {
  status: "error",
  message: "Das hat leider nicht geklappt. Bitte versuch es in ein paar Minuten noch einmal.",
};

/**
 * Nimmt eine neue Werkstatt entgegen. Sie landet IMMER mit status='pending' in
 * der Datenbank (die RLS-Policy erzwingt das zusätzlich) und wird erst nach
 * manueller Prüfung öffentlich sichtbar.
 */
export async function submitWorkshopAction(_prev: FormState, formData: FormData): Promise<FormState> {
  // Bots bekommen scheinbar Erfolg, damit sie nicht nachjustieren – gespeichert wird nichts.
  if (isBot(formData)) return { status: "success", message: "Danke!" };

  const result = validateWorkshop(formData);
  if (!result.ok) {
    return {
      status: "error",
      message: "Bitte prüfe die markierten Felder.",
      errors: result.errors,
      values: collectValues(formData),
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) return { ...NOT_CONFIGURED, values: collectValues(formData) };

  const rolle = typeof formData.get("rolle") === "string" ? String(formData.get("rolle")) : "";
  const quelle = rolle === "betreiber" ? "betreiber" : rolle === "kunde" ? "empfehlung" : "selbsteintrag";

  const { error } = await supabase
    .from("workshops")
    .insert({ ...result.value, status: "pending", quelle });

  if (error) {
    console.error("Werkstatt-Einreichung fehlgeschlagen:", error.message);
    return { ...GENERIC_ERROR, values: collectValues(formData) };
  }
  return {
    status: "success",
    message:
      "Danke! Ihr Eintrag ist angekommen und wird jetzt von uns geprüft. Erst danach erscheint er auf der Seite.",
  };
}

/**
 * Nimmt einen Erfahrungsbericht entgegen. Nur für eingeloggte Nutzer; der
 * Bericht wird dem Konto zugeordnet (user_id) und automatisch veröffentlicht
 * (status='verified'). Missbrauch wird über den „Melden“-Button + Löschung
 * abgefangen (Notice-and-Takedown), nicht mehr über manuelle Vorab-Freigabe.
 */
export async function submitReviewAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (isBot(formData)) return { status: "success", message: "Danke!" };

  const user = await getCurrentUser();
  if (!user) {
    return {
      status: "error",
      message: "Bitte melden Sie sich an, um einen Erfahrungsbericht zu schreiben.",
      values: collectValues(formData),
    };
  }

  const result = validateReview(formData);
  if (!result.ok) {
    return {
      status: "error",
      message: "Bitte prüfen Sie die markierten Felder.",
      errors: result.errors,
      values: collectValues(formData),
    };
  }

  const supabase = await createServerSupabase();
  if (!supabase) return { ...NOT_CONFIGURED, values: collectValues(formData) };

  const { error } = await supabase
    .from("reparaturfaelle")
    .insert({ ...result.value, user_id: user.id, status: "verified" });

  if (error) {
    console.error("Bericht-Einreichung fehlgeschlagen:", error.message);
    return { ...GENERIC_ERROR, values: collectValues(formData) };
  }

  updateTag("reviews");
  return {
    status: "success",
    message: "Danke für Ihren Bericht! Er ist ab sofort veröffentlicht.",
  };
}

/** „Melden“: Eine Bewertung zur Prüfung melden (nur eingeloggt). */
export async function submitReportAction(
  reviewId: string,
  grund: string
): Promise<{ ok: boolean; message: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Bitte melden Sie sich an, um eine Bewertung zu melden." };
  if (!reviewId || reviewId.length > 64) return { ok: false, message: "Ungültige Meldung." };

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, message: "Melden ist gerade nicht möglich." };

  const { error } = await supabase
    .from("meldungen")
    .insert({ review_id: reviewId, melder_id: user.id, grund: grund.slice(0, 500) });

  if (error) {
    console.error("Meldung fehlgeschlagen:", error.message);
    return { ok: false, message: "Das hat nicht geklappt. Bitte später erneut versuchen." };
  }
  return { ok: true, message: "Danke – wir schauen uns die Bewertung an." };
}

"use server";

import { getSupabaseClient } from "@/lib/supabaseClient";
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

  const { error } = await supabase
    .from("workshops")
    .insert({ ...result.value, status: "pending", quelle: "selbsteintrag" });

  if (error) {
    console.error("Werkstatt-Einreichung fehlgeschlagen:", error.message);
    return { ...GENERIC_ERROR, values: collectValues(formData) };
  }
  return {
    status: "success",
    message:
      "Danke! Dein Eintrag ist angekommen und wird jetzt von uns geprüft. Erst danach erscheint er auf der Seite.",
  };
}

/** Nimmt einen Erfahrungsbericht entgegen (ebenfalls erst nach Prüfung sichtbar). */
export async function submitReviewAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (isBot(formData)) return { status: "success", message: "Danke!" };

  const result = validateReview(formData);
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

  const { error } = await supabase.from("reparaturfaelle").insert({ ...result.value, status: "pending" });

  if (error) {
    console.error("Bericht-Einreichung fehlgeschlagen:", error.message);
    return { ...GENERIC_ERROR, values: collectValues(formData) };
  }
  return {
    status: "success",
    message:
      "Danke für deinen Bericht! Wir lesen ihn kurz durch und schalten ihn dann frei – meist innerhalb weniger Tage.",
  };
}

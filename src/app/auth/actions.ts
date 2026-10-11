"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { getCurrentUser } from "@/lib/auth";
import { isDisposableEmail } from "@/lib/disposable-domains";
import { clean } from "@/lib/validation";

export interface AuthState {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: { email?: string; anzeigename?: string };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NOT_CONFIGURED: AuthState = {
  status: "error",
  message: "Die Anmeldung ist noch nicht eingerichtet. Bitte später erneut versuchen.",
};

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = clean(formData.get("email")).toLowerCase();
  const password = typeof formData.get("password") === "string" ? (formData.get("password") as string) : "";
  const anzeigename = clean(formData.get("anzeigename"));
  const values = { email, anzeigename };
  const errors: Record<string, string> = {};

  if (!EMAIL_RE.test(email)) errors.email = "Bitte eine gültige E-Mail-Adresse angeben.";
  else if (isDisposableEmail(email)) errors.email = "Bitte eine dauerhafte E-Mail-Adresse verwenden (keine Wegwerf-Adresse).";
  if (password.length < 8) errors.password = "Das Passwort muss mindestens 8 Zeichen lang sein.";
  if (password.length > 72) errors.password = "Das Passwort darf höchstens 72 Zeichen lang sein.";
  if (anzeigename.length > 40) errors.anzeigename = "Bitte höchstens 40 Zeichen.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Bitte prüfen Sie die markierten Felder.", errors, values };
  }

  const supabase = await createServerSupabase();
  if (!supabase) return { ...NOT_CONFIGURED, values };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await siteOrigin()}/auth/callback`,
      data: anzeigename ? { anzeigename } : undefined,
    },
  });

  if (error) {
    // Bereits registrierte, bestätigte Adresse o. Ä.
    return {
      status: "error",
      message:
        "Das hat nicht geklappt. Möglicherweise gibt es zu dieser E-Mail schon ein Konto – versuchen Sie es mit „Anmelden“.",
      values,
    };
  }

  // Bei aktivierter E-Mail-Bestätigung ist noch keine Session aktiv.
  const needsConfirm = !data.session;
  return {
    status: "success",
    message: needsConfirm
      ? "Fast geschafft! Wir haben Ihnen eine E-Mail geschickt. Bitte bestätigen Sie darin Ihre Adresse – danach können Sie sich anmelden."
      : "Konto erstellt. Sie sind jetzt angemeldet.",
    values,
  };
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = clean(formData.get("email")).toLowerCase();
  const password = typeof formData.get("password") === "string" ? (formData.get("password") as string) : "";
  const values = { email };

  if (!EMAIL_RE.test(email) || !password) {
    return { status: "error", message: "Bitte E-Mail und Passwort eingeben.", values };
  }

  const supabase = await createServerSupabase();
  if (!supabase) return { ...NOT_CONFIGURED, values };

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg =
      error.message.toLowerCase().includes("not confirmed") || error.message.toLowerCase().includes("confirm")
        ? "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse über den Link, den wir Ihnen geschickt haben."
        : "E-Mail oder Passwort stimmt nicht.";
    return { status: "error", message: msg, values };
  }

  // Nur lokale Pfade als Rücksprungziel zulassen (kein offener Redirect).
  const next = clean(formData.get("next"));
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  redirect(safeNext);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabase();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}

/** „Passwort vergessen": Reset-Link per E-Mail anfordern. */
export async function requestPasswordResetAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = clean(formData.get("email")).toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Bitte eine gültige E-Mail-Adresse angeben.", values: { email } };
  }

  const supabase = await createServerSupabase();
  // Immer dieselbe Erfolgsmeldung – verrät nicht, ob die Adresse existiert.
  if (supabase) {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${await siteOrigin()}/auth/callback?next=/passwort-neu`,
    });
  }
  return {
    status: "success",
    message:
      "Falls ein Konto zu dieser Adresse existiert, haben wir Ihnen einen Link zum Zurücksetzen geschickt. Bitte prüfen Sie Ihr Postfach (ggf. Spam).",
    values: { email },
  };
}

/** Neues Passwort setzen (nach Klick auf den Reset-Link, mit gültiger Session). */
export async function updatePasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = typeof formData.get("password") === "string" ? (formData.get("password") as string) : "";
  if (password.length < 8) return { status: "error", message: "Das Passwort muss mindestens 8 Zeichen lang sein." };
  if (password.length > 72) return { status: "error", message: "Das Passwort darf höchstens 72 Zeichen lang sein." };

  const supabase = await createServerSupabase();
  if (!supabase) return NOT_CONFIGURED;

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return {
      status: "error",
      message: "Der Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { status: "error", message: "Das hat nicht geklappt. Bitte versuchen Sie es erneut." };
  }

  redirect("/konto?pw=geaendert");
}

/** Konto und eigene Berichte endgültig löschen (DSGVO). */
export async function deleteAccountAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) redirect("/anmelden");

  if (formData.get("bestaetigung") !== "on") {
    return { status: "error", message: "Bitte bestätigen Sie, dass Sie das Konto wirklich löschen möchten." };
  }

  const admin = getAdminClient();
  if (!admin) {
    return { status: "error", message: "Löschen ist gerade nicht möglich. Bitte später erneut versuchen." };
  }

  // Erst die personenbezogenen Inhalte, dann das Konto (Profil hängt per Cascade dran).
  await admin.from("reparaturfaelle").delete().eq("user_id", user.id);
  await admin.from("meldungen").delete().eq("melder_id", user.id);
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("Konto-Löschung fehlgeschlagen:", error.message);
    return { status: "error", message: "Das hat nicht geklappt. Bitte später erneut versuchen." };
  }

  const supabase = await createServerSupabase();
  if (supabase) await supabase.auth.signOut();
  updateTag("reviews");
  redirect("/anmelden?geloescht=1");
}

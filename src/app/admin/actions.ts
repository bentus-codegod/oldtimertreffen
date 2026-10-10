"use server";

import { cookies } from "next/headers";
import { updateTag } from "next/cache";
import {
  ADMIN_COOKIE,
  checkPassword,
  createSessionToken,
  isAdmin,
  isAdminConfigured,
} from "@/lib/admin-auth";
import { getAdminClient } from "@/lib/supabaseAdmin";

export interface LoginState {
  error?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAdminConfigured()) return { error: "Der Prüfbereich ist noch nicht eingerichtet." };

  // Kleine Verzögerung bremst automatisiertes Passwort-Raten.
  await new Promise((resolve) => setTimeout(resolve, 600));

  const password = formData.get("passwort");
  if (typeof password !== "string" || !checkPassword(password)) {
    return { error: "Passwort stimmt nicht." };
  }

  const { token, maxAge } = createSessionToken();
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge,
  });
  return {};
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete({ name: ADMIN_COOKIE, path: "/admin" });
}

type Table = "workshops" | "reparaturfaelle";

/**
 * Jede Moderations-Aktion prüft die Admin-Sitzung selbst – Server Actions sind
 * per direktem POST erreichbar, nicht nur über die Oberfläche.
 */
async function moderate(table: Table, id: unknown, action: "approve" | "reject"): Promise<void> {
  if (!(await isAdmin())) throw new Error("Nicht angemeldet.");
  if (typeof id !== "string" || id.length === 0 || id.length > 64) throw new Error("Ungültige ID.");

  const admin = getAdminClient();
  if (!admin) throw new Error("Admin-Zugang nicht konfiguriert.");

  const query =
    action === "approve"
      ? admin.from(table).update({ status: "verified" }).eq("id", id).eq("status", "pending")
      : admin.from(table).delete().eq("id", id).eq("status", "pending");
  const { error } = await query;
  if (error) throw new Error(error.message);

  updateTag(table === "workshops" ? "workshops" : "reviews");
}

export async function approveWorkshop(formData: FormData) {
  await moderate("workshops", formData.get("id"), "approve");
}
export async function rejectWorkshop(formData: FormData) {
  await moderate("workshops", formData.get("id"), "reject");
}
export async function approveReview(formData: FormData) {
  await moderate("reparaturfaelle", formData.get("id"), "approve");
}
export async function rejectReview(formData: FormData) {
  await moderate("reparaturfaelle", formData.get("id"), "reject");
}

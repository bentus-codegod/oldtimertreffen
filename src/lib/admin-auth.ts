import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ots_admin";
const SESSION_HOURS = 12;

/** Der Prüfbereich ist nur aktiv, wenn alle nötigen Server-Variablen gesetzt sind. */
export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_SESSION_SECRET &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL
  );
}

function sign(payload: string): string {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "").update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(input, expected);
}

/** Token = "<ablaufzeit>.<hmac>"; läuft nach SESSION_HOURS ab. */
export function createSessionToken(now: number = Date.now()): { token: string; maxAge: number } {
  const expires = now + SESSION_HOURS * 3600 * 1000;
  const payload = String(expires);
  return { token: `${payload}.${sign(payload)}`, maxAge: SESSION_HOURS * 3600 };
}

export function verifySessionToken(token: string | undefined, now: number = Date.now()): boolean {
  if (!token || !process.env.ADMIN_SESSION_SECRET) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload))) return false;
  const expires = Number(payload);
  return Number.isFinite(expires) && expires > now;
}

export async function isAdmin(): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

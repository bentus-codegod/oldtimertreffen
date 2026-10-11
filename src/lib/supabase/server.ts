import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase-Client für Server-Code (Server Components, Server Actions, Route
 * Handler), der die Auth-Session über Cookies liest/schreibt. Gibt `null`
 * zurück, wenn die Umgebungsvariablen (noch) fehlen – so baut und läuft die App
 * auch ohne Supabase-Projekt weiter (dann eben ohne Login).
 */
export async function createServerSupabase(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // In reinen Server Components ist Schreiben nicht erlaubt – das fängt die
        // Middleware ab (sie frischt die Session auf). Deshalb try/catch.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // ignoriert – Session-Refresh übernimmt die Middleware
        }
      },
    },
  });
}

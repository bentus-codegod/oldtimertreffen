import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Frischt bei jedem Request die Supabase-Auth-Session auf und schreibt die
 * aktualisierten Cookies in die Antwort. Ohne das laufen Server-Sessions
 * irgendwann ab. Fehlen die Env-Variablen, passiert nichts (App ohne Login).
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Wichtig: getUser() löst den Session-Refresh aus. Nichts dazwischen schieben.
  await supabase.auth.getUser();

  return response;
}

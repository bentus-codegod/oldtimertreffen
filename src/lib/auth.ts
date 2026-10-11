import { createServerSupabase } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string;
}

/**
 * Aktuell eingeloggter Nutzer (serverseitig, aus der Session) – oder `null`.
 * Nutzt bewusst getUser() (prüft das Token beim Auth-Server), nicht nur die
 * lokale Session.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}

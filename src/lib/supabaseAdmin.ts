import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase-Client mit Service-Role-Key – umgeht Row Level Security und darf
 * deshalb NUR in Server-Code (Server Actions / Server Components im Admin-
 * Bereich) verwendet werden. Der Key hat bewusst kein NEXT_PUBLIC_-Präfix und
 * gelangt dadurch nie in den Browser-Bundle.
 */
export function getAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

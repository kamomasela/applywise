import { createClient } from '@supabase/supabase-js';

/**
 * Admin (service-role) Supabase client.
 * Use ONLY in server-side code (route handlers, server actions).
 * Never expose to the client — it bypasses RLS.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

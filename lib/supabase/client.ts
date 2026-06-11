import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      'Supabase environment variables are not set. ' +
      'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
      'are configured in your Netlify environment variables and redeploy.'
    );
  }

  return createBrowserClient(url, anon);
}

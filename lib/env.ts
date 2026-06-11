/**
 * Validates required environment variables at startup.
 * NEXT_PUBLIC_ vars are baked in at BUILD time by Next.js —
 * if they are missing, the build itself will throw here.
 */

const required = {
  NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const;

for (const [key, value] of Object.entries(required)) {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Add it to your .env.local (local) or Netlify environment variables (production) ` +
      `and redeploy.`
    );
  }
}

export const env = {
  supabaseUrl:  required.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnon: required.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
};

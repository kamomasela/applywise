import { createClient } from '@/lib/supabase/server';

/**
 * Returns the step numbers (1–4) the user has saved data for.
 * Step 5 (documents) is omitted — upload is coming soon.
 */
export async function getCompletedSteps(userId: string): Promise<number[]> {
  const supabase = createClient();

  const [
    { data: profile },
    { data: guardian },
    { data: academic },
  ] = await Promise.all([
    supabase.from('profiles').select('first_name,phone').eq('id', userId).single(),
    supabase.from('guardian_details').select('id').eq('profile_id', userId).maybeSingle(),
    supabase.from('academic_details').select('id').eq('profile_id', userId).maybeSingle(),
  ]);

  return (
    [
      profile?.first_name ? 1 : null,
      profile?.phone      ? 2 : null,
      guardian?.id        ? 3 : null,
      academic?.id        ? 4 : null,
    ] as (number | null)[]
  ).filter((n): n is number => n !== null);
}

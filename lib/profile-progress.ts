import { createClient } from '@/lib/supabase/server';

/**
 * Returns the step numbers (1–4) the user has saved data for.
 * Uses limit(1) instead of maybeSingle() so duplicate rows from old sessions
 * never cause the query to return null and hide the green tick.
 */
export async function getCompletedSteps(userId: string): Promise<number[]> {
  const supabase = createClient();

  const [
    { data: profiles },
    { data: guardians },
    { data: academics },
  ] = await Promise.all([
    supabase.from('profiles').select('first_name,phone').eq('id', userId).limit(1),
    supabase.from('guardian_details').select('id').eq('profile_id', userId)
      .order('created_at', { ascending: false }).limit(1),
    supabase.from('academic_details').select('id').eq('profile_id', userId)
      .order('created_at', { ascending: false }).limit(1),
  ]);

  const profile  = profiles?.[0];
  const guardian = guardians?.[0];
  const academic = academics?.[0];

  return (
    [
      profile?.first_name ? 1 : null,
      profile?.phone      ? 2 : null,
      guardian?.id        ? 3 : null,
      academic?.id        ? 4 : null,
    ] as (number | null)[]
  ).filter((n): n is number => n !== null);
}

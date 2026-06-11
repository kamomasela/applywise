'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function generateReference(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `AW-${year}-${rand}`;
}

export async function submitApplications(): Promise<{ error: string } | never> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  // Fetch all draft application IDs
  const { data: drafts, error: fetchError } = await supabase
    .from('applications')
    .select('id')
    .eq('profile_id', user.id)
    .eq('status', 'draft');

  if (fetchError || !drafts || drafts.length === 0) {
    return { error: 'No draft applications found.' };
  }

  const now = new Date().toISOString();

  // Update each to submitted with a unique reference number
  const updates = drafts.map((app) =>
    supabase
      .from('applications')
      .update({
        status: 'submitted',
        submission_date: now,
        reference_number: generateReference(),
      })
      .eq('id', app.id)
  );

  const results = await Promise.all(updates);
  const anyError = results.some((r) => r.error);
  if (anyError) return { error: 'Failed to submit some applications. Please try again.' };

  redirect('/dashboard');
}

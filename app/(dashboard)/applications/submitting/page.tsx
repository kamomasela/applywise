import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import type { University } from '@/types';
import SubmissionFlow from '@/components/applications/SubmissionFlow';

export const metadata: Metadata = { title: 'Submitting — ApplyWise' };

interface PageProps {
  searchParams: { mode?: string; paid?: string };
}

export default async function SubmittingPage({ searchParams }: PageProps) {
  const freeOnly = searchParams.mode === 'free';

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch draft apps (to submit) and today's submitted apps (from PayFast ITN)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [draftResult, submittedResult, profileResult] = await Promise.all([
    supabase
      .from('applications')
      .select('id, university_id, first_choice_programme_id, second_choice_programme_id, reference_number')
      .eq('profile_id', user.id)
      .eq('status', 'draft')
      .order('created_at'),
    supabase
      .from('applications')
      .select('id, university_id, first_choice_programme_id, second_choice_programme_id, reference_number')
      .eq('profile_id', user.id)
      .eq('status', 'submitted')
      .gte('submission_date', todayStart.toISOString())
      .order('created_at'),
    supabase
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .maybeSingle(),
  ]);

  // When "free only" mode: only include free draft apps
  let draftApps = draftResult.data ?? [];
  const submittedApps = submittedResult.data ?? [];

  // Fetch universities for all apps
  const allAppRows = [...draftApps, ...submittedApps];
  if (allAppRows.length === 0) redirect('/dashboard');

  const universityIds = [...new Set(allAppRows.map((a) => a.university_id))];
  const programmeIds  = [
    ...allAppRows.map((a) => a.first_choice_programme_id),
    ...allAppRows.map((a) => a.second_choice_programme_id),
  ].filter(Boolean) as string[];

  const [uniResult, progResult] = await Promise.all([
    supabase.from('universities').select('id, name, abbreviation, application_fee').in('id', universityIds),
    programmeIds.length > 0
      ? supabase.from('programmes').select('id, name').in('id', programmeIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const uniMap  = new Map((uniResult.data ?? []).map(
    (u: Pick<University, 'id' | 'name' | 'abbreviation' | 'application_fee'>) => [u.id, u]
  ));
  const progMap = new Map((progResult.data ?? []).map(
    (p: { id: string; name: string }) => [p.id, p]
  ));

  // In "free only" mode, filter to apps with zero fee universities
  if (freeOnly) {
    draftApps = draftApps.filter((a) => {
      const uni = uniMap.get(a.university_id);
      return uni && (uni as unknown as { application_fee: number }).application_fee === 0;
    });
  }

  // Build the combined list for SubmissionFlow
  const apps = [
    ...submittedApps.map((app) => ({
      id:                      app.id,
      university_name:         uniMap.get(app.university_id)?.name ?? 'Unknown',
      university_abbreviation: uniMap.get(app.university_id)?.abbreviation ?? '',
      status:                  'submitted' as const,
      reference_number:        app.reference_number,
    })),
    ...draftApps.map((app) => ({
      id:                      app.id,
      university_name:         uniMap.get(app.university_id)?.name ?? 'Unknown',
      university_abbreviation: uniMap.get(app.university_id)?.abbreviation ?? '',
      status:                  'draft' as const,
      reference_number:        null,
    })),
  ].filter((a) => a.university_name !== 'Unknown'); // guard

  if (apps.length === 0) redirect('/dashboard');

  // Build email payload
  const firstName = profileResult.data?.first_name ?? 'there';

  const emailApps = apps.map((app) => {
    const rawApp = allAppRows.find((r) => r.id === app.id);
    return {
      university_name:  app.university_name,
      first_choice:     rawApp?.first_choice_programme_id
        ? (progMap.get(rawApp.first_choice_programme_id)?.name ?? null)
        : null,
      second_choice:    rawApp?.second_choice_programme_id
        ? (progMap.get(rawApp.second_choice_programme_id)?.name ?? null)
        : null,
      reference_number: app.reference_number ?? '—',
    };
  });

  return (
    <SubmissionFlow
      apps={apps}
      freeOnly={freeOnly}
      emailPayload={{
        firstName,
        submissionDate: new Date().toISOString(),
        applications:   emailApps,
      }}
    />
  );
}

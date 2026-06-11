import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { University, Programme, Subject } from '@/types';
import ReviewAccordion from '@/components/applications/ReviewAccordion';

export const metadata: Metadata = { title: 'Review applications — ApplyWise' };

export default async function ApplicationsReviewPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Load draft applications
  const { data: rawApps } = await supabase
    .from('applications')
    .select('id, university_id, first_choice_programme_id, second_choice_programme_id')
    .eq('profile_id', user.id)
    .eq('status', 'draft')
    .order('created_at');

  if (!rawApps || rawApps.length === 0) redirect('/universities');

  const universityIds = rawApps.map((a) => a.university_id);
  const programmeIds  = [
    ...rawApps.map((a) => a.first_choice_programme_id),
    ...rawApps.map((a) => a.second_choice_programme_id),
  ].filter(Boolean) as string[];

  // Fetch everything in parallel
  const [uniResult, progResult, profileResult, academicResult, docsResult] = await Promise.all([
    supabase.from('universities').select('*').in('id', universityIds),
    programmeIds.length > 0
      ? supabase.from('programmes').select('*').in('id', programmeIds)
      : Promise.resolve({ data: [] as Programme[] }),
    supabase
      .from('profiles')
      .select('first_name, last_name, id_number, date_of_birth, email, phone, province, physical_address')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('academic_details')
      .select('aps_score, subjects, school_name')
      .eq('profile_id', user.id)
      .maybeSingle(),
    supabase
      .from('documents')
      .select('document_type, file_name')
      .eq('profile_id', user.id)
      .order('uploaded_at'),
  ]);

  const universities = (uniResult.data  ?? []) as University[];
  const programmes   = (progResult.data ?? []) as Programme[];
  const profile      = profileResult.data;
  const documents    = docsResult.data ?? [];

  const uniMap  = new Map(universities.map((u) => [u.id, u]));
  const progMap = new Map(programmes.map((p) => [p.id, p]));

  const applications = rawApps
    .map((app) => ({
      id:           app.id,
      university:   uniMap.get(app.university_id)!,
      firstChoice:  app.first_choice_programme_id
        ? (progMap.get(app.first_choice_programme_id) ?? null)
        : null,
      secondChoice: app.second_choice_programme_id
        ? (progMap.get(app.second_choice_programme_id) ?? null)
        : null,
    }))
    .filter((a) => a.university);

  // Decide whether to go to payment or directly to submitting
  const totalFees = applications.reduce(
    (sum, a) => sum + (a.university.application_fee ?? 0),
    0
  );
  const submitHref = totalFees > 0 ? '/applications/payment' : '/applications/submitting';

  const academic = academicResult.data
    ? {
        aps_score:   academicResult.data.aps_score as number | null,
        subjects:    (academicResult.data.subjects as Subject[]) ?? [],
        school_name: academicResult.data.school_name as string | null,
      }
    : null;

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/applications/missing-info"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0b4f6c] hover:underline underline-offset-2 mb-6"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to checklist
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review your applications</h1>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          Please check everything carefully before you submit. Once submitted, some details cannot be changed.
        </p>
      </div>

      <ReviewAccordion
        profile={{
          first_name:       profile?.first_name       ?? null,
          last_name:        profile?.last_name        ?? null,
          id_number:        profile?.id_number        ?? null,
          date_of_birth:    profile?.date_of_birth    ?? null,
          email:            profile?.email            ?? null,
          phone:            profile?.phone            ?? null,
          province:         profile?.province         ?? null,
          physical_address: profile?.physical_address ?? null,
        }}
        academic={academic}
        applications={applications}
        documents={documents}
        submitHref={submitHref}
      />
    </div>
  );
}

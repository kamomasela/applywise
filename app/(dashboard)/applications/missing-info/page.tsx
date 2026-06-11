import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { University, Programme } from '@/types';
import { checkMissingInfo } from '@/lib/utils/missing-info-checker';
import MissingInfoClient from '@/components/applications/MissingInfoClient';

export const metadata: Metadata = { title: 'Almost ready — ApplyWise' };

export default async function MissingInfoPage() {
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

  // Fetch all required data in parallel
  const [uniResult, progResult, profileResult, docsResult] = await Promise.all([
    supabase.from('universities').select('*').in('id', universityIds),
    programmeIds.length > 0
      ? supabase.from('programmes').select('*').in('id', programmeIds)
      : Promise.resolve({ data: [] as Programme[] }),
    supabase
      .from('profiles')
      .select('date_of_birth')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('documents')
      .select('document_type')
      .eq('profile_id', user.id),
  ]);

  const universities      = (uniResult.data  ?? []) as University[];
  const programmes        = (progResult.data ?? []) as Programme[];
  const uploadedDocTypes  = (docsResult.data ?? []).map((d) => d.document_type);
  const dateOfBirth       = profileResult.data?.date_of_birth ?? null;

  const uniMap  = new Map(universities.map((u) => [u.id, u]));
  const progMap = new Map(programmes.map((p) => [p.id, p]));

  const applications = rawApps
    .map((app) => ({
      university:           uniMap.get(app.university_id)!,
      firstChoiceProgramme: app.first_choice_programme_id
        ? (progMap.get(app.first_choice_programme_id) ?? null)
        : null,
      secondChoiceProgramme: app.second_choice_programme_id
        ? (progMap.get(app.second_choice_programme_id) ?? null)
        : null,
    }))
    .filter((a) => a.university); // guard against orphaned rows

  const results = checkMissingInfo({ dateOfBirth, uploadedDocTypes, applications });

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/universities/programmes"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0b4f6c] hover:underline underline-offset-2 mb-6"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to programme selection
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Almost ready to submit</h1>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          We&apos;ve checked your profile against each university&apos;s requirements.
          Here is what still needs your attention.
        </p>
      </div>

      <MissingInfoClient results={results} userId={user.id} />
    </div>
  );
}

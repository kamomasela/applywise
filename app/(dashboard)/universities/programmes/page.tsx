import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { UniversityWithProgrammes, ApplicationDraft } from '@/types';
import ProgrammeSelector from '@/components/universities/ProgrammeSelector';

export const metadata: Metadata = { title: 'Choose programmes — ApplyWise' };

export default async function ProgrammesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Load draft applications
  const { data: rawApplications } = await supabase
    .from('applications')
    .select('id, university_id, first_choice_programme_id, second_choice_programme_id, status')
    .eq('profile_id', user.id)
    .eq('status', 'draft')
    .order('created_at');

  const applications = (rawApplications ?? []) as ApplicationDraft[];

  if (applications.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <p className="text-gray-500 text-sm mb-4">
          You haven&apos;t selected any universities yet.
        </p>
        <Link
          href="/universities"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0b4f6c] hover:underline"
        >
          <ArrowLeft size={14} />
          Back to university selection
        </Link>
      </div>
    );
  }

  // Get university IDs from applications
  const universityIds = applications.map((a) => a.university_id);

  // Load those universities with their programmes
  const { data: rawUniversities } = await supabase
    .from('universities')
    .select('*, programmes(*)')
    .in('id', universityIds)
    .order('name');

  const universities = (rawUniversities ?? []) as UniversityWithProgrammes[];

  // Load academic details
  const { data: academic } = await supabase
    .from('academic_details')
    .select('aps_score, has_pure_mathematics')
    .eq('profile_id', user.id)
    .maybeSingle();

  const apsScore     = academic?.aps_score           ?? 0;
  const hasPureMaths = academic?.has_pure_mathematics ?? false;

  return (
    <div className="mx-auto max-w-lg">
      {/* Back link */}
      <Link
        href="/universities"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0b4f6c] hover:underline underline-offset-2 mb-6"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to university selection
      </Link>

      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Choose your programmes</h1>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          Select a first choice and a backup programme for each university you are applying to.
          Only programmes you qualify for are shown.
        </p>
        <p className="mt-2 text-xs text-gray-400">
          {applications.length} {applications.length === 1 ? 'university' : 'universities'} selected
        </p>
      </div>

      <ProgrammeSelector
        applications={applications}
        universities={universities}
        userId={user.id}
        apsScore={apsScore}
        hasPureMaths={hasPureMaths}
      />
    </div>
  );
}

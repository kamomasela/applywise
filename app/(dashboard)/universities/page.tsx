import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import type { UniversityWithProgrammes } from '@/types';
import UniversitySelector from '@/components/universities/UniversitySelector';

export const metadata: Metadata = { title: 'Choose universities — ApplyWise' };

export default async function UniversitiesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Load universities with their programmes in one query
  const { data: rawUniversities, error } = await supabase
    .from('universities')
    .select('*, programmes(*)')
    .order('name');

  if (error) {
    return (
      <div className="mx-auto max-w-lg py-8 text-center text-sm text-red-500">
        Failed to load universities. Please refresh the page.
      </div>
    );
  }

  const universities = (rawUniversities ?? []) as UniversityWithProgrammes[];

  // Load learner's academic details
  const { data: academic } = await supabase
    .from('academic_details')
    .select('aps_score, has_pure_mathematics')
    .eq('profile_id', user.id)
    .maybeSingle();

  const apsScore    = academic?.aps_score          ?? 0;
  const hasPureMaths = academic?.has_pure_mathematics ?? false;

  // Load existing draft applications
  const { data: applications } = await supabase
    .from('applications')
    .select('university_id')
    .eq('profile_id', user.id)
    .eq('status', 'draft');

  const initialSelectedIds = (applications ?? []).map((a) => a.university_id);

  return (
    <div className="mx-auto max-w-lg">
      {/* Heading */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Universities you qualify for</h1>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          These are the universities where your APS score and subjects meet the entry requirements.
          Tick the ones you want to apply to.
        </p>
        {apsScore === 0 && (
          <div className="mt-3 rounded-lg border border-[#f5a623]/40 bg-[#f5a623]/10 px-3 py-2.5 text-sm text-gray-700">
            Your academic details haven&apos;t been saved yet.{' '}
            <a href="/profile/step-4" className="font-semibold text-[#0b4f6c] underline underline-offset-2">
              Complete Step 4
            </a>{' '}
            to see which universities you qualify for.
          </div>
        )}
      </div>

      <UniversitySelector
        universities={universities}
        userId={user.id}
        apsScore={apsScore}
        hasPureMaths={hasPureMaths}
        initialSelectedIds={initialSelectedIds}
      />
    </div>
  );
}

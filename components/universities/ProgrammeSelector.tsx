'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { createClient } from '@/lib/supabase/client';
import type { UniversityWithProgrammes, ApplicationDraft } from '@/types';
import { getQualifyingProgrammes } from '@/lib/utils/university-match';

import ProgrammeSection from './ProgrammeSection';
import Button from '@/components/ui/Button';

interface ProgrammeSelectorProps {
  applications: ApplicationDraft[];
  universities: UniversityWithProgrammes[];
  userId: string;
  apsScore: number;
  hasPureMaths: boolean;
}

interface SelectionState {
  firstChoiceId: string | null;
  secondChoiceId: string | null;
  campus: string | null;
}

export default function ProgrammeSelector({
  applications,
  universities,
  userId,
  apsScore,
  hasPureMaths,
}: ProgrammeSelectorProps) {
  const router  = useRouter();
  const supabase = createClient();

  // Build initial state map
  const initialState: Record<string, SelectionState> = {};
  for (const app of applications) {
    initialState[app.university_id] = {
      firstChoiceId:  app.first_choice_programme_id,
      secondChoiceId: app.second_choice_programme_id,
      campus:         app.campus_preference ?? null,
    };
  }

  const [selections, setSelections] = useState<Record<string, SelectionState>>(initialState);
  const [isSaving, setIsSaving] = useState(false);

  // Map university_id → university object for quick lookup
  const uniMap = new Map(universities.map((u) => [u.id, u]));

  const handleChange = useCallback((universityId: string, data: SelectionState) => {
    setSelections((prev) => ({ ...prev, [universityId]: data }));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);

    const updates = applications.map((app) => {
      const sel = selections[app.university_id];
      return supabase
        .from('applications')
        .update({
          first_choice_programme_id:  sel?.firstChoiceId  ?? null,
          second_choice_programme_id: sel?.secondChoiceId ?? null,
          // campus stored in a future column; skip for now
        })
        .eq('profile_id', userId)
        .eq('university_id', app.university_id)
        .eq('status', 'draft');
    });

    const results = await Promise.all(updates);
    const anyError = results.some((r) => r.error);

    if (anyError) {
      toast.error('Some selections could not be saved. Please try again.');
      setIsSaving(false);
      return;
    }

    router.push('/applications/missing-info');
  };

  return (
    <div className="space-y-4 pb-8">
      {applications.map((app) => {
        const university = uniMap.get(app.university_id);
        if (!university) return null;

        const qualifyingProgrammes = getQualifyingProgrammes(
          university.programmes ?? [],
          apsScore,
          hasPureMaths
        );

        return (
          <ProgrammeSection
            key={app.university_id}
            university={university}
            qualifyingProgrammes={qualifyingProgrammes}
            hasPureMaths={hasPureMaths}
            initialFirstChoiceId={app.first_choice_programme_id}
            initialSecondChoiceId={app.second_choice_programme_id}
            initialCampus={app.campus_preference ?? null}
            onChange={(data) => handleChange(app.university_id, data)}
          />
        );
      })}

      <div className="pt-4">
        <Button fullWidth loading={isSaving} onClick={handleSave}>
          Review my applications
        </Button>
      </div>
    </div>
  );
}

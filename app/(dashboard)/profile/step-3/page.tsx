import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCompletedSteps } from '@/lib/profile-progress';
import Step3Form from '@/components/forms/steps/Step3Form';
import type { Step3Data } from '@/lib/validations/profile';

export const metadata = { title: 'Step 3 — Guardian Details | ApplyWise' };

export default async function Step3Page() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: guardian }, completedSteps] = await Promise.all([
    supabase
      .from('guardian_details')
      .select('id,full_name,relationship,phone,email,occupation,household_income,nsfas_applicant')
      .eq('profile_id', user.id)
      .maybeSingle(),
    getCompletedSteps(user.id),
  ]);

  const defaults: Partial<Step3Data> = {
    full_name:        guardian?.full_name        ?? '',
    relationship:     guardian?.relationship     ?? '',
    phone:            guardian?.phone            ?? '',
    email:            guardian?.email            ?? '',
    occupation:       guardian?.occupation       ?? '',
    household_income: guardian?.household_income ?? '',
    nsfas_applicant:  guardian?.nsfas_applicant  ?? false,
  };

  return (
    <div className="mx-auto max-w-lg py-4">
      <Step3Form
        userId={user.id}
        defaultValues={defaults}
        existingGuardianId={guardian?.id ?? null}
        completedSteps={completedSteps}
      />
    </div>
  );
}

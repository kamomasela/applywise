import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Step1Form from '@/components/forms/steps/Step1Form';
import type { Step1Data } from '@/lib/validations/profile';

export const metadata = { title: 'Step 1 — Personal Details | ApplyWise' };

export default async function Step1Page() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name,last_name,id_number,date_of_birth,gender,race,home_language,nationality')
    .eq('id', user.id)
    .single();

  const defaults: Partial<Step1Data> = {
    first_name:    profile?.first_name    ?? '',
    last_name:     profile?.last_name     ?? '',
    id_number:     profile?.id_number     ?? '',
    date_of_birth: profile?.date_of_birth ?? '',
    gender:        profile?.gender        ?? '',
    race:          profile?.race          ?? '',
    home_language: profile?.home_language ?? '',
    nationality:   profile?.nationality   ?? 'South African',
  };

  return (
    <div className="mx-auto max-w-lg py-4">
      <Step1Form userId={user.id} defaultValues={defaults} />
    </div>
  );
}

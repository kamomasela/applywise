import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Step2Form from '@/components/forms/steps/Step2Form';
import type { Step2Data } from '@/lib/validations/profile';

export const metadata = { title: 'Step 2 — Contact Details | ApplyWise' };

export default async function Step2Page() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('email,phone,province,physical_address,postal_same_as_physical,postal_address')
    .eq('id', user.id)
    .single();

  const defaults: Partial<Step2Data> = {
    email:                   profile?.email    ?? '',
    phone:                   profile?.phone    ?? '',
    province:                profile?.province ?? '',
    postal_same_as_physical: profile?.postal_same_as_physical ?? true,
    physical_address: profile?.physical_address ?? { street: '', suburb: '', city: '', postal_code: '' },
    postal_address:   profile?.postal_address   ?? { street: '', suburb: '', city: '', postal_code: '' },
  };

  return (
    <div className="mx-auto max-w-lg py-4">
      <Step2Form userId={user.id} defaultValues={defaults} />
    </div>
  );
}

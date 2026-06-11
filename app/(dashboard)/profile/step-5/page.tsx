import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Step5Form from '@/components/forms/steps/Step5Form';
import type { Document } from '@/types';

export const metadata = { title: 'Step 5 — Documents | ApplyWise' };

export default async function Step5Page() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('profile_id', user.id);

  return (
    <div className="mx-auto max-w-lg py-4">
      <Step5Form
        userId={user.id}
        existingDocuments={(documents ?? []) as Document[]}
      />
    </div>
  );
}

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCompletedSteps } from '@/lib/profile-progress';
import Step5Form from '@/components/forms/steps/Step5Form';
import type { Document } from '@/types';

export const metadata = { title: 'Step 5 — Documents | ApplyWise' };

export default async function Step5Page() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: documents }, completedSteps] = await Promise.all([
    supabase.from('documents').select('*').eq('profile_id', user.id),
    getCompletedSteps(user.id),
  ]);

  return (
    <div className="mx-auto max-w-lg py-4">
      <Step5Form
        userId={user.id}
        existingDocuments={(documents ?? []) as Document[]}
        completedSteps={completedSteps}
      />
    </div>
  );
}

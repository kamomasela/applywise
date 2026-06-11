import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Step4Form from '@/components/forms/steps/Step4Form';
import type { Step4Data } from '@/lib/validations/profile';

export const metadata = { title: 'Step 4 — Academic Details | ApplyWise' };

export default async function Step4Page() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: academic } = await supabase
    .from('academic_details')
    .select('id,school_name,school_province,school_emis,result_type,matric_year,subjects')
    .eq('profile_id', user.id)
    .maybeSingle();

  const defaults: Partial<Step4Data> = {
    school_name:     academic?.school_name     ?? '',
    school_province: academic?.school_province ?? '',
    school_emis:     academic?.school_emis     ?? '',
    result_type:     academic?.result_type     ?? '',
    matric_year:     academic?.matric_year     ?? new Date().getFullYear(),
    subjects:        Array.isArray(academic?.subjects) ? academic.subjects : [],
  };

  return (
    <div className="mx-auto max-w-lg py-4">
      <Step4Form
        userId={user.id}
        defaultValues={defaults}
        existingAcademicId={academic?.id ?? null}
      />
    </div>
  );
}

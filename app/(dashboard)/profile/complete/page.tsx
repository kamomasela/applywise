import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { calculateAPS } from '@/lib/utils/aps';

export const metadata = { title: 'Profile Complete — ApplyWise' };

export default async function ProfileCompletePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: academic }, { data: documents }] = await Promise.all([
    supabase.from('profiles').select('first_name,last_name').eq('id', user.id).single(),
    supabase.from('academic_details').select('subjects,aps_score').eq('profile_id', user.id).maybeSingle(),
    supabase.from('documents').select('id').eq('profile_id', user.id),
  ]);

  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Learner';
  const aps  = academic?.aps_score ?? (Array.isArray(academic?.subjects) ? calculateAPS(academic.subjects) : 0);
  const subjectCount  = Array.isArray(academic?.subjects) ? academic.subjects.length : 0;
  const documentCount = documents?.length ?? 0;

  return (
    <div className="mx-auto max-w-sm py-12 flex flex-col items-center text-center">
      {/* Animated green tick */}
      <div
        className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#1ec97e]/10"
        style={{ animation: 'scaleIn 0.4s ease-out' }}
      >
        <svg
          viewBox="0 0 52 52"
          fill="none"
          className="h-10 w-10"
          style={{ animation: 'drawCheck 0.6s ease-out 0.2s both' }}
        >
          <circle cx="26" cy="26" r="25" stroke="#1ec97e" strokeWidth="2" />
          <path
            d="M14 27l8 8 16-16"
            stroke="#1ec97e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="40"
            strokeDashoffset="0"
            style={{ animation: 'drawCheck 0.5s ease-out 0.3s both' }}
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Your profile is ready</h1>

      {/* Summary card */}
      <div className="mt-6 w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <span className="text-sm text-gray-500">Learner</span>
          <span className="font-semibold text-gray-900">{name}</span>
        </div>

        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <span className="text-sm text-gray-500">APS score</span>
          <span className="text-3xl font-black text-[#0b4f6c] tabular-nums">{aps}</span>
        </div>

        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <span className="text-sm text-gray-500">Subjects entered</span>
          <span className="font-semibold text-gray-900">{subjectCount}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Documents uploaded</span>
          <span className="font-semibold text-gray-900">{documentCount}</span>
        </div>
      </div>

      <p className="mt-6 text-sm text-gray-500 leading-relaxed">
        Well done. Your profile is complete. Now let us find the universities you qualify for.
      </p>

      <Link
        href="/universities"
        className="mt-8 block w-full rounded-lg bg-[#0b4f6c] px-6 py-3 text-center text-base font-semibold text-white hover:bg-[#093d56] active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-[#0b4f6c] focus:ring-offset-2"
      >
        Choose my universities
      </Link>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes drawCheck {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0;  }
        }
      `}</style>
    </div>
  );
}

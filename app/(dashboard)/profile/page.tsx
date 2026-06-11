import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  User, GraduationCap, Home, FileText,
  Users, BookOpen, ChevronRight, Settings,
  CheckCircle2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'My Profile — ApplyWise' };

const STEPS = [
  { href: '/profile/step-1', label: 'Personal details',      Icon: User,          step: 1 },
  { href: '/profile/step-2', label: 'Guardian & financial',  Icon: Users,         step: 2 },
  { href: '/profile/step-3', label: 'Address',               Icon: Home,          step: 3 },
  { href: '/profile/step-4', label: 'Academic results',      Icon: GraduationCap, step: 4 },
  { href: '/profile/step-5', label: 'Documents',             Icon: FileText,      step: 5 },
  { href: '/profile/complete', label: 'Review & complete',   Icon: BookOpen,      step: 6 },
] as const;

export default async function ProfileHubPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, profile_complete')
    .eq('id', user.id)
    .maybeSingle();

  const firstName      = profile?.first_name ?? 'there';
  const isComplete     = profile?.profile_complete ?? false;

  return (
    <div className="mx-auto max-w-lg space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">{firstName}&apos;s profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {isComplete
            ? 'Your profile is complete. Tap any section to update it.'
            : 'Complete all steps to unlock your applications.'}
        </p>
      </div>

      {/* Profile steps */}
      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-50">
        {STEPS.map(({ href, label, Icon, step }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100"
          >
            <div className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg bg-[#0b4f6c]/8 bg-opacity-10">
              <Icon size={15} className="text-[#0b4f6c]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">
                Step {step} — {label}
              </p>
            </div>
            {isComplete && step < 6 ? (
              <CheckCircle2 size={16} className="text-[#1ec97e] shrink-0" />
            ) : (
              <ChevronRight size={15} className="text-gray-300 shrink-0" />
            )}
          </Link>
        ))}
      </div>

      {/* Settings link */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
        >
          <div className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg bg-gray-50">
            <Settings size={15} className="text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">Settings</p>
            <p className="text-xs text-gray-400">Password, notifications, log out</p>
          </div>
          <ChevronRight size={15} className="text-gray-300 shrink-0" />
        </Link>
      </div>
    </div>
  );
}

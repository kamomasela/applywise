import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { AlertCircle, ChevronRight, FileText, GraduationCap } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { ApplicationStatus, University } from '@/types';
import { daysUntilClose } from '@/lib/utils/university-match';
import StatCard from '@/components/dashboard/StatCard';
import AppStatusCard from '@/components/dashboard/AppStatusCard';
import DeadlineTracker from '@/components/dashboard/DeadlineTracker';
import PushPermissionPrompt from '@/components/dashboard/PushPermissionPrompt';

export const metadata: Metadata = { title: 'Dashboard — ApplyWise' };

// Compute greeting in South Africa Standard Time (UTC+2, no DST)
function getSASTGreeting(firstName: string): string {
  const hourSAST = (new Date().getUTCHours() + 2) % 24;
  const salutation =
    hourSAST < 12 ? 'Good morning' :
    hourSAST < 17 ? 'Good afternoon' :
    'Good evening';
  return `${salutation}, ${firstName}.`;
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Parallel data fetch
  const [profileResult, academicResult, appsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('first_name, profile_complete')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('academic_details')
      .select('aps_score')
      .eq('profile_id', user.id)
      .maybeSingle(),
    supabase
      .from('applications')
      .select('id, university_id, first_choice_programme_id, status, submission_date, reference_number')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const profile   = profileResult.data;
  const apsScore  = academicResult.data?.aps_score ?? 0;
  const apps      = appsResult.data ?? [];
  const firstName = profile?.first_name ?? 'there';
  const greeting  = getSASTGreeting(firstName);

  // Fetch universities + programmes for app cards
  const universityIds = [...new Set(apps.map((a) => a.university_id))];
  const programmeIds  = apps
    .map((a) => a.first_choice_programme_id)
    .filter(Boolean) as string[];

  const [uniResult, progResult] = await Promise.all([
    universityIds.length > 0
      ? supabase
          .from('universities')
          .select('id, name, abbreviation, logo_url, application_closes')
          .in('id', universityIds)
      : Promise.resolve({ data: [] as Pick<University, 'id' | 'name' | 'abbreviation' | 'logo_url' | 'application_closes'>[] }),
    programmeIds.length > 0
      ? supabase.from('programmes').select('id, name').in('id', programmeIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const uniMap  = new Map((uniResult.data  ?? []).map((u) => [u.id, u]));
  const progMap = new Map((progResult.data ?? []).map((p: { id: string; name: string }) => [p.id, p]));

  // ── Stat counts (all statuses) ─────────────────────────────────────────────
  const totalApps      = apps.length;
  const offersReceived = apps.filter((a) => a.status === 'offer_received').length;
  const underReview    = apps.filter((a) => a.status === 'under_review').length;
  const actionNeeded   = apps.filter((a) => a.status === 'additional_docs_required').length;

  // ── Draft CTA ──────────────────────────────────────────────────────────────
  const draftCount = apps.filter((a) => a.status === 'draft').length;

  // ── Application card rows ──────────────────────────────────────────────────
  const appCards = apps.map((app) => ({
    id:                      app.id,
    universityName:          uniMap.get(app.university_id)?.name ?? 'Unknown university',
    universityAbbreviation:  uniMap.get(app.university_id)?.abbreviation ?? '—',
    logoUrl:                 uniMap.get(app.university_id)?.logo_url ?? null,
    programmeName:           app.first_choice_programme_id
                               ? (progMap.get(app.first_choice_programme_id)?.name ?? null)
                               : null,
    submissionDate:          app.submission_date,
    status:                  app.status as ApplicationStatus,
  }));

  // ── Upcoming deadlines ─────────────────────────────────────────────────────
  const deadlines = [...uniMap.values()]
    .map((u) => ({
      university_id:           u.id,
      university_name:         u.name,
      university_abbreviation: u.abbreviation,
      days_left:               daysUntilClose(u.application_closes) ?? -1,
    }))
    .filter((d) => d.days_left > 0)
    .sort((a, b) => a.days_left - b.days_left);

  // ── Empty state ────────────────────────────────────────────────────────────
  const isEmpty = apps.length === 0;

  return (
    <div className="mx-auto max-w-lg space-y-6">

      {/* ── Greeting + APS badge ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{greeting}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Here is where your applications stand.
          </p>
        </div>

        {apsScore > 0 && (
          <div className="shrink-0 rounded-xl bg-[#0b4f6c] px-3 py-2 text-right">
            <p className="text-[10px] font-medium text-white/60 leading-none">APS Score</p>
            <p className="text-xl font-bold text-white leading-tight">{apsScore}</p>
            <a
              href="/profile/step-4"
              className="text-[9px] text-white/50 hover:text-white/80 transition-colors"
            >
              Powered by APSWise
            </a>
          </div>
        )}
      </div>

      {/* ── Push notification prompt ──────────────────────────────────── */}
      <PushPermissionPrompt />

      {/* ── Profile incomplete banner ─────────────────────────────────── */}
      {!profile?.profile_complete && (
        <Link
          href="/profile/step-1"
          className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 group"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 font-medium">Complete your profile to apply</p>
          </div>
          <ChevronRight size={16} className="text-amber-500 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      {/* ── Draft CTA ─────────────────────────────────────────────────── */}
      {draftCount > 0 && (
        <Link
          href="/applications/missing-info"
          className="flex items-center justify-between gap-3 rounded-xl border border-[#0b4f6c]/30 bg-[#f0f7fb] px-4 py-3 group"
        >
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[#0b4f6c] shrink-0" />
            <p className="text-sm font-medium text-[#0b4f6c]">
              {draftCount} draft application{draftCount !== 1 ? 's' : ''} — ready to submit
            </p>
          </div>
          <ChevronRight size={16} className="text-[#0b4f6c] group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      {/* ── Empty state ───────────────────────────────────────────────── */}
      {isEmpty ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-12 px-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <GraduationCap size={32} className="text-gray-400" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">No applications yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            You have not submitted any applications yet.
          </p>
          <Link
            href="/profile/step-1"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0b4f6c] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#093d54] transition-colors"
          >
            Start by completing your profile
          </Link>
        </div>
      ) : (
        <>
          {/* ── Stat cards ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total applications" value={totalApps}      color="navy"  />
            <StatCard label="Offers received"    value={offersReceived} color="green" />
            <StatCard label="Under review"       value={underReview}    color="amber" />
            <StatCard label="Action needed"      value={actionNeeded}   color="red"   />
          </div>

          {/* ── Application cards ───────────────────────────────────── */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Your applications
            </h2>
            <div className="space-y-3">
              {appCards.map((card) => (
                <AppStatusCard key={card.id} {...card} />
              ))}
            </div>
          </section>

          {/* ── Deadline tracker ────────────────────────────────────── */}
          {deadlines.length > 0 && (
            <DeadlineTracker deadlines={deadlines} />
          )}
        </>
      )}
    </div>
  );
}

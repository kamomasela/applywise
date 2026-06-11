import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
  X,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Application, University, Programme, ApplicationStatus } from '@/types';

export const metadata: Metadata = { title: 'Application details — ApplyWise' };

// ── Status config (mirrors AppStatusCard) ─────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STATUS_CONFIG: Record<string, { label: string; pill: string; Icon: React.ComponentType<any> }> = {
  draft:                    { label: 'Draft',          pill: 'bg-gray-100 text-gray-600',          Icon: FileText      },
  submitted:                { label: 'Submitted',      pill: 'bg-[#0b4f6c]/10 text-[#0b4f6c]',    Icon: CheckCircle2  },
  under_review:             { label: 'Under review',   pill: 'bg-amber-100 text-amber-700',         Icon: Clock         },
  additional_docs_required: { label: 'Action needed',  pill: 'bg-red-100 text-red-600',             Icon: AlertTriangle },
  offer_received:           { label: 'Offer received', pill: 'bg-[#1ec97e]/15 text-[#0a8a54]',      Icon: Star          },
  unsuccessful:             { label: 'Unsuccessful',   pill: 'bg-gray-100 text-gray-500',           Icon: X             },
  accepted:                 { label: 'Accepted',       pill: 'bg-[#1ec97e] text-white',             Icon: CheckCircle2  },
};

// ── Timeline helpers ──────────────────────────────────────────────────────────

const REVIEWED_STATUSES: ApplicationStatus[] = [
  'under_review', 'additional_docs_required', 'offer_received', 'unsuccessful', 'accepted',
];
const DECIDED_STATUSES: ApplicationStatus[] = [
  'offer_received', 'unsuccessful', 'accepted', 'additional_docs_required',
];

function getDecisionLabel(status: ApplicationStatus): string {
  if (status === 'offer_received')           return 'Offer received';
  if (status === 'unsuccessful')             return 'Application unsuccessful';
  if (status === 'accepted')                 return 'Offer accepted';
  if (status === 'additional_docs_required') return 'Documents requested';
  return 'Awaiting decision';
}

// ── Detail row ────────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className="text-xs text-gray-800 text-right font-medium">{value}</span>
    </div>
  );
}

// ── Timeline dot ──────────────────────────────────────────────────────────────

function TimelineDot({ done }: { done: boolean }) {
  return (
    <div className={[
      'h-4 w-4 shrink-0 rounded-full border-2 transition-colors',
      done
        ? 'border-[#0b4f6c] bg-[#0b4f6c]'
        : 'border-gray-300 bg-white',
    ].join(' ')} />
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  params: { id: string };
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch the application — enforcing ownership via profile_id
  const { data: rawApp } = await supabase
    .from('applications')
    .select('*')
    .eq('id', params.id)
    .eq('profile_id', user.id)
    .maybeSingle();

  if (!rawApp) notFound();

  const app = rawApp as Application;

  // Fetch university + programmes in parallel
  const [uniResult, prog1Result, prog2Result] = await Promise.all([
    supabase
      .from('universities')
      .select('id, name, abbreviation, application_url, city, province')
      .eq('id', app.university_id)
      .maybeSingle(),
    app.first_choice_programme_id
      ? supabase.from('programmes').select('id, name, qualification_type').eq('id', app.first_choice_programme_id).maybeSingle()
      : Promise.resolve({ data: null }),
    app.second_choice_programme_id
      ? supabase.from('programmes').select('id, name, qualification_type').eq('id', app.second_choice_programme_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const university = uniResult.data as University | null;
  const firstProg  = prog1Result.data as Programme | null;
  const secondProg = prog2Result.data as Programme | null;

  if (!university) notFound();

  const statusCfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.submitted;
  const StatusIcon = statusCfg.Icon;

  const isReviewed = REVIEWED_STATUSES.includes(app.status as ApplicationStatus);
  const isDecided  = DECIDED_STATUSES.includes(app.status as ApplicationStatus);

  const submittedDate = app.submission_date
    ? new Date(app.submission_date).toLocaleDateString('en-ZA', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  const responseDate = app.response_date
    ? new Date(app.response_date).toLocaleDateString('en-ZA', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  return (
    <div className="mx-auto max-w-lg space-y-5">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0b4f6c] hover:underline underline-offset-2"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to dashboard
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">{university.name}</h1>
        <p className="text-sm text-gray-500">{university.city}, {university.province}</p>
      </div>

      {/* Prominent status badge */}
      <div className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 ${statusCfg.pill}`}>
        <StatusIcon size={16} />
        <span className="text-sm font-bold">{statusCfg.label}</span>
      </div>

      {/* ── Application details ──────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Application details
        </h2>
        <DetailRow
          label="First choice programme"
          value={firstProg
            ? `${firstProg.name}${firstProg.qualification_type ? ` (${firstProg.qualification_type})` : ''}`
            : <em className="text-gray-400 font-normal">Not selected</em>
          }
        />
        {secondProg && (
          <DetailRow
            label="Backup programme"
            value={`${secondProg.name}${secondProg.qualification_type ? ` (${secondProg.qualification_type})` : ''}`}
          />
        )}
        {app.reference_number && (
          <DetailRow
            label="Reference number"
            value={<span className="font-mono tracking-wide">{app.reference_number}</span>}
          />
        )}
        {submittedDate && (
          <DetailRow label="Date submitted" value={submittedDate} />
        )}
      </div>

      {/* ── Status timeline ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Application timeline
        </h2>

        <div className="relative space-y-0">
          {/* Vertical connector line */}
          <div className="absolute left-[7px] top-4 h-[calc(100%-16px)] w-0.5 bg-gray-200" aria-hidden="true" />

          {/* Step 1: Submitted */}
          <div className="relative flex items-start gap-3 pb-5">
            <TimelineDot done={true} />
            <div className="pt-0.5">
              <p className="text-sm font-semibold text-gray-900">Application submitted</p>
              {submittedDate && (
                <p className="text-xs text-gray-400 mt-0.5">{submittedDate}</p>
              )}
            </div>
          </div>

          {/* Step 2: Under review */}
          <div className="relative flex items-start gap-3 pb-5">
            <TimelineDot done={isReviewed} />
            <div className="pt-0.5">
              <p className={`text-sm font-semibold ${isReviewed ? 'text-gray-900' : 'text-gray-400'}`}>
                Under review
              </p>
              {!isReviewed && (
                <p className="text-xs text-gray-400 mt-0.5">Waiting for the university</p>
              )}
            </div>
          </div>

          {/* Step 3: Decision */}
          <div className="relative flex items-start gap-3">
            <TimelineDot done={isDecided} />
            <div className="pt-0.5">
              <p className={`text-sm font-semibold ${isDecided ? 'text-gray-900' : 'text-gray-400'}`}>
                {getDecisionLabel(app.status as ApplicationStatus)}
              </p>
              {responseDate && (
                <p className="text-xs text-gray-400 mt-0.5">{responseDate}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── University message ───────────────────────────────────────── */}
      {app.university_response && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Message from the university
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {app.university_response}
          </p>
        </div>
      )}

      {/* ── Action needed: docs required ────────────────────────────── */}
      {app.status === 'additional_docs_required' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600 shrink-0" />
            <h2 className="text-sm font-bold text-red-700">Documents required</h2>
          </div>
          {app.missing_items.length > 0 ? (
            <ul className="space-y-1.5">
              {app.missing_items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-red-700">
              The university has requested additional documents. Please check your email for details.
            </p>
          )}
          <Link
            href="/profile/step-5"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            <FileText size={14} />
            Upload documents
          </Link>
        </div>
      )}

      {/* ── Offer received ───────────────────────────────────────────── */}
      {app.status === 'offer_received' && (
        <div className="rounded-xl border border-[#1ec97e]/40 bg-[#f0fdf7] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-[#1ec97e] shrink-0" />
            <h2 className="text-sm font-bold text-[#0a8a54]">Congratulations!</h2>
          </div>
          <p className="text-sm text-[#0a8a54] leading-relaxed">
            You have received an offer from <strong>{university.name}</strong>.
            {responseDate && ` Your acceptance deadline is ${responseDate}.`}
            {' '}Log in to the university portal to accept or decline.
          </p>
          {university.application_url && (
            <a
              href={university.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0b4f6c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#093d54] transition-colors"
            >
              Accept offer
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      )}

      {/* ── Accepted ─────────────────────────────────────────────────── */}
      {app.status === 'accepted' && (
        <div className="rounded-xl border border-[#1ec97e]/40 bg-[#f0fdf7] p-4">
          <p className="text-sm font-semibold text-[#0a8a54]">
            🎉 Your offer from {university.name} has been accepted. Well done — this is a big step!
          </p>
        </div>
      )}

      {/* ── Unsuccessful ─────────────────────────────────────────────── */}
      {app.status === 'unsuccessful' && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-semibold text-gray-900 mb-1">Do not give up</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your application to {university.name} was unsuccessful this time. You still have
            other applications open — stay positive and keep checking your dashboard for updates.
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

type AppStatus = 'pending' | 'submitting' | 'done' | 'error';

interface AppEntry {
  id: string;
  university_name: string;
  university_abbreviation: string;
  status: 'draft' | 'submitted';
  reference_number: string | null;
}

interface EmailPayload {
  firstName: string;
  submissionDate: string;
  applications: {
    university_name: string;
    first_choice: string | null;
    second_choice: string | null;
    reference_number: string;
  }[];
}

interface SubmissionFlowProps {
  apps: AppEntry[];
  freeOnly: boolean;
  emailPayload: EmailPayload;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function Spinner() {
  return (
    <span className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-[#0b4f6c] animate-spin shrink-0" />
  );
}

// Large animated green tick for the success screen
function BigTick() {
  return (
    <div
      className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1ec97e]/15"
      style={{ animation: 'tickPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}
    >
      <style>{`
        @keyframes tickPop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <CheckCircle2 size={44} className="text-[#1ec97e]" />
    </div>
  );
}

export default function SubmissionFlow({ apps, freeOnly, emailPayload }: SubmissionFlowProps) {
  const [statuses, setStatuses] = useState<Record<string, AppStatus>>(() => {
    const init: Record<string, AppStatus> = {};
    for (const app of apps) {
      init[app.id] = app.status === 'submitted' ? 'done' : 'pending';
    }
    return init;
  });
  const [references, setReferences] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const app of apps) {
      if (app.reference_number) init[app.id] = app.reference_number;
    }
    return init;
  });
  const [phase, setPhase] = useState<'submitting' | 'complete'>('submitting');
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      const toSubmit = apps.filter((a) => a.status === 'draft');

      for (const app of toSubmit) {
        setStatuses((prev) => ({ ...prev, [app.id]: 'submitting' }));
        await sleep(300); // visual pause before each submission

        try {
          const res = await fetch(`/api/applications/${app.id}/submit`, { method: 'POST' });
          const data = await res.json();

          if (data.reference_number) {
            setReferences((prev) => ({ ...prev, [app.id]: data.reference_number }));
            setStatuses((prev) => ({ ...prev, [app.id]: 'done' }));
          } else {
            setStatuses((prev) => ({ ...prev, [app.id]: 'error' }));
          }
        } catch {
          setStatuses((prev) => ({ ...prev, [app.id]: 'error' }));
        }

        await sleep(500); // visual pause after each submission
      }

      setPhase('complete');

      // Fire-and-forget confirmation email (non-blocking)
      try {
        await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailPayload),
        });
      } catch {
        // Email failure is non-critical
      }
    };

    run();
  }, [apps, emailPayload]);

  const doneCount  = Object.values(statuses).filter((s) => s === 'done').length;
  const errorCount = Object.values(statuses).filter((s) => s === 'error').length;

  // ── Submitting state ──────────────────────────────────────────────────────
  if (phase === 'submitting') {
    return (
      <div className="mx-auto max-w-lg py-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-gray-200 border-t-[#0b4f6c] animate-spin" />
          <h1 className="text-xl font-bold text-gray-900">Submitting your applications</h1>
          <p className="mt-1 text-sm text-gray-500">Please do not close the app while we are submitting.</p>
        </div>

        <div className="space-y-3">
          {apps
            .filter((a) => !freeOnly || a.status === 'draft')
            .map((app) => {
              const s = statuses[app.id];
              return (
                <div
                  key={app.id}
                  className={[
                    'flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors duration-300',
                    s === 'done'  ? 'border-[#1ec97e]/40 bg-[#f0fdf7]' :
                    s === 'error' ? 'border-red-200 bg-red-50'          :
                    'border-gray-200 bg-white',
                  ].join(' ')}
                >
                  {s === 'done'       && <CheckCircle2 size={18} className="text-[#1ec97e] shrink-0" />}
                  {s === 'error'      && <AlertTriangle size={18} className="text-amber-500 shrink-0" />}
                  {s === 'submitting' && <Spinner />}
                  {s === 'pending'    && <span className="h-4 w-4 rounded-full border-2 border-gray-200 shrink-0" />}

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {app.university_name}
                    </p>
                    {s === 'done' && references[app.id] && (
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {references[app.id]}
                      </p>
                    )}
                    {s === 'submitting' && (
                      <p className="text-xs text-gray-400 mt-0.5">Submitting…</p>
                    )}
                    {s === 'error' && (
                      <p className="text-xs text-amber-600 mt-0.5">Could not submit — please try again</p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-lg py-8">
      <div className="text-center mb-8">
        <BigTick />
        <h1 className="text-2xl font-bold text-gray-900">You are all done</h1>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          We have submitted <strong>{doneCount}</strong> application{doneCount !== 1 ? 's' : ''} on your behalf.
          {errorCount === 0
            ? " You will receive a confirmation email shortly. Good luck — you've got this."
            : ` ${errorCount} application${errorCount !== 1 ? 's' : ''} could not be submitted — please try again from your dashboard.`
          }
        </p>
      </div>

      {/* Reference numbers */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-6">
        <div className="bg-[#0b4f6c]/5 px-4 py-2.5 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Your reference numbers
          </span>
        </div>
        <div className="divide-y divide-gray-50">
          {apps.map((app) => {
            const ref = references[app.id];
            const s   = statuses[app.id];
            return (
              <div key={app.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  {s === 'done'
                    ? <CheckCircle2 size={14} className="text-[#1ec97e] shrink-0" />
                    : <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                  }
                  <span className="text-sm text-gray-800 truncate">{app.university_name}</span>
                </div>
                {ref
                  ? <span className="text-xs font-mono text-gray-500 shrink-0">{ref}</span>
                  : <span className="text-xs text-amber-500 shrink-0">Failed</span>
                }
              </div>
            );
          })}
        </div>
      </div>

      <Link
        href="/dashboard"
        className="flex items-center justify-center w-full rounded-xl bg-[#0b4f6c] py-3.5 text-sm font-bold text-white hover:bg-[#093d54] active:scale-[0.98] transition-all"
      >
        Go to my dashboard
      </Link>
    </div>
  );
}

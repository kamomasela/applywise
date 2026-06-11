import Link from 'next/link';
import { Clock, AlertTriangle, Star, X, CheckCircle2, ChevronRight } from 'lucide-react';
import type { ApplicationStatus } from '@/types';

// ── Status badge config ───────────────────────────────────────────────────────

type StatusConfig = {
  label: string;
  pill: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon?: React.ComponentType<any>;
};

const STATUS: Record<string, StatusConfig> = {
  draft: {
    label: 'Draft',
    pill:  'bg-gray-100 text-gray-600',
  },
  submitted: {
    label: 'Submitted',
    pill:  'bg-[#0b4f6c]/10 text-[#0b4f6c]',
    Icon:  CheckCircle2,
  },
  under_review: {
    label: 'Under review',
    pill:  'bg-amber-100 text-amber-700',
    Icon:  Clock,
  },
  additional_docs_required: {
    label: 'Action needed',
    pill:  'bg-red-100 text-red-600',
    Icon:  AlertTriangle,
  },
  offer_received: {
    label: 'Offer received',
    pill:  'bg-[#1ec97e]/15 text-[#0a8a54]',
    Icon:  Star,
  },
  unsuccessful: {
    label: 'Unsuccessful',
    pill:  'bg-gray-100 text-gray-500',
    Icon:  X,
  },
  accepted: {
    label: 'Accepted',
    pill:  'bg-[#1ec97e] text-white',
    Icon:  CheckCircle2,
  },
};

// ── Logo placeholder ──────────────────────────────────────────────────────────

function LogoPlaceholder({ abbreviation }: { abbreviation: string }) {
  return (
    <div className="h-10 w-10 shrink-0 rounded-lg bg-[#0b4f6c] flex items-center justify-center">
      <span className="text-[10px] font-bold text-white leading-none">
        {abbreviation.slice(0, 3)}
      </span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface AppStatusCardProps {
  id: string;
  universityName: string;
  universityAbbreviation: string;
  logoUrl: string | null;
  programmeName: string | null;
  submissionDate: string | null;
  status: ApplicationStatus | 'draft';
}

export default function AppStatusCard({
  id,
  universityName,
  universityAbbreviation,
  logoUrl,
  programmeName,
  submissionDate,
  status,
}: AppStatusCardProps) {
  const cfg  = STATUS[status] ?? STATUS.draft;
  const Icon = cfg.Icon;

  const dateLabel = submissionDate
    ? new Date(submissionDate).toLocaleDateString('en-ZA', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : null;

  return (
    <Link
      href={`/applications/${id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        {/* Logo / placeholder */}
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={universityAbbreviation}
            className="h-10 w-10 shrink-0 rounded-lg object-contain border border-gray-100"
          />
        ) : (
          <LogoPlaceholder abbreviation={universityAbbreviation} />
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">{universityName}</p>
          {programmeName && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{programmeName}</p>
          )}
          {dateLabel && (
            <p className="text-xs text-gray-400 mt-0.5">Submitted {dateLabel}</p>
          )}
        </div>

        {/* Chevron */}
        <ChevronRight size={16} className="text-gray-300 shrink-0 mt-0.5" />
      </div>

      {/* Status badge */}
      <div className="mt-3 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.pill}`}
        >
          {Icon && <Icon size={11} />}
          {cfg.label}
        </span>
        <span className="text-xs text-[#0b4f6c] font-medium">View details</span>
      </div>
    </Link>
  );
}

// Export status config for reuse in detail page
export { STATUS as APP_STATUS_CONFIG };

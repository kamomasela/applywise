import { CheckCircle2, AlertCircle, MapPin, Calendar, ExternalLink } from 'lucide-react';
import type { University, Programme } from '@/types';
import { daysUntilClose, isCaoUniversity } from '@/lib/utils/university-match';

interface ApplicationCardProps {
  university: University;
  firstChoice: Programme | null;
  secondChoice: Programme | null;
}

function ProgrammeRow({ label, programme }: { label: string; programme: Programme | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      {programme ? (
        <span className="text-sm text-gray-900">
          {programme.name}
          {programme.qualification_type && (
            <span className="ml-1.5 text-xs text-gray-500">({programme.qualification_type})</span>
          )}
        </span>
      ) : (
        <span className="text-sm text-gray-400 italic">Not selected</span>
      )}
    </div>
  );
}

export default function ApplicationCard({ university, firstChoice, secondChoice }: ApplicationCardProps) {
  const daysLeft = daysUntilClose(university.application_closes);
  const isCao = isCaoUniversity(university.abbreviation);

  const urgencyClass =
    daysLeft === null ? '' :
    daysLeft <= 7  ? 'text-red-600' :
    daysLeft <= 30 ? 'text-amber-600' :
    'text-gray-500';

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-[#0b4f6c] px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-white/60 shrink-0">{university.abbreviation}</span>
          <h2 className="text-sm font-bold text-white truncate">{university.name}</h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isCao && (
            <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
              CAO
            </span>
          )}
          {university.application_fee === 0 ? (
            <span className="rounded-full bg-green-400/20 px-2 py-0.5 text-[10px] font-semibold text-green-200">
              FREE
            </span>
          ) : (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">
              R{university.application_fee}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <MapPin size={12} />
          <span>{university.city}, {university.province}</span>
        </div>

        {/* Programme choices */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ProgrammeRow label="First choice" programme={firstChoice} />
          <ProgrammeRow label="Backup choice" programme={secondChoice} />
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          {daysLeft !== null ? (
            <div className={`flex items-center gap-1.5 text-xs ${urgencyClass}`}>
              <Calendar size={12} />
              {daysLeft <= 0 ? (
                <span className="font-semibold">Closed</span>
              ) : (
                <span>{daysLeft} day{daysLeft !== 1 ? 's' : ''} until close</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar size={12} />
              <span>Closing date TBA</span>
            </div>
          )}

          {university.application_url && (
            <a
              href={university.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[#0b4f6c] font-medium hover:underline"
            >
              Apply portal
              <ExternalLink size={10} />
            </a>
          )}
        </div>

        {/* CAO note */}
        {isCao && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <AlertCircle size={13} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              This university uses the <strong>Central Applications Office (CAO)</strong>. Apply directly via their portal link above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function ReadinessCheck({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {ok ? (
        <CheckCircle2 size={16} className="text-[#1ec97e] shrink-0" />
      ) : (
        <AlertCircle size={16} className="text-amber-500 shrink-0" />
      )}
      <span className={`text-sm ${ok ? 'text-gray-700' : 'text-amber-700'}`}>{label}</span>
    </div>
  );
}

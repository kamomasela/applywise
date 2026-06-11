'use client';

import { MapPin, Calendar, Banknote, GraduationCap, CheckSquare, Square, AlertCircle } from 'lucide-react';
import type { UniversityWithProgrammes, Programme } from '@/types';
import {
  UNIVERSITY_TYPE_LABELS,
  daysUntilClose,
  formatDate,
  isCaoUniversity,
} from '@/lib/utils/university-match';

interface UniversityCardProps {
  university: UniversityWithProgrammes;
  qualifyingProgrammes: Programme[];
  isSelected: boolean;
  isDisabled: boolean;
  learnerAPS: number;
  onToggle: () => void;
}

const TYPE_BADGE_COLOURS: Record<string, string> = {
  traditional:    'bg-blue-100 text-blue-700',
  comprehensive:  'bg-purple-100 text-purple-700',
  technology:     'bg-amber-100 text-amber-700',
  new_generation: 'bg-emerald-100 text-emerald-700',
};

export default function UniversityCard({
  university,
  qualifyingProgrammes,
  isSelected,
  isDisabled,
  learnerAPS,
  onToggle,
}: UniversityCardProps) {
  const days = daysUntilClose(university.application_closes);
  const closingSoon = days !== null && days <= 30 && days >= 0;
  const closed = days !== null && days < 0;
  const isCao = isCaoUniversity(university.abbreviation);
  const shownProgrammes = qualifyingProgrammes.slice(0, 3);
  const extraCount = qualifyingProgrammes.length - 3;

  const cardClass = [
    'relative rounded-xl border-2 p-4 transition-all duration-150 w-full text-left',
    isDisabled
      ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
      : isSelected
        ? 'border-[#0b4f6c] bg-[#f0f7fb] cursor-pointer shadow-sm'
        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm cursor-pointer',
  ].join(' ');

  const Wrapper = isDisabled ? 'div' : 'button';
  const wrapperProps = isDisabled
    ? {}
    : { type: 'button' as const, onClick: onToggle };

  return (
    <div className="group relative">
      <Wrapper className={cardClass} {...wrapperProps}>
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="shrink-0 mt-0.5" aria-hidden="true">
            {isSelected ? (
              <CheckSquare size={22} className="text-[#0b4f6c]" />
            ) : (
              <Square size={22} className={isDisabled ? 'text-gray-300' : 'text-gray-400'} />
            )}
          </div>

          {/* Name + badge */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="rounded-md bg-[#0b4f6c] px-2 py-0.5 text-xs font-bold text-white shrink-0">
                {university.abbreviation}
              </span>
              {isCao && (
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 shrink-0">
                  CAO
                </span>
              )}
              <span className={[
                'rounded-md px-2 py-0.5 text-xs font-medium shrink-0',
                TYPE_BADGE_COLOURS[university.type] ?? 'bg-gray-100 text-gray-600',
              ].join(' ')}>
                {UNIVERSITY_TYPE_LABELS[university.type] ?? university.type}
              </span>
            </div>
            <p className="text-base font-bold text-gray-900 leading-tight">{university.name}</p>
          </div>
        </div>

        {/* Location */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin size={12} className="shrink-0" />
          <span>{university.city}, {university.province}</span>
        </div>

        {/* Qualifying programmes */}
        {!isDisabled && (
          <div className="mt-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <GraduationCap size={13} className="text-[#0b4f6c] shrink-0" />
              <p className="text-xs font-semibold text-gray-600">
                {qualifyingProgrammes.length > 0
                  ? 'Qualifying programmes'
                  : 'No qualifying programmes found'}
              </p>
            </div>
            {shownProgrammes.length > 0 && (
              <ul className="space-y-0.5">
                {shownProgrammes.map((p) => (
                  <li key={p.id} className="text-xs text-gray-600 truncate">
                    • {p.name}
                    {p.qualification_type && (
                      <span className="text-gray-400 ml-1">({p.qualification_type})</span>
                    )}
                  </li>
                ))}
                {extraCount > 0 && (
                  <li className="text-xs font-medium text-[#0b4f6c]">+ {extraCount} more</li>
                )}
              </ul>
            )}
          </div>
        )}

        {/* Fee + Closing date */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {/* Fee */}
          <div className="flex items-center gap-1.5">
            <Banknote size={13} className="text-gray-400 shrink-0" />
            {university.application_fee === 0 ? (
              <span className="text-xs font-semibold text-[#1ec97e]">Free</span>
            ) : (
              <span className="text-xs text-gray-600">R{university.application_fee}</span>
            )}
          </div>

          {/* Closing date */}
          {university.application_closes && (
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className={closingSoon || closed ? 'text-[#e63946] shrink-0' : 'text-gray-400 shrink-0'} />
              <span className={[
                'text-xs',
                closed      ? 'font-semibold text-[#e63946]'
                  : closingSoon ? 'font-semibold text-[#e63946]'
                    : 'text-gray-600',
              ].join(' ')}>
                {closed
                  ? 'Closed'
                  : closingSoon
                    ? `Closes in ${days} day${days === 1 ? '' : 's'}`
                    : `Closes ${formatDate(university.application_closes)}`}
              </span>
            </div>
          )}
        </div>
      </Wrapper>

      {/* Disabled tooltip */}
      {isDisabled && (
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full z-50 hidden group-hover:flex w-72 max-w-[calc(100vw-2rem)] items-start gap-2 rounded-lg bg-gray-900 px-3 py-2.5 text-xs leading-relaxed text-white shadow-xl"
          role="tooltip"
        >
          <AlertCircle size={13} className="shrink-0 mt-0.5 text-[#f5a623]" />
          <span>
            Your APS score of <strong>{learnerAPS}</strong> does not meet the minimum
            requirement of <strong>{university.min_aps}</strong> for this university.
          </span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

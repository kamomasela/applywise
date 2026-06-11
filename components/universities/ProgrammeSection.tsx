'use client';

import { useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import type { UniversityWithProgrammes, Programme } from '@/types';
import { UNIVERSITY_CAMPUSES } from '@/lib/utils/university-match';

interface ProgrammeSectionProps {
  university: UniversityWithProgrammes;
  qualifyingProgrammes: Programme[];
  hasPureMaths: boolean;
  initialFirstChoiceId: string | null;
  initialSecondChoiceId: string | null;
  initialCampus: string | null;
  onChange: (data: {
    firstChoiceId: string | null;
    secondChoiceId: string | null;
    campus: string | null;
  }) => void;
}

function formatProgrammeLabel(p: Programme): string {
  const parts = [p.name];
  if (p.qualification_type) parts.push(`(${p.qualification_type})`);
  if (p.min_aps) parts.push(`— min APS ${p.min_aps}`);
  return parts.join(' ');
}

export default function ProgrammeSection({
  university,
  qualifyingProgrammes,
  hasPureMaths,
  initialFirstChoiceId,
  initialSecondChoiceId,
  initialCampus,
  onChange,
}: ProgrammeSectionProps) {
  const [firstChoiceId, setFirstChoiceId]   = useState<string | null>(initialFirstChoiceId);
  const [secondChoiceId, setSecondChoiceId] = useState<string | null>(initialSecondChoiceId);
  const [campus, setCampus]                 = useState<string | null>(initialCampus);

  const campusOptions = UNIVERSITY_CAMPUSES[university.abbreviation] ?? [];

  const firstChoice  = qualifyingProgrammes.find((p) => p.id === firstChoiceId)  ?? null;
  const secondChoice = qualifyingProgrammes.find((p) => p.id === secondChoiceId) ?? null;

  const warnFirstMaths  = firstChoice?.requires_pure_maths  && !hasPureMaths;
  const warnSecondMaths = secondChoice?.requires_pure_maths && !hasPureMaths;

  const update = (patch: { firstChoiceId?: string | null; secondChoiceId?: string | null; campus?: string | null }) => {
    const next = {
      firstChoiceId:  'firstChoiceId'  in patch ? patch.firstChoiceId!  : firstChoiceId,
      secondChoiceId: 'secondChoiceId' in patch ? patch.secondChoiceId! : secondChoiceId,
      campus:         'campus'         in patch ? patch.campus!         : campus,
    };
    onChange(next);
  };

  const selectClass = [
    'w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900',
    'focus:outline-none focus:ring-2 focus:ring-[#0b4f6c] focus:border-transparent',
  ].join(' ');

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* University heading */}
      <div className="bg-[#0b4f6c] px-4 py-3 flex items-center gap-2">
        <span className="text-xs font-bold text-white/60">{university.abbreviation}</span>
        <h2 className="text-sm font-bold text-white truncate">{university.name}</h2>
      </div>

      <div className="p-4 space-y-4">
        {qualifyingProgrammes.length === 0 ? (
          <div className="flex items-start gap-2 rounded-lg bg-gray-50 border border-gray-200 p-3">
            <Info size={15} className="text-gray-400 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-500">
              No programme data is available for this university yet. You can still proceed —
              we will contact the university directly for programme information.
            </p>
          </div>
        ) : (
          <>
            {/* First choice */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 block">
                First choice programme
              </label>
              <select
                className={selectClass}
                value={firstChoiceId ?? ''}
                onChange={(e) => {
                  const id = e.target.value || null;
                  setFirstChoiceId(id);
                  // Clear second if same
                  if (id && id === secondChoiceId) {
                    setSecondChoiceId(null);
                    update({ firstChoiceId: id, secondChoiceId: null });
                  } else {
                    update({ firstChoiceId: id });
                  }
                }}
              >
                <option value="">Select your first choice…</option>
                {qualifyingProgrammes.map((p) => (
                  <option key={p.id} value={p.id}>{formatProgrammeLabel(p)}</option>
                ))}
              </select>
              {warnFirstMaths && (
                <div className="flex items-start gap-2 rounded-lg border border-[#f5a623]/40 bg-[#f5a623]/10 px-3 py-2">
                  <AlertTriangle size={14} className="shrink-0 text-[#f5a623] mt-0.5" />
                  <p className="text-xs text-gray-700">
                    This programme requires <strong>Pure Mathematics</strong>. Your results show
                    Mathematical Literacy. Please check with the university before submitting.
                  </p>
                </div>
              )}
            </div>

            {/* Second choice */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 block">
                Backup choice programme
              </label>
              <select
                className={selectClass}
                value={secondChoiceId ?? ''}
                onChange={(e) => {
                  const id = e.target.value || null;
                  setSecondChoiceId(id);
                  update({ secondChoiceId: id });
                }}
              >
                <option value="">Select a backup choice… (optional)</option>
                {qualifyingProgrammes
                  .filter((p) => p.id !== firstChoiceId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>{formatProgrammeLabel(p)}</option>
                  ))}
              </select>
              {warnSecondMaths && (
                <div className="flex items-start gap-2 rounded-lg border border-[#f5a623]/40 bg-[#f5a623]/10 px-3 py-2">
                  <AlertTriangle size={14} className="shrink-0 text-[#f5a623] mt-0.5" />
                  <p className="text-xs text-gray-700">
                    This programme requires <strong>Pure Mathematics</strong>. Your results show
                    Mathematical Literacy. Please check with the university before submitting.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Campus preference */}
        {campusOptions.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">
              Campus preference
            </label>
            <select
              className={selectClass}
              value={campus ?? ''}
              onChange={(e) => {
                const val = e.target.value || null;
                setCampus(val);
                update({ campus: val });
              }}
            >
              <option value="">No preference</option>
              {campusOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

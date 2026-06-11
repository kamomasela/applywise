'use client';

import { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

import { createClient } from '@/lib/supabase/client';
import type { UniversityWithProgrammes } from '@/types';
import {
  qualifiesForUniversity,
  getQualifyingProgrammes,
  isCaoUniversity,
} from '@/lib/utils/university-match';

import UniversityCard from './UniversityCard';
import FilterBar, { type FilterState } from './FilterBar';
import SelectionBar from './SelectionBar';
import CAOModal from './CAOModal';

const MAX_SELECTIONS = 7;

interface UniversitySelectorProps {
  universities: UniversityWithProgrammes[];
  userId: string;
  apsScore: number;
  hasPureMaths: boolean;
  initialSelectedIds: string[];
}

export default function UniversitySelector({
  universities,
  userId,
  apsScore,
  hasPureMaths,
  initialSelectedIds,
}: UniversitySelectorProps) {
  const supabase = createClient();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds));
  const [caoAcknowledged, setCaoAcknowledged] = useState(false);
  const [pendingCaoId, setPendingCaoId] = useState<string | null>(null);
  const [showCaoModal, setShowCaoModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ province: '', freeOnly: false, showAll: false });

  // Pre-compute qualifying programmes per university
  const universityData = useMemo(() =>
    universities.map((u) => ({
      university: u,
      qualifies: qualifiesForUniversity(u.min_aps, apsScore),
      qualifyingProgrammes: getQualifyingProgrammes(u.programmes ?? [], apsScore, hasPureMaths),
    })),
    [universities, apsScore, hasPureMaths]
  );

  const addUniversity = useCallback(async (id: string) => {
    setSelectedIds((prev) => new Set([...prev, id]));
    const { error } = await supabase.from('applications').upsert(
      { profile_id: userId, university_id: id, status: 'draft' },
      { onConflict: 'profile_id,university_id' }
    );
    if (error) toast.error('Could not save selection. Please try again.');
  }, [supabase, userId]);

  const removeUniversity = useCallback(async (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    await supabase
      .from('applications')
      .delete()
      .eq('profile_id', userId)
      .eq('university_id', id)
      .eq('status', 'draft');
  }, [supabase, userId]);

  const handleToggle = useCallback(async (university: UniversityWithProgrammes, qualifies: boolean) => {
    if (!qualifies) return;
    const { id, abbreviation } = university;
    const isSelected = selectedIds.has(id);

    if (!isSelected) {
      if (selectedIds.size >= MAX_SELECTIONS) {
        toast.error('You can select a maximum of 7 universities.');
        return;
      }
      if (isCaoUniversity(abbreviation) && !caoAcknowledged) {
        setPendingCaoId(id);
        setShowCaoModal(true);
        return;
      }
      await addUniversity(id);
    } else {
      await removeUniversity(id);
    }
  }, [selectedIds, caoAcknowledged, addUniversity, removeUniversity]);

  const handleCaoConfirm = useCallback(async () => {
    setCaoAcknowledged(true);
    setShowCaoModal(false);
    if (pendingCaoId) {
      await addUniversity(pendingCaoId);
      setPendingCaoId(null);
    }
  }, [pendingCaoId, addUniversity]);

  // Apply filters
  const filtered = useMemo(() => {
    return universityData.filter(({ university, qualifies }) => {
      if (filters.province && university.province !== filters.province) return false;
      if (filters.freeOnly && university.application_fee !== 0) return false;
      if (!filters.showAll && !qualifies && !selectedIds.has(university.id)) return false;
      return true;
    });
  }, [universityData, filters, selectedIds]);

  const qualifying   = filtered.filter((d) => d.qualifies);
  const nonQualifying = filtered.filter((d) => !d.qualifies);

  return (
    <>
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-3 mb-4">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      <div className="space-y-3 pb-36">
        {/* Qualifying universities */}
        {qualifying.length === 0 && nonQualifying.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            No universities match your current filters.
          </div>
        )}

        {qualifying.map(({ university, qualifyingProgrammes }) => (
          <UniversityCard
            key={university.id}
            university={university}
            qualifyingProgrammes={qualifyingProgrammes}
            isSelected={selectedIds.has(university.id)}
            isDisabled={false}
            learnerAPS={apsScore}
            onToggle={() => handleToggle(university, true)}
          />
        ))}

        {/* Non-qualifying section */}
        {nonQualifying.length > 0 && (
          <>
            <div className="pt-4 pb-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Universities you don&apos;t yet qualify for
              </p>
            </div>
            {nonQualifying.map(({ university, qualifyingProgrammes }) => (
              <UniversityCard
                key={university.id}
                university={university}
                qualifyingProgrammes={qualifyingProgrammes}
                isSelected={false}
                isDisabled={true}
                learnerAPS={apsScore}
                onToggle={() => {}}
              />
            ))}
          </>
        )}
      </div>

      {/* Fixed bottom bar */}
      <SelectionBar count={selectedIds.size} />

      {/* CAO modal */}
      {showCaoModal && (
        <CAOModal
          onConfirm={handleCaoConfirm}
          onDismiss={() => { setShowCaoModal(false); setPendingCaoId(null); }}
        />
      )}
    </>
  );
}

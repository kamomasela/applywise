import type { Programme } from '@/types';

/** Abbreviations of universities that process via the Central Applications Office */
export const CAO_ABBREVIATIONS = ['UKZN', 'DUT', 'MUT'] as const;

/** Map of universities with multiple campuses → their campus options */
export const UNIVERSITY_CAMPUSES: Record<string, string[]> = {
  NWU:  ['Potchefstroom Campus', 'Mahikeng Campus', 'Vaal Campus (Vanderbijlpark)'],
  UKZN: ['Howard College (Durban)', 'Westville (Durban)', 'Pietermaritzburg', 'Medical School (Durban)'],
  NMU:  ['South Campus (Summerstrand)', 'North Campus (Gardham)'],
  WSU:  ['Mthatha Campus', 'East London Campus', 'Buffalo City Campus'],
  Wits: ['East Campus', 'West Campus', 'Medical Campus (Parktown)'],
};

export const UNIVERSITY_TYPE_LABELS: Record<string, string> = {
  traditional:   'Traditional University',
  comprehensive: 'Comprehensive University',
  technology:    'University of Technology',
  new_generation:'New Generation University',
};

export function qualifiesForUniversity(minAPS: number | null, apsScore: number): boolean {
  if (minAPS === null || minAPS === 0) return true;
  return apsScore >= minAPS;
}

export function getQualifyingProgrammes(
  programmes: Programme[],
  apsScore: number,
  hasPureMaths: boolean,
): Programme[] {
  return programmes.filter((p) => {
    if (p.min_aps !== null && apsScore < p.min_aps) return false;
    if (p.requires_pure_maths && !hasPureMaths) return false;
    return true;
  });
}

/** Returns days until closing date (negative = already closed). Null if no date set. */
export function daysUntilClose(closeDate: string | null): number | null {
  if (!closeDate) return null;
  const diff = new Date(closeDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export function isCaoUniversity(abbreviation: string): boolean {
  return (CAO_ABBREVIATIONS as readonly string[]).includes(abbreviation);
}

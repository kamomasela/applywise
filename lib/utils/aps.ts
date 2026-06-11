/** Converts a percentage mark to an NSC achievement level (1–7). */
export function getLevel(mark: number): number {
  if (mark >= 80) return 7;
  if (mark >= 70) return 6;
  if (mark >= 60) return 5;
  if (mark >= 50) return 4;
  if (mark >= 40) return 3;
  if (mark >= 30) return 2;
  return 1;
}

export interface SubjectEntry {
  subject_name: string;
  mark: number | string;
}

/**
 * Calculates total APS from a list of subjects.
 * Life Orientation is excluded per most university policies.
 */
export function calculateAPS(subjects: SubjectEntry[]): number {
  return subjects
    .filter((s) => s.subject_name && s.subject_name !== 'Life Orientation')
    .reduce((sum, s) => {
      const mark = typeof s.mark === 'string' ? parseFloat(s.mark) : s.mark;
      return sum + (isNaN(mark) ? 0 : getLevel(mark));
    }, 0);
}

/** Returns the APS points for a single subject (LO = 0 in APS context). */
export function getAPS(subjectName: string, mark: number | string): number {
  if (subjectName === 'Life Orientation') return 0;
  const m = typeof mark === 'string' ? parseFloat(mark) : mark;
  return isNaN(m) ? 0 : getLevel(m);
}

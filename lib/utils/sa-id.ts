/** Validates the check digit using the Luhn algorithm */
function luhnValid(id: string): boolean {
  const digits = id.split('').map(Number);
  const check = digits.pop()!;
  const sum = digits
    .reverse()
    .map((d, i) => (i % 2 === 0 ? (d * 2 > 9 ? d * 2 - 9 : d * 2) : d))
    .reduce((a, b) => a + b, 0);
  return (10 - (sum % 10)) % 10 === check;
}

export interface SAIDResult {
  valid: boolean;
  dateOfBirth: string | null;   // ISO: YYYY-MM-DD
  gender: 'male' | 'female' | null;
  isCitizen: boolean | null;
}

/**
 * Parses a South African 13-digit ID number.
 * Format: YYMMDD G SSS C A Z
 *   YYMMDD — date of birth
 *   G      — 0–4 female, 5–9 male
 *   SSS    — sequence
 *   C      — 0 = SA citizen, 1 = permanent resident
 *   A      — formerly 8, now 0
 *   Z      — Luhn check digit
 */
export function parseSAID(id: string): SAIDResult {
  const empty: SAIDResult = { valid: false, dateOfBirth: null, gender: null, isCitizen: null };

  if (!/^\d{13}$/.test(id)) return empty;
  if (!luhnValid(id)) return empty;

  const yy = parseInt(id.slice(0, 2), 10);
  const mm = parseInt(id.slice(2, 4), 10);
  const dd = parseInt(id.slice(4, 6), 10);
  const g  = parseInt(id[6], 10);
  const c  = parseInt(id[10], 10);

  // Grade 12 learners are born 2005–2009; century cutoff at current century
  const year = yy <= 30 ? 2000 + yy : 1900 + yy;

  // Validate the date
  const dob = new Date(year, mm - 1, dd);
  if (dob.getFullYear() !== year || dob.getMonth() !== mm - 1 || dob.getDate() !== dd) {
    return empty;
  }

  return {
    valid: true,
    dateOfBirth: `${year}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`,
    gender: g >= 5 ? 'male' : 'female',
    isCitizen: c === 0,
  };
}

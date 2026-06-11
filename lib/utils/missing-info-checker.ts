import type { University, Programme } from '@/types';

// ── Types ───────────────────────────────────────────────────────────────────

export type MissingItemType =
  | 'motivation_letter'
  | 'portfolio'
  | 'parental_consent'
  | 'language_declaration';

export interface MissingItem {
  item_type: MissingItemType;
  /** Human-readable label: "Motivation letter" */
  item_label: string;
  /** Call-to-action label: "Upload now" */
  action_label: string;
  /**
   * Either a route path ('/profile/step-5') or an inline sentinel
   * ('inline:parental_consent' | 'inline:language_declaration').
   */
  action_url: string;
}

export interface UniversityCheckResult {
  university_id: string;
  university_name: string;
  university_abbreviation: string;
  missing_items: MissingItem[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function isUnder18(dateOfBirth: string | null): boolean {
  if (!dateOfBirth) return false;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age < 18;
}

// ── Main checker ─────────────────────────────────────────────────────────────

interface ApplicationEntry {
  university: University;
  firstChoiceProgramme: Programme | null;
  secondChoiceProgramme: Programme | null;
}

/**
 * Cross-references the learner's uploaded documents against each university's
 * requirements. Returns one result per application (same order as input).
 *
 * @param dateOfBirth   ISO date string from profiles.date_of_birth (or null)
 * @param uploadedDocTypes  All document_type values already uploaded by the learner
 * @param applications  Draft applications enriched with university + programme data
 */
export function checkMissingInfo({
  dateOfBirth,
  uploadedDocTypes,
  applications,
}: {
  dateOfBirth: string | null;
  uploadedDocTypes: string[];
  applications: ApplicationEntry[];
}): UniversityCheckResult[] {
  const under18 = isUnder18(dateOfBirth);
  const docs = new Set(uploadedDocTypes);

  return applications.map(({ university }) => {
    const missing: MissingItem[] = [];

    // ── Motivation letter ───────────────────────────────────────────────────
    if (university.requires_motivation_letter && !docs.has('motivation_letter')) {
      missing.push({
        item_type:    'motivation_letter',
        item_label:   'Motivation letter',
        action_label: 'Upload now',
        action_url:   '/profile/step-5',
      });
    }

    // ── Portfolio ───────────────────────────────────────────────────────────
    if (university.requires_portfolio && !docs.has('portfolio')) {
      missing.push({
        item_type:    'portfolio',
        item_label:   'Portfolio',
        action_label: 'Upload now',
        action_url:   '/profile/step-5',
      });
    }

    // ── Parental consent (only flagged when learner is confirmed under 18) ──
    if (university.requires_parental_consent && under18 && !docs.has('parental_consent')) {
      missing.push({
        item_type:    'parental_consent',
        item_label:   'Parental consent form (signed)',
        action_label: 'Download & upload',
        action_url:   'inline:parental_consent',
      });
    }

    // ── Language declaration ────────────────────────────────────────────────
    if (university.language_declaration_required && !docs.has('language_declaration')) {
      missing.push({
        item_type:    'language_declaration',
        item_label:   'Language declaration form',
        action_label: 'Download & upload',
        action_url:   'inline:language_declaration',
      });
    }

    return {
      university_id:           university.id,
      university_name:         university.name,
      university_abbreviation: university.abbreviation,
      missing_items:           missing,
    };
  });
}

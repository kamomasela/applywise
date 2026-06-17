export const SA_PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape',
] as const;

export type SAProvince = (typeof SA_PROVINCES)[number];

export const SA_LANGUAGES = [
  'Afrikaans',
  'English',
  'isiNdebele',
  'isiXhosa',
  'isiZulu',
  'Sepedi',
  'Sesotho',
  'Setswana',
  'siSwati',
  'Tshivenda',
  'Xitsonga',
] as const;

export const GENDER_OPTIONS = [
  { value: 'male',             label: 'Male' },
  { value: 'female',           label: 'Female' },
  { value: 'non_binary',       label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export const RACE_OPTIONS = [
  { value: 'african',          label: 'Black African' },
  { value: 'coloured',         label: 'Coloured' },
  { value: 'indian',           label: 'Indian / Asian' },
  { value: 'white',            label: 'White' },
  { value: 'other',            label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export const GUARDIAN_RELATIONSHIP_OPTIONS = [
  { value: 'parent',   label: 'Mother' },
  { value: 'parent',   label: 'Father' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'other',    label: 'Other' },
] as const;

export const GUARDIAN_RELATIONSHIPS = [
  { value: 'mother',   label: 'Mother' },
  { value: 'father',   label: 'Father' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'other',    label: 'Other' },
] as const;

export const HOUSEHOLD_INCOME_OPTIONS = [
  { value: 'below_r5000',   label: 'Less than R5 000 per month' },
  { value: 'r5000_r10000',  label: 'R5 000 – R10 000 per month' },
  { value: 'r10000_r20000', label: 'R10 000 – R20 000 per month' },
  { value: 'r20000_r40000', label: 'R20 000 – R40 000 per month' },
  { value: 'above_r40000',  label: 'More than R40 000 per month' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

/** Income values where user clearly earns more than R29 000/month (NSFAS threshold). */
export const HIGH_INCOME_VALUES = ['above_r40000'] as const;

export const RESULT_TYPES = [
  { value: 'grade11_final',    label: 'Grade 11 Final Results' },
  { value: 'grade12_midyear', label: 'Grade 12 Mid-Year (Term 2) Results' },
  { value: 'grade12_final',   label: 'Grade 12 Final Results' },
] as const;

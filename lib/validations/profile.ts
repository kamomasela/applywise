import { z } from 'zod';
import { parseSAID } from '@/lib/utils/sa-id';

// ── Step 1 — Personal ─────────────────────────────────────────
export const step1Schema = z.object({
  first_name:    z.string().min(1, 'First name is required'),
  last_name:     z.string().min(1, 'Last name is required'),
  id_number:     z
    .string()
    .regex(/^\d{13}$/, 'ID number must be exactly 13 digits')
    .refine((val) => parseSAID(val).valid, 'Please enter a valid South African ID number'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender:        z.string().min(1, 'Please select a gender'),
  race:          z.string().min(1, 'Please select an option'),
  home_language: z.string().min(1, 'Please select a home language'),
  nationality:   z.string().min(1, 'Nationality is required'),
});

export type Step1Data = z.infer<typeof step1Schema>;

// ── Step 2 — Contact ──────────────────────────────────────────
const addressSchema = z.object({
  street:      z.string().min(1, 'Street address is required'),
  suburb:      z.string().min(1, 'Suburb is required'),
  city:        z.string().min(1, 'City is required'),
  postal_code: z.string().regex(/^\d{4}$/, 'Postal code must be 4 digits'),
});

export const step2Schema = z.object({
  email:                   z.string().email('Please enter a valid email address'),
  phone:                   z
    .string()
    .regex(/^(\+27|0)[6-8]\d{8}$/, 'Please enter a valid South African cell number (e.g. 0821234567)'),
  province:                z.string().min(1, 'Please select a province'),
  physical_address:        addressSchema,
  postal_same_as_physical: z.boolean(),
  // Loose schema so an empty default object doesn't fail when postal_same_as_physical is true.
  // Real validation happens in superRefine below.
  postal_address: z.object({
    street:      z.string(),
    suburb:      z.string(),
    city:        z.string(),
    postal_code: z.string(),
  }).optional(),
}).superRefine((data, ctx) => {
  if (data.postal_same_as_physical) return;
  const pa = data.postal_address;
  if (!pa?.street?.trim())
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Street address is required', path: ['postal_address', 'street'] });
  if (!pa?.suburb?.trim())
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Suburb is required', path: ['postal_address', 'suburb'] });
  if (!pa?.city?.trim())
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'City is required', path: ['postal_address', 'city'] });
  if (!pa?.postal_code?.match(/^\d{4}$/))
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Postal code must be 4 digits', path: ['postal_address', 'postal_code'] });
});

export type Step2Data = z.infer<typeof step2Schema>;

// ── Step 3 — Guardian ─────────────────────────────────────────
export const step3Schema = z.object({
  full_name:        z.string().min(1, 'Full name is required'),
  relationship:     z.string().min(1, 'Please select a relationship'),
  phone:            z
    .string()
    .regex(/^(\+27|0)[6-9]\d{8}$/, 'Please enter a valid phone number'),
  email:            z.string().email('Please enter a valid email address'),
  occupation:       z.string().optional(),
  household_income: z.string().min(1, 'Please select an income range'),
  nsfas_applicant:  z.boolean(),
});

export type Step3Data = z.infer<typeof step3Schema>;

// ── Step 4 — Academic ─────────────────────────────────────────
const subjectSchema = z.object({
  subject_name: z.string().min(1, 'Select a subject'),
  mark:         z.number().min(0, 'Mark must be 0–100').max(100, 'Mark must be 0–100'),
});

export const step4Schema = z.object({
  school_name:              z.string().min(1, 'School name is required'),
  school_province:          z.string().min(1, 'Please select a province'),
  school_emis:              z.string().optional(),
  result_type:              z.string().min(1, 'Please select a result type'),
  matric_year:              z.number().int().min(2024).max(2030),
  subjects:                 z
    .array(subjectSchema)
    .min(6, 'Please enter at least 6 subjects')
    .max(7, 'Maximum 7 subjects allowed'),
});

export type Step4Data = z.infer<typeof step4Schema>;

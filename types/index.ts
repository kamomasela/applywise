// ──────────────────────────────────────────────────────────────
// Shared sub-types
// ──────────────────────────────────────────────────────────────

export interface Address {
  street: string;
  suburb: string;
  city: string;
  postal_code: string;
}

export interface Subject {
  subject_name: string;
  mark: number;
  level: number;
  aps_points: number;
}

// ──────────────────────────────────────────────────────────────
// profiles
// ──────────────────────────────────────────────────────────────
export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
export type Race = 'african' | 'coloured' | 'indian' | 'white' | 'other' | 'prefer_not_to_say';
export type Province =
  | 'Eastern Cape'
  | 'Free State'
  | 'Gauteng'
  | 'KwaZulu-Natal'
  | 'Limpopo'
  | 'Mpumalanga'
  | 'Northern Cape'
  | 'North West'
  | 'Western Cape';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  id_number: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  race: Race | null;
  home_language: string | null;
  nationality: string;
  email: string | null;
  phone: string | null;
  province: Province | null;
  physical_address: Address;
  postal_same_as_physical: boolean;
  postal_address: Address;
  is_minor: boolean;
  profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

// ──────────────────────────────────────────────────────────────
// guardian_details
// ──────────────────────────────────────────────────────────────
export type GuardianRelationship = 'parent' | 'guardian' | 'grandparent' | 'sibling' | 'other';
export type HouseholdIncome =
  | 'below_r5000'
  | 'r5000_r10000'
  | 'r10000_r20000'
  | 'r20000_r40000'
  | 'above_r40000';

export interface GuardianDetails {
  id: string;
  profile_id: string;
  full_name: string | null;
  relationship: GuardianRelationship | null;
  phone: string | null;
  email: string | null;
  occupation: string | null;
  household_income: HouseholdIncome | null;
  nsfas_applicant: boolean;
  created_at: string;
}

// ──────────────────────────────────────────────────────────────
// academic_details
// ──────────────────────────────────────────────────────────────
export type ResultType = 'grade11_final' | 'grade12_midyear';

export interface AcademicDetails {
  id: string;
  profile_id: string;
  school_name: string | null;
  school_province: string | null;
  school_emis: string | null;
  result_type: ResultType | null;
  matric_year: number | null;
  subjects: Subject[];
  aps_score: number | null;
  has_pure_mathematics: boolean;
  has_bachelors_endorsement: boolean;
  created_at: string;
  updated_at: string;
}

// ──────────────────────────────────────────────────────────────
// documents
// ──────────────────────────────────────────────────────────────
export type DocumentType =
  | 'id_copy'
  | 'school_report'
  | 'proof_of_residence'
  | 'motivation_letter'
  | 'portfolio'
  | 'parental_consent'
  | 'language_declaration';

export interface Document {
  id: string;
  profile_id: string;
  document_type: DocumentType;
  file_name: string | null;
  file_path: string | null;
  file_size: number | null;
  uploaded_at: string;
  is_verified: boolean;
}

// ──────────────────────────────────────────────────────────────
// universities
// ──────────────────────────────────────────────────────────────
export type UniversityType = 'traditional' | 'comprehensive' | 'technology' | 'new_generation';

export interface University {
  id: string;
  name: string;
  abbreviation: string;
  type: UniversityType;
  province: Province;
  city: string;
  website: string | null;
  application_url: string | null;
  application_fee: number;
  application_opens: string | null;
  application_closes: string | null;
  uses_cao: boolean;
  min_aps: number | null;
  requires_motivation_letter: boolean;
  requires_portfolio: boolean;
  requires_parental_consent: boolean;
  language_declaration_required: boolean;
  logo_url: string | null;
  created_at: string;
}

// ──────────────────────────────────────────────────────────────
// programmes
// ──────────────────────────────────────────────────────────────
export type QualificationType = 'degree' | 'diploma' | 'certificate';

export interface Programme {
  id: string;
  university_id: string;
  name: string;
  faculty: string | null;
  qualification_type: QualificationType | null;
  min_aps: number | null;
  requires_pure_maths: boolean;
  requires_physical_science: boolean;
  requires_life_science: boolean;
  min_english_level: number;
  additional_requirements: Record<string, unknown>;
  created_at: string;
}

// ──────────────────────────────────────────────────────────────
// applications
// ──────────────────────────────────────────────────────────────
export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'additional_docs_required'
  | 'offer_received'
  | 'unsuccessful'
  | 'accepted';

export interface Application {
  id: string;
  profile_id: string;
  university_id: string;
  first_choice_programme_id: string | null;
  second_choice_programme_id: string | null;
  status: ApplicationStatus;
  submission_date: string | null;
  reference_number: string | null;
  missing_items: string[];
  university_response: string | null;
  response_date: string | null;
  application_fee_paid: boolean;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}

// ──────────────────────────────────────────────────────────────
// notifications
// ──────────────────────────────────────────────────────────────
export type NotificationType = 'deadline' | 'status_update' | 'missing_info' | 'offer' | 'general';

export interface Notification {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  related_university_id: string | null;
  created_at: string;
}

// ──────────────────────────────────────────────────────────────
// Joined / view types (for UI components)
// ──────────────────────────────────────────────────────────────
export interface UniversityWithProgrammes extends University {
  programmes: Programme[];
}

export interface ApplicationWithDetails extends Application {
  university: University;
  first_choice_programme: Programme | null;
  second_choice_programme: Programme | null;
}

export interface ApplicationDraft {
  id: string;
  university_id: string;
  first_choice_programme_id: string | null;
  second_choice_programme_id: string | null;
  campus_preference?: string | null;
  status: string;
}

export interface NotificationWithUniversity extends Notification {
  university: University | null;
}

-- ============================================================
-- ApplyWise — Initial Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- HELPER: auto-update updated_at column
-- ──────────────────────────────────────────────────────────────
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- TABLE: profiles
-- ============================================================
create table if not exists public.profiles (
  id                      uuid primary key references auth.users(id) on delete cascade,
  first_name              text,
  last_name               text,
  id_number               text unique,
  date_of_birth           date,
  gender                  text check (gender in ('male', 'female', 'non_binary', 'prefer_not_to_say')),
  race                    text check (race in ('african', 'coloured', 'indian', 'white', 'other', 'prefer_not_to_say')),
  home_language           text,
  nationality             text default 'South African',
  email                   text,
  phone                   text,
  province                text check (province in (
                            'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
                            'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
                          )),
  physical_address        jsonb default '{}'::jsonb,
  -- physical_address shape: { street, suburb, city, postal_code }
  postal_same_as_physical boolean default true,
  postal_address          jsonb default '{}'::jsonb,
  is_minor                boolean default false,
  profile_complete        boolean default false,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at_column();

-- ============================================================
-- TABLE: guardian_details
-- ============================================================
create table if not exists public.guardian_details (
  id                uuid primary key default uuid_generate_v4(),
  profile_id        uuid not null references public.profiles(id) on delete cascade,
  full_name         text,
  relationship      text check (relationship in ('parent', 'guardian', 'grandparent', 'sibling', 'other')),
  phone             text,
  email             text,
  occupation        text,
  household_income  text check (household_income in (
                      'below_r5000', 'r5000_r10000', 'r10000_r20000',
                      'r20000_r40000', 'above_r40000'
                    )),
  nsfas_applicant   boolean default false,
  created_at        timestamptz default now()
);

-- ============================================================
-- TABLE: academic_details
-- ============================================================
create table if not exists public.academic_details (
  id                       uuid primary key default uuid_generate_v4(),
  profile_id               uuid not null references public.profiles(id) on delete cascade,
  school_name              text,
  school_province          text,
  school_emis              text,
  result_type              text check (result_type in ('grade11_final', 'grade12_midyear')),
  matric_year              integer,
  subjects                 jsonb default '[]'::jsonb,
  -- subjects shape: [{ subject_name, mark, level, aps_points }]
  aps_score                integer,
  has_pure_mathematics     boolean default false,
  has_bachelors_endorsement boolean default false,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

create trigger academic_details_updated_at
  before update on public.academic_details
  for each row execute function update_updated_at_column();

-- ============================================================
-- TABLE: documents
-- ============================================================
create table if not exists public.documents (
  id             uuid primary key default uuid_generate_v4(),
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  document_type  text not null check (document_type in (
                   'id_copy', 'school_report', 'proof_of_residence',
                   'motivation_letter', 'portfolio'
                 )),
  file_name      text,
  file_path      text,
  file_size      integer,
  uploaded_at    timestamptz default now(),
  is_verified    boolean default false
);

-- ============================================================
-- TABLE: universities
-- ============================================================
create table if not exists public.universities (
  id                             uuid primary key default uuid_generate_v4(),
  name                           text not null,
  abbreviation                   text not null,
  type                           text not null check (type in ('traditional', 'comprehensive', 'technology', 'new_generation')),
  province                       text not null,
  city                           text not null,
  website                        text,
  application_url                text,
  application_fee                integer default 0,
  application_opens              date,
  application_closes             date,
  uses_cao                       boolean default false,
  min_aps                        integer,
  requires_motivation_letter     boolean default false,
  requires_portfolio             boolean default false,
  requires_parental_consent      boolean default false,
  language_declaration_required  boolean default false,
  logo_url                       text,
  created_at                     timestamptz default now()
);

-- ============================================================
-- TABLE: programmes
-- ============================================================
create table if not exists public.programmes (
  id                          uuid primary key default uuid_generate_v4(),
  university_id               uuid not null references public.universities(id) on delete cascade,
  name                        text not null,
  faculty                     text,
  qualification_type          text check (qualification_type in ('degree', 'diploma', 'certificate')),
  min_aps                     integer,
  requires_pure_maths         boolean default false,
  requires_physical_science   boolean default false,
  requires_life_science       boolean default false,
  min_english_level           integer default 4,
  additional_requirements     jsonb default '{}'::jsonb,
  created_at                  timestamptz default now()
);

-- ============================================================
-- TABLE: applications
-- ============================================================
create table if not exists public.applications (
  id                          uuid primary key default uuid_generate_v4(),
  profile_id                  uuid not null references public.profiles(id) on delete cascade,
  university_id               uuid not null references public.universities(id),
  first_choice_programme_id   uuid references public.programmes(id),
  second_choice_programme_id  uuid references public.programmes(id),
  status                      text not null default 'draft' check (status in (
                                'draft', 'submitted', 'under_review',
                                'additional_docs_required', 'offer_received',
                                'unsuccessful', 'accepted'
                              )),
  submission_date             timestamptz,
  reference_number            text,
  missing_items               jsonb default '[]'::jsonb,
  university_response         text,
  response_date               timestamptz,
  application_fee_paid        boolean default false,
  payment_reference           text,
  created_at                  timestamptz default now(),
  updated_at                  timestamptz default now(),
  unique (profile_id, university_id)
);

create trigger applications_updated_at
  before update on public.applications
  for each row execute function update_updated_at_column();

-- ============================================================
-- TABLE: notifications
-- ============================================================
create table if not exists public.notifications (
  id                     uuid primary key default uuid_generate_v4(),
  profile_id             uuid not null references public.profiles(id) on delete cascade,
  title                  text not null,
  message                text not null,
  type                   text not null check (type in (
                           'deadline', 'status_update', 'missing_info', 'offer', 'general'
                         )),
  is_read                boolean default false,
  related_university_id  uuid references public.universities(id),
  created_at             timestamptz default now()
);

-- ============================================================
-- TRIGGER: auto-create profile on auth.users insert
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles          enable row level security;
alter table public.guardian_details  enable row level security;
alter table public.academic_details  enable row level security;
alter table public.documents         enable row level security;
alter table public.universities      enable row level security;
alter table public.programmes        enable row level security;
alter table public.applications      enable row level security;
alter table public.notifications     enable row level security;

-- ── profiles ──────────────────────────────────────────────────
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── guardian_details ──────────────────────────────────────────
create policy "Users can view their own guardian details"
  on public.guardian_details for select
  using (auth.uid() = profile_id);

create policy "Users can insert their own guardian details"
  on public.guardian_details for insert
  with check (auth.uid() = profile_id);

create policy "Users can update their own guardian details"
  on public.guardian_details for update
  using (auth.uid() = profile_id);

create policy "Users can delete their own guardian details"
  on public.guardian_details for delete
  using (auth.uid() = profile_id);

-- ── academic_details ──────────────────────────────────────────
create policy "Users can view their own academic details"
  on public.academic_details for select
  using (auth.uid() = profile_id);

create policy "Users can insert their own academic details"
  on public.academic_details for insert
  with check (auth.uid() = profile_id);

create policy "Users can update their own academic details"
  on public.academic_details for update
  using (auth.uid() = profile_id);

-- ── documents ─────────────────────────────────────────────────
create policy "Users can view their own documents"
  on public.documents for select
  using (auth.uid() = profile_id);

create policy "Users can upload their own documents"
  on public.documents for insert
  with check (auth.uid() = profile_id);

create policy "Users can delete their own documents"
  on public.documents for delete
  using (auth.uid() = profile_id);

-- ── universities (public read, no write for regular users) ────
create policy "Universities are publicly readable"
  on public.universities for select
  using (true);

-- ── programmes (public read) ──────────────────────────────────
create policy "Programmes are publicly readable"
  on public.programmes for select
  using (true);

-- ── applications ──────────────────────────────────────────────
create policy "Users can view their own applications"
  on public.applications for select
  using (auth.uid() = profile_id);

create policy "Users can create their own applications"
  on public.applications for insert
  with check (auth.uid() = profile_id);

create policy "Users can update their own applications"
  on public.applications for update
  using (auth.uid() = profile_id);

create policy "Users can delete draft applications"
  on public.applications for delete
  using (auth.uid() = profile_id and status = 'draft');

-- ── notifications ─────────────────────────────────────────────
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = profile_id);

create policy "Users can mark their own notifications as read"
  on public.notifications for update
  using (auth.uid() = profile_id);

-- ============================================================
-- SEED: 26 South African Public Universities
-- Note: fees and dates are accurate as of the 2025 application
-- cycle. Verify on each university's official website annually.
-- ============================================================

insert into public.universities (
  name, abbreviation, type, province, city,
  website, application_url,
  application_fee, application_opens, application_closes,
  uses_cao, min_aps,
  requires_motivation_letter, requires_portfolio,
  requires_parental_consent, language_declaration_required
) values

-- ── TRADITIONAL UNIVERSITIES ──────────────────────────────────

(
  'University of Cape Town', 'UCT', 'traditional',
  'Western Cape', 'Cape Town',
  'https://www.uct.ac.za', 'https://apply.uct.ac.za',
  100, '2025-04-01', '2025-09-30',
  false, 36,
  false, false, false, false
),
(
  'University of the Witwatersrand', 'Wits', 'traditional',
  'Gauteng', 'Johannesburg',
  'https://www.wits.ac.za', 'https://www.wits.ac.za/students/applications/',
  100, '2025-03-01', '2025-09-30',
  false, 42,
  false, false, false, false
),
(
  'Stellenbosch University', 'SU', 'traditional',
  'Western Cape', 'Stellenbosch',
  'https://www.sun.ac.za', 'https://www.sun.ac.za/english/faculty/apply',
  100, '2025-03-01', '2025-06-30',
  false, 35,
  false, false, false, true
),
(
  'University of Pretoria', 'UP', 'traditional',
  'Gauteng', 'Pretoria',
  'https://www.up.ac.za', 'https://www.up.ac.za/apply',
  300, '2025-03-01', '2025-06-30',
  false, 30,
  false, false, false, false
),
(
  'University of KwaZulu-Natal', 'UKZN', 'traditional',
  'KwaZulu-Natal', 'Durban',
  'https://www.ukzn.ac.za', 'https://sms.ukzn.ac.za',
  200, '2025-04-01', '2025-09-30',
  false, 30,
  false, false, false, false
),
(
  'University of the Free State', 'UFS', 'traditional',
  'Free State', 'Bloemfontein',
  'https://www.ufs.ac.za', 'https://www.ufs.ac.za/apply',
  200, '2025-03-01', '2025-09-30',
  false, 30,
  false, false, false, false
),
(
  'Rhodes University', 'RU', 'traditional',
  'Eastern Cape', 'Makhanda',
  'https://www.ru.ac.za', 'https://applications.ru.ac.za',
  100, '2025-04-01', '2025-09-30',
  false, 32,
  false, false, false, false
),
(
  'University of the Western Cape', 'UWC', 'traditional',
  'Western Cape', 'Bellville',
  'https://www.uwc.ac.za', 'https://apply.uwc.ac.za',
  100, '2025-04-01', '2025-09-30',
  false, 25,
  false, false, false, false
),
(
  'University of Fort Hare', 'UFH', 'traditional',
  'Eastern Cape', 'Alice',
  'https://www.ufh.ac.za', 'https://www.ufh.ac.za/students/applying-ufh',
  100, '2025-04-01', '2025-09-30',
  false, 25,
  false, false, false, false
),
(
  'University of Limpopo', 'UL', 'traditional',
  'Limpopo', 'Polokwane',
  'https://www.ul.ac.za', 'https://enrol.ul.ac.za',
  200, '2025-03-01', '2025-09-30',
  false, 25,
  false, false, false, false
),
(
  'University of Venda', 'UNIVEN', 'traditional',
  'Limpopo', 'Thohoyandou',
  'https://www.univen.ac.za', 'https://www.univen.ac.za/online-application',
  200, '2025-04-01', '2025-09-30',
  false, 24,
  false, false, false, false
),

-- ── COMPREHENSIVE UNIVERSITIES ────────────────────────────────

(
  'University of Zululand', 'UNIZULU', 'comprehensive',
  'KwaZulu-Natal', 'Empangeni',
  'https://www.unizulu.ac.za', 'https://www.unizulu.ac.za/application',
  100, '2025-04-01', '2025-09-30',
  false, 24,
  false, false, false, false
),
(
  'Nelson Mandela University', 'NMU', 'comprehensive',
  'Eastern Cape', 'Gqeberha',
  'https://www.mandela.ac.za', 'https://www.mandela.ac.za/Apply',
  100, '2025-04-01', '2025-09-30',
  false, 28,
  false, false, false, false
),
(
  'North-West University', 'NWU', 'comprehensive',
  'North West', 'Mahikeng',
  'https://www.nwu.ac.za', 'https://nwuapplication.nwu.ac.za',
  100, '2025-03-01', '2025-09-30',
  false, 28,
  false, false, false, false
),
(
  'University of Johannesburg', 'UJ', 'comprehensive',
  'Gauteng', 'Johannesburg',
  'https://www.uj.ac.za', 'https://student.uj.ac.za/prospective',
  200, '2025-03-01', '2025-09-30',
  false, 28,
  false, false, false, false
),
(
  'University of South Africa', 'UNISA', 'comprehensive',
  'Gauteng', 'Pretoria',
  'https://www.unisa.ac.za', 'https://my.unisa.ac.za',
  135, '2025-08-01', '2025-10-31',
  false, 0,
  false, false, false, false
),
(
  'Walter Sisulu University', 'WSU', 'comprehensive',
  'Eastern Cape', 'Mthatha',
  'https://www.wsu.ac.za', 'https://www.wsu.ac.za/index.php/applications',
  100, '2025-04-01', '2025-09-30',
  false, 24,
  false, false, false, false
),

-- ── UNIVERSITIES OF TECHNOLOGY ────────────────────────────────

(
  'Tshwane University of Technology', 'TUT', 'technology',
  'Gauteng', 'Pretoria',
  'https://www.tut.ac.za', 'https://www.tut.ac.za/applications',
  230, '2025-04-01', '2025-09-30',
  false, 20,
  false, false, false, false
),
(
  'Cape Peninsula University of Technology', 'CPUT', 'technology',
  'Western Cape', 'Cape Town',
  'https://www.cput.ac.za', 'https://www.cput.ac.za/apply',
  100, '2025-04-01', '2025-09-30',
  false, 20,
  false, false, false, false
),
(
  'Durban University of Technology', 'DUT', 'technology',
  'KwaZulu-Natal', 'Durban',
  'https://www.dut.ac.za', 'https://www.dut.ac.za/study-at-dut/application',
  200, '2025-04-01', '2025-09-30',
  false, 20,
  false, false, false, false
),
(
  'Central University of Technology', 'CUT', 'technology',
  'Free State', 'Bloemfontein',
  'https://www.cut.ac.za', 'https://www.cut.ac.za/apply-now',
  200, '2025-04-01', '2025-09-30',
  false, 20,
  false, false, false, false
),
(
  'Mangosuthu University of Technology', 'MUT', 'technology',
  'KwaZulu-Natal', 'Durban',
  'https://www.mut.ac.za', 'https://www.mut.ac.za/applications',
  100, '2025-04-01', '2025-09-30',
  false, 18,
  false, false, false, false
),
(
  'Vaal University of Technology', 'VUT', 'technology',
  'Gauteng', 'Vanderbijlpark',
  'https://www.vut.ac.za', 'https://www.vut.ac.za/index.php/apply',
  200, '2025-04-01', '2025-09-30',
  false, 20,
  false, false, false, false
),

-- ── NEW GENERATION UNIVERSITIES ───────────────────────────────

(
  'Sol Plaatje University', 'SPU', 'new_generation',
  'Northern Cape', 'Kimberley',
  'https://www.spu.ac.za', 'https://www.spu.ac.za/apply',
  100, '2025-04-01', '2025-09-30',
  false, 24,
  false, false, false, false
),
(
  'University of Mpumalanga', 'UMP', 'new_generation',
  'Mpumalanga', 'Mbombela',
  'https://www.ump.ac.za', 'https://www.ump.ac.za/index.php/application',
  100, '2025-04-01', '2025-09-30',
  false, 24,
  false, false, false, false
),
(
  'Sefako Makgatho Health Sciences University', 'SMU', 'new_generation',
  'Gauteng', 'Ga-Rankuwa',
  'https://www.smu.ac.za', 'https://www.smu.ac.za/index.php/apply-online',
  200, '2025-04-01', '2025-08-31',
  false, 30,
  true, false, false, false
);

-- ============================================================
-- INDEXES for query performance
-- ============================================================
create index if not exists idx_guardian_details_profile_id  on public.guardian_details(profile_id);
create index if not exists idx_academic_details_profile_id  on public.academic_details(profile_id);
create index if not exists idx_documents_profile_id         on public.documents(profile_id);
create index if not exists idx_documents_type               on public.documents(document_type);
create index if not exists idx_programmes_university_id     on public.programmes(university_id);
create index if not exists idx_applications_profile_id      on public.applications(profile_id);
create index if not exists idx_applications_university_id   on public.applications(university_id);
create index if not exists idx_applications_status          on public.applications(status);
create index if not exists idx_notifications_profile_id     on public.notifications(profile_id);
create index if not exists idx_notifications_is_read        on public.notifications(is_read);
create index if not exists idx_universities_province        on public.universities(province);
create index if not exists idx_universities_type            on public.universities(type);

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  User,
  BookOpen,
  Building2,
  FileText,
  CheckCircle2,
  Send,
  Calendar,
  Banknote,
} from 'lucide-react';
import type { University, Programme, Subject } from '@/types';
import { daysUntilClose } from '@/lib/utils/university-match';

// ── Types passed in from the server component ────────────────────────────────

interface ReviewAddress {
  street: string | null;
  suburb: string | null;
  city: string | null;
  postal_code: string | null;
}

interface ReviewProfile {
  first_name: string | null;
  last_name: string | null;
  id_number: string | null;
  date_of_birth: string | null;
  email: string | null;
  phone: string | null;
  province: string | null;
  physical_address: ReviewAddress | null;
}

interface ReviewAcademic {
  aps_score: number | null;
  subjects: Subject[];
  school_name: string | null;
}

interface ReviewApplicationRow {
  id: string;
  university: University;
  firstChoice: Programme | null;
  secondChoice: Programme | null;
}

interface ReviewDocument {
  document_type: string;
  file_name: string | null;
}

interface ReviewAccordionProps {
  profile: ReviewProfile;
  academic: ReviewAcademic | null;
  applications: ReviewApplicationRow[];
  documents: ReviewDocument[];
  submitHref: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const DOC_LABELS: Record<string, string> = {
  id_copy:              'ID Document Copy',
  school_report:        'School Report',
  proof_of_residence:   'Proof of Residence',
  motivation_letter:    'Motivation Letter',
  portfolio:            'Portfolio',
  parental_consent:     'Parental Consent Form',
  language_declaration: 'Language Declaration Form',
};

function maskId(id: string | null): string {
  if (!id || id.length < 13) return id ?? '—';
  return `${id.slice(0, 6)}${'*'.repeat(6)}${id.slice(-1)}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 shrink-0 w-32">{label}</span>
      <span className="text-xs text-gray-800 text-right">{value || '—'}</span>
    </div>
  );
}

// ── Accordion section ────────────────────────────────────────────────────────

type SectionId = 'details' | 'results' | 'universities' | 'documents';

interface SectionProps {
  id: SectionId;
  title: string;
  icon: React.ReactNode;
  editHref: string;
  editLabel: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({
  title, icon, editHref, editLabel, isOpen, onToggle, children,
}: SectionProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-[#0b4f6c]">{icon}</span>
        <span className="flex-1 text-sm font-semibold text-gray-900">{title}</span>
        <Link
          href={editHref}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-medium text-[#0b4f6c] hover:underline underline-offset-2 shrink-0 mr-2"
        >
          {editLabel}
        </Link>
        {isOpen ? (
          <ChevronUp size={15} className="text-gray-400 shrink-0" />
        ) : (
          <ChevronDown size={15} className="text-gray-400 shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 px-4 py-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ReviewAccordion({
  profile,
  academic,
  applications,
  documents,
  submitHref,
}: ReviewAccordionProps) {
  const [open, setOpen] = useState<Set<SectionId>>(new Set(['details']));

  const toggle = (id: SectionId) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });

  const address = profile.physical_address;
  const addressLine = address
    ? [address.street, address.suburb, address.city, address.postal_code]
        .filter(Boolean)
        .join(', ')
    : null;

  const totalFees = applications.reduce(
    (sum, a) => sum + (a.university.application_fee ?? 0),
    0
  );

  return (
    <div className="space-y-3 pb-10">
      {/* ── Your Details ──────────────────────────────────────────────── */}
      <Section
        id="details"
        title="Your details"
        icon={<User size={16} />}
        editHref="/profile/step-1"
        editLabel="Edit"
        isOpen={open.has('details')}
        onToggle={() => toggle('details')}
      >
        <div className="space-y-0">
          <DetailRow
            label="Full name"
            value={[profile.first_name, profile.last_name].filter(Boolean).join(' ')}
          />
          <DetailRow label="ID number"     value={maskId(profile.id_number)} />
          <DetailRow label="Date of birth" value={formatDate(profile.date_of_birth)} />
          <DetailRow label="Email"         value={profile.email} />
          <DetailRow label="Phone"         value={profile.phone} />
          <DetailRow label="Province"      value={profile.province} />
          <DetailRow label="Address"       value={addressLine} />
        </div>
      </Section>

      {/* ── Your Results ──────────────────────────────────────────────── */}
      <Section
        id="results"
        title="Your results"
        icon={<BookOpen size={16} />}
        editHref="/profile/step-4"
        editLabel="Edit"
        isOpen={open.has('results')}
        onToggle={() => toggle('results')}
      >
        {!academic ? (
          <p className="text-sm text-gray-400 italic">No academic details saved yet.</p>
        ) : (
          <>
            {/* APS badge */}
            <div className="flex items-center justify-between rounded-lg bg-[#0b4f6c]/5 px-3 py-2.5 mb-3">
              <span className="text-xs font-medium text-gray-600">APS Score</span>
              <span className="text-xl font-bold text-[#0b4f6c]">
                {academic.aps_score ?? '—'}
              </span>
            </div>

            {academic.school_name && (
              <p className="text-xs text-gray-500 mb-3">School: {academic.school_name}</p>
            )}

            {/* Subjects table */}
            {academic.subjects.length > 0 ? (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-2 text-left font-medium text-gray-400">Subject</th>
                    <th className="pb-2 text-right font-medium text-gray-400">Mark</th>
                    <th className="pb-2 text-right font-medium text-gray-400">Level</th>
                    <th className="pb-2 text-right font-medium text-gray-400">APS</th>
                  </tr>
                </thead>
                <tbody>
                  {academic.subjects.map((s, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0">
                      <td className="py-1.5 text-gray-800">{s.subject_name}</td>
                      <td className="py-1.5 text-right text-gray-600">{s.mark}%</td>
                      <td className="py-1.5 text-right text-gray-600">{s.level}</td>
                      <td className="py-1.5 text-right font-medium text-gray-800">{s.aps_points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-gray-400 italic">No subjects recorded.</p>
            )}
          </>
        )}
      </Section>

      {/* ── Universities and Programmes ──────────────────────────────── */}
      <Section
        id="universities"
        title="Universities and programmes"
        icon={<Building2 size={16} />}
        editHref="/universities"
        editLabel="Edit"
        isOpen={open.has('universities')}
        onToggle={() => toggle('universities')}
      >
        <div className="space-y-4">
          {applications.map((app) => {
            const daysLeft = daysUntilClose(app.university.application_closes);
            const urgencyClass =
              daysLeft === null ? 'text-gray-400' :
              daysLeft <= 7     ? 'text-red-600'   :
              daysLeft <= 30    ? 'text-amber-600'  :
              'text-gray-500';

            return (
              <div key={app.id} className="rounded-lg border border-gray-100 overflow-hidden">
                <div className="bg-[#0b4f6c]/5 px-3 py-2 flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0b4f6c]">
                    {app.university.abbreviation}
                  </span>
                  <span className="text-xs font-semibold text-gray-800 truncate flex-1">
                    {app.university.name}
                  </span>
                </div>
                <div className="px-3 py-2.5 space-y-1.5">
                  <div>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                      First choice
                    </span>
                    <p className="text-xs text-gray-800 mt-0.5">
                      {app.firstChoice?.name ?? <em className="text-gray-400">Not selected</em>}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                      Backup choice
                    </span>
                    <p className="text-xs text-gray-800 mt-0.5">
                      {app.secondChoice?.name ?? <em className="text-gray-400">None</em>}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      <Banknote size={11} />
                      {app.university.application_fee === 0
                        ? <span className="text-[#1ec97e] font-medium">Free</span>
                        : <span>R{app.university.application_fee}</span>
                      }
                    </div>
                    {daysLeft !== null && (
                      <div className={`flex items-center gap-1 text-[11px] ${urgencyClass}`}>
                        <Calendar size={11} />
                        {daysLeft <= 0
                          ? 'Closed'
                          : `${daysLeft}d left`
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Your Documents ────────────────────────────────────────────── */}
      <Section
        id="documents"
        title="Your documents"
        icon={<FileText size={16} />}
        editHref="/profile/step-5"
        editLabel="Edit"
        isOpen={open.has('documents')}
        onToggle={() => toggle('documents')}
      >
        {documents.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CheckCircle2 size={14} className="text-[#1ec97e] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800">
                    {DOC_LABELS[doc.document_type] ?? doc.document_type}
                  </p>
                  {doc.file_name && (
                    <p className="text-[10px] text-gray-400 truncate">{doc.file_name}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Fee summary ───────────────────────────────────────────────── */}
      {totalFees > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Application fees total: R{totalFees}</span>
            {' '}— you will be taken to a secure payment screen after clicking submit.
          </p>
        </div>
      )}

      {/* ── Submit button ─────────────────────────────────────────────── */}
      <div className="pt-2">
        <Link
          href={submitHref}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#0b4f6c] py-3.5 text-sm font-bold text-white hover:bg-[#093d54] active:scale-[0.98] transition-all"
        >
          <Send size={15} />
          Submit {applications.length} application{applications.length !== 1 ? 's' : ''}
        </Link>
        <p className="mt-2 text-center text-xs text-gray-400">
          Once submitted, some details cannot be changed.
        </p>
      </div>
    </div>
  );
}

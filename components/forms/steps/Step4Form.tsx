'use client';

import { useCallback, useMemo, useState, useRef } from 'react';
import { useForm, useFieldArray, useWatch, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Trash2, AlertTriangle, Info } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { step4Schema, type Step4Data } from '@/lib/validations/profile';
import { SA_PROVINCES, RESULT_TYPES } from '@/lib/utils/sa-data';
import { NSC_SUBJECT_NAMES } from '@/lib/utils/nsc-subjects';
import { getLevel, getAPS, calculateAPS } from '@/lib/utils/aps';

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import StepProgress from '@/components/ui/StepProgress';

const PROVINCE_OPTIONS = SA_PROVINCES.map((p) => ({ value: p, label: p }));
const MATRIC_YEAR_OPTIONS = Array.from({ length: 15 }, (_, i) => 2027 - i).map((y) => ({
  value: String(y),
  label: String(y),
}));

const EMPTY_SUBJECT = { subject_name: '', mark: 0 };

// ── Searchable subject combobox (Fix 3) ───────────────────────────────────────

function SubjectCombobox({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError: boolean;
}) {
  const [query, setQuery]   = useState('');
  const [open, setOpen]     = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return NSC_SUBJECT_NAMES.slice(0, 8);
    return NSC_SUBJECT_NAMES.filter((n) => n.toLowerCase().includes(q));
  }, [query]);

  const handleSelect = (name: string) => {
    setQuery('');
    onChange(name);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={open ? query : (value || query)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); if (!e.target.value) onChange(''); }}
        onFocus={() => { setQuery(''); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search subject…"
        autoComplete="off"
        className={[
          'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-[#0b4f6c] focus:border-transparent',
          hasError ? 'border-[#e63946]' : 'border-gray-300',
        ].join(' ')}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg text-left">
          {filtered.map((name) => (
            <li key={name}>
              <button
                type="button"
                onMouseDown={() => handleSelect(name)}
                className={[
                  'w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-50',
                  name === value ? 'bg-[#0b4f6c]/10 font-medium text-[#0b4f6c]' : 'text-gray-700',
                ].join(' ')}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface Step4FormProps {
  userId: string;
  defaultValues?: Partial<Step4Data>;
  existingAcademicId?: string | null;
  completedSteps?: number[];
}

export default function Step4Form({ userId, defaultValues, existingAcademicId, completedSteps }: Step4FormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Step4Data>({
    resolver: zodResolver(step4Schema) as Resolver<Step4Data>,
    defaultValues: {
      matric_year: new Date().getFullYear(),
      subjects: defaultValues?.subjects?.length
        ? defaultValues.subjects
        : Array(6).fill(null).map(() => ({ ...EMPTY_SUBJECT })),
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'subjects' });
  const subjects = useWatch({ control, name: 'subjects', defaultValue: [] });

  const apsScore = useMemo(() => calculateAPS(subjects), [subjects]);
  const [markErrors, setMarkErrors] = useState<Record<number, boolean>>({});

  const supabase = createClient();
  // Track the academic row ID across autoSave calls to prevent duplicate inserts
  const academicIdRef = useRef<string | null>(existingAcademicId ?? null);

  const autoSave = useCallback(async () => {
    const data = getValues();
    const payload = {
      profile_id: userId,
      school_name: data.school_name,
      school_province: data.school_province,
      school_emis: data.school_emis || null,
      result_type: data.result_type,
      matric_year: data.matric_year,
      subjects: data.subjects.map((s) => ({
        subject_name: s.subject_name,
        mark: parseFloat(String(s.mark)) || 0,
        level: getLevel(parseFloat(String(s.mark)) || 0),
        aps_points: getAPS(s.subject_name, parseFloat(String(s.mark)) || 0),
      })),
      aps_score: calculateAPS(data.subjects),
      has_pure_mathematics: data.subjects.some((s) => s.subject_name === 'Mathematics'),
      has_bachelors_endorsement: calculateAPS(data.subjects) >= 23,
    };

    let error;
    if (academicIdRef.current) {
      ({ error } = await supabase
        .from('academic_details')
        .update(payload)
        .eq('id', academicIdRef.current));
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('academic_details')
        .insert(payload)
        .select('id')
        .single();
      error = insertErr;
      if (inserted?.id) academicIdRef.current = inserted.id;
    }

    if (!error) toast.success('Saved', { duration: 1500, id: 'autosave' });
  }, [supabase, userId, getValues]);

  const onSubmit = async (data: Step4Data) => {
    const enrichedSubjects = data.subjects.map((s) => ({
      subject_name: s.subject_name,
      mark: Number(s.mark),
      level: getLevel(Number(s.mark)),
      aps_points: getAPS(s.subject_name, Number(s.mark)),
    }));

    const payload = {
      profile_id: userId,
      school_name: data.school_name,
      school_province: data.school_province,
      school_emis: data.school_emis || null,
      result_type: data.result_type,
      matric_year: data.matric_year,
      subjects: enrichedSubjects,
      aps_score: calculateAPS(data.subjects),
      has_pure_mathematics: data.subjects.some((s) => s.subject_name === 'Mathematics'),
      has_bachelors_endorsement: calculateAPS(data.subjects) >= 23,
    };

    const effectiveId = existingAcademicId ?? academicIdRef.current;
    const { error } = effectiveId
      ? await supabase.from('academic_details').update(payload).eq('id', effectiveId)
      : await supabase.from('academic_details').insert(payload);

    if (error) {
      toast.error('Failed to save. Please try again.');
      return;
    }
    router.push('/profile/step-5');
  };

  // Derived warnings
  const hasMathsLit   = subjects.some((s) => s.subject_name === 'Mathematical Literacy');
  const englishSubject = subjects.find((s) => s.subject_name?.toLowerCase().startsWith('english'));
  const englishLevel  = englishSubject ? getLevel(Number(englishSubject.mark) || 0) : null;
  const lowEnglish    = englishLevel !== null && englishLevel < 4;
  const lowAPS        = apsScore > 0 && apsScore < 20;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <StepProgress currentStep={4} completedSteps={completedSteps} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your school results</h1>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          Enter your subjects and marks exactly as they appear on your school report.
        </p>
      </div>

      <div className="space-y-4">
        {/* School info */}
        <Input
          label="School name"
          placeholder="Soweto High School"
          error={errors.school_name?.message}
          {...register('school_name', { onBlur: autoSave })}
        />

        <Select
          label="School province"
          options={PROVINCE_OPTIONS}
          error={errors.school_province?.message}
          {...register('school_province', { onBlur: autoSave })}
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <label htmlFor="school-emis" className="text-sm font-medium text-gray-700">School EMIS number (optional)</label>
            <Tooltip text="Your school's 9-digit government registration number. You can find this on your school report or ask your teacher." />
          </div>
          <input
            id="school-emis"
            placeholder="000000000"
            maxLength={9}
            inputMode="numeric"
            className="w-full rounded-lg border border-gray-300 hover:border-gray-400 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0b4f6c] focus:border-transparent"
            {...register('school_emis', { onBlur: autoSave })}
          />
        </div>

        {/* Result type */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-700">Result type</p>
          <div className="space-y-2">
            {RESULT_TYPES.map((rt) => (
              <label key={rt.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value={rt.value}
                  className="h-4 w-4 accent-[#0b4f6c]"
                  {...register('result_type', { onBlur: autoSave })}
                />
                <span className="text-sm text-gray-700">{rt.label}</span>
              </label>
            ))}
          </div>
          {errors.result_type && (
            <p className="text-sm text-[#e63946]">{errors.result_type.message}</p>
          )}
        </div>

        <Select
          label="Expected matric year"
          options={MATRIC_YEAR_OPTIONS}
          error={errors.matric_year?.message}
          {...register('matric_year', {
            valueAsNumber: true,
            onBlur: autoSave,
          })}
        />

        {/* Live APS display */}
        <div className="rounded-xl border-2 border-[#0b4f6c]/20 bg-[#0b4f6c]/5 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-700">Your APS score</p>
            <Tooltip text="APS stands for Admission Point Score. Universities use this number to decide if you qualify for a programme." />
          </div>
          <p className="text-4xl font-black text-[#0b4f6c] tabular-nums">{apsScore}</p>
        </div>

        {/* Subjects table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">Subjects ({fields.length}/7)</p>
            {typeof errors.subjects?.root?.message === 'string' && (
              <p className="text-xs text-[#e63946]">{errors.subjects.root.message}</p>
            )}
          </div>

          {/* Header row */}
          <div className="grid grid-cols-[1fr_72px_44px_44px_36px] gap-1.5 mb-1.5 px-1">
            <p className="text-xs font-medium text-gray-500">Subject</p>
            <p className="text-xs font-medium text-gray-500 text-center">Mark %</p>
            <p className="text-xs font-medium text-gray-500 text-center">Lvl</p>
            <p className="text-xs font-medium text-gray-500 text-center">APS</p>
            <span />
          </div>

          <div className="space-y-2">
            {fields.map((field, i) => {
              const name = subjects[i]?.subject_name ?? '';
              const mark = Number(subjects[i]?.mark) || 0;
              const level = name && mark ? getLevel(mark) : null;
              const aps  = name && mark ? getAPS(name, mark) : null;
              const isLO = name === 'Life Orientation';
              type SubjectFieldError = { subject_name?: { message?: string }; mark?: { message?: string } };
              const subjectErr = (errors.subjects as SubjectFieldError[] | undefined)?.[i];

              return (
                <div key={field.id}>
                <div className="grid grid-cols-[1fr_72px_44px_44px_36px] gap-1.5 items-start">
                  {/* Subject combobox */}
                  <div>
                    <Controller
                      control={control}
                      name={`subjects.${i}.subject_name`}
                      render={({ field: cf }) => (
                        <SubjectCombobox
                          value={cf.value}
                          onChange={(v) => { cf.onChange(v); autoSave(); }}
                          hasError={!!subjectErr?.subject_name}
                        />
                      )}
                    />
                    {isLO && (
                      <p className="mt-0.5 text-[10px] text-gray-400 flex items-center gap-0.5">
                        <Info size={10} />
                        Excluded from APS
                      </p>
                    )}
                  </div>

                  {/* Mark */}
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    placeholder="0"
                    className={[
                      'w-full rounded-lg border bg-white px-2 py-2.5 text-sm text-center text-gray-900 transition-colors tabular-nums',
                      'focus:outline-none focus:ring-2 focus:ring-[#0b4f6c] focus:border-transparent',
                      markErrors[i] || subjectErr?.mark ? 'border-[#e63946]' : 'border-gray-300',
                    ].join(' ')}
                    {...register(`subjects.${i}.mark`, {
                      setValueAs: (v) => (v === '' || v === null ? NaN : Number(v)),
                      onChange: (e) => {
                        const raw = e.target.value.replace(/[^\d]/g, '').slice(0, 3);
                        if (raw && Number(raw) > 100) {
                          e.target.value = '';
                          setMarkErrors((prev) => ({ ...prev, [i]: true }));
                        } else {
                          e.target.value = raw;
                          if (markErrors[i]) setMarkErrors((prev) => ({ ...prev, [i]: false }));
                        }
                      },
                      onBlur: autoSave,
                    })}
                  />

                  {/* Level */}
                  <div className="flex items-center justify-center rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50">
                    {level ?? '—'}
                  </div>

                  {/* APS */}
                  <div className={[
                    'flex items-center justify-center rounded-lg border py-2.5 text-sm font-semibold',
                    isLO ? 'border-gray-200 text-gray-300 bg-gray-50' : 'border-gray-200 text-[#0b4f6c] bg-[#0b4f6c]/5',
                  ].join(' ')}>
                    {isLO ? '—' : (aps ?? '—')}
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    disabled={fields.length <= 6}
                    className="flex items-center justify-center h-10 w-9 mt-0.5 rounded-lg text-gray-400 hover:text-[#e63946] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Remove subject"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                {markErrors[i] && (
                  <p className="mt-0.5 text-xs text-[#e63946]">Mark cannot be more than 100</p>
                )}
                </div>
              );
            })}
          </div>

          {fields.length < 7 && (
            <button
              type="button"
              onClick={() => append({ ...EMPTY_SUBJECT })}
              className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#0b4f6c] hover:underline underline-offset-2"
            >
              <Plus size={15} />
              Add subject
            </button>
          )}

          {/* Import placeholder */}
          <button
            type="button"
            onClick={() => toast('📋 APSWise import is coming soon. Please enter your results manually for now.', { duration: 5000 })}
            className="mt-3 w-full rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Import from APSWise
          </button>
        </div>

        {/* Validation warnings */}
        {hasMathsLit && (
          <div className="flex gap-3 rounded-lg border border-[#f5a623]/40 bg-[#f5a623]/10 p-4">
            <AlertTriangle size={18} className="shrink-0 text-[#f5a623] mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>Warning:</strong> Many Science, Engineering, and Commerce programmes require
              Pure Mathematics, not Mathematical Literacy.
            </p>
          </div>
        )}

        {lowEnglish && (
          <div className="flex gap-3 rounded-lg border border-[#f5a623]/40 bg-[#f5a623]/10 p-4">
            <AlertTriangle size={18} className="shrink-0 text-[#f5a623] mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>Warning:</strong> Most universities require English at Level 4 (50%) or above.
            </p>
          </div>
        )}

        {lowAPS && (
          <div className="flex gap-3 rounded-lg border border-[#f5a623]/40 bg-[#f5a623]/10 p-4">
            <AlertTriangle size={18} className="shrink-0 text-[#f5a623] mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">
              Your APS score may be below the minimum required by most universities. Check the
              requirements carefully.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <Button type="button" variant="outline" fullWidth onClick={() => router.push('/profile/step-3')}>
          Back
        </Button>
        <Button type="submit" fullWidth loading={isSubmitting}>
          Continue
        </Button>
      </div>
    </form>
  );
}

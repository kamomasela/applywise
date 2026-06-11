'use client';

import { useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { step3Schema, type Step3Data } from '@/lib/validations/profile';
import { GUARDIAN_RELATIONSHIPS, HOUSEHOLD_INCOME_OPTIONS, HIGH_INCOME_VALUES } from '@/lib/utils/sa-data';

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Toggle from '@/components/ui/Toggle';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import StepProgress from '@/components/ui/StepProgress';

interface Step3FormProps {
  userId: string;
  defaultValues?: Partial<Step3Data>;
  existingGuardianId?: string | null;
}

export default function Step3Form({ userId, defaultValues, existingGuardianId }: Step3FormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { nsfas_applicant: false, ...defaultValues },
  });

  const nsfas = useWatch({ control, name: 'nsfas_applicant', defaultValue: false });
  const income = useWatch({ control, name: 'household_income', defaultValue: '' });

  const showNsfasWarning =
    nsfas && HIGH_INCOME_VALUES.includes(income as (typeof HIGH_INCOME_VALUES)[number]);

  const supabase = createClient();

  const autoSave = useCallback(async () => {
    const data = getValues();
    if (existingGuardianId) {
      await supabase
        .from('guardian_details')
        .update({
          full_name: data.full_name,
          relationship: data.relationship,
          phone: data.phone,
          email: data.email,
          occupation: data.occupation,
          household_income: data.household_income,
          nsfas_applicant: data.nsfas_applicant,
        })
        .eq('id', existingGuardianId);
    } else {
      await supabase.from('guardian_details').upsert({
        profile_id: userId,
        full_name: data.full_name,
        relationship: data.relationship,
        phone: data.phone,
        email: data.email,
        occupation: data.occupation,
        household_income: data.household_income,
        nsfas_applicant: data.nsfas_applicant,
      });
    }
  }, [supabase, userId, existingGuardianId, getValues]);

  const onSubmit = async (data: Step3Data) => {
    const payload = {
      profile_id: userId,
      full_name: data.full_name,
      relationship: data.relationship,
      phone: data.phone,
      email: data.email,
      occupation: data.occupation ?? null,
      household_income: data.household_income,
      nsfas_applicant: data.nsfas_applicant,
    };

    const { error } = existingGuardianId
      ? await supabase.from('guardian_details').update(payload).eq('id', existingGuardianId)
      : await supabase.from('guardian_details').insert(payload);

    if (error) {
      toast.error('Failed to save. Please try again.');
      return;
    }
    router.push('/profile/step-4');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <StepProgress currentStep={3} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your parent or guardian</h1>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          We need your parent or guardian&apos;s details for your application. If you are 18 or older
          and financially independent, select <strong>Guardian</strong> and enter your own details.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Full name"
          placeholder="Nomsa Dlamini"
          error={errors.full_name?.message}
          {...register('full_name', { onBlur: autoSave })}
        />

        <Select
          label="Relationship"
          options={GUARDIAN_RELATIONSHIPS.map((r) => ({ value: r.value, label: r.label }))}
          error={errors.relationship?.message}
          {...register('relationship', { onBlur: autoSave })}
        />

        <Input
          label="Contact number"
          type="tel"
          placeholder="0821234567"
          error={errors.phone?.message}
          {...register('phone', { onBlur: autoSave })}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="guardian@example.com"
          error={errors.email?.message}
          {...register('email', { onBlur: autoSave })}
        />

        <Input
          label="Occupation (optional)"
          placeholder="Teacher"
          {...register('occupation', { onBlur: autoSave })}
        />

        <Select
          label="Combined household income"
          options={HOUSEHOLD_INCOME_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          error={errors.household_income?.message}
          {...register('household_income', { onBlur: autoSave })}
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-1.5">
            <span className="text-sm font-medium text-gray-700 mt-0.5">NSFAS financial assistance</span>
            <Tooltip text="NSFAS is a government fund that pays for university fees and living costs for qualifying students. Tick this if your household earns less than R350 000 per year (R29 000 per month)." />
          </div>
          <Toggle
            label="I want to apply for NSFAS financial assistance"
            checked={!!nsfas}
            onChange={(v) => {
              setValue('nsfas_applicant', v);
              autoSave();
            }}
          />
        </div>

        {showNsfasWarning && (
          <div className="flex gap-3 rounded-lg border border-[#f5a623]/40 bg-[#f5a623]/10 p-4">
            <AlertTriangle size={18} className="shrink-0 text-[#f5a623] mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">
              Based on your household income, you may not qualify for NSFAS. You can still apply but
              funding is not guaranteed.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <Button type="button" variant="outline" fullWidth onClick={() => router.push('/profile/step-2')}>
          Back
        </Button>
        <Button type="submit" fullWidth loading={isSubmitting}>
          Continue
        </Button>
      </div>
    </form>
  );
}

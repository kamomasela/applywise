'use client';

import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { createClient } from '@/lib/supabase/client';
import { step1Schema, type Step1Data } from '@/lib/validations/profile';
import { parseSAID } from '@/lib/utils/sa-id';
import { GENDER_OPTIONS, RACE_OPTIONS, SA_LANGUAGES } from '@/lib/utils/sa-data';

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import StepProgress from '@/components/ui/StepProgress';

interface Step1FormProps {
  userId: string;
  defaultValues?: Partial<Step1Data>;
  completedSteps?: number[];
}

export default function Step1Form({ userId, defaultValues, completedSteps }: Step1FormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      nationality: 'South African',
      ...defaultValues,
    },
  });

  const supabase = createClient();

  const autoSave = useCallback(
    async (data: Partial<Step1Data>) => {
      const { error } = await supabase.from('profiles').upsert({ id: userId, ...data });
      if (!error) toast.success('Saved', { duration: 1500, id: 'autosave' });
    },
    [supabase, userId]
  );

  const handleIDBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    autoSave({ id_number: val });
    const parsed = parseSAID(val);
    if (parsed.valid) {
      if (parsed.dateOfBirth) setValue('date_of_birth', parsed.dateOfBirth, { shouldValidate: true });
      if (parsed.gender) setValue('gender', parsed.gender, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: Step1Data) => {
    const isMinor = (() => {
      if (!data.date_of_birth) return false;
      const dob = new Date(data.date_of_birth);
      const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age < 18;
    })();

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...data, is_minor: isMinor });

    if (error) {
      toast.error('Failed to save. Please try again.');
      return;
    }
    router.push('/profile/step-2');
  };

  const languageOptions = SA_LANGUAGES.map((l) => ({ value: l, label: l }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <StepProgress currentStep={1} completedSteps={completedSteps} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">About you</h1>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          Tell us a little about yourself. This information will be used on all your applications.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            placeholder="Thabo"
            error={errors.first_name?.message}
            autoComplete="given-name"
            {...register('first_name', { onBlur: () => autoSave({ first_name: getValues('first_name') }) })}
          />
          <Input
            label="Last name"
            placeholder="Nkosi"
            error={errors.last_name?.message}
            autoComplete="family-name"
            {...register('last_name', { onBlur: () => autoSave({ last_name: getValues('last_name') }) })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-medium text-gray-700">SA ID number</label>
            <Tooltip text="Your 13-digit South African ID number. You can find this on your green ID book or smart ID card." />
          </div>
          <Input
            label="SA ID number"
            placeholder="0001010000000"
            maxLength={13}
            inputMode="numeric"
            error={errors.id_number?.message}
            autoComplete="off"
            {...register('id_number', { onBlur: handleIDBlur })}
            // Hide the built-in label since we have a custom one above
            style={{ marginTop: 0 }}
            id="id_number"
          />
        </div>

        <Input
          label="Date of birth"
          type="date"
          error={errors.date_of_birth?.message}
          {...register('date_of_birth', { onBlur: () => autoSave({ date_of_birth: getValues('date_of_birth') }) })}
        />

        <Select
          label="Gender"
          options={GENDER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          error={errors.gender?.message}
          {...register('gender', { onBlur: () => autoSave({ gender: getValues('gender') }) })}
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-medium text-gray-700">Race</label>
            <Tooltip text="South African universities use this information for equity and transformation purposes as required by law." />
          </div>
          <Select
            label="Race"
            options={RACE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            error={errors.race?.message}
            id="race"
            {...register('race', { onBlur: () => autoSave({ race: getValues('race') }) })}
          />
        </div>

        <Select
          label="Home language"
          options={languageOptions}
          error={errors.home_language?.message}
          {...register('home_language', { onBlur: () => autoSave({ home_language: getValues('home_language') }) })}
        />

        <Input
          label="Nationality"
          placeholder="South African"
          error={errors.nationality?.message}
          {...register('nationality', { onBlur: () => autoSave({ nationality: getValues('nationality') }) })}
        />
      </div>

      <div className="mt-8">
        <Button type="submit" fullWidth loading={isSubmitting}>
          Continue
        </Button>
      </div>
    </form>
  );
}

'use client';

import { useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { createClient } from '@/lib/supabase/client';
import { step2Schema, type Step2Data } from '@/lib/validations/profile';
import { SA_PROVINCES } from '@/lib/utils/sa-data';

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Toggle from '@/components/ui/Toggle';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import StepProgress from '@/components/ui/StepProgress';

interface Step2FormProps {
  userId: string;
  defaultValues?: Partial<Step2Data>;
}

const PROVINCE_OPTIONS = SA_PROVINCES.map((p) => ({ value: p, label: p }));

function AddressFields({
  prefix,
  register,
  errors,
  onBlurSave,
}: {
  prefix: 'physical_address' | 'postal_address';
  register: ReturnType<typeof useForm<Step2Data>>['register'];
  errors: ReturnType<typeof useForm<Step2Data>>['formState']['errors'];
  onBlurSave: () => void;
}) {
  const e = prefix === 'physical_address' ? errors.physical_address : errors.postal_address;
  return (
    <div className="space-y-3">
      <Input
        label="Street address"
        placeholder="12 Acacia Street"
        error={(e as Record<string, { message?: string }>)?.street?.message}
        {...register(`${prefix}.street`, { onBlur: onBlurSave })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Suburb"
          placeholder="Soweto"
          error={(e as Record<string, { message?: string }>)?.suburb?.message}
          {...register(`${prefix}.suburb`, { onBlur: onBlurSave })}
        />
        <Input
          label="City"
          placeholder="Johannesburg"
          error={(e as Record<string, { message?: string }>)?.city?.message}
          {...register(`${prefix}.city`, { onBlur: onBlurSave })}
        />
      </div>
      <Input
        label="Postal code"
        placeholder="2001"
        maxLength={4}
        inputMode="numeric"
        error={(e as Record<string, { message?: string }>)?.postal_code?.message}
        {...register(`${prefix}.postal_code`, { onBlur: onBlurSave })}
      />
    </div>
  );
}

export default function Step2Form({ userId, defaultValues }: Step2FormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      postal_same_as_physical: true,
      ...defaultValues,
    },
  });

  const sameAddress = useWatch({ control, name: 'postal_same_as_physical', defaultValue: true });
  const supabase = createClient();

  const autoSave = useCallback(async () => {
    const data = getValues();
    await supabase.from('profiles').upsert({
      id: userId,
      email: data.email,
      phone: data.phone,
      province: data.province,
      physical_address: data.physical_address,
      postal_same_as_physical: data.postal_same_as_physical,
      postal_address: data.postal_same_as_physical ? null : data.postal_address,
    });
  }, [supabase, userId, getValues]);

  const onSubmit = async (data: Step2Data) => {
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      email: data.email,
      phone: data.phone,
      province: data.province,
      physical_address: data.physical_address,
      postal_same_as_physical: data.postal_same_as_physical,
      postal_address: data.postal_same_as_physical ? null : data.postal_address,
    });

    if (error) {
      toast.error('Failed to save. Please try again.');
      return;
    }
    router.push('/profile/step-3');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <StepProgress currentStep={2} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">How can universities reach you?</h1>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          Make sure your email and phone number are correct. Universities will contact you using these details.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-medium text-gray-700">Personal email</label>
            <Tooltip text="Use an email address you check regularly. All application updates will be sent here." />
          </div>
          <Input
            label="Personal email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            id="contact-email"
            {...register('email', { onBlur: autoSave })}
          />
        </div>

        <Input
          label="Cell phone number"
          type="tel"
          placeholder="0821234567"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone', { onBlur: autoSave })}
        />

        <Select
          label="Province"
          options={PROVINCE_OPTIONS}
          error={errors.province?.message}
          {...register('province', { onBlur: autoSave })}
        />

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Physical address</p>
          <AddressFields
            prefix="physical_address"
            register={register}
            errors={errors}
            onBlurSave={autoSave}
          />
        </div>

        <Toggle
          label="My postal address is the same as my home address"
          checked={!!sameAddress}
          onChange={(v) => {
            setValue('postal_same_as_physical', v, { shouldValidate: true });
            autoSave();
          }}
        />

        {!sameAddress && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Postal address</p>
            <AddressFields
              prefix="postal_address"
              register={register}
              errors={errors}
              onBlurSave={autoSave}
            />
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <Button type="button" variant="outline" fullWidth onClick={() => router.push('/profile/step-1')}>
          Back
        </Button>
        <Button type="submit" fullWidth loading={isSubmitting}>
          Continue
        </Button>
      </div>
    </form>
  );
}

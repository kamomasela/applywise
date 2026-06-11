'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';

import { sendPasswordReset } from '@/app/(auth)/actions';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    const result = await sendPasswordReset(data.email);
    if ('error' in result) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }
    setSentTo(data.email);
    setIsLoading(false);
  };

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1ec97e]/10">
          <MailCheck size={32} className="text-[#1ec97e]" aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Check your inbox</p>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            We&apos;ve sent a reset link to{' '}
            <span className="font-semibold text-gray-900">{sentTo}</span>.
            Check your inbox and your spam folder.
          </p>
        </div>
        <Link
          href="/login"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0b4f6c] hover:underline underline-offset-2"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Input
        label="Email address"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="pt-1">
        <Button type="submit" fullWidth loading={isLoading}>
          Send reset link
        </Button>
      </div>

      <div className="flex justify-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0b4f6c] hover:underline underline-offset-2"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to login
        </Link>
      </div>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ShieldAlert } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { signInWithEmail } from '@/app/(auth)/actions';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30 * 60 * 1000; // 30 minutes

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    if (isLocked) return;

    setIsLoading(true);
    const result = await signInWithEmail(data.email, data.password);

    if ('error' in result) {
      const next = failedAttempts + 1;
      setFailedAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_MS);
      } else {
        const remaining = MAX_ATTEMPTS - next;
        toast.error(
          remaining === 1
            ? 'Incorrect credentials. 1 attempt remaining before lockout.'
            : `Incorrect credentials. ${remaining} attempts remaining.`
        );
      }
      setIsLoading(false);
      return;
    }

    if ('redirectTo' in result) router.push(result.redirectTo);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message);
      setIsGoogleLoading(false);
    }
  };

  if (isLocked) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-[#e63946]/30 bg-[#e63946]/5 p-5 flex flex-col items-center gap-3 text-center"
      >
        <ShieldAlert size={32} className="text-[#e63946]" aria-hidden="true" />
        <div>
          <p className="font-semibold text-gray-900 text-sm">Account temporarily locked</p>
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">
            Your account has been temporarily locked for 30 minutes for security.
            Please try again later.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-[#0b4f6c] hover:underline underline-offset-2"
        >
          Reset your password instead
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

      <div className="space-y-1">
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-[#0b4f6c] font-medium hover:underline underline-offset-2"
          >
            Forgot my password
          </Link>
        </div>
      </div>

      <div className="pt-1">
        <Button type="submit" fullWidth loading={isLoading}>
          Log in
        </Button>
      </div>

      <Divider />

      <Button
        type="button"
        variant="outline"
        fullWidth
        loading={isGoogleLoading}
        onClick={handleGoogleSignIn}
      >
        {!isGoogleLoading && <GoogleIcon />}
        Continue with Google
      </Button>

      <p className="text-center text-sm text-gray-500 pt-1">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-semibold text-[#0b4f6c] hover:underline underline-offset-2"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}

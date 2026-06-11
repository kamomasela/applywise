import type { Metadata } from 'next';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Reset password — ApplyWise',
  description: 'Reset your ApplyWise password.',
};

export default function ForgotPasswordPage() {
  return (
    <>
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Link href="/" aria-label="ApplyWise home">
          <Logo size={56} />
        </Link>
      </div>

      {/* Heading */}
      <div className="mb-6 text-center">
        <h1 className="text-[1.625rem] font-bold leading-tight text-gray-900">
          Reset your password
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Enter your email and we will send you a reset link.
        </p>
      </div>

      {/* Form */}
      <ForgotPasswordForm />
    </>
  );
}

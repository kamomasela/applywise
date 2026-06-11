import type { Metadata } from 'next';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import SignupForm from '@/components/forms/SignupForm';

export const metadata: Metadata = {
  title: 'Create account — ApplyWise',
  description: 'Create your ApplyWise account and start applying to South African universities.',
};

export default function SignupPage() {
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
          Create your account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Your information is private and secure. We will never share it without
          your permission.
        </p>
      </div>

      {/* Form */}
      <SignupForm />
    </>
  );
}

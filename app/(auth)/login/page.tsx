import type { Metadata } from 'next';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import LoginForm from '@/components/forms/LoginForm';

export const metadata: Metadata = {
  title: 'Log in — ApplyWise',
  description: 'Log in to your ApplyWise account.',
};

export default function LoginPage() {
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
          Welcome back
        </h1>
      </div>

      {/* Form */}
      <LoginForm />
    </>
  );
}

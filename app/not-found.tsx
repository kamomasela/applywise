import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <Logo size={56} />

      <p className="mt-8 text-7xl font-bold text-[#0b4f6c] leading-none">404</p>
      <h1 className="mt-3 text-xl font-bold text-gray-900">This page does not exist.</h1>
      <p className="mt-2 text-sm text-gray-500 max-w-xs leading-relaxed">
        The link you followed may be broken or the page may have been removed.
      </p>

      <Link
        href="/dashboard"
        className="mt-7 rounded-xl bg-[#0b4f6c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#093d54] transition-colors"
      >
        Go to dashboard
      </Link>
    </div>
  );
}

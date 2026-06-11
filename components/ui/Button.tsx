import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = [
    'inline-flex items-center justify-center gap-2.5 rounded-lg px-6 py-3',
    'text-base font-semibold transition-all duration-150 select-none',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-60 disabled:cursor-not-allowed',
    'active:scale-[0.98]',
  ].join(' ');

  const variants = {
    primary:
      'bg-[#0b4f6c] text-white hover:bg-[#093d56] focus:ring-[#0b4f6c]',
    outline:
      'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-400',
  };

  return (
    <button
      disabled={disabled || loading}
      className={[
        base,
        variants[variant],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
}

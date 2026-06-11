'use client';

export type PasswordStrengthLevel = 'weak' | 'fair' | 'strong';

export function getPasswordStrength(password: string): PasswordStrengthLevel | null {
  if (!password) return null;
  if (password.length < 8) return 'weak';
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);
  if (hasNumbers && hasSpecial) return 'strong';
  return 'fair';
}

const STRENGTH_CONFIG = {
  weak: {
    label: 'Weak',
    hint: '— must be at least 8 characters',
    color: 'bg-[#e63946]',
    text: 'text-[#e63946]',
    bars: 1,
  },
  fair: {
    label: 'Fair',
    hint: '— add numbers and special characters to strengthen it',
    color: 'bg-[#f5a623]',
    text: 'text-[#f5a623]',
    bars: 2,
  },
  strong: {
    label: 'Strong',
    hint: '',
    color: 'bg-[#1ec97e]',
    text: 'text-[#1ec97e]',
    bars: 3,
  },
};

export default function PasswordStrength({ password }: { password: string }) {
  const level = getPasswordStrength(password);
  if (!level) return null;

  const { label, hint, color, text, bars } = STRENGTH_CONFIG[level];

  return (
    <div className="space-y-1.5" aria-live="polite" aria-atomic="true">
      <div className="flex gap-1.5" role="img" aria-label={`Password strength: ${label}`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={[
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              i <= bars ? color : 'bg-gray-200',
            ].join(' ')}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${text}`}>
        {label} {hint}
      </p>
    </div>
  );
}

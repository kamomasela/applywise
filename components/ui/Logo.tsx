interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 48, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="ApplyWise"
    >
      {/* Navy rounded background */}
      <rect width="48" height="48" rx="10" fill="#0b4f6c" />

      {/* A shape — left leg */}
      <line
        x1="24" y1="12"
        x2="10" y2="38"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* A shape — right leg */}
      <line
        x1="24" y1="12"
        x2="38" y2="38"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* A shape — crossbar */}
      <line
        x1="16" y1="28"
        x2="32" y2="28"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Green dot at the apex */}
      <circle cx="24" cy="12" r="4.5" fill="#1ec97e" />
    </svg>
  );
}

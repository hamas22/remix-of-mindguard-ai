interface LogoProps {
  className?: string;
  size?: number;
}

// MindGuard AI logo — an abstract mind: concentric aurora rings around a
// central spark, forming a stylized "M" of neural filaments.
export function Logo({ className, size = 36 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lg-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.68 0.22 295)" />
          <stop offset="55%" stopColor="oklch(0.72 0.25 340)" />
          <stop offset="100%" stopColor="oklch(0.82 0.16 200)" />
        </linearGradient>
        <radialGradient id="lg-core" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="oklch(0.98 0.02 300)" />
          <stop offset="60%" stopColor="oklch(0.75 0.22 320)" />
          <stop offset="100%" stopColor="oklch(0.55 0.2 295 / 0)" />
        </radialGradient>
      </defs>

      {/* Outer shield-like ring */}
      <path
        d="M24 3.5c-6.5 3-11 5-16.5 5.5-1.5 8 .5 22 16.5 32 16-10 18-24 16.5-32C34.5 8.5 30.5 6.5 24 3.5Z"
        fill="none"
        stroke="url(#lg-a)"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.9"
      />

      {/* Inner neural filaments — a subtle "M" */}
      <path
        d="M14 30 Q17 20 20 24 T24 22 T28 24 T34 30"
        fill="none"
        stroke="url(#lg-a)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Synapse nodes */}
      <circle cx="14" cy="30" r="1.6" fill="oklch(0.82 0.16 200)" />
      <circle cx="24" cy="22" r="1.6" fill="oklch(0.72 0.25 340)" />
      <circle cx="34" cy="30" r="1.6" fill="oklch(0.68 0.22 295)" />

      {/* Central spark */}
      <circle cx="24" cy="22" r="6" fill="url(#lg-core)" opacity="0.9" />
    </svg>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold ${className ?? ""}`}>
      <Logo size={30} />
      <span className="text-lg tracking-tight">
        MindGuard<span className="text-gradient font-bold"> AI</span>
      </span>
    </span>
  );
}

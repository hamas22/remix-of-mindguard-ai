import type { RiskLevel } from "@/lib/ai-risk";

export function riskColor(level: RiskLevel) {
  return level === "low" ? "var(--risk-low)" : level === "medium" ? "var(--risk-medium)" : "var(--risk-high)";
}

export function RiskMeter({ level, score }: { level: RiskLevel; score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  const angle = -90 + (pct / 100) * 180;
  const color = riskColor(level);
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-xs">
        <defs>
          <linearGradient id="riskGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--risk-low)" />
            <stop offset="50%" stopColor="var(--risk-medium)" />
            <stop offset="100%" stopColor="var(--risk-high)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="18" strokeLinecap="round" />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#riskGrad)"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 251} 251`}
          filter="url(#glow)"
        />
        <g transform={`translate(100 100) rotate(${angle})`} style={{ transition: "transform 1s cubic-bezier(0.22, 1, 0.36, 1)" }}>
          <line x1="0" y1="0" x2="0" y2="-70" stroke={color} strokeWidth="4" strokeLinecap="round" filter="url(#glow)" />
          <circle r="8" fill={color} filter="url(#glow)" />
        </g>
      </svg>
      <div className="text-center mt-3">
        <div className="text-5xl font-semibold" style={{ color, textShadow: `0 0 24px ${color}` }}>{pct}</div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">
          {level} risk
        </div>
      </div>
    </div>
  );
}

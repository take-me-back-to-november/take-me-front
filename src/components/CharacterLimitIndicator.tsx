const CRITICAL_REMAINING = 10;
const USAGE_THRESHOLD = 0.75;
const NEUTRAL_COLOR = "var(--color-on-surface-variant)";
const ERROR_COLOR = "var(--color-error)";

interface CharacterLimitIndicatorProps {
  length: number;
  max: number;
  visible: boolean;
  criticalRemaining?: number;
  size?: number;
}

function getColor(remaining: number, criticalRemaining: number): string {
  if (remaining <= criticalRemaining) return ERROR_COLOR;
  return NEUTRAL_COLOR;
}

export function CharacterLimitIndicator({
  length,
  max,
  visible,
  criticalRemaining = CRITICAL_REMAINING,
  size = 24,
}: CharacterLimitIndicatorProps) {
  const usageRatio = length / max;
  if (!visible || usageRatio < USAGE_THRESHOLD) return null;

  const remaining = max - length;
  const progress = Math.max(0, Math.min(1, remaining / max));
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const center = size / 2;
  const color = getColor(remaining, criticalRemaining);

  return (
    <div
      className="pointer-events-none relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="status"
      aria-live="polite"
      aria-label={`${remaining} characters remaining`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-outline-variant)"
          strokeWidth={strokeWidth}
          opacity={0.45}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-200 ease-out"
        />
      </svg>
      <span
        className="relative text-[10px] font-semibold tabular-nums leading-none transition-colors duration-200"
        style={{ color }}
      >
        {remaining}
      </span>
    </div>
  );
}

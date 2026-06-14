const SIZES = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 48,
} as const;

type IconSize = keyof typeof SIZES;

interface IconProps {
  name: string;
  size?: IconSize;
  filled?: boolean;
  className?: string;
}

export function Icon({ name, size = "md", filled = false, className = "" }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${filled ? "material-symbols-filled" : ""} ${className}`}
      style={{ fontSize: SIZES[size] }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

export { SIZES as iconSizes };
export type { IconSize };

type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  className?: string;
  alt?: string;
  size?: LogoSize;
}

const sizeClasses: Record<LogoSize, string> = {
  sm: "text-[1.125rem] md:text-[1.375rem]",
  md: "text-[1.75rem] md:text-[2.125rem]",
  lg: "text-[2.125rem] md:text-[2.625rem]",
};

export function Logo({
  className = "",
  alt = "Take Me Logo",
  size = "md",
}: LogoProps) {
  return (
    <span
      className={`font-brand inline-flex items-baseline justify-center gap-[0.15em] leading-none ${sizeClasses[size]} ${className}`}
      role="img"
      aria-label={alt}
    >
      <span className="text-on-surface">Take</span>
      <span className="text-brand-me">Me</span>
    </span>
  );
}

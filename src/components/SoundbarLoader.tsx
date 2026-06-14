import type { ComponentPropsWithoutRef } from "react";

type SoundbarLoaderSize = "sm" | "md" | "lg";

interface SoundbarLoaderProps extends ComponentPropsWithoutRef<"div"> {
  size?: SoundbarLoaderSize;
  label?: string;
}

const BAR_COUNT: Record<SoundbarLoaderSize, number> = {
  sm: 3,
  md: 5,
  lg: 5,
};

export function SoundbarLoader({
  size = "md",
  label,
  className = "",
  ...props
}: SoundbarLoaderProps) {
  return (
    <div
      className={`soundbar-loader soundbar-loader--${size} ${className}`.trim()}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      {Array.from({ length: BAR_COUNT[size] }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "rounded-full bg-primary px-xl py-md text-label-md text-on-primary transition-default hover:bg-primary-fixed active:scale-95 disabled:opacity-50",
  secondary:
    "rounded-full border border-outline px-lg py-sm text-label-md text-on-surface transition-default hover:bg-surface-container-highest active:scale-95 disabled:opacity-50",
  ghost:
    "rounded-full px-md py-sm text-label-md text-on-surface-variant transition-default hover:bg-surface-container-high hover:text-on-surface active:scale-95 disabled:opacity-50",
};

export function Button({
  variant = "primary",
  children,
  icon,
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-sm ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

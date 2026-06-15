import type { ButtonHTMLAttributes, ReactNode } from "react";
import { interactive } from "@/lib/designSystem";
import { cn } from "@/lib/cn";

interface TextActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function TextActionButton({
  children,
  className,
  type = "button",
  ...props
}: TextActionButtonProps) {
  return (
    <button type={type} className={cn(interactive.textAction, className)} {...props}>
      {children}
    </button>
  );
}

import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cardClass, layout, type CardVariant } from "@/lib/designSystem";
import { cn } from "@/lib/cn";

type CardElement = "article" | "section" | "div";

interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  as?: CardElement;
  children: ReactNode;
}

const defaultElements: Record<CardVariant, CardElement> = {
  feed: "article",
  surface: "section",
  profile: "section",
  dashed: "div",
};

export function Card({
  variant = "surface",
  as,
  className,
  children,
  ...props
}: CardProps) {
  const Component = (as ?? defaultElements[variant]) as ElementType;

  return (
    <Component className={cardClass(variant, className)} {...props}>
      {children}
    </Component>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <footer className={cn(layout.cardActions, className)} {...props}>
      {children}
    </footer>
  );
}

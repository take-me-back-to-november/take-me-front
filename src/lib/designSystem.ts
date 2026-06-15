import { cn } from "@/lib/cn";

export const cardStyles = {
  base: "overflow-hidden rounded-xl border border-white/5 p-md",
  variants: {
    feed: "min-w-0 bg-surface-container-low transition-default hover:bg-surface-container",
    surface:
      "bg-surface-container-high transition-default hover:bg-surface-container-highest",
    profile: "bg-surface-container-high transition-default",
    dashed:
      "border-dashed border-surface-container-high bg-surface-container-high/50",
  },
} as const;

export type CardVariant = keyof typeof cardStyles.variants;

export function cardClass(variant: CardVariant, className?: string): string {
  return cn(cardStyles.base, cardStyles.variants[variant], className);
}

export const typography = {
  pageTitle: "text-headline-lg-mobile text-on-surface md:text-headline-lg",
  sectionTitle: "text-headline-md text-on-surface",
  cardAuthor: "truncate text-body-md font-semibold text-on-surface",
  cardTimestamp: "truncate text-label-sm normal-case text-on-surface-variant/55",
  cardReviewTitle: "mb-xs text-body-md font-medium text-on-surface",
  cardBody:
    "break-words whitespace-pre-wrap text-body-md font-normal leading-relaxed text-on-surface-variant/75 [overflow-wrap:anywhere]",
  cardMusicTitle: "truncate text-body-md font-medium text-on-surface",
  cardMusicMeta: "truncate text-label-sm normal-case text-on-surface-variant",
  statValue: "text-headline-md tabular-nums text-on-surface",
  statValueAccent: "text-headline-md tabular-nums text-primary",
  statLabel:
    "mt-xs text-label-sm normal-case tracking-wide text-on-surface-variant",
} as const;

export const interactive = {
  iconButton:
    "flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-default hover:bg-surface-container-high hover:text-on-surface active:scale-95 disabled:opacity-50",
  textAction:
    "mt-sm cursor-pointer border-none bg-transparent p-0 text-[0.85rem] font-medium text-primary transition-default hover:text-primary/80 active:scale-95 disabled:opacity-50",
  commentTrigger:
    "flex w-full items-center justify-center gap-sm rounded-lg border border-dashed border-outline-variant/35 bg-surface-container-high px-md py-sm text-body-md font-medium text-primary transition-default hover:border-primary/30 hover:bg-surface-container-highest active:scale-[0.99] disabled:opacity-50",
  reactionActive: "text-on-surface",
  reactionIdle:
    "text-on-surface-variant transition-default hover:text-on-surface active:scale-[0.98] disabled:opacity-50",
} as const;

export const layout = {
  feedList: "flex flex-col",
  cardStackItem: "mb-[20px] last:mb-0",
  cardHeader: "mb-sm flex items-center justify-between gap-sm",
  cardAuthorRow: "flex min-w-0 flex-1 items-center gap-[10px]",
  cardAuthorMeta: "flex min-w-0 flex-col justify-center",
  cardActions: "mt-[12px] border-t border-white/10 pt-[12px]",
  commentSection: "border-t border-white/10 pt-md",
  commentPanel:
    "mt-sm rounded-lg border border-white/5 bg-surface-container-high/80 p-md",
  commentEmpty:
    "flex flex-col items-center justify-center gap-sm py-md text-center",
  commentThreadRow: "min-w-0 py-sm",
  commentThreadNested: "border-l-2 border-white/10",
  commentThreadList: "flex flex-col gap-md",
  commentCtaArea: "mb-md border-b border-white/10 pb-md",
  musicPreview: "mb-lg flex items-center gap-md rounded-lg bg-surface p-sm",
  truncate: "min-w-0 truncate",
} as const;

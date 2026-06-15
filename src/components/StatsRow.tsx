import { cardStyles, typography } from "@/lib/designSystem";
import { cn } from "@/lib/cn";

export interface StatItem {
  id: string;
  value: string | number;
  label: string;
  accent?: boolean;
}

interface StatsRowProps {
  items: StatItem[];
  loading?: boolean;
  className?: string;
}

export function StatsRow({ items, loading = false, className }: StatsRowProps) {
  return (
    <section
      className={cn(cardStyles.base, "flex items-stretch justify-between gap-md", className)}
      aria-busy={loading}
    >
      {items.map((item) => (
        <article
          key={item.id}
          className="flex min-w-0 flex-1 flex-col items-center justify-center text-center"
        >
          <span
            className={item.accent ? typography.statValueAccent : typography.statValue}
          >
            {loading ? "—" : item.value}
          </span>
          <span className={typography.statLabel}>{item.label}</span>
        </article>
      ))}
    </section>
  );
}

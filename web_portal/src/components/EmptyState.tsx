import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-gradient-subtle px-6 py-14 text-center",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-mesh opacity-60" />
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary ring-1 ring-inset ring-primary/15">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="relative text-base font-bold text-foreground">{title}</h3>
      {description && (
        <p className="relative mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="relative mt-5">{action}</div>}
    </div>
  );
}

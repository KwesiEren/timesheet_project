import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: React.ElementType;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, icon: Icon, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-gradient-subtle bg-gradient-mesh px-5 py-5 shadow-card sm:px-7 sm:py-6",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-primary opacity-[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-gradient-accent opacity-[0.06] blur-3xl" />
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          {eyebrow && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              <span className="h-1 w-1 rounded-full bg-primary" />
              {eyebrow}
            </div>
          )}
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant sm:flex">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-[28px]">
              {title}
            </h1>
          </div>
          {description && (
            <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">{actions}</div>
        )}
      </div>
    </header>
  );
}

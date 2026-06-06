import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  tone?: "primary" | "success" | "warning" | "destructive" | "accent";
  hint?: string;
  className?: string;
  onClick?: () => void;
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, { glow: string; icon: string }> = {
  primary: { glow: "from-primary/25", icon: "bg-primary/10 text-primary" },
  success: { glow: "from-success/30", icon: "bg-success/10 text-success" },
  warning: { glow: "from-warning/40", icon: "bg-warning/15 text-warning-foreground" },
  destructive: { glow: "from-destructive/25", icon: "bg-destructive/10 text-destructive" },
  accent: { glow: "from-accent/30", icon: "bg-accent/10 text-accent" },
};

export function StatCard({ label, value, icon: Icon, tone = "primary", hint, className, onClick }: StatCardProps) {
  const c = toneClasses[tone];
  return (
    <Card
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      className={cn(
        "group relative overflow-hidden border-border/60 bg-gradient-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover",
        onClick && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br to-transparent opacity-70 blur-2xl transition-opacity group-hover:opacity-100",
          c.glow,
        )}
      />
      <CardContent className="relative z-10 flex items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-1.5 font-mono-data text-3xl font-bold leading-none text-foreground tabular-nums">
            {value}
          </div>
          {hint && <div className="mt-1.5 text-[11px] text-muted-foreground">{hint}</div>}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-border/60",
            c.icon,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

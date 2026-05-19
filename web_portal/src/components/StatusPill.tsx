import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const map: Record<string, { label: string; cls: string }> = {
  approved: { label: "Approved", cls: "bg-success text-success-foreground" },
  synced: { label: "Synced", cls: "bg-success text-success-foreground" },
  clocked_in: { label: "Clocked in", cls: "bg-success text-success-foreground" },
  pending: { label: "Pending", cls: "bg-warning text-warning-foreground" },
  manual_edit: { label: "Manual edit", cls: "bg-warning text-warning-foreground" },
  late: { label: "Late", cls: "bg-warning text-warning-foreground" },
  absent: { label: "Absent", cls: "bg-destructive text-destructive-foreground" },
  geofence_violation: { label: "Geofence violation", cls: "bg-destructive text-destructive-foreground" },
  clocked_out: { label: "Clocked out", cls: "bg-secondary text-secondary-foreground" },
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const m = map[status] ?? { label: status, cls: "bg-secondary text-secondary-foreground" };
  return (
    <Badge className={cn("rounded-full border-0 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide", m.cls, className)}>
      {m.label}
    </Badge>
  );
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationRead, runMissingLogsCheck } from "@/lib/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, CheckCheck, Info, Pencil, Play } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/api";

const iconFor: Record<Notification["type"], { icon: React.ElementType; cls: string }> = {
  missing_log: { icon: AlertTriangle, cls: "text-warning" },
  geofence_violation: { icon: AlertTriangle, cls: "text-destructive" },
  manual_edit: { icon: Pencil, cls: "text-warning" },
  info: { icon: Info, cls: "text-muted-foreground" },
};

export default function Notifications() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: items = [] } = useQuery({ queryKey: ["notifications"], queryFn: getNotifications });

  const runCheck = useMutation({
    mutationFn: runMissingLogsCheck,
    onSuccess: (r) => {
      toast({ title: "Missing-logs check complete", description: `${r.created} alert(s) created.` });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = items.filter((i) => !i.read);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${unread.length} unread`}
        title="Notifications"
        description="Geofence violations, manual edits, missing-log alerts, and other workforce signals."
        icon={Bell}
        actions={
          <Button onClick={() => runCheck.mutate()} disabled={runCheck.isPending} className="gap-2 bg-gradient-primary shadow-elegant hover:opacity-95">
            <Play className="h-4 w-4" /> Run missing-logs check
          </Button>
        }
      />

      <Card className="border-border/60 bg-card shadow-card">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-primary" /> Inbox
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-3">
          {items.map((n) => {
            const { icon: Icon, cls } = iconFor[n.type] ?? iconFor.info;
            return (
              <div
                key={n.id}
                className={cn(
                  "group flex items-start gap-3 rounded-xl border p-3 transition-colors",
                  n.read
                    ? "border-border/60 bg-card"
                    : "border-primary/20 bg-primary/[0.03] shadow-card",
                )}
              >
                <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-border/60", n.read ? "bg-muted" : "bg-card")}>
                  <Icon className={cn("h-4 w-4", cls)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={cn("text-sm", !n.read && "font-semibold text-foreground")}>{n.message}</div>
                  <div className="mt-0.5 font-mono-data text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </div>
                </div>
                {!n.read && (
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => markRead.mutate(n.id)}>
                    <CheckCheck className="h-4 w-4" /> Mark read
                  </Button>
                )}
              </div>
            );
          })}
          {items.length === 0 && (
            <EmptyState
              icon={Bell}
              title="Inbox zero"
              description="No notifications right now. Anything urgent — geofence violations, manual edits, missing logs — will show up here."
              className="border-0 bg-transparent py-8"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

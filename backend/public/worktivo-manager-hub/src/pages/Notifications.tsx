import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationRead, runMissingLogsCheck } from "@/lib/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, CheckCheck, Info, Pencil, Play } from "lucide-react";
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
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unread.length} unread alerts</p>
        </div>
        <Button onClick={() => runCheck.mutate()} disabled={runCheck.isPending} className="gap-2">
          <Play className="h-4 w-4" /> Run missing-logs check
        </Button>
      </header>

      <Card className="border-border bg-card">
        <CardHeader>
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
                  "flex items-start gap-3 rounded-md border border-border p-3",
                  n.read ? "bg-secondary/20" : "bg-secondary/50",
                )}
              >
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", cls)} />
                <div className="min-w-0 flex-1">
                  <div className={cn("text-sm", !n.read && "font-semibold text-foreground")}>{n.message}</div>
                  <div className="font-mono-data text-[11px] text-muted-foreground">
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
            <p className="py-10 text-center text-sm text-muted-foreground">No notifications.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

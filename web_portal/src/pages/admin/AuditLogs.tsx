import {
  Search,
  Building2,
  User,
  Download,
  AlertCircle,
  FileEdit,
  Trash2,
  Lock,
  Loader2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPlatformAuditLogs } from "@/lib/services";
import { cn, formatDate } from "@/lib/utils";

const actionIcons: Record<string, any> = {
  UPDATE_SETTINGS: FileEdit,
  DELETE_USER: Trash2,
  SUSPEND_ORG: Lock,
  CREATE_SITE: Building2,
};

export default function AdminAuditLogs() {
  const [search, setSearch] = useState("");
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["platform-audit-logs"],
    queryFn: getPlatformAuditLogs,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (auditLogs ?? []).filter(
      (l) =>
        !q ||
        l.action?.toLowerCase().includes(q) ||
        l.actor_email?.toLowerCase().includes(q) ||
        l.organization_name?.toLowerCase().includes(q),
    );
  }, [auditLogs, search]);

  const exportCsv = () => {
    const header = "timestamp,action,actor,organization,entity_type,details,severity\n";
    const rows = filtered
      .map((l) =>
        [
          l.created_at,
          l.action,
          l.actor_email,
          l.organization_name,
          l.entity_type,
          JSON.stringify(l.details ?? {}).replace(/"/g, '""'),
          l.severity,
        ]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">System-wide activity and security event tracking.</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary disabled:opacity-50"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border bg-secondary/20 px-6 py-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs by action, user, or org..."
              className="h-9 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No audit events recorded yet.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-secondary/10">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">User / Organization</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((log) => {
                  const Icon = actionIcons[log.action] || AlertCircle;
                  return (
                    <tr key={log.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-lg border",
                              log.severity === "info"
                                ? "bg-primary/5 text-primary border-primary/10"
                                : log.severity === "error"
                                ? "bg-destructive/5 text-destructive border-destructive/10"
                                : "bg-warning/10 text-warning border-warning/20",
                            )}
                          >
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{log.action}</p>
                            <p className="text-[10px] font-mono text-muted-foreground">{log.entity_type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            <User size={12} className="text-muted-foreground" /> {log.actor_email}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Building2 size={10} /> {log.organization_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {typeof log.details === "string" ? log.details : JSON.stringify(log.details)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs font-medium text-foreground">{formatDate(log.created_at)}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {new Date(log.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

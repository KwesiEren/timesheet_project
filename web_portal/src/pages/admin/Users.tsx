import {
  Search,
  Mail,
  Building2,
  Clock,
  UserX,
  UserCheck,
  Loader2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminUsers, setUserSuspended } from "@/lib/services";
import { cn, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
  });

  const suspendMut = useMutation({
    mutationFn: ({ id, suspended }: { id: string; suspended: boolean }) => setUserSuspended(id, suspended),
    onSuccess: (_d, vars) => {
      toast({ title: vars.suspended ? "User suspended" : "User reactivated" });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => toast({ title: "Update failed", description: err.message, variant: "destructive" }),
  });

  const filtered = useMemo(
    () =>
      (users ?? []).filter((u) => {
        const q = search.toLowerCase();
        return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
      }),
    [users, search],
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global User Management</h1>
        <p className="text-muted-foreground mt-1">Monitor and manage users across all organizations.</p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border bg-secondary/20 px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="h-9 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> results
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No users match the current search.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-secondary/10">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Organizations & Roles</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Active</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((user) => (
                  <tr key={user.id} className="group hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground font-bold">
                          {user.name?.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{user.name}</p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail size={12} /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.organizations.map((org, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium shadow-sm"
                          >
                            <Building2 size={10} className="text-muted-foreground" />
                            <span>{org.name}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-primary font-semibold uppercase tracking-tighter">{org.role}</span>
                          </div>
                        ))}
                        {user.organizations.length === 0 && (
                          <span className="text-[10px] text-muted-foreground italic">No memberships</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock size={14} /> {user.last_active ? formatDate(user.last_active) : "Never"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-tight ring-1 ring-inset",
                          user.status === "active"
                            ? "bg-success/5 text-success ring-success/20"
                            : "bg-destructive/5 text-destructive ring-destructive/20",
                        )}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === "active" ? (
                          <button
                            disabled={suspendMut.isPending}
                            onClick={() => {
                              if (confirm(`Suspend ${user.name}? They will lose access immediately.`)) {
                                suspendMut.mutate({ id: user.id, suspended: true });
                              }
                            }}
                            className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md disabled:opacity-50"
                            title="Suspend user"
                          >
                            <UserX size={18} />
                          </button>
                        ) : (
                          <button
                            disabled={suspendMut.isPending}
                            onClick={() => suspendMut.mutate({ id: user.id, suspended: false })}
                            className="p-1.5 text-success hover:bg-success/10 rounded-md disabled:opacity-50"
                            title="Reactivate user"
                          >
                            <UserCheck size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

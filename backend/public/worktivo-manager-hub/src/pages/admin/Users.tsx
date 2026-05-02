import { 
  Search, 
  Filter, 
  Mail, 
  Building2, 
  Shield, 
  Clock, 
  MoreVertical,
  UserX,
  History,
  Loader2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAdminUsers } from "@/lib/services";
import { cn, formatDate } from "@/lib/utils";

export default function AdminUsers() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global User Management</h1>
        <p className="text-muted-foreground mt-1">Monitor and manage users across all organizations.</p>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="border-b border-border bg-secondary/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, or user ID..."
                className="h-9 w-full rounded-md border border-input bg-white pl-10 pr-4 text-sm transition-colors focus:border-primary focus:outline-none"
              />
            </div>
            <button className="flex items-center gap-2 rounded-md border border-input bg-white px-3 py-1.5 text-sm font-medium hover:bg-secondary">
              <Filter size={16} /> Filters
            </button>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{users?.length || 0}</span> results
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                {users?.map((user) => (
                  <tr key={user.id} className="group hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground font-bold">
                          {user.name.charAt(0)}
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
                          <div key={i} className="flex items-center gap-1.5 rounded-md border border-border bg-white px-2 py-1 text-[10px] font-medium shadow-sm">
                            <Building2 size={10} className="text-muted-foreground" />
                            <span>{org.name}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-primary font-semibold uppercase tracking-tighter">{org.role}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock size={14} /> {user.last_active ? formatDate(user.last_active) : "Never"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-tight ring-1 ring-inset",
                        user.status === "active" ? "bg-success/5 text-success ring-success/20" : "bg-destructive/5 text-destructive ring-destructive/20"
                      )}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md" title="Audit Logs">
                          <History size={18} />
                        </button>
                        <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md" title="Edit Permissions">
                          <Shield size={18} />
                        </button>
                        <button className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md" title="Suspend User">
                          <UserX size={18} />
                        </button>
                      </div>
                      <MoreVertical size={18} className="inline group-hover:hidden text-muted-foreground" />
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

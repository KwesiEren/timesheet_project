import {
  Search,
  Mail,
  Building2,
  Clock,
  UserX,
  UserCheck,
  Loader2,
  Plus,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminUsers, setUserSuspended, createAdminUser, updateAdminUser, deleteAdminUser } from "@/lib/services";
import { cn, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/use-confirm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminUsers() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<{ id?: string; name: string; email: string } | null>(null);

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

  const deleteMut = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      toast({ title: "User deleted", variant: "destructive" });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => toast({ title: "Delete failed", description: err.message, variant: "destructive" }),
  });

  const saveMut = useMutation({
    mutationFn: async ({ id, payload }: { id?: string; payload: any }) => {
      if (id) {
        await updateAdminUser(id, payload);
      } else {
        await createAdminUser(payload);
      }
    },
    onSuccess: () => {
      toast({ title: "User saved successfully" });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setIsFormOpen(false);
      setEditingUser(null);
    },
    onError: (err: any) => toast({ title: "Save failed", description: err.message, variant: "destructive" }),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Global User Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage users across all organizations.</p>
        </div>
        <Button onClick={() => {
          setEditingUser(null);
          setIsFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Global User
        </Button>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors">
                            <MoreVertical size={18} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setEditingUser({ id: user.id, name: user.name, email: user.email });
                            setIsFormOpen(true);
                          }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          
                          {user.status === "active" ? (
                            <DropdownMenuItem 
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={async () => {
                                const ok = await confirm({
                                  title: "Suspend user?",
                                  description: `Suspend ${user.name}? They will lose access immediately.`,
                                  confirmLabel: "Suspend",
                                  destructive: true,
                                });
                                if (ok) suspendMut.mutate({ id: user.id, suspended: true });
                              }}
                            >
                              <UserX className="mr-2 h-4 w-4" /> Suspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="text-success focus:bg-success/10 focus:text-success"
                              onClick={() => suspendMut.mutate({ id: user.id, suspended: false })}
                            >
                              <UserCheck className="mr-2 h-4 w-4" /> Reactivate User
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={async () => {
                              const ok = await confirm({
                                title: "Delete user?",
                                description: `Permanently delete "${user.name}"? This cannot be undone.`,
                                confirmLabel: "Delete",
                                destructive: true,
                              });
                              if (ok) deleteMut.mutate(user.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setEditingUser(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser?.id ? "Edit User" : "Create Global User"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const payload: any = {
              name: formData.get("name") as string,
              email: formData.get("email") as string,
            };
            if (!editingUser?.id) {
              payload.password = formData.get("password") as string;
            }
            saveMut.mutate({ id: editingUser?.id, payload });
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Full Name</Label>
              <Input id="user-name" name="name" defaultValue={editingUser?.name || ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email Address</Label>
              <Input id="user-email" type="email" name="email" defaultValue={editingUser?.email || ""} required />
            </div>
            {!editingUser?.id && (
              <div className="space-y-2">
                <Label htmlFor="user-password">Temporary Password</Label>
                <Input id="user-password" type="password" name="password" required />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMut.isPending}>
                {saveMut.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog />
    </div>
  );
}

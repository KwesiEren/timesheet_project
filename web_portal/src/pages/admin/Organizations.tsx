import { 
  Building2, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Slash, 
  Trash2,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  Zap,
  ZapOff,
  AlertTriangle,
  Plus,
  Edit
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminOrganizations, updateOrganizationStatus, deleteOrganization, createAdminOrganization, updateOrganizationSettings } from "@/lib/services";
import { cn, formatDate } from "@/lib/utils";
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
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo, useEffect } from "react";

export default function AdminOrganizations() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<{ id?: string; name: string; plan: "Free" | "Paid" } | null>(null);

  const { data: organizations, isLoading } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: getAdminOrganizations,
  });

  const statusMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateOrganizationStatus(id, payload),
    onSuccess: () => {
      toast({ title: "Organization updated" });
      qc.invalidateQueries({ queryKey: ["admin-organizations"] });
    },
    onError: (err: any) => toast({ title: "Update failed", description: err.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteOrganization,
    onSuccess: () => {
      toast({ title: "Organization deleted", variant: "destructive" });
      qc.invalidateQueries({ queryKey: ["admin-organizations"] });
    },
    onError: (err: any) => toast({ title: "Delete failed", description: err.message, variant: "destructive" }),
  });

  const saveMut = useMutation({
    mutationFn: async ({ id, payload }: { id?: string; payload: any }) => {
      if (id) {
        await updateOrganizationSettings(id, payload);
      } else {
        await createAdminOrganization(payload);
      }
    },
    onSuccess: () => {
      toast({ title: "Organization saved successfully" });
      qc.invalidateQueries({ queryKey: ["admin-organizations"] });
      setIsFormOpen(false);
      setEditingOrg(null);
    },
    onError: (err: any) => toast({ title: "Save failed", description: err.message, variant: "destructive" }),
  });

  const filtered = useMemo(
    () => (organizations ?? []).filter((o) => o.name.toLowerCase().includes(search.toLowerCase())),
    [organizations, search],
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground mt-1">Manage all tenants and their subscriptions.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex -space-x-2">
              <div className="h-8 w-8 rounded-full border-2 border-white bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">F</div>
              <div className="h-8 w-8 rounded-full border-2 border-white bg-warning/10 flex items-center justify-center text-[10px] font-bold text-warning">P</div>
           </div>
           <p className="text-sm text-muted-foreground">2 tiers active</p>
        </div>
        <Button onClick={() => {
          setEditingOrg(null);
          setIsFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Organization
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border bg-secondary/20 px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search organizations..."
                className="h-9 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm transition-colors focus:border-primary focus:outline-none"
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
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-secondary/10">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Organization</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Usage</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((org) => (
                  <tr key={org.id} className="group hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary font-bold border border-primary/10">
                          {org.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{org.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">ID: {org.id.split('-')[0]}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset",
                        org.plan === "Paid" ? "bg-success/10 text-success ring-success/20" : "bg-muted text-muted-foreground ring-muted-foreground/20"
                      )}>
                        {org.plan === "Paid" ? "PAID" : "FREE"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/60">Projects</span>
                          <span className={cn(
                            "font-mono-data font-bold",
                            org.plan === "Free" && org.sites_count >= 2 ? "text-warning" : "text-foreground"
                          )}>
                            {org.sites_count} {org.plan === "Free" ? "/ 2" : ""}
                          </span>
                        </div>
                        <div className="flex flex-col border-l border-border pl-4">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/60">Employees</span>
                          <span className={cn(
                            "font-mono-data font-bold",
                            org.plan === "Free" && org.users_count >= 5 ? "text-warning" : "text-foreground"
                          )}>
                            {org.users_count} {org.plan === "Free" ? "/ 5" : ""}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(org.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {org.status === "active" ? (
                          <span className="flex items-center gap-1 text-success text-[10px] font-bold uppercase">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-destructive text-[10px] font-bold uppercase">
                            <AlertTriangle size={12} /> Suspended
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors">
                            <MoreVertical size={18} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Manage Organization</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setEditingOrg({ id: org.id, name: org.name, plan: org.plan });
                            setIsFormOpen(true);
                          }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`/admin/organizations/${org.id}`, "_blank")}>
                            <Eye className="mr-2 h-4 w-4" /> View Full Profile
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Subscription</DropdownMenuLabel>
                          {org.plan === "Free" ? (
                            <DropdownMenuItem onClick={() => statusMut.mutate({ id: org.id, payload: { plan: "Paid" } })}>
                              <Zap className="mr-2 h-4 w-4 text-warning fill-warning" /> Upgrade to Paid
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => statusMut.mutate({ id: org.id, payload: { plan: "Free" } })}>
                              <ZapOff className="mr-2 h-4 w-4 text-muted-foreground" /> Downgrade to Free
                            </DropdownMenuItem>
                          )}
                          
                          {org.status === "active" ? (
                            <DropdownMenuItem 
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => statusMut.mutate({ id: org.id, payload: { status: "suspended" } })}
                            >
                              <Slash className="mr-2 h-4 w-4" /> Suspend Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="text-success focus:bg-success/10 focus:text-success"
                              onClick={() => statusMut.mutate({ id: org.id, payload: { status: "active" } })}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Reactivate Account
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={() => {
                              if (confirm(`Permanently delete "${org.name}"? This cannot be undone.`)) {
                                deleteMut.mutate(org.id);
                              }
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
        if (!open) setEditingOrg(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingOrg?.id ? "Edit Organization" : "Create Organization"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            saveMut.mutate({
              id: editingOrg?.id,
              payload: {
                name: formData.get("name") as string,
                plan: formData.get("plan") as "Free" | "Paid"
              }
            });
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input id="org-name" name="name" defaultValue={editingOrg?.name || ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-plan">Plan</Label>
              <select
                id="org-plan"
                name="plan"
                defaultValue={editingOrg?.plan || "Free"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMut.isPending}>
                {saveMut.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

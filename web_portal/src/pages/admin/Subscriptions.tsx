import { 
  Search, 
  CheckCircle2,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Building2,
  AlertCircle,
  MoreVertical,
  Zap,
  ZapOff
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBillingOverview, getAdminOrganizations, updateOrganizationStatus } from "@/lib/services";
import { cn, formatNumber, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminSubscriptions() {
  const { data: billing, isLoading: loadingBilling } = useQuery({
    queryKey: ["billing-overview"],
    queryFn: getBillingOverview
  });

  const { data: organizations, isLoading: loadingOrgs } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: getAdminOrganizations
  });

  const qc = useQueryClient();
  const { toast } = useToast();

  const statusMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateOrganizationStatus(id, payload),
    onSuccess: () => {
      toast({ title: "Plan updated successfully" });
      qc.invalidateQueries({ queryKey: ["admin-organizations"] });
      qc.invalidateQueries({ queryKey: ["billing-overview"] });
    },
    onError: (err: any) => toast({ title: "Update failed", description: err.message, variant: "destructive" }),
  });

  const isLoading = loadingBilling || loadingOrgs;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions & Billing</h1>
        <p className="text-muted-foreground mt-1">Manage platform revenue and organization plans.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Monthly Recurring Revenue"
          value={isLoading ? "..." : `$${formatNumber(billing?.mrr || 0)}`}
          icon={TrendingUp}
          subtitle="Live based on active Paid plans"
        />
        <StatsCard 
          title="Total Paid Organizations" 
          value={isLoading ? "..." : (billing?.pro_orgs || 0).toString()} 
          icon={Building2} 
          subtitle="Active subscriptions"
        />
        <StatsCard 
          title="Payment Failures" 
          value={isLoading ? "..." : (billing?.past_due || 0).toString()} 
          icon={AlertCircle} 
          subtitle="Organizations suspended"
          variant="destructive"
        />
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="border-b border-border bg-secondary/20 px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold">Recent Billing Status</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by organization..."
              className="h-9 w-full rounded-md border border-input bg-white pl-10 pr-4 text-sm focus:outline-none"
            />
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
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created At</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {organizations?.map((org) => (
                  <tr key={org.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">{org.name}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                        org.plan === "Paid" ? "bg-primary/5 text-primary ring-primary/20" : "bg-muted text-muted-foreground ring-muted-foreground/20"
                      )}>
                        {org.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono">{org.plan === "Paid" ? "$149/mo" : "$0/mo"}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(org.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {org.status === "active" ? (
                          <span className="flex items-center gap-1 text-success text-xs font-bold">
                            <CheckCircle2 size={14} /> ACTIVE
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-warning text-xs font-bold">
                            <AlertTriangle size={14} /> SUSPENDED
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
                          <DropdownMenuLabel>Manage Subscription</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {org.plan === "Free" ? (
                            <DropdownMenuItem onClick={() => statusMut.mutate({ id: org.id, payload: { plan: "Paid" } })}>
                              <Zap className="mr-2 h-4 w-4 text-warning fill-warning" /> Upgrade to Paid
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => statusMut.mutate({ id: org.id, payload: { plan: "Free" } })}>
                              <ZapOff className="mr-2 h-4 w-4 text-muted-foreground" /> Downgrade to Free
                            </DropdownMenuItem>
                          )}
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
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, subtitle, variant = "default" }: any) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            variant === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
          )}
        >
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <h3 className={cn("text-3xl font-bold", variant === "destructive" ? "text-destructive" : "text-foreground")}>
          {value}
        </h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

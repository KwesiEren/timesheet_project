import {
  Building2,
  Users,
  Clock,
  TrendingUp,
  Activity,
  FolderKanban,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getPlatformKpis, getPlatformWeeklyActivity } from "@/lib/services";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { QueryState } from "@/components/QueryState";
import { ShieldCheck } from "lucide-react";

const chartTick = { fontSize: 12, fill: "hsl(var(--muted-foreground))" };
const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--card))",
  boxShadow: "var(--shadow-card)",
};

export default function AdminDashboard() {
  const { data: kpis, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["platform-kpis"],
    queryFn: getPlatformKpis,
    refetchInterval: 300_000,
  });
  const { data: weeklyData = [], isLoading: loadingWeekly } = useQuery({
    queryKey: ["platform-weekly-activity"],
    queryFn: getPlatformWeeklyActivity,
    refetchInterval: 300_000,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform Admin"
        title="Platform Overview"
        description="Real-time metrics across all organizations and users."
        icon={ShieldCheck}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Organizations"
          value={isLoading ? "…" : (kpis?.total_organizations || 0).toLocaleString()}
          icon={Building2}
          tone="primary"
        />
        <StatCard
          label="Active Users"
          value={isLoading ? "…" : (kpis?.active_users || 0).toLocaleString()}
          icon={Users}
          tone="success"
        />
        <StatCard
          label="Timesheet Entries"
          value={isLoading ? "…" : (kpis?.total_timesheets || 0).toLocaleString()}
          icon={Clock}
          tone="accent"
        />
        <StatCard
          label="Total Projects"
          value={isLoading ? "…" : (kpis?.total_projects || 0).toLocaleString()}
          icon={FolderKanban}
          tone="warning"
          hint={isLoading ? undefined : `${kpis?.platform_growth ?? 0}% org growth (MoM)`}
        />
      </div>

      {isError && (
        <QueryState isLoading={false} isError error={error as Error} onRetry={() => refetch()}>
          <span />
        </QueryState>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Activity Trend</h3>
              <p className="text-sm text-muted-foreground">Timesheet entries vs active users</p>
            </div>
            <Activity className="text-muted-foreground" size={20} />
          </div>
          <div className="h-[300px] w-full">
            {loadingWeekly ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading chart…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={chartTick} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={chartTick} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={{ fontSize: "12px", fontWeight: 600 }} />
                  <Area
                    type="monotone"
                    dataKey="entries"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorEntries)"
                  />
                  <Area
                    type="monotone"
                    dataKey="active"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Organization Signups</h3>
              <p className="text-sm text-muted-foreground">New tenants per week</p>
            </div>
            <TrendingUp className="text-muted-foreground" size={20} />
          </div>
          <div className="h-[300px] w-full">
            {loadingWeekly ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading chart…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={chartTick} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={chartTick} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={tooltipStyle} />
                  <Bar dataKey="entries" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

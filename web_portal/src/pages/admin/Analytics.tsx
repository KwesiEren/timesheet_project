import { Calendar, Download, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getPlatformGrowth, getPlatformPlanMix } from "@/lib/services";
import { EmptyState } from "@/components/EmptyState";
import { BarChart3 } from "lucide-react";

const COLORS = ["hsl(var(--muted-foreground))", "hsl(var(--primary))"];

export default function AdminAnalytics() {
  const { data: growthData = [], isLoading: loadingGrowth } = useQuery({
    queryKey: ["platform-growth"],
    queryFn: getPlatformGrowth,
  });
  const { data: planData = [], isLoading: loadingPlans } = useQuery({
    queryKey: ["platform-plan-mix"],
    queryFn: getPlatformPlanMix,
  });

  const downloadCsv = () => {
    const header = "date,organizations,users\n";
    const rows = growthData.map((d) => `${d.date},${d.orgs},${d.users}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `platform-growth-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isEmpty = !loadingGrowth && growthData.every((d) => d.orgs === 0 && d.users === 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into platform growth and usage patterns.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary">
            <Calendar size={18} /> Last 6 Months
          </button>
          <button
            onClick={downloadCsv}
            disabled={loadingGrowth || isEmpty}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            <Download size={18} /> Download CSV
          </button>
        </div>
      </div>

      {loadingGrowth || loadingPlans ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isEmpty && planData.every((p) => p.value === 0) ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics data yet"
          description="Once organizations sign up and start logging time, growth and usage metrics will appear here."
        />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-6">User Acquisition</h3>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-6">Subscription Mix</h3>
              <div className="h-[350px] w-full flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={planData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {planData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-8">
                  {planData.map((p) => (
                    <div key={p.name} className="text-center">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{p.name}</p>
                      <p className="text-xl font-bold">{p.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Organization Growth</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip />
                  <Line type="stepAfter" dataKey="orgs" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 6, fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

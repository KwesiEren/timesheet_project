import React from "react";
import { 
  Building2, 
  Users, 
  Clock, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
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
  Bar
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getPlatformKpis, getPlatformWeeklyActivity } from "@/lib/services";
import { cn } from "@/lib/utils";

function KpiCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-secondary/80 p-2 text-primary">
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold tracking-tight mt-1">{value}</h3>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ["platform-kpis"],
    queryFn: getPlatformKpis,
    refetchInterval: 300_000,
  });
  const { data: weeklyData = [] } = useQuery({
    queryKey: ["platform-weekly-activity"],
    queryFn: getPlatformWeeklyActivity,
    refetchInterval: 300_000,
  });
  const data = weeklyData;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time metrics across all organizations and users.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Organizations"
          value={isLoading ? "..." : (kpis?.total_organizations || 0).toLocaleString()}
          icon={Building2}
        />
        <KpiCard
          title="Active Users"
          value={isLoading ? "..." : (kpis?.active_users || 0).toLocaleString()}
          icon={Users}
        />
        <KpiCard
          title="Timesheet Entries"
          value={isLoading ? "..." : (kpis?.total_timesheets || 0).toLocaleString()}
          icon={Clock}
        />
        <KpiCard
          title="Active Projects"
          value={isLoading ? "..." : (kpis?.platform_growth || 0).toLocaleString()}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Activity Trend</h3>
              <p className="text-sm text-muted-foreground">Timesheet entries vs Active users</p>
            </div>
            <Activity className="text-muted-foreground" size={20} />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="entries" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorEntries)" />
                <Area type="monotone" dataKey="active" stroke="#64748b" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Organization Signups</h3>
              <p className="text-sm text-muted-foreground">New tenants per day</p>
            </div>
            <TrendingUp className="text-muted-foreground" size={20} />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="entries" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

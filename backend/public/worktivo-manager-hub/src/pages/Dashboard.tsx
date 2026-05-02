import { useEffect } from "react";
import { MapContainer, TileLayer, Circle, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-setup";
import { useQuery } from "@tanstack/react-query";
import { getDashboardKpis, getLiveEmployees, getSites } from "@/lib/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPill } from "@/components/StatusPill";
import { Activity, AlertTriangle, Clock, ClipboardCheck, Users, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function Kpi({ label, value, icon: Icon, tone }: { label: string; value: number | string; icon: React.ElementType; tone: string }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1 font-mono-data text-3xl font-bold text-foreground">{value}</div>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isPaid, usage, limits } = useSubscription();
  const { data: kpis } = useQuery({ queryKey: ["kpis"], queryFn: getDashboardKpis, refetchInterval: 30_000 });
  const { data: employees = [] } = useQuery({ queryKey: ["live-employees"], queryFn: getLiveEmployees, refetchInterval: 15_000 });
  const { data: sites = [] } = useQuery({ queryKey: ["sites"], queryFn: getSites });

  const center: [number, number] = sites[0] ? [sites[0].lat, sites[0].lng] : [5.6037, -0.1870]; // Accra default

  // counts of clocked-in per site
  const counts = employees.reduce<Record<string, number>>((acc, e) => {
    if (e.current_site_id && e.status === "clocked_in") {
      acc[e.current_site_id] = (acc[e.current_site_id] ?? 0) + 1;
    }
    return acc;
  }, {});

  useEffect(() => {
    document.title = "Dashboard · Worktivo";
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Live workforce overview · {format(new Date(), "EEE, MMM d · HH:mm")}</p>
        </div>
        {!isPaid && (
          <Button 
            variant="outline" 
            className="hidden border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 sm:flex"
            onClick={() => navigate("/admin/subscriptions")}
          >
            <Zap className="mr-2 h-4 w-4 fill-current" /> Upgrade to Pro
          </Button>
        )}
      </header>

      {!isPaid && (
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background p-6">
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck size={20} />
                <h3 className="font-bold">Free Plan Active</h3>
              </div>
              <p className="text-sm text-muted-foreground max-w-xl">
                You're currently using the Free plan. To manage more than {limits.projects} projects or {limits.employees} employees, upgrade to our Paid tier with unlimited capacity.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Projects</div>
                <div className="text-lg font-mono-data font-bold">{usage?.projects || 0} / {limits.projects}</div>
              </div>
              <div className="text-center border-l border-border pl-6">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Employees</div>
                <div className="text-lg font-mono-data font-bold">{usage?.employees || 0} / {limits.employees}</div>
              </div>
              <Button className="gap-2" onClick={() => navigate("/admin/subscriptions")}>
                Upgrade <ArrowRight size={16} />
              </Button>
            </div>
          </div>
          <Zap className="absolute -right-8 -top-8 h-48 w-48 text-primary/5 rotate-12" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Clocked in now" value={kpis?.clocked_in_now ?? 0} icon={Users} tone="bg-success/15 text-success" />
        <Kpi label="Late today" value={kpis?.late_today ?? 0} icon={Clock} tone="bg-warning/15 text-warning" />
        <Kpi label="Pending approvals" value={kpis?.pending_approvals ?? 0} icon={ClipboardCheck} tone="bg-primary/15 text-primary" />
        <Kpi label="Open alerts" value={kpis?.open_alerts ?? 0} icon={AlertTriangle} tone="bg-destructive/15 text-destructive" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Live Status Table */}
        <Card className="border-border bg-card xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" /> Workforce status
            </CardTitle>
            <span className="text-xs text-muted-foreground font-mono-data">{employees.length} active</span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="zebra max-h-[480px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead className="text-right">Since</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((e) => {
                    const site = sites.find((s) => s.id === e.current_site_id);
                    return (
                      <TableRow key={e.id} className="border-border">
                        <TableCell className="py-2 font-medium">{e.name}</TableCell>
                        <TableCell className="py-2"><StatusPill status={e.status ?? "clocked_out"} /></TableCell>
                        <TableCell className="py-2 text-muted-foreground">{site?.name ?? "—"}</TableCell>
                        <TableCell className="py-2 text-right font-mono-data text-muted-foreground text-xs">
                          {e.clocked_in_at ? format(new Date(e.clocked_in_at), "HH:mm") : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {employees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                        No employees currently clocked in.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar: Activity & Map */}
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Recent Logs
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold tracking-tight" onClick={() => navigate("/timesheets")}>
                History <ArrowRight size={10} className="ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {employees.slice(0, 4).map((e) => (
                  <div key={e.id} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${e.status === 'clocked_in' ? 'bg-success' : 'bg-muted-foreground/30'}`} />
                      <div>
                        <div className="text-xs font-medium">{e.name}</div>
                        <div className="text-[9px] text-muted-foreground uppercase font-mono-data">
                          {e.status === 'clocked_in' ? 'Joined' : 'Left'} · {e.clocked_in_at ? format(new Date(e.clocked_in_at), "HH:mm") : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {employees.length === 0 && (
                  <div className="p-8 text-center text-[10px] text-muted-foreground">No recent log activity.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-border bg-secondary/10">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sites Map</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[220px] w-full">
                <MapContainer center={center} zoom={11} className="h-full w-full" zoomControl={false}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {sites.map((s) => (
                    <Circle
                      key={s.id}
                      center={[s.lat, s.lng]}
                      radius={s.radius}
                      pathOptions={{ color: "hsl(var(--primary))", fillColor: "hsl(var(--primary))", fillOpacity: 0.1, weight: 1 }}
                    />
                  ))}
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

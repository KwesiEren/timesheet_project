import { useEffect } from "react";
import { MapContainer, TileLayer, Circle, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-setup";
import { useQuery } from "@tanstack/react-query";
import { getDashboardKpis, getLiveEmployees, getSites } from "@/lib/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPill } from "@/components/StatusPill";
import { Activity, AlertTriangle, Clock, ClipboardCheck, Users } from "lucide-react";
import { format } from "date-fns";

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
      <header>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Live workforce overview · {format(new Date(), "EEE, MMM d · HH:mm")}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Clocked in now" value={kpis?.clocked_in_now ?? 0} icon={Users} tone="bg-success/15 text-success" />
        <Kpi label="Late today" value={kpis?.late_today ?? 0} icon={Clock} tone="bg-warning/15 text-warning" />
        <Kpi label="Pending approvals" value={kpis?.pending_approvals ?? 0} icon={ClipboardCheck} tone="bg-primary/15 text-primary" />
        <Kpi label="Open alerts" value={kpis?.open_alerts ?? 0} icon={AlertTriangle} tone="bg-destructive/15 text-destructive" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border-border bg-card xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" /> Live employees
            </CardTitle>
            <span className="text-xs text-muted-foreground font-mono-data">{employees.length} total</span>
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
                        <TableCell className="py-2 text-right font-mono-data text-muted-foreground">
                          {e.clocked_in_at ? format(new Date(e.clocked_in_at), "HH:mm") : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {employees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                        No employees yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Sites map</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[480px] w-full overflow-hidden rounded-b-lg">
              <MapContainer center={center} zoom={12} className="h-full w-full">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap"
                />
                {sites.map((s) => (
                  <Circle
                    key={s.id}
                    center={[s.lat, s.lng]}
                    radius={s.radius}
                    pathOptions={{ color: "hsl(33 100% 50%)", fillColor: "hsl(33 100% 50%)", fillOpacity: 0.15, weight: 2 }}
                  >
                    <Tooltip>
                      <strong>{s.name}</strong>
                      <br />
                      Clocked in: {counts[s.id] ?? 0}
                    </Tooltip>
                  </Circle>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approveEmployees, getEmployees, getSites, setEmployeeStatus } from "@/lib/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/StatusPill";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Employees() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [siteId, setSiteId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: sites = [] } = useQuery({ queryKey: ["sites"], queryFn: getSites });
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["employees-history", from, to, siteId, status],
    queryFn: () =>
      getEmployees({
        from: from || undefined,
        to: to || undefined,
        site_id: siteId === "all" ? undefined : siteId,
        status: status === "all" ? undefined : status,
      }),
  });

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  const toggleOne = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const approve = useMutation({
    mutationFn: () => approveEmployees(Array.from(selected)),
    onSuccess: () => {
      toast({ title: `Approved ${selected.size} entr${selected.size === 1 ? "y" : "ies"}` });
      setSelected(new Set());
      qc.invalidateQueries({ queryKey: ["employees-history"] });
    },
    onError: (e: Error) => toast({ title: "Approval failed", description: e.message, variant: "destructive" }),
  });

  const setStatusMut = useMutation({
    mutationFn: ({ id, s }: { id: string; s: string }) => setEmployeeStatus(id, s),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees-history"] }),
  });

  const totalHours = useMemo(() => rows.reduce((a, r) => a + (r.hours ?? 0), 0), [rows]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employees</h1>
          <p className="text-sm text-muted-foreground">Aggregated history · approve & manage entries</p>
        </div>
        <Button
          disabled={selected.size === 0 || approve.isPending}
          onClick={() => approve.mutate()}
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4" /> Approve selected ({selected.size})
        </Button>
      </header>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="from">From</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Site</Label>
            <Select value={siteId} onValueChange={setSiteId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sites</SelectItem>
                {sites.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{rows.length} entries</CardTitle>
          <span className="text-xs text-muted-foreground">
            Total hours: <span className="font-mono-data text-foreground">{totalHours.toFixed(2)}</span>
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="zebra overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Clock in</TableHead>
                  <TableHead>Clock out</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} className="border-border">
                    <TableCell className="py-2">
                      <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleOne(r.id)} />
                    </TableCell>
                    <TableCell className="py-2 font-medium">{r.employee_name}</TableCell>
                    <TableCell className="py-2 text-muted-foreground">{r.site_name}</TableCell>
                    <TableCell className="py-2 font-mono-data text-sm">{format(new Date(r.clock_in), "MMM d HH:mm")}</TableCell>
                    <TableCell className="py-2 font-mono-data text-sm">
                      {r.clock_out ? format(new Date(r.clock_out), "MMM d HH:mm") : "—"}
                    </TableCell>
                    <TableCell className="py-2 text-right font-mono-data">{r.hours?.toFixed(2) ?? "—"}</TableCell>
                    <TableCell className="py-2 space-x-1">
                      <StatusPill status={r.status} />
                      {r.manual_edit && <StatusPill status="manual_edit" />}
                      {r.geofence_violation && <StatusPill status="geofence_violation" />}
                    </TableCell>
                    <TableCell className="py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setStatusMut.mutate({ id: r.id, s: "approved" })}>
                            Mark approved
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatusMut.mutate({ id: r.id, s: "absent" })}>
                            Mark absent
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatusMut.mutate({ id: r.id, s: "late" })}>
                            Mark late
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      No entries match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

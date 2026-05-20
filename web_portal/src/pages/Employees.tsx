import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approveEmployees, getEmployees, getSites, inviteEmployee, setEmployeeStatus } from "@/lib/services";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle2, MoreHorizontal, UserPlus, Users, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
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
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("employee");
  const [invitePrimarySite, setInvitePrimarySite] = useState<string>("");

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

  const inviteMut = useMutation({
    mutationFn: () =>
      inviteEmployee({
        email: inviteEmail,
        role: inviteRole,
        primary_site_id: invitePrimarySite || undefined,
      }),
    onSuccess: () => {
      toast({ title: "Invite sent", description: `${inviteEmail} will receive an email.` });
      setInviteOpen(false);
      setInviteEmail("");
      setInvitePrimarySite("");
    },
    onError: (e: Error) => toast({ title: "Invite failed", description: e.message, variant: "destructive" }),
  });

  const totalHours = useMemo(() => rows.reduce((a, r) => a + (r.hours ?? 0), 0), [rows]);

  const exportCsv = () => {
    if (rows.length === 0) return;
    const header = ["Employee", "Site", "Clock In", "Clock Out", "Hours", "Status"];
    const csv = [
      header.join(","),
      ...rows.map(r => [
        `"${r.employee_name || ''}"`,
        `"${r.site_name || ''}"`,
        `"${r.clock_in ? new Date(r.clock_in).toLocaleString() : ''}"`,
        `"${r.clock_out ? new Date(r.clock_out).toLocaleString() : ''}"`,
        r.hours?.toFixed(2) || "0",
        r.status || "pending"
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employees_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workforce"
        title="Employees"
        description="Aggregated worker history with filtering, status overrides, and bulk approvals."
        icon={Users}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={exportCsv} disabled={rows.length === 0}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <UserPlus className="h-4 w-4" /> Invite employee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite employee</DialogTitle>
                  <DialogDescription>Send an email invitation to join your organization.</DialogDescription>
                </DialogHeader>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    inviteMut.mutate();
                  }}
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="invite-email">Email</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="worker@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Primary site (optional)</Label>
                    <Select value={invitePrimarySite || "none"} onValueChange={(v) => setInvitePrimarySite(v === "none" ? "" : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {sites.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={inviteMut.isPending} className="gap-2">
                      <UserPlus className="h-4 w-4" /> Send invite
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button
              disabled={selected.size === 0 || approve.isPending}
              onClick={() => approve.mutate()}
              className="gap-2 bg-gradient-primary shadow-elegant hover:opacity-95"
            >
              <CheckCircle2 className="h-4 w-4" /> Approve selected ({selected.size})
            </Button>
          </div>
        }
      />

      <Card className="border-border/60 bg-card shadow-card">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 pt-5 md:grid-cols-4">
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

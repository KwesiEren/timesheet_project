import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTimesheets, updateTimesheet, approveTimesheet, rejectTimesheet, createTimesheet, getOrgMembers, getSites } from "@/lib/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPill } from "@/components/StatusPill";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pencil, Save, CheckCircle2, XCircle, Info, ExternalLink, ClipboardList, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { QueryState, TableSkeleton } from "@/components/QueryState";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { TimeEntry } from "@/types/api";

export default function Timesheets() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [editing, setEditing] = useState<TimeEntry | null>(null);
  const [editIn, setEditIn] = useState("");
  const [editOut, setEditOut] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createUserId, setCreateUserId] = useState("");
  const [createSiteId, setCreateSiteId] = useState("");
  const [createIn, setCreateIn] = useState("");
  const [createOut, setCreateOut] = useState("");
  const [createTitle, setCreateTitle] = useState("");

  const { data: members = [] } = useQuery({ queryKey: ["org-members"], queryFn: getOrgMembers });
  const { data: sites = [] } = useQuery({ queryKey: ["sites"], queryFn: getSites });

  const { data: rows = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["timesheets", from, to],
    queryFn: () => getTimesheets({ from: from || undefined, to: to || undefined }),
  });

  const approveMut = useMutation({
    mutationFn: approveTimesheet,
    onSuccess: () => {
      toast({ title: "Approved", description: "Entry has been marked as approved." });
      qc.invalidateQueries({ queryKey: ["timesheets"] });
    },
  });

  const rejectMut = useMutation({
    mutationFn: rejectTimesheet,
    onSuccess: () => {
      toast({ title: "Rejected", description: "Entry has been marked as rejected." });
      qc.invalidateQueries({ queryKey: ["timesheets"] });
    },
  });

  const mut = useMutation({
    mutationFn: (payload: { id: string; clock_in: string; clock_out: string }) =>
      updateTimesheet(payload.id, { clock_in: payload.clock_in, clock_out: payload.clock_out }),
    onSuccess: () => {
      toast({ title: "Updated", description: "Timesheet entry saved." });
      qc.invalidateQueries({ queryKey: ["timesheets"] });
      setEditing(null);
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err?.message || "Try again.", variant: "destructive" });
    },
  });

  const createMut = useMutation({
    mutationFn: () => createTimesheet({ 
      user_id: createUserId, 
      site_id: createSiteId, 
      start_time: new Date(createIn).toISOString(), 
      end_time: new Date(createOut).toISOString(),
      title: createTitle || undefined
    }),
    onSuccess: () => {
      toast({ title: "Entry added", description: "Manual time entry has been recorded." });
      qc.invalidateQueries({ queryKey: ["timesheets"] });
      setCreateOpen(false);
      setCreateUserId("");
      setCreateSiteId("");
      setCreateIn("");
      setCreateOut("");
      setCreateTitle("");
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" })
  });

  const openEdit = (r: TimeEntry) => {
    setEditing(r);
    setEditIn(r.clock_in.slice(0, 16));
    setEditOut((r.clock_out ?? "").slice(0, 16));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workforce"
        title="Timesheets"
        description="Review, edit, and approve worker time entries. Manual edits are flagged in the audit trail."
        icon={ClipboardList}
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-primary shadow-elegant hover:opacity-95">
                <Plus className="h-4 w-4" /> Add Manual Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Manual Entry</DialogTitle>
                <DialogDescription>Create a timesheet record on behalf of an employee.</DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }}>
                <div className="space-y-1.5">
                  <Label>Employee</Label>
                  <Select value={createUserId} onValueChange={setCreateUserId}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {members.map(m => <SelectItem key={m.id} value={m.id}>{m.name || m.email}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Site</Label>
                  <Select value={createSiteId} onValueChange={setCreateSiteId}>
                    <SelectTrigger><SelectValue placeholder="Select site" /></SelectTrigger>
                    <SelectContent>
                      {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Activity Title (Optional)</Label>
                  <Input value={createTitle} onChange={e => setCreateTitle(e.target.value)} placeholder="e.g. Site Visit" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Start Time</Label>
                    <Input type="datetime-local" value={createIn} onChange={e => setCreateIn(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>End Time</Label>
                    <Input type="datetime-local" value={createOut} onChange={e => setCreateOut(e.target.value)} required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMut.isPending || !createUserId || !createSiteId || !createIn || !createOut}>Save Entry</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="border-border/60 bg-card shadow-card">
        <CardHeader className="border-b border-border/60"><CardTitle className="text-base">Filters</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 pt-5 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="from">From</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card shadow-card">
        <CardHeader className="border-b border-border/60"><CardTitle className="text-base">{rows.length} {rows.length === 1 ? "entry" : "entries"}</CardTitle></CardHeader>
        <CardContent className="p-0">
          <QueryState
            isLoading={isLoading}
            isError={isError}
            error={error as Error}
            onRetry={() => refetch()}
            skeleton={<TableSkeleton rows={8} />}
          >
          <div className="zebra overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Clock in</TableHead>
                  <TableHead>Clock out</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} className="border-border group">
                    <TableCell className="py-2">
                      <div className="font-medium">{r.employee_name}</div>
                      {r.geofence_violation && <div className="text-[9px] text-destructive uppercase font-bold tracking-tighter">Geofence Violation</div>}
                    </TableCell>
                    <TableCell className="py-2 text-muted-foreground">{r.site_name}</TableCell>
                    <TableCell className="py-2 font-mono-data text-sm">
                      {format(new Date(r.clock_in), "MMM d HH:mm")}
                    </TableCell>
                    <TableCell className="py-2 font-mono-data text-sm">
                      {r.clock_out ? format(new Date(r.clock_out), "MMM d HH:mm") : "—"}
                    </TableCell>
                    <TableCell className="py-2 text-right font-mono-data">{r.hours?.toFixed(2) ?? "—"}</TableCell>
                    <TableCell className="py-2">
                      <StatusPill status={r.status || "pending"} />
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-success hover:bg-success/10"
                              onClick={() => approveMut.mutate(r.id)}
                              disabled={approveMut.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => rejectMut.mutate(r.id)}
                              disabled={rejectMut.isPending}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      No timesheet entries.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          </QueryState>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit timesheet</DialogTitle>
            <DialogDescription>
              Manual edits are flagged in the audit trail with original values preserved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ci">Clock in</Label>
              <Input id="ci" type="datetime-local" value={editIn} onChange={(e) => setEditIn(e.target.value)} className="font-mono-data" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="co">Clock out</Label>
              <Input id="co" type="datetime-local" value={editOut} onChange={(e) => setEditOut(e.target.value)} className="font-mono-data" />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() =>
                editing &&
                mut.mutate({
                  id: editing.id,
                  clock_in: new Date(editIn).toISOString(),
                  clock_out: new Date(editOut).toISOString(),
                })
              }
              disabled={mut.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTimesheets, updateTimesheet } from "@/lib/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPill } from "@/components/StatusPill";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pencil, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const { data: rows = [] } = useQuery({
    queryKey: ["timesheets", from, to],
    queryFn: () => getTimesheets({ from: from || undefined, to: to || undefined }),
  });

  const mut = useMutation({
    mutationFn: (payload: { id: string; clock_in: string; clock_out: string }) =>
      updateTimesheet(payload.id, { clock_in: payload.clock_in, clock_out: payload.clock_out }),
    onSuccess: () => {
      toast({ title: "Timesheet updated", description: "Manual edit logged to audit trail." });
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["timesheets"] });
    },
    onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const openEdit = (r: TimeEntry) => {
    setEditing(r);
    setEditIn(r.clock_in.slice(0, 16));
    setEditOut((r.clock_out ?? "").slice(0, 16));
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Timesheets</h1>
        <p className="text-sm text-muted-foreground">Edit entries · manual edits trigger audit-trail flagging.</p>
      </header>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base">Filters</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base">{rows.length} entries</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="zebra overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Clock in</TableHead>
                  <TableHead>Clock out</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} className="border-border">
                    <TableCell className="py-2 font-medium">{r.employee_name}</TableCell>
                    <TableCell className="py-2 text-muted-foreground">{r.site_name}</TableCell>
                    <TableCell className="py-2 font-mono-data text-sm">
                      {format(new Date(r.clock_in), "MMM d HH:mm")}
                      {r.original?.clock_in && (
                        <div className="text-[11px] text-warning">
                          was {format(new Date(r.original.clock_in), "MMM d HH:mm")}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-2 font-mono-data text-sm">
                      {r.clock_out ? format(new Date(r.clock_out), "MMM d HH:mm") : "—"}
                      {r.original?.clock_out && (
                        <div className="text-[11px] text-warning">
                          was {format(new Date(r.original.clock_out), "MMM d HH:mm")}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-2 text-right font-mono-data">{r.hours?.toFixed(2) ?? "—"}</TableCell>
                    <TableCell className="py-2 space-x-1">
                      {r.manual_edit && <StatusPill status="manual_edit" />}
                      {r.geofence_violation && <StatusPill status="geofence_violation" />}
                      {!r.manual_edit && !r.geofence_violation && <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="py-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
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

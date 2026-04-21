import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import JSZip from "jszip";
import { getEmployees, getPayrollPdf, getSites } from "@/lib/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText, Loader2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Payroll() {
  const { toast } = useToast();
  const { data: rows = [] } = useQuery({ queryKey: ["employees-history"], queryFn: () => getEmployees() });
  const { data: sites = [] } = useQuery({ queryKey: ["sites"], queryFn: getSites });

  // Build a unique employee list from history rows
  const employees = Array.from(
    new Map(rows.map((r) => [r.employee_id, { id: r.employee_id, name: r.employee_name ?? r.employee_id }])).values(),
  );

  const [from, setFrom] = useState(new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [bundling, setBundling] = useState(false);

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const preview = async (id: string, name: string) => {
    try {
      setPreviewing(true);
      const blob = await getPayrollPdf({ employee_id: id, from, to });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
      setPreviewName(name);
    } catch (e) {
      toast({ title: "Failed to load PDF", description: (e as Error).message, variant: "destructive" });
    } finally {
      setPreviewing(false);
    }
  };

  const downloadZip = async () => {
    if (selected.size === 0) return;
    try {
      setBundling(true);
      const zip = new JSZip();
      for (const id of selected) {
        const emp = employees.find((e) => e.id === id);
        const blob = await getPayrollPdf({ employee_id: id, from, to });
        zip.file(`${(emp?.name || id).replace(/[^\w-]+/g, "_")}_${from}_${to}.pdf`, blob);
      }
      const out = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(out);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payroll_${from}_${to}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Bundle ready", description: `${selected.size} reports zipped.` });
    } catch (e) {
      toast({ title: "Bundle failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBundling(false);
    }
  };

  const _ = sites; // future: filter by site

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Payroll Reports</h1>
        <p className="text-sm text-muted-foreground">Generate per-employee PDF reports or bulk-download as ZIP.</p>
      </header>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base">Period</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="from">From</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button
              className="w-full gap-2"
              disabled={selected.size === 0 || bundling}
              onClick={downloadZip}
            >
              {bundling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
              Bundle ZIP ({selected.size})
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-base">Employees</CardTitle></CardHeader>
          <CardContent className="space-y-1 p-3">
            {employees.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-md border border-border bg-secondary/30 p-2"
              >
                <label className="flex flex-1 cursor-pointer items-center gap-3">
                  <Checkbox checked={selected.has(e.id)} onCheckedChange={() => toggle(e.id)} />
                  <span className="text-sm font-medium">{e.name}</span>
                </label>
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => preview(e.id, e.name)}>
                  <FileText className="h-3.5 w-3.5" /> Preview
                </Button>
              </div>
            ))}
            {employees.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No employee data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{previewName || "Preview"}</CardTitle>
            {previewUrl && (
              <a href={previewUrl} download={`${previewName}.pdf`}>
                <Button size="sm" variant="outline" className="gap-2">
                  <Download className="h-4 w-4" /> Download
                </Button>
              </a>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex h-[600px] items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
              {previewing ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : previewUrl ? (
                <iframe title="Payroll preview" src={previewUrl} className="h-full w-full" />
              ) : (
                <p className="text-sm text-muted-foreground">Select an employee and click Preview.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

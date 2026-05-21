import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { inviteEmployee, getSites, removeEmployee } from "@/lib/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { UserPlus, Mail, Shield, AlertCircle, Zap, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/auth";
import { useSubscription } from "@/hooks/useSubscription";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";

export default function Team() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { isPaid, isAtEmployeeLimit, limits, usage } = useSubscription();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [department, setDepartment] = useState("");
  const [siteId, setSiteId] = useState("");

  const { data: sites = [] } = useQuery({ queryKey: ["sites"], queryFn: getSites });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["org-members", user?.organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          name,
          email,
          department,
          primary_site_id,
          user_roles!inner (
            role
          )
        `)
        .eq("organization_id", user?.organizationId);
      
      if (error) throw error;
      return data.map(m => ({
        ...m,
        role: m.user_roles[0]?.role
      }));
    },
    enabled: !!user?.organizationId
  });

  const resetInviteForm = () => {
    setEmail("");
    setRole("employee");
    setDepartment("");
    setSiteId("");
  };

  const inviteMut = useMutation({
    mutationFn: inviteEmployee,
    onSuccess: () => {
      toast({ title: "Invite sent", description: `An invitation has been sent to ${email}` });
      setInviteOpen(false);
      resetInviteForm();
      qc.invalidateQueries({ queryKey: ["org-members"] });
      qc.invalidateQueries({ queryKey: ["org-usage"] });
    },
    onError: (err: any) => {
      toast({ title: "Invite failed", description: err.message, variant: "destructive" });
    }
  });

  const removeMut = useMutation({
    mutationFn: removeEmployee,
    onSuccess: () => {
      toast({ title: "Member removed", description: "The employee has been removed from your organization." });
      qc.invalidateQueries({ queryKey: ["org-members"] });
      qc.invalidateQueries({ queryKey: ["org-usage"] });
    },
    onError: (err: any) => {
      toast({ title: "Removal failed", description: err.message, variant: "destructive" });
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workforce"
        title="Team Management"
        description="Invite members, assign roles, and connect people to their primary work sites."
        icon={UserPlus}
        actions={
          <>
            {!isPaid && (
              <div className="hidden rounded-lg border border-border bg-card px-3 py-1.5 text-right shadow-card sm:block">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Employees</div>
                <div className="font-mono-data text-sm font-bold">{usage?.employees || 0} / {limits.employees}</div>
              </div>
            )}
            <Dialog open={inviteOpen} onOpenChange={(o) => { setInviteOpen(o); if (!o) resetInviteForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-primary shadow-elegant hover:opacity-95" disabled={isAtEmployeeLimit}>
                  <UserPlus className="h-4 w-4" /> Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite new member</DialogTitle>
                  <DialogDescription>Send an email invitation to join your organization.</DialogDescription>
                </DialogHeader>
                <form
                  className="space-y-4 py-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
                      toast({ title: "Invalid email", variant: "destructive" });
                      return;
                    }
                    inviteMut.mutate({
                      email: email.trim(),
                      role,
                      department: department || undefined,
                      primary_site_id: !siteId || siteId === "none" ? undefined : siteId,
                    });
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" type="email" required placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department (optional)</Label>
                    <Input id="department" placeholder="e.g. Operations" value={department} onChange={(e) => setDepartment(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Primary Site (optional)</Label>
                    <Select value={siteId || "none"} onValueChange={(v) => setSiteId(v === "none" ? "" : v)}>
                      <SelectTrigger><SelectValue placeholder="Select a site" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {sites.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => { setInviteOpen(false); resetInviteForm(); }}>Cancel</Button>
                    <Button type="submit" disabled={inviteMut.isPending}>
                      {inviteMut.isPending ? "Sending..." : "Send Invite"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      {isAtEmployeeLimit && !isPaid && (
        <Alert variant="destructive" className="border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="font-bold text-primary">Employee Limit Reached</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 text-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>You've reached your limit of {limits.employees} employees on the Free plan. Upgrade to add more.</span>
            <Button size="sm" className="gap-2 bg-gradient-primary shadow-elegant" onClick={() => navigate("/manager/subscription")}>
              <Zap className="h-3 w-3 fill-current" /> Upgrade Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-border/60 bg-card shadow-card">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-base">{members.length} {members.length === 1 ? "Member" : "Members"}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Site</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{m.name || "Pending..."}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground italic">
                    {m.department || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 capitalize text-xs">
                      {m.role === "owner" ? <Shield className="h-3.5 w-3.5 text-primary" /> : <Mail className="h-3.5 w-3.5 text-muted-foreground" />}
                      {m.role}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {sites.find(s => s.id === m.primary_site_id)?.name || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => {
                        if (confirm(`Remove ${m.name || m.email} from the organization?`)) {
                          removeMut.mutate(m.id);
                        }
                      }}
                      disabled={removeMut.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

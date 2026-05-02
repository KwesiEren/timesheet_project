import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { inviteEmployee } from "@/lib/services";
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

export default function Team() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { isPaid, isAtEmployeeLimit, limits, usage } = useSubscription();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["org-members", user?.organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select(`
          id,
          name,
          email,
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

  const inviteMut = useMutation({
    mutationFn: inviteEmployee,
    onSuccess: () => {
      toast({ title: "Invite sent", description: `An invitation has been sent to ${email}` });
      setInviteOpen(false);
      setEmail("");
      qc.invalidateQueries({ queryKey: ["org-usage"] });
    },
    onError: (err: any) => {
      toast({ title: "Invite failed", description: err.message, variant: "destructive" });
    }
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
          <p className="text-sm text-muted-foreground">Manage your organization's members and invites.</p>
        </div>
        <div className="flex items-center gap-4">
          {!isPaid && (
            <div className="hidden text-right sm:block">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Employees Used</div>
              <div className="text-sm font-mono-data font-bold">
                {usage?.employees || 0} / {limits.employees}
              </div>
            </div>
          )}
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={isAtEmployeeLimit}>
                <UserPlus className="h-4 w-4" /> Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite new member</DialogTitle>
                <DialogDescription>Send an email invitation to join your organization.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@company.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={role} onValueChange={setRole}>
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
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                <Button onClick={() => inviteMut.mutate({ email, role })} disabled={inviteMut.isPending}>
                  Send Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {isAtEmployeeLimit && !isPaid && (
        <Alert variant="destructive" className="border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-bold">Employee Limit Reached</AlertTitle>
          <AlertDescription className="flex items-center justify-between text-foreground">
            <span>You’ve reached your limit of {limits.employees} employees on the Free plan. Upgrade to add more.</span>
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90" onClick={() => navigate("/admin/subscriptions")}>
              <Zap className="h-3 w-3 fill-current" /> Upgrade Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">{members.length} Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name || "Pending..."}</TableCell>
                  <TableCell className="text-muted-foreground">{m.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 capitalize">
                      {m.role === "owner" ? <Shield className="h-3.5 w-3.5 text-primary" /> : <Mail className="h-3.5 w-3.5 text-muted-foreground" />}
                      {m.role}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
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

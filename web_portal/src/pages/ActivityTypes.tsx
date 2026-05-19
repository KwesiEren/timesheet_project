import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getActivityTypes, createActivityType, updateActivityType, deleteActivityType } from "@/lib/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Tag, AlertCircle, HardHat } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import type { ActivityType } from "@/types/api";
import { useAuthStore } from "@/store/auth";

interface ActivityFormProps {
  initial?: ActivityType;
  onSubmit: (v: Partial<ActivityType>) => void;
  submitting: boolean;
}

function ActivityForm({ initial, onSubmit, submitting }: ActivityFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, is_active: isActive });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="name">Activity name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Site Maintenance" />
      </div>
      <div className="flex items-center justify-between rounded-md border border-border bg-secondary/40 p-3">
        <div>
          <Label className="text-sm">Enabled</Label>
          <p className="text-xs text-muted-foreground">Workers can select this activity when logging time.</p>
        </div>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={submitting}>{initial ? "Save changes" : "Add Activity"}</Button>
      </DialogFooter>
    </form>
  );
}

export default function ActivityTypes() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const { data: activities = [], isLoading } = useQuery({ queryKey: ["activity-types"], queryFn: getActivityTypes });
  
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityType | null>(null);

  const createMut = useMutation({
    mutationFn: (p: Partial<ActivityType>) => createActivityType({ ...p, organization_id: user?.organizationId }),
    onSuccess: () => {
      toast({ title: "Activity type added" });
      setCreateOpen(false);
      qc.invalidateQueries({ queryKey: ["activity-types"] });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ActivityType> }) => updateActivityType(id, payload),
    onSuccess: () => {
      toast({ title: "Activity type updated" });
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["activity-types"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteActivityType,
    onSuccess: () => {
      toast({ title: "Activity type removed" });
      qc.invalidateQueries({ queryKey: ["activity-types"] });
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Workforce"
        title="Activity Types"
        description="Define the tasks workers can pick from when clocking in or logging time."
        icon={HardHat}
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-primary shadow-elegant hover:opacity-95">
                <Plus className="h-4 w-4" /> Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add activity type</DialogTitle>
                <DialogDescription>Create a new task category for your workforce.</DialogDescription>
              </DialogHeader>
              <ActivityForm onSubmit={(v) => createMut.mutate(v)} submitting={createMut.isPending} />
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="border-border/60 bg-card shadow-card">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {activities.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${a.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Tag className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.is_active ? 'Enabled' : 'Disabled'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(a)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm(`Remove activity "${a.name}"?`)) deleteMut.mutate(a.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {activities.length === 0 && !isLoading && (
              <div className="py-12 text-center">
                <Tag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">No activity types defined</h3>
                <p className="text-sm text-muted-foreground mt-1">Activities help you categorize work and improve reporting.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit activity type</DialogTitle>
            <DialogDescription>Modify activity name or status.</DialogDescription>
          </DialogHeader>
          {editing && (
            <ActivityForm
              initial={editing}
              submitting={updateMut.isPending}
              onSubmit={(v) => updateMut.mutate({ id: editing.id, payload: v })}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

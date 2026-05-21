import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProjects, createProject, updateProject, deleteProject } from "@/lib/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, FolderKanban, AlertCircle, Zap } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import type { Project } from "@/types/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

interface ProjectFormProps {
  initial?: Project;
  onSubmit: (v: Partial<Project>) => void;
  submitting: boolean;
}

function ProjectForm({ initial, onSubmit, submitting }: ProjectFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, description, is_active: isActive });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="name">Project name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Skyline Apartments" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief project overview..." />
      </div>
      <div className="flex items-center justify-between rounded-md border border-border bg-secondary/40 p-3">
        <div>
          <Label className="text-sm">Active</Label>
          <p className="text-xs text-muted-foreground">Inactive projects are hidden from selection.</p>
        </div>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={submitting}>{initial ? "Save changes" : "Create project"}</Button>
      </DialogFooter>
    </form>
  );
}

export default function Projects() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const { isPaid, isAtProjectLimit, limits, usage } = useSubscription();
  const { data: projects = [], isLoading } = useQuery({ queryKey: ["projects"], queryFn: getProjects });
  
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const createMut = useMutation({
    mutationFn: (p: Partial<Project>) => createProject({ ...p, organization_id: user?.organizationId }),
    onSuccess: () => {
      toast({ title: "Project created" });
      setCreateOpen(false);
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["org-usage"] });
    },
    onError: (e: Error) => toast({ title: "Create failed", description: e.message, variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Project> }) => updateProject(id, payload),
    onSuccess: () => {
      toast({ title: "Project updated" });
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      toast({ title: "Project deleted" });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["org-usage"] });
    },
    onError: (e: Error) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Infrastructure"
        title="Projects"
        description="Group your sites, activities, and reports under high-level projects."
        icon={FolderKanban}
        actions={
          <>
            {!isPaid && (
              <div className="hidden rounded-lg border border-border bg-card px-3 py-1.5 text-right shadow-card sm:block">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Projects</div>
                <div className="font-mono-data text-sm font-bold">{usage?.projects || 0} / {limits.projects}</div>
              </div>
            )}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-primary shadow-elegant hover:opacity-95" disabled={isAtProjectLimit}>
                  <Plus className="h-4 w-4" /> New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create project</DialogTitle>
                  <DialogDescription>Add a new project to group your sites and activities.</DialogDescription>
                </DialogHeader>
                <ProjectForm onSubmit={(v) => createMut.mutate(v)} submitting={createMut.isPending} />
              </DialogContent>
            </Dialog>
          </>
        }
      />

      {isAtProjectLimit && !isPaid && (
        <Alert variant="destructive" className="border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-bold">Project Limit Reached</AlertTitle>
          <AlertDescription className="flex items-center justify-between text-foreground">
            <span>You’ve reached your limit of {limits.projects} projects on the Free plan. Upgrade to add more.</span>
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90" onClick={() => navigate("/subscription")}>
              <Zap className="h-3 w-3 fill-current" /> Upgrade Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Card
            key={p.id}
            className="group relative overflow-hidden border-border/60 bg-gradient-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
            <CardHeader className="relative flex flex-row items-start justify-between pb-2">
              <div className="space-y-1.5">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FolderKanban className="h-4 w-4" />
                  </div>
                  {p.name}
                </CardTitle>
                <div className="flex items-center gap-1.5 pl-10">
                  <span className={`h-1.5 w-1.5 rounded-full ${p.is_active ? "bg-success animate-pulse" : "bg-muted-foreground/40"}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    if (confirm(`Delete project "${p.name}"? This will affect sites linked to it.`)) deleteMut.mutate(p.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
                {p.description || "No description provided."}
              </p>
            </CardContent>
          </Card>
        ))}

        {projects.length === 0 && !isLoading && (
          <div className="col-span-full">
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Projects let you group multiple work sites and activities under one umbrella for cleaner reporting."
              action={
                <Button className="gap-2 bg-gradient-primary shadow-elegant" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" /> Create First Project
                </Button>
              }
            />
          </div>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
            <DialogDescription>Modify project details or status.</DialogDescription>
          </DialogHeader>
          {editing && (
            <ProjectForm
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

import { useState } from "react";
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-setup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSite, deleteSite, getSites, updateSite } from "@/lib/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Site } from "@/types/api";

interface FormState {
  name: string;
  lat: number;
  lng: number;
  radius: number;
  photo_required: boolean;
}

function PickLocation({ value, onChange }: { value: [number, number]; onChange: (p: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  return <Marker position={value} />;
}

function SiteForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: Site;
  onSubmit: (v: FormState) => void;
  submitting: boolean;
}) {
  const [form, setForm] = useState<FormState>({
    name: initial?.name ?? "",
    lat: initial?.lat ?? 5.6037,
    lng: initial?.lng ?? -0.187,
    radius: initial?.radius ?? 100,
    photo_required: initial?.photo_required ?? false,
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="name">Site name</Label>
        <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            type="number"
            step="any"
            className="font-mono-data"
            value={form.lat}
            onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lng">Longitude</Label>
          <Input
            id="lng"
            type="number"
            step="any"
            className="font-mono-data"
            value={form.lng}
            onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Geofence radius</Label>
          <span className="font-mono-data text-sm text-muted-foreground">{form.radius} m</span>
        </div>
        <Slider
          min={25}
          max={1000}
          step={25}
          value={[form.radius]}
          onValueChange={(v) => setForm({ ...form, radius: v[0] })}
        />
      </div>
      <div className="flex items-center justify-between rounded-md border border-border bg-secondary/40 p-3">
        <div>
          <Label className="text-sm">Photo required on clock-in</Label>
          <p className="text-xs text-muted-foreground">Worker must capture a verification photo.</p>
        </div>
        <Switch checked={form.photo_required} onCheckedChange={(v) => setForm({ ...form, photo_required: v })} />
      </div>
      <div className="h-64 overflow-hidden rounded-md border border-border">
        <MapContainer center={[form.lat, form.lng]} zoom={14} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          <Circle
            center={[form.lat, form.lng]}
            radius={form.radius}
            pathOptions={{ color: "hsl(33 100% 50%)", fillOpacity: 0.15 }}
          />
          <PickLocation
            value={[form.lat, form.lng]}
            onChange={([lat, lng]) => setForm({ ...form, lat, lng })}
          />
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground">Click the map to place the site center.</p>
      <DialogFooter>
        <Button type="submit" disabled={submitting}>{initial ? "Save changes" : "Create site"}</Button>
      </DialogFooter>
    </form>
  );
}

export default function Sites() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: sites = [] } = useQuery({ queryKey: ["sites"], queryFn: getSites });
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Site | null>(null);

  const createMut = useMutation({
    mutationFn: createSite,
    onSuccess: () => {
      toast({ title: "Site created" });
      setCreateOpen(false);
      qc.invalidateQueries({ queryKey: ["sites"] });
    },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Site> }) => updateSite(id, payload),
    onSuccess: () => {
      toast({ title: "Site updated" });
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["sites"] });
    },
  });
  const deleteMut = useMutation({
    mutationFn: deleteSite,
    onSuccess: () => {
      toast({ title: "Site deleted" });
      qc.invalidateQueries({ queryKey: ["sites"] });
    },
  });

  const center: [number, number] = sites[0] ? [sites[0].lat, sites[0].lng] : [5.6037, -0.187];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sites & Geofences</h1>
          <p className="text-sm text-muted-foreground">Define work sites and clock-in radii.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New site</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create site</DialogTitle>
              <DialogDescription>Place the marker and set the geofence radius.</DialogDescription>
            </DialogHeader>
            <SiteForm onSubmit={(v) => createMut.mutate(v)} submitting={createMut.isPending} />
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border-border bg-card xl:col-span-2">
          <CardHeader><CardTitle className="text-base">Map view</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="h-[520px] overflow-hidden rounded-b-lg">
              <MapContainer center={center} zoom={11} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                {sites.map((s) => (
                  <Circle
                    key={s.id}
                    center={[s.lat, s.lng]}
                    radius={s.radius}
                    pathOptions={{ color: "hsl(33 100% 50%)", fillOpacity: 0.18 }}
                  />
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-base">{sites.length} sites</CardTitle></CardHeader>
          <CardContent className="space-y-2 p-3">
            {sites.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-md border border-border bg-secondary/30 p-3">
                <div className="min-w-0">
                  <div className="truncate font-medium text-foreground">{s.name}</div>
                  <div className="font-mono-data text-xs text-muted-foreground">
                    {s.lat.toFixed(4)}, {s.lng.toFixed(4)} · {s.radius}m
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm(`Delete "${s.name}"?`)) deleteMut.mutate(s.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {sites.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No sites yet. Create your first one.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit site</DialogTitle>
            <DialogDescription>Adjust position, radius, or settings.</DialogDescription>
          </DialogHeader>
          {editing && (
            <SiteForm
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

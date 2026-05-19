import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrganizationSettings, updateOrganizationSettings } from "@/lib/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Building2, Save, Clock, Camera, ShieldCheck, Settings as SettingsIcon } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/auth";

export default function Settings() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  
  const { data: org, isLoading } = useQuery({ 
    queryKey: ["org-settings", user?.organizationId], 
    queryFn: () => getOrganizationSettings(user?.organizationId!),
    enabled: !!user?.organizationId
  });

  const [name, setName] = useState("");
  const [workHours, setWorkHours] = useState(8);
  const [lateThreshold, setLateThreshold] = useState(15);
  const [requirePhoto, setRequirePhoto] = useState(false);

  useEffect(() => {
    if (org) {
      setName(org.name);
      setWorkHours(org.settings?.work_hours_per_day ?? 8);
      setLateThreshold(org.settings?.late_threshold_minutes ?? 15);
      setRequirePhoto(org.settings?.require_photo_checkin ?? false);
    }
  }, [org]);

  const updateMut = useMutation({
    mutationFn: (payload: any) => updateOrganizationSettings(user?.organizationId!, payload),
    onSuccess: () => {
      toast({ title: "Settings saved", description: "Your organization settings have been updated." });
      qc.invalidateQueries({ queryKey: ["org-settings"] });
    },
  });

  const handleSave = () => {
    updateMut.mutate({
      name,
      settings: {
        ...org?.settings,
        work_hours_per_day: workHours,
        late_threshold_minutes: lateThreshold,
        require_photo_checkin: requirePhoto,
      }
    });
  };

  if (isLoading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Organization"
        title="Settings"
        description="Manage your company profile, working hours, and global workforce policies."
        icon={SettingsIcon}
      />

      <div className="space-y-6">
        {/* Profile Section */}
        <Card className="border-border/60 bg-card shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Company Profile
            </CardTitle>
            <CardDescription>Basic information about your organization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input 
                id="org-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Acme Corp" 
              />
            </div>
            <div className="flex items-center gap-4 py-2">
              <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center border border-border">
                {org?.logo_url ? (
                  <img src={org.logo_url} alt="Logo" className="h-full w-full object-contain rounded-lg" />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground/50" />
                )}
              </div>
              <div>
                <Button variant="outline" size="sm" disabled>Change Logo</Button>
                <p className="text-[10px] text-muted-foreground mt-1">Recommended size: 256x256px.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Rules Section */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Work Rules
            </CardTitle>
            <CardDescription>Define how time and attendance are calculated.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="work-hours">Standard Work Hours per Day</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    id="work-hours" 
                    type="number" 
                    value={workHours} 
                    onChange={(e) => setWorkHours(parseInt(e.target.value))} 
                    className="font-mono-data"
                  />
                  <span className="text-sm text-muted-foreground">hours</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="late-threshold">Late Threshold</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    id="late-threshold" 
                    type="number" 
                    value={lateThreshold} 
                    onChange={(e) => setLateThreshold(parseInt(e.target.value))} 
                    className="font-mono-data"
                  />
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
                <p className="text-[10px] text-muted-foreground italic">Grace period before a worker is marked 'Late'.</p>
              </div>
            </div>

            <Separator className="bg-border" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Global Photo Requirement
                  </div>
                  <p className="text-xs text-muted-foreground">Require all workers to take a photo on every check-in.</p>
                </div>
                <Switch checked={requirePhoto} onCheckedChange={setRequirePhoto} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Enforce Geofencing
                  </div>
                  <p className="text-xs text-muted-foreground">Prevent check-ins if the worker is outside the site radius.</p>
                </div>
                <Switch checked={true} disabled />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-secondary/20 border-t border-border flex justify-end py-4">
            <Button className="gap-2" onClick={handleSave} disabled={updateMut.isPending}>
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

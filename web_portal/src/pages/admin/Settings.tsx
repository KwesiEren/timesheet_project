import React from "react";
import { Shield, Loader2, FileEdit, Settings as SettingsIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlatformSettings, updatePlatformSettings } from "@/lib/services";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { PageLoader } from "@/components/QueryState";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: getPlatformSettings,
  });

  const mutation = useMutation({
    mutationFn: updatePlatformSettings,
    onSuccess: () => {
      toast({ title: "Settings updated" });
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
    },
    onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const handleToggle = (key: string, value: unknown) => {
    mutation.mutate({ [key]: value });
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Platform Admin"
        title="Platform Settings"
        description="Configure global limits, features, and security."
        icon={SettingsIcon}
        actions={
          mutation.isPending ? (
            <div className="flex items-center gap-2 text-sm font-medium text-primary animate-pulse">
              <Loader2 size={16} className="animate-spin" /> Saving…
            </div>
          ) : undefined
        }
      />

      <div className="grid gap-6">
        <SettingsGroup title="Global Feature Toggles" icon={FileEdit}>
          <SettingItem
            title="Geofencing"
            description="Allow organizations to use GPS-based clock-in validation."
          >
            <Switch
              checked={settings?.geofencing_enabled || false}
              onCheckedChange={(val) => handleToggle("geofencing_enabled", val)}
            />
          </SettingItem>
          <SettingItem
            title="Photo Verification"
            description="Enable photo capture verification on clock-in."
          >
            <Switch
              checked={settings?.photo_verification_enabled || false}
              onCheckedChange={(val) => handleToggle("photo_verification_enabled", val)}
            />
          </SettingItem>
          <SettingItem
            title="Offline Mode"
            description="Allow mobile app to queue logs without internet."
          >
            <Switch
              checked={settings?.offline_mode_enabled || false}
              onCheckedChange={(val) => handleToggle("offline_mode_enabled", val)}
            />
          </SettingItem>
        </SettingsGroup>

        <SettingsGroup title="Subscription Limits" icon={Shield}>
          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Max Users (Free)</Label>
              <Input
                type="number"
                value={settings?.max_users_free || 0}
                onChange={(e) => handleToggle("max_users_free", parseInt(e.target.value, 10))}
                className="font-mono-data"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Max Projects (Free)</Label>
              <Input
                type="number"
                value={settings?.max_sites_free || 0}
                onChange={(e) => handleToggle("max_sites_free", parseInt(e.target.value, 10))}
                className="font-mono-data"
              />
            </div>
          </div>
        </SettingsGroup>

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <div className="flex items-center gap-3 text-destructive">
            <Shield size={24} />
            <div>
              <h3 className="text-lg font-bold">Danger Zone</h3>
              <p className="text-sm opacity-80">Actions here affect the entire platform.</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive/5"
              onClick={() =>
                toast({
                  title: "Purge unavailable",
                  description: "Soft-delete is not enabled — nothing to purge.",
                  variant: "destructive",
                })
              }
            >
              Purge Deleted Organizations
            </Button>
            <Button
              variant={settings?.maintenance_mode ? "default" : "destructive"}
              onClick={() => handleToggle("maintenance_mode", !settings?.maintenance_mode)}
            >
              {settings?.maintenance_mode ? "Disable Maintenance" : "Enable Maintenance Mode"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsGroup({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/20 px-6 py-4">
        <Icon size={18} className="text-primary" />
        <h3 className="font-bold text-foreground">{title}</h3>
      </div>
      <div className="divide-y divide-border px-6">{children}</div>
    </div>
  );
}

function SettingItem({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-6">
      <div className="space-y-1">
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="max-w-md text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

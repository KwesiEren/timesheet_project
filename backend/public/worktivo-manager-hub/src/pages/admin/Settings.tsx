import React from "react";
import { 
  Shield, 
  Lock, 
  Save,
  Loader2,
  FileEdit,
  Trash2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlatformSettings, updatePlatformSettings } from "@/lib/services";
import { cn } from "@/lib/utils";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: getPlatformSettings
  });

  const mutation = useMutation({
    mutationFn: updatePlatformSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
    }
  });

  const handleToggle = (key: string, value: any) => {
    mutation.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground mt-1">Configure global limits, features, and security.</p>
        </div>
        {mutation.isPending && (
          <div className="flex items-center gap-2 text-sm text-primary font-medium animate-pulse">
            <Loader2 size={16} className="animate-spin" /> Saving...
          </div>
        )}
      </div>

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
            description="Enable AI-assisted face matching on clock-in."
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
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Max Users (Free)</label>
              <input 
                type="number" 
                value={settings?.max_users_free || 0}
                onChange={(e) => handleToggle("max_users_free", parseInt(e.target.value))}
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Max Sites (Free)</label>
              <input 
                type="number" 
                value={settings?.max_sites_free || 0}
                onChange={(e) => handleToggle("max_sites_free", parseInt(e.target.value))}
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none" 
              />
            </div>
          </div>
        </SettingsGroup>

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <div className="flex items-center gap-3 text-destructive">
            <Shield size={24} />
            <div>
              <h3 className="text-lg font-bold">Danger Zone</h3>
              <p className="text-sm opacity-80">Actions here are irreversible and affect the entire platform.</p>
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            <button className="rounded-lg border border-destructive bg-white px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/5">
              Purge Deleted Organizations
            </button>
            <button 
              onClick={() => handleToggle("maintenance_mode", !settings?.maintenance_mode)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                settings?.maintenance_mode 
                  ? "bg-success text-success-foreground hover:bg-success/90" 
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
            >
              {settings?.maintenance_mode ? "Disable Maintenance" : "Enable Maintenance Mode"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsGroup({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="border-b border-border bg-secondary/20 px-6 py-4 flex items-center gap-2">
        <Icon size={18} className="text-primary" />
        <h3 className="font-bold text-foreground">{title}</h3>
      </div>
      <div className="divide-y divide-border px-6">
        {children}
      </div>
    </div>
  );
}

function SettingItem({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
  return (
    <div className="py-6 flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground max-w-md">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Switch({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: (val: boolean) => void }) {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

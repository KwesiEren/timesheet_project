import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const DashboardMapInner = lazy(() => import("./DashboardMapInner"));

interface DashboardMapProps {
  center: [number, number];
  sites: Array<{ id: string; lat: number; lng: number; radius: number }>;
}

export function DashboardMap({ center, sites }: DashboardMapProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading map…
        </div>
      }
    >
      <DashboardMapInner center={center} sites={sites} />
    </Suspense>
  );
}

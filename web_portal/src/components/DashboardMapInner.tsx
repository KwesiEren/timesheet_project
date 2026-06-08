import { MapContainer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-setup";
import { MapLayerToggle } from "./maps/MapLayerToggle";

interface Props {
  center: [number, number];
  sites: Array<{ id: string; lat: number; lng: number; radius: number }>;
}

export default function DashboardMapInner({ center, sites }: Props) {
  return (
    <div className="leaflet-map-root relative h-full w-full">
      <MapContainer center={center} zoom={11} className="h-full w-full" zoomControl={false}>
        <MapLayerToggle />
        {sites.map((s) => (
          <Circle
            key={s.id}
            center={[s.lat, s.lng]}
            radius={s.radius}
            pathOptions={{
              color: "hsl(var(--primary))",
              fillColor: "hsl(var(--primary))",
              fillOpacity: 0.1,
              weight: 1,
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

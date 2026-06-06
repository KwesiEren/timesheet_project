import { MapContainer, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-setup";

interface Props {
  center: [number, number];
  sites: Array<{ id: string; lat: number; lng: number; radius: number }>;
}

export default function DashboardMapInner({ center, sites }: Props) {
  return (
    <div className="leaflet-map-root h-full w-full">
      <MapContainer center={center} zoom={11} className="h-full w-full" zoomControl={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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

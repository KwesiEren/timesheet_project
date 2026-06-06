import { MapContainer, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-setup";

interface SiteCircle {
  id: string;
  lat: number;
  lng: number;
  radius: number;
}

interface SitesOverviewMapProps {
  center: [number, number];
  sites: SiteCircle[];
}

export function SitesOverviewMap({ center, sites }: SitesOverviewMapProps) {
  return (
    <div className="leaflet-map-root h-full w-full">
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
  );
}

import { MapContainer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-setup";
import { MapLayerToggle } from "./MapLayerToggle";

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
    <div className="leaflet-map-root relative h-full w-full">
      <MapContainer center={center} zoom={11} className="h-full w-full">
        <MapLayerToggle />
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

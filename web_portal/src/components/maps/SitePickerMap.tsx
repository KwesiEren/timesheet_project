import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-setup";
import { MapResizeOnMount } from "./MapResizeOnMount";
import { MapFlyToCenter } from "./MapFlyToCenter";

interface SitePickerMapProps {
  lat: number;
  lng: number;
  radius: number;
  onLocationChange: (lat: number, lng: number) => void;
  /** Change when dialog opens so Leaflet gets a fresh instance */
  instanceKey?: string;
}

function PickLocation({
  position,
  onChange,
}: {
  position: [number, number];
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return <Marker position={position} />;
}

export function SitePickerMap({ lat, lng, radius, onLocationChange, instanceKey = "picker" }: SitePickerMapProps) {
  const center: [number, number] = [lat, lng];

  return (
    <div className="leaflet-map-root h-full w-full">
      <MapContainer
        key={instanceKey}
        center={center}
        zoom={14}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        <MapResizeOnMount />
        <MapFlyToCenter lat={lat} lng={lng} />
        <Circle
          center={center}
          radius={radius}
          pathOptions={{ color: "hsl(33 100% 50%)", fillOpacity: 0.15 }}
        />
        <PickLocation position={center} onChange={onLocationChange} />
      </MapContainer>
    </div>
  );
}

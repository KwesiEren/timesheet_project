import { useState } from "react";
import { TileLayer } from "react-leaflet";
import { Layers } from "lucide-react";

type LayerKind = "street" | "satellite";

export function MapLayerToggle() {
  const [layer, setLayer] = useState<LayerKind>("street");

  return (
    <>
      {layer === "street" ? (
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
      ) : (
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
        />
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setLayer((l) => (l === "street" ? "satellite" : "street"));
        }}
        className="leaflet-bar absolute right-3 top-3 z-[1000] flex items-center gap-1.5 rounded-md bg-background/95 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-foreground shadow-md backdrop-blur hover:bg-background"
        title="Toggle map layer"
      >
        <Layers className="h-3.5 w-3.5" />
        {layer === "street" ? "Satellite" : "Street"}
      </button>
    </>
  );
}

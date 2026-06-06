import { useEffect } from "react";
import { useMap } from "react-leaflet";

/** Leaflet mis-measures size when mounted inside a hidden dialog; refresh once visible. */
export function MapResizeOnMount() {
  const map = useMap();
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 150);
    return () => window.clearTimeout(id);
  }, [map]);
  return null;
}

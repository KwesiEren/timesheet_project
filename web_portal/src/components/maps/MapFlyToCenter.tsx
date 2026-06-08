import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

interface MapFlyToCenterProps {
  lat: number;
  lng: number;
}

/** Recenters the map when coordinates change (e.g. GPS capture or manual input). */
export function MapFlyToCenter({ lat, lng }: MapFlyToCenterProps) {
  const map = useMap();
  const skipNext = useRef(true);

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    map.flyTo([lat, lng], Math.max(map.getZoom(), 16), { duration: 0.75 });
  }, [lat, lng, map]);

  return null;
}

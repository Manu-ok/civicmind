"use client";

import { useState, useCallback } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { reverseGeocode } from "@/lib/maps/geocoding";

interface MiniMapProps {
  onLocationChange: (location: { lat: number; lng: number; address: string; ward: string; city: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

export function MiniMap({ onLocationChange, initialLocation }: MiniMapProps) {
  const { lat: userLat, lng: userLng, loading: geoLoading } = useGeolocation();
  const [markerPos, setMarkerPos] = useState(initialLocation || { lat: 20.5937, lng: 78.9629 });
  const [addressPreview, setAddressPreview] = useState<string>("Loading location...");
  const [isDragging, setIsDragging] = useState(false);

  // Initialize with user location if available and no initial location provided
  if (!initialLocation && userLat && userLng && markerPos.lat === 20.5937) {
    setMarkerPos({ lat: userLat, lng: userLng });
    handleLocationUpdate(userLat, userLng);
  }

  async function handleLocationUpdate(lat: number, lng: number) {
    setMarkerPos({ lat, lng });
    setAddressPreview("Resolving address...");
    try {
      const result = await reverseGeocode(lat, lng);
      setAddressPreview(result.address);
      onLocationChange({
        lat,
        lng,
        address: result.address,
        ward: result.ward,
        city: result.city,
      });
    } catch {
      setAddressPreview("Failed to resolve address");
    }
  }

  const onMapClick = useCallback((e: any) => {
    if (e.detail?.latLng) {
      handleLocationUpdate(e.detail.latLng.lat, e.detail.latLng.lng);
    }
  }, []);

  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (geoLoading && !initialLocation) {
    return <div className="h-[300px] w-full rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center text-slate-500 dark:text-zinc-500 animate-pulse">Detecting your location...</div>;
  }

  if (!API_KEY) {
    return <div className="h-[300px] w-full rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center text-red-400 p-4 text-center">Google Maps API Key is missing. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="h-[300px] w-full rounded-xl overflow-hidden border border-border relative">
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={markerPos}
            defaultZoom={15}
            mapId="DEMO_MAP_ID"
            disableDefaultUI={true}
            onClick={onMapClick}
            className="w-full h-full"
          >
            <AdvancedMarker
              position={markerPos}
              draggable={true}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={(e) => {
                setIsDragging(false);
                if (e.latLng) {
                  handleLocationUpdate(e.latLng.lat(), e.latLng.lng());
                }
              }}
            >
              <div className="w-10 h-10 flex items-center justify-center text-red-500 drop-shadow-xl -mt-5">
                <MapPin className="w-10 h-10 fill-red-500/20" />
              </div>
            </AdvancedMarker>
          </Map>
        </APIProvider>
      </div>
      <div className="text-sm text-muted-foreground p-3 bg-white dark:bg-zinc-900 rounded-lg border border-border">
        <span className="font-medium text-slate-600 dark:text-zinc-300">Selected Location:</span> {addressPreview}
      </div>
    </div>
  );
}

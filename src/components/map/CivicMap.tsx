"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { APIProvider, Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { motion, AnimatePresence } from "framer-motion";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { useIssues } from "@/lib/hooks/useIssues";
import { IssuePin } from "./IssuePin";
import { Issue } from "@/lib/types";
import { MapIcon, Loader2, Layers, Flame } from "lucide-react";
import { Button } from "../ui/button";
import { MobileMapPanel } from "./MobileMapPanel";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { MarkerClusterer, DefaultRenderer } from "@googlemaps/markerclusterer";
import { useRouter } from "next/navigation";

// Custom cluster renderer
const clusterRenderer = {
  render: ({ count, position }: any, stats: any) => {
    // Create a generic styled marker for clusters
    const svg = window.btoa(`
      <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <circle cx="120" cy="120" opacity=".6" r="120" fill="#3b82f6" />
        <circle cx="120" cy="120" opacity=".8" r="90" fill="#3b82f6" />
        <circle cx="120" cy="120" r="60" fill="#2563eb" />
      </svg>`);

    const title = `Cluster of ${count} markers`;
    const zIndex = Number(google.maps.Marker.MAX_ZINDEX) + count;

    // We can use standard DOM-based AdvancedMarkerElement or just return standard Marker
    if (google.maps.marker?.AdvancedMarkerElement) {
      const pinElement = new google.maps.marker.PinElement({
        background: '#3b82f6',
        borderColor: '#1e40af',
        glyphColor: 'white',
        glyph: String(count),
        scale: 1.2
      });

      return new google.maps.marker.AdvancedMarkerElement({
        position,
        zIndex,
        title,
        content: pinElement.element,
      });
    }

    return new google.maps.Marker({
      position,
      zIndex,
      title,
      icon: {
        url: `data:image/svg+xml;base64,${svg}`,
        scaledSize: new google.maps.Size(45, 45),
      },
      label: {
        text: String(count),
        color: "rgba(255,255,255,0.9)",
        fontSize: "14px",
        fontWeight: "bold"
      },
    });
  }
};

function ClusteredMarkers({ 
  issues, 
  selectedIssue, 
  setSelectedIssue,
  showHeatmap 
}: { 
  issues: Issue[], 
  selectedIssue: Issue | null, 
  setSelectedIssue: (issue: Issue | null) => void,
  showHeatmap: boolean
}) {
  const map = useMap();
  const [markers, setMarkers] = useState<{[key: string]: google.maps.marker.AdvancedMarkerElement}>({});
  const clusterer = useRef<MarkerClusterer | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ map, renderer: clusterRenderer });
      
      google.maps.event.addListener(clusterer.current, 'click', (cluster: any) => {
        const bounds = new google.maps.LatLngBounds();
        cluster.markers.forEach((m: any) => {
          if (m.position) bounds.extend(m.position);
        });
        map.fitBounds(bounds, { padding: 50 });
      });
    }
  }, [map]);

  useEffect(() => {
    if (clusterer.current) {
      clusterer.current.clearMarkers();
      if (!showHeatmap) {
        clusterer.current.addMarkers(Object.values(markers));
      }
    }
  }, [markers, showHeatmap]);

  const setMarkerRef = (marker: google.maps.marker.AdvancedMarkerElement | null, key: string) => {
    if (marker && markers[key]) return;
    if (!marker && !markers[key]) return;
    setMarkers(prev => {
      if (marker) {
        return {...prev, [key]: marker};
      } else {
        const newMarkers = {...prev};
        delete newMarkers[key];
        return newMarkers;
      }
    });
  };

  return (
    <>
      {issues.map(issue => (
        <IssuePin
          key={issue.id}
          issue={issue}
          isActive={selectedIssue?.id === issue.id}
          onClick={() => setSelectedIssue(issue)}
          setMarkerRef={setMarkerRef}
        />
      ))}
    </>
  );
}

function HeatmapComponent({ data, visible }: { data: google.maps.LatLngLiteral[]; visible: boolean }) {
  const map = useMap();
  const visualization = useMapsLibrary("visualization");
  const [heatmap, setHeatmap] = useState<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    if (!visualization || !map) return;
    
    if (!heatmap) {
      const newHeatmap = new visualization.HeatmapLayer({
        radius: 30,
        opacity: 0.8,
        gradient: [
          "rgba(0, 255, 255, 0)",
          "rgba(0, 255, 255, 1)",
          "rgba(0, 191, 255, 1)",
          "rgba(0, 127, 255, 1)",
          "rgba(0, 63, 255, 1)",
          "rgba(0, 0, 255, 1)",
          "rgba(0, 0, 223, 1)",
          "rgba(0, 0, 191, 1)",
          "rgba(0, 0, 159, 1)",
          "rgba(0, 0, 127, 1)",
          "rgba(63, 0, 91, 1)",
          "rgba(127, 0, 63, 1)",
          "rgba(191, 0, 31, 1)",
          "rgba(255, 0, 0, 1)",
        ],
      });
      setHeatmap(newHeatmap);
    }
  }, [visualization, map, heatmap]);

  useEffect(() => {
    if (!heatmap) return;
    
    if (visible && data.length > 0) {
      const heatMapData = data.map(pos => new google.maps.LatLng(pos.lat, pos.lng));
      heatmap.setData(heatMapData);
      heatmap.setMap(map);
    } else {
      heatmap.setMap(null);
    }
  }, [heatmap, data, visible, map]);

  return null;
}

export function CivicMap() {
  const router = useRouter();
  const { lat: userLat, lng: userLng, loading: geoLoading } = useGeolocation();
  const { issues, loading: issuesLoading } = useIssues();
  
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const center = userLat && userLng ? { lat: userLat, lng: userLng } : { lat: 20.5937, lng: 78.9629 };

  const heatmapData = useMemo(() => {
    return issues.map(i => ({ lat: i.location.lat, lng: i.location.lng }));
  }, [issues]);

  if (!API_KEY) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 p-6">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center max-w-md">
          <MapIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Google Maps API Key Missing</h3>
          <p className="text-zinc-400 text-sm">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file to enable the interactive map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden bg-zinc-950">
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={userLat ? 14 : 5}
          mapId="DEMO_MAP_ID"
          mapTypeId={mapType}
          disableDefaultUI={true}
          gestureHandling="greedy"
          className="w-full h-full"
          onClick={() => setSelectedIssue(null)}
        >
          {/* User Location Pulse */}
          {userLat && userLng && (
            <IssuePin 
              isActive={false} 
              onClick={() => {}} 
              issue={{ 
                id: 'user-loc', 
                location: { lat: userLat, lng: userLng, address: '', ward: '', city: '' },
                severity: 'low',
                status: 'resolved', // Hack to make it look different or we can just use a raw AdvancedMarker
                title: 'You are here'
              } as any} 
            />
          )}

          {/* Clustered Issues Pins */}
          <ClusteredMarkers 
            issues={issues} 
            selectedIssue={selectedIssue} 
            setSelectedIssue={setSelectedIssue} 
            showHeatmap={showHeatmap}
          />

          {/* Heatmap Layer */}
          <HeatmapComponent data={heatmapData} visible={showHeatmap} />

          {/* Custom Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button 
              size="icon" 
              variant="secondary" 
              className="bg-zinc-900/90 backdrop-blur border border-white/10 hover:bg-zinc-800 rounded-full shadow-lg"
              onClick={() => setMapType(mapType === "roadmap" ? "satellite" : "roadmap")}
              title="Toggle Map Type"
            >
              <Layers className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant={showHeatmap ? "default" : "secondary"}
              className={cn("rounded-full shadow-lg", showHeatmap ? "bg-orange-500 hover:bg-orange-600" : "bg-zinc-900/90 backdrop-blur border border-white/10 hover:bg-zinc-800")}
              onClick={() => setShowHeatmap(!showHeatmap)}
              title="Toggle Heatmap"
            >
              <Flame className="w-4 h-4" />
            </Button>
          </div>

        </Map>
      </APIProvider>

      {/* Slide-Up Issue Panel */}
      <MobileMapPanel 
        issue={selectedIssue} 
        onClose={() => setSelectedIssue(null)} 
      />
    </div>
  );
}

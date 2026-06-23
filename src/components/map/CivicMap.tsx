"use client";

import { useState, useEffect, useMemo } from "react";
import { APIProvider, Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { motion, AnimatePresence } from "framer-motion";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { useIssues } from "@/lib/hooks/useIssues";
import { IssuePin } from "./IssuePin";
import { Issue } from "@/lib/types";
import { X, Target, Layers, ArrowRight, CheckCircle2, Flame, Map as MapIcon, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

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

          {/* Issues Pins */}
          {!showHeatmap && issues.map((issue) => (
            <IssuePin
              key={issue.id}
              issue={issue}
              isActive={selectedIssue?.id === issue.id}
              onClick={() => setSelectedIssue(issue)}
            />
          ))}

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
      <AnimatePresence>
        {selectedIssue && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[400px] z-50"
          >
            <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl overflow-hidden flex flex-col gap-4">
              <button 
                onClick={() => setSelectedIssue(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-zinc-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex gap-4">
                {selectedIssue.mediaUrls?.[0] ? (
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img src={selectedIssue.mediaUrls[0]} alt="Issue" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                    <MapIcon className="w-8 h-8 text-zinc-600" />
                  </div>
                )}
                
                <div className="flex flex-col flex-1 min-w-0 pt-1">
                  <h3 className="font-semibold text-lg leading-tight truncate text-white">{selectedIssue.title}</h3>
                  <p className="text-sm text-zinc-400 truncate mt-1">{selectedIssue.location.address}</p>
                  <div className="flex items-center gap-2 mt-auto pt-2">
                    <span className={cn(
                      "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                      selectedIssue.severity === "critical" ? "bg-red-500/20 text-red-400" :
                      selectedIssue.severity === "high" ? "bg-orange-500/20 text-orange-400" :
                      selectedIssue.severity === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-green-500/20 text-green-400"
                    )}>
                      {selectedIssue.severity}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase font-medium">
                      {formatDistanceToNow(selectedIssue.reportedAt as Date, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-1">
                <Button 
                  className="flex-1 bg-white text-black hover:bg-zinc-200" 
                  onClick={() => router.push(`/issues/${selectedIssue.id}`)}
                >
                  View Details
                </Button>
                {selectedIssue.status === "pending" && (
                  <Button 
                    variant="default"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" 
                    onClick={() => router.push(`/verify?id=${selectedIssue.id}`)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Verify
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

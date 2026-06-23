import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type Theme = 'light' | 'dark';
type MapView = 'map' | 'list' | 'split';

interface UIState {
  sidebarOpen: boolean;
  theme: Theme;
  mapView: MapView;
  activeTab: string;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  setMapView: (mapView: MapView) => void;
  setActiveTab: (tab: string) => void;
}

export const useUIStore = create<UIState>()(
  devtools((set) => ({
    sidebarOpen: true,
    theme: 'dark', // default to dark mode as requested in global rules
    mapView: 'split',
    activeTab: 'dashboard',
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setTheme: (theme) => set({ theme }),
    setMapView: (mapView) => set({ mapView }),
    setActiveTab: (activeTab) => set({ activeTab })
  }))
);

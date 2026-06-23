"use client";

import { useState, useEffect } from "react";
import { reverseGeocode } from "../maps/geocoding";

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  address: string | null;
  ward: string | null;
  city: string | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    address: null,
    ward: null,
    city: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    async function fetchLocation() {
      // Check cache first
      const cached = sessionStorage.getItem("civicmind_location");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (mounted) {
            setState({ ...parsed, loading: false, error: null });
          }
          return;
        } catch (e) {
          // invalid cache
        }
      }

      if (!navigator.geolocation) {
        if (mounted) setState((s) => ({ ...s, error: "Geolocation not supported", loading: false }));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            const geoInfo = await reverseGeocode(lat, lng);
            const locationData = {
              lat,
              lng,
              address: geoInfo.address,
              ward: geoInfo.ward,
              city: geoInfo.city,
            };

            sessionStorage.setItem("civicmind_location", JSON.stringify(locationData));

            if (mounted) {
              setState({
                ...locationData,
                error: null,
                loading: false,
              });
            }
          } catch (error) {
            if (mounted) {
              setState({
                lat,
                lng,
                address: null,
                ward: null,
                city: null,
                error: "Could not reverse geocode location",
                loading: false,
              });
            }
          }
        },
        (error) => {
          if (mounted) {
            setState((s) => ({ ...s, error: error.message, loading: false }));
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }

    fetchLocation();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}

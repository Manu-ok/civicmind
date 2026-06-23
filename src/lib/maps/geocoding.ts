const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export async function reverseGeocode(lat: number, lng: number): Promise<{ address: string; ward: string; city: string; pincode: string }> {
  if (!API_KEY) {
    return { address: "API Key Missing", ward: "Unknown", city: "Unknown", pincode: "" };
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "OK" && data.results[0]) {
      const result = data.results[0];
      let ward = "Unknown";
      let city = "Unknown";
      let pincode = "";

      for (const component of result.address_components) {
        const types = component.types;
        if (types.includes("sublocality_level_1") || types.includes("sublocality") || types.includes("neighborhood")) {
          ward = component.long_name;
        }
        if (types.includes("locality")) {
          city = component.long_name;
        }
        if (types.includes("postal_code")) {
          pincode = component.long_name;
        }
      }

      return {
        address: result.formatted_address,
        ward,
        city,
        pincode,
      };
    }
  } catch (error) {
    console.error("Reverse geocoding failed", error);
  }
  
  return { address: "Unknown Location", ward: "Unknown", city: "Unknown", pincode: "" };
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; address: string; ward: string; city: string }> {
  if (!API_KEY) {
    throw new Error("API Key Missing");
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
  
  const res = await fetch(url);
  const data = await res.json();

  if (data.status === "OK" && data.results[0]) {
    const result = data.results[0];
    const { lat, lng } = result.geometry.location;
    
    let ward = "Unknown";
    let city = "Unknown";

    for (const component of result.address_components) {
      const types = component.types;
      if (types.includes("sublocality_level_1") || types.includes("sublocality") || types.includes("neighborhood")) {
        ward = component.long_name;
      }
      if (types.includes("locality")) {
        city = component.long_name;
      }
    }

    return { lat, lng, address: result.formatted_address, ward, city };
  }
  
  throw new Error("Could not geocode address");
}

export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

// Haversine formula to calculate distance in km
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const distance = R * c; 
  return distance;
}

export function getBoundingBox(lat: number, lng: number, radiusKm: number) {
  // Rough approximation
  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos(lat * (Math.PI / 180)));
  
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

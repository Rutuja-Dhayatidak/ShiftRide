const axios = require("axios");

// Fallback/Mock coordinates and distance logic to ensure local development works seamlessly even without active Google Keys
const MOCK_LOCATIONS = {
  pune: { lat: 18.5204, lng: 73.8567 },
  latur: { lat: 18.4088, lng: 76.5604 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  nashik: { lat: 20.0055, lng: 73.7898 },
  aurangabad: { lat: 19.8762, lng: 75.3433 },
  chhatrapatisambhajinagar: { lat: 19.8762, lng: 75.3433 },
};

// Calculate approximate road distance using Haversine formula with a winding road factor
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineDistance = R * c; // Distance in km
  
  // Real road routes are usually 1.2x to 1.35x longer than straight lines
  const roadWindingFactor = 1.25;
  const finalDistance = Math.round(straightLineDistance * roadWindingFactor);
  
  // Average speed in India is ~55 km/h
  const avgSpeedKmh = 50;
  const totalMinutes = Math.round((finalDistance / avgSpeedKmh) * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const durationStr = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
  
  return {
    distanceKm: finalDistance || 10,
    duration: durationStr
  };
};

/**
 * 1. Convert address into Coordinates (Geocoding)
 */
exports.getCoordinates = async (address) => {
  const cleanAddr = String(address || "").trim();
  const lowerAddr = cleanAddr.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  const rawKey = process.env.GEOCODING_API_KEY || process.env.VITE_GEOCODING_API_KEY || process.env.MAPS_API_KEY || process.env.VITE_MAPS_API_KEY || "";
  const apiKey = rawKey.trim();
  
  if (!apiKey) {
    // Return mock coordinate if found
    for (const [key, value] of Object.entries(MOCK_LOCATIONS)) {
      if (lowerAddr.includes(key)) {
        return value;
      }
    }
    // Default safe fallback (Pune center)
    return MOCK_LOCATIONS.pune;
  }
  
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cleanAddr)}&key=${apiKey}`;
    const res = await axios.get(url);
    if (res.data.status === "OK" && res.data.results.length > 0) {
      const loc = res.data.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    }
    
    // API failed status, search mock
    for (const [key, value] of Object.entries(MOCK_LOCATIONS)) {
      if (lowerAddr.includes(key)) return value;
    }
    return MOCK_LOCATIONS.pune;
  } catch (err) {
    console.error("Geocoding API Error:", err.message);
    for (const [key, value] of Object.entries(MOCK_LOCATIONS)) {
      if (lowerAddr.includes(key)) return value;
    }
    return MOCK_LOCATIONS.pune;
  }
};

/**
 * 2. Get road distance & duration between two coordinates
 */
exports.getDistanceAndDuration = async (pickup, drop) => {
  const rawKey = process.env.DISTANCE_API_KEY || process.env.VITE_DISTANCE_API_KEY || process.env.MAPS_API_KEY || process.env.VITE_MAPS_API_KEY || "";
  const apiKey = rawKey.trim();
  
  const pCoords = await exports.getCoordinates(pickup);
  const dCoords = await exports.getCoordinates(drop);
  
  if (!apiKey) {
    // If no key is set, use premium local Haversine calculations
    return calculateHaversineDistance(pCoords.lat, pCoords.lng, dCoords.lat, dCoords.lng);
  }
  
  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pCoords.lat},${pCoords.lng}&destinations=${dCoords.lat},${dCoords.lng}&key=${apiKey}`;
    const res = await axios.get(url);
    
    if (res.data.status === "OK" && res.data.rows[0]?.elements[0]?.status === "OK") {
      const element = res.data.rows[0].elements[0];
      const distanceMeters = element.distance.value; // in meters
      const durationSeconds = element.duration.value; // in seconds
      
      const distanceKm = Math.round(distanceMeters / 1000);
      
      const durationMinutes = Math.round(durationSeconds / 60);
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      const durationStr = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
      
      return {
        distanceKm,
        duration: durationStr
      };
    }
    
    // If Matrix API status is not OK, calculate via Haversine
    return calculateHaversineDistance(pCoords.lat, pCoords.lng, dCoords.lat, dCoords.lng);
  } catch (err) {
    console.error("Distance Matrix API Error:", err.message);
    return calculateHaversineDistance(pCoords.lat, pCoords.lng, dCoords.lat, dCoords.lng);
  }
};

/**
 * 3. Calculate fare based on road distance
 */
exports.calculateFare = (distanceKm, pricePerKm) => {
  const dist = Number(distanceKm) || 0;
  const rate = Number(pricePerKm) || 0;
  return Math.round(dist * rate);
};

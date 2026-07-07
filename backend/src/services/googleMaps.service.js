const axios = require("axios");

// Fallback/Mock coordinates and distance logic to ensure local development works seamlessly even without active Google Keys
const MOCK_LOCATIONS = {
  pune: { lat: 18.5204, lng: 73.8567 },
  latur: { lat: 18.4088, lng: 76.5604 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  nashik: { lat: 20.0055, lng: 73.7898 },
  nanded: { lat: 19.1383, lng: 77.3210 },
  aurangabad: { lat: 19.8762, lng: 75.3433 },
  chhatrapatisambhajinagar: { lat: 19.8762, lng: 75.3433 },
  solapur: { lat: 17.6599, lng: 75.9064 },
  kolhapur: { lat: 16.7050, lng: 74.2433 },
  thane: { lat: 19.2183, lng: 72.9781 },
  navimumbai: { lat: 19.0330, lng: 73.0297 },
  amravati: { lat: 20.9374, lng: 77.7796 },
  jalgaon: { lat: 21.0077, lng: 75.5626 },
  satara: { lat: 17.6805, lng: 73.9918 },
  sangli: { lat: 16.8524, lng: 74.5815 },
  ahmednagar: { lat: 19.0948, lng: 74.7480 },
  chandrapur: { lat: 19.9615, lng: 79.2961 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  goa: { lat: 15.2993, lng: 74.1240 },
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

const callNominatimGeocoding = async (address) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'ShiftRideApp/1.0 (contact@shiftride.com)'
      },
      timeout: 5000
    });
    if (res.data && res.data.length > 0) {
      return { lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) };
    }
  } catch (err) {
    console.error("Nominatim Fallback Geocoding Error:", err.message);
  }
  return null;
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
    // Try Nominatim first
    const nominatimCoords = await callNominatimGeocoding(cleanAddr);
    if (nominatimCoords) return nominatimCoords;
    
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
    
    // Google failed, try Nominatim
    const nominatimCoords = await callNominatimGeocoding(cleanAddr);
    if (nominatimCoords) return nominatimCoords;
    
    // API failed status, search mock
    for (const [key, value] of Object.entries(MOCK_LOCATIONS)) {
      if (lowerAddr.includes(key)) return value;
    }
    return MOCK_LOCATIONS.pune;
  } catch (err) {
    console.error("Geocoding API Error:", err.message);
    
    // Try Nominatim on error
    const nominatimCoords = await callNominatimGeocoding(cleanAddr);
    if (nominatimCoords) return nominatimCoords;
    
    for (const [key, value] of Object.entries(MOCK_LOCATIONS)) {
      if (lowerAddr.includes(key)) return value;
    }
    return MOCK_LOCATIONS.pune;
  }
};

const callOSRMRoute = async (pCoords, dCoords) => {
  try {
    const url = `http://router.project-osrm.org/route/v1/driving/${pCoords.lng},${pCoords.lat};${dCoords.lng},${dCoords.lat}?overview=false`;
    const res = await axios.get(url, { timeout: 6000 });
    if (res.data && res.data.routes && res.data.routes.length > 0) {
      const route = res.data.routes[0];
      const distanceKm = Math.round(route.distance / 1000);
      const durationSeconds = route.duration;
      const hours = Math.floor(durationSeconds / 3600);
      const minutes = Math.round((durationSeconds % 3600) / 60);
      const durationStr = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
      return {
        distanceKm,
        duration: durationStr
      };
    }
  } catch (err) {
    console.error("OSRM Route API Error:", err.message);
  }
  return null;
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
    // Try OSRM route for exact road distance
    const osrmResult = await callOSRMRoute(pCoords, dCoords);
    if (osrmResult) return osrmResult;
    
    // Final fallback
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
    
    // Try OSRM route on Google API status failure
    const osrmResult = await callOSRMRoute(pCoords, dCoords);
    if (osrmResult) return osrmResult;
    
    // Final fallback via Haversine
    return calculateHaversineDistance(pCoords.lat, pCoords.lng, dCoords.lat, dCoords.lng);
  } catch (err) {
    console.error("Distance Matrix API Error:", err.message);
    
    // Try OSRM route on error
    const osrmResult = await callOSRMRoute(pCoords, dCoords);
    if (osrmResult) return osrmResult;
    
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

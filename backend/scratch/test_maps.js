const axios = require("axios");

// Read keys from c:\carApp\backend\.env
const fs = require("fs");
const path = require("path");
const envContent = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8");

const getEnvVal = (key) => {
  const match = envContent.match(new RegExp(`${key}\\s*=\\s*(.*)`));
  return match ? match[1].trim() : "";
};

const geoKey = getEnvVal("VITE_MAPS_API_KEY");
const distKey = getEnvVal("VITE_DISTANCE_API_KEY");

console.log("Geocoding Key (using MAPS_API_KEY):", geoKey);
console.log("Distance Key:", distKey);

const test = async () => {
  try {
    const pickup = "Mumbai";
    const drop = "Pune";
    
    // Geocode Pickup
    const geoUrl1 = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(pickup)}&key=${geoKey}`;
    const res1 = await axios.get(geoUrl1);
    console.log("Geocode Pickup status:", res1.data.status);
    if (res1.data.status !== "OK") {
        console.log("Geocode Pickup error details:", res1.data.error_message);
    } else {
        console.log("Geocode Pickup result:", res1.data.results[0].geometry.location);
    }
    
    // Geocode Drop
    const geoUrl2 = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(drop)}&key=${geoKey}`;
    const res2 = await axios.get(geoUrl2);
    console.log("Geocode Drop status:", res2.data.status);
    if (res2.data.status !== "OK") {
        console.log("Geocode Drop error details:", res2.data.error_message);
    }
    
    // Distance Matrix
    // Test Nominatim Geocoding
    console.log("Testing Nominatim Geocoding for Pune...");
    const resNom1 = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent("Pune")}&format=json&limit=1`, {
      headers: { 'User-Agent': 'ShiftRideApp/1.0 (contact@shiftride.com)' }
    });
    const pCoords = { lat: parseFloat(resNom1.data[0].lat), lng: parseFloat(resNom1.data[0].lon) };

    console.log("Testing Nominatim Geocoding for Nanded...");
    const resNom2 = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent("Nanded")}&format=json&limit=1`, {
      headers: { 'User-Agent': 'ShiftRideApp/1.0 (contact@shiftride.com)' }
    });
    const dCoords = { lat: parseFloat(resNom2.data[0].lat), lng: parseFloat(resNom2.data[0].lon) };

    console.log("Pune Coords:", pCoords);
    console.log("Nanded Coords:", dCoords);

    // Test OSRM Routing
    console.log("Testing OSRM API for road route...");
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${pCoords.lng},${pCoords.lat};${dCoords.lng},${dCoords.lat}?overview=false`;
    const resOsrm = await axios.get(osrmUrl);
    if (resOsrm.data && resOsrm.data.routes && resOsrm.data.routes.length > 0) {
      const route = resOsrm.data.routes[0];
      const distanceKm = Math.round(route.distance / 1000);
      const durationSeconds = route.duration;
      const hours = Math.floor(durationSeconds / 3600);
      const minutes = Math.round((durationSeconds % 3600) / 60);
      console.log(`OSRM road distance: ${distanceKm} km, duration: ${hours}h ${minutes}m`);
    } else {
      console.log("OSRM routing failed.");
    }
  } catch (err) {
    console.error("Test error:", err.message);
  }
};

test();

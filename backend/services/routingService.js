const axios = require('axios');

/**
 * Calculate driving route using OSRM (Open Source Routing Machine).
 * @param {Array<{latitude: number, longitude: number}>} points - Ordered points [start, ...stops, destination]
 * @returns {Promise<{distance: number, duration: number, coordinates: Array<[number, number]>, legs: Array<any>}>}
 */
const calculateRoute = async (points) => {
  if (!points || points.length < 2) {
    throw new Error('At least 2 points (start and destination) are required to calculate a route.');
  }

  // OSRM expects coordinates in "longitude,latitude" format separated by semicolon
  const coordString = points
    .map((p) => `${p.longitude.toFixed(6)},${p.latitude.toFixed(6)}`)
    .join(';');

  const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson&steps=false`;

  try {
    const response = await axios.get(url, { timeout: 10000 });

    if (response.data.code !== 'Ok' || !response.data.routes || response.data.routes.length === 0) {
      throw new Error('OSRM could not calculate route between these points.');
    }

    const primaryRoute = response.data.routes[0];
    const distanceKm = Math.round((primaryRoute.distance / 1000) * 10) / 10;
    const durationMinutes = Math.round(primaryRoute.duration / 60);

    // OSRM returns GeoJSON coordinates as [longitude, latitude].
    // React-Leaflet requires [latitude, longitude].
    const coordinates = primaryRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    return {
      distance: distanceKm,
      duration: durationMinutes,
      coordinates,
      legs: primaryRoute.legs || [],
    };
  } catch (error) {
    console.warn(`[RoutingService] OSRM primary call failed: ${error.message}. Attempting geometric fallback.`);
    return generateFallbackRoute(points);
  }
};

/**
 * Fallback routing using great-circle interpolation in case external OSRM is temporarily throttled.
 */
function generateFallbackRoute(points) {
  let totalDistanceKm = 0;
  const coordinates = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dist = calculateHaversineDistance(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
    totalDistanceKm += dist;

    // Interpolate points for a smooth polyline
    const steps = 15;
    for (let s = 0; s <= steps; s++) {
      const fraction = s / steps;
      const lat = p1.latitude + (p2.latitude - p1.latitude) * fraction;
      const lng = p1.longitude + (p2.longitude - p1.longitude) * fraction;
      coordinates.push([lat, lng]);
    }
  }

  // Assume avg highway driving speed of 65 km/h + 15% traffic buffer
  const durationMinutes = Math.round((totalDistanceKm / 65) * 60 * 1.15);

  return {
    distance: Math.round(totalDistanceKm * 10) / 10,
    duration: durationMinutes,
    coordinates,
    legs: [],
  };
}

/**
 * Haversine formula to compute distance between two coords in km.
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = {
  calculateRoute,
  calculateHaversineDistance,
};

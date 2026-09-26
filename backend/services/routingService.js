const axios = require('axios');

/**
 * Calculate distance between two coordinates in km using the Haversine formula.
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

/**
 * Generate a curved geodesic arc (great-circle style) between two coordinates for flight visualization.
 */
function generateGeodesicArc(lat1, lon1, lat2, lon2, numPoints = 40) {
  const points = [];
  const midLat = (lat1 + lat2) / 2;
  const midLon = (lon1 + lon2) / 2;
  const dist = calculateHaversineDistance(lat1, lon1, lat2, lon2);

  // Compute perpendicular offset to give a slight visible curve on Mercator map
  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;
  // Perpendicular vector
  const pLat = -deltaLon;
  const pLon = deltaLat;
  const pLen = Math.hypot(pLat, pLon) || 1;
  const curveMagnitude = Math.min(0.25, (dist / 6371) * 0.4);

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Linear base interpolation
    const baseLat = lat1 + (lat2 - lat1) * t;
    const baseLon = lon1 + (lon2 - lon1) * t;
    // Parabolic elevation factor (0 at ends, 1 at midpoint)
    const arcFactor = 4 * t * (1 - t);

    const lat = baseLat + (pLat / pLen) * curveMagnitude * arcFactor * (dist > 500 ? 2.5 : 1.2);
    const lon = baseLon + (pLon / pLen) * curveMagnitude * arcFactor * (dist > 500 ? 2.5 : 1.2);
    points.push([lat, lon]);
  }
  return points;
}

/**
 * Calculate route based on ordered waypoints and travel mode.
 * Supported modes: 'car', 'bike', 'bus', 'train', 'flight'
 *
 * @param {Array<{latitude: number, longitude: number}>} points
 * @param {string} vehicleType
 * @param {number} travelersCount
 */
const calculateRoute = async (points, vehicleType = 'car', travelersCount = 1) => {
  if (!points || points.length < 2) {
    throw new Error('At least 2 points (start and destination) are required to calculate a route.');
  }

  const pStart = points[0];
  const pEnd = points[points.length - 1];
  const totalDirectDistanceKm = Math.round(
    calculateHaversineDistance(pStart.latitude, pStart.longitude, pEnd.latitude, pEnd.longitude) * 10
  ) / 10;

  // 1. FLIGHT ROUTING
  if (vehicleType === 'flight') {
    const flightArcCoordinates = generateGeodesicArc(
      pStart.latitude,
      pStart.longitude,
      pEnd.latitude,
      pEnd.longitude,
      50
    );

    // Flight cruising speed ~720 km/h + 45 min buffer (takeoff, approach, taxi)
    const flightDurationMinutes = Math.round((totalDirectDistanceKm / 720) * 60 + 45);

    // Check if live flight API key is configured
    const hasLiveFlightApi = Boolean(process.env.AMADEUS_API_KEY || process.env.FLIGHT_API_KEY);

    return {
      distance: totalDirectDistanceKm,
      duration: Math.max(50, flightDurationMinutes),
      coordinates: flightArcCoordinates,
      legs: [],
      vehicleType: 'flight',
      travelersCount: Number(travelersCount) || 1,
      transitInfo: {
        mode: 'flight',
        aerialDistanceKm: totalDirectDistanceKm,
        estimatedFlightMinutes: Math.max(30, Math.round((totalDirectDistanceKm / 720) * 60)),
        airportBufferMinutes: 45,
        hasLiveApi: hasLiveFlightApi,
        notice: hasLiveFlightApi
          ? 'Live Flight API connected.'
          : 'Live flight ticketing requires an airline API key (AMADEUS_API_KEY / FLIGHT_API_KEY). You can manually enter or adjust your ticket budget below.',
      },
    };
  }

  // 2. TRAIN ROUTING
  if (vehicleType === 'train') {
    // Railway track distance is typically ~1.18x geodesic distance due to track corridors
    const railDistanceKm = Math.round(totalDirectDistanceKm * 1.18 * 10) / 10;
    // Average Indian Express / Superfast train speed: ~70 km/h + 15 min station stops factor
    const trainDurationMinutes = Math.round((railDistanceKm / 70) * 60 + 20);

    // Build curved track coordinates
    const railCoordinates = generateGeodesicArc(
      pStart.latitude,
      pStart.longitude,
      pEnd.latitude,
      pEnd.longitude,
      35
    );

    // Estimated standard railway fare slab (~₹1.15 per km per passenger for Express/3AC/Sleeper blend)
    const estimatedFarePerPerson = Math.max(120, Math.round(railDistanceKm * 1.15));
    const totalEstimatedFare = estimatedFarePerPerson * (Number(travelersCount) || 1);

    const hasLiveTrainApi = Boolean(process.env.RAIL_API_KEY || process.env.IRCTC_API_KEY);

    return {
      distance: railDistanceKm,
      duration: trainDurationMinutes,
      coordinates: railCoordinates,
      legs: [],
      vehicleType: 'train',
      travelersCount: Number(travelersCount) || 1,
      transitInfo: {
        mode: 'train',
        estimatedFarePerPerson,
        totalEstimatedFare,
        hasLiveApi: hasLiveTrainApi,
        notice: hasLiveTrainApi
          ? 'Live Railway API connected.'
          : 'Live PNR and real-time train schedules require an IRCTC/Rail API key. Estimated distance fare shown as reference and fully editable.',
      },
    };
  }

  // 3. ROAD ROUTING (Car, Bike, Bus) via Geoapify or OSRM
  const geoapifyKey = process.env.GEOAPIFY_API_KEY || process.env.VITE_GEOAPIFY_API_KEY || '';
  
  // 3A. Try Geoapify Routing API if key is configured
  if (geoapifyKey && geoapifyKey !== 'YOUR_KEY') {
    try {
      const geoMode = vehicleType === 'bike' ? 'motorcycle' : vehicleType === 'bus' ? 'bus' : 'drive';
      const waypointsParam = points
        .map((p) => `${Number(p.latitude).toFixed(6)},${Number(p.longitude).toFixed(6)}`)
        .join('|');
      const geoUrl = `https://api.geoapify.com/v1/routing?waypoints=${waypointsParam}&mode=${geoMode}&apiKey=${geoapifyKey}`;
      
      const geoResponse = await axios.get(geoUrl, { timeout: 8000 });
      if (geoResponse.data?.features && geoResponse.data.features.length > 0) {
        const routeFeat = geoResponse.data.features[0];
        const props = routeFeat.properties;
        const distanceKm = Math.round((props.distance / 1000) * 10) / 10;
        const durationMinutes = Math.round(props.time / 60);

        // Geoapify returns coordinates as [lon, lat] inside multi-line or line string
        let coordinates = [];
        if (routeFeat.geometry.type === 'LineString') {
          coordinates = routeFeat.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
        } else if (routeFeat.geometry.type === 'MultiLineString') {
          routeFeat.geometry.coordinates.forEach((line) => {
            line.forEach(([lon, lat]) => coordinates.push([lat, lon]));
          });
        }

        let transitInfo = null;
        if (vehicleType === 'bus') {
          const estimatedFarePerPerson = Math.max(80, Math.round(distanceKm * 1.65));
          transitInfo = {
            mode: 'bus',
            estimatedFarePerPerson,
            totalEstimatedFare: estimatedFarePerPerson * (Number(travelersCount) || 1),
            notice: 'Estimated bus fare calculated from standard highway tariffs per traveler. Fully editable in budget breakdown.',
          };
        }

        return {
          distance: distanceKm,
          duration: durationMinutes,
          coordinates,
          legs: props.legs || [],
          vehicleType,
          travelersCount: Number(travelersCount) || 1,
          transitInfo,
        };
      }
    } catch (err) {
      console.warn(`[RoutingService] Geoapify routing notice: ${err.message}. Falling back to OSRM.`);
    }
  }

  // 3B. Road Routing via OSRM
  const coordString = points
    .map((p) => `${Number(p.longitude).toFixed(6)},${Number(p.latitude).toFixed(6)}`)
    .join(';');

  const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson&steps=false`;

  try {
    const response = await axios.get(url, { timeout: 8000 });

    if (response.data && response.data.code === 'Ok' && response.data.routes && response.data.routes.length > 0) {
      const primaryRoute = response.data.routes[0];
      const distanceKm = Math.round((primaryRoute.distance / 1000) * 10) / 10;
      const baseDurationMinutes = Math.round(primaryRoute.duration / 60);

      // Duration & speed adjustments by mode
      let adjustedDuration = baseDurationMinutes;
      let transitInfo = null;

      if (vehicleType === 'bike') {
        // Motorcycle highway touring: ~12-15% slower than car cruising
        adjustedDuration = Math.round(baseDurationMinutes * 1.14);
      } else if (vehicleType === 'bus') {
        // Public / Intercity buses operate with speed limits & scheduled stops: ~30% longer duration
        adjustedDuration = Math.round(baseDurationMinutes * 1.32);
        // Estimated intercity bus fare (~₹1.65 per km per passenger)
        const estimatedFarePerPerson = Math.max(80, Math.round(distanceKm * 1.65));
        const totalEstimatedFare = estimatedFarePerPerson * (Number(travelersCount) || 1);

        transitInfo = {
          mode: 'bus',
          estimatedFarePerPerson,
          totalEstimatedFare,
          notice: 'Estimated bus fare calculated from standard state/intercity highway tariffs per traveler. Fully editable in your budget breakdown.',
        };
      }

      // GeoJSON [lng, lat] -> Leaflet [lat, lng]
      const coordinates = primaryRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      return {
        distance: distanceKm,
        duration: adjustedDuration,
        coordinates,
        legs: primaryRoute.legs || [],
        vehicleType,
        travelersCount: Number(travelersCount) || 1,
        transitInfo,
      };
    }
  } catch (error) {
    console.warn(`[RoutingService] OSRM primary request notice: ${error.message}. Generating geometric route.`);
  }

  // Fallback for Road Modes if OSRM is temporarily unreachable
  return generateFallbackRoute(points, vehicleType, travelersCount);
};

/**
 * Geometric fallback routing for road modes.
 */
function generateFallbackRoute(points, vehicleType = 'car', travelersCount = 1) {
  let totalDistanceKm = 0;
  const coordinates = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dist = calculateHaversineDistance(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
    totalDistanceKm += dist;

    const steps = 15;
    for (let s = 0; s <= steps; s++) {
      const fraction = s / steps;
      const lat = p1.latitude + (p2.latitude - p1.latitude) * fraction;
      const lng = p1.longitude + (p2.longitude - p1.longitude) * fraction;
      coordinates.push([lat, lng]);
    }
  }

  // Winding road distance adjustment factor (~1.25x direct distance)
  const roadDistanceKm = Math.round(totalDistanceKm * 1.25 * 10) / 10;

  let avgSpeed = 68; // Car
  if (vehicleType === 'bike') avgSpeed = 56;
  if (vehicleType === 'bus') avgSpeed = 48;

  const durationMinutes = Math.round((roadDistanceKm / avgSpeed) * 60);

  let transitInfo = null;
  if (vehicleType === 'bus') {
    const farePerPerson = Math.max(80, Math.round(roadDistanceKm * 1.65));
    transitInfo = {
      mode: 'bus',
      estimatedFarePerPerson: farePerPerson,
      totalEstimatedFare: farePerPerson * (Number(travelersCount) || 1),
      notice: 'Estimated bus fare calculated from standard highway tariffs per traveler.',
    };
  }

  return {
    distance: roadDistanceKm,
    duration: durationMinutes,
    coordinates,
    legs: [],
    vehicleType,
    travelersCount: Number(travelersCount) || 1,
    transitInfo,
  };
}

module.exports = {
  calculateRoute,
  calculateHaversineDistance,
  generateGeodesicArc,
};


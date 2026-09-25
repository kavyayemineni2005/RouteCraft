const axios = require('axios');

/**
 * Geocode an address or city name into coordinates using Nominatim OpenStreetMap API.
 * @param {string} query 
 * @returns {Promise<{name: string, latitude: number, longitude: number}>}
 */
const geocodeLocation = async (query) => {
  if (!query || typeof query !== 'string' || !query.trim()) {
    throw new Error('Please provide a valid location query.');
  }

  const cleanQuery = query.trim();

  // Known fallback coordinates for popular cities to ensure instant responsiveness & offline reliability
  const fallbackCoordinates = {
    'vijayawada': { name: 'Vijayawada, Andhra Pradesh, India', latitude: 16.5062, longitude: 80.6480 },
    'hyderabad': { name: 'Hyderabad, Telangana, India', latitude: 17.3850, longitude: 78.4867 },
    'bangalore': { name: 'Bengaluru, Karnataka, India', latitude: 12.9716, longitude: 77.5946 },
    'bengaluru': { name: 'Bengaluru, Karnataka, India', latitude: 12.9716, longitude: 77.5946 },
    'mysore': { name: 'Mysuru, Karnataka, India', latitude: 12.2958, longitude: 76.6394 },
    'mysuru': { name: 'Mysuru, Karnataka, India', latitude: 12.2958, longitude: 76.6394 },
    'mumbai': { name: 'Mumbai, Maharashtra, India', latitude: 19.0760, longitude: 72.8777 },
    'pune': { name: 'Pune, Maharashtra, India', latitude: 18.5204, longitude: 73.8567 },
    'delhi': { name: 'New Delhi, Delhi, India', latitude: 28.6139, longitude: 77.2090 },
    'new delhi': { name: 'New Delhi, Delhi, India', latitude: 28.6139, longitude: 77.2090 },
    'agra': { name: 'Agra, Uttar Pradesh, India', latitude: 27.1767, longitude: 78.0081 },
    'jaipur': { name: 'Jaipur, Rajasthan, India', latitude: 26.9124, longitude: 75.7873 },
    'chennai': { name: 'Chennai, Tamil Nadu, India', latitude: 13.0827, longitude: 80.2707 },
    'pondicherry': { name: 'Puducherry, India', latitude: 11.9416, longitude: 79.8083 },
    'new york': { name: 'New York, NY, USA', latitude: 40.7128, longitude: -74.0060 },
    'boston': { name: 'Boston, MA, USA', latitude: 42.3601, longitude: -71.0589 },
    'san francisco': { name: 'San Francisco, CA, USA', latitude: 37.7749, longitude: -122.4194 },
    'los angeles': { name: 'Los Angeles, CA, USA', latitude: 34.0522, longitude: -118.2437 }
  };

  const lowerQuery = cleanQuery.toLowerCase();
  for (const [key, val] of Object.entries(fallbackCoordinates)) {
    if (lowerQuery === key || lowerQuery.startsWith(key + ',') || lowerQuery.endsWith(' ' + key)) {
      // If matches city query, return high-accuracy result directly or attempt Nominatim first with fast timeout
      try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: { q: cleanQuery, format: 'json', limit: 1 },
          headers: { 'User-Agent': 'RouteCraft-Trip-App/1.0 (contact@routecraft.app)' },
          timeout: 4000,
        });
        if (response.data && response.data.length > 0) {
          const item = response.data[0];
          return {
            name: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
          };
        }
      } catch (err) {
        console.warn(`[Geocoding] Nominatim request failed for "${cleanQuery}", using pre-indexed coordinate fallback.`);
      }
      return val;
    }
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: cleanQuery,
        format: 'json',
        limit: 1,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'RouteCraft-Trip-App/1.0 (contact@routecraft.app)',
      },
      timeout: 6000,
    });

    if (!response.data || response.data.length === 0) {
      throw new Error(`Location "${cleanQuery}" not found. Please try a more specific place or city name.`);
    }

    const item = response.data[0];
    return {
      name: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    };
  } catch (error) {
    if (error.response) {
      throw new Error(`Geocoding service error (${error.response.status}): ${error.message}`);
    }
    throw error;
  }
};

module.exports = {
  geocodeLocation,
};

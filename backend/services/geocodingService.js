const axios = require('axios');

// Popular indexed cities for instant suggestions & offline fallback
const POPULAR_CITIES = [
  { name: 'Vijayawada, Andhra Pradesh, India', shortName: 'Vijayawada', latitude: 16.5062, longitude: 80.6480 },
  { name: 'Hyderabad, Telangana, India', shortName: 'Hyderabad', latitude: 17.3850, longitude: 78.4867 },
  { name: 'Bengaluru, Karnataka, India', shortName: 'Bengaluru', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Visakhapatnam, Andhra Pradesh, India', shortName: 'Visakhapatnam', latitude: 17.6868, longitude: 83.2185 },
  { name: 'Tirupati, Andhra Pradesh, India', shortName: 'Tirupati', latitude: 13.6288, longitude: 79.4192 },
  { name: 'Guntur, Andhra Pradesh, India', shortName: 'Guntur', latitude: 16.3067, longitude: 80.4365 },
  { name: 'Warangal, Telangana, India', shortName: 'Warangal', latitude: 17.9689, longitude: 79.5941 },
  { name: 'Chennai, Tamil Nadu, India', shortName: 'Chennai', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Mumbai, Maharashtra, India', shortName: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Pune, Maharashtra, India', shortName: 'Pune', latitude: 18.5204, longitude: 73.8567 },
  { name: 'Goa, India', shortName: 'Goa', latitude: 15.2993, longitude: 74.1240 },
  { name: 'Mysuru, Karnataka, India', shortName: 'Mysuru', latitude: 12.2958, longitude: 76.6394 },
  { name: 'Kochi, Kerala, India', shortName: 'Kochi', latitude: 9.9312, longitude: 76.2673 },
  { name: 'New Delhi, Delhi, India', shortName: 'New Delhi', latitude: 28.6139, longitude: 77.2090 },
  { name: 'Jaipur, Rajasthan, India', shortName: 'Jaipur', latitude: 26.9124, longitude: 75.7873 },
  { name: 'Agra, Uttar Pradesh, India', shortName: 'Agra', latitude: 27.1767, longitude: 78.0081 },
  { name: 'Kolkata, West Bengal, India', shortName: 'Kolkata', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Puducherry, India', shortName: 'Puducherry', latitude: 11.9416, longitude: 79.8083 },
  { name: 'Ooty, Tamil Nadu, India', shortName: 'Ooty', latitude: 11.4102, longitude: 76.6950 },
  { name: 'Munnar, Kerala, India', shortName: 'Munnar', latitude: 10.0889, longitude: 77.0595 },
  { name: 'Coorg, Karnataka, India', shortName: 'Coorg', latitude: 12.3375, longitude: 75.8069 }
];

const getGeoapifyKey = () => process.env.GEOAPIFY_API_KEY || process.env.VITE_GEOAPIFY_API_KEY || '';

/**
 * Geocode single query string to coordinates using Geoapify / Nominatim OpenStreetMap API.
 */
const geocodeLocation = async (query) => {
  if (!query || typeof query !== 'string' || !query.trim()) {
    throw new Error('Please provide a valid location query.');
  }

  const cleanQuery = query.trim();
  const lowerQuery = cleanQuery.toLowerCase();
  const geoapifyKey = getGeoapifyKey();

  // 1. Try Geoapify Geocoding API if key is present
  if (geoapifyKey && geoapifyKey !== 'YOUR_KEY') {
    try {
      const geoapifyUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(cleanQuery)}&filter=countrycode:in&limit=1&apiKey=${geoapifyKey}`;
      const geoRes = await axios.get(geoapifyUrl, { timeout: 5000 });
      if (geoRes.data?.features && geoRes.data.features.length > 0) {
        const feat = geoRes.data.features[0];
        const [lon, lat] = feat.geometry.coordinates;
        return {
          name: feat.properties.formatted || feat.properties.name || cleanQuery,
          latitude: lat,
          longitude: lon,
        };
      }
    } catch (err) {
      console.warn(`[Geocoding] Geoapify search notice: ${err.message}. Falling back to OpenStreetMap.`);
    }
  }

  // 2. Try OpenStreetMap Nominatim
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: cleanQuery,
        format: 'json',
        limit: 1,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'RouteCraft-Trip-App/2.0 (contact@routecraft.app)',
        'Accept-Language': 'en',
      },
      timeout: 5000,
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
    console.warn(`[Geocoding] OpenStreetMap lookup notice: ${err.message}`);
  }

  // 3. Fallback to local catalog
  const popularMatch = POPULAR_CITIES.find(
    (c) =>
      c.shortName.toLowerCase() === lowerQuery ||
      c.name.toLowerCase().startsWith(lowerQuery) ||
      lowerQuery.includes(c.shortName.toLowerCase())
  );

  if (popularMatch) {
    return {
      name: popularMatch.name,
      latitude: popularMatch.latitude,
      longitude: popularMatch.longitude,
    };
  }

  throw new Error(`Location "${cleanQuery}" could not be found. Please try a more specific place or city name.`);
};

/**
 * Autocomplete / Location Suggestions Search using Geoapify / OpenStreetMap
 * Returns array of matching locations with display name, coordinates, and address type.
 */
const searchSuggestions = async (query) => {
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return [];
  }

  const cleanQuery = query.trim();
  const lowerQuery = cleanQuery.toLowerCase();
  const geoapifyKey = getGeoapifyKey();

  // Local matches
  const localMatches = POPULAR_CITIES.filter(
    (c) =>
      c.shortName.toLowerCase().includes(lowerQuery) ||
      c.name.toLowerCase().includes(lowerQuery)
  ).map((c) => ({
    name: c.name,
    shortName: c.shortName,
    latitude: c.latitude,
    longitude: c.longitude,
    type: 'city',
  }));

  // 1. Try Geoapify Autocomplete if key is available
  if (geoapifyKey && geoapifyKey !== 'YOUR_KEY') {
    try {
      const geoapifyUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(cleanQuery)}&filter=countrycode:in&limit=6&apiKey=${geoapifyKey}`;
      const geoRes = await axios.get(geoapifyUrl, { timeout: 4500 });
      if (geoRes.data?.features && geoRes.data.features.length > 0) {
        return geoRes.data.features.map((feat) => {
          const props = feat.properties;
          const [lon, lat] = feat.geometry.coordinates;
          const shortName = props.city || props.name || props.suburb || props.formatted.split(',')[0];
          return {
            name: props.formatted,
            shortName: shortName,
            latitude: lat,
            longitude: lon,
            type: props.result_type || 'place',
          };
        });
      }
    } catch (err) {
      console.warn(`[Geocoding Autocomplete] Geoapify notice: ${err.message}. Falling back to OSM.`);
    }
  }

  // 2. Try OpenStreetMap Nominatim
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: cleanQuery,
        format: 'json',
        limit: 6,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'RouteCraft-Trip-App/2.0 (contact@routecraft.app)',
        'Accept-Language': 'en',
      },
      timeout: 4500,
    });

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const apiResults = response.data.map((item) => {
        const addr = item.address || {};
        const shortName =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.suburb ||
          addr.county ||
          item.display_name.split(',')[0];

        return {
          name: item.display_name,
          shortName: shortName || item.display_name.split(',')[0],
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          type: item.type || item.class || 'place',
        };
      });

      return apiResults.slice(0, 6);
    }
  } catch (err) {
    console.warn(`[Geocoding Autocomplete] OpenStreetMap notice: ${err.message}`);
  }

  return localMatches.slice(0, 5);
};

/**
 * Reverse Geocode: Get comprehensive address fields & name from latitude & longitude
 */
const reverseGeocode = async (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lon)) {
    throw new Error('Valid latitude and longitude numbers are required.');
  }

  // 1. Try OpenStreetMap Nominatim with full address details
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: lat.toFixed(6),
        lon: lon.toFixed(6),
        format: 'json',
        zoom: 18,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'RouteCraft-Trip-App/2.0 (contact@routecraft.app)',
        'Accept-Language': 'en',
      },
      timeout: 6000,
    });

    if (response.data && response.data.display_name) {
      const addr = response.data.address || {};
      const placeName =
        response.data.name ||
        addr.amenity ||
        addr.shop ||
        addr.tourism ||
        addr.leisure ||
        addr.building ||
        addr.road ||
        response.data.display_name.split(',')[0];

      const street = addr.road || addr.street || addr.pedestrian || addr.footway || addr.highway || '';
      const area = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || addr.city_district || '';
      const city = addr.city || addr.town || addr.village || addr.municipality || addr.hamlet || '';
      const district = addr.state_district || addr.county || addr.district || '';
      const state = addr.state || addr.region || '';
      const pin = addr.postcode || addr.postal_code || '';
      const country = addr.country || 'India';
      const houseNumber = addr.house_number || addr.housenumber || '';

      return {
        name: placeName,
        shortName: placeName,
        fullAddress: response.data.display_name,
        latitude: lat,
        longitude: lon,
        houseNumber,
        street,
        area,
        city,
        district,
        state,
        pin,
        country,
        address: addr,
      };
    }
  } catch (err) {
    console.warn(`[Reverse Geocode] OpenStreetMap notice: ${err.message}`);
  }

  // Fallback: Check nearest city in catalog
  let nearestCity = null;
  let minDistance = Infinity;

  POPULAR_CITIES.forEach((c) => {
    const d = Math.hypot(c.latitude - lat, c.longitude - lon);
    if (d < minDistance) {
      minDistance = d;
      nearestCity = c;
    }
  });

  const approxName = nearestCity
    ? `Near ${nearestCity.shortName}`
    : `Pin (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`;

  return {
    name: approxName,
    shortName: nearestCity ? nearestCity.shortName : `Pin (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
    fullAddress: approxName,
    latitude: lat,
    longitude: lon,
    houseNumber: '',
    street: '',
    area: '',
    city: nearestCity ? nearestCity.shortName : '',
    district: '',
    state: nearestCity ? nearestCity.name.split(',')[1]?.trim() : '',
    pin: '',
    country: 'India',
    address: {},
  };
};

module.exports = {
  geocodeLocation,
  searchSuggestions,
  reverseGeocode,
  POPULAR_CITIES,
};



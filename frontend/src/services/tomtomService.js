import axios from 'axios';

/**
 * Helper to retrieve the TomTom API key from Vite environment variables.
 */
export const getTomTomApiKey = () => {
  const key = import.meta.env.VITE_TOMTOM_API_KEY;
  if (!key || key === 'YOUR_TOMTOM_API_KEY' || key.trim() === '') {
    return '';
  }
  return key.trim();
};

/**
 * Check whether a valid TomTom API key is configured.
 */
export const isTomTomConfigured = () => {
  const key = getTomTomApiKey();
  return Boolean(key && key.length > 5 && key !== 'YOUR_TOMTOM_API_KEY');
};

/**
 * TomTom Fuzzy Search / Autocomplete for Indian addresses and places.
 *
 * @param {string} query
 * @param {object} options
 * @returns {Promise<Array>}
 */
export const searchTomTomPlaces = async (query, options = {}) => {
  if (!query || query.trim().length < 2) return [];

  const apiKey = getTomTomApiKey();

  // If TomTom API key is available, use direct TomTom Search API
  if (apiKey) {
    try {
      const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query.trim())}.json`;
      const response = await axios.get(url, {
        params: {
          key: apiKey,
          countrySet: options.countrySet || 'IN',
          limit: options.limit || 8,
          typeahead: true,
          language: 'en-GB',
          idxSet: 'POI,PAD,Str,XStr,Geo',
        },
        timeout: 6000,
      });

      if (response.data && response.data.results) {
        return response.data.results.map((res) => {
          const poi = res.poi || {};
          const addr = res.address || {};
          const name = poi.name || addr.freeformAddress?.split(',')[0] || query;

          return {
            id: res.id || `${res.position.lat}_${res.position.lon}`,
            name,
            fullName: addr.freeformAddress || name,
            houseNumber: addr.streetNumber || '',
            street: addr.streetName || addr.street || '',
            area: addr.municipalitySubdivision || '',
            city: addr.municipality || addr.localName || '',
            district: addr.countrySecondarySubdivision || '',
            state: addr.countrySubdivision || addr.countrySubdivisionName || '',
            postalCode: addr.postalCode || '',
            country: addr.country || 'India',
            latitude: Number(res.position.lat),
            longitude: Number(res.position.lon),
            category: poi.categories ? poi.categories[0] : 'Location',
          };
        });
      }
    } catch (err) {
      console.warn('[TomTom Search] Notice:', err.response?.data?.message || err.message);
    }
  }

  // Fallback: Use backend search suggestions / geocoding
  try {
    const backendRes = await axios.get('/api/route/autocomplete', {
      params: { query: query.trim() },
      timeout: 5000,
    });
    if (backendRes.data && Array.isArray(backendRes.data)) {
      return backendRes.data.map((item) => ({
        id: item.id || `${item.latitude}_${item.longitude}`,
        name: item.name || item.formattedAddress?.split(',')[0] || query,
        fullName: item.formattedAddress || item.name,
        houseNumber: '',
        street: '',
        area: '',
        city: item.city || '',
        district: '',
        state: item.state || '',
        postalCode: '',
        country: item.country || 'India',
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        category: 'Location',
      }));
    }
  } catch (backendErr) {
    console.warn('[Search Fallback Notice]:', backendErr.message);
  }

  return [];
};

/**
 * TomTom Reverse Geocoding API to convert coordinates into a human-readable Indian address.
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<object>}
 */
export const reverseGeocodeTomTom = async (lat, lon) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid latitude and longitude coordinates.');
  }

  const apiKey = getTomTomApiKey();

  // 1. Direct TomTom Reverse Geocoding API
  if (apiKey) {
    try {
      const url = `https://api.tomtom.com/search/2/reverseGeocode/${latitude.toFixed(6)},${longitude.toFixed(6)}.json`;
      const response = await axios.get(url, {
        params: {
          key: apiKey,
          radius: 1000,
          language: 'en-GB',
        },
        timeout: 6000,
      });

      if (response.data && response.data.addresses && response.data.addresses.length > 0) {
        const item = response.data.addresses[0];
        const addr = item.address || {};
        const full = addr.freeformAddress || '';
        const name =
          addr.streetName ||
          addr.municipalitySubdivision ||
          addr.municipality ||
          full.split(',')[0] ||
          'Selected Location';

        return {
          name,
          houseNumber: addr.streetNumber || '',
          street: addr.streetName || addr.street || '',
          area: addr.municipalitySubdivision || '',
          city: addr.municipality || addr.localName || '',
          district: addr.countrySecondarySubdivision || '',
          state: addr.countrySubdivision || '',
          pin: addr.postalCode || '',
          country: addr.country || 'India',
          fullAddress: full || name,
          latitude,
          longitude,
        };
      }
    } catch (err) {
      console.warn('[TomTom Reverse Geocode] Notice:', err.response?.data?.message || err.message);
    }
  }

  // 2. Fallback: Backend reverse geocoding
  try {
    const backendRes = await axios.post(
      '/api/route/reverse',
      { latitude, longitude },
      { timeout: 5000 }
    );
    if (backendRes.data && backendRes.data.name) {
      return {
        name: backendRes.data.name,
        houseNumber: backendRes.data.houseNumber || '',
        street: backendRes.data.street || '',
        area: backendRes.data.area || '',
        city: backendRes.data.city || '',
        district: backendRes.data.district || '',
        state: backendRes.data.state || '',
        pin: backendRes.data.pin || '',
        country: backendRes.data.country || 'India',
        fullAddress: backendRes.data.fullAddress || backendRes.data.name,
        latitude,
        longitude,
      };
    }
  } catch (bErr) {
    console.warn('[Reverse Geocode Fallback Notice]:', bErr.message);
  }

  // 3. Coordinate fallback
  return {
    name: `Location (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`,
    houseNumber: '',
    street: '',
    area: '',
    city: '',
    district: '',
    state: '',
    pin: '',
    country: 'India',
    fullAddress: `Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
    latitude,
    longitude,
  };
};

/**
 * TomTom Routing API: Multi-Stop Road Routing calculation.
 * Route order: START -> 1 -> 2 -> 3 -> DESTINATION
 *
 * @param {Array<{latitude: number, longitude: number}>} points
 * @param {string} vehicleType ('car', 'bike', 'bus', 'train', 'flight')
 * @returns {Promise<object>}
 */
export const calculateTomTomRoute = async (points, vehicleType = 'car') => {
  if (!points || points.length < 2) {
    throw new Error('At least 2 locations (Start and Destination) are required to calculate a route.');
  }

  const apiKey = getTomTomApiKey();

  // Map vehicle mode to TomTom travelMode
  let tomtomTravelMode = 'car';
  if (vehicleType === 'bike') tomtomTravelMode = 'motorcycle';
  else if (vehicleType === 'bus') tomtomTravelMode = 'bus';

  // Format locations: "lat1,lon1:lat2,lon2:lat3,lon3"
  const locationsParam = points
    .map((p) => `${Number(p.latitude).toFixed(6)},${Number(p.longitude).toFixed(6)}`)
    .join(':');

  if (apiKey && (vehicleType === 'car' || vehicleType === 'bike' || vehicleType === 'bus')) {
    try {
      const url = `https://api.tomtom.com/routing/1/calculateRoute/${locationsParam}/json`;
      const response = await axios.get(url, {
        params: {
          key: apiKey,
          travelMode: tomtomTravelMode,
          routeType: 'fastest',
          computeTravelTimeFor: 'all',
          traffic: false,
        },
        timeout: 10000,
      });

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const summary = route.summary || {};

        const distanceKm = Math.round((summary.lengthInMeters / 1000) * 10) / 10;
        let durationMinutes = Math.round(summary.travelTimeInSeconds / 60);

        // Adjust speed profile for two-wheelers if necessary
        if (vehicleType === 'bike' && durationMinutes > 0) {
          durationMinutes = Math.round(durationMinutes * 0.9); // bikes filter through traffic faster
        }

        // Collect all coordinates: TomTom returns [{ latitude, longitude }]
        const coordinates = [];
        (route.legs || []).forEach((leg) => {
          (leg.points || []).forEach((pt) => {
            coordinates.push([Number(pt.latitude), Number(pt.longitude)]);
          });
        });

        return {
          distance: distanceKm,
          duration: durationMinutes,
          coordinates,
          legs: route.legs || [],
          vehicleType,
          provider: 'tomtom',
        };
      }
    } catch (err) {
      console.warn('[TomTom Routing] Notice:', err.response?.data?.message || err.message);
    }
  }

  // Fallback: Use backend routing calculation (which supports OSRM/Geoapify/Flight/Train)
  const backendRes = await axios.post('/api/route/calculate', {
    points,
    vehicleType,
  });

  return {
    ...backendRes.data,
    provider: 'fallback',
  };
};

/**
 * Creates custom HTML DOM element for TomTom Map Markers.
 *
 * @param {'start'|'dest'|'stop'|'candidate'} type
 * @param {number|string} label (e.g. 1, 2, 3)
 * @param {string} category
 * @returns {HTMLElement}
 */
export const createTomTomMarkerElement = (type, label = '', category = '') => {
  const el = document.createElement('div');
  el.className = 'tt-custom-marker';

  if (type === 'start') {
    el.innerHTML = `
      <div class="relative flex items-center justify-center cursor-pointer group">
        <div class="absolute -inset-2 bg-emerald-500/30 rounded-full animate-ping pointer-events-none"></div>
        <div class="w-9 h-9 rounded-full bg-emerald-500 border-2 border-zinc-950 text-black flex items-center justify-center font-black text-sm shadow-xl shadow-emerald-500/50 transform transition-transform group-hover:scale-125">
          A
        </div>
      </div>
    `;
  } else if (type === 'dest') {
    el.innerHTML = `
      <div class="relative flex items-center justify-center cursor-pointer group">
        <div class="absolute -inset-2 bg-rose-500/30 rounded-full animate-ping pointer-events-none"></div>
        <div class="w-9 h-9 rounded-full bg-rose-500 border-2 border-zinc-950 text-white flex items-center justify-center font-black text-sm shadow-xl shadow-rose-500/50 transform transition-transform group-hover:scale-125">
          B
        </div>
      </div>
    `;
  } else if (type === 'stop') {
    el.innerHTML = `
      <div class="relative flex items-center justify-center cursor-pointer group">
        <div class="absolute -inset-1.5 bg-amber-500/30 rounded-full animate-ping pointer-events-none"></div>
        <div class="w-8 h-8 rounded-full bg-amber-500 border-2 border-zinc-950 text-black flex items-center justify-center font-black text-xs shadow-xl shadow-amber-500/50 transform transition-transform group-hover:scale-125">
          ${label}
        </div>
      </div>
    `;
  } else {
    // Candidate Pitstop
    let colorClass = 'bg-amber-400';
    if (category === 'Food') colorClass = 'bg-orange-500';
    else if (category === 'Coffee') colorClass = 'bg-amber-600';
    else if (category === 'Nature') colorClass = 'bg-emerald-600';
    else if (category === 'Viewpoints') colorClass = 'bg-teal-500';
    else if (category === 'Attractions') colorClass = 'bg-yellow-400';
    else if (category === 'Fuel/rest stops') colorClass = 'bg-emerald-500';
    else if (category === 'Shopping') colorClass = 'bg-orange-400';

    el.innerHTML = `
      <div class="w-5 h-5 rounded-full ${colorClass} border-2 border-zinc-950 text-black flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer hover:scale-125 transition-transform">
        ●
      </div>
    `;
  }

  return el;
};

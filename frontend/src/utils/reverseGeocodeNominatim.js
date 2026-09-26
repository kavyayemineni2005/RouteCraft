import axios from 'axios';

/**
 * Perform reverse geocoding via backend API with direct OSM Nominatim fallback.
 * Extracts detailed, clean Indian/global address components.
 */
export const reverseGeocodeNominatim = async (lat, lon) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid latitude and longitude provided.');
  }

  // 1. Try backend reverse geocoding endpoint first
  try {
    const res = await axios.post('/api/route/reverse', {
      latitude,
      longitude,
    }, { timeout: 4500 });

    if (res.data && res.data.name) {
      return {
        name: res.data.name || 'Location Pin',
        houseNumber: res.data.houseNumber || '',
        street: res.data.street || '',
        area: res.data.area || '',
        city: res.data.city || res.data.shortName || '',
        district: res.data.district || '',
        state: res.data.state || '',
        pin: res.data.pin || '',
        country: res.data.country || 'India',
        fullAddress: res.data.fullAddress || res.data.name,
        latitude,
        longitude,
      };
    }
  } catch (backendErr) {
    console.warn('[ReverseGeocode] Backend proxy notice:', backendErr.message);
  }

  // 2. Direct Nominatim OpenStreetMap fallback
  try {
    const osmRes = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: latitude.toFixed(6),
        lon: longitude.toFixed(6),
        format: 'json',
        zoom: 18,
        addressdetails: 1,
      },
      headers: {
        'Accept-Language': 'en',
      },
      timeout: 5000,
    });

    if (osmRes.data) {
      const addr = osmRes.data.address || {};
      const placeName =
        osmRes.data.name ||
        addr.amenity ||
        addr.shop ||
        addr.tourism ||
        addr.leisure ||
        addr.building ||
        addr.road ||
        osmRes.data.display_name?.split(',')[0] ||
        'Location Pin';

      return {
        name: placeName,
        houseNumber: addr.house_number || addr.housenumber || '',
        street: addr.road || addr.street || addr.pedestrian || addr.footway || addr.highway || '',
        area: addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || addr.city_district || '',
        city: addr.city || addr.town || addr.village || addr.municipality || addr.hamlet || '',
        district: addr.state_district || addr.county || addr.district || '',
        state: addr.state || addr.region || '',
        pin: addr.postcode || addr.postal_code || '',
        country: addr.country || 'India',
        fullAddress: osmRes.data.display_name || placeName,
        latitude,
        longitude,
      };
    }
  } catch (osmErr) {
    console.warn('[ReverseGeocode] Direct OSM notice:', osmErr.message);
  }

  // 3. Fallback when address is unreachable
  return {
    name: `Coordinates (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`,
    houseNumber: '',
    street: '',
    area: '',
    city: '',
    district: '',
    state: '',
    pin: '',
    country: 'India',
    fullAddress: `Coordinates (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`,
    latitude,
    longitude,
    isFallback: true,
  };
};

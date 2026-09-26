import { Loader } from '@googlemaps/js-api-loader';

let googleMapsPromise = null;

/**
 * Loads the official Google Maps JavaScript API using the configured environment variable.
 * @returns {Promise<typeof google.maps>}
 */
export const loadGoogleMaps = () => {
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const loader = new Loader({
    apiKey: apiKey,
    version: 'weekly',
    libraries: ['places', 'geometry', 'marker'],
  });

  googleMapsPromise = loader
    .load()
    .then(() => {
      return window.google.maps;
    })
    .catch((err) => {
      googleMapsPromise = null;
      throw err;
    });

  return googleMapsPromise;
};

/**
 * Generate custom SVG Data URIs for start, destination, waypoint, and pitstop markers.
 */
export const getMarkerSvgIcon = (type, label = '', category = '') => {
  if (type === 'start') {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.6"/>
          </filter>
        </defs>
        <path d="M19 0C8.506 0 0 8.506 0 19c0 14.25 19 27 19 27s19-12.75 19-27C38 8.506 29.494 0 19 0z" fill="#10b981" filter="url(#shadow)" stroke="#ffffff" stroke-width="2"/>
        <circle cx="19" cy="18" r="11" fill="#052e16"/>
        <text x="19" y="23" fill="#34d399" font-family="sans-serif" font-weight="900" font-size="14" text-anchor="middle">A</text>
      </svg>
    `;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg.trim());
  }

  if (type === 'dest') {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.6"/>
          </filter>
        </defs>
        <path d="M19 0C8.506 0 0 8.506 0 19c0 14.25 19 27 19 27s19-12.75 19-27C38 8.506 29.494 0 19 0z" fill="#f43f5e" filter="url(#shadow)" stroke="#ffffff" stroke-width="2"/>
        <circle cx="19" cy="18" r="11" fill="#4c0519"/>
        <text x="19" y="23" fill="#fda4af" font-family="sans-serif" font-weight="900" font-size="14" text-anchor="middle">B</text>
      </svg>
    `;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg.trim());
  }

  if (type === 'waypoint') {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.5"/>
          </filter>
        </defs>
        <path d="M17 0C7.61 0 0 7.61 0 17c0 12.75 17 25 17 25s17-12.25 17-25C34 7.61 26.39 0 17 0z" fill="#f59e0b" filter="url(#shadow)" stroke="#ffffff" stroke-width="1.5"/>
        <circle cx="17" cy="16" r="10" fill="#451a03"/>
        <text x="17" y="21" fill="#fbbf24" font-family="sans-serif" font-weight="900" font-size="12" text-anchor="middle">${label}</text>
      </svg>
    `;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg.trim());
  }

  // Pitstop Category markers
  let fillColor = '#f59e0b';
  if (category === 'Food') fillColor = '#f97316';
  else if (category === 'Coffee') fillColor = '#d97706';
  else if (category === 'Nature') fillColor = '#059669';
  else if (category === 'Viewpoints') fillColor = '#14b8a6';
  else if (category === 'Attractions') fillColor = '#eab308';
  else if (category === 'Fuel/rest stops') fillColor = '#10b981';
  else if (category === 'Shopping') fillColor = '#fb923c';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>
      <circle cx="14" cy="14" r="11" fill="${fillColor}" stroke="#ffffff" stroke-width="2" filter="url(#shadow)"/>
      <circle cx="14" cy="14" r="4" fill="#09090b"/>
    </svg>
  `;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg.trim());
};

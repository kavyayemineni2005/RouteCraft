import React, { useEffect, useRef, useState, useCallback } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { 
  MapPin, 
  Trash2, 
  Loader2, 
  Navigation, 
  Info, 
  ExternalLink, 
  Layers, 
  Plus, 
  Compass,
  AlertCircle
} from 'lucide-react';
import { 
  getTomTomApiKey, 
  isTomTomConfigured, 
  createTomTomMarkerElement,
  reverseGeocodeTomTom 
} from '../services/tomtomService';

const MapComponent = ({
  origin,
  destination,
  vehicleType = 'car',
  stops = [],
  pitstops = [],
  routeCoordinates = [],
  onSelectPitstop,
  onOpenPlaceModal,
  onMapClick,
  onRemoveStop,
  onAddAsStop,
  onSetAsOrigin,
  onSetAsDestination,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const clickMarkerRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [isGeocodingClick, setIsGeocodingClick] = useState(false);
  const [mapError, setMapError] = useState(null);

  const apiKey = getTomTomApiKey();

  // 1. Initialize TomTom Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up previous instance if any
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn('Map cleanup notice:', e);
      }
      mapInstanceRef.current = null;
    }

    const keyToUse = apiKey || 'YOUR_TOMTOM_API_KEY';

    try {
      // Central India coordinates [longitude, latitude]
      const defaultCenter = [78.9629, 20.5937];
      const defaultZoom = 4.8;

      const map = tt.map({
        key: keyToUse,
        container: mapContainerRef.current,
        center: defaultCenter,
        zoom: defaultZoom,
        dragPan: true,
        stylesConfig: {
          style: 'main',
          layer: 'basic',
        },
      });

      // Add navigation and scale controls
      map.addControl(new tt.NavigationControl(), 'top-right');
      map.addControl(new tt.ScaleControl({ metric: true }), 'bottom-left');

      map.on('load', () => {
        setMapLoaded(true);
        setMapError(null);
        map.resize();
      });

      map.on('error', (err) => {
        console.warn('[TomTom Map Notice]:', err);
        if (!apiKey || apiKey === 'YOUR_TOMTOM_API_KEY') {
          setMapError('TomTom API key not configured. Add VITE_TOMTOM_API_KEY in frontend/.env to enable live map tiles.');
        }
      });

      // Handle map clicks for "Pick on Map" and interactive stop addition
      map.on('click', async (e) => {
        const { lng, lat } = e.lngLat;

        if (onMapClick) {
          onMapClick(lat, lng);
        }

        // Reverse geocode clicked position
        setIsGeocodingClick(true);
        try {
          const addr = await reverseGeocodeTomTom(lat, lng);
          setClickedLocation({
            lat,
            lng,
            name: addr.name || 'Selected Location',
            fullAddress: addr.fullAddress || '',
            area: addr.area || '',
            city: addr.city || '',
            state: addr.state || '',
            pin: addr.pin || '',
          });
        } catch (revErr) {
          setClickedLocation({
            lat,
            lng,
            name: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            fullAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          });
        } finally {
          setIsGeocodingClick(false);
        }
      });

      mapInstanceRef.current = map;
    } catch (initErr) {
      console.error('[TomTom Map Init Error]:', initErr);
      setMapError('Failed to initialize TomTom map. Please check your API key configuration.');
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [apiKey]);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Render Markers & Route on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((m) => {
      try {
        m.remove();
      } catch (e) {}
    });
    markersRef.current = [];

    const bounds = new tt.LngLatBounds();
    let hasPoints = false;

    // A. Start / Origin Marker
    if (origin && origin.latitude && origin.longitude) {
      const origLngLat = [Number(origin.longitude), Number(origin.latitude)];
      const el = createTomTomMarkerElement('start');
      
      const popupHtml = `
        <div style="padding: 8px; font-family: sans-serif; color: #18181b; min-width: 160px;">
          <div style="font-weight: 700; color: #059669; font-size: 13px; margin-bottom: 2px;">🟢 START POINT</div>
          <div style="font-weight: 600; font-size: 13px; color: #111827;">${origin.name || 'Origin'}</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">${Number(origin.latitude).toFixed(4)}°, ${Number(origin.longitude).toFixed(4)}°</div>
        </div>
      `;

      const popup = new tt.Popup({ offset: 25, closeButton: false }).setHTML(popupHtml);
      const marker = new tt.Marker({ element: el })
        .setLngLat(origLngLat)
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend(origLngLat);
      hasPoints = true;
    }

    // B. Destination Marker
    if (destination && destination.latitude && destination.longitude) {
      const destLngLat = [Number(destination.longitude), Number(destination.latitude)];
      const el = createTomTomMarkerElement('dest');

      const popupHtml = `
        <div style="padding: 8px; font-family: sans-serif; color: #18181b; min-width: 160px;">
          <div style="font-weight: 700; color: #e11d48; font-size: 13px; margin-bottom: 2px;">🔴 DESTINATION</div>
          <div style="font-weight: 600; font-size: 13px; color: #111827;">${destination.name || 'Destination'}</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">${Number(destination.latitude).toFixed(4)}°, ${Number(destination.longitude).toFixed(4)}°</div>
        </div>
      `;

      const popup = new tt.Popup({ offset: 25, closeButton: false }).setHTML(popupHtml);
      const marker = new tt.Marker({ element: el })
        .setLngLat(destLngLat)
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend(destLngLat);
      hasPoints = true;
    }

    // C. Waypoint / Pitstop Markers (Numbered 1, 2, 3...)
    stops.forEach((stop, index) => {
      if (stop.latitude && stop.longitude) {
        const stopLngLat = [Number(stop.longitude), Number(stop.latitude)];
        const stopNumber = index + 1;
        const el = createTomTomMarkerElement('stop', stopNumber);

        const popupHtml = `
          <div style="padding: 10px; font-family: sans-serif; color: #18181b; min-width: 200px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="background: #f59e0b; color: #000; font-weight: 900; font-size: 11px; padding: 2px 6px; border-radius: 6px;">STOP ${stopNumber}</span>
              <span style="font-size: 11px; color: #6b7280;">${stop.category || 'Pitstop'}</span>
            </div>
            <div style="font-weight: 700; font-size: 14px; color: #111827; margin-bottom: 4px;">${stop.name || `Stop ${stopNumber}`}</div>
            ${stop.detourMinutes ? `<div style="font-size: 11px; color: #d97706;">+${stop.detourMinutes} min detour</div>` : ''}
            <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">${Number(stop.latitude).toFixed(4)}°, ${Number(stop.longitude).toFixed(4)}°</div>
          </div>
        `;

        const popup = new tt.Popup({ offset: 25, closeButton: false }).setHTML(popupHtml);
        const marker = new tt.Marker({ element: el })
          .setLngLat(stopLngLat)
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
        bounds.extend(stopLngLat);
        hasPoints = true;
      }
    });

    // D. Candidate Corridor Pitstops
    pitstops.forEach((p) => {
      const isAlreadyAdded = stops.some(
        (s) =>
          (s.placeId && s.placeId === p.placeId) ||
          (Math.abs(s.latitude - p.latitude) < 0.001 &&
            Math.abs(s.longitude - p.longitude) < 0.001)
      );

      if (!isAlreadyAdded && p.latitude && p.longitude) {
        const pitLngLat = [Number(p.longitude), Number(p.latitude)];
        const el = createTomTomMarkerElement('candidate', '', p.category);

        const popupHtml = `
          <div style="padding: 10px; font-family: sans-serif; color: #18181b; min-width: 190px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 11px; font-weight: 700; color: #d97706;">${p.category || 'Pitstop'}</span>
              <span style="font-size: 11px; color: #059669; font-weight: 700;">★ ${p.rating || 4.5}</span>
            </div>
            <div style="font-weight: 700; font-size: 13px; color: #111827; margin-bottom: 4px;">${p.name}</div>
            ${p.detourMinutes ? `<div style="font-size: 11px; color: #6b7280; margin-bottom: 6px;">+${p.detourMinutes} min detour</div>` : ''}
          </div>
        `;

        const popup = new tt.Popup({ offset: 20, closeButton: false }).setHTML(popupHtml);
        const marker = new tt.Marker({ element: el })
          .setLngLat(pitLngLat)
          .setPopup(popup)
          .addTo(map);

        el.addEventListener('click', () => {
          if (onSelectPitstop) onSelectPitstop(p);
        });

        markersRef.current.push(marker);
      }
    });

    // E. Draw Route Polyline Layer
    const sourceId = 'tomtom-route-source';
    const lineGlowId = 'tomtom-route-glow';
    const lineMainId = 'tomtom-route-main';

    if (routeCoordinates && routeCoordinates.length > 1) {
      // TomTom GeoJSON coordinates expect [longitude, latitude]
      const geojsonCoords = routeCoordinates.map(([lat, lon]) => [Number(lon), Number(lat)]);
      
      geojsonCoords.forEach((pt) => bounds.extend(pt));
      hasPoints = true;

      const geojsonData = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: geojsonCoords,
        },
      };

      if (map.getSource(sourceId)) {
        map.getSource(sourceId).setData(geojsonData);
      } else {
        map.addSource(sourceId, {
          type: 'geojson',
          data: geojsonData,
        });

        map.addLayer({
          id: lineGlowId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#f59e0b',
            'line-width': 8,
            'line-opacity': 0.35,
          },
        });

        map.addLayer({
          id: lineMainId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#fbbf24',
            'line-width': 4.5,
            'line-opacity': 0.95,
          },
        });
      }
    } else {
      // Remove layers if route cleared
      if (map.getLayer(lineMainId)) map.removeLayer(lineMainId);
      if (map.getLayer(lineGlowId)) map.removeLayer(lineGlowId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    }

    // F. Fit Bounds smoothly
    if (hasPoints && !bounds.isEmpty()) {
      try {
        map.fitBounds(bounds, {
          padding: { top: 70, bottom: 70, left: 70, right: 70 },
          maxZoom: 15,
          duration: 1000,
        });
      } catch (fitErr) {
        console.warn('fitBounds notice:', fitErr);
      }
    }
  }, [mapLoaded, origin, destination, stops, pitstops, routeCoordinates, onSelectPitstop]);

  // Center map on India
  const handleResetToIndia = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [78.9629, 20.5937],
        zoom: 4.8,
        duration: 1200,
      });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full flex-1" />

      {/* Floating Control Buttons */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleResetToIndia}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 rounded-xl text-xs font-semibold backdrop-blur-md shadow-lg transition-all hover:scale-105 active:scale-95"
          title="Reset View to India Overview"
        >
          <Compass className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">India View</span>
        </button>
      </div>

      {/* API Key Notice Banner if not configured */}
      {mapError && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 max-w-md w-full px-4">
          <div className="bg-amber-950/90 border border-amber-500/50 backdrop-blur-md text-amber-200 p-3 rounded-2xl shadow-xl flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">TomTom Maps Configuration</p>
              <p className="mt-0.5 text-amber-200/80">{mapError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Clicked Map Location Action Card */}
      {clickedLocation && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-[92%] max-w-md bg-zinc-950/95 border border-zinc-800 backdrop-blur-xl p-4 rounded-2xl shadow-2xl text-white animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Selected Map Location
                </p>
                <h4 className="text-sm font-bold text-white mt-0.5 line-clamp-1">
                  {clickedLocation.name}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                  {clickedLocation.fullAddress}
                </p>
              </div>
            </div>
            <button
              onClick={() => setClickedLocation(null)}
              className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800/80">
            {onSetAsOrigin && (
              <button
                onClick={() => {
                  onSetAsOrigin({
                    name: clickedLocation.name,
                    latitude: clickedLocation.lat,
                    longitude: clickedLocation.lng,
                    address: clickedLocation.fullAddress,
                  });
                  setClickedLocation(null);
                }}
                className="px-2 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all text-center"
              >
                Set as Start
              </button>
            )}

            {onAddAsStop && (
              <button
                onClick={() => {
                  onAddAsStop({
                    name: clickedLocation.name,
                    latitude: clickedLocation.lat,
                    longitude: clickedLocation.lng,
                    category: 'Pitstop',
                    address: clickedLocation.fullAddress,
                  });
                  setClickedLocation(null);
                }}
                className="px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all text-center"
              >
                + Add Stop
              </button>
            )}

            {onSetAsDestination && (
              <button
                onClick={() => {
                  onSetAsDestination({
                    name: clickedLocation.name,
                    latitude: clickedLocation.lat,
                    longitude: clickedLocation.lng,
                    address: clickedLocation.fullAddress,
                  });
                  setClickedLocation(null);
                }}
                className="px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all text-center"
              >
                Set as Dest
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-10 hidden sm:flex items-center gap-3 px-3 py-1.5 bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 rounded-xl text-[11px] text-zinc-300 shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
          <span>Start (A)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm"></span>
          <span>Stops (1, 2...)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-sm"></span>
          <span>Dest (B)</span>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;

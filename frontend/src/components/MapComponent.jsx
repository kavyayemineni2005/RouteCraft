import React, { useEffect, useState, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  useMap, 
  useMapEvents 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Trash2, 
  Loader2, 
  Navigation, 
  Info, 
  ExternalLink, 
  Compass, 
  Plus,
  AlertCircle 
} from 'lucide-react';
import { reverseGeocodeNominatim } from '../utils/reverseGeocodeNominatim';

// Fix default leaflet marker asset paths in bundled environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Numbered Stop Icon Generator (1, 2, 3...)
const createNumberedStopIcon = (stopNumber) =>
  L.divIcon({
    className: 'custom-routecraft-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="position: absolute; inset: -4px; background: rgba(245, 158, 11, 0.4); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 32px; height: 32px; border-radius: 9999px; background: #f59e0b; border: 2.5px solid #09090b; color: #000000; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.6);">
          ${stopNumber}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

// Start Location Icon (A - Emerald)
const createStartIcon = () =>
  L.divIcon({
    className: 'custom-routecraft-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="position: absolute; inset: -4px; background: rgba(16, 185, 129, 0.4); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 34px; height: 34px; border-radius: 9999px; background: #10b981; border: 2.5px solid #09090b; color: #000000; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.6);">
          A
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });

// Destination Location Icon (B - Rose)
const createDestIcon = () =>
  L.divIcon({
    className: 'custom-routecraft-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="position: absolute; inset: -4px; background: rgba(244, 63, 94, 0.4); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 34px; height: 34px; border-radius: 9999px; background: #f43f5e; border: 2.5px solid #09090b; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; box-shadow: 0 10px 15px -3px rgba(244, 63, 94, 0.6);">
          B
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });

// Candidate Pitstop Marker
const createCandidatePitstopIcon = (category) => {
  let bgColor = '#f59e0b';
  if (category === 'Food') bgColor = '#f97316';
  else if (category === 'Coffee') bgColor = '#d97706';
  else if (category === 'Nature') bgColor = '#059669';
  else if (category === 'Viewpoints') bgColor = '#14b8a6';
  else if (category === 'Attractions') bgColor = '#eab308';
  else if (category === 'Fuel/rest stops') bgColor = '#10b981';
  else if (category === 'Shopping') bgColor = '#fb923c';

  return L.divIcon({
    className: 'custom-routecraft-marker',
    html: `
      <div style="width: 20px; height: 20px; border-radius: 9999px; background: ${bgColor}; border: 2px solid #09090b; color: #000000; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4); cursor: pointer;">
        ●
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

// Map Click Listener Component
const MapClickHandler = ({ onMapClick, onSelectClickedLocation }) => {
  useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      if (onMapClick) {
        onMapClick(lat, lng);
      }

      if (onSelectClickedLocation) {
        try {
          const addr = await reverseGeocodeNominatim(lat, lng);
          onSelectClickedLocation(addr);
        } catch (err) {
          onSelectClickedLocation({
            name: `Coordinates (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
            fullAddress: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`,
            latitude: lat,
            longitude: lng,
          });
        }
      }
    },
  });
  return null;
};

// Auto Bounds Fitting Component
const AutoBoundsFitter = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (points && points.length > 0) {
      try {
        const bounds = L.latLngBounds(points);
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [60, 60],
            maxZoom: 14,
            animate: true,
          });
        }
      } catch (err) {
        console.warn('[AutoBoundsFitter] notice:', err.message);
      }
    }
  }, [points, map]);

  return null;
};

// Reset to India Overview Control
const IndiaViewButton = () => {
  const map = useMap();
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        map.flyTo([20.5937, 78.9629], 5, { duration: 1.2 });
      }}
      className="flex items-center gap-2 px-3 py-2 bg-zinc-950/95 hover:bg-zinc-900 text-zinc-100 border border-zinc-700/80 rounded-xl text-xs font-bold shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer z-[1000]"
      title="Reset View to India Overview"
    >
      <Compass className="w-4 h-4 text-amber-400" />
      <span>India View</span>
    </button>
  );
};

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
  const [clickedLocation, setClickedLocation] = useState(null);

  // Compute all points for auto-fitting viewport
  const boundsPoints = useMemo(() => {
    const pts = [];
    if (origin && origin.latitude && origin.longitude) {
      pts.push([Number(origin.latitude), Number(origin.longitude)]);
    }
    if (destination && destination.latitude && destination.longitude) {
      pts.push([Number(destination.latitude), Number(destination.longitude)]);
    }
    stops.forEach((s) => {
      if (s.latitude && s.longitude) {
        pts.push([Number(s.latitude), Number(s.longitude)]);
      }
    });
    if (routeCoordinates && routeCoordinates.length > 0) {
      routeCoordinates.forEach(([lat, lon]) => pts.push([Number(lat), Number(lon)]));
    }
    return pts;
  }, [origin, destination, stops, routeCoordinates]);

  // Format route coordinates for Leaflet Polyline [lat, lon]
  const polylinePositions = useMemo(() => {
    if (!routeCoordinates || routeCoordinates.length < 2) return [];
    return routeCoordinates.map(([lat, lon]) => [Number(lat), Number(lon)]);
  }, [routeCoordinates]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900">
      
      {/* Leaflet Map Container */}
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: '100%', minHeight: '500px', width: '100%' }}
        className="w-full h-full z-10"
      >
        {/* OpenStreetMap Real Tile Layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {/* Dynamic Bounds Fitting */}
        <AutoBoundsFitter points={boundsPoints} />

        {/* Map Click Handler */}
        <MapClickHandler
          onMapClick={onMapClick}
          onSelectClickedLocation={(addr) => setClickedLocation(addr)}
        />

        {/* 1. Start Location Marker (A) */}
        {origin && origin.latitude && origin.longitude && (
          <Marker
            position={[Number(origin.latitude), Number(origin.longitude)]}
            icon={createStartIcon()}
          >
            <Popup className="custom-routecraft-popup">
              <div className="p-2 min-w-[180px] text-zinc-900 font-sans">
                <div className="font-extrabold text-emerald-700 text-xs mb-1 flex items-center gap-1">
                  <span>🟢 START LOCATION</span>
                </div>
                <h4 className="font-bold text-sm text-zinc-900">{origin.name || 'Start Point'}</h4>
                <p className="text-[11px] text-zinc-600 mt-1">
                  Lat: {Number(origin.latitude).toFixed(4)}°, Lon: {Number(origin.longitude).toFixed(4)}°
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 2. Destination Location Marker (B) */}
        {destination && destination.latitude && destination.longitude && (
          <Marker
            position={[Number(destination.latitude), Number(destination.longitude)]}
            icon={createDestIcon()}
          >
            <Popup className="custom-routecraft-popup">
              <div className="p-2 min-w-[180px] text-zinc-900 font-sans">
                <div className="font-extrabold text-rose-700 text-xs mb-1 flex items-center gap-1">
                  <span>🔴 DESTINATION</span>
                </div>
                <h4 className="font-bold text-sm text-zinc-900">{destination.name || 'Destination'}</h4>
                <p className="text-[11px] text-zinc-600 mt-1">
                  Lat: {Number(destination.latitude).toFixed(4)}°, Lon: {Number(destination.longitude).toFixed(4)}°
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 3. Numbered Itinerary Waypoint Stops (1, 2, 3...) */}
        {stops.map((stop, index) => {
          if (!stop.latitude || !stop.longitude) return null;
          const stopNumber = index + 1;
          return (
            <Marker
              key={`stop-marker-${stop._id || stop.id || index}`}
              position={[Number(stop.latitude), Number(stop.longitude)]}
              icon={createNumberedStopIcon(stopNumber)}
            >
              <Popup className="custom-routecraft-popup">
                <div className="p-2.5 min-w-[220px] text-zinc-900 font-sans space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-500 text-black font-black text-[11px] px-2 py-0.5 rounded-md">
                      STOP {stopNumber}
                    </span>
                    <span className="text-[11px] font-bold text-zinc-600">
                      {stop.category || 'Pitstop'}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-zinc-900 leading-snug">
                    {stop.name || `Stop ${stopNumber}`}
                  </h4>

                  {/* Detailed Address Information */}
                  <div className="text-[11px] text-zinc-600 space-y-0.5 pt-1 border-t border-zinc-200">
                    {stop.street && <div><span className="font-semibold text-zinc-800">Street:</span> {stop.street}</div>}
                    {stop.area && <div><span className="font-semibold text-zinc-800">Area:</span> {stop.area}</div>}
                    {stop.city && <div><span className="font-semibold text-zinc-800">City:</span> {stop.city}</div>}
                    {stop.district && <div><span className="font-semibold text-zinc-800">District:</span> {stop.district}</div>}
                    {stop.state && <div><span className="font-semibold text-zinc-800">State:</span> {stop.state}</div>}
                    {stop.pin && <div><span className="font-semibold text-zinc-800">PIN:</span> <strong className="text-amber-700">{stop.pin}</strong></div>}
                    {stop.country && <div><span className="font-semibold text-zinc-800">Country:</span> {stop.country}</div>}
                  </div>

                  <div className="flex items-center justify-between pt-1.5 text-[11px] font-semibold text-zinc-700 border-t border-zinc-200">
                    <span>Stay: {stop.stopDurationMinutes || 30}m</span>
                    {stop.detourMinutes > 0 && <span className="text-amber-700">+{stop.detourMinutes}m detour</span>}
                  </div>

                  {onRemoveStop && (
                    <button
                      onClick={() => onRemoveStop(index)}
                      className="w-full mt-2 py-1 px-2 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Stop</span>
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 4. Candidate Highway Corridor Pitstops */}
        {pitstops.map((pitstop, idx) => {
          const isAlreadyAdded = stops.some(
            (s) =>
              (s.placeId && s.placeId === pitstop.placeId) ||
              (Math.abs(s.latitude - pitstop.latitude) < 0.001 &&
                Math.abs(s.longitude - pitstop.longitude) < 0.001)
          );

          if (isAlreadyAdded || !pitstop.latitude || !pitstop.longitude) return null;

          return (
            <Marker
              key={`candidate-${pitstop._id || pitstop.name || idx}`}
              position={[Number(pitstop.latitude), Number(pitstop.longitude)]}
              icon={createCandidatePitstopIcon(pitstop.category)}
            >
              <Popup className="custom-routecraft-popup">
                <div className="p-2 min-w-[200px] text-zinc-900 font-sans space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-700">
                      {pitstop.category || 'Pitstop'}
                    </span>
                    <span className="text-emerald-700 font-black text-xs">
                      ★ {pitstop.rating || 4.5}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-zinc-900">{pitstop.name}</h4>
                  
                  {pitstop.detourMinutes > 0 && (
                    <p className="text-[11px] text-zinc-600">
                      +{pitstop.detourMinutes} min detour from route
                    </p>
                  )}

                  {onSelectPitstop && (
                    <button
                      onClick={() => onSelectPitstop(pitstop)}
                      className="w-full mt-1.5 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add to Itinerary</span>
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 5. Route Polyline Layer */}
        {polylinePositions.length > 1 && (
          <>
            {/* Outer Glow Polyline */}
            <Polyline
              positions={polylinePositions}
              pathOptions={{
                color: '#f59e0b',
                weight: 8,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Main Road Route Polyline */}
            <Polyline
              positions={polylinePositions}
              pathOptions={{
                color: '#fbbf24',
                weight: 4.5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}
      </MapContainer>

      {/* Floating Controls Overlay: India View Button (Top Left) */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-auto">
        <IndiaViewButton />
      </div>

      {/* Clicked Map Location Pinpoint Action Card */}
      {clickedLocation && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000] w-[94%] max-w-md bg-zinc-950/95 border border-zinc-700 backdrop-blur-xl p-4 rounded-3xl shadow-2xl text-white animate-in slide-in-from-bottom-3 duration-200 pointer-events-auto">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                  Clicked Map Location
                </p>
                <h4 className="text-sm font-bold text-white mt-0.5 line-clamp-1">
                  {clickedLocation.name}
                </h4>
                <p className="text-xs text-zinc-300 line-clamp-2 mt-0.5">
                  {clickedLocation.fullAddress || `${clickedLocation.city || ''} ${clickedLocation.state || ''}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setClickedLocation(null)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs cursor-pointer"
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
                    latitude: clickedLocation.latitude,
                    longitude: clickedLocation.longitude,
                    address: clickedLocation.fullAddress,
                  });
                  setClickedLocation(null);
                }}
                className="px-2 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-all text-center cursor-pointer"
              >
                Set as Start
              </button>
            )}

            {onAddAsStop && (
              <button
                onClick={() => {
                  onAddAsStop({
                    name: clickedLocation.name,
                    latitude: clickedLocation.latitude,
                    longitude: clickedLocation.longitude,
                    category: 'Pitstop',
                    street: clickedLocation.street || '',
                    area: clickedLocation.area || '',
                    city: clickedLocation.city || '',
                    district: clickedLocation.district || '',
                    state: clickedLocation.state || '',
                    pin: clickedLocation.pin || '',
                    country: clickedLocation.country || 'India',
                    address: clickedLocation.fullAddress,
                  });
                  setClickedLocation(null);
                }}
                className="px-2 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-bold transition-all text-center cursor-pointer"
              >
                + Add Stop
              </button>
            )}

            {onSetAsDestination && (
              <button
                onClick={() => {
                  onSetAsDestination({
                    name: clickedLocation.name,
                    latitude: clickedLocation.latitude,
                    longitude: clickedLocation.longitude,
                    address: clickedLocation.fullAddress,
                  });
                  setClickedLocation(null);
                }}
                className="px-2 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-xs font-bold transition-all text-center cursor-pointer"
              >
                Set as Dest
              </button>
            )}
          </div>
        </div>
      )}

      {/* Legend Badge (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-[1000] hidden sm:flex items-center gap-3 px-3 py-1.5 bg-zinc-950/90 backdrop-blur-md border border-zinc-700/80 rounded-xl text-[11px] text-zinc-200 shadow-xl pointer-events-auto">
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

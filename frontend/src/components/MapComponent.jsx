import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Utility helper to fit map bounds dynamically to route and markers
const FitBoundsHandler = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true });
    }
  }, [bounds, map]);
  return null;
};

// Custom DivIcon generators for pins with dark sleek styling
const createStartIcon = () =>
  L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute -inset-1.5 bg-emerald-500/30 rounded-full animate-ping"></div>
        <div class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white text-black flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-500/50">
          A
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

const createDestIcon = () =>
  L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute -inset-1.5 bg-rose-500/30 rounded-full animate-ping"></div>
        <div class="w-8 h-8 rounded-full bg-rose-500 border-2 border-white text-white flex items-center justify-center font-black text-xs shadow-lg shadow-rose-500/50">
          B
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

const createWaypointIcon = (index) =>
  L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="w-7 h-7 rounded-full bg-amber-500 border-2 border-white text-black flex items-center justify-center font-black text-xs shadow-md shadow-amber-500/40">
        ${index + 1}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const createCandidatePitstopIcon = (category, isSelected) => {
  let bgColor = 'bg-amber-500';
  if (category === 'Food') bgColor = 'bg-orange-500';
  else if (category === 'Coffee') bgColor = 'bg-amber-600';
  else if (category === 'Nature') bgColor = 'bg-emerald-600';
  else if (category === 'Viewpoints') bgColor = 'bg-teal-500';
  else if (category === 'Attractions') bgColor = 'bg-amber-400';
  else if (category === 'Fuel/rest stops') bgColor = 'bg-emerald-500';
  else if (category === 'Shopping') bgColor = 'bg-orange-400';

  if (isSelected) {
    bgColor = 'bg-emerald-500 ring-2 ring-white';
  }

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="w-6 h-6 rounded-full ${bgColor} border-2 border-zinc-950 text-black flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer hover:scale-125 transition-transform">
        ●
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
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
}) => {
  // Default map center (India overview or fallback)
  const defaultCenter = [17.0, 79.0];
  const defaultZoom = 7;

  // Calculate bounds to enclose all active coordinates
  const boundsPoints = [];
  if (origin && origin.latitude && origin.longitude) {
    boundsPoints.push([origin.latitude, origin.longitude]);
  }
  if (destination && destination.latitude && destination.longitude) {
    boundsPoints.push([destination.latitude, destination.longitude]);
  }
  stops.forEach((s) => {
    if (s.latitude && s.longitude) boundsPoints.push([s.latitude, s.longitude]);
  });
  if (routeCoordinates && routeCoordinates.length > 0) {
    // Add sample route coordinates
    boundsPoints.push(routeCoordinates[0]);
    boundsPoints.push(routeCoordinates[Math.floor(routeCoordinates.length / 2)]);
    boundsPoints.push(routeCoordinates[routeCoordinates.length - 1]);
  }

  // Determine polyline visual styling per travel mode (NO dark blue or purple)
  const isFlight = vehicleType === 'flight';
  const isTrain = vehicleType === 'train';
  const isBus = vehicleType === 'bus';
  const isBike = vehicleType === 'bike';

  const primaryColor = isFlight
    ? '#14b8a6' // teal
    : isTrain
    ? '#10b981' // emerald
    : isBus
    ? '#f59e0b' // amber
    : isBike
    ? '#10b981' // emerald
    : '#f59e0b'; // amber-orange for car

  const glowColor = isFlight
    ? '#5eead4'
    : isTrain
    ? '#6ee7b7'
    : isBus
    ? '#fcd34d'
    : isBike
    ? '#6ee7b7'
    : '#fcd34d';

  const geoapifyKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
  const tileUrl =
    geoapifyKey && geoapifyKey !== 'YOUR_KEY'
      ? `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${geoapifyKey}`
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const tileAttribution =
    geoapifyKey && geoapifyKey !== 'YOUR_KEY'
      ? 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-black">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Dynamic Geoapify / OpenStreetMap Tile Layer */}
        <TileLayer
          attribution={tileAttribution}
          url={tileUrl}
          maxZoom={19}
        />

        {/* Fit Bounds Handler */}
        {boundsPoints.length > 0 && <FitBoundsHandler bounds={boundsPoints} />}

        {/* Polyline Route Layer */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <>
            {/* Outer glow polyline */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: glowColor,
                weight: isFlight ? 6 : 8,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round',
                dashArray: isFlight ? '8, 12' : isTrain ? '6, 8' : undefined,
              }}
            />
            {/* Sharp inner polyline */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: primaryColor,
                weight: isFlight ? 3 : 4,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
                dashArray: isFlight ? '6, 10' : isTrain ? '8, 8' : undefined,
              }}
            />
          </>
        )}

        {/* Start / Origin Marker */}
        {origin && origin.latitude && origin.longitude && (
          <Marker
            position={[origin.latitude, origin.longitude]}
            icon={createStartIcon()}
          >
            <Popup>
              <div className="p-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                  Origin (Start)
                </span>
                <p className="font-semibold text-zinc-100 text-sm">{origin.name || 'Start Point'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && destination.latitude && destination.longitude && (
          <Marker
            position={[destination.latitude, destination.longitude]}
            icon={createDestIcon()}
          >
            <Popup>
              <div className="p-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-0.5">
                  Destination (End)
                </span>
                <p className="font-semibold text-zinc-100 text-sm">{destination.name || 'Destination'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Selected Stops Markers */}
        {stops.map((stop, idx) => (
          <Marker
            key={`stop-${stop._id || stop.name}-${idx}`}
            position={[stop.latitude, stop.longitude]}
            icon={createWaypointIcon(idx)}
          >
            <Popup>
              <div className="p-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                  Stop #{idx + 1} • {stop.category || 'Pitstop'}
                </span>
                <p className="font-semibold text-zinc-100 text-sm">{stop.name}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Stay: {stop.stopDurationMinutes || 30} mins {stop.detourMinutes ? `(+${stop.detourMinutes}m detour)` : ''}
                </p>
                {onOpenPlaceModal && (
                  <button
                    onClick={() => onOpenPlaceModal(stop)}
                    className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300 underline block"
                  >
                    View Details & Reviews →
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Candidate Pitstops Markers (unadded pitstops) */}
        {pitstops
          .filter((p) => !stops.some((s) => s.name === p.name))
          .map((pitstop, idx) => (
            <Marker
              key={`candidate-${pitstop._id || pitstop.name || 'stop'}-${idx}`}
              position={[pitstop.latitude, pitstop.longitude]}
              icon={createCandidatePitstopIcon(pitstop.category, false)}
            >
              <Popup>
                <div className="p-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      {pitstop.category}
                    </span>
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-0.5">
                      ★ {pitstop.rating || '4.5'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-zinc-100 text-sm leading-snug">{pitstop.name}</h4>
                  <p className="text-xs text-zinc-300 line-clamp-2 my-1">{pitstop.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-zinc-400 my-1">
                    <span>Detour: <strong className="text-zinc-200">+{pitstop.detourMinutes || 10}m</strong></span>
                    <span>Rec. Stay: <strong className="text-zinc-200">{pitstop.stopDurationMinutes || 30}m</strong></span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {onSelectPitstop && (
                      <button
                        onClick={() => onSelectPitstop(pitstop)}
                        className="flex-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow transition-colors"
                      >
                        + Add Stop
                      </button>
                    )}
                    {onOpenPlaceModal && (
                      <button
                        onClick={() => onOpenPlaceModal(pitstop)}
                        className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs transition-colors border border-zinc-800"
                      >
                        Details
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-black/90 backdrop-blur-md border border-zinc-800 rounded-xl px-3 py-2 text-xs shadow-lg flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          Start
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
          End
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          Itinerary Stop
        </div>
        {pitstops.length > 0 && (
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
            Pitstop
          </div>
        )}
        <div className="pl-2 border-l border-zinc-800 text-[10px] font-bold uppercase text-amber-400">
          {vehicleType === 'flight' ? '✈️ Flight Arc' : vehicleType === 'train' ? '🚆 Rail Line' : vehicleType === 'bus' ? '🚌 Bus Route' : vehicleType === 'bike' ? '🏍️ Bike Route' : '🚗 Car Route'}
        </div>
      </div>
    </div>
  );
};

export default MapComponent;

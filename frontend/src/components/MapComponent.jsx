import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Trash2, Loader2, Navigation, Info, ExternalLink } from 'lucide-react';

// Custom DivIcon Generator for dynamic numbered waypoint stops
const createNumberedStopIcon = (stopNumber) =>
  L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
        <div class="absolute -inset-1.5 bg-amber-500/30 rounded-full animate-ping"></div>
        <div class="w-8 h-8 rounded-full bg-amber-500 border-2 border-zinc-950 text-black flex items-center justify-center font-black text-xs shadow-xl shadow-amber-500/50">
          ${stopNumber}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

const createStartIcon = () =>
  L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute -inset-1.5 bg-emerald-500/30 rounded-full animate-ping"></div>
        <div class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-zinc-950 text-black flex items-center justify-center font-black text-xs shadow-xl shadow-emerald-500/50">
          A
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

const createDestIcon = () =>
  L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute -inset-1.5 bg-rose-500/30 rounded-full animate-ping"></div>
        <div class="w-8 h-8 rounded-full bg-rose-500 border-2 border-zinc-950 text-white flex items-center justify-center font-black text-xs shadow-xl shadow-rose-500/50">
          B
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

const createCandidatePitstopIcon = (category) => {
  let bgColor = 'bg-amber-500';
  if (category === 'Food') bgColor = 'bg-orange-500';
  else if (category === 'Coffee') bgColor = 'bg-amber-600';
  else if (category === 'Nature') bgColor = 'bg-emerald-600';
  else if (category === 'Viewpoints') bgColor = 'bg-teal-500';
  else if (category === 'Attractions') bgColor = 'bg-yellow-400';
  else if (category === 'Fuel/rest stops') bgColor = 'bg-emerald-500';
  else if (category === 'Shopping') bgColor = 'bg-orange-400';

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="w-5 h-5 rounded-full ${bgColor} border-2 border-zinc-950 text-black flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer hover:scale-125 transition-transform">
        ●
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

// Map click event handler component
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

// Dynamic bounds fitting helper
const FitBoundsHandler = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
    }
  }, [bounds, map]);
  return null;
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
}) => {
  // Default map center (Central India / India overview)
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  // Build points for auto-fit bounds
  const boundsPoints = [];
  if (origin && origin.latitude && origin.longitude) {
    boundsPoints.push([Number(origin.latitude), Number(origin.longitude)]);
  }
  if (destination && destination.latitude && destination.longitude) {
    boundsPoints.push([Number(destination.latitude), Number(destination.longitude)]);
  }
  stops.forEach((s) => {
    if (s.latitude && s.longitude) boundsPoints.push([Number(s.latitude), Number(s.longitude)]);
  });
  if (routeCoordinates && routeCoordinates.length > 0) {
    boundsPoints.push(routeCoordinates[0]);
    boundsPoints.push(routeCoordinates[Math.floor(routeCoordinates.length / 2)]);
    boundsPoints.push(routeCoordinates[routeCoordinates.length - 1]);
  }

  // Dynamic polyline visual styling per travel mode
  const isFlight = vehicleType === 'flight';
  const isTrain = vehicleType === 'train';
  const isBike = vehicleType === 'bike';

  const primaryColor = isFlight
    ? '#14b8a6' // teal
    : isTrain
    ? '#10b981' // emerald
    : isBike
    ? '#10b981' // emerald
    : '#f59e0b'; // amber-orange for car/bus

  const glowColor = isFlight ? '#5eead4' : isTrain ? '#6ee7b7' : isBike ? '#6ee7b7' : '#fcd34d';

  // Tile layer from OpenStreetMap / Carto Voyager
  const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  const tileAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <div className="relative w-full h-full min-h-[440px] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-black">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[440px]"
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer attribution={tileAttribution} url={tileUrl} maxZoom={19} />

        {/* Interactive Click to Add Numbered Stop */}
        <MapClickHandler onMapClick={onMapClick} />

        {/* Fit Bounds Handler */}
        {boundsPoints.length > 0 && <FitBoundsHandler bounds={boundsPoints} />}

        {/* Polyline Route Layer */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <>
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
          <Marker position={[Number(origin.latitude), Number(origin.longitude)]} icon={createStartIcon()}>
            <Popup>
              <div className="p-1 min-w-[180px]">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-1">
                  Origin (Start)
                </span>
                <p className="font-bold text-white text-sm leading-snug">{origin.name || 'Start Point'}</p>
                <div className="text-[11px] text-zinc-400 mt-1 space-y-0.5">
                  {origin.city && <div><span className="text-zinc-500">City:</span> {origin.city}</div>}
                  {origin.state && <div><span className="text-zinc-500">State:</span> {origin.state}</div>}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && destination.latitude && destination.longitude && (
          <Marker position={[Number(destination.latitude), Number(destination.longitude)]} icon={createDestIcon()}>
            <Popup>
              <div className="p-1 min-w-[180px]">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block mb-1">
                  Destination (End)
                </span>
                <p className="font-bold text-white text-sm leading-snug">{destination.name || 'Destination'}</p>
                <div className="text-[11px] text-zinc-400 mt-1 space-y-0.5">
                  {destination.city && <div><span className="text-zinc-500">City:</span> {destination.city}</div>}
                  {destination.state && <div><span className="text-zinc-500">State:</span> {destination.state}</div>}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Numbered Itinerary Stops Markers (Stop 1, Stop 2, Stop 3...) */}
        {stops.map((stop, idx) => (
          <Marker
            key={`stop-marker-${stop.id || stop._id || idx}-${stop.latitude}-${stop.longitude}`}
            position={[Number(stop.latitude), Number(stop.longitude)]}
            icon={createNumberedStopIcon(idx + 1)}
          >
            <Popup>
              <div className="p-1 min-w-[220px] max-w-[280px]">
                <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-zinc-800">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Stop {idx + 1}
                  </span>
                  {stop.category && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {stop.category}
                    </span>
                  )}
                </div>

                {stop.loadingAddress ? (
                  <div className="flex items-center gap-2 py-2 text-xs text-amber-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Finding address...</span>
                  </div>
                ) : (
                  <div className="text-xs space-y-1 text-zinc-200">
                    {/* Name / Place */}
                    <div className="font-bold text-white text-sm leading-snug mb-1.5">
                      {stop.name || `Stop ${idx + 1}`}
                    </div>

                    {/* Complete available address fields */}
                    {stop.houseNumber && (
                      <div>
                        <span className="text-zinc-400 font-medium">House No:</span>{' '}
                        <span className="font-semibold text-zinc-100">{stop.houseNumber}</span>
                      </div>
                    )}
                    {stop.street && (
                      <div>
                        <span className="text-zinc-400 font-medium">Street:</span>{' '}
                        <span className="font-semibold text-zinc-100">{stop.street}</span>
                      </div>
                    )}
                    {stop.area && (
                      <div>
                        <span className="text-zinc-400 font-medium">Area:</span>{' '}
                        <span className="font-semibold text-zinc-100">{stop.area}</span>
                      </div>
                    )}
                    {stop.city && (
                      <div>
                        <span className="text-zinc-400 font-medium">City:</span>{' '}
                        <span className="font-semibold text-zinc-100">{stop.city}</span>
                      </div>
                    )}
                    {stop.district && (
                      <div>
                        <span className="text-zinc-400 font-medium">District:</span>{' '}
                        <span className="font-semibold text-zinc-100">{stop.district}</span>
                      </div>
                    )}
                    {stop.state && (
                      <div>
                        <span className="text-zinc-400 font-medium">State:</span>{' '}
                        <span className="font-semibold text-zinc-100">{stop.state}</span>
                      </div>
                    )}
                    {stop.pin && (
                      <div>
                        <span className="text-zinc-400 font-medium">PIN:</span>{' '}
                        <span className="font-semibold text-amber-400 font-mono">{stop.pin}</span>
                      </div>
                    )}
                    {stop.country && (
                      <div>
                        <span className="text-zinc-400 font-medium">Country:</span>{' '}
                        <span className="font-semibold text-zinc-100">{stop.country}</span>
                      </div>
                    )}

                    <div className="text-[10px] text-zinc-500 font-mono pt-1">
                      {Number(stop.latitude).toFixed(5)}°, {Number(stop.longitude).toFixed(5)}°
                    </div>
                  </div>
                )}

                {/* Actions inside popup */}
                <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-zinc-400">
                    Stay: {stop.stopDurationMinutes || 30}m
                  </span>
                  {onRemoveStop && (
                    <button
                      type="button"
                      onClick={() => onRemoveStop(idx)}
                      className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-bold flex items-center gap-1 transition-colors border border-rose-500/30 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Stop</span>
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Candidate Pitstops Markers */}
        {pitstops
          .filter((p) => !stops.some((s) => s.name === p.name))
          .map((pitstop, idx) => (
            <Marker
              key={`candidate-${pitstop._id || pitstop.name || 'stop'}-${idx}`}
              position={[Number(pitstop.latitude), Number(pitstop.longitude)]}
              icon={createCandidatePitstopIcon(pitstop.category)}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      {pitstop.category}
                    </span>
                    <span className="text-xs font-bold text-amber-400">
                      ★ {pitstop.rating || '4.5'}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs leading-snug">{pitstop.name}</h4>
                  <p className="text-[11px] text-zinc-400 my-1 line-clamp-2">{pitstop.description}</p>
                  
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 my-1">
                    <span>Detour: +{pitstop.detourMinutes || 10}m</span>
                    <span>Stay: {pitstop.stopDurationMinutes || 30}m</span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {onSelectPitstop && (
                      <button
                        type="button"
                        onClick={() => onSelectPitstop(pitstop)}
                        className="flex-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow transition-colors cursor-pointer"
                      >
                        + Add Stop
                      </button>
                    )}
                    {onOpenPlaceModal && (
                      <button
                        type="button"
                        onClick={() => onOpenPlaceModal(pitstop)}
                        className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs border border-zinc-800 cursor-pointer"
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

      {/* Map Hint / Instruction Pill */}
      <div className="absolute top-4 left-4 z-20 bg-zinc-950/90 backdrop-blur-md border border-zinc-700 text-zinc-200 text-xs px-3.5 py-1.5 rounded-full shadow-xl pointer-events-none flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        <span className="font-medium">Click anywhere on the map to add Stop 1, Stop 2, Stop 3...</span>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-2xl px-3.5 py-2 text-xs shadow-xl flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500/50"></span>
          <span>Start (A)</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-sm shadow-rose-500/50"></span>
          <span>End (B)</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm shadow-amber-500/50"></span>
          <span>Numbered Stops</span>
        </div>
        {pitstops.length > 0 && (
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block shadow-sm shadow-orange-400/50"></span>
            <span>Pitstops</span>
          </div>
        )}
        <div className="pl-2 border-l border-zinc-800 text-[10px] font-bold uppercase text-amber-400">
          {vehicleType === 'flight'
            ? '✈️ Flight Arc'
            : vehicleType === 'train'
            ? '🚆 Rail Line'
            : vehicleType === 'bus'
            ? '🚌 Bus Route'
            : vehicleType === 'bike'
            ? '🏍️ Bike Route'
            : '🚗 Car Route'}
        </div>
      </div>
    </div>
  );
};

export default MapComponent;

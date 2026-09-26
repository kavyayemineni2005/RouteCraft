import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Check, X, Navigation, Loader2, Crosshair } from 'lucide-react';
import { reverseGeocodeNominatim } from '../utils/reverseGeocodeNominatim';

// Custom Pin Icon for interactive picking (Leaflet DivIcon)
const createPickerIcon = (targetType) =>
  L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute -inset-2 ${
          targetType === 'start' ? 'bg-emerald-500/40' : 'bg-rose-500/40'
        } rounded-full animate-ping"></div>
        <div class="w-9 h-9 rounded-full ${
          targetType === 'start' ? 'bg-emerald-600 border-emerald-300' : 'bg-rose-600 border-rose-300'
        } border-2 text-white flex items-center justify-center font-extrabold text-sm shadow-2xl">
          ${targetType === 'start' ? 'A' : 'B'}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

// Map Click & Drag Controller
const MapEventsHandler = ({ onLocationSelected, position }) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.flyTo(position, map.getZoom(), { duration: 0.6 });
    }
  }, [position, map]);

  return null;
};

const MapLocationPickerModal = ({
  isOpen,
  onClose,
  targetType = 'start', // 'start' | 'dest'
  initialLocation = null,
  onConfirmLocation,
}) => {
  const [selectedCoords, setSelectedCoords] = useState(
    initialLocation?.latitude && initialLocation?.longitude
      ? [Number(initialLocation.latitude), Number(initialLocation.longitude)]
      : [17.385, 78.4867] // Hyderabad / Central India
  );
  const [locationName, setLocationName] = useState(initialLocation?.name || 'Selected Map Location');
  const [shortName, setShortName] = useState(initialLocation?.name?.split(',')[0] || 'Selected Pin');
  const [addressDetails, setAddressDetails] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [locatingGPS, setLocatingGPS] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialLocation?.latitude && initialLocation?.longitude) {
        setSelectedCoords([Number(initialLocation.latitude), Number(initialLocation.longitude)]);
        setLocationName(initialLocation.name || 'Selected Location');
        setShortName(initialLocation.name?.split(',')[0] || 'Selected Location');
      } else {
        fetchAddress(selectedCoords[0], selectedCoords[1]);
      }
    }
  }, [isOpen, initialLocation]);

  const fetchAddress = async (lat, lon) => {
    setLoadingAddress(true);
    try {
      const res = await reverseGeocodeNominatim(lat, lon);
      setLocationName(res.name || res.fullAddress);
      setShortName(res.city || res.name?.split(',')[0] || 'Selected Pin');
      setAddressDetails(res);
    } catch (err) {
      setLocationName(`Coordinates (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`);
      setShortName(`Pin (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`);
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleMapClick = (lat, lon) => {
    setSelectedCoords([lat, lon]);
    fetchAddress(lat, lon);
  };

  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedCoords([latitude, longitude]);
        fetchAddress(latitude, longitude);
        setLocatingGPS(false);
      },
      (err) => {
        alert('Could not access current location: ' + err.message);
        setLocatingGPS(false);
      },
      { timeout: 8000 }
    );
  };

  const handleConfirm = () => {
    onConfirmLocation({
      name: locationName,
      shortName: shortName,
      latitude: selectedCoords[0],
      longitude: selectedCoords[1],
      city: addressDetails?.city || '',
      state: addressDetails?.state || '',
      street: addressDetails?.street || '',
      pin: addressDetails?.pin || '',
    });
    onClose();
  };

  if (!isOpen) return null;

  const isStart = targetType === 'start';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-black">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl ${
                isStart
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Pick {isStart ? 'Start Location' : 'Destination'} on Map</span>
                <span
                  className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                    isStart ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {isStart ? 'Origin (A)' : 'Destination (B)'}
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Click anywhere on the OpenStreetMap or drag the pin to select precise coordinates.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Location Address Banner */}
        <div className="px-6 py-3 bg-zinc-950 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="mt-0.5">
              {loadingAddress ? (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              ) : (
                <Crosshair className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                Detected Place Address:
              </span>
              <p className="text-xs font-bold text-zinc-100 truncate max-w-xl">
                {loadingAddress ? 'Finding address...' : locationName}
              </p>
              <span className="text-[10px] text-zinc-400 font-mono">
                Lat: {selectedCoords[0].toFixed(5)}°, Lon: {selectedCoords[1].toFixed(5)}°
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleUseCurrentGPS}
            disabled={locatingGPS}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 border border-zinc-800 cursor-pointer"
            title="Use Device GPS"
          >
            {locatingGPS ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Current GPS</span>
          </button>
        </div>

        {/* Interactive Leaflet Map Container */}
        <div className="relative flex-1 min-h-[380px] w-full bg-black">
          <MapContainer
            center={selectedCoords}
            zoom={10}
            scrollWheelZoom={true}
            className="w-full h-full min-h-[380px]"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />

            <MapEventsHandler onLocationSelected={handleMapClick} position={selectedCoords} />

            <Marker
              position={selectedCoords}
              icon={createPickerIcon(targetType)}
              draggable={true}
              eventHandlers={{
                dragend(e) {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  handleMapClick(pos.lat, pos.lng);
                },
              }}
            />
          </MapContainer>

          {/* Interactive Help Pill */}
          <div className="absolute top-4 left-4 z-[400] bg-black/90 backdrop-blur-md border border-zinc-700 text-zinc-200 text-xs px-3 py-1.5 rounded-full shadow-lg pointer-events-none flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Click map or drag pin to position</span>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-black flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-semibold transition-colors border border-zinc-800 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loadingAddress}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs text-black shadow-lg flex items-center gap-2 transition-all cursor-pointer ${
              isStart
                ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30'
                : 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/30 text-white'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Confirm {isStart ? 'Start Point' : 'Destination'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapLocationPickerModal;

import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  useMap, 
  useMapEvents 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Check, 
  X, 
  Navigation, 
  Loader2, 
  Crosshair, 
  Search, 
  Compass,
  AlertCircle 
} from 'lucide-react';
import { reverseGeocodeNominatim } from '../utils/reverseGeocodeNominatim';
import { searchSuggestionsApi } from '../services/api';

// Fix default marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Pin Icon for interactive picking
const createPickerIcon = (targetType, stopNumber = 1) => {
  const isStart = targetType === 'start';
  const isDest = targetType === 'dest';
  const label = isStart ? 'A' : isDest ? 'B' : stopNumber;
  const bg = isStart ? '#10b981' : isDest ? '#f43f5e' : '#f59e0b';
  const text = isDest ? '#ffffff' : '#000000';

  return L.divIcon({
    className: 'custom-routecraft-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; inset: -5px; background: ${bg}66; border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 36px; height: 36px; border-radius: 9999px; background: ${bg}; border: 2.5px solid #09090b; color: ${text}; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5);">
          ${label}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Map Click Handler in Modal
const ModalMapEvents = ({ onLocationSelected, position }) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.flyTo(position, map.getZoom() < 8 ? 12 : map.getZoom(), { duration: 0.8 });
    }
  }, [position, map]);

  return null;
};

const MapLocationPickerModal = ({
  isOpen,
  onClose,
  targetType = 'start', // 'start' | 'dest' | 'stop'
  stopNumber = 1,
  initialLocation = null,
  onConfirmLocation,
}) => {
  const [selectedCoords, setSelectedCoords] = useState(
    initialLocation?.latitude && initialLocation?.longitude
      ? [Number(initialLocation.latitude), Number(initialLocation.longitude)]
      : [20.5937, 78.9629] // India overview
  );

  const [locationName, setLocationName] = useState(initialLocation?.name || 'Selected Location');
  const [addressDetails, setAddressDetails] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [locatingGPS, setLocatingGPS] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialLocation?.latitude && initialLocation?.longitude) {
        const lat = Number(initialLocation.latitude);
        const lon = Number(initialLocation.longitude);
        setSelectedCoords([lat, lon]);
        setLocationName(initialLocation.name || 'Selected Location');
        fetchAddress(lat, lon);
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
      setAddressDetails(res);
    } catch (err) {
      setLocationName(`Coordinates (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`);
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleMapClick = (lat, lon) => {
    setSelectedCoords([lat, lon]);
    fetchAddress(lat, lon);
  };

  // Search input change
  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.trim().length >= 2) {
      setSearching(true);
      setShowDropdown(true);
      try {
        const res = await searchSuggestionsApi(val.trim());
        setSuggestions(res.data || []);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelectSuggestion = (place) => {
    setSearchQuery(place.name);
    setShowDropdown(false);
    const lat = Number(place.latitude);
    const lon = Number(place.longitude);
    setSelectedCoords([lat, lon]);
    setLocationName(place.name);
    fetchAddress(lat, lon);
  };

  // Use Browser GPS
  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setSelectedCoords([lat, lon]);
        setLocatingGPS(false);
        fetchAddress(lat, lon);
      },
      (err) => {
        setLocatingGPS(false);
        alert(`Could not fetch current location: ${err.message}. Please click on the map directly.`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleConfirm = () => {
    onConfirmLocation({
      name: locationName,
      latitude: selectedCoords[0],
      longitude: selectedCoords[1],
      addressDetails,
    });
    onClose();
  };

  if (!isOpen) return null;

  const targetTitle =
    targetType === 'start'
      ? 'Pick Starting Location'
      : targetType === 'dest'
      ? 'Pick Destination Location'
      : `Pick Pit Stop ${stopNumber} on Map`;

  const badgeColor =
    targetType === 'start'
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : targetType === 'dest'
      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
      : 'bg-amber-500/15 text-amber-400 border-amber-500/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-4xl h-[90vh] max-h-[780px] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-black">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${badgeColor}`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {targetTitle}
              </h3>
              <p className="text-xs text-zinc-400">
                Click anywhere on the map or search to place a pinpoint
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & GPS Bar */}
        <div className="p-3.5 bg-zinc-900/70 border-b border-zinc-800 flex flex-wrap gap-2.5 items-center justify-between relative z-30">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Indian city, road, or landmark..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            {searching && (
              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
            )}

            {showDropdown && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-40">
                {suggestions.map((s, idx) => (
                  <button
                    key={`modal-sug-${idx}`}
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-zinc-900 border-b border-zinc-900/60 last:border-none flex items-start gap-2 text-xs transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block">{s.name}</span>
                      <span className="text-[11px] text-zinc-400 line-clamp-1">{s.formattedAddress || s.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleUseCurrentGPS}
            disabled={locatingGPS}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all shrink-0 cursor-pointer"
          >
            {locatingGPS ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Current GPS</span>
          </button>
        </div>

        {/* Map View */}
        <div className="flex-1 relative bg-zinc-900">
          <MapContainer
            center={selectedCoords}
            zoom={initialLocation?.latitude ? 12 : 5}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            className="w-full h-full z-10"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={19}
            />

            <ModalMapEvents
              onLocationSelected={handleMapClick}
              position={selectedCoords}
            />

            <Marker
              position={selectedCoords}
              icon={createPickerIcon(targetType, stopNumber)}
            />
          </MapContainer>
        </div>

        {/* Location Details Footer & Confirmation */}
        <div className="p-4 bg-black border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 w-full sm:w-auto">
            <div className={`p-2 rounded-xl border shrink-0 ${badgeColor}`}>
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase">
                  Selected Location
                </span>
                {loadingAddress && (
                  <Loader2 className="w-3 h-3 animate-spin text-amber-400 inline" />
                )}
              </div>
              <h4 className="text-sm font-bold text-white truncate max-w-md">
                {locationName}
              </h4>
              <p className="text-[11px] text-zinc-400 truncate max-w-md">
                {addressDetails?.fullAddress || `${selectedCoords[0].toFixed(5)}°, ${selectedCoords[1].toFixed(5)}°`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-lg shadow-amber-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLocationPickerModal;

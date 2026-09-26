import React, { useState, useEffect, useRef } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
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
import { 
  getTomTomApiKey, 
  reverseGeocodeTomTom, 
  searchTomTomPlaces,
  createTomTomMarkerElement 
} from '../services/tomtomService';

const MapLocationPickerModal = ({
  isOpen,
  onClose,
  targetType = 'start', // 'start' | 'dest' | 'stop'
  stopNumber = 1,
  initialLocation = null,
  onConfirmLocation,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

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

  const apiKey = getTomTomApiKey();

  // Initialize TomTom Map inside modal
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    const initialLat = initialLocation?.latitude ? Number(initialLocation.latitude) : 20.5937;
    const initialLng = initialLocation?.longitude ? Number(initialLocation.longitude) : 78.9629;
    const initialZoom = initialLocation?.latitude ? 12 : 5;

    const keyToUse = apiKey || 'YOUR_TOMTOM_API_KEY';

    try {
      const map = tt.map({
        key: keyToUse,
        container: mapContainerRef.current,
        center: [initialLng, initialLat],
        zoom: initialZoom,
        dragPan: true,
        stylesConfig: {
          style: 'main',
          layer: 'basic',
        },
      });

      map.addControl(new tt.NavigationControl(), 'top-right');

      map.on('load', () => {
        map.resize();

        // Place initial marker
        const markerType = targetType === 'stop' ? 'stop' : targetType;
        const label = targetType === 'stop' ? stopNumber : targetType === 'start' ? 'A' : 'B';
        const el = createTomTomMarkerElement(markerType, label);

        const marker = new tt.Marker({ element: el })
          .setLngLat([initialLng, initialLat])
          .addTo(map);

        markerRef.current = marker;

        if (initialLocation?.latitude && initialLocation?.longitude) {
          fetchAddress(initialLat, initialLng);
        }
      });

      // Handle map click
      map.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        setSelectedCoords([lat, lng]);

        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
        }

        fetchAddress(lat, lng);
      });

      mapInstanceRef.current = map;
    } catch (err) {
      console.warn('[MapPicker Init Error]:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  const fetchAddress = async (lat, lon) => {
    setLoadingAddress(true);
    try {
      const res = await reverseGeocodeTomTom(lat, lon);
      setLocationName(res.name || res.fullAddress);
      setAddressDetails(res);
    } catch (err) {
      setLocationName(`Coordinates (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`);
    } finally {
      setLoadingAddress(false);
    }
  };

  // Search places in modal
  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.trim().length >= 2) {
      setSearching(true);
      setShowDropdown(true);
      try {
        const results = await searchTomTomPlaces(val);
        setSuggestions(results);
      } catch (err) {
        console.warn('Search notice:', err);
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
    setSelectedCoords([place.latitude, place.longitude]);
    setLocationName(place.fullName || place.name);
    setAddressDetails(place);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [place.longitude, place.latitude],
        zoom: 14,
        duration: 1000,
      });

      if (markerRef.current) {
        markerRef.current.setLngLat([place.longitude, place.latitude]);
      }
    }
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

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo({
            center: [lon, lat],
            zoom: 15,
            duration: 1200,
          });

          if (markerRef.current) {
            markerRef.current.setLngLat([lon, lat]);
          }
        }

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
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      : targetType === 'dest'
      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
      : 'bg-amber-500/10 text-amber-400 border-amber-500/30';

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
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all"
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
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            {searching && (
              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
            )}

            {showDropdown && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-40">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-zinc-900 border-b border-zinc-900/60 last:border-none flex items-start gap-2 text-xs transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block">{s.name}</span>
                      <span className="text-[11px] text-zinc-400 line-clamp-1">{s.fullName}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleUseCurrentGPS}
            disabled={locatingGPS}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all shrink-0"
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
        <div className="flex-1 relative bg-zinc-950">
          <div ref={mapContainerRef} className="w-full h-full" />
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
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-lg shadow-amber-500/25 transition-all flex items-center gap-1.5"
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

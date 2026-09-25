import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Sliders, 
  Sparkles, 
  Plus, 
  ArrowUpDown, 
  RotateCcw, 
  Share2, 
  Bookmark, 
  Check, 
  ExternalLink,
  Layers,
  ListOrdered,
  Coffee,
  Utensils,
  Trees,
  Eye,
  Landmark,
  Fuel,
  ShoppingBag,
  AlertCircle
} from 'lucide-react';

import { 
  geocodeApi, 
  calculateRouteApi, 
  discoverPitstopsApi 
} from '../services/api';
import { useAuth } from '../context/AuthContext';

import TimeBudget, { formatDuration } from '../components/TimeBudget';
import MapComponent from '../components/MapComponent';
import PitstopCard from '../components/PitstopCard';
import StopItem from '../components/StopItem';
import PlaceModal from '../components/PlaceModal';
import TripSaveModal from '../components/TripSaveModal';
import Loading from '../components/Loading';

const CATEGORIES = [
  { id: 'Food', label: 'Food & Dining', icon: Utensils },
  { id: 'Coffee', label: 'Artisan Coffee', icon: Coffee },
  { id: 'Nature', label: 'Nature & Parks', icon: Trees },
  { id: 'Viewpoints', label: 'Scenic Viewpoints', icon: Eye },
  { id: 'Attractions', label: 'Attractions & Heritage', icon: Landmark },
  { id: 'Fuel/rest stops', label: 'Fuel & Rest Stops', icon: Fuel },
  { id: 'Shopping', label: 'Local Crafts & Shopping', icon: ShoppingBag },
];

const Planner = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Search & Settings Form State
  const [startQuery, setStartQuery] = useState(searchParams.get('start') || 'Vijayawada');
  const [destQuery, setDestQuery] = useState(searchParams.get('dest') || 'Hyderabad');
  const [availableBudget, setAvailableBudget] = useState(
    Number(searchParams.get('budget')) || 360 // default 6 hours
  );
  const [maxDetour, setMaxDetour] = useState(30); // minutes
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Active Route Geometry & Waypoints State
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [stops, setStops] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [drivingDuration, setDrivingDuration] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);

  // Pitstops Discovered
  const [pitstops, setPitstops] = useState([]);

  // UI state
  const [activeTab, setActiveTab] = useState('pitstops'); // 'pitstops' | 'itinerary'
  const [loading, setLoading] = useState(false);
  const [loadingPitstops, setLoadingPitstops] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);

  // Modals
  const [selectedPlaceModal, setSelectedPlaceModal] = useState(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Initial Calculation on mount
  useEffect(() => {
    if (startQuery && destQuery) {
      handleCalculateRoute(startQuery, destQuery);
    }
  }, []);

  // Primary handler: Geocodes start and dest, calculates base route, and fetches candidate pitstops
  const handleCalculateRoute = async (startLocStr, destLocStr) => {
    const sQuery = startLocStr || startQuery;
    const dQuery = destLocStr || destQuery;

    if (!sQuery.trim() || !dQuery.trim()) {
      setErrorMessage('Please provide both Start location and Destination.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Geocode both points
      const [startLoc, destLoc] = await Promise.all([
        geocodeApi(sQuery.trim()),
        geocodeApi(dQuery.trim()),
      ]);

      setOrigin(startLoc.data);
      setDestination(destLoc.data);
      setStops([]); // Reset previously added stops

      // 2. Calculate Base Direct Route
      const routeRes = await calculateRouteApi([startLoc.data, destLoc.data]);
      const { coordinates, distance, duration } = routeRes.data;

      setRouteCoordinates(coordinates);
      setTotalDistance(distance);
      setDrivingDuration(duration);

      // 3. Fetch candidate pitstops along this corridor
      fetchPitstopsForRoute(coordinates, duration, startLoc.data, destLoc.data);
    } catch (err) {
      console.error('[Planner Error]:', err);
      setErrorMessage(err.message || 'Failed to calculate route. Please verify place names.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch pitstops for given route coordinates
  const fetchPitstopsForRoute = async (coords, mainDuration, startPoint, destPoint) => {
    setLoadingPitstops(true);
    try {
      const res = await discoverPitstopsApi({
        routeCoordinates: coords,
        preferredCategories: selectedCategories,
        maxDetourMinutes: maxDetour,
        mainRouteDurationMinutes: mainDuration,
        startPoint: startPoint || origin,
        destPoint: destPoint || destination,
      });
      setPitstops(res.data || []);
    } catch (err) {
      console.warn('Pitstop discovery notice:', err.message);
      setPitstops([]);
    } finally {
      setLoadingPitstops(false);
    }
  };

  // Recalculate route whenever stops array changes
  const updateFullRouteWithStops = useCallback(
    async (newStops) => {
      if (!origin || !destination) return;
      try {
        const points = [origin, ...newStops, destination];
        const routeRes = await calculateRouteApi(points);
        const { coordinates, distance, duration } = routeRes.data;
        setRouteCoordinates(coordinates);
        setTotalDistance(distance);
        setDrivingDuration(duration);
      } catch (err) {
        console.warn('Could not recalculate full route with stops:', err.message);
      }
    },
    [origin, destination]
  );

  // Category filter toggle
  const toggleCategory = (catId) => {
    const updated = selectedCategories.includes(catId)
      ? selectedCategories.filter((c) => c !== catId)
      : [...selectedCategories, catId];
    setSelectedCategories(updated);

    if (routeCoordinates && routeCoordinates.length > 0) {
      fetchPitstopsForRoute(routeCoordinates, drivingDuration, origin, destination);
    }
  };

  // Swap start and destination
  const handleSwap = () => {
    const tempS = startQuery;
    const tempD = destQuery;
    setStartQuery(tempD);
    setDestQuery(tempS);
    handleCalculateRoute(tempD, tempS);
  };

  // Add / Remove stop
  const handleToggleAddStop = (pitstop) => {
    const exists = stops.some((s) => s.name === pitstop.name);
    let updatedStops;
    if (exists) {
      updatedStops = stops.filter((s) => s.name !== pitstop.name);
    } else {
      updatedStops = [...stops, pitstop];
    }
    setStops(updatedStops);
    updateFullRouteWithStops(updatedStops);
  };

  // Move stop position earlier / later
  const handleMoveStop = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= stops.length) return;
    const updated = [...stops];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setStops(updated);
    updateFullRouteWithStops(updated);
  };

  // Update stop stay duration
  const handleUpdateStopDuration = (index, newDurationMinutes) => {
    const updated = [...stops];
    updated[index] = { ...updated[index], stopDurationMinutes: newDurationMinutes };
    setStops(updated);
  };

  // Remove stop
  const handleRemoveStop = (index) => {
    const updated = stops.filter((_, i) => i !== index);
    setStops(updated);
    updateFullRouteWithStops(updated);
  };

  // Copy shareable link
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/planner?start=${encodeURIComponent(
      startQuery
    )}&dest=${encodeURIComponent(destQuery)}&budget=${availableBudget}`;
    navigator.clipboard.writeText(shareUrl);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  // Export to Google Maps Navigation link
  const handleOpenGoogleMaps = () => {
    if (!origin || !destination) return;
    const originStr = encodeURIComponent(`${origin.latitude},${origin.longitude}`);
    const destStr = encodeURIComponent(`${destination.latitude},${destination.longitude}`);
    let url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}`;
    if (stops.length > 0) {
      const waypoints = stops
        .map((s) => `${s.latitude},${s.longitude}`)
        .join('|');
      url += `&waypoints=${encodeURIComponent(waypoints)}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: TimeBudget Component */}
      <TimeBudget
        availableTime={availableBudget}
        drivingTime={drivingDuration}
        stops={stops}
      />

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Control & Itinerary Panel */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Search & Configuration Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4 text-sky-400" />
                Route Settings
              </h3>
              <button
                type="button"
                onClick={handleSwap}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
                title="Swap Start & Destination"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Swap</span>
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCalculateRoute();
              }}
              className="space-y-3"
            >
              {/* Origin */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Start Location
                </label>
                <input
                  type="text"
                  required
                  value={startQuery}
                  onChange={(e) => setStartQuery(e.target.value)}
                  placeholder="e.g. Vijayawada, Bangalore"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Destination */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  Destination
                </label>
                <input
                  type="text"
                  required
                  value={destQuery}
                  onChange={(e) => setDestQuery(e.target.value)}
                  placeholder="e.g. Hyderabad, Mysore"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Time Budget & Max Detour Controls */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-400" />
                    Budget ({formatDuration(availableBudget)})
                  </label>
                  <select
                    value={availableBudget}
                    onChange={(e) => setAvailableBudget(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value={180}>3 Hours</option>
                    <option value={240}>4 Hours</option>
                    <option value={300}>5 Hours</option>
                    <option value={360}>6 Hours</option>
                    <option value={480}>8 Hours</option>
                    <option value={600}>10 Hours</option>
                    <option value={720}>12 Hours</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-indigo-400" />
                    Max Detour: +{maxDetour}m
                  </label>
                  <select
                    value={maxDetour}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMaxDetour(val);
                      if (routeCoordinates?.length > 0) {
                        fetchPitstopsForRoute(routeCoordinates, drivingDuration, origin, destination);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value={10}>+10 min max detour</option>
                    <option value={20}>+20 min max detour</option>
                    <option value={30}>+30 min max detour</option>
                    <option value={45}>+45 min max detour</option>
                    <option value={60}>+60 min max detour</option>
                  </select>
                </div>
              </div>

              {/* Calculate Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Optimizing Route...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Recalculate Route</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Category Filter Pills */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              Filter Pitstop Categories
            </span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                        : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Navigation: Discovered Pitstops vs Active Itinerary */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-4">
            <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('pitstops')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'pitstops'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Nearby Pitstops ({pitstops.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('itinerary')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'itinerary'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>My Itinerary ({stops.length})</span>
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'pitstops' ? (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {loadingPitstops ? (
                  <Loading message="Scanning highway corridor..." subtext="Locating verified pitstops within detour limit..." />
                ) : pitstops.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs">
                    No pitstops found within {maxDetour} mins detour. Try expanding your detour threshold or category filters!
                  </div>
                ) : (
                  pitstops.map((pitstop) => (
                    <PitstopCard
                      key={pitstop._id || pitstop.name}
                      pitstop={pitstop}
                      isAdded={stops.some((s) => s.name === pitstop.name)}
                      onToggleAdd={handleToggleAddStop}
                      onOpenDetails={(p) => setSelectedPlaceModal(p)}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {stops.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs">
                    No pitstops added to itinerary yet. Switch to "Nearby Pitstops" and click "+ Add to Trip"!
                  </div>
                ) : (
                  stops.map((stop, idx) => (
                    <StopItem
                      key={`itinerary-stop-${stop._id || stop.name}-${idx}`}
                      stop={stop}
                      index={idx}
                      totalStops={stops.length}
                      onMoveUp={(i) => handleMoveStop(i, i - 1)}
                      onMoveDown={(i) => handleMoveStop(i, i + 1)}
                      onRemove={handleRemoveStop}
                      onUpdateDuration={handleUpdateStopDuration}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Map & Action Toolbar */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Action Toolbar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-3 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <strong>{totalDistance}</strong> km total
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <span className="flex items-center gap-1">
                <strong>{formatDuration(drivingDuration)}</strong> drive
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <span className="text-sky-400 font-bold">
                {stops.length} waypoints
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Share Route Button */}
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1.5"
                title="Share route link"
              >
                {shareSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{shareSuccess ? 'Copied!' : 'Share'}</span>
              </button>

              {/* Google Maps Nav */}
              <button
                type="button"
                onClick={handleOpenGoogleMaps}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1.5"
                title="Open in Google Maps"
              >
                <ExternalLink className="w-4 h-4 text-sky-400" />
                <span className="hidden sm:inline">Google Maps</span>
              </button>

              {/* Save Trip Button */}
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login', { state: { from: '/planner' } });
                  } else {
                    setIsSaveModalOpen(true);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center gap-1.5 transition-all"
              >
                <Bookmark className="w-4 h-4" />
                <span>Save Trip</span>
              </button>
            </div>
          </div>

          {/* Leaflet Map Card */}
          <div className="h-[560px] w-full">
            <MapComponent
              origin={origin}
              destination={destination}
              stops={stops}
              pitstops={pitstops}
              routeCoordinates={routeCoordinates}
              onSelectPitstop={handleToggleAddStop}
              onOpenPlaceModal={(p) => setSelectedPlaceModal(p)}
            />
          </div>
        </div>
      </div>

      {/* Place Details & Reviews Modal */}
      {selectedPlaceModal && (
        <PlaceModal
          place={selectedPlaceModal}
          isOpen={!!selectedPlaceModal}
          onClose={() => setSelectedPlaceModal(null)}
        />
      )}

      {/* Trip Save Modal */}
      {isSaveModalOpen && (
        <TripSaveModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          tripData={{
            startLocation: origin,
            endLocation: destination,
            stops: stops,
            totalDurationMinutes: drivingDuration,
            availableTimeBudgetMinutes: availableBudget,
            totalDistanceKm: totalDistance,
            routeCoordinates: routeCoordinates,
          }}
          onSavedSuccess={(savedTrip) => {
            // Optional callback after saving
          }}
        />
      )}
    </div>
  );
};

export default Planner;

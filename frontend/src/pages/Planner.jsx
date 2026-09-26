import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
  AlertCircle,
  Car,
  Bike,
  Bus,
  Train,
  Plane,
  Users,
  IndianRupee,
  Search,
  Crosshair,
  Compass,
  Loader2,
  Map,
  X
} from 'lucide-react';

import { 
  geocodeApi, 
  calculateRouteApi, 
  discoverPitstopsApi 
} from '../services/api';
import { 
  searchTomTomPlaces, 
  reverseGeocodeTomTom, 
  calculateTomTomRoute,
  isTomTomConfigured 
} from '../services/tomtomService';
import { useAuth } from '../context/AuthContext';

import TimeBudget, { formatDuration } from '../components/TimeBudget';
import FinancialBudget, { formatCurrency } from '../components/FinancialBudget';
import MapComponent from '../components/MapComponent';
import MapLocationPickerModal from '../components/MapLocationPickerModal';
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

const TRAVEL_MODES = [
  { id: 'car', label: 'Car', icon: Car, desc: 'TomTom road route + expressway tolls' },
  { id: 'bike', label: 'Bike', icon: Bike, desc: 'Two-wheeler road route & ₹0 tolls' },
  { id: 'bus', label: 'Bus', icon: Bus, desc: 'Intercity bus highway corridor tariff' },
  { id: 'train', label: 'Train', icon: Train, desc: 'Railway corridor express fare' },
  { id: 'flight', label: 'Flight', icon: Plane, desc: 'Aerial flight path & time' },
];

const Planner = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Search & Settings Form State
  const [startQuery, setStartQuery] = useState(searchParams.get('start') || '');
  const [destQuery, setDestQuery] = useState(searchParams.get('dest') || '');
  const [vehicleType, setVehicleType] = useState(searchParams.get('vehicle') || 'car');
  const [travelersCount, setTravelersCount] = useState(Number(searchParams.get('travelers')) || 1);
  const [availableBudget, setAvailableBudget] = useState(
    Number(searchParams.get('budget')) || 360 // default 6 hours
  );
  const [totalBudget, setTotalBudget] = useState(
    Number(searchParams.get('totalBudget')) || 5000 // default user budget
  );
  const [calculatedBudget, setCalculatedBudget] = useState(null);
  const [maxDetour, setMaxDetour] = useState(Number(searchParams.get('detour')) || 30);
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('categories') ? searchParams.get('categories').split(',').filter(Boolean) : []
  );

  // Active Route Geometry & Waypoints State
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [stops, setStops] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [drivingDuration, setDrivingDuration] = useState(0);
  const [directDuration, setDirectDuration] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [transitInfo, setTransitInfo] = useState(null);

  // Autocomplete Suggestions State
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [locatingGPS, setLocatingGPS] = useState(false);

  // Map Picker Modal State
  const [mapPickerTarget, setMapPickerTarget] = useState(null); // 'start' | 'dest' | 'stop'

  // Custom Pitstop Search Bar State
  const [pitstopSearchQuery, setPitstopSearchQuery] = useState('');
  const [pitstopSuggestions, setPitstopSuggestions] = useState([]);
  const [showPitstopDropdown, setShowPitstopDropdown] = useState(false);
  const [searchingPitstop, setSearchingPitstop] = useState(false);

  // Pitstops Discovered along Corridor
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

  const startInputRef = useRef(null);
  const destInputRef = useRef(null);

  // DnD Sensors setup
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initial Calculation on mount if params are provided or pending trip exists
  useEffect(() => {
    const pendingJson = sessionStorage.getItem('routecraft_pending_trip');
    if (pendingJson) {
      try {
        const pending = JSON.parse(pendingJson);
        if (pending.startQuery) setStartQuery(pending.startQuery);
        if (pending.destQuery) setDestQuery(pending.destQuery);
        if (pending.origin) setOrigin(pending.origin);
        if (pending.destination) setDestination(pending.destination);
        if (pending.stops && pending.stops.length > 0) setStops(pending.stops);
        if (pending.vehicleType) setVehicleType(pending.vehicleType);
        if (pending.travelersCount) setTravelersCount(pending.travelersCount);
        if (pending.totalBudget) setTotalBudget(pending.totalBudget);
        if (pending.availableBudget) setAvailableBudget(pending.availableBudget);

        if (pending.startQuery && pending.destQuery) {
          handleCalculateRoute(pending.startQuery, pending.destQuery, pending.vehicleType, pending.travelersCount);
        }
      } catch (e) {
        console.warn('Could not restore pending trip:', e);
      }
    } else if (startQuery && destQuery) {
      handleCalculateRoute(startQuery, destQuery, vehicleType, travelersCount);
    }
  }, []);

  // Autocomplete search debounce for Start input using TomTom Places Search
  useEffect(() => {
    if (!startQuery || startQuery.trim().length < 2 || !showStartDropdown) {
      setStartSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await searchTomTomPlaces(startQuery);
        setStartSuggestions(results || []);
      } catch (err) {
        setStartSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [startQuery, showStartDropdown]);

  // Autocomplete search debounce for Destination input using TomTom Places Search
  useEffect(() => {
    if (!destQuery || destQuery.trim().length < 2 || !showDestDropdown) {
      setDestSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await searchTomTomPlaces(destQuery);
        setDestSuggestions(results || []);
      } catch (err) {
        setDestSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [destQuery, showDestDropdown]);

  // Pitstop Search Autocomplete
  useEffect(() => {
    if (!pitstopSearchQuery || pitstopSearchQuery.trim().length < 2 || !showPitstopDropdown) {
      setPitstopSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingPitstop(true);
      try {
        const results = await searchTomTomPlaces(pitstopSearchQuery);
        setPitstopSuggestions(results || []);
      } catch (err) {
        setPitstopSuggestions([]);
      } finally {
        setSearchingPitstop(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [pitstopSearchQuery, showPitstopDropdown]);

  // Primary handler: Geocodes start and dest, calculates base route, and fetches candidate pitstops
  const handleCalculateRoute = async (startLocStr, destLocStr, vType, travelers) => {
    const sQuery = startLocStr !== undefined ? startLocStr : startQuery;
    const dQuery = destLocStr !== undefined ? destLocStr : destQuery;
    const currentVehicle = vType || vehicleType;
    const currentTravelers = travelers || travelersCount;

    if (!sQuery || !sQuery.trim() || !dQuery || !dQuery.trim()) {
      setErrorMessage('Please provide both Start location and Destination to build your route.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setShowStartDropdown(false);
    setShowDestDropdown(false);

    try {
      let startPoint = origin;
      let destPoint = destination;

      if (!startPoint || startPoint.name !== sQuery) {
        const tomtomResults = await searchTomTomPlaces(sQuery.trim());
        if (tomtomResults && tomtomResults.length > 0) {
          startPoint = {
            name: tomtomResults[0].fullName || tomtomResults[0].name,
            latitude: tomtomResults[0].latitude,
            longitude: tomtomResults[0].longitude,
          };
        } else {
          const resStart = await geocodeApi(sQuery.trim());
          startPoint = resStart.data;
        }
        setOrigin(startPoint);
      }

      if (!destPoint || destPoint.name !== dQuery) {
        const tomtomResults = await searchTomTomPlaces(dQuery.trim());
        if (tomtomResults && tomtomResults.length > 0) {
          destPoint = {
            name: tomtomResults[0].fullName || tomtomResults[0].name,
            latitude: tomtomResults[0].latitude,
            longitude: tomtomResults[0].longitude,
          };
        } else {
          const resDest = await geocodeApi(dQuery.trim());
          destPoint = resDest.data;
        }
        setDestination(destPoint);
      }

      setStops([]);

      // Calculate route (TomTom / Road / Train / Flight)
      let routeData;
      if (currentVehicle === 'car' || currentVehicle === 'bike') {
        try {
          routeData = await calculateTomTomRoute([startPoint, destPoint], currentVehicle);
        } catch (ttErr) {
          console.warn('Direct TomTom routing notice, falling back:', ttErr.message);
          const routeRes = await calculateRouteApi([startPoint, destPoint], currentVehicle, currentTravelers);
          routeData = routeRes.data;
        }
      } else {
        const routeRes = await calculateRouteApi([startPoint, destPoint], currentVehicle, currentTravelers);
        routeData = routeRes.data;
      }

      const { coordinates, distance, duration, transitInfo: tInfo } = routeData;

      setRouteCoordinates(coordinates || []);
      setTotalDistance(distance || 0);
      setDrivingDuration(duration || 0);
      setDirectDuration(duration || 0);
      setTransitInfo(tInfo || null);

      if (currentVehicle === 'car' || currentVehicle === 'bike' || currentVehicle === 'bus') {
        fetchPitstopsForRoute(coordinates, duration, startPoint, destPoint);
      } else {
        setPitstops([]);
      }
    } catch (err) {
      console.error('[Planner Error]:', err);
      setErrorMessage(err.message || 'Failed to calculate route. Please check place names or pick on map.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch pitstops for given route coordinates
  const fetchPitstopsForRoute = async (coords, mainDuration, startPoint, destPoint) => {
    if (!coords || coords.length < 2) return;
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

  // Recalculate route whenever stops array or travel mode changes
  // Route order: START -> 1 -> 2 -> 3 -> DESTINATION
  const updateFullRouteWithStops = useCallback(
    async (newStops, vType, travelers) => {
      if (!origin || !destination) return;
      const currentVehicle = vType || vehicleType;
      const currentTravelers = travelers || travelersCount;
      try {
        const points = [origin, ...newStops, destination];
        let routeData;

        if (currentVehicle === 'car' || currentVehicle === 'bike') {
          try {
            routeData = await calculateTomTomRoute(points, currentVehicle);
          } catch (ttErr) {
            const routeRes = await calculateRouteApi(points, currentVehicle, currentTravelers);
            routeData = routeRes.data;
          }
        } else {
          const routeRes = await calculateRouteApi(points, currentVehicle, currentTravelers);
          routeData = routeRes.data;
        }

        const { coordinates, distance, duration, transitInfo: tInfo } = routeData;
        setRouteCoordinates(coordinates || []);
        setTotalDistance(distance || 0);
        setDrivingDuration(duration || 0);
        setTransitInfo(tInfo || null);
      } catch (err) {
        console.warn('Could not recalculate full route with stops:', err.message);
      }
    },
    [origin, destination, vehicleType, travelersCount]
  );

  // Switch Travel Mode and immediately recalculate route
  const handleVehicleChange = (newType) => {
    if (newType === vehicleType) return;
    setVehicleType(newType);
    if (origin && destination) {
      if (stops.length > 0 && (newType === 'car' || newType === 'bike')) {
        updateFullRouteWithStops(stops, newType, travelersCount);
      } else {
        handleCalculateRoute(origin.name, destination.name, newType, travelersCount);
      }
    }
  };

  // Change Number of Travelers
  const handleTravelersChange = (newCount) => {
    const count = Math.max(1, Math.min(20, Number(newCount) || 1));
    setTravelersCount(count);
    if (origin && destination) {
      if (stops.length > 0) {
        updateFullRouteWithStops(stops, vehicleType, count);
      } else {
        handleCalculateRoute(origin.name, destination.name, vehicleType, count);
      }
    }
  };

  // Select suggestion from autocomplete dropdown
  const handleSelectSuggestion = (place, target) => {
    if (target === 'start') {
      const placeName = place.fullName || place.name;
      setStartQuery(placeName);
      setOrigin({
        name: placeName,
        latitude: Number(place.latitude),
        longitude: Number(place.longitude),
      });
      setShowStartDropdown(false);
      if (destination) {
        handleCalculateRoute(placeName, destination.name, vehicleType, travelersCount);
      }
    } else {
      const placeName = place.fullName || place.name;
      setDestQuery(placeName);
      setDestination({
        name: placeName,
        latitude: Number(place.latitude),
        longitude: Number(place.longitude),
      });
      setShowDestDropdown(false);
      if (origin) {
        handleCalculateRoute(origin.name, placeName, vehicleType, travelersCount);
      }
    }
  };

  // Use Browser GPS for Start Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser. Please use Pick on Map.');
      return;
    }

    setLocatingGPS(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setLocatingGPS(false);

        try {
          const addr = await reverseGeocodeTomTom(lat, lon);
          const name = addr.name || addr.fullAddress || `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
          setStartQuery(name);
          const startObj = {
            name,
            latitude: lat,
            longitude: lon,
          };
          setOrigin(startObj);

          if (destination) {
            handleCalculateRoute(name, destination.name, vehicleType, travelersCount);
          }
        } catch (e) {
          const fallbackName = `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
          setStartQuery(fallbackName);
          setOrigin({ name: fallbackName, latitude: lat, longitude: lon });
        }
      },
      (err) => {
        setLocatingGPS(false);
        setErrorMessage(
          `Location permission was denied or unavailable (${err.message}). You can use "Pick on Map" to select your starting location.`
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Confirm Location Picked on Map
  const handleConfirmLocationFromMap = (locationData) => {
    if (mapPickerTarget === 'start') {
      setStartQuery(locationData.name);
      const newOrig = {
        name: locationData.name,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      };
      setOrigin(newOrig);
      if (destination) {
        handleCalculateRoute(locationData.name, destination.name, vehicleType, travelersCount);
      }
    } else if (mapPickerTarget === 'dest') {
      setDestQuery(locationData.name);
      const newDest = {
        name: locationData.name,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      };
      setDestination(newDest);
      if (origin) {
        handleCalculateRoute(origin.name, locationData.name, vehicleType, travelersCount);
      }
    } else if (mapPickerTarget === 'stop') {
      const newStop = {
        id: `stop-${Date.now()}`,
        name: locationData.name,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        stopDurationMinutes: 30,
        category: 'Pitstop',
        street: locationData.addressDetails?.street || '',
        city: locationData.addressDetails?.city || '',
        state: locationData.addressDetails?.state || '',
        pin: locationData.addressDetails?.pin || '',
      };
      const updatedStops = [...stops, newStop];
      setStops(updatedStops);
      setActiveTab('itinerary');
      updateFullRouteWithStops(updatedStops, vehicleType, travelersCount);
    }
  };

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
    const tempOrigin = origin;
    const tempDest = destination;

    setStartQuery(tempD);
    setDestQuery(tempS);
    setOrigin(tempDest);
    setDestination(tempOrigin);

    if (tempDest && tempOrigin) {
      handleCalculateRoute(tempDest.name, tempOrigin.name, vehicleType, travelersCount);
    }
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
    updateFullRouteWithStops(updatedStops, vehicleType, travelersCount);
  };

  // Select pitstop from search dropdown
  const handleSelectPitstopSuggestion = (place) => {
    const newStop = {
      id: `stop-${Date.now()}`,
      name: place.fullName || place.name,
      latitude: place.latitude,
      longitude: place.longitude,
      stopDurationMinutes: 30,
      category: place.category || 'Pitstop',
      street: place.street || '',
      city: place.city || '',
      state: place.state || '',
      pin: place.postalCode || '',
    };
    const updated = [...stops, newStop];
    setStops(updated);
    setPitstopSearchQuery('');
    setShowPitstopDropdown(false);
    setActiveTab('itinerary');
    updateFullRouteWithStops(updated, vehicleType, travelersCount);
  };

  // Move stop position earlier / later via buttons
  const handleMoveStop = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= stops.length) return;
    const updated = [...stops];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setStops(updated);
    updateFullRouteWithStops(updated, vehicleType, travelersCount);
  };

  // Drag and drop reordering handler via @dnd-kit
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = stops.findIndex((s, idx) => (s._id || s.id || s.name || `stop-${idx}`) === active.id);
      const newIndex = stops.findIndex((s, idx) => (s._id || s.id || s.name || `stop-${idx}`) === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const updated = arrayMove(stops, oldIndex, newIndex);
        setStops(updated);
        updateFullRouteWithStops(updated, vehicleType, travelersCount);
      }
    }
  };

  // Update stop stay duration
  const handleUpdateStopDuration = (index, newDurationMinutes) => {
    const updated = [...stops];
    updated[index] = { ...updated[index], stopDurationMinutes: newDurationMinutes };
    setStops(updated);
  };

  // Update individual stop estimated cost in ₹
  const handleUpdateStopCost = (index, newCost) => {
    const updated = [...stops];
    updated[index] = { ...updated[index], estimatedCost: newCost };
    setStops(updated);
  };

  // Remove stop
  const handleRemoveStop = (index) => {
    const updated = stops.filter((_, i) => i !== index);
    setStops(updated);
    updateFullRouteWithStops(updated, vehicleType, travelersCount);
  };

  // Interactive click anywhere on map to add numbered Stop 1, Stop 2, Stop 3... with full TomTom reverse geocode
  const handleMapClick = async (lat, lng) => {
    const tempId = `stop-click-${Date.now()}-${Math.random()}`;
    const newStopPlaceholder = {
      id: tempId,
      name: 'Finding address...',
      latitude: lat,
      longitude: lng,
      stopDurationMinutes: 30,
      loadingAddress: true,
      category: 'Itinerary Stop',
    };

    const nextStops = [...stops, newStopPlaceholder];
    setStops(nextStops);
    setActiveTab('itinerary');

    try {
      const geoResult = await reverseGeocodeTomTom(lat, lng);
      setStops((prevStops) =>
        prevStops.map((s) => {
          if (s.id === tempId || (s.latitude === lat && s.longitude === lng && s.loadingAddress)) {
            return {
              ...s,
              name: geoResult.name || `Stop ${prevStops.indexOf(s) + 1}`,
              shortName: geoResult.name,
              houseNumber: geoResult.houseNumber || '',
              street: geoResult.street || '',
              area: geoResult.area || '',
              city: geoResult.city || '',
              district: geoResult.district || '',
              state: geoResult.state || '',
              pin: geoResult.pin || '',
              country: geoResult.country || 'India',
              fullAddress: geoResult.fullAddress || '',
              loadingAddress: false,
            };
          }
          return s;
        })
      );

      // Recalculate route if origin and destination are set
      if (origin && destination) {
        const resolvedStops = nextStops.map((s) =>
          s.id === tempId ? { ...s, name: geoResult.name, loadingAddress: false } : s
        );
        updateFullRouteWithStops(resolvedStops, vehicleType, travelersCount);
      }
    } catch (err) {
      console.warn('Map click reverse geocode notice:', err);
      setStops((prevStops) =>
        prevStops.map((s) =>
          s.id === tempId
            ? {
                ...s,
                name: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                loadingAddress: false,
              }
            : s
        )
      );
    }
  };

  // Copy shareable link
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/planner?start=${encodeURIComponent(
      startQuery
    )}&dest=${encodeURIComponent(destQuery)}&budget=${availableBudget}&vehicle=${vehicleType}&totalBudget=${totalBudget}&travelers=${travelersCount}&detour=${maxDetour}`;
    navigator.clipboard.writeText(shareUrl);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  // Open Navigation link
  const handleOpenNav = () => {
    if (!origin || !destination) return;
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destStr = `${destination.latitude},${destination.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destStr)}`;
    window.open(url, '_blank');
  };

  const totalPitstopStays = stops.reduce((acc, s) => acc + (Number(s.stopDurationMinutes) || 0), 0);
  const totalDetourMinutes = Math.max(0, drivingDuration - directDuration);
  const totalTripDuration = drivingDuration + totalPitstopStays;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-black min-h-screen text-zinc-100">
      
      {/* 1. Financial Trip Expense Budget Bar */}
      <FinancialBudget
        totalBudget={totalBudget}
        onUpdateTotalBudget={(val) => setTotalBudget(val)}
        distance={totalDistance}
        vehicleType={vehicleType}
        travelersCount={travelersCount}
        onUpdateTravelersCount={handleTravelersChange}
        stops={stops}
        onUpdateStopCost={handleUpdateStopCost}
        onBudgetCalculated={(b) => setCalculatedBudget(b)}
      />

      {/* 2. Time Window Budget Bar */}
      {(vehicleType === 'car' || vehicleType === 'bike') && (
        <TimeBudget
          availableTime={availableBudget}
          drivingTime={drivingDuration}
          stops={stops}
          vehicleType={vehicleType}
        />
      )}

      {/* 3. Main Split-Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Control & Itinerary Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Search & Configuration Card */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>Trip Corridor & Mode</span>
              </h3>
              <button
                type="button"
                onClick={handleSwap}
                className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center gap-1 text-xs border border-zinc-800 cursor-pointer"
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

            {/* Travel Modes Selector */}
            <div>
              <label className="text-[11px] font-bold text-zinc-400 mb-1.5 flex items-center justify-between">
                <span>Travel Mode</span>
                <span className="text-[10px] text-amber-400 font-normal">
                  {TRAVEL_MODES.find((m) => m.id === vehicleType)?.desc}
                </span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {TRAVEL_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = vehicleType === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleVehicleChange(mode.id)}
                      className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 border border-amber-400 font-black'
                          : 'bg-black text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px]">{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location Inputs Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCalculateRoute();
              }}
              className="space-y-3"
            >
              {/* Start Location Input */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Start Location
                  </label>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={locatingGPS}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                      title="Use My Current Location"
                    >
                      {locatingGPS ? (
                        <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                      ) : (
                        <Crosshair className="w-3 h-3" />
                      )}
                      <span>My Location</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapPickerTarget('start')}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Pick on Map</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    ref={startInputRef}
                    type="text"
                    required
                    value={startQuery}
                    onChange={(e) => {
                      setStartQuery(e.target.value);
                      setShowStartDropdown(true);
                    }}
                    onFocus={() => setShowStartDropdown(true)}
                    placeholder="Search Indian city, road, or address..."
                    className="w-full bg-black border border-zinc-800 rounded-xl pl-3.5 pr-9 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setMapPickerTarget('start')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-400 transition-colors p-1 cursor-pointer"
                    title="Pick Start Location on Map"
                  >
                    <Map className="w-4 h-4" />
                  </button>
                </div>

                {/* Autocomplete Dropdown for Start */}
                {showStartDropdown && startSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-zinc-950/95 border border-zinc-700 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden max-h-56 overflow-y-auto">
                    {startSuggestions.map((item, idx) => (
                      <button
                        key={`start-sug-${idx}`}
                        type="button"
                        onClick={() => handleSelectSuggestion(item, 'start')}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-zinc-900 transition-colors flex items-center gap-2.5 border-b border-zinc-800/60 last:border-0 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-zinc-100 block truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 truncate block">
                            {item.fullName}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Destination Input */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    Destination
                  </label>
                  <button
                    type="button"
                    onClick={() => setMapPickerTarget('dest')}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Pick on Map</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    ref={destInputRef}
                    type="text"
                    required
                    value={destQuery}
                    onChange={(e) => {
                      setDestQuery(e.target.value);
                      setShowDestDropdown(true);
                    }}
                    onFocus={() => setShowDestDropdown(true)}
                    placeholder="Search destination city or landmark..."
                    className="w-full bg-black border border-zinc-800 rounded-xl pl-3.5 pr-9 py-2 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setMapPickerTarget('dest')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                    title="Pick Destination on Map"
                  >
                    <Map className="w-4 h-4" />
                  </button>
                </div>

                {/* Autocomplete Dropdown for Destination */}
                {showDestDropdown && destSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-zinc-950/95 border border-zinc-700 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden max-h-56 overflow-y-auto">
                    {destSuggestions.map((item, idx) => (
                      <button
                        key={`dest-sug-${idx}`}
                        type="button"
                        onClick={() => handleSelectSuggestion(item, 'dest')}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-zinc-900 transition-colors flex items-center gap-2.5 border-b border-zinc-800/60 last:border-0 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-zinc-100 block truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 truncate block">
                            {item.fullName}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Number of Travelers & Detour Controls */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3 text-amber-400" />
                    Travelers ({travelersCount})
                  </label>
                  <select
                    value={travelersCount}
                    onChange={(e) => handleTravelersChange(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Person (Solo)' : 'People'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-emerald-400" />
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
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value={10}>+10 min max detour</option>
                    <option value={15}>+15 min max detour</option>
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
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Calculating TomTom Route...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Calculate Route & Pitstops</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Add Custom Pit Stop Section */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Pit Stop</span>
              </span>
              <button
                type="button"
                onClick={() => setMapPickerTarget('stop')}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer hover:underline"
              >
                <MapPin className="w-3 h-3" />
                <span>Pick on Map</span>
              </button>
            </div>

            {/* Quick Pitstop Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search pit stop to add (e.g. Dhaba, Cafe, Viewpoint)..."
                value={pitstopSearchQuery}
                onChange={(e) => {
                  setPitstopSearchQuery(e.target.value);
                  setShowPitstopDropdown(true);
                }}
                onFocus={() => setShowPitstopDropdown(true)}
                className="w-full bg-black border border-zinc-800 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              {searchingPitstop && (
                <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
              )}

              {/* Suggestions Dropdown */}
              {showPitstopDropdown && pitstopSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-zinc-950 border border-zinc-700 rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                  {pitstopSuggestions.map((item, idx) => (
                    <button
                      key={`pitstop-search-${idx}`}
                      type="button"
                      onClick={() => handleSelectPitstopSuggestion(item)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-zinc-900 transition-colors flex items-center gap-2 border-b border-zinc-800/60 last:border-none text-xs"
                    >
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-white block truncate">{item.name}</span>
                        <span className="text-[10px] text-zinc-400 block truncate">{item.fullName}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category Filter Pills (for road trips) */}
          {(vehicleType === 'car' || vehicleType === 'bike') && (
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-3xl p-4 shadow-xl">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
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
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/25'
                          : 'bg-black text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Navigation: Discovered Pitstops vs Active Itinerary */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-4">
            <div className="flex items-center gap-2 p-1 bg-black rounded-2xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab('pitstops')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'pitstops'
                    ? 'bg-emerald-500 text-black font-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Nearby Pitstops ({pitstops.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('itinerary')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'itinerary'
                    ? 'bg-amber-500 text-black font-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
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
                  <div className="text-center py-10 px-4 bg-black rounded-2xl border border-dashed border-zinc-800 text-zinc-400 text-xs">
                    {vehicleType === 'flight' || vehicleType === 'train'
                      ? 'Direct transit corridor selected. Pitstops are optimized for driving routes.'
                      : `No pitstops found within ${maxDetour} mins detour. Try expanding your detour threshold or category filters!`}
                  </div>
                ) : (
                  pitstops.map((pitstop, idx) => (
                    <PitstopCard
                      key={`pitstop-candidate-${pitstop._id || pitstop.name || 'stop'}-${idx}`}
                      pitstop={pitstop}
                      isAdded={stops.some((s) => s.name === pitstop.name)}
                      onToggleAdd={handleToggleAddStop}
                      onOpenDetails={(p) => setSelectedPlaceModal(p)}
                    />
                  ))
                )}
              </div>
            ) : (
              <div>
                {stops.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-black rounded-2xl border border-dashed border-zinc-800 text-zinc-400 text-xs">
                    No pitstops added to itinerary yet. Switch to "Nearby Pitstops" or click "+ Add Pit Stop"!
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={stops.map((s, idx) => s._id || s.id || s.name || `stop-${idx}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                        {stops.map((stop, idx) => (
                          <StopItem
                            key={stop._id || stop.id || stop.name || `stop-${idx}`}
                            stop={stop}
                            index={idx}
                            totalStops={stops.length}
                            onMoveUp={(i) => handleMoveStop(i, i - 1)}
                            onMoveDown={(i) => handleMoveStop(i, i + 1)}
                            onRemove={handleRemoveStop}
                            onUpdateDuration={handleUpdateStopDuration}
                            onUpdateCost={handleUpdateStopCost}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Map & Action Toolbar (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Action Toolbar */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-3">
            {/* Origin -> Dest Corridor & Vehicle Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-800 text-xs">
              <div className="flex items-center gap-2 text-zinc-200 font-medium truncate">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                  {origin?.name?.split(',')[0] || startQuery || 'Select Start'}
                </span>
                <span className="text-zinc-600">➔</span>
                <span className="flex items-center gap-1.5 text-rose-400 font-bold truncate">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0"></span>
                  {destination?.name?.split(',')[0] || destQuery || 'Select Dest'}
                </span>
              </div>

              {/* Mode & Travelers Badge */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold border bg-zinc-900 text-amber-300 border-zinc-700 flex items-center gap-1.5">
                  <span>{TRAVEL_MODES.find((m) => m.id === vehicleType)?.label}</span>
                  <span className="text-zinc-500">•</span>
                  <span>{travelersCount} traveler{travelersCount > 1 ? 's' : ''}</span>
                </span>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="bg-black p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-400 text-[10px] block">Distance</span>
                <strong className="text-zinc-100 font-bold text-sm">{totalDistance} km</strong>
              </div>

              <div className="bg-black p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-400 text-[10px] block">
                  {vehicleType === 'flight' ? 'Flight Time' : vehicleType === 'train' ? 'Train Time' : 'Travel Time'}
                </span>
                <strong className="text-zinc-100 font-bold text-sm">{formatDuration(drivingDuration)}</strong>
              </div>

              <div className="bg-black p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-400 text-[10px] block">Detour Time</span>
                <strong className="text-amber-400 font-bold text-sm">+{formatDuration(totalDetourMinutes)}</strong>
              </div>

              <div className="bg-black p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-400 text-[10px] block">Total Duration</span>
                <strong className="text-emerald-400 font-bold text-sm">{formatDuration(totalTripDuration)}</strong>
              </div>

              <div className="bg-black p-2.5 rounded-xl border border-zinc-800 col-span-2 sm:col-span-1">
                <span className="text-zinc-400 text-[10px] block">Est. Expense</span>
                <strong className={`font-bold text-sm ${
                  (calculatedBudget?.estimatedTotal || 0) > totalBudget ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {formatCurrency(calculatedBudget?.estimatedTotal || 0)}
                </strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800">
              <span className="text-xs text-zinc-400">
                {stops.length} pitstop{stops.length === 1 ? '' : 's'} in itinerary
              </span>

              <div className="flex items-center gap-2">
                {/* Share Route Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors text-xs flex items-center gap-1.5 border border-zinc-800 cursor-pointer"
                  title="Share route link"
                >
                  {shareSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">{shareSuccess ? 'Copied!' : 'Share'}</span>
                </button>

                {/* Open Navigation */}
                <button
                  type="button"
                  onClick={handleOpenNav}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors text-xs flex items-center gap-1.5 border border-zinc-800 cursor-pointer"
                  title="Open Navigation Route"
                >
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Navigate</span>
                </button>

                {/* Save Trip Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!origin && !destination && stops.length === 0) {
                      setErrorMessage('Please calculate a route or click the map to add stops before saving your trip.');
                      return;
                    }
                    if (!isAuthenticated) {
                      sessionStorage.setItem(
                        'routecraft_pending_trip',
                        JSON.stringify({
                          startQuery,
                          destQuery,
                          origin,
                          destination,
                          stops,
                          vehicleType,
                          travelersCount,
                          totalBudget,
                          availableBudget,
                        })
                      );
                      navigate('/login', { state: { from: '/planner' } });
                    } else {
                      setIsSaveModalOpen(true);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-md shadow-emerald-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Save Trip</span>
                </button>
              </div>
            </div>
          </div>

          {/* TomTom Map Card */}
          <div className="h-[580px] w-full rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
            <MapComponent
              origin={origin}
              destination={destination}
              vehicleType={vehicleType}
              stops={stops}
              pitstops={pitstops}
              routeCoordinates={routeCoordinates}
              onSelectPitstop={handleToggleAddStop}
              onOpenPlaceModal={(p) => setSelectedPlaceModal(p)}
              onMapClick={handleMapClick}
              onRemoveStop={handleRemoveStop}
              onSetAsOrigin={(loc) => {
                setStartQuery(loc.name);
                setOrigin(loc);
                if (destination) handleCalculateRoute(loc.name, destination.name, vehicleType, travelersCount);
              }}
              onSetAsDestination={(loc) => {
                setDestQuery(loc.name);
                setDestination(loc);
                if (origin) handleCalculateRoute(origin.name, loc.name, vehicleType, travelersCount);
              }}
              onAddAsStop={(loc) => {
                const newStop = {
                  id: `stop-${Date.now()}`,
                  name: loc.name,
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                  stopDurationMinutes: 30,
                  category: loc.category || 'Pitstop',
                  street: loc.address?.split(',')[0] || '',
                  city: loc.city || '',
                  state: loc.state || '',
                  pin: loc.pin || '',
                };
                const updated = [...stops, newStop];
                setStops(updated);
                setActiveTab('itinerary');
                updateFullRouteWithStops(updated, vehicleType, travelersCount);
              }}
            />
          </div>
        </div>

      </div>

      {/* Interactive Map Location Picker Modal */}
      {mapPickerTarget && (
        <MapLocationPickerModal
          isOpen={!!mapPickerTarget}
          targetType={mapPickerTarget}
          stopNumber={stops.length + 1}
          initialLocation={
            mapPickerTarget === 'start'
              ? origin
              : mapPickerTarget === 'dest'
              ? destination
              : null
          }
          onClose={() => setMapPickerTarget(null)}
          onConfirmLocation={handleConfirmLocationFromMap}
        />
      )}

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
            startLocation: origin || (stops.length > 0 ? { name: stops[0].name, latitude: Number(stops[0].latitude), longitude: Number(stops[0].longitude) } : null),
            endLocation: destination || (stops.length > 0 ? { name: stops[stops.length - 1].name, latitude: Number(stops[stops.length - 1].latitude), longitude: Number(stops[stops.length - 1].longitude) } : null),
            stops: stops,
            totalDurationMinutes: drivingDuration,
            availableTimeBudgetMinutes: availableBudget,
            totalDistanceKm: totalDistance,
            totalTripTime: totalTripDuration,
            vehicleType: vehicleType,
            travelersCount: travelersCount,
            totalBudget: totalBudget,
            fuelCost: calculatedBudget?.fuelCost || 0,
            foodCost: calculatedBudget?.foodCost || 0,
            parkingTollCost: calculatedBudget?.parkingTollCost || 0,
            activityCost: calculatedBudget?.activityCost || 0,
            otherCost: calculatedBudget?.otherCost || 0,
            estimatedTotal: calculatedBudget?.estimatedTotal || 0,
            remainingBudget: calculatedBudget?.remainingBudget ?? (totalBudget - (calculatedBudget?.estimatedTotal || 0)),
            routeCoordinates: routeCoordinates,
          }}
          onSavedSuccess={(savedTrip) => {
            sessionStorage.removeItem('routecraft_pending_trip');
            navigate('/trips');
          }}
        />
      )}
    </div>
  );
};

export default Planner;

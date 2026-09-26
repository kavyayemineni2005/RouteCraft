import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Sliders, 
  IndianRupee, 
  Car, 
  Bike, 
  Sparkles, 
  ArrowRight, 
  Coffee, 
  Utensils, 
  Trees, 
  Eye, 
  Landmark, 
  Fuel, 
  ShoppingBag,
  Crosshair,
  AlertCircle,
  Users,
  Compass,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { searchSuggestionsApi } from '../services/api';
import MapLocationPickerModal from '../components/MapLocationPickerModal';
import { formatDuration } from '../components/TimeBudget';
import { formatCurrency } from '../components/FinancialBudget';

const CATEGORIES = [
  { id: 'Coffee', label: 'Coffee & Cafes', icon: Coffee, desc: 'Artisan roasters & highway brew' },
  { id: 'Food', label: 'Food & Dining', icon: Utensils, desc: 'Highway dhabas & local delicacies' },
  { id: 'Nature', label: 'Nature & Parks', icon: Trees, desc: 'Waterfalls, forests & reserves' },
  { id: 'Viewpoints', label: 'Scenic Viewpoints', icon: Eye, desc: 'Mountain peaks & sunset overlooks' },
  { id: 'Attractions', label: 'Heritage & Sights', icon: Landmark, desc: 'Historic forts, temples & palaces' },
  { id: 'Shopping', label: 'Local Crafts', icon: ShoppingBag, desc: 'Artisan hubs & regional markets' },
  { id: 'Fuel/rest stops', label: 'Fuel & Rest', icon: Fuel, desc: 'Reliable pumps & clean washrooms' },
];

const VEHICLES = [
  { 
    id: 'car', 
    label: 'Car Road-Trip', 
    icon: Car, 
    desc: 'Expressway cruising, toll corridors & group comfort',
    mileage: '15 km/L',
    tollEstimate: '₹1.5 / km'
  },
  { 
    id: 'bike', 
    label: 'Motorcycle Tour', 
    icon: Bike, 
    desc: 'Scenic backroads, high agility & ₹0 toll tariffs',
    mileage: '45 km/L',
    tollEstimate: '₹0 tolls'
  },
];

const CreateTrip = () => {
  const navigate = useNavigate();

  // Form State
  const [startQuery, setStartQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [startPoint, setStartPoint] = useState(null);
  const [destPoint, setDestPoint] = useState(null);
  const [vehicleType, setVehicleType] = useState('car');
  const [travelersCount, setTravelersCount] = useState(2);
  const [durationHours, setDurationHours] = useState(6);
  const [maxDetour, setMaxDetour] = useState(20);
  const [preferredCategories, setPreferredCategories] = useState(['Food', 'Coffee', 'Viewpoints']);
  const [totalBudget, setTotalBudget] = useState(4000);

  // Suggestions & Map Picker
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [mapPickerTarget, setMapPickerTarget] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const startRef = useRef(null);
  const destRef = useRef(null);

  // Autocomplete for Start
  useEffect(() => {
    if (!startQuery || startQuery.trim().length < 2 || !showStartDropdown) {
      setStartSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await searchSuggestionsApi(startQuery);
        setStartSuggestions(res.data || []);
      } catch (err) {
        setStartSuggestions([]);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [startQuery, showStartDropdown]);

  // Autocomplete for Dest
  useEffect(() => {
    if (!destQuery || destQuery.trim().length < 2 || !showDestDropdown) {
      setDestSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await searchSuggestionsApi(destQuery);
        setDestSuggestions(res.data || []);
      } catch (err) {
        setDestSuggestions([]);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [destQuery, showDestDropdown]);

  const handleSelectSuggestion = (place, target) => {
    if (target === 'start') {
      setStartQuery(place.name);
      setStartPoint(place);
      setShowStartDropdown(false);
    } else {
      setDestQuery(place.name);
      setDestPoint(place);
      setShowDestDropdown(false);
    }
  };

  const handleConfirmLocationFromMap = (locationData) => {
    if (mapPickerTarget === 'start') {
      setStartQuery(locationData.name);
      setStartPoint(locationData);
    } else if (mapPickerTarget === 'dest') {
      setDestQuery(locationData.name);
      setDestPoint(locationData);
    }
    setMapPickerTarget(null);
  };

  const toggleCategory = (catId) => {
    if (preferredCategories.includes(catId)) {
      setPreferredCategories(preferredCategories.filter((c) => c !== catId));
    } else {
      setPreferredCategories([...preferredCategories, catId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startQuery.trim() || !destQuery.trim()) {
      setErrorMsg('Please specify both Start location and Destination to build your route.');
      return;
    }

    const queryParams = new URLSearchParams({
      start: startQuery.trim(),
      dest: destQuery.trim(),
      vehicle: vehicleType,
      budget: (durationHours * 60).toString(),
      totalBudget: totalBudget.toString(),
      travelers: travelersCount.toString(),
      detour: maxDetour.toString(),
      categories: preferredCategories.join(','),
    });

    navigate(`/planner?${queryParams.toString()}`);
  };

  // Rough dynamic estimates for the live preview card
  const estimatedFuelCost = vehicleType === 'bike' 
    ? Math.round(totalBudget * 0.22) 
    : Math.round(totalBudget * 0.35);
  const estimatedFoodCost = Math.round(preferredCategories.includes('Food') ? totalBudget * 0.32 : totalBudget * 0.2);
  const estimatedActivities = Math.round(totalBudget * 0.18);
  const estimatedRemaining = Math.max(0, totalBudget - (estimatedFuelCost + estimatedFoodCost + estimatedActivities));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 bg-black min-h-screen">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-lg">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Road-Trip Route Generator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Create Your Next <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">Adventure</span>
        </h1>
        <p className="text-sm sm:text-base text-zinc-400">
          Configure your route parameters, select your vehicle, time budget, and pitstop tastes.
        </p>
      </div>

      {errorMsg && (
        <div className="max-w-4xl mx-auto p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
        
        {/* Left Form (7 Cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-zinc-950 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Section 1: Waypoints */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2.5">
              <Navigation className="w-4 h-4 text-emerald-400" />
              1. Route Corridor
            </h3>

            {/* Start Location */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Start Location
                </label>
                <button
                  type="button"
                  onClick={() => setMapPickerTarget('start')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Pick on Map</span>
                </button>
              </div>

              <div className="relative">
                <input
                  ref={startRef}
                  type="text"
                  required
                  value={startQuery}
                  onChange={(e) => {
                    setStartQuery(e.target.value);
                    setShowStartDropdown(true);
                  }}
                  onFocus={() => setShowStartDropdown(true)}
                  placeholder="e.g. Hyderabad, Telangana"
                  className="w-full bg-black border border-zinc-800 rounded-2xl pl-3.5 pr-10 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setMapPickerTarget('start')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                </button>
              </div>

              {/* Start Suggestions */}
              {showStartDropdown && startSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-zinc-950/95 border border-zinc-700 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden max-h-52 overflow-y-auto">
                  {startSuggestions.map((item, idx) => (
                    <button
                      key={`start-sug-${idx}`}
                      type="button"
                      onClick={() => handleSelectSuggestion(item, 'start')}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-900 transition-colors flex items-center gap-3 border-b border-zinc-800/60 last:border-0"
                    >
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-zinc-100 block truncate">
                          {item.shortName || item.name.split(',')[0]}
                        </span>
                        <span className="text-[10px] text-zinc-400 truncate block">
                          {item.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Destination */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  Destination
                </label>
                <button
                  type="button"
                  onClick={() => setMapPickerTarget('dest')}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Pick on Map</span>
                </button>
              </div>

              <div className="relative">
                <input
                  ref={destRef}
                  type="text"
                  required
                  value={destQuery}
                  onChange={(e) => {
                    setDestQuery(e.target.value);
                    setShowDestDropdown(true);
                  }}
                  onFocus={() => setShowDestDropdown(true)}
                  placeholder="e.g. Hampi, Karnataka"
                  className="w-full bg-black border border-zinc-800 rounded-2xl pl-3.5 pr-10 py-3 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setMapPickerTarget('dest')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-rose-400 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                </button>
              </div>

              {/* Dest Suggestions */}
              {showDestDropdown && destSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-zinc-950/95 border border-zinc-700 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden max-h-52 overflow-y-auto">
                  {destSuggestions.map((item, idx) => (
                    <button
                      key={`dest-sug-${idx}`}
                      type="button"
                      onClick={() => handleSelectSuggestion(item, 'dest')}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-900 transition-colors flex items-center gap-3 border-b border-zinc-800/60 last:border-0"
                    >
                      <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-zinc-100 block truncate">
                          {item.shortName || item.name.split(',')[0]}
                        </span>
                        <span className="text-[10px] text-zinc-400 truncate block">
                          {item.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Vehicle & Travelers */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2.5">
              <Car className="w-4 h-4 text-amber-400" />
              2. Vehicle & Group
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {VEHICLES.map((v) => {
                const Icon = v.icon;
                const isSelected = vehicleType === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVehicleType(v.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400/80 shadow-lg shadow-amber-500/10'
                        : 'bg-black border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-amber-500 text-black font-black' : 'bg-zinc-900 text-zinc-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-amber-500/20 text-amber-300' : 'bg-zinc-900 text-zinc-500'}`}>
                        {v.mileage}
                      </span>
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>{v.label}</h4>
                      <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">{v.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  Number of Travelers
                </span>
                <span className="text-xs font-bold text-amber-400">{travelersCount} Person{travelersCount > 1 ? 's' : ''}</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTravelersCount(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      travelersCount === num
                        ? 'bg-emerald-500 text-black font-black shadow-md'
                        : 'bg-black text-zinc-400 border border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Time & Detour Budget */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              3. Time & Detour Limits
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-300">Available Trip Duration</label>
                <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  {formatDuration(durationHours * 60)}
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="16"
                step="0.5"
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>2 Hours</span>
                <span>6 Hours</span>
                <span>10 Hours</span>
                <span>16 Hours</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Max Detour Tolerance
                </span>
                <span className="text-xs font-bold text-amber-400">+{maxDetour} mins max</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[10, 15, 20, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setMaxDetour(mins)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      maxDetour === mins
                        ? 'bg-amber-500 text-black font-black shadow-md'
                        : 'bg-black text-zinc-400 border border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    +{mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Preferred Categories */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              4. Preferred Pitstop Categories
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = preferredCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/60 text-white font-bold shadow-sm'
                        : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Total Trip Budget */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2.5">
              <IndianRupee className="w-4 h-4 text-amber-400" />
              5. Total Financial Budget
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-300">Total Available Budget</label>
                <span className="text-xs font-bold text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                  {formatCurrency(totalBudget)}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="30000"
                step="500"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>₹1,000</span>
                <span>₹10,000</span>
                <span>₹20,000</span>
                <span>₹30,000</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>Build My Route</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </form>

        {/* Right Summary Card (5 Cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">Live Trip Summary</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-amber-300">
                {vehicleType === 'bike' ? '🏍️ Bike Tour' : '🚗 Car Road-Trip'}
              </span>
            </div>

            {/* Route Overview */}
            <div className="bg-black p-4 rounded-2xl border border-zinc-800/80 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="text-zinc-400">From:</span>
                <strong className="text-white truncate">{startQuery || 'Select start origin...'}</strong>
              </div>
              <div className="w-0.5 h-3 bg-zinc-800 ml-1"></div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0"></span>
                <span className="text-zinc-400">To:</span>
                <strong className="text-white truncate">{destQuery || 'Select destination...'}</strong>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-black p-3 rounded-2xl border border-zinc-800">
                <span className="text-zinc-400 text-[10px] block">Time Budget</span>
                <strong className="text-emerald-400 font-bold text-sm">{formatDuration(durationHours * 60)}</strong>
              </div>

              <div className="bg-black p-3 rounded-2xl border border-zinc-800">
                <span className="text-zinc-400 text-[10px] block">Detour Cap</span>
                <strong className="text-amber-400 font-bold text-sm">+{maxDetour} min</strong>
              </div>

              <div className="bg-black p-3 rounded-2xl border border-zinc-800">
                <span className="text-zinc-400 text-[10px] block">Travelers</span>
                <strong className="text-zinc-100 font-bold text-sm">{travelersCount} Person{travelersCount > 1 ? 's' : ''}</strong>
              </div>

              <div className="bg-black p-3 rounded-2xl border border-zinc-800">
                <span className="text-zinc-400 text-[10px] block">Total Budget</span>
                <strong className="text-amber-400 font-bold text-sm">{formatCurrency(totalBudget)}</strong>
              </div>
            </div>

            {/* Expense Preview */}
            <div className="bg-black p-4 rounded-2xl border border-zinc-800 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Estimated Allocation
              </span>
              <div className="flex justify-between text-zinc-300">
                <span>Estimated Fuel / Tolls</span>
                <strong>{formatCurrency(estimatedFuelCost)}</strong>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Food & Refreshments</span>
                <strong>{formatCurrency(estimatedFoodCost)}</strong>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Activities & Sightseeing</span>
                <strong>{formatCurrency(estimatedActivities)}</strong>
              </div>
              <div className="flex justify-between text-emerald-400 pt-2 border-t border-zinc-800 font-bold">
                <span>Remaining Buffer</span>
                <strong>{formatCurrency(estimatedRemaining)}</strong>
              </div>
            </div>

            {/* Selected Categories List */}
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Selected Stops ({preferredCategories.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {preferredCategories.length === 0 ? (
                  <span className="text-xs text-zinc-500">All categories enabled</span>
                ) : (
                  preferredCategories.map((c) => (
                    <span key={c} className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
                      {c}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Quality Seal */}
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>RouteCraft recalculates driving durations dynamically upon adding waypoints.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Location Picker Modal */}
      {mapPickerTarget && (
        <MapLocationPickerModal
          isOpen={!!mapPickerTarget}
          targetType={mapPickerTarget}
          initialLocation={mapPickerTarget === 'start' ? startPoint : destPoint}
          onClose={() => setMapPickerTarget(null)}
          onConfirmLocation={handleConfirmLocationFromMap}
        />
      )}
    </div>
  );
};

export default CreateTrip;

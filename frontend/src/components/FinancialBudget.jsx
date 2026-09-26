import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  Fuel, 
  UtensilsCrossed, 
  Ticket, 
  Landmark, 
  ShieldAlert, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Car,
  Bike,
  Bus,
  Train,
  Plane,
  Users,
  RotateCcw,
  Gauge,
  Flame
} from 'lucide-react';

/**
 * Format currency in Indian Rupees format (e.g. ₹3,000)
 */
export const formatCurrency = (amount) => {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  const rounded = Math.round(amount);
  return '₹' + rounded.toLocaleString('en-IN');
};

/**
 * Estimate individual stop cost by category
 */
export const getEstimatedStopCost = (stop) => {
  if (stop.estimatedCost !== undefined && stop.estimatedCost !== null && !isNaN(stop.estimatedCost) && stop.estimatedCost > 0) {
    return Number(stop.estimatedCost);
  }
  switch (stop.category) {
    case 'Food':
      return 350;
    case 'Coffee':
      return 200;
    case 'Attractions':
      return 150;
    case 'Nature':
      return 80;
    case 'Viewpoints':
      return 50;
    case 'Shopping':
      return 300;
    case 'Fuel/rest stops':
      return 50;
    default:
      return 100;
  }
};

/**
 * Calculate standard baseline expenses dynamically from distance, travel mode, travelers, stops, mileage, and fuel price
 */
export const calculateTripExpenses = (
  distanceKm,
  vehicleType = 'car',
  stops = [],
  travelersCount = 1,
  customMileage = null,
  customFuelPrice = null
) => {
  const dist = Number(distanceKm) || 0;
  const travelers = Math.max(1, Number(travelersCount) || 1);

  // Default vehicle parameters
  const mileage =
    customMileage !== null && Number(customMileage) > 0
      ? Number(customMileage)
      : vehicleType === 'bike'
      ? 45
      : 15;

  const fuelPrice =
    customFuelPrice !== null && Number(customFuelPrice) > 0
      ? Number(customFuelPrice)
      : 105;

  let travelCost = 0;
  let tollCost = 0;
  let parkingCost = 0;

  if (vehicleType === 'car') {
    // Dynamic Fuel Calculation = (Distance / Mileage) * FuelPrice
    travelCost = Math.round((dist / Math.max(1, mileage)) * fuelPrice);
    tollCost = Math.round(dist * 1.5);
    parkingCost = Math.max(50, stops.length * 50);
  } else if (vehicleType === 'bike') {
    // 2-wheeler mileage calculation + ₹0 tolls
    travelCost = Math.round((dist / Math.max(1, mileage)) * fuelPrice);
    tollCost = 0;
    parkingCost = Math.max(20, stops.length * 20);
  } else if (vehicleType === 'bus') {
    // Express bus tariff ~₹1.65/km per passenger
    travelCost = Math.max(100, Math.round(dist * 1.65)) * travelers;
    tollCost = 0;
    parkingCost = 0;
  } else if (vehicleType === 'train') {
    // Express / 3AC / Sleeper blend ~₹1.15/km per passenger
    travelCost = Math.max(120, Math.round(dist * 1.15)) * travelers;
    tollCost = 0;
    parkingCost = 0;
  } else if (vehicleType === 'flight') {
    // Flight fare indicator
    travelCost = dist > 200 ? Math.max(2500, Math.round(dist * 4.5)) * travelers : 0;
    tollCost = 0;
    parkingCost = 100 * travelers;
  }

  // Food calculation: base meal allowance per traveler + stops
  let foodCost = Math.round(350 * travelers);
  let activityCost = 0;

  stops.forEach((stop) => {
    const cost = getEstimatedStopCost(stop);
    if (stop.category === 'Food' || stop.category === 'Coffee') {
      foodCost += cost * travelers;
    } else if (stop.category === 'Attractions' || stop.category === 'Nature' || stop.category === 'Viewpoints') {
      activityCost += cost * travelers;
    } else {
      activityCost += cost;
    }
  });

  const subtotal = travelCost + tollCost + foodCost + parkingCost + activityCost;
  const otherCost = Math.round(Math.max(150, subtotal * 0.05));
  const estimatedTotal = travelCost + tollCost + foodCost + parkingCost + activityCost + otherCost;

  return {
    fuelCost: travelCost,
    tollCost,
    foodCost,
    parkingCost,
    parkingTollCost: tollCost + parkingCost,
    activityCost,
    otherCost,
    estimatedTotal,
    mileage,
    fuelPrice,
  };
};

const FinancialBudget = ({
  totalBudget = 5000,
  onUpdateTotalBudget,
  distance = 0,
  vehicleType = 'car',
  travelersCount = 1,
  onUpdateTravelersCount,
  stops = [],
  onUpdateStopCost,
  onBudgetCalculated,
}) => {
  const [showStopBreakdown, setShowStopBreakdown] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(totalBudget);

  // Mileage & Fuel Price states for Car/Bike
  const [mileageInput, setMileageInput] = useState(vehicleType === 'bike' ? 45 : 15);
  const [fuelPriceInput, setFuelPriceInput] = useState(105);

  // Manual expense overrides for individual categories
  const [customFuel, setCustomFuel] = useState(null);
  const [customToll, setCustomToll] = useState(null);
  const [customFood, setCustomFood] = useState(null);
  const [customParking, setCustomParking] = useState(null);
  const [customActivities, setCustomActivities] = useState(null);
  const [customOther, setCustomOther] = useState(null);

  useEffect(() => {
    setBudgetInput(totalBudget);
  }, [totalBudget]);

  useEffect(() => {
    setMileageInput(vehicleType === 'bike' ? 45 : 15);
  }, [vehicleType]);

  // Baseline calculated expenses using dynamic mileage and fuel price
  const baseExpenses = calculateTripExpenses(
    distance,
    vehicleType,
    stops,
    travelersCount,
    mileageInput,
    fuelPriceInput
  );

  // Active resolved expenses (uses custom override if user edited it, otherwise dynamic baseline)
  const activeFuel = customFuel !== null ? customFuel : baseExpenses.fuelCost;
  const activeToll = customToll !== null ? customToll : baseExpenses.tollCost;
  const activeFood = customFood !== null ? customFood : baseExpenses.foodCost;
  const activeParking = customParking !== null ? customParking : baseExpenses.parkingCost;
  const activeActivities = customActivities !== null ? customActivities : baseExpenses.activityCost;
  const activeOther = customOther !== null ? customOther : baseExpenses.otherCost;

  const totalExpenses = activeFuel + activeToll + activeFood + activeParking + activeActivities + activeOther;
  const remainingBudget = totalBudget - totalExpenses;
  const isOverBudget = remainingBudget < 0;
  const overByAmount = Math.abs(remainingBudget);

  // Notify parent on budget changes
  useEffect(() => {
    if (onBudgetCalculated) {
      onBudgetCalculated({
        totalBudget,
        fuelCost: activeFuel,
        tollCost: activeToll,
        foodCost: activeFood,
        parkingCost: activeParking,
        parkingTollCost: activeToll + activeParking,
        activityCost: activeActivities,
        otherCost: activeOther,
        estimatedTotal: totalExpenses,
        remainingBudget,
        mileage: mileageInput,
        fuelPrice: fuelPriceInput,
      });
    }
  }, [
    totalBudget,
    distance,
    vehicleType,
    travelersCount,
    stops,
    activeFuel,
    activeToll,
    activeFood,
    activeParking,
    activeActivities,
    activeOther,
    mileageInput,
    fuelPriceInput,
  ]);

  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    const val = Number(budgetInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateTotalBudget(val);
      setIsEditingBudget(false);
    }
  };

  const handleResetToAuto = () => {
    setCustomFuel(null);
    setCustomToll(null);
    setCustomFood(null);
    setCustomParking(null);
    setCustomActivities(null);
    setCustomOther(null);
  };

  const hasCustomOverrides =
    customFuel !== null ||
    customToll !== null ||
    customFood !== null ||
    customParking !== null ||
    customActivities !== null ||
    customOther !== null;

  // Percentage calculations for the Visual Budget Bar
  const fuelPercent = totalBudget > 0 ? Math.min(100, (activeFuel / totalBudget) * 100) : 0;
  const foodPercent = totalBudget > 0 ? Math.min(100 - fuelPercent, (activeFood / totalBudget) * 100) : 0;
  const tollPercent = totalBudget > 0 ? Math.min(100 - fuelPercent - foodPercent, ((activeToll + activeParking) / totalBudget) * 100) : 0;
  const activityPercent = totalBudget > 0 ? Math.min(100 - fuelPercent - foodPercent - tollPercent, (activeActivities / totalBudget) * 100) : 0;
  const otherPercent = totalBudget > 0 ? Math.min(100 - fuelPercent - foodPercent - tollPercent - activityPercent, (activeOther / totalBudget) * 100) : 0;

  const usedPercent = totalBudget > 0 ? Math.min(100, (totalExpenses / totalBudget) * 100) : 100;
  const remainingPercent = Math.max(0, 100 - usedPercent);

  const getTravelModeLabel = () => {
    switch (vehicleType) {
      case 'bike':
        return '🏍️ Bike Fuel';
      case 'bus':
        return '🚌 Bus Ticket';
      case 'train':
        return '🚆 Train Fare';
      case 'flight':
        return '✈️ Airfare';
      case 'car':
      default:
        return '🚗 Car Fuel';
    }
  };

  return (
    <div className="bg-zinc-950/90 border border-zinc-800 rounded-3xl p-5 shadow-xl backdrop-blur-sm space-y-4">
      {/* Header & Total Budget Config */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                DYNAMIC TRIP BUDGET
              </h3>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isOverBudget
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {isOverBudget ? '⚠️ Budget Exceeded' : '✓ Within Budget'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Trip expenses for {distance} km • {travelersCount} traveler{travelersCount > 1 ? 's' : ''} • {vehicleType.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Total Budget Edit Form / Display */}
        <div className="flex items-center gap-3">
          {isEditingBudget ? (
            <form onSubmit={handleBudgetSubmit} className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="w-28 pl-6 pr-2 py-1.5 bg-black border border-emerald-500 text-white text-xs font-bold rounded-xl focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl transition-colors"
              >
                Set
              </button>
              <button
                type="button"
                onClick={() => setIsEditingBudget(false)}
                className="px-2 py-1.5 text-zinc-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-3 bg-black px-3.5 py-1.5 rounded-2xl border border-zinc-800">
              <div>
                <span className="text-[10px] text-zinc-400 block font-semibold">User Budget</span>
                <strong className="text-sm font-extrabold text-white">{formatCurrency(totalBudget)}</strong>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingBudget(true)}
                className="p-1 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 transition-colors text-xs flex items-center gap-1 font-medium"
                title="Edit Total Budget"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="text-[10px]">Edit</span>
              </button>
            </div>
          )}

          {/* Quick Preset Buttons */}
          <div className="hidden lg:flex items-center gap-1 bg-black p-1 rounded-xl border border-zinc-800">
            {[2000, 5000, 10000, 15000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onUpdateTotalBudget(preset)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  totalBudget === preset
                    ? 'bg-amber-500 text-black font-black shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                ₹{preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Mileage & Fuel Price Inputs for Car/Bike */}
      {(vehicleType === 'car' || vehicleType === 'bike') && (
        <div className="p-3 bg-black border border-zinc-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <span className="text-white font-bold block">Vehicle Fuel Settings</span>
              <span className="text-[10px] text-zinc-400">
                Formula: ({distance} km ÷ {mileageInput} km/L) × ₹{fuelPriceInput}/L = <strong className="text-amber-300 font-bold">{formatCurrency(baseExpenses.fuelCost)}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mileage Input */}
            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-zinc-800">
              <span className="text-[11px] text-zinc-400">Mileage:</span>
              <input
                type="number"
                min="5"
                max="100"
                value={mileageInput}
                onChange={(e) => setMileageInput(Math.max(1, Number(e.target.value) || 1))}
                className="w-12 bg-transparent text-white font-bold text-xs text-right focus:outline-none"
              />
              <span className="text-[10px] text-zinc-400">km/L</span>
            </div>

            {/* Fuel Price Input */}
            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-zinc-800">
              <span className="text-[11px] text-zinc-400">Fuel Price:</span>
              <span className="text-xs text-zinc-400 font-bold">₹</span>
              <input
                type="number"
                min="50"
                max="300"
                value={fuelPriceInput}
                onChange={(e) => setFuelPriceInput(Math.max(1, Number(e.target.value) || 1))}
                className="w-12 bg-transparent text-white font-bold text-xs text-right focus:outline-none"
              />
              <span className="text-[10px] text-zinc-400">/L</span>
            </div>
          </div>
        </div>
      )}

      {/* Visual Multi-Segment Budget Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-semibold flex items-center gap-1">
            <span>Estimated Total Expense:</span>
            <strong className="text-zinc-100">{formatCurrency(totalExpenses)}</strong>
          </span>
          <span className={`font-bold ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isOverBudget ? `Exceeds by +${formatCurrency(overByAmount)}` : `${formatCurrency(remainingBudget)} Remaining`}
          </span>
        </div>

        <div className="w-full h-4 bg-zinc-900 rounded-full overflow-hidden flex p-0.5 border border-zinc-800">
          {/* Fuel / Ticket Segment */}
          {fuelPercent > 0 && (
            <div
              style={{ width: `${fuelPercent}%` }}
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-full transition-all duration-500"
              title={`Travel/Fare: ${formatCurrency(activeFuel)}`}
            />
          )}

          {/* Food Segment */}
          {foodPercent > 0 && (
            <div
              style={{ width: `${foodPercent}%` }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500"
              title={`Food: ${formatCurrency(activeFood)}`}
            />
          )}

          {/* Toll & Parking Segment */}
          {tollPercent > 0 && (
            <div
              style={{ width: `${tollPercent}%` }}
              className="h-full bg-gradient-to-r from-teal-600 to-teal-400 transition-all duration-500"
              title={`Toll & Parking: ${formatCurrency(activeToll + activeParking)}`}
            />
          )}

          {/* Activity / Entry Fees Segment */}
          {activityPercent > 0 && (
            <div
              style={{ width: `${activityPercent}%` }}
              className="h-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-500"
              title={`Activities: ${formatCurrency(activeActivities)}`}
            />
          )}

          {/* Other Cushion Segment */}
          {otherPercent > 0 && (
            <div
              style={{ width: `${otherPercent}%` }}
              className="h-full bg-gradient-to-r from-zinc-600 to-zinc-500 transition-all duration-500"
              title={`Other Cushion: ${formatCurrency(activeOther)}`}
            />
          )}

          {/* Overflow Bar (if exceeded) */}
          {isOverBudget && (
            <div
              className="h-full flex-1 bg-gradient-to-r from-rose-500 to-rose-600 rounded-r-full animate-pulse transition-all duration-500"
              title={`Over Budget by ${formatCurrency(overByAmount)}`}
            />
          )}

          {/* Remaining Available Buffer */}
          {!isOverBudget && remainingPercent > 0 && (
            <div
              style={{ width: `${remainingPercent}%` }}
              className="h-full bg-emerald-500/20 border-l border-emerald-500/30 rounded-r-full transition-all duration-500"
              title={`Remaining Buffer: ${formatCurrency(remainingBudget)}`}
            />
          )}
        </div>
      </div>

      {/* Editable Expense Category Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-semibold">Expense Breakdown (Editable)</span>
          {hasCustomOverrides && (
            <button
              type="button"
              onClick={handleResetToAuto}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Auto Calculate</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* 1. Travel / Fuel / Ticket */}
          <div className="bg-black p-2.5 rounded-2xl border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 truncate">{getTravelModeLabel()}</span>
              <Fuel className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400 text-xs font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="50"
                value={activeFuel}
                onChange={(e) => setCustomFuel(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-lg px-2 py-1 text-zinc-100 font-bold text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Toll */}
          <div className="bg-black p-2.5 rounded-2xl border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400">Toll Expense</span>
              <Ticket className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400 text-xs font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="50"
                value={activeToll}
                onChange={(e) => setCustomToll(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-zinc-900 border border-zinc-700 focus:border-teal-500 rounded-lg px-2 py-1 text-zinc-100 font-bold text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* 3. Food */}
          <div className="bg-black p-2.5 rounded-2xl border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400">Food & Dining</span>
              <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400 text-xs font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="50"
                value={activeFood}
                onChange={(e) => setCustomFood(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-lg px-2 py-1 text-zinc-100 font-bold text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* 4. Parking */}
          <div className="bg-black p-2.5 rounded-2xl border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400">Parking Fees</span>
              <Car className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400 text-xs font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="20"
                value={activeParking}
                onChange={(e) => setCustomParking(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-lg px-2 py-1 text-zinc-100 font-bold text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* 5. Activities & Entry */}
          <div className="bg-black p-2.5 rounded-2xl border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400">Activities / Entry</span>
              <Landmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400 text-xs font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="50"
                value={activeActivities}
                onChange={(e) => setCustomActivities(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-lg px-2 py-1 text-zinc-100 font-bold text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* 6. Other / Cushion */}
          <div className="bg-black p-2.5 rounded-2xl border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400">Other Expenses</span>
              <Sparkles className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400 text-xs font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="50"
                value={activeOther}
                onChange={(e) => setCustomOther(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-zinc-900 border border-zinc-700 focus:border-zinc-500 rounded-lg px-2 py-1 text-zinc-100 font-bold text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Warning / Success Banner */}
      {isOverBudget ? (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-medium">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>⚠️ Budget Exceeded by {formatCurrency(overByAmount)}.</strong> Total estimated expense ({formatCurrency(totalExpenses)}) exceeds your budget of {formatCurrency(totalBudget)}.
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>✓ Within Budget.</strong> Total estimated expense is {formatCurrency(totalExpenses)}, leaving {formatCurrency(remainingBudget)} remaining buffer.
          </span>
        </div>
      )}

      {/* Individual Pitstops Cost Accordion */}
      {stops.length > 0 && (
        <div className="pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => setShowStopBreakdown(!showStopBreakdown)}
            className="flex items-center justify-between w-full text-xs text-zinc-400 hover:text-zinc-200 transition-colors py-1"
          >
            <span className="font-semibold flex items-center gap-1.5">
              <span>Edit Individual Pitstop Costs ({stops.length} stops)</span>
            </span>
            {showStopBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showStopBreakdown && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
              {stops.map((stop, idx) => {
                const currentCost = getEstimatedStopCost(stop);
                return (
                  <div
                    key={`stop-cost-${stop.name}-${idx}`}
                    className="flex items-center justify-between bg-black px-3 py-2 rounded-xl border border-zinc-800 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-full bg-zinc-900 text-zinc-400 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="text-white font-medium truncate">{stop.name}</span>
                      <span className="text-[10px] text-zinc-500">({stop.category})</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-zinc-400 text-xs">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={currentCost}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (onUpdateStopCost) {
                            onUpdateStopCost(idx, isNaN(val) ? 0 : val);
                          }
                        }}
                        className="w-20 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-right text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancialBudget;

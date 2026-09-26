import React from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Calendar, 
  IndianRupee, 
  Car, 
  Bike, 
  Navigation, 
  ExternalLink, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  Star, 
  Utensils, 
  Coffee, 
  Trees, 
  Eye, 
  Landmark, 
  Fuel, 
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { formatDuration } from './TimeBudget';
import { formatCurrency } from './FinancialBudget';

const categoryIcons = {
  Coffee: Coffee,
  Food: Utensils,
  Nature: Trees,
  Viewpoints: Eye,
  Attractions: Landmark,
  'Fuel/rest stops': Fuel,
  Shopping: ShoppingBag,
};

const TripDetailsModal = ({
  isOpen,
  trip,
  onClose,
  onOpenInPlanner,
  onDeleteTrip,
}) => {
  if (!isOpen || !trip) return null;

  const startName = trip.startLocation?.name || trip.start?.name || 'Origin';
  const destName = trip.endLocation?.name || trip.destination?.name || 'Destination';
  const distance = trip.totalDistanceKm || trip.distance || 0;
  const drivingTime = trip.totalDurationMinutes || trip.travelTime || 0;
  const availableBudget = trip.availableTimeBudgetMinutes || trip.availableTime || 480;
  const totalBudget = trip.totalBudget || 5000;
  const estimatedTotal = trip.estimatedTotal || 0;
  const stops = trip.stops || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-md px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-zinc-900 text-amber-300 border-zinc-700">
                  {trip.vehicleType === 'bike' ? '🏍️ Bike' : '🚗 Car'}
                </span>
                <span className="text-[10px] font-semibold text-zinc-400">
                  Created {new Date(trip.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{trip.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Corridor Strip */}
          <div className="bg-black p-4 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="truncate">{startName}</span>
              </div>
              <span className="text-zinc-600 px-2">➔</span>
              <div className="flex items-center gap-2 text-rose-400 font-bold truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0"></span>
                <span className="truncate">{destName}</span>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80">
              <span className="text-zinc-400 text-[10px] block">Distance</span>
              <strong className="text-white text-sm">{distance} km</strong>
            </div>
            <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80">
              <span className="text-zinc-400 text-[10px] block">Driving Time</span>
              <strong className="text-white text-sm">{formatDuration(drivingTime)}</strong>
            </div>
            <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80">
              <span className="text-zinc-400 text-[10px] block">Time Budget</span>
              <strong className="text-emerald-400 text-sm">{formatDuration(availableBudget)}</strong>
            </div>
            <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80">
              <span className="text-zinc-400 text-[10px] block">Financial Budget</span>
              <strong className="text-amber-400 text-sm">{formatCurrency(totalBudget)}</strong>
            </div>
          </div>

          {/* Time & Expense Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Expense Breakdown */}
            <div className="bg-black p-4 rounded-2xl border border-zinc-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" />
                Trip Expenses
              </h4>
              <div className="space-y-1.5 text-zinc-300 pt-1">
                <div className="flex justify-between">
                  <span>Fuel & Tolls:</span>
                  <strong>{formatCurrency((trip.fuelCost || 0) + (trip.parkingTollCost || 0))}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Food & Dining:</span>
                  <strong>{formatCurrency(trip.foodCost || 0)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Activities & Sights:</span>
                  <strong>{formatCurrency(trip.activityCost || 0)}</strong>
                </div>
                <div className="flex justify-between text-emerald-400 pt-1.5 border-t border-zinc-800 font-bold">
                  <span>Estimated Total:</span>
                  <span>{formatCurrency(estimatedTotal)}</span>
                </div>
              </div>
            </div>

            {/* Traveler Notes / Ratings */}
            <div className="bg-black p-4 rounded-2xl border border-zinc-800 space-y-2 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Trip Details
                </h4>
                <p className="text-zinc-400 mt-2 leading-relaxed">
                  {trip.notes ? `"${trip.notes}"` : 'Curated road-trip planned with RouteCraft dynamic routing.'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>Verified RouteCraft Itinerary</span>
              </div>
            </div>
          </div>

          {/* Route Timeline & Pitstops */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Route Itinerary Timeline ({stops.length} Pitstops)
            </h4>

            {/* Timeline Stream */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
              
              {/* Origin Node */}
              <div className="relative flex items-center gap-3">
                <div className="absolute -left-6 w-5 h-5 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">START</span>
                  <p className="text-xs font-semibold text-white">{startName}</p>
                </div>
              </div>

              {/* Pitstops Nodes */}
              {stops.map((stop, idx) => {
                const CategoryIcon = categoryIcons[stop.category] || MapPin;
                return (
                  <div key={`stop-detail-${idx}`} className="relative flex items-center justify-between p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                    <div className="absolute -left-6 w-5 h-5 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-black text-amber-400">
                        <CategoryIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white">{stop.name}</h5>
                        <span className="text-[10px] text-zinc-400">
                          {stop.category || 'Stop'} • {stop.stopDurationMinutes || 30}m stay {stop.detourMinutes ? `• +${stop.detourMinutes}m detour` : ''}
                        </span>
                      </div>
                    </div>
                    {stop.estimatedCost ? (
                      <span className="text-xs font-bold text-emerald-400">
                        {formatCurrency(stop.estimatedCost)}
                      </span>
                    ) : null}
                  </div>
                );
              })}

              {/* Destination Node */}
              <div className="relative flex items-center gap-3">
                <div className="absolute -left-6 w-5 h-5 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-rose-400 uppercase">DESTINATION</span>
                  <p className="text-xs font-semibold text-white">{destName}</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-zinc-950 px-6 py-4 border-t border-zinc-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onDeleteTrip(trip._id)}
            className="px-4 py-2.5 rounded-2xl text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/30 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Trip</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenInPlanner(trip)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recalculate & Edit in Studio</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TripDetailsModal;

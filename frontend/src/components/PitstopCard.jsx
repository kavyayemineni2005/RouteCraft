import React from 'react';
import { 
  Plus, 
  Check, 
  Clock, 
  Navigation, 
  Star, 
  Coffee, 
  Utensils, 
  Trees, 
  Eye, 
  Landmark, 
  Fuel, 
  ShoppingBag,
  ExternalLink,
  IndianRupee
} from 'lucide-react';
import { formatCurrency, getEstimatedStopCost } from './FinancialBudget';

const categoryMeta = {
  Coffee: { icon: Coffee, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  Food: { icon: Utensils, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  Nature: { icon: Trees, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  Viewpoints: { icon: Eye, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
  Attractions: { icon: Landmark, color: 'text-amber-300 bg-amber-500/10 border-amber-500/30' },
  'Fuel/rest stops': { icon: Fuel, color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' },
  Shopping: { icon: ShoppingBag, color: 'text-orange-300 bg-orange-500/10 border-orange-500/30' },
};

const PitstopCard = ({
  pitstop,
  isAdded,
  onToggleAdd,
  onOpenDetails,
}) => {
  const meta = categoryMeta[pitstop.category] || categoryMeta['Attractions'];
  const CategoryIcon = meta.icon;
  const estimatedCost = getEstimatedStopCost(pitstop);

  return (
    <div className={`p-4 rounded-3xl border transition-all duration-200 group ${
      isAdded 
        ? 'bg-zinc-950 border-emerald-500/60 ring-1 ring-emerald-500/30 shadow-xl' 
        : 'bg-zinc-950/90 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700'
    }`}>
      {/* Card Header: Category Badge & Detour Badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${meta.color}`}>
          <CategoryIcon className="w-3.5 h-3.5" />
          <span>{pitstop.category}</span>
        </div>

        {/* Detour duration badge */}
        <div className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-900 text-amber-400 border border-zinc-700">
          <Navigation className="w-3 h-3 text-amber-400 rotate-45" />
          <span>+{pitstop.detourMinutes || 10}m detour</span>
        </div>
      </div>

      {/* Place Title & Rating */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="text-sm sm:text-base font-bold text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
          {pitstop.name}
        </h4>
        <div className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{pitstop.rating ? Number(pitstop.rating).toFixed(1) : '4.5'}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
        {pitstop.description || 'Curated high-rated pitstop recommended along your travel corridor.'}
      </p>

      {/* Metrics Row: Stay + Estimated Cost */}
      <div className="flex items-center justify-between text-xs text-zinc-400 bg-black p-2.5 rounded-2xl border border-zinc-800/80 mb-3">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span>Avg Stay: <strong className="text-zinc-200">{pitstop.stopDurationMinutes || 30}m</strong></span>
        </div>

        <div className="flex items-center gap-1">
          <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
          <span>Est Cost: <strong className="text-emerald-400">{formatCurrency(estimatedCost)}</strong></span>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 gap-2">
        {onOpenDetails ? (
          <button
            type="button"
            onClick={() => onOpenDetails(pitstop)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer"
            title="View reviews and details"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Reviews</span>
          </button>
        ) : (
          <div></div>
        )}

        <button
          type="button"
          onClick={() => onToggleAdd(pitstop)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
            isAdded
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
              : 'bg-emerald-500 hover:bg-emerald-400 text-black font-black shadow-emerald-500/25 hover:scale-105'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added to Route</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Pitstop</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PitstopCard;

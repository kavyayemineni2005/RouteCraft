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
  ExternalLink
} from 'lucide-react';

const categoryMeta = {
  Coffee: { icon: Coffee, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  Food: { icon: Utensils, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  Nature: { icon: Trees, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  Viewpoints: { icon: Eye, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  Attractions: { icon: Landmark, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  'Fuel/rest stops': { icon: Fuel, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  Shopping: { icon: ShoppingBag, color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
};

const PitstopCard = ({
  pitstop,
  isAdded,
  onToggleAdd,
  onOpenDetails,
}) => {
  const meta = categoryMeta[pitstop.category] || categoryMeta['Attractions'];
  const CategoryIcon = meta.icon;

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-200 group ${
      isAdded 
        ? 'bg-slate-900/90 border-sky-500/50 ring-1 ring-sky-500/30 shadow-lg shadow-sky-950/40' 
        : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
    }`}>
      {/* Card Header: Category Badge & Detour Badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${meta.color}`}>
          <CategoryIcon className="w-3.5 h-3.5" />
          <span>{pitstop.category}</span>
        </div>

        {/* Detour duration badge */}
        <div className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
          <Navigation className="w-3 h-3 text-sky-400 rotate-45" />
          <span>+{pitstop.detourMinutes || 10}m detour</span>
        </div>
      </div>

      {/* Place Title & Rating */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="text-base font-bold text-slate-100 group-hover:text-white transition-colors line-clamp-1">
          {pitstop.name}
        </h4>
        <div className="flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 shrink-0">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{pitstop.rating ? pitstop.rating.toFixed(1) : '4.5'}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
        {pitstop.description || 'Curated high-rated pitstop recommended along your travel corridor.'}
      </p>

      {/* Footer Info & Actions */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 gap-2">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Avg Stay: <strong className="text-slate-200">{pitstop.stopDurationMinutes || 30}m</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenDetails && (
            <button
              onClick={() => onOpenDetails(pitstop)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1"
              title="View reviews and photos"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Reviews</span>
            </button>
          )}

          <button
            onClick={() => onToggleAdd(pitstop)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isAdded
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/30 hover:scale-102'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Trip</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PitstopCard;

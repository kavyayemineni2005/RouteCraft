import React from 'react';
import { 
  GripVertical, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Clock, 
  MapPin,
  Coffee,
  Utensils,
  Trees,
  Eye,
  Landmark,
  Fuel,
  ShoppingBag
} from 'lucide-react';

const categoryIcons = {
  Coffee: Coffee,
  Food: Utensils,
  Nature: Trees,
  Viewpoints: Eye,
  Attractions: Landmark,
  'Fuel/rest stops': Fuel,
  Shopping: ShoppingBag,
};

const DURATION_OPTIONS = [15, 25, 30, 45, 60, 90, 120];

const StopItem = ({
  stop,
  index,
  totalStops,
  onMoveUp,
  onMoveDown,
  onRemove,
  onUpdateDuration,
}) => {
  const CategoryIcon = categoryIcons[stop.category] || MapPin;

  return (
    <div className="flex items-center gap-3 p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-all group">
      {/* Index Badge */}
      <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
        {index + 1}
      </div>

      {/* Stop Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h5 className="text-sm font-semibold text-slate-100 truncate">
            {stop.name}
          </h5>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
            {stop.category || 'Stop'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          {/* Duration Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 px-2 py-0.5 rounded-lg border border-slate-800">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">Stay:</span>
            <select
              value={stop.stopDurationMinutes || 30}
              onChange={(e) => onUpdateDuration(index, Number(e.target.value))}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              {DURATION_OPTIONS.map((mins) => (
                <option key={mins} value={mins} className="bg-slate-900 text-white">
                  {mins >= 60 ? `${mins / 60}h ${mins % 60 ? `${mins % 60}m` : ''}` : `${mins}m`}
                </option>
              ))}
            </select>
          </div>

          {stop.detourMinutes > 0 && (
            <span className="text-sky-400 font-medium">
              +{stop.detourMinutes}m detour
            </span>
          )}
        </div>
      </div>

      {/* Reordering & Delete Controls */}
      <div className="flex items-center gap-1 shrink-0">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
            title="Move earlier"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={index === totalStops - 1}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
            title="Move later"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
          title="Remove stop"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default StopItem;

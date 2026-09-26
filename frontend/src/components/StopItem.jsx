import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  ShoppingBag,
  Loader2,
  Building,
  Navigation
} from 'lucide-react';
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

const DURATION_OPTIONS = [15, 25, 30, 45, 60, 90, 120];

const StopItem = ({
  stop,
  index,
  totalStops,
  onMoveUp,
  onMoveDown,
  onRemove,
  onUpdateDuration,
  onUpdateCost,
}) => {
  const id = stop._id || stop.id || `stop-${stop.latitude}-${stop.longitude}-${index}`;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const CategoryIcon = categoryIcons[stop.category] || MapPin;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-3 p-4 bg-zinc-950/90 border rounded-2xl transition-all group ${
        isDragging
          ? 'border-amber-400 shadow-2xl bg-zinc-900 scale-105'
          : 'border-zinc-800 hover:border-zinc-700'
      }`}
    >
      {/* Drag Grip Handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-zinc-600 hover:text-amber-400 cursor-grab active:cursor-grabbing p-1 rounded-lg transition-colors shrink-0 mt-1"
        title="Drag to reorder stop"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Numbered Stop Badge */}
      <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
        {index + 1}
      </div>

      {/* Stop Information Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
            Stop {index + 1}
          </span>
          {stop.category && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800">
              {stop.category}
            </span>
          )}
        </div>

        {stop.loadingAddress ? (
          <div className="flex items-center gap-2 py-1 text-xs text-amber-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Finding address...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Place / Name */}
            <h5 className="text-sm font-bold text-white leading-snug">
              {stop.name || `Stop ${index + 1}`}
            </h5>

            {/* Address Details (Street, City, State, PIN code) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-zinc-400 pt-0.5">
              {stop.street && (
                <div>
                  <span className="text-zinc-500 font-medium">Street:</span>{' '}
                  <span className="text-zinc-200">{stop.street}</span>
                </div>
              )}
              {stop.area && !stop.street && (
                <div>
                  <span className="text-zinc-500 font-medium">Area:</span>{' '}
                  <span className="text-zinc-200">{stop.area}</span>
                </div>
              )}
              {stop.city && (
                <div>
                  <span className="text-zinc-500 font-medium">City:</span>{' '}
                  <span className="text-zinc-200 font-medium">{stop.city}</span>
                </div>
              )}
              {stop.state && (
                <div>
                  <span className="text-zinc-500 font-medium">State:</span>{' '}
                  <span className="text-zinc-200">{stop.state}</span>
                </div>
              )}
              {stop.pin && (
                <div>
                  <span className="text-zinc-500 font-medium">PIN:</span>{' '}
                  <span className="text-amber-400 font-mono font-bold">{stop.pin}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Duration & Budget Meta Controls */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-400 mt-2.5">
          {/* Duration Selector */}
          <div className="flex items-center gap-1.5 bg-black px-2 py-0.5 rounded-lg border border-zinc-800">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span className="text-[11px] text-zinc-400">Stay:</span>
            <select
              value={stop.stopDurationMinutes || 30}
              onChange={(e) => onUpdateDuration(index, Number(e.target.value))}
              className="bg-transparent text-zinc-200 font-bold focus:outline-none cursor-pointer text-[11px]"
            >
              {DURATION_OPTIONS.map((mins) => (
                <option key={mins} value={mins} className="bg-zinc-900 text-white">
                  {mins >= 60 ? `${mins / 60}h ${mins % 60 ? `${mins % 60}m` : ''}` : `${mins}m`}
                </option>
              ))}
            </select>
          </div>

          {stop.detourMinutes > 0 && (
            <span className="text-amber-400 text-[11px] font-bold">
              +{stop.detourMinutes}m detour
            </span>
          )}

          {stop.estimatedCost !== undefined && (
            <span className="text-emerald-400 text-[11px] font-bold">
              {formatCurrency(stop.estimatedCost)}
            </span>
          )}
        </div>
      </div>

      {/* Up/Down buttons + Remove Action */}
      <div className="flex items-center gap-1 shrink-0 mt-1">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => onMoveUp && onMoveUp(index)}
            disabled={index === 0}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-900 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Move earlier"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown && onMoveDown(index)}
            disabled={index === totalStops - 1}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-900 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Move later"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-0.5 cursor-pointer"
          title="Remove stop from itinerary"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default StopItem;

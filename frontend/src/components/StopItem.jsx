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
  IndianRupee
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
  const id = stop._id || stop.id || stop.name || `stop-${index}`;
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
      className={`flex items-center gap-3 p-3.5 bg-zinc-950/90 border rounded-2xl transition-all group ${
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
        className="text-zinc-600 hover:text-amber-400 cursor-grab active:cursor-grabbing p-1 rounded-lg transition-colors shrink-0"
        title="Drag to reorder stop"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Index Badge */}
      <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center font-black text-xs shrink-0">
        {index + 1}
      </div>

      {/* Stop Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h5 className="text-xs sm:text-sm font-bold text-white truncate">
            {stop.name}
          </h5>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-zinc-900 text-zinc-300 shrink-0 border border-zinc-700">
            {stop.category || 'Pitstop'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-400">
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

      {/* Up/Down buttons + Remove */}
      <div className="flex items-center gap-1 shrink-0">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => onMoveUp && onMoveUp(index)}
            disabled={index === 0}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-900 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
            title="Move earlier"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown && onMoveDown(index)}
            disabled={index === totalStops - 1}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-900 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
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

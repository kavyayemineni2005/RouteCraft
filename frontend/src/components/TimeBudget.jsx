import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, Car, Coffee, Compass } from 'lucide-react';

/**
 * Format minutes into clean "Xh Ym" or "Ym" string
 */
export const formatDuration = (totalMinutes) => {
  if (isNaN(totalMinutes) || totalMinutes === null) return '0m';
  const minutes = Math.round(totalMinutes);
  if (minutes < 0) {
    const abs = Math.abs(minutes);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return h > 0 ? `-${h}h ${m}m` : `-${m}m`;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const TimeBudget = ({
  availableTime = 480, // in minutes
  drivingTime = 0,     // in minutes
  stops = [],          // array of selected stops
}) => {
  // Calculate total pitstop duration: sum of (stopDurationMinutes + detourMinutes)
  const pitstopTime = stops.reduce((acc, stop) => {
    const duration = Number(stop.stopDurationMinutes) || 30;
    const detour = Number(stop.detourMinutes) || 0;
    return acc + duration + detour;
  }, 0);

  const totalUsedTime = drivingTime + pitstopTime;
  const remainingTime = availableTime - totalUsedTime;
  const isOverBudget = remainingTime < 0;
  const overByMinutes = Math.abs(remainingTime);

  // Percentage calculations for the visual budget bar
  const drivingPercent = availableTime > 0 ? Math.min(100, (drivingTime / availableTime) * 100) : 0;
  const pitstopsPercent = availableTime > 0 ? Math.min(100 - drivingPercent, (pitstopTime / availableTime) * 100) : 0;
  const usedPercent = Math.min(100, (totalUsedTime / availableTime) * 100);
  const remainingPercent = Math.max(0, 100 - usedPercent);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm transition-all">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              TIME BUDGET
              {isOverBudget ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Over Budget
                </span>
              ) : (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Within Budget
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Total Budget: <strong className="text-slate-200">{formatDuration(availableTime)}</strong>
            </p>
          </div>
        </div>

        {/* Dynamic Used vs Remaining Display */}
        <div className="flex items-center gap-4 text-sm bg-slate-950/60 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block">Used Time</span>
            <span className="font-bold text-slate-100">{formatDuration(totalUsedTime)}</span>
          </div>
          <div className="w-px h-6 bg-slate-800"></div>
          <div>
            <span className="text-xs text-slate-400 block">
              {isOverBudget ? 'Exceeded By' : 'Remaining'}
            </span>
            <span className={`font-bold ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isOverBudget ? `+${formatDuration(overByMinutes)}` : formatDuration(remainingTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Multi-Segment Time-Budget Bar */}
      <div className="relative mb-3">
        <div className="w-full h-4 bg-slate-800/80 rounded-full overflow-hidden flex p-0.5 border border-slate-700/50">
          {/* Driving Time Segment */}
          {drivingPercent > 0 && (
            <div
              style={{ width: `${drivingPercent}%` }}
              className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-l-full transition-all duration-500 relative group"
              title={`Driving: ${formatDuration(drivingTime)}`}
            />
          )}

          {/* Pitstops Segment */}
          {pitstopsPercent > 0 && (
            <div
              style={{ width: `${pitstopsPercent}%` }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500 group"
              title={`Pitstops: ${formatDuration(pitstopTime)}`}
            />
          )}

          {/* Overflow Bar (if exceeded) */}
          {isOverBudget && (
            <div
              className="h-full flex-1 bg-gradient-to-r from-rose-500 to-rose-600 rounded-r-full animate-pulse transition-all duration-500"
              title={`Exceeded by ${formatDuration(overByMinutes)}`}
            />
          )}

          {/* Remaining Available Buffer */}
          {!isOverBudget && remainingPercent > 0 && (
            <div
              style={{ width: `${remainingPercent}%` }}
              className="h-full bg-emerald-500/20 border-l border-emerald-500/30 rounded-r-full transition-all duration-500"
              title={`Remaining: ${formatDuration(remainingTime)}`}
            />
          )}
        </div>
      </div>

      {/* Segment Legends */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <span>Driving ({formatDuration(drivingTime)})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Pitstops ({formatDuration(pitstopTime)})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isOverBudget ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
            <span>{isOverBudget ? `Over (+${formatDuration(overByMinutes)})` : `Buffer (${formatDuration(remainingTime)})`}</span>
          </div>
        </div>

        <div className="text-slate-400 text-xs">
          {stops.length} {stops.length === 1 ? 'pitstop planned' : 'pitstops planned'}
        </div>
      </div>

      {/* Exceeded Time Warning Banner */}
      {isOverBudget && (
        <div className="mt-3.5 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm animate-pulse-subtle">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>Trip exceeds your available time by {formatDuration(overByMinutes)}.</strong> Consider shortening stop durations or removing a pitstop to stay within budget.
          </span>
        </div>
      )}

      {/* Safe Time Success Note */}
      {!isOverBudget && stops.length > 0 && (
        <div className="mt-3.5 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Great pacing! You have <strong>{formatDuration(remainingTime)}</strong> spare buffer remaining for scenic breaks or traffic.
          </span>
        </div>
      )}
    </div>
  );
};

export default TimeBudget;

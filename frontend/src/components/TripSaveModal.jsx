import React, { useState } from 'react';
import { X, BookmarkCheck, Check, Sparkles, AlertCircle, IndianRupee } from 'lucide-react';
import { createTripApi, updateTripApi } from '../services/api';
import { formatDuration } from './TimeBudget';
import { formatCurrency } from './FinancialBudget';

const TripSaveModal = ({
  isOpen,
  onClose,
  tripData,
  onSavedSuccess,
}) => {
  const [title, setTitle] = useState(
    tripData?.title ||
    `${tripData?.startLocation?.name?.split(',')[0] || 'Origin'} to ${
      tripData?.endLocation?.name?.split(',')[0] || 'Destination'
    } Trip`
  );
  const [notes, setNotes] = useState(tripData?.notes || '');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a title for your trip.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        title: title.trim(),
        startLocation: tripData.startLocation,
        endLocation: tripData.endLocation,
        start: tripData.startLocation,
        destination: tripData.endLocation,
        stops: tripData.stops || [],
        totalDurationMinutes: tripData.totalDurationMinutes || 0,
        travelTime: tripData.totalDurationMinutes || 0,
        availableTimeBudgetMinutes: tripData.availableTimeBudgetMinutes || 480,
        availableTime: tripData.availableTimeBudgetMinutes || 480,
        totalDistanceKm: tripData.totalDistanceKm || 0,
        distance: tripData.totalDistanceKm || 0,
        totalTripTime: tripData.totalTripTime || tripData.totalDurationMinutes || 0,
        vehicleType: tripData.vehicleType || 'car',
        travelersCount: Number(tripData.travelersCount) || 1,
        totalBudget: Number(tripData.totalBudget) || 5000,
        fuelCost: Number(tripData.fuelCost) || 0,
        foodCost: Number(tripData.foodCost) || 0,
        parkingTollCost: Number(tripData.parkingTollCost) || 0,
        activityCost: Number(tripData.activityCost) || 0,
        otherCost: Number(tripData.otherCost) || 0,
        estimatedTotal: Number(tripData.estimatedTotal) || 0,
        remainingBudget: Number(tripData.remainingBudget) !== undefined ? Number(tripData.remainingBudget) : (Number(tripData.totalBudget || 5000) - Number(tripData.estimatedTotal || 0)),
        routeCoordinates: tripData.routeCoordinates || [],
        notes: notes.trim(),
      };

      let result;
      if (tripData._id) {
        result = await updateTripApi(tripData._id, payload);
      } else {
        result = await createTripApi(payload);
      }

      setIsSaved(true);
      if (onSavedSuccess) {
        onSavedSuccess(result.data);
      }

      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save trip.');
    } finally {
      setSaving(false);
    }
  };

  const isOverBudget = (tripData.estimatedTotal || 0) > (tripData.totalBudget || 5000);

  const getVehicleBadge = (vType) => {
    switch (vType) {
      case 'bike':
        return '🏍️ Bike';
      case 'bus':
        return '🚌 Bus';
      case 'train':
        return '🚆 Train';
      case 'flight':
        return '✈️ Flight';
      case 'car':
      default:
        return '🚗 Car';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-black">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Save Trip Plan</h3>
              <p className="text-xs text-zinc-400">Save route, schedule & budget to your profile</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSaved && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Trip saved successfully!</span>
            </div>
          )}

          {/* Trip Summary Quick Card */}
          <div className="bg-black p-3.5 rounded-2xl border border-zinc-800 space-y-2.5">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <span className="text-zinc-400 block mb-0.5">Mode</span>
                <strong className="text-zinc-100 font-bold flex items-center justify-center gap-1">
                  {getVehicleBadge(tripData.vehicleType)}
                </strong>
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5">Distance</span>
                <strong className="text-zinc-100 font-bold">{tripData.totalDistanceKm || 0} km</strong>
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5">Est. Time</span>
                <strong className="text-zinc-100 font-bold">{formatDuration(tripData.totalDurationMinutes)}</strong>
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5">Travelers</span>
                <strong className="text-amber-400 font-bold">{tripData.travelersCount || 1} person</strong>
              </div>
            </div>

            {/* Financial Budget Quick Strip */}
            <div className="pt-2 border-t border-zinc-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-zinc-400 block mb-0.5 text-[10px]">User Budget</span>
                <strong className="text-zinc-200 font-bold">{formatCurrency(tripData.totalBudget || 5000)}</strong>
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5 text-[10px]">Est. Cost</span>
                <strong className={`font-bold ${isOverBudget ? 'text-rose-400' : 'text-zinc-200'}`}>
                  {formatCurrency(tripData.estimatedTotal || 0)}
                </strong>
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5 text-[10px]">
                  {isOverBudget ? 'Exceeded' : 'Remaining'}
                </span>
                <strong className={`font-bold ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {formatCurrency(Math.abs((tripData.totalBudget || 5000) - (tripData.estimatedTotal || 0)))}
                </strong>
              </div>
            </div>
          </div>

          {/* Trip Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Trip Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekend Drive with Sunset Viewpoint"
              className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Trip Notes & Reminders (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Pack extra water, visit cafe before 4 PM..."
              rows={3}
              className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors border border-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || isSaved}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 disabled:opacity-50 transition-all"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save Trip</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripSaveModal;

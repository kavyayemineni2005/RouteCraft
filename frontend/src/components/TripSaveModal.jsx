import React, { useState } from 'react';
import { X, BookmarkCheck, Check, Sparkles, AlertCircle } from 'lucide-react';
import { createTripApi, updateTripApi } from '../services/api';
import { formatDuration } from './TimeBudget';

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
        stops: tripData.stops || [],
        totalDurationMinutes: tripData.totalDurationMinutes || 0,
        availableTimeBudgetMinutes: tripData.availableTimeBudgetMinutes || 480,
        totalDistanceKm: tripData.totalDistanceKm || 0,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Save Trip Plan</h3>
              <p className="text-xs text-slate-400">Save your route & pitstops to your profile</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Distance</span>
              <strong className="text-slate-100 font-bold">{tripData.totalDistanceKm || 0} km</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Est. Time</span>
              <strong className="text-slate-100 font-bold">{formatDuration(tripData.totalDurationMinutes)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Pitstops</span>
              <strong className="text-sky-400 font-bold">{tripData.stops?.length || 0} stops</strong>
            </div>
          </div>

          {/* Trip Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Trip Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekend Drive with Sunset Viewpoint"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Trip Notes & Reminders (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Pack extra water, visit cafe before 4 PM..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || isSaved}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 flex items-center gap-1.5 disabled:opacity-50 transition-all"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

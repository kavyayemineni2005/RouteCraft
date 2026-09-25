import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookmarkCheck, 
  Trash2, 
  ExternalLink, 
  MapPin, 
  Clock, 
  Navigation, 
  PlusCircle, 
  Search, 
  Share2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { getTripsApi, deleteTripApi } from '../services/api';
import { formatDuration } from '../components/TimeBudget';
import Loading from '../components/Loading';

const Trips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getTripsApi();
      setTrips(res.data || []);
    } catch (err) {
      console.error('[Trips Page Error]:', err);
      setErrorMsg(err.message || 'Failed to load saved trips.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this saved trip?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteTripApi(id);
      setTrips((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete trip.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenInPlanner = (trip) => {
    const sName = trip.startLocation?.name || 'Origin';
    const dName = trip.endLocation?.name || 'Destination';
    const budget = trip.availableTimeBudgetMinutes || 480;
    navigate(`/planner?start=${encodeURIComponent(sName)}&dest=${encodeURIComponent(dName)}&budget=${budget}`);
  };

  const filteredTrips = trips.filter((t) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = t.title?.toLowerCase().includes(query);
    const startMatch = t.startLocation?.name?.toLowerCase().includes(query);
    const destMatch = t.endLocation?.name?.toLowerCase().includes(query);
    return titleMatch || startMatch || destMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & New Trip Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
            <BookmarkCheck className="w-4 h-4 text-sky-400" />
            Trip Library
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            My Saved Trips
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your past itineraries and planned micro-trips
          </p>
        </div>

        <Link
          to="/planner"
          className="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 flex items-center gap-2 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3 max-w-md bg-slate-900 border border-slate-800 rounded-2xl px-3.5 py-2.5 shadow-inner">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search saved trips by name or city..."
          className="w-full bg-transparent text-white text-xs placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Trips Grid */}
      {loading ? (
        <Loading message="Loading your itineraries..." subtext="Retrieving saved corridors and pitstops..." />
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Saved Trips Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {searchQuery
              ? 'No trips match your search term. Try a different city name.'
              : 'You have not saved any routes yet. Open the Route Planner to create your first customized itinerary!'}
          </p>
          <Link
            to="/planner"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Create Trip Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <div
              key={trip._id}
              onClick={() => handleOpenInPlanner(trip)}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group shadow-xl"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {trip.stops?.length || 0} Pitstops
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {new Date(trip.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors mb-2 line-clamp-1">
                  {trip.title}
                </h3>

                {/* Origin / Dest */}
                <div className="space-y-1 text-xs text-slate-300 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                    <span className="truncate">{trip.startLocation?.name || 'Origin'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0"></span>
                    <span className="truncate">{trip.endLocation?.name || 'Destination'}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs mb-4">
                  <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Total Distance</span>
                    <strong className="text-slate-200">{trip.totalDistanceKm || 0} km</strong>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Total Est. Time</span>
                    <strong className="text-slate-200">{formatDuration(trip.totalDurationMinutes)}</strong>
                  </div>
                </div>

                {trip.notes && (
                  <p className="text-xs text-slate-400 italic line-clamp-2 mb-4">
                    "{trip.notes}"
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleOpenInPlanner(trip)}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <span>Open in Studio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDeleteTrip(trip._id, e)}
                  disabled={deletingId === trip._id}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete trip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Trips;

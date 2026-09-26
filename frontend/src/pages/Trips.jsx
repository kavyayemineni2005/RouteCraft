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
  AlertCircle,
  IndianRupee,
  Eye,
  RotateCcw,
  Sparkles,
  Car,
  Bike
} from 'lucide-react';
import { getTripsApi, deleteTripApi } from '../services/api';
import { formatDuration } from '../components/TimeBudget';
import { formatCurrency } from '../components/FinancialBudget';
import TripDetailsModal from '../components/TripDetailsModal';
import Loading from '../components/Loading';

const Trips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [selectedTripModal, setSelectedTripModal] = useState(null);

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
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this saved trip?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteTripApi(id);
      setTrips((prev) => prev.filter((t) => t._id !== id));
      if (selectedTripModal?._id === id) {
        setSelectedTripModal(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete trip.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenInPlanner = (trip) => {
    const sName = trip.startLocation?.name || trip.start?.name || 'Origin';
    const dName = trip.endLocation?.name || trip.destination?.name || 'Destination';
    const budget = trip.availableTimeBudgetMinutes || trip.availableTime || 480;
    const vehicle = trip.vehicleType || 'car';
    const travelers = trip.travelersCount || 1;
    const totalBudget = trip.totalBudget || 5000;
    navigate(`/planner?start=${encodeURIComponent(sName)}&dest=${encodeURIComponent(dName)}&budget=${budget}&vehicle=${vehicle}&totalBudget=${totalBudget}&travelers=${travelers}`);
  };

  const filteredTrips = trips.filter((t) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = t.title?.toLowerCase().includes(query);
    const startMatch = (t.startLocation?.name || t.start?.name || '').toLowerCase().includes(query);
    const destMatch = (t.endLocation?.name || t.destination?.name || '').toLowerCase().includes(query);
    return titleMatch || startMatch || destMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-black min-h-screen text-zinc-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <BookmarkCheck className="w-4 h-4 text-amber-400" />
            <span>Trip Library & Corridors</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            My Saved Trips
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Inspect, re-launch, and manage all your road-trip itineraries.
          </p>
        </div>

        <Link
          to="/create"
          className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3 max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 shadow-inner">
        <Search className="w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search saved trips by title, origin or city..."
          className="w-full bg-transparent text-white text-xs placeholder-zinc-500 focus:outline-none"
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
        <div className="text-center py-16 px-4 bg-zinc-950/40 rounded-3xl border border-dashed border-zinc-800 max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Saved Trips Found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            {searchQuery
              ? 'No trips match your search term. Try a different search term.'
              : 'You have not saved any routes yet. Open the Route Planner to create your first customized itinerary!'}
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Trip Now</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const startName = trip.startLocation?.name || trip.start?.name || 'Origin';
            const destName = trip.endLocation?.name || trip.destination?.name || 'Destination';
            const distance = trip.totalDistanceKm || trip.distance || 0;
            const duration = trip.totalDurationMinutes || trip.travelTime || trip.totalTripTime || 0;
            const budget = trip.totalBudget || 5000;
            const pitstopCount = trip.stops?.length || 0;

            return (
              <div
                key={trip._id}
                className="bg-zinc-950 hover:bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Badge & Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-zinc-900 text-amber-300 border-zinc-700">
                        {trip.vehicleType === 'bike' ? '🏍️ Bike' : '🚗 Car'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-700">
                        {pitstopCount} Stops
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {trip.title}
                  </h3>

                  {/* Corridor Strip */}
                  <div className="space-y-1 text-xs text-zinc-300 bg-black p-3 rounded-2xl border border-zinc-800/80">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                      <span className="truncate">{startName}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0"></span>
                      <span className="truncate">{destName}</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-black p-2 rounded-xl border border-zinc-800">
                      <span className="text-zinc-500 text-[10px] block">Distance</span>
                      <strong className="text-zinc-200">{distance} km</strong>
                    </div>
                    <div className="bg-black p-2 rounded-xl border border-zinc-800">
                      <span className="text-zinc-500 text-[10px] block">Travel Time</span>
                      <strong className="text-zinc-200">{formatDuration(duration)}</strong>
                    </div>
                  </div>

                  {/* Budget Strip */}
                  <div className="bg-black p-2 rounded-xl border border-zinc-800 flex items-center justify-between text-[11px] px-3">
                    <span className="text-zinc-400">Budget: <strong className="text-zinc-200 font-bold">{formatCurrency(budget)}</strong></span>
                    <span className={`${
                      (trip.estimatedTotal || 0) > budget ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'
                    }`}>
                      Est: {formatCurrency(trip.estimatedTotal || 0)}
                    </span>
                  </div>

                  {trip.notes && (
                    <p className="text-xs text-zinc-400 italic line-clamp-2">
                      "{trip.notes}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-zinc-800/80 mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTripModal(trip)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1 border border-zinc-800 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>View</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenInPlanner(trip)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black text-xs font-bold flex items-center gap-1 border border-emerald-500/30 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteTrip(trip._id, e)}
                    disabled={deletingId === trip._id}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trip Details Modal */}
      {selectedTripModal && (
        <TripDetailsModal
          isOpen={!!selectedTripModal}
          trip={selectedTripModal}
          onClose={() => setSelectedTripModal(null)}
          onOpenInPlanner={(trip) => {
            setSelectedTripModal(null);
            handleOpenInPlanner(trip);
          }}
          onDeleteTrip={(id) => handleDeleteTrip(id)}
        />
      )}
    </div>
  );
};

export default Trips;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Compass, 
  Bookmark, 
  User, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  MapPin, 
  ArrowRight, 
  Car, 
  Bike, 
  IndianRupee, 
  Calendar, 
  Eye, 
  Trash2, 
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTripsApi, deleteTripApi } from '../services/api';
import { formatDuration } from '../components/TimeBudget';
import { formatCurrency } from '../components/FinancialBudget';
import TripDetailsModal from '../components/TripDetailsModal';
import Loading from '../components/Loading';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSidebarTab, setActiveSidebarTab] = useState('dashboard');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTripModal, setSelectedTripModal] = useState(null);

  useEffect(() => {
    fetchDashboardTrips();
  }, []);

  const fetchDashboardTrips = async () => {
    try {
      const res = await getTripsApi();
      setTrips(res.data || []);
    } catch (err) {
      console.warn('Dashboard fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      await deleteTripApi(tripId);
      setTrips(trips.filter((t) => t._id !== tripId));
      if (selectedTripModal?._id === tripId) {
        setSelectedTripModal(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete trip.');
    }
  };

  const handleOpenPlanner = (trip) => {
    const sName = trip.startLocation?.name || trip.start?.name || 'Origin';
    const dName = trip.endLocation?.name || trip.destination?.name || 'Destination';
    const budget = trip.availableTimeBudgetMinutes || trip.availableTime || 480;
    const vehicle = trip.vehicleType || 'car';
    const travelers = trip.travelersCount || 1;
    const totalBudget = trip.totalBudget || 5000;
    navigate(`/planner?start=${encodeURIComponent(sName)}&dest=${encodeURIComponent(dName)}&budget=${budget}&vehicle=${vehicle}&totalBudget=${totalBudget}&travelers=${travelers}`);
  };

  const totalDistance = trips.reduce((acc, t) => acc + (t.totalDistanceKm || t.distance || 0), 0);
  const totalStops = trips.reduce((acc, t) => acc + (t.stops?.length || 0), 0);
  const totalHours = Math.round(
    trips.reduce((acc, t) => acc + (t.totalDurationMinutes || t.totalTripTime || 0), 0) / 60
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-black min-h-screen text-zinc-100">
      
      {/* Top Welcome Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center text-black text-2xl font-black shadow-lg shadow-amber-500/20 border border-amber-300/40">
            {(user?.name || 'Explorer')[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Active Member
              </span>
              <span className="text-xs text-zinc-400">RouteCraft Explorer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {user?.name || 'Roadtripper'}!
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {user?.email || 'Logged in to RouteCraft studio'} • Plan, discover, and optimize your road trips.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/create"
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all hover:scale-105 shrink-0"
          >
            <Compass className="w-4 h-4" />
            <span>Plan New Trip</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Sidebar (3 Cols) + Content (9 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Navigation */}
        <aside className="lg:col-span-3 bg-zinc-950 border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-2 sticky top-24">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 py-1 block">
            Navigation Menu
          </span>

          <button
            type="button"
            onClick={() => setActiveSidebarTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
              activeSidebarTab === 'dashboard'
                ? 'bg-amber-500 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <Link
            to="/create"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-zinc-400 hover:text-emerald-400 hover:bg-zinc-900 transition-all text-left"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Plan Trip</span>
          </Link>

          <Link
            to="/trips"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 transition-all text-left"
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>My Trips</span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300">
              {trips.length}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setActiveSidebarTab('saved_routes')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
              activeSidebarTab === 'saved_routes'
                ? 'bg-amber-500 text-black font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Routes</span>
          </button>

          <Link
            to="/profile"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all text-left"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </Link>
        </aside>

        {/* Right Content Area (9 Cols) */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-400">Total Trips</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Bookmark className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">{trips.length}</h3>
              <span className="text-[11px] text-zinc-500">Saved itineraries</span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-400">Total Distance</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">{totalDistance} <span className="text-sm font-normal text-zinc-400">km</span></h3>
              <span className="text-[11px] text-zinc-500">Corridors mapped</span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-400">Places Discovered</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">{totalStops}</h3>
              <span className="text-[11px] text-zinc-500">Cafes & viewpoints</span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-400">Saved Routes</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">{trips.length}</h3>
              <span className="text-[11px] text-zinc-500">Ready to navigate</span>
            </div>
          </div>

          {/* Recent Trips Section */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-amber-400" />
                  Recent Trips & Itineraries
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Explore, inspect, and relaunch your customized road-trips</p>
              </div>
              <Link
                to="/trips"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                View All Trips ({trips.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <Loading message="Fetching your travel itineraries..." />
            ) : trips.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-zinc-800 rounded-3xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <Compass className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">No Trips Saved Yet</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Start by designing your first route with pitstops, time budgets, and expense estimations.
                </p>
                <Link
                  to="/create"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-md transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Create First Trip
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trips.slice(0, 6).map((trip) => {
                  const s = trip.startLocation?.name || trip.start?.name || 'Origin';
                  const d = trip.endLocation?.name || trip.destination?.name || 'Destination';
                  const distance = trip.totalDistanceKm || trip.distance || 0;
                  const duration = trip.totalDurationMinutes || trip.travelTime || 0;
                  const budget = trip.totalBudget || 5000;
                  const pitstopCount = trip.stops?.length || 0;

                  return (
                    <div
                      key={trip._id}
                      className="bg-black hover:bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-700 p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-zinc-900 text-amber-300 border-zinc-700">
                            {trip.vehicleType === 'bike' ? '🏍️ Bike' : '🚗 Car'}
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            {new Date(trip.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                          {trip.title}
                        </h4>

                        {/* Corridor Strip */}
                        <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-xs space-y-1">
                          <div className="flex items-center gap-2 text-zinc-300 truncate">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                            <span className="truncate">{s}</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-300 truncate">
                            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0"></span>
                            <span className="truncate">{d}</span>
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 block">Distance</span>
                            <strong className="text-zinc-200">{distance} km</strong>
                          </div>
                          <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 block">Duration</span>
                            <strong className="text-zinc-200">{formatDuration(duration)}</strong>
                          </div>
                          <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 block">Pitstops</span>
                            <strong className="text-amber-400">{pitstopCount} Stops</strong>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
                          <span>Budget: <strong className="text-zinc-200">{formatCurrency(budget)}</strong></span>
                          <span className="text-emerald-400 font-bold">Est: {formatCurrency(trip.estimatedTotal || 0)}</span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80 mt-4">
                        <button
                          type="button"
                          onClick={() => setSelectedTripModal(trip)}
                          className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-zinc-800 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>View Trip</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenPlanner(trip)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 shadow transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Launch</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Trip Details Modal */}
      {selectedTripModal && (
        <TripDetailsModal
          isOpen={!!selectedTripModal}
          trip={selectedTripModal}
          onClose={() => setSelectedTripModal(null)}
          onOpenInPlanner={(trip) => {
            setSelectedTripModal(null);
            handleOpenPlanner(trip);
          }}
          onDeleteTrip={handleDeleteTrip}
        />
      )}
    </div>
  );
};

export default Dashboard;

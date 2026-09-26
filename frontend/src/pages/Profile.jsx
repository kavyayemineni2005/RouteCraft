import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Navigation, 
  Compass, 
  Award, 
  TrendingUp, 
  Bookmark, 
  Sparkles, 
  LogOut, 
  Clock, 
  IndianRupee,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Car,
  Bike
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTripsApi } from '../services/api';
import { formatDuration } from '../components/TimeBudget';
import { formatCurrency } from '../components/FinancialBudget';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileTrips = async () => {
      try {
        const res = await getTripsApi();
        setTrips(res.data || []);
      } catch (err) {
        console.warn('Profile trips fetch notice:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileTrips();
  }, []);

  const totalDistance = trips.reduce((acc, t) => acc + (t.totalDistanceKm || t.distance || 0), 0);
  const totalStops = trips.reduce((acc, t) => acc + (t.stops?.length || 0), 0);
  const totalHours = Math.round(
    trips.reduce((acc, t) => acc + (t.totalDurationMinutes || t.totalTripTime || 0), 0) / 60
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 bg-black min-h-screen">
      {/* Profile Header Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none -z-0"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center text-black text-3xl font-black shadow-xl shadow-amber-500/20 border border-amber-300/40">
              {(user?.name || 'Explorer')[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Verified Traveler
                </span>
                <span className="text-xs text-zinc-400">RouteCraft Pro</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {user?.name || 'Travel Enthusiast'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                {user?.email || 'No email associated'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/planner"
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Compass className="w-4 h-4" />
              <span>Plan Trip</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-rose-950/40 text-rose-400 border border-zinc-800 hover:border-rose-500/30 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400">Total Saved Trips</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white">{trips.length}</h3>
          <span className="text-[11px] text-zinc-500">Custom highway itineraries</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400">Total Distance</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white">{totalDistance} <span className="text-sm font-normal text-zinc-400">km</span></h3>
          <span className="text-[11px] text-zinc-500">Distance navigated</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400">Places Discovered</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white">{totalStops}</h3>
          <span className="text-[11px] text-zinc-500">Cafes, viewpoints & heritage</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400">Total Hours</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white">{totalHours} <span className="text-sm font-normal text-zinc-400">hrs</span></h3>
          <span className="text-[11px] text-zinc-500">Time-budget planned</span>
        </div>
      </div>

      {/* Saved Routes Overview */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-400" />
              Saved Routes & Itineraries
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Quick access to all your stored corridors</p>
          </div>
          <Link to="/trips" className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1">
            View All ({trips.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {trips.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-2xl">
            No saved routes yet. Build your first trip using the Route Planner!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trips.slice(0, 6).map((trip) => (
              <div
                key={trip._id}
                onClick={() => {
                  const s = trip.startLocation?.name || trip.start?.name || 'Origin';
                  const d = trip.endLocation?.name || trip.destination?.name || 'Destination';
                  const v = trip.vehicleType || 'car';
                  const b = trip.totalBudget || 4000;
                  navigate(`/planner?start=${encodeURIComponent(s)}&dest=${encodeURIComponent(d)}&vehicle=${v}&totalBudget=${b}`);
                }}
                className="bg-black hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-zinc-900 text-amber-300 border-zinc-700">
                      {trip.vehicleType === 'bike' ? '🏍️ Bike' : '🚗 Car'}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {trip.title}
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {trip.stops?.length || 0} stops • {trip.totalDistanceKm || trip.distance || 0} km • {formatCurrency(trip.totalBudget || 0)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

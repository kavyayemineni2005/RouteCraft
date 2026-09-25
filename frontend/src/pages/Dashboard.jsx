import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Clock, 
  Bookmark, 
  Sparkles, 
  Compass, 
  ArrowRight, 
  TrendingUp, 
  Award,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTripsApi } from '../services/api';
import { formatDuration } from '../components/TimeBudget';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const res = await getTripsApi();
        setTrips(res.data || []);
      } catch (err) {
        console.warn('Dashboard data fetch note:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const totalKilometers = trips.reduce((acc, t) => acc + (t.totalDistanceKm || 0), 0);
  const totalStopsPlanned = trips.reduce((acc, t) => acc + (t.stops?.length || 0), 0);
  const totalHoursPlanned = Math.round(
    trips.reduce((acc, t) => acc + (t.totalDurationMinutes || 0), 0) / 60
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-sky-500/30">
            {(user?.name || 'Explorer')[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Member
              </span>
              <span className="text-xs text-slate-400">RouteCraft Explorer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Roadtripper'}!
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {user?.email || 'Logged in to RouteCraft studio'}
            </p>
          </div>
        </div>

        <Link
          to="/planner"
          className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 flex items-center gap-2 transition-all hover:scale-105 shrink-0"
        >
          <Compass className="w-4 h-4" />
          <span>Launch Route Studio</span>
        </Link>
      </div>

      {/* Overview Analytics Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Trips</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white">{trips.length}</h3>
          <span className="text-[11px] text-slate-500">Custom routes crafted</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Distance</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white">{totalKilometers} <span className="text-sm font-normal text-slate-400">km</span></h3>
          <span className="text-[11px] text-slate-500">Highway corridors charted</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Pitstops Discovered</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white">{totalStopsPlanned}</h3>
          <span className="text-[11px] text-slate-500">Cafes, viewpoints & heritage</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Travel Hours</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white">{totalHoursPlanned} <span className="text-sm font-normal text-slate-400">hrs</span></h3>
          <span className="text-[11px] text-slate-500">Time-budget optimized</span>
        </div>
      </div>

      {/* Recent Trips & Quick Planner Corridors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Trips Section */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-sky-400" />
              Recent Itineraries
            </h3>
            <Link to="/trips" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
              View All ({trips.length})
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {trips.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 text-slate-400 text-xs">
              You haven't saved any trips yet. Use the Route Planner to start your first micro-trip!
            </div>
          ) : (
            <div className="space-y-3">
              {trips.slice(0, 4).map((trip) => (
                <div
                  key={trip._id}
                  onClick={() => {
                    const s = trip.startLocation?.name || 'Origin';
                    const d = trip.endLocation?.name || 'Destination';
                    navigate(`/planner?start=${encodeURIComponent(s)}&dest=${encodeURIComponent(d)}`);
                  }}
                  className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                      {trip.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {trip.stops?.length || 0} pitstops • {trip.totalDistanceKm || 0} km • {formatDuration(trip.totalDurationMinutes)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-sky-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Launch Recommendations */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            Quick Corridors
          </h3>

          <div className="space-y-3">
            {[
              { start: 'Vijayawada', dest: 'Hyderabad', tag: 'NH65 Food & River' },
              { start: 'Bangalore', dest: 'Mysore', tag: 'Vada & Bird Sanctuary' },
              { start: 'Mumbai', dest: 'Pune', tag: 'Ghats & Viewpoints' },
            ].map((route) => (
              <div
                key={route.start + route.dest}
                onClick={() => navigate(`/planner?start=${route.start}&dest=${route.dest}`)}
                className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                    {route.start} ➔ {route.dest}
                  </h4>
                  <span className="text-xs text-slate-400">{route.tag}</span>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-slate-800 group-hover:bg-sky-600 text-slate-300 group-hover:text-white text-xs font-semibold transition-colors">
                  Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

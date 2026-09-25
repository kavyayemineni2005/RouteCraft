import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Coffee, 
  Utensils, 
  Trees, 
  Eye, 
  ShieldCheck, 
  Sliders, 
  Zap,
  Navigation,
  CheckCircle2,
  Car
} from 'lucide-react';

const POPULAR_CORRIDORS = [
  {
    title: 'Vijayawada ➔ Hyderabad',
    route: 'NH 65 Corridor',
    start: 'Vijayawada',
    dest: 'Hyderabad',
    defaultBudget: '5h',
    badge: 'Popular',
    bgGradient: 'from-sky-900/40 to-indigo-950/60',
    stops: ['Suryapet Food Court', 'Mattapalli Krishna River', 'Pochampally Ikat Village'],
  },
  {
    title: 'Bangalore ➔ Mysore',
    route: 'Expressway & Heritage',
    start: 'Bangalore',
    dest: 'Mysore',
    defaultBudget: '4h 30m',
    badge: 'Scenic',
    bgGradient: 'from-emerald-950/40 to-teal-950/60',
    stops: ['Maddur Vada Station', 'Ranganathittu Birds', 'Srirangapatna Heritage'],
  },
  {
    title: 'Mumbai ➔ Pune',
    route: 'Ghats & Viewpoints',
    start: 'Mumbai',
    dest: 'Pune',
    defaultBudget: '4h',
    badge: 'Express',
    bgGradient: 'from-purple-950/40 to-slate-900/80',
    stops: ['Lonavala Chikki Hub', 'Tiger Point Ghat', 'Karla Ancient Caves'],
  },
  {
    title: 'Delhi ➔ Agra',
    route: 'Yamuna Expressway',
    start: 'Delhi',
    dest: 'Agra',
    defaultBudget: '4h',
    badge: 'Heritage',
    bgGradient: 'from-amber-950/40 to-slate-900/80',
    stops: ['Highway Masala Chai', 'Mathura Heritage Ghats', 'Sikandra Tomb'],
  },
];

const FEATURES = [
  {
    icon: Clock,
    title: 'Strict Time-Budget Engine',
    desc: 'Set your total available travel window (e.g. 5 hours). RouteCraft guarantees your driving time + pitstop stays never overrun your schedule.',
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  },
  {
    icon: Sliders,
    title: 'Precision Detour Thresholds',
    desc: 'Filter stops by max detour tolerance (5 min, 15 min, 30 min). Avoid getting pulled miles off your highway line.',
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  },
  {
    icon: Sparkles,
    title: 'Curated Multi-Category Pitstops',
    desc: 'Discover authentic highway diners, artisan coffee roasters, serene riverbanks, and historical landmarks verified by travelers.',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    icon: Zap,
    title: 'Dynamic Waypoint Reordering',
    desc: 'Reorganize your trip itinerary on the fly. Watch total driving durations and arrival estimates adjust in real-time.',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [startQuery, setStartQuery] = useState('Vijayawada');
  const [destQuery, setDestQuery] = useState('Hyderabad');
  const [budgetHours, setBudgetHours] = useState(6);

  const handleLaunchPlanner = (e) => {
    e.preventDefault();
    if (!startQuery.trim() || !destQuery.trim()) return;
    navigate(`/planner?start=${encodeURIComponent(startQuery.trim())}&dest=${encodeURIComponent(destQuery.trim())}&budget=${budgetHours * 60}`);
  };

  const handleCorridorClick = (corridor) => {
    navigate(`/planner?start=${encodeURIComponent(corridor.start)}&dest=${encodeURIComponent(corridor.dest)}`);
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/15 blur-3xl rounded-full pointer-events-none -z-10"></div>
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-indigo-500/15 blur-3xl rounded-full pointer-events-none -z-10"></div>

        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-sky-400 text-xs font-semibold shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Time-Budget Micro-Trip Generator</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Master Your Travel Time. <br />
            <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Discover Hidden Pitstops.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Turn ordinary highway drives into unforgettable mini-adventures. 
            Specify your origin, destination, and available time—RouteCraft builds 
            the perfect itinerary within your exact schedule.
          </p>

          {/* Quick Route Planner Bar */}
          <div className="mt-8 pt-4">
            <form 
              onSubmit={handleLaunchPlanner}
              className="bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-3xl shadow-2xl backdrop-blur-md max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-left"
            >
              {/* Origin */}
              <div className="sm:col-span-4 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Start Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vijayawada, Bangalore"
                  value={startQuery}
                  onChange={(e) => setStartQuery(e.target.value)}
                  className="w-full bg-transparent text-white font-medium text-sm focus:outline-none placeholder-slate-500"
                />
              </div>

              {/* Destination */}
              <div className="sm:col-span-4 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <label className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  Destination
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyderabad, Mysore"
                  value={destQuery}
                  onChange={(e) => setDestQuery(e.target.value)}
                  className="w-full bg-transparent text-white font-medium text-sm focus:outline-none placeholder-slate-500"
                />
              </div>

              {/* Time Budget Selector */}
              <div className="sm:col-span-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <label className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-400" />
                  Time Budget
                </label>
                <select
                  value={budgetHours}
                  onChange={(e) => setBudgetHours(Number(e.target.value))}
                  className="w-full bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer"
                >
                  <option value={3} className="bg-slate-900 text-white">3 Hours</option>
                  <option value={4} className="bg-slate-900 text-white">4 Hours</option>
                  <option value={5} className="bg-slate-900 text-white">5 Hours</option>
                  <option value={6} className="bg-slate-900 text-white">6 Hours</option>
                  <option value={8} className="bg-slate-900 text-white">8 Hours</option>
                  <option value={10} className="bg-slate-900 text-white">10 Hours</option>
                </select>
              </div>

              {/* Submit CTA */}
              <div className="sm:col-span-2 h-full flex">
                <button
                  type="submit"
                  className="w-full h-full min-h-[50px] bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 group transition-all hover:scale-[1.02]"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Corridors Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
              <Navigation className="w-4 h-4 text-sky-400" />
              Pre-Configured Road Trips
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Popular Travel Corridors
            </h2>
          </div>
          <Link
            to="/planner"
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 group"
          >
            Custom Route Planner 
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {POPULAR_CORRIDORS.map((corridor) => (
            <div
              key={corridor.title}
              onClick={() => handleCorridorClick(corridor)}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {corridor.badge}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {corridor.defaultBudget}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors mb-1">
                  {corridor.title}
                </h3>
                <p className="text-xs text-slate-400 mb-4">{corridor.route}</p>

                {/* Corridor Stops Preview */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Featured Pitstops:
                  </span>
                  {corridor.stops.map((stop, i) => (
                    <div key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      <span className="truncate">{stop}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-sky-400 group-hover:text-sky-300">
                <span>Launch Itinerary</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            Why Roadtrippers Love RouteCraft
          </h2>
          <p className="text-slate-400 text-sm">
            Everything you need for effortless, spontaneous highway explorations without the anxiety of running late.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl relative overflow-hidden"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-4 ${feat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ready to Drive CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-sky-950 via-indigo-950 to-slate-900 border border-sky-800/40 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready for your next weekend drive?
            </h2>
            <p className="text-sm text-slate-300">
              Pick your route, tweak your time budget, and craft unforgettable memories along the journey.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/planner"
                className="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-xl shadow-sky-500/25 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Compass className="w-4 h-4" />
                Open Route Planner
              </Link>
              <Link
                to="/trips"
                className="px-6 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors"
              >
                Browse Saved Trips
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

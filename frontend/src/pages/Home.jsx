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
  Car,
  Bike,
  IndianRupee,
  Layers,
  GripVertical,
  Star,
  ChevronRight
} from 'lucide-react';
import Hero3DVisual from '../components/Hero3DVisual';

const POPULAR_CORRIDORS = [
  {
    title: 'Vijayawada ➔ Hyderabad',
    route: 'NH 65 Food & Heritage Corridor',
    start: 'Vijayawada',
    dest: 'Hyderabad',
    defaultBudget: 360,
    vehicle: 'car',
    badge: 'Popular',
    stops: ['Suryapet Food Court', 'Mattapalli Krishna River', 'Pochampally Ikat Village'],
  },
  {
    title: 'Bangalore ➔ Mysore',
    route: 'Expressway & Bird Sanctuary',
    start: 'Bangalore',
    dest: 'Mysore',
    defaultBudget: 270,
    vehicle: 'bike',
    badge: 'Scenic Tour',
    stops: ['Maddur Vada Station', 'Ranganathittu Birds', 'Srirangapatna Heritage'],
  },
  {
    title: 'Mumbai ➔ Pune',
    route: 'Ghats & Sunset Viewpoints',
    start: 'Mumbai',
    dest: 'Pune',
    defaultBudget: 240,
    vehicle: 'car',
    badge: 'Expressway',
    stops: ['Lonavala Chikki Hub', 'Tiger Point Ghat', 'Karla Ancient Caves'],
  },
  {
    title: 'Delhi ➔ Agra',
    route: 'Yamuna Expressway & Heritage',
    start: 'Delhi',
    dest: 'Agra',
    defaultBudget: 240,
    vehicle: 'car',
    badge: 'Heritage',
    stops: ['Highway Masala Chai', 'Mathura Heritage Ghats', 'Sikandra Tomb'],
  },
];

const CAPABILITIES = [
  {
    title: '1. Smart Routes',
    desc: 'Dynamic real-time OpenStreetMap routing via OSRM with instant turn geometry, distance calculation, and elevation profile.',
    icon: Navigation,
    color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
  },
  {
    title: '2. Curated Pitstops',
    desc: 'Locate top highway diners, artisan coffee stops, serene waterfalls, viewpoints, and fuel hubs within your exact detour limit.',
    icon: Sparkles,
    color: 'from-amber-500/20 to-yellow-500/10 text-amber-400 border-amber-500/30',
  },
  {
    title: '3. Time Budget',
    desc: 'Never overshoot your schedule. Set an available time window and monitor real-time driving time, pitstop stays, and buffer time.',
    icon: Clock,
    color: 'from-teal-500/20 to-emerald-500/10 text-teal-400 border-teal-500/30',
  },
  {
    title: '4. Trip Budget',
    desc: 'Real-time expense estimation breakdown covering vehicle fuel, highway tolls, meal expenses, entry tickets, and parking costs.',
    icon: IndianRupee,
    color: 'from-orange-500/20 to-amber-500/10 text-orange-400 border-orange-500/30',
  },
  {
    title: '5. Car & Bike Planning',
    desc: 'Optimized highway profiles for both 4-wheelers (tolls + expressways) and 2-wheelers (mileage + zero-toll corridors).',
    icon: Bike,
    color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30',
  },
  {
    title: '6. Drag & Drop Route Planning',
    desc: 'Fluid interactive itinerary timeline reordering with @dnd-kit. Instantly recalculate route driving times as you swap stops.',
    icon: Layers,
    color: 'from-emerald-500/20 to-amber-500/10 text-emerald-400 border-emerald-500/30',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [startQuery, setStartQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [totalBudget, setTotalBudget] = useState(5000);

  const handleLaunchPlanner = (e) => {
    e.preventDefault();
    if (!startQuery.trim() || !destQuery.trim()) {
      navigate('/create');
      return;
    }
    navigate(`/planner?start=${encodeURIComponent(startQuery.trim())}&dest=${encodeURIComponent(destQuery.trim())}&vehicle=${vehicleType}&totalBudget=${totalBudget}`);
  };

  const handleCorridorClick = (corridor) => {
    navigate(`/planner?start=${encodeURIComponent(corridor.start)}&dest=${encodeURIComponent(corridor.dest)}&vehicle=${corridor.vehicle}&budget=${corridor.defaultBudget}&totalBudget=4500`);
  };

  return (
    <div className="space-y-24 pb-20 bg-black min-h-screen text-zinc-100">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-10 md:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none -z-10"></div>
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full pointer-events-none -z-10"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Content (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Travel-Tech Itinerary Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Plan the Route. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                Discover the Stops.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-xl leading-relaxed">
              Build smarter road trips with routes, pitstops, time budgets and trip budgets — all in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to="/create"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>Plan My Trip</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#features"
                className="px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 text-sm font-bold transition-colors"
              >
                Explore RouteCraft
              </a>
            </div>

            {/* Quick Interactive Search Box */}
            <div className="pt-4 max-w-lg">
              <form onSubmit={handleLaunchPlanner} className="p-2.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-2xl backdrop-blur-md space-y-2">
                <div className="flex items-center gap-2 px-2 pt-1">
                  <div className="flex items-center gap-1.5 bg-black p-1 rounded-xl border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setVehicleType('car')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        vehicleType === 'car' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      🚗 Car
                    </button>
                    <button
                      type="button"
                      onClick={() => setVehicleType('bike')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        vehicleType === 'bike' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      🏍️ Bike
                    </button>
                  </div>
                  <span className="text-[11px] text-zinc-500 ml-auto">Quick Route Builder</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Start Location"
                      value={startQuery}
                      onChange={(e) => setStartQuery(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Destination"
                      value={destQuery}
                      onChange={(e) => setDestQuery(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Launch Route Studio</span>
                </button>
              </form>
            </div>

          </div>

          {/* Right 3D Visual (5 Cols) */}
          <div className="lg:col-span-5">
            <Hero3DVisual />
          </div>

        </div>
      </section>

      {/* 2. CAPABILITIES & FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built For Intelligent Travel</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Six Intelligent Pillars of RouteCraft
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Engineered from the ground up for modern roadtrippers who value both their time and budget.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAPABILITIES.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="bg-zinc-950/80 hover:bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1 shadow-xl relative overflow-hidden group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cap.color} border flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{cap.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. POPULAR CORRIDORS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
              Popular Highway Corridors
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Curated Road-Trip Templates
            </h2>
          </div>
          <Link
            to="/create"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            Custom Corridor Builder
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {POPULAR_CORRIDORS.map((corridor, idx) => (
            <div
              key={idx}
              onClick={() => handleCorridorClick(corridor)}
              className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-5 rounded-3xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {corridor.badge}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {corridor.vehicle === 'bike' ? '🏍️ Tour' : '🚗 Drive'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors mb-1">
                  {corridor.title}
                </h3>
                <p className="text-xs text-zinc-400 mb-4">{corridor.route}</p>

                <div className="space-y-1.5 text-xs text-zinc-400 bg-black p-3 rounded-2xl border border-zinc-800/80 mb-4">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Featured Pitstops:
                  </span>
                  {corridor.stops.map((stop, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2 truncate text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span className="truncate">{stop}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                <span className="text-zinc-500">Launch Itinerary</span>
                <div className="flex items-center gap-1 text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BOTTOM CTA BANNER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="absolute top-0 right-1/3 w-72 h-72 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black border border-zinc-800 text-amber-300 text-xs font-semibold">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Ready to Hit the Highway?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Stop Guessing. <br />
            <span className="bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent">
              Start Crafting Your Trip.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
            Join thousands of travelers who plan precise road-trips with curated pitstops, budget controls, and seamless timeline management.
          </p>

          <div>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm shadow-xl shadow-emerald-500/30 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Plan My Trip Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;

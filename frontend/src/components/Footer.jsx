import React from 'react';
import { Compass, Heart, MapPin, Sparkles, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                RouteCraft
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              The time-optimized multi-stop micro-trip generator. Discover curated highway cafes, scenic viewpoints, and heritage attractions strictly within your time budget.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Route Optimization Engine Active
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/planner" className="hover:text-sky-400 transition-colors">
                  Route Planner
                </Link>
              </li>
              <li>
                <Link to="/trips" className="hover:text-sky-400 transition-colors">
                  My Saved Trips
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-sky-400 transition-colors">
                  User Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Corridors */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Popular Routes
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/planner?start=Vijayawada&dest=Hyderabad" className="hover:text-sky-400 transition-colors flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-sky-400" />
                  Vijayawada ➔ Hyderabad
                </Link>
              </li>
              <li>
                <Link to="/planner?start=Bangalore&dest=Mysore" className="hover:text-sky-400 transition-colors flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-sky-400" />
                  Bangalore ➔ Mysore
                </Link>
              </li>
              <li>
                <Link to="/planner?start=Mumbai&dest=Pune" className="hover:text-sky-400 transition-colors flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-sky-400" />
                  Mumbai ➔ Pune
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} RouteCraft. Built for explorers and micro-travelers.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Powered by OpenStreetMap & OSRM Routing</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

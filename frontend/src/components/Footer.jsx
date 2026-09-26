import React from 'react';
import { Compass, Heart, MapPin, Sparkles, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-zinc-800 text-zinc-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center text-black shadow-md shadow-orange-500/20 border border-amber-300/30 font-bold">
                <Compass className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-black text-white tracking-tight bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                RouteCraft
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              "Plan the route. Discover the stops." RouteCraft is a smart road-trip and route-planning application with real-time OpenStreetMap navigation, time budgets, and dynamic expense tracking.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>OpenStreetMap & OSRM Engine Active</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/create" className="hover:text-emerald-300 transition-colors">
                  Plan Trip
                </Link>
              </li>
              <li>
                <Link to="/planner" className="hover:text-emerald-300 transition-colors">
                  Route Studio
                </Link>
              </li>
              <li>
                <Link to="/trips" className="hover:text-emerald-300 transition-colors">
                  My Saved Trips
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-300 transition-colors">
                  Explorer Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Corridors */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
              Corridor Templates
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/planner?start=Vijayawada&dest=Hyderabad&vehicle=car" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-emerald-400" />
                  Vijayawada ➔ Hyderabad
                </Link>
              </li>
              <li>
                <Link to="/planner?start=Bangalore&dest=Mysore&vehicle=bike" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-emerald-400" />
                  Bangalore ➔ Mysore
                </Link>
              </li>
              <li>
                <Link to="/planner?start=Mumbai&dest=Pune&vehicle=car" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-amber-400" />
                  Mumbai ➔ Pune (Ghats)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} RouteCraft. All rights reserved.</p>
          <div className="flex items-center gap-1 text-zinc-400">
            <span>Powered by React, Leaflet, Node.js & MongoDB Atlas</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

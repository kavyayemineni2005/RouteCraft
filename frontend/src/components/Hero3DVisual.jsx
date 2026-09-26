import React, { useState } from 'react';
import { 
  Sparkles, 
  Navigation, 
  MapPin, 
  Clock, 
  IndianRupee, 
  ShieldCheck, 
  Compass,
  Zap,
  Coffee,
  Fuel,
  Utensils,
  Eye,
  Activity
} from 'lucide-react';
import heroImage from '../assets/routecraft_hero.jpg';

const Hero3DVisual = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative w-full max-w-lg mx-auto group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-75 transition-all duration-700 animate-pulse pointer-events-none"></div>

      {/* Main Glassmorphic Hero Container */}
      <div className="relative bg-zinc-950/90 border border-zinc-700/60 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-2xl transition-transform duration-500 group-hover:scale-[1.015]">
        
        {/* Top Header Bar with Project Title & Live Status */}
        <div className="p-4 px-6 bg-black/80 border-b border-zinc-800/80 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 p-0.5 shadow-lg shadow-emerald-500/30 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-black transform rotate-45 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wider text-white flex items-center gap-1.5">
                <span>RouteCraft</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  v2.0
                </span>
              </h3>
              <p className="text-[10px] text-zinc-400 font-medium">
                Multi-Stop Travel & Pitstop Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-emerald-400">Live Routing</span>
          </div>
        </div>

        {/* Animated Artwork Showcase Box */}
        <div className="relative aspect-square w-full overflow-hidden bg-zinc-900">
          <img
            src={heroImage}
            alt="RouteCraft Smart Road Trip Navigation Corridor"
            className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
            loading="eager"
          />

          {/* Vignette & Contrast Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/25 pointer-events-none"></div>

          {/* Floating Widget 1: Realtime Pitstop Alert (Top Left) */}
          <div className="absolute top-4 left-4 z-10 bg-zinc-950/85 backdrop-blur-md border border-zinc-700/70 p-2.5 px-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce duration-1000">
            <div className="p-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Utensils className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                Pitstop 1 Detected
              </p>
              <p className="text-xs font-bold text-white">Highway Dhaba & Cafe</p>
            </div>
          </div>

          {/* Floating Widget 2: Time & Fuel Metric (Top Right) */}
          <div className="absolute top-4 right-4 z-10 bg-zinc-950/85 backdrop-blur-md border border-zinc-700/70 p-2.5 px-3.5 rounded-2xl shadow-xl flex items-center gap-2 text-right">
            <div>
              <p className="text-[10px] font-bold text-emerald-400">Time Budget Safe</p>
              <p className="text-xs font-black text-white">4h 15m / 6h</p>
            </div>
            <div className="p-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Centered RouteCraft Holographic Title Overlay (Reveals subtly on hover) */}
          <div className="absolute bottom-16 left-6 right-6 z-10 p-3 rounded-2xl bg-black/80 backdrop-blur-lg border border-zinc-800/90 shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-black flex items-center justify-center font-black text-sm shadow-lg">
                RC
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">
                  Intelligent Highway Corridors
                </h4>
                <p className="text-[10px] text-zinc-400">
                  Numbered stops • Live road traffic • Budget calculation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-xl text-emerald-400 text-[10px] font-bold">
              <Sparkles className="w-3 h-3" />
              <span>Optimized</span>
            </div>
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800/80 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-black/60 p-2.5 rounded-2xl border border-zinc-800/80 flex flex-col items-center">
            <span className="text-[10px] text-zinc-400 font-medium">Curated Stops</span>
            <strong className="text-amber-400 font-black text-sm mt-0.5">100% Verified</strong>
          </div>

          <div className="bg-black/60 p-2.5 rounded-2xl border border-zinc-800/80 flex flex-col items-center">
            <span className="text-[10px] text-zinc-400 font-medium">Routing Engine</span>
            <strong className="text-emerald-400 font-black text-sm mt-0.5">TomTom / OSM</strong>
          </div>

          <div className="bg-black/60 p-2.5 rounded-2xl border border-zinc-800/80 flex flex-col items-center">
            <span className="text-[10px] text-zinc-400 font-medium">Expense Budget</span>
            <strong className="text-cyan-400 font-black text-sm mt-0.5">₹ Dynamic</strong>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero3DVisual;

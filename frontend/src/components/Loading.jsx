import React from 'react';
import { Compass, Car, Sparkles } from 'lucide-react';

const Loading = ({ message = 'Calculating optimal route...', subtext = 'Discovering pitstops within your time budget...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="relative mb-6">
        {/* Glowing backdrop */}
        <div className="absolute inset-0 bg-sky-500/20 blur-xl rounded-full scale-150 animate-pulse"></div>
        
        {/* Animated icon ring */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
          <Car className="w-8 h-8 text-white animate-bounce" />
        </div>

        <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-slate-700 p-1.5 rounded-full text-amber-400">
          <Sparkles className="w-4 h-4 animate-spin" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white tracking-wide mb-1">
        {message}
      </h3>
      <p className="text-sm text-slate-400 max-w-sm">
        {subtext}
      </p>

      {/* Animated progress bar indicator */}
      <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-5 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 animate-pulse"></div>
      </div>
    </div>
  );
};

export default Loading;

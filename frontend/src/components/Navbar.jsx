import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  MapPin, 
  Clock, 
  User, 
  LogOut, 
  Menu, 
  X, 
  PlusCircle, 
  BookmarkCheck,
  ChevronDown,
  Navigation,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300 border border-amber-300/40">
              <Compass className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                RouteCraft
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-amber-300 border border-amber-500/30">
                Plan the route. Discover the stops.
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1.5">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                isActive('/') 
                  ? 'text-emerald-400 bg-zinc-900 border border-zinc-800 shadow-sm' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              Home
            </Link>

            <Link
              to="/create"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                isActive('/create') 
                  ? 'text-emerald-400 bg-zinc-900 border border-zinc-800 shadow-sm' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Plan Trip</span>
            </Link>

            <Link
              to="/planner"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                isActive('/planner') 
                  ? 'text-emerald-400 bg-zinc-900 border border-zinc-800 shadow-sm' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>Route Studio</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    isActive('/dashboard') 
                      ? 'text-emerald-400 bg-zinc-900 border border-zinc-800 shadow-sm' 
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/trips"
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    isActive('/trips') 
                      ? 'text-emerald-400 bg-zinc-900 border border-zinc-800 shadow-sm' 
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>My Trips</span>
                </Link>
              </>
            )}
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-xs font-bold text-zinc-200 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-500 text-black flex items-center justify-center text-xs font-black">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.name || 'Explorer'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-zinc-800">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-bold text-white truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/create"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-emerald-300 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Plan New Trip
                    </Link>

                    <Link
                      to="/trips"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-amber-300 transition-colors"
                    >
                      <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                      My Saved Routes
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      User Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-950/40 transition-colors text-left border-t border-zinc-800 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black border-b border-zinc-800 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-zinc-300 hover:bg-zinc-900"
          >
            Home
          </Link>
          <Link
            to="/create"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-emerald-400 hover:bg-zinc-900"
          >
            Plan Trip
          </Link>
          <Link
            to="/planner"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-amber-400 hover:bg-zinc-900"
          >
            Route Studio
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-zinc-300 hover:bg-zinc-900"
              >
                Dashboard
              </Link>
              <Link
                to="/trips"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-zinc-300 hover:bg-zinc-900"
              >
                My Trips
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-zinc-300 hover:bg-zinc-900"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-950/40"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-zinc-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-200 bg-zinc-900"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-500 text-black"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

import { useState } from 'react';
import { Film, LogOut, Menu, ShieldCheck, Ticket, User, X } from 'lucide-react';
import type { AppView, UserProfile } from '../types.ts';

interface NavbarProps {
  currentView: AppView;
  user: UserProfile | null;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
}

export function Navbar({ currentView, user, onNavigate, onLogout }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { label: string; view: AppView }[] = [
    { label: 'Home', view: 'home' },
    { label: 'Movies', view: 'movies' },
    { label: 'Theatres', view: 'theatres' },
    { label: 'My Bookings', view: 'my-bookings' },
    { label: 'Admin', view: 'admin' },
  ];

  const handleNav = (view: AppView) => {
    setMobileOpen(false);
    onNavigate(view);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#060913]/95 backdrop-blur-md border-b border-white/10 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="inline-flex items-center gap-2.5 text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-md"
        >
          <Film className="w-5 h-5 text-rose-500" />
          <span>CineVault</span>
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary Navigation">
          {navItems.map((item) => {
            const isActive =
              currentView === item.view ||
              (item.view === 'movies' && (currentView === 'movie-detail' || currentView === 'seat-selection' || currentView === 'payment'));
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => handleNav(item.view)}
                className={`relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute left-0 right-0 -bottom-[1.15rem] h-0.5 bg-rose-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action / Account Control */}
        <div className="hidden md:flex items-center shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleNav('profile')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#11192C] hover:bg-[#17223B] border border-white/10 text-sm font-medium text-slate-100 whitespace-nowrap shrink-0 transition-colors"
              >
                {user.role === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                ) : (
                  <User className="w-4 h-4 text-rose-400" />
                )}
                <span className="max-w-[140px] truncate">{user.name}</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                title="Sign Out"
                aria-label="Sign Out"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleNav('auth')}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle Menu"
          className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0A0F1D] px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.view}
              type="button"
              onClick={() => handleNav(item.view)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === item.view
                  ? 'bg-rose-600/15 text-rose-400'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-white/10">
            {user ? (
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleNav('profile')}
                  className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 text-sm font-medium text-white"
                >
                  <Ticket className="w-4 h-4 text-rose-400" />
                  <span className="truncate">{user.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onLogout();
                  }}
                  className="px-3 py-2.5 rounded-lg bg-white/5 text-sm font-medium text-slate-300 hover:text-white"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNav('auth')}
                className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

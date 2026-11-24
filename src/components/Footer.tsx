import { Film } from 'lucide-react';
import type { AppView } from '../types.ts';

interface FooterProps {
  onNavigate: (view: AppView, infoSection?: 'about' | 'contact' | 'help' | 'terms') => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-white/10 bg-[#050811] text-slate-400 no-print mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
          <div className="md:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-2 text-lg font-bold text-white">
              <Film className="w-5 h-5 text-rose-500" />
              <span>CineVault</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Modern cinema ticketing across premier IMAX, 4DX, and Dolby Atmos auditoriums. Browse showtimes, reserve exact seats atomically, and carry verified QR e-tickets.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('movies')}
                  className="hover:text-white transition-colors"
                >
                  Now Showing Movies
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('theatres')}
                  className="hover:text-white transition-colors"
                >
                  Partner Theatres
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('my-bookings')}
                  className="hover:text-white transition-colors"
                >
                  My Bookings
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className="hover:text-white transition-colors"
                >
                  Admin Console
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Support & Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('info', 'about')}
                  className="hover:text-white transition-colors"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('info', 'contact')}
                  className="hover:text-white transition-colors"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('info', 'help')}
                  className="hover:text-white transition-colors"
                >
                  Help
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('info', 'terms')}
                  className="hover:text-white transition-colors"
                >
                  Terms
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CineVault Ticketing Systems. All rights reserved.</p>
          <p>Simulated checkout environment for academic demonstration and architecture validation.</p>
        </div>
      </div>
    </footer>
  );
}

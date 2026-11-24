import { useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, Armchair, Lock, Sparkles } from 'lucide-react';
import type { Movie, Show, ShowSeatLock, Theatre, UserProfile } from '../types.ts';
import {
  MAX_SEATS_PER_BOOKING,
  SEAT_ROWS,
  SEATS_PER_ROW,
  calculateBookingTotals,
  formatCurrencyINR,
  getSeatPrice,
} from '../utils/cinema.ts';

interface SeatSelectionPageProps {
  movie: Movie;
  theatre: Theatre;
  show: Show;
  seatLocks: Record<string, ShowSeatLock>;
  selectedSeats: string[];
  user: UserProfile | null;
  onSeatsChange: (seats: string[]) => void;
  onProceedToPayment: () => void;
  onRequireAuth: () => void;
  onBack: () => void;
}

export function SeatSelectionPage({
  movie,
  theatre,
  show,
  seatLocks,
  selectedSeats,
  user,
  onSeatsChange,
  onProceedToPayment,
  onRequireAuth,
  onBack,
}: SeatSelectionPageProps) {
  const [limitWarning, setLimitWarning] = useState<string | null>(null);

  const totals = useMemo(() => calculateBookingTotals(show, selectedSeats), [show, selectedSeats]);

  const toggleSeat = (seatId: string) => {
    setLimitWarning(null);
    if (seatLocks[seatId]) return;

    if (selectedSeats.includes(seatId)) {
      onSeatsChange(selectedSeats.filter((s) => s !== seatId));
      return;
    }

    if (selectedSeats.length >= MAX_SEATS_PER_BOOKING) {
      setLimitWarning(`Maximum ${MAX_SEATS_PER_BOOKING} seats can be selected per booking.`);
      return;
    }

    const next = [...selectedSeats, seatId].sort((a, b) => {
      if (a[0] !== b[0]) return a[0].localeCompare(b[0]);
      return Number(a.slice(1)) - Number(b.slice(1));
    });
    onSeatsChange(next);
  };

  const tierGroups = useMemo(() => {
    return [
      {
        category: 'premium' as const,
        label: 'Premium Recliner',
        price: show.premiumPrice,
        rows: SEAT_ROWS.filter((r) => r.category === 'premium'),
      },
      {
        category: 'gold' as const,
        label: 'Gold Executive',
        price: show.goldPrice,
        rows: SEAT_ROWS.filter((r) => r.category === 'gold'),
      },
      {
        category: 'silver' as const,
        label: 'Silver Classic',
        price: show.silverPrice,
        rows: SEAT_ROWS.filter((r) => r.category === 'silver'),
      },
    ];
  }, [show]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Change Showtime
          </button>
          <h1 className="text-2xl font-bold text-white">{movie.title}</h1>
          <p className="text-sm text-slate-400">
            {theatre.name} · {show.screenName} · {show.showDate} at {show.showTime} · {show.format}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-4 rounded border border-emerald-500/60 bg-emerald-500/10 inline-block" />
            Available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-rose-600 border border-rose-400 inline-block" />
            Selected
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-slate-700/60 border border-slate-600 inline-block" />
            Booked
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/50 inline-block" />
            Blocked
          </span>
        </div>
      </div>

      {limitWarning && (
        <div
          role="alert"
          className="flex items-center gap-2.5 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{limitWarning}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Auditorium Seat Map */}
        <div className="bg-[#0E1525] border border-white/10 rounded-xl p-5 sm:p-8 space-y-8 overflow-x-auto">
          <div className="min-w-[540px] space-y-8">
            {/* Curved Screen Indicator */}
            <div className="flex flex-col items-center space-y-2 pb-2">
              <div className="w-4/5 h-3 rounded-t-full border-t-4 border-rose-500/70 bg-gradient-to-b from-rose-500/20 to-transparent" />
              <span className="text-[11px] font-medium tracking-widest text-slate-400">
                ALL EYES THIS WAY — CINEMA SCREEN
              </span>
            </div>

            {/* Seat Rows grouped by Tier (Silver closest to screen or Premium at rear) */}
            <div className="space-y-6">
              {[...tierGroups].reverse().map((tier) => (
                <div key={tier.category} className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      {tier.category === 'premium' && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                      {tier.label}
                    </span>
                    <span className="text-xs font-mono-tabular text-slate-300">
                      {formatCurrencyINR(tier.price)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {tier.rows.map((rowDef) => (
                      <div key={rowDef.row} className="flex items-center justify-center gap-2">
                        <span className="w-6 text-xs font-mono-tabular font-semibold text-slate-400 text-right mr-2">
                          {rowDef.row}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: SEATS_PER_ROW }, (_, idx) => {
                            const col = idx + 1;
                            const seatId = `${rowDef.row}${col}`;
                            const lock = seatLocks[seatId];
                            const isBooked = lock?.status === 'booked';
                            const isBlocked = lock?.status === 'blocked';
                            const isSelected = selectedSeats.includes(seatId);

                            let btnClasses =
                              'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/25 hover:border-emerald-400';
                            if (isBooked) {
                              btnClasses =
                                'border-slate-700 bg-slate-800/80 text-slate-600 cursor-not-allowed';
                            } else if (isBlocked) {
                              btnClasses =
                                'border-amber-500/40 bg-amber-500/15 text-amber-500/60 cursor-not-allowed';
                            } else if (isSelected) {
                              btnClasses =
                                'border-rose-400 bg-rose-600 text-white shadow-sm shadow-rose-600/40';
                            }

                            return (
                              <div key={seatId} className={col === 6 ? 'ml-5' : ''}>
                                <button
                                  type="button"
                                  disabled={isBooked || isBlocked}
                                  onClick={() => toggleSeat(seatId)}
                                  aria-label={`Seat ${seatId} ${tier.label} ${formatCurrencyINR(tier.price)} ${isBooked ? 'Booked' : isBlocked ? 'Blocked' : isSelected ? 'Selected' : 'Available'}`}
                                  title={`${seatId} · ${tier.label} · ${formatCurrencyINR(tier.price)}`}
                                  className={`w-9 h-9 rounded-md border text-[11px] font-mono-tabular font-medium flex items-center justify-center transition-colors ${btnClasses}`}
                                >
                                  {isBooked || isBlocked ? <Lock className="w-3 h-3" /> : col}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <span className="w-6 text-xs font-mono-tabular font-semibold text-slate-400 text-left ml-2">
                          {rowDef.row}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Booking Summary Panel */}
        <aside className="bg-[#0E1525] border border-white/10 rounded-xl p-6 space-y-6 lg:sticky lg:top-24">
          <div className="space-y-1 border-b border-white/10 pb-4">
            <h2 className="text-lg font-semibold text-white">Booking Summary</h2>
            <p className="text-xs text-slate-400">
              Select up to {MAX_SEATS_PER_BOOKING} seats. Prices update live.
            </p>
          </div>

          {selectedSeats.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Armchair className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">Tap any available seat on the map to select.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-400 mb-1.5">Selected Seats ({totals.ticketCount})</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSeats.map((seatId) => {
                    const info = getSeatPrice(show, seatId);
                    return (
                      <button
                        key={seatId}
                        type="button"
                        onClick={() => toggleSeat(seatId)}
                        title="Click to deselect"
                        className="px-2.5 py-1 rounded bg-[#060913] border border-white/15 hover:border-rose-500 text-xs font-mono-tabular text-white transition-colors"
                      >
                        {seatId} · {formatCurrencyINR(info.price)} ×
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-white/10 text-sm">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Tickets ({totals.ticketCount})</span>
                  <span className="font-mono-tabular">{formatCurrencyINR(totals.ticketSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Convenience Fee & Taxes</span>
                  <span className="font-mono-tabular">{formatCurrencyINR(totals.convenienceFee)}</span>
                </div>
                <div className="flex items-center justify-between text-white font-semibold text-base pt-2.5 border-t border-white/10">
                  <span>Total Payable</span>
                  <span className="font-mono-tabular text-rose-400">{formatCurrencyINR(totals.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {user ? (
            <button
              type="button"
              disabled={selectedSeats.length === 0}
              onClick={onProceedToPayment}
              className="w-full py-3 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              Proceed to Payment
            </button>
          ) : (
            <div className="space-y-2.5">
              <button
                type="button"
                disabled={selectedSeats.length === 0}
                onClick={onRequireAuth}
                className="w-full py-3 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                Sign In to Continue Booking
              </button>
              <p className="text-[11px] text-slate-400 text-center">
                Login required before payment. Your selected seats will be kept ready.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

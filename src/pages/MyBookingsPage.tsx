import { useMemo, useState } from 'react';
import { Calendar, MapPin, Ticket, XCircle } from 'lucide-react';
import type { Booking, UserProfile } from '../types.ts';
import { formatCurrencyINR } from '../utils/cinema.ts';

interface MyBookingsPageProps {
  user: UserProfile | null;
  bookings: Booking[];
  onOpenTicket: (booking: Booking) => void;
  onCancelBooking: (booking: Booking) => Promise<void>;
  onRequireAuth: () => void;
  onBrowseMovies: () => void;
}

export function MyBookingsPage({
  user,
  bookings,
  onOpenTicket,
  onCancelBooking,
  onRequireAuth,
  onBrowseMovies,
}: MyBookingsPageProps) {
  const [tab, setTab] = useState<'upcoming' | 'previous'>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const todayIso = new Date().toISOString().slice(0, 10);

  const { upcoming, previous } = useMemo(() => {
    const up: Booking[] = [];
    const prev: Booking[] = [];
    for (const b of bookings) {
      if (b.booking_status === 'confirmed' && b.show_date >= todayIso) {
        up.push(b);
      } else {
        prev.push(b);
      }
    }
    return { upcoming: up, previous: prev };
  }, [bookings, todayIso]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-rose-600/15 text-rose-400 flex items-center justify-center mx-auto">
          <Ticket className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white">Sign In to View Your Bookings</h1>
        <p className="text-sm text-slate-400">
          Your booked e-tickets, QR verification codes, and booking history are protected under your account.
        </p>
        <button
          type="button"
          onClick={onRequireAuth}
          className="px-6 py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const displayed = tab === 'upcoming' ? upcoming : previous;

  const handleCancel = async (booking: Booking) => {
    setErrorMsg(null);
    setCancellingId(booking.booking_id);
    try {
      await onCancelBooking(booking);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">My Bookings</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage upcoming tickets, download QR passes, or review past orders
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-[#0E1525] border border-white/10 rounded-lg">
          <button
            type="button"
            onClick={() => setTab('upcoming')}
            className={`px-4 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              tab === 'upcoming' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Upcoming ({upcoming.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('previous')}
            className={`px-4 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              tab === 'previous' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Previous / Cancelled ({previous.length})
          </button>
        </div>
      </div>

      {errorMsg && (
        <div role="alert" className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/40 text-sm text-rose-300">
          {errorMsg}
        </div>
      )}

      {displayed.length === 0 ? (
        <div className="bg-[#0E1525] border border-white/10 rounded-xl p-12 text-center space-y-4">
          <Ticket className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">
              {tab === 'upcoming' ? 'No upcoming bookings yet' : 'No previous or cancelled bookings'}
            </h2>
            <p className="text-sm text-slate-400">
              Browse currently playing movies and reserve your seats in seconds.
            </p>
          </div>
          <button
            type="button"
            onClick={onBrowseMovies}
            className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold"
          >
            Explore Movies
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((b) => (
            <article
              key={b.booking_id}
              className="bg-[#0E1525] border border-white/10 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4 min-w-0">
                <img
                  src={b.movie_poster}
                  alt={b.movie_title}
                  referrerPolicy="no-referrer"
                  className="w-16 h-24 rounded-lg object-cover bg-slate-800 shrink-0"
                />
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular">
                    <span className="text-slate-400">{b.booking_id}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span
                      className={
                        b.booking_status === 'confirmed' ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'
                      }
                    >
                      Booking: {b.booking_status.toUpperCase()}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-300">Payment: {b.payment_status.toUpperCase()}</span>
                  </div>

                  <h2 className="text-lg font-bold text-white truncate">{b.movie_title}</h2>

                  <p className="text-xs text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{b.theatre_name} ({b.screen_name})</span>
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 tabular-nums">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{b.show_date} at {b.show_time}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular text-white font-medium">
                      Seats: {b.seat_numbers.join(', ')}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 w-full md:w-auto shrink-0">
                <div className="text-left md:text-right">
                  <div className="text-xs text-slate-400">Total Paid</div>
                  <div className="text-lg font-bold font-mono-tabular text-white">
                    {formatCurrencyINR(b.total_amount)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenTicket(b)}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold whitespace-nowrap transition-colors"
                  >
                    View / Download E-Ticket
                  </button>
                  {b.booking_status === 'confirmed' && (
                    <button
                      type="button"
                      disabled={cancellingId === b.booking_id}
                      onClick={() => void handleCancel(b)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-rose-600/15 border border-white/10 hover:border-rose-500/40 text-xs font-medium text-slate-300 hover:text-rose-300 whitespace-nowrap transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {cancellingId === b.booking_id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

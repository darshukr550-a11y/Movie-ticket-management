import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, Calendar, Clock, Film, MapPin, Play, Star, Users } from 'lucide-react';
import type { Movie, Show, Theatre } from '../types.ts';
import { CITIES, formatCurrencyINR, getUpcomingDates } from '../utils/cinema.ts';

interface MovieDetailPageProps {
  movie: Movie;
  theatres: Theatre[];
  shows: Show[];
  selectedCity: string;
  onCityChange: (city: string) => void;
  onSelectShow: (show: Show) => void;
  onBack: () => void;
}

export function MovieDetailPage({
  movie,
  theatres,
  shows,
  selectedCity,
  onCityChange,
  onSelectShow,
  onBack,
}: MovieDetailPageProps) {
  const dates = useMemo(() => getUpcomingDates(4), []);
  const [selectedDate, setSelectedDate] = useState(dates[0]?.iso || '');
  const [showTrailer, setShowTrailer] = useState(false);
  const showtimesRef = useRef<HTMLElement | null>(null);

  const theatreMap = useMemo(() => {
    const map = new Map<string, Theatre>();
    theatres.forEach((t) => map.set(t.theatre_id, t));
    return map;
  }, [theatres]);

  const matchingShowsByTheatre = useMemo(() => {
    const matching = shows.filter(
      (s) => s.movie_id === movie.movie_id && s.city === selectedCity && s.showDate === selectedDate
    );
    const grouped = new Map<string, Show[]>();
    matching.forEach((s) => {
      const list = grouped.get(s.theatre_id) || [];
      list.push(s);
      grouped.set(s.theatre_id, list);
    });
    return grouped;
  }, [shows, movie.movie_id, selectedCity, selectedDate]);

  const scrollToShowtimes = () => {
    showtimesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Movie Hero Backdrop */}
      <section className="relative border-b border-white/10 bg-[#0A0F1D]">
        <div className="absolute inset-0 overflow-hidden opacity-25 pointer-events-none">
          <img
            src={movie.bannerUrl || movie.posterUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-[#060913]/80 to-[#060913]/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Movies
          </button>

          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 items-start">
            {/* Poster */}
            <div className="aspect-[3/4] rounded-xl overflow-hidden border border-white/15 bg-[#0E1525] shadow-2xl max-w-[260px]">
              <img
                src={movie.posterUrl}
                alt={`${movie.title} poster`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Metadata & Actions */}
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300">
                <span className="text-rose-400 font-semibold">
                  {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                </span>
                <span aria-hidden="true">·</span>
                <span>{movie.certificate || 'UA'}</span>
                <span aria-hidden="true">·</span>
                <span>{movie.formats.join(' / ')}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight [text-wrap:balance]">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-200">
                <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  {movie.rating.toFixed(1)}/10
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{movie.genre}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{movie.language}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {movie.duration}
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Release: {movie.releaseDate}
                </span>
              </div>

              <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
                {movie.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {movie.status === 'now_showing' ? (
                  <button
                    type="button"
                    onClick={scrollToShowtimes}
                    className="px-6 py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors"
                  >
                    Book Tickets
                  </button>
                ) : (
                  <span className="px-5 py-3 rounded-lg bg-[#121B30] border border-white/10 text-slate-300 text-sm font-medium">
                    Bookings open on {movie.releaseDate}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setShowTrailer((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-medium transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {showTrailer ? 'Hide Trailer' : 'Watch Trailer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trailer Section */}
      {showTrailer && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0E1525] border border-white/10 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Official Theatrical Trailer</h2>
              <span className="text-xs text-slate-400">{movie.title}</span>
            </div>
            <div className="aspect-video bg-black">
              {movie.trailerUrl ? (
                <iframe
                  src={movie.trailerUrl}
                  title={`${movie.title} Trailer`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  Trailer preview unavailable.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Cast & Crew */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0E1525] border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-400" />
            Cast
          </h2>
          <ul className="space-y-2 text-sm text-slate-300">
            {movie.cast.map((member, i) => (
              <li key={i} className="py-1.5 border-b border-white/5 last:border-b-0">
                {member}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#0E1525] border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Film className="w-4 h-4 text-rose-400" />
            Crew & Production
          </h2>
          <ul className="space-y-2 text-sm text-slate-300">
            {movie.crew.map((member, i) => (
              <li key={i} className="py-1.5 border-b border-white/5 last:border-b-0">
                {member}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Available Theatres, Dates & Showtimes */}
      <section ref={showtimesRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Select Theatre & Showtime</h2>
            <p className="text-sm text-slate-400 mt-1">
              Choose your city, preferred date, and cinema hall to pick seats
            </p>
          </div>

          <div className="relative flex items-center">
            <MapPin className="w-4 h-4 text-rose-400 absolute left-3 pointer-events-none" />
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              aria-label="Select City for Showtimes"
              className="pl-9 pr-8 py-2.5 rounded-lg bg-[#0E1525] border border-white/10 text-sm font-medium text-white focus:outline-none focus:border-rose-500"
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {movie.status === 'coming_soon' ? (
          <div className="bg-[#0E1525] border border-white/10 rounded-xl p-8 text-center space-y-2">
            <p className="text-base font-semibold text-white">Upcoming Release</p>
            <p className="text-sm text-slate-400">
              Showtimes for {movie.title} will be published ahead of {movie.releaseDate}.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {dates.map((d) => (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => setSelectedDate(d.iso)}
                  className={`px-4 py-2 rounded-lg border text-left shrink-0 transition-colors ${
                    selectedDate === d.iso
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-[#0E1525] border-white/10 text-slate-300 hover:border-white/25'
                  }`}
                >
                  <div className="text-xs font-semibold">{d.dayLabel}</div>
                  <div className="text-[11px] opacity-80 tabular-nums">{d.dateLabel}</div>
                </button>
              ))}
            </div>

            {matchingShowsByTheatre.size === 0 ? (
              <div className="bg-[#0E1525] border border-white/10 rounded-xl p-8 text-center space-y-2">
                <p className="text-base font-semibold text-white">No showtimes on {selectedDate} in {selectedCity}</p>
                <p className="text-sm text-slate-400">
                  Try selecting another date tab or switching your city above.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from(matchingShowsByTheatre.entries()).map(([theatreId, tShows]) => {
                  const theatre = theatreMap.get(theatreId);
                  if (!theatre) return null;
                  return (
                    <div
                      key={theatreId}
                      className="bg-[#0E1525] border border-white/10 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                    >
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-white">{theatre.name}</h3>
                        <p className="text-xs text-slate-400">{theatre.address}</p>
                        <p className="text-xs text-slate-500 pt-1">{theatre.amenities.join(' · ')}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {tShows.map((show) => (
                          <button
                            key={show.show_id}
                            type="button"
                            onClick={() => onSelectShow(show)}
                            className="px-4 py-2.5 rounded-lg bg-[#060913] hover:bg-rose-600/15 border border-white/15 hover:border-rose-500 text-left transition-colors group"
                          >
                            <div className="text-sm font-semibold text-white group-hover:text-rose-300 tabular-nums">
                              {show.showTime}
                            </div>
                            <div className="text-[11px] text-slate-400 tabular-nums mt-0.5">
                              {show.format} · {show.screenName} · {formatCurrencyINR(show.silverPrice)}–{formatCurrencyINR(show.premiumPrice)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

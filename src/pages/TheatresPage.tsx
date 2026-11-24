import { useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, Monitor, Navigation } from 'lucide-react';
import { DistrictTalukFinder } from '../components/DistrictTalukFinder.tsx';
import type { TalukLocation } from '../data/karnatakaLocations.ts';
import type { Movie, Show, Theatre } from '../types.ts';
import { CITIES, formatCurrencyINR, getUpcomingDates } from '../utils/cinema.ts';

interface TheatresPageProps {
  theatres: Theatre[];
  movies: Movie[];
  shows: Show[];
  selectedCity: string;
  onCityChange: (city: string) => void;
  onSelectShow: (show: Show) => void;
  onSelectMovie: (movie: Movie) => void;
  onSelectTalukLocation: (loc: TalukLocation) => Promise<void> | void;
}

export function TheatresPage({
  theatres,
  movies,
  shows,
  selectedCity,
  onCityChange,
  onSelectShow,
  onSelectMovie,
  onSelectTalukLocation,
}: TheatresPageProps) {
  const dates = useMemo(() => getUpcomingDates(4), []);
  const [selectedDate, setSelectedDate] = useState(dates[0]?.iso || '');

  const cityOptions = useMemo(
    () => Array.from(new Set([...CITIES, selectedCity, ...theatres.map((t) => t.city)])),
    [theatres, selectedCity]
  );

  const cityTheatres = useMemo(
    () =>
      theatres.filter(
        (t) => t.city === selectedCity || t.taluk === selectedCity || t.district === selectedCity
      ),
    [theatres, selectedCity]
  );

  const movieMap = useMemo(() => {
    const map = new Map<string, Movie>();
    movies.forEach((m) => map.set(m.movie_id, m));
    return map;
  }, [movies]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Theatres & Showtimes</h1>
          <p className="text-sm text-slate-400 mt-1">
            Select a city, date, and cinema hall to pick your preferred showtime
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center">
            <MapPin className="w-4 h-4 text-rose-400 absolute left-3 pointer-events-none" />
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              aria-label="Filter theatres by city or taluk"
              className="pl-9 pr-8 py-2.5 rounded-lg bg-[#0E1525] border border-white/10 text-sm font-medium text-white focus:outline-none focus:border-rose-500"
            >
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Karnataka All 31 Districts & 237 Taluks Search */}
      <DistrictTalukFinder onSelectLocation={onSelectTalukLocation} />

      {/* Date Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Calendar className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
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

      {/* Theatre Cards */}
      {cityTheatres.length === 0 ? (
        <div className="bg-[#0E1525] border border-white/10 rounded-xl p-10 text-center text-slate-400">
          No theatres found in {selectedCity}. Choose another city above.
        </div>
      ) : (
        <div className="space-y-6">
          {cityTheatres.map((theatre) => {
            const theatreShows = shows.filter(
              (s) => s.theatre_id === theatre.theatre_id && s.showDate === selectedDate
            );
            const showsByMovie = new Map<string, Show[]>();
            theatreShows.forEach((s) => {
              const list = showsByMovie.get(s.movie_id) || [];
              list.push(s);
              showsByMovie.set(s.movie_id, list);
            });

            return (
              <section
                key={theatre.theatre_id}
                className="bg-[#0E1525] border border-white/10 rounded-xl p-6 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="space-y-1.5">
                    {(theatre.district || theatre.taluk) && (
                      <p className="text-xs font-medium text-rose-400">
                        {theatre.district} District{theatre.taluk ? ` · ${theatre.taluk} Taluk` : ''}
                      </p>
                    )}
                    <h2 className="text-xl font-semibold text-white">{theatre.name}</h2>
                    {theatre.nearbyLocation && (
                      <p className="text-sm text-emerald-300 flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{theatre.nearbyLocation}</span>
                      </p>
                    )}
                    <p className="text-sm text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{theatre.address}</span>
                    </p>
                  </div>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 text-slate-200 font-medium">
                      <Monitor className="w-3.5 h-3.5 text-slate-400" />
                      {theatre.screens} Screens
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{theatre.amenities.join(' · ')}</span>
                  </div>
                </div>

                {showsByMovie.size === 0 ? (
                  <p className="text-sm text-slate-400">No shows scheduled on {selectedDate}.</p>
                ) : (
                  <div className="space-y-4">
                    {Array.from(showsByMovie.entries()).map(([movieId, movieShows]) => {
                      const movie = movieMap.get(movieId);
                      if (!movie) return null;
                      return (
                        <div
                          key={movieId}
                          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img
                              src={movie.posterUrl}
                              alt={movie.title}
                              referrerPolicy="no-referrer"
                              className="w-12 h-16 rounded-md object-cover bg-slate-800 shrink-0"
                            />
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => onSelectMovie(movie)}
                                className="text-sm font-semibold text-white hover:text-rose-400 transition-colors text-left truncate block"
                              >
                                {movie.title}
                              </button>
                              <p className="text-xs text-slate-400">
                                {movie.genre} · {movie.language} · {movie.duration}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5">
                            {movieShows.map((show) => (
                              <button
                                key={show.show_id}
                                type="button"
                                onClick={() => onSelectShow(show)}
                                className="px-3.5 py-2 rounded-lg bg-[#060913] hover:bg-rose-600/15 border border-white/15 hover:border-rose-500 text-left transition-colors group"
                              >
                                <div className="flex items-center gap-1.5 text-sm font-semibold text-white group-hover:text-rose-300 tabular-nums">
                                  <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400" />
                                  {show.showTime}
                                </div>
                                <div className="text-[11px] text-slate-400 tabular-nums mt-0.5">
                                  {show.format} · From {formatCurrencyINR(show.silverPrice)}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

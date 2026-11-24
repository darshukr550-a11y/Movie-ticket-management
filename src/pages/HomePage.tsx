import { useMemo, useState } from 'react';
import {
  Building2,
  Calendar,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Navigation,
  Play,
  Search,
  Star,
  X,
} from 'lucide-react';
import { DistrictTalukFinder } from '../components/DistrictTalukFinder.tsx';
import { MovieCard } from '../components/MovieCard.tsx';
import { searchKarnatakaLocations, type TalukLocation } from '../data/karnatakaLocations.ts';
import type { AppView, Movie } from '../types.ts';
import { CITIES } from '../utils/cinema.ts';

interface HomePageProps {
  movies: Movie[];
  selectedCity: string;
  searchQuery: string;
  onCityChange: (city: string) => void;
  onSearchChange: (q: string) => void;
  onSelectMovie: (movie: Movie) => void;
  onSelectTalukLocation: (loc: TalukLocation) => Promise<void> | void;
  onNavigate: (view: AppView) => void;
}

export function HomePage({
  movies,
  selectedCity,
  searchQuery,
  onCityChange,
  onSearchChange,
  onSelectMovie,
  onSelectTalukLocation,
  onNavigate,
}: HomePageProps) {
  const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);
  const [languageFilter, setLanguageFilter] = useState<string>('All');
  const [loadingTalukId, setLoadingTalukId] = useState<string | null>(null);
  const [talukError, setTalukError] = useState<string | null>(null);

  const cityOptions = useMemo(
    () => ((CITIES as readonly string[]).includes(selectedCity) ? [...CITIES] : [selectedCity, ...CITIES]),
    [selectedCity]
  );

  const matchingLocations = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return [];
    return searchKarnatakaLocations(q).slice(0, 9);
  }, [searchQuery]);

  const languages = useMemo(() => {
    const unique = Array.from(new Set(movies.map((m) => m.language)));
    return ['All', ...unique];
  }, [movies]);

  const featuredMovie = useMemo(
    () => movies.find((m) => m.featured) || movies[0],
    [movies]
  );

  const filteredMovies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return movies.filter((m) => {
      if (languageFilter !== 'All' && m.language !== languageFilter) return false;
      if (!q) return true;
      return (
        m.title.toLowerCase().includes(q) ||
        m.genre.toLowerCase().includes(q) ||
        m.language.toLowerCase().includes(q) ||
        m.cast.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [movies, searchQuery, languageFilter]);

  const nowShowing = useMemo(
    () => filteredMovies.filter((m) => m.status === 'now_showing'),
    [filteredMovies]
  );

  const comingSoon = useMemo(
    () => filteredMovies.filter((m) => m.status === 'coming_soon'),
    [filteredMovies]
  );

  const trendingMovies = useMemo(
    () => filteredMovies.filter((m) => m.trending),
    [filteredMovies]
  );

  const recommendedMovies = useMemo(
    () => filteredMovies.filter((m) => m.recommended),
    [filteredMovies]
  );

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="space-y-14">
      {/* Discovery Search & Location Bar */}
      <section className="border-b border-white/10 bg-[#0A0F1D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search movies, Karnataka district, taluk, theatre, or near location..."
              aria-label="Search movies or Karnataka districts and taluks"
              className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#060913] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 text-rose-400 absolute left-3 pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => onCityChange(e.target.value)}
                aria-label="Select City"
                className="pl-9 pr-8 py-2.5 rounded-lg bg-[#060913] border border-white/10 text-sm font-medium text-white focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('theatres')}
              className="px-4 py-2.5 rounded-lg bg-[#121A2E] hover:bg-[#192440] border border-white/10 text-sm font-medium text-slate-200 whitespace-nowrap transition-colors"
            >
              Browse Theatres
            </button>
          </div>
        </div>
      </section>

      {/* Featured Movie Banner */}
      {!isSearching && featuredMovie && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0E1525] min-h-[420px] lg:min-h-[480px] flex items-end">
            <img
              src={featuredMovie.bannerUrl || featuredMovie.posterUrl}
              alt={`${featuredMovie.title} featured backdrop`}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#060913]/95 via-[#060913]/75 to-[#060913]/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-transparent to-transparent" />

            <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-2xl space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300">
                <span className="text-rose-400 font-semibold">Featured Premiere</span>
                <span aria-hidden="true">·</span>
                <span>{featuredMovie.genre}</span>
                <span aria-hidden="true">·</span>
                <span>{featuredMovie.language}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {featuredMovie.rating.toFixed(1)}/10
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight [text-wrap:balance]">
                {featuredMovie.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed line-clamp-3">
                {featuredMovie.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {featuredMovie.duration}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Showing in {selectedCity}
                </span>
                <span aria-hidden="true">·</span>
                <span>{featuredMovie.formats.join(' / ')}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onSelectMovie(featuredMovie)}
                  className="px-6 py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold whitespace-nowrap transition-colors"
                >
                  Book Tickets
                </button>
                <button
                  type="button"
                  onClick={() => setTrailerMovie(featuredMovie)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-medium whitespace-nowrap transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Watch Trailer
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Matching Karnataka District & Taluk Theatres when searching */}
      {isSearching && matchingLocations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h2 className="text-xl font-bold text-white">
                Matching Theatres & Near Locations in Karnataka
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                District, taluk, theatre name, and nearby landmark matching "{searchQuery}"
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('theatres')}
              className="text-xs font-medium text-rose-400 hover:text-rose-300 whitespace-nowrap"
            >
              Open Full District & Taluk Finder →
            </button>
          </div>

          {talukError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {talukError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchingLocations.map((loc) => (
              <div
                key={loc.theatreId}
                className="bg-[#0E1525] border border-white/10 hover:border-rose-500/50 rounded-xl p-4 flex flex-col justify-between gap-3 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="text-[11px] font-medium text-rose-400">
                    {loc.district} District · {loc.taluk} Taluk
                  </div>
                  <h3 className="text-sm font-semibold text-white flex items-start gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{loc.theatreName}</span>
                  </h3>
                  <p className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{loc.nearbyLocation}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{loc.address}</span>
                  </p>
                </div>

                <button
                  type="button"
                  disabled={loadingTalukId === loc.theatreId}
                  onClick={async () => {
                    setTalukError(null);
                    setLoadingTalukId(loc.theatreId);
                    try {
                      await onSelectTalukLocation(loc);
                    } catch (err) {
                      setTalukError(err instanceof Error ? err.message : 'Unable to load showtimes.');
                    } finally {
                      setLoadingTalukId(null);
                    }
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-[#121B30] hover:bg-rose-600 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  {loadingTalukId === loc.theatreId ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Loading Showtimes...
                    </>
                  ) : (
                    <>
                      View Showtimes & Book
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search Results Empty State */}
      {isSearching && filteredMovies.length === 0 && matchingLocations.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-4">
          <h2 className="text-2xl font-semibold text-white">No movies or theatres match "{searchQuery}"</h2>
          <p className="text-sm text-slate-400">
            Try searching by movie title, genre, language (Kannada, English, Hindi), or any Karnataka district/taluk.
          </p>
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold"
          >
            Reset Search
          </button>
        </section>
      )}

      {/* Karnataka District & Taluk Theatre Finder Section */}
      {!isSearching && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DistrictTalukFinder compact onSelectLocation={onSelectTalukLocation} />
        </section>
      )}

      {/* Now Showing Section */}
      {(nowShowing.length > 0 || languageFilter !== 'All') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isSearching ? 'Search Results — Now Showing' : `Now Showing in ${selectedCity}`}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Book instant seats across IMAX, 4DX, and Dolby Atmos screens
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguageFilter(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition-colors ${
                    languageFilter === lang
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-[#0E1525] text-slate-300 border-white/10 hover:border-white/25'
                  }`}
                >
                  {lang}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onNavigate('movies')}
                className="inline-flex items-center gap-1 text-sm font-medium text-rose-400 hover:text-rose-300 whitespace-nowrap ml-2"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {nowShowing.length === 0 ? (
            <div className="bg-[#0E1525] border border-white/10 rounded-xl p-8 text-center space-y-3">
              <p className="text-sm text-slate-300">No {languageFilter} movies currently showing.</p>
              <button
                type="button"
                onClick={() => setLanguageFilter('All')}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold"
              >
                Show All Languages
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {nowShowing.map((movie) => (
                <MovieCard key={movie.movie_id} movie={movie} onSelectMovie={onSelectMovie} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Trending Movies Section */}
      {!isSearching && trendingMovies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Trending This Week</h2>
              <p className="text-sm text-slate-400 mt-1">
                Most booked titles with highest audience ratings
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingMovies.slice(0, 4).map((movie) => (
              <MovieCard key={`tr_${movie.movie_id}`} movie={movie} onSelectMovie={onSelectMovie} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended Movies Section */}
      {!isSearching && recommendedMovies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Recommended For You</h2>
              <p className="text-sm text-slate-400 mt-1">
                Curated picks across genres and regional cinema
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedMovies.slice(0, 4).map((movie) => (
              <MovieCard key={`rec_${movie.movie_id}`} movie={movie} onSelectMovie={onSelectMovie} />
            ))}
          </div>
        </section>
      )}

      {/* Coming Soon Section */}
      {comingSoon.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Coming Soon</h2>
              <p className="text-sm text-slate-400 mt-1">
                Upcoming theatrical releases — explore trailers and cast details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {comingSoon.map((movie) => (
              <MovieCard key={`cs_${movie.movie_id}`} movie={movie} onSelectMovie={onSelectMovie} />
            ))}
          </div>
        </section>
      )}

      {/* Trailer Modal */}
      {trailerMovie && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#0E1525] border border-white/10 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">{trailerMovie.title} — Official Trailer</h3>
                <p className="text-xs text-slate-400">{trailerMovie.genre} · {trailerMovie.duration}</p>
              </div>
              <button
                type="button"
                onClick={() => setTrailerMovie(null)}
                aria-label="Close trailer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              {trailerMovie.trailerUrl ? (
                <iframe
                  src={trailerMovie.trailerUrl}
                  title={`${trailerMovie.title} Trailer`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  Trailer preview unavailable for this title.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

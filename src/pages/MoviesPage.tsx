import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { MovieCard } from '../components/MovieCard.tsx';
import type { Movie } from '../types.ts';

interface MoviesPageProps {
  movies: Movie[];
  selectedCity: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectMovie: (movie: Movie) => void;
}

export function MoviesPage({
  movies,
  selectedCity,
  searchQuery,
  onSearchChange,
  onSelectMovie,
}: MoviesPageProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'now_showing' | 'coming_soon'>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('All');

  const languages = useMemo(() => {
    const unique = Array.from(new Set(movies.map((m) => m.language)));
    return ['All', ...unique];
  }, [movies]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return movies.filter((m) => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (languageFilter !== 'All' && m.language !== languageFilter) return false;
      if (!q) return true;
      return (
        m.title.toLowerCase().includes(q) ||
        m.genre.toLowerCase().includes(q) ||
        m.language.toLowerCase().includes(q)
      );
    });
  }, [movies, statusFilter, languageFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Movies in {selectedCity}</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse all {movies.length} titles currently playing or arriving soon in theatres
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter by title or genre..."
            className="w-full pl-10 pr-9 py-2.5 rounded-lg bg-[#0E1525] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear filter"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center gap-1 p-1 bg-[#0E1525] border border-white/10 rounded-lg">
          {(
            [
              { id: 'all', label: 'All Titles' },
              { id: 'now_showing', label: 'Now Showing' },
              { id: 'coming_soon', label: 'Coming Soon' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {languages.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguageFilter(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition-colors ${
                languageFilter === lang
                  ? 'bg-white text-slate-950 border-white'
                  : 'bg-[#0E1525] text-slate-300 border-white/10 hover:border-white/25'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#0E1525] border border-white/10 rounded-xl p-12 text-center space-y-3">
          <p className="text-base font-semibold text-white">No movies match your selected filters</p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setLanguageFilter('All');
              onSearchChange('');
            }}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((movie) => (
            <MovieCard key={movie.movie_id} movie={movie} onSelectMovie={onSelectMovie} />
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Film, Star } from 'lucide-react';
import type { Movie } from '../types.ts';

interface MovieCardProps {
  movie: Movie;
  onSelectMovie: (movie: Movie) => void;
}

export function MovieCard({ movie, onSelectMovie }: MovieCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <article
      className="group bg-[#0E1525] border border-white/10 rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1 hover:border-white/20"
    >
      <button
        type="button"
        onClick={() => onSelectMovie(movie)}
        className="relative aspect-[3/4] w-full overflow-hidden bg-[#121B30] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
      >
        {!imgError ? (
          <img
            src={movie.posterUrl}
            alt={`${movie.title} theatrical poster`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 via-[#0E1525] to-rose-950/40">
            <Film className="w-10 h-10 text-rose-400/80 mb-3" />
            <span className="text-sm font-semibold text-white">{movie.title}</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0E1525] via-[#0E1525]/60 to-transparent pointer-events-none" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-medium text-slate-200">
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            {movie.rating.toFixed(1)}/10
          </span>
          <span className="text-slate-300">{movie.certificate || 'UA'} · {movie.duration}</span>
        </div>
      </button>

      <div className="p-4 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => onSelectMovie(movie)}
            className="text-left w-full"
          >
            <h3 className="text-base font-semibold text-white group-hover:text-rose-400 transition-colors line-clamp-1">
              {movie.title}
            </h3>
          </button>
          <p className="text-xs text-slate-400 line-clamp-1">
            {movie.genre} · {movie.language}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelectMovie(movie)}
          className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
            movie.status === 'now_showing'
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-[#17223A] hover:bg-[#1E2C4A] text-slate-100 border border-white/10'
          }`}
        >
          {movie.status === 'now_showing' ? 'Book Now' : 'View Details'}
        </button>
      </div>
    </article>
  );
}

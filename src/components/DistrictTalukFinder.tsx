import { useMemo, useState } from 'react';
import { Building2, ChevronRight, Loader2, MapPin, Navigation, Search, X } from 'lucide-react';
import {
  KARNATAKA_DISTRICTS,
  KARNATAKA_TALUK_LOCATIONS,
  getTaluksByDistrict,
  searchKarnatakaLocations,
  type TalukLocation,
} from '../data/karnatakaLocations.ts';

interface DistrictTalukFinderProps {
  onSelectLocation: (loc: TalukLocation) => Promise<void> | void;
  compact?: boolean;
}

export function DistrictTalukFinder({ onSelectLocation, compact = false }: DistrictTalukFinderProps) {
  const [query, setQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedTaluk, setSelectedTaluk] = useState<string>('All');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const talukOptions = useMemo(() => {
    if (selectedDistrict === 'All') return [];
    return getTaluksByDistrict(selectedDistrict);
  }, [selectedDistrict]);

  const matches = useMemo(() => {
    let list = searchKarnatakaLocations(query);
    if (selectedDistrict !== 'All') {
      list = list.filter((item) => item.district === selectedDistrict);
    }
    if (selectedTaluk !== 'All') {
      list = list.filter((item) => item.taluk === selectedTaluk);
    }
    return list;
  }, [query, selectedDistrict, selectedTaluk]);

  const handleOpen = async (loc: TalukLocation) => {
    setErrorMessage(null);
    setLoadingId(loc.theatreId);
    try {
      await onSelectLocation(loc);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to load theatre showtimes.');
    } finally {
      setLoadingId(null);
    }
  };

  const showPreviewCount = query.trim() || selectedDistrict !== 'All' ? 12 : compact ? 6 : 9;
  const visibleMatches = matches.slice(0, showPreviewCount);

  return (
    <div className="bg-[#0E1525] border border-white/10 rounded-xl p-5 sm:p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            Karnataka District & Taluk Theatre Finder
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search any of all {KARNATAKA_DISTRICTS.length} districts and {KARNATAKA_TALUK_LOCATIONS.length} taluks to view the theatre name, near location, and live showtimes
          </p>
        </div>
        <div className="text-xs font-mono-tabular text-slate-400 shrink-0">
          {matches.length} {matches.length === 1 ? 'location' : 'locations'} matched
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
          {errorMessage}
        </div>
      )}

      {/* Search + Cascading District & Taluk Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_220px] gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search district, taluk, theatre name, or near location..."
            aria-label="Search Karnataka district or taluk"
            className="w-full pl-10 pr-9 py-2.5 rounded-lg bg-[#060913] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear location search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <select
          value={selectedDistrict}
          onChange={(e) => {
            setSelectedDistrict(e.target.value);
            setSelectedTaluk('All');
          }}
          aria-label="Select Karnataka District"
          className="px-3.5 py-2.5 rounded-lg bg-[#060913] border border-white/10 text-sm text-white focus:outline-none focus:border-rose-500"
        >
          <option value="All">All 31 Districts</option>
          {KARNATAKA_DISTRICTS.map((dist) => (
            <option key={dist} value={dist}>
              {dist}
            </option>
          ))}
        </select>

        <select
          value={selectedTaluk}
          disabled={selectedDistrict === 'All'}
          onChange={(e) => setSelectedTaluk(e.target.value)}
          aria-label="Select Karnataka Taluk"
          className="px-3.5 py-2.5 rounded-lg bg-[#060913] border border-white/10 text-sm text-white disabled:opacity-50 focus:outline-none focus:border-rose-500"
        >
          <option value="All">
            {selectedDistrict === 'All' ? 'Pick District First' : `All ${talukOptions.length} Taluks`}
          </option>
          {talukOptions.map((item) => (
            <option key={item.taluk} value={item.taluk}>
              {item.taluk}
            </option>
          ))}
        </select>
      </div>

      {/* Results Grid */}
      {visibleMatches.length === 0 ? (
        <div className="p-8 text-center rounded-lg bg-[#060913] border border-white/10 space-y-2">
          <p className="text-sm font-medium text-white">No district or taluk matched "{query}"</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedDistrict('All');
              setSelectedTaluk('All');
            }}
            className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold"
          >
            Reset Location Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {visibleMatches.map((loc) => (
            <div
              key={loc.theatreId}
              className="bg-[#060913] border border-white/10 hover:border-rose-500/50 rounded-lg p-4 flex flex-col justify-between gap-3 transition-colors"
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
                disabled={loadingId === loc.theatreId}
                onClick={() => void handleOpen(loc)}
                className="w-full py-2 px-3 rounded-md bg-[#121B30] hover:bg-rose-600 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                {loadingId === loc.theatreId ? (
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
      )}

      {matches.length > visibleMatches.length && (
        <p className="text-xs text-slate-400 text-center">
          Showing {visibleMatches.length} of {matches.length} matching taluks. Type a district or taluk name above to narrow down results.
        </p>
      )}
    </div>
  );
}

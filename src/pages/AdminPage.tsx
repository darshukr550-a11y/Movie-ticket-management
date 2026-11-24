import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CalendarClock,
  Film,
  LayoutDashboard,
  Lock,
  Plus,
  ShieldCheck,
  Ticket,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import type {
  Booking,
  Movie,
  PaymentRecord,
  Show,
  ShowSeatLock,
  Theatre,
  UserProfile,
} from '../types.ts';
import { CITIES, SEAT_ROWS, SEATS_PER_ROW, formatCurrencyINR } from '../utils/cinema.ts';

interface AdminOverviewData {
  stats: {
    totalMovies: number;
    totalTheatres: number;
    totalShows: number;
    totalBookings: number;
    totalUsers: number;
    totalRevenue: number;
    totalTicketsSold: number;
  };
  bookings: Booking[];
  payments: PaymentRecord[];
  users: UserProfile[];
}

interface AdminPageProps {
  user: UserProfile | null;
  adminToken: string | null;
  movies: Movie[];
  theatres: Theatre[];
  shows: Show[];
  seatLocks: Record<string, Record<string, ShowSeatLock>>;
  onAdminAuthSuccess: (token: string, profile: UserProfile) => void;
  onRefreshCatalog: () => Promise<void>;
  onGoogleLogin: () => Promise<void>;
}

type AdminTab = 'overview' | 'movies' | 'theatres' | 'shows' | 'bookings' | 'users';

export function AdminPage({
  user,
  adminToken,
  movies,
  theatres,
  shows,
  seatLocks,
  onAdminAuthSuccess,
  onRefreshCatalog,
  onGoogleLogin,
}: AdminPageProps) {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [adminStatus, setAdminStatus] = useState<{
    envConfigured: boolean;
    claimed: boolean;
    needsFirstRunSetup: boolean;
  } | null>(null);
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Movie Form State
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [movieTitle, setMovieTitle] = useState('');
  const [movieGenre, setMovieGenre] = useState('Action / Thriller');
  const [movieDuration, setMovieDuration] = useState('2h 15m');
  const [movieRating, setMovieRating] = useState('8.5');
  const [movieLanguage, setMovieLanguage] = useState('English');
  const [movieRelease, setMovieRelease] = useState(new Date().toISOString().slice(0, 10));
  const [movieDescription, setMovieDescription] = useState('');
  const [moviePosterUrl, setMoviePosterUrl] = useState('/src/assets/images/poster_obsidian_horizon_1795491656675.jpg');
  const [movieStatus, setMovieStatus] = useState<'now_showing' | 'coming_soon'>('now_showing');
  const [uploadingPoster, setUploadingPoster] = useState(false);

  // Theatre Form State
  const [theatreName, setTheatreName] = useState('');
  const [theatreCity, setTheatreCity] = useState<string>(CITIES[0]);
  const [theatreAddress, setTheatreAddress] = useState('');
  const [theatreScreens, setTheatreScreens] = useState('6');

  // Show Form State
  const [showMovieId, setShowMovieId] = useState(movies[0]?.movie_id || '');
  const [showTheatreId, setShowTheatreId] = useState(theatres[0]?.theatre_id || '');
  const [showDate, setShowDate] = useState(new Date().toISOString().slice(0, 10));
  const [showTime, setShowTime] = useState('07:30 PM');
  const [showScreen, setShowScreen] = useState('Audi 1');
  const [showFormat, setShowFormat] = useState('IMAX 2D');
  const [silverPrice, setSilverPrice] = useState('150');
  const [goldPrice, setGoldPrice] = useState('200');
  const [premiumPrice, setPremiumPrice] = useState('300');

  // Seat Manager State
  const [manageShowId, setManageShowId] = useState(shows[0]?.show_id || '');

  const isAuthorizedAdmin = Boolean(adminToken && user?.role === 'admin');

  useEffect(() => {
    fetch('/api/admin/status')
      .then((r) => r.json())
      .then((data) => setAdminStatus(data))
      .catch(() => {});
  }, []);

  const loadOverview = async (token: string) => {
    const res = await fetch('/api/admin/overview', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = (await res.json()) as AdminOverviewData;
      setOverview(data);
    }
  };

  useEffect(() => {
    if (isAuthorizedAdmin && adminToken) {
      void loadOverview(adminToken);
    }
  }, [isAuthorizedAdmin, adminToken]);

  useEffect(() => {
    if (!showMovieId && movies[0]) setShowMovieId(movies[0].movie_id);
    if (!showTheatreId && theatres[0]) setShowTheatreId(theatres[0].theatre_id);
    if (!manageShowId && shows[0]) setManageShowId(shows[0].show_id);
  }, [movies, theatres, shows, showMovieId, showTheatreId, manageShowId]);

  const handleAdminSetupOrLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (adminStatus?.needsFirstRunSetup) {
      if (passcode.length < 8) {
        setAuthError('Admin passcode must be at least 8 characters.');
        return;
      }
      if (passcode !== confirmPasscode) {
        setAuthError('Passcodes do not match.');
        return;
      }
    }

    setAuthLoading(true);
    try {
      const endpoint = adminStatus?.needsFirstRunSetup ? '/api/admin/setup' : '/api/admin/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Admin authentication failed.');
      }
      onAdminAuthSuccess(data.token, data.user);
      setPasscode('');
      setConfirmPasscode('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Admin login failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const authHeaders = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken || ''}`,
    }),
    [adminToken]
  );

  const handlePosterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !adminToken) return;
    setUploadingPoster(true);
    setActionError(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = String(reader.result || '');
          const res = await fetch('/api/admin/upload-poster', {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ dataUrl, filename: file.name.split('.')[0] }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Poster upload failed');
          setMoviePosterUrl(data.url);
          setActionSuccess('Poster image uploaded to server.');
        } catch (err) {
          setActionError(err instanceof Error ? err.message : 'Poster upload failed');
        } finally {
          setUploadingPoster(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingPoster(false);
    }
  };

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    const payload = {
      title: movieTitle,
      genre: movieGenre,
      duration: movieDuration,
      rating: Number(movieRating),
      language: movieLanguage,
      releaseDate: movieRelease,
      description: movieDescription || `${movieTitle} theatrical release.`,
      posterUrl: moviePosterUrl,
      bannerUrl: moviePosterUrl,
      status: movieStatus,
      formats: ['2D', 'IMAX 2D'],
      cast: ['Lead Cast'],
      crew: ['Direction Team'],
      trending: true,
      recommended: true,
    };

    const url = editingMovieId ? `/api/admin/movies/${editingMovieId}` : '/api/admin/movies';
    const method = editingMovieId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionError(data.error || 'Failed to save movie');
      return;
    }

    setEditingMovieId(null);
    setMovieTitle('');
    setMovieDescription('');
    await onRefreshCatalog();
    if (adminToken) await loadOverview(adminToken);
    setActionSuccess(editingMovieId ? 'Movie updated.' : 'New movie added to catalog.');
  };

  const handleDeleteMovie = async (movieId: string) => {
    setActionError(null);
    const res = await fetch(`/api/admin/movies/${movieId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (!res.ok) {
      setActionError('Failed to delete movie');
      return;
    }
    await onRefreshCatalog();
    if (adminToken) await loadOverview(adminToken);
    setActionSuccess('Movie removed from catalog.');
  };

  const handleAddTheatre = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    const res = await fetch('/api/admin/theatres', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: theatreName,
        city: theatreCity,
        address: theatreAddress,
        screens: Number(theatreScreens),
        amenities: ['Dolby Atmos', 'Laser Projection'],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionError(data.error || 'Failed to add theatre');
      return;
    }
    setTheatreName('');
    setTheatreAddress('');
    await onRefreshCatalog();
    if (adminToken) await loadOverview(adminToken);
    setActionSuccess('Theatre added.');
  };

  const handleDeleteTheatre = async (theatreId: string) => {
    const res = await fetch(`/api/admin/theatres/${theatreId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (res.ok) {
      await onRefreshCatalog();
      if (adminToken) await loadOverview(adminToken);
      setActionSuccess('Theatre removed.');
    }
  };

  const handleAddShow = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    const res = await fetch('/api/admin/shows', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        movie_id: showMovieId,
        theatre_id: showTheatreId,
        showDate,
        showTime,
        screenName: showScreen,
        format: showFormat,
        silverPrice: Number(silverPrice),
        goldPrice: Number(goldPrice),
        premiumPrice: Number(premiumPrice),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionError(data.error || 'Failed to create showtime');
      return;
    }
    await onRefreshCatalog();
    if (adminToken) await loadOverview(adminToken);
    setActionSuccess('Showtime scheduled.');
  };

  const handleDeleteShow = async (showId: string) => {
    const res = await fetch(`/api/admin/shows/${showId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (res.ok) {
      await onRefreshCatalog();
      if (adminToken) await loadOverview(adminToken);
      setActionSuccess('Showtime deleted.');
    }
  };

  const handleToggleSeatLock = async (seatId: string) => {
    if (!manageShowId) return;
    const res = await fetch(`/api/admin/shows/${manageShowId}/seats/toggle`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ seatId }),
    });
    if (res.ok) {
      await onRefreshCatalog();
    }
  };

  // Protected Admin Gate
  if (!isAuthorizedAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-14">
        <div className="bg-[#0E1525] border border-white/10 rounded-2xl p-7 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-rose-600/15 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {adminStatus?.needsFirstRunSetup ? 'Claim Admin Console' : 'Admin Console Login'}
            </h1>
            <p className="text-xs text-slate-400">
              {adminStatus?.needsFirstRunSetup
                ? 'First-run setup: choose an administrator passcode (minimum 8 characters) to lock and manage this cinema console.'
                : 'Restricted route. Ordinary customer accounts cannot access administrator tools.'}
            </p>
          </div>

          {user && user.role !== 'admin' && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
              Signed in as customer ({user.email}). Enter administrator credentials below to elevate into Admin Console.
            </div>
          )}

          {authError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {authError}
            </div>
          )}

          <form onSubmit={(e) => void handleAdminSetupOrLogin(e)} className="space-y-4">
            <label className="block text-xs font-medium text-slate-300">
              {adminStatus?.needsFirstRunSetup ? 'Create Admin Passcode' : 'Administrator Passcode'}
              <div className="relative mt-1.5">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#060913] border border-white/10 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </label>

            {adminStatus?.needsFirstRunSetup && (
              <label className="block text-xs font-medium text-slate-300">
                Confirm Admin Passcode
                <div className="relative mt-1.5">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    placeholder="Re-enter passcode"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#060913] border border-white/10 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </label>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold"
            >
              {authLoading
                ? 'Verifying...'
                : adminStatus?.needsFirstRunSetup
                ? 'Claim & Open Admin Console'
                : 'Unlock Admin Console'}
            </button>
          </form>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-white/10" />
            <span className="shrink mx-3 text-[11px] text-slate-500">or owner Google login</span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          <button
            type="button"
            onClick={() => void onGoogleLogin()}
            className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-slate-100 text-slate-950 text-xs font-semibold"
          >
            Sign In with Authorized Admin Google Account
          </button>
        </div>
      </div>
    );
  }

  const managedShowLocks = seatLocks[manageShowId] || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 items-start">
        {/* Sidebar Navigation */}
        <aside className="bg-[#0E1525] border border-white/10 rounded-xl p-4 space-y-1.5 lg:sticky lg:top-24">
          <div className="px-3 py-2 border-b border-white/10 mb-2">
            <div className="text-xs text-rose-400 font-semibold">Admin Console</div>
            <div className="text-sm font-bold text-white truncate">{user?.email}</div>
          </div>

          {(
            [
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'movies', label: 'Manage Movies', icon: Film },
              { id: 'theatres', label: 'Manage Theatres', icon: Building2 },
              { id: 'shows', label: 'Shows & Seats', icon: CalendarClock },
              { id: 'bookings', label: 'All Bookings', icon: Ticket },
              { id: 'users', label: 'User Directory', icon: Users },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setActionError(null);
                  setActionSuccess(null);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === item.id
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Main Workspace */}
        <main className="space-y-6 min-w-0">
          {actionError && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/40 text-sm text-rose-300">
              {actionError}
            </div>
          )}
          {actionSuccess && (
            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-sm text-emerald-300">
              {actionSuccess}
            </div>
          )}

          {/* Overview Tab */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Cinema Operations Overview</h1>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Revenue', val: formatCurrencyINR(overview?.stats.totalRevenue || 0) },
                  { label: 'Tickets Sold', val: String(overview?.stats.totalTicketsSold || 0) },
                  { label: 'Total Bookings', val: String(overview?.stats.totalBookings || 0) },
                  { label: 'Registered Users', val: String(overview?.stats.totalUsers || 0) },
                  { label: 'Active Movies', val: String(movies.length) },
                  { label: 'Partner Theatres', val: String(theatres.length) },
                  { label: 'Scheduled Shows', val: String(shows.length) },
                  { label: 'Payment Gateway', val: 'Simulated Mode' },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-[#0E1525] border border-white/10 rounded-xl p-4 space-y-1">
                    <div className="text-xs text-slate-400">{kpi.label}</div>
                    <div className="text-xl font-bold font-mono-tabular text-white">{kpi.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Movies CRUD Tab */}
          {tab === 'movies' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">
                {editingMovieId ? 'Edit Movie' : 'Add & Manage Movies'}
              </h1>

              <form
                onSubmit={(e) => void handleSaveMovie(e)}
                className="bg-[#0E1525] border border-white/10 rounded-xl p-6 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <label className="block text-xs font-medium text-slate-300">
                    Movie Title
                    <input
                      type="text"
                      required
                      value={movieTitle}
                      onChange={(e) => setMovieTitle(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                    />
                  </label>
                  <label className="block text-xs font-medium text-slate-300">
                    Genre
                    <input
                      type="text"
                      required
                      value={movieGenre}
                      onChange={(e) => setMovieGenre(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                    />
                  </label>
                  <label className="block text-xs font-medium text-slate-300">
                    Language
                    <input
                      type="text"
                      required
                      list="movie-language-options"
                      value={movieLanguage}
                      onChange={(e) => setMovieLanguage(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                    />
                    <datalist id="movie-language-options">
                      <option value="Kannada" />
                      <option value="English" />
                      <option value="Hindi" />
                      <option value="Tamil" />
                      <option value="Malayalam" />
                      <option value="Telugu" />
                      <option value="Japanese" />
                    </datalist>
                  </label>
                  <label className="block text-xs font-medium text-slate-300">
                    Duration
                    <input
                      type="text"
                      required
                      value={movieDuration}
                      onChange={(e) => setMovieDuration(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                    />
                  </label>
                  <label className="block text-xs font-medium text-slate-300">
                    Rating (0 - 10)
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={movieRating}
                      onChange={(e) => setMovieRating(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                    />
                  </label>
                  <label className="block text-xs font-medium text-slate-300">
                    Release Status
                    <select
                      value={movieStatus}
                      onChange={(e) => setMovieStatus(e.target.value as 'now_showing' | 'coming_soon')}
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                    >
                      <option value="now_showing">Now Showing</option>
                      <option value="coming_soon">Coming Soon</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-xs font-medium text-slate-300">
                    Poster URL or Upload File
                    <input
                      type="text"
                      value={moviePosterUrl}
                      onChange={(e) => setMoviePosterUrl(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                    />
                  </label>
                  <div className="flex items-end gap-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#17223B] hover:bg-[#1E2C4A] border border-white/15 text-xs font-medium text-white cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingPoster ? 'Uploading...' : 'Upload Poster Image'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => void handlePosterFileUpload(e)}
                        className="hidden"
                      />
                    </label>
                    <label className="block text-xs font-medium text-slate-300 flex-1">
                      Release Date
                      <input
                        type="date"
                        value={movieRelease}
                        onChange={(e) => setMovieRelease(e.target.value)}
                        className="mt-1 w-full px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                      />
                    </label>
                  </div>
                </div>

                <label className="block text-xs font-medium text-slate-300">
                  Storyline / Description
                  <textarea
                    rows={2}
                    value={movieDescription}
                    onChange={(e) => setMovieDescription(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                  />
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    {editingMovieId ? 'Update Movie' : 'Add Movie'}
                  </button>
                  {editingMovieId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMovieId(null);
                        setMovieTitle('');
                        setMovieDescription('');
                      }}
                      className="px-4 py-2 rounded-lg bg-white/5 text-xs text-slate-300"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>

              <div className="bg-[#0E1525] border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-white/10 text-xs text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Movie</th>
                        <th className="px-4 py-3">Genre / Lang</th>
                        <th className="px-4 py-3">Duration</th>
                        <th className="px-4 py-3 text-right">Rating</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {movies.map((m) => (
                        <tr key={m.movie_id} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 font-medium text-white flex items-center gap-3">
                            <img
                              src={m.posterUrl}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-8 h-11 rounded object-cover shrink-0"
                            />
                            <span>{m.title}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-400">{m.genre} · {m.language}</td>
                          <td className="px-4 py-3 text-slate-300 tabular-nums">{m.duration}</td>
                          <td className="px-4 py-3 text-right font-mono-tabular text-amber-400">{m.rating.toFixed(1)}</td>
                          <td className="px-4 py-3 text-xs text-slate-300">
                            {m.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                          </td>
                          <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMovieId(m.movie_id);
                                setMovieTitle(m.title);
                                setMovieGenre(m.genre);
                                setMovieDuration(m.duration);
                                setMovieRating(String(m.rating));
                                setMovieLanguage(m.language);
                                setMovieRelease(m.releaseDate);
                                setMovieDescription(m.description);
                                setMoviePosterUrl(m.posterUrl);
                                setMovieStatus(m.status);
                              }}
                              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-slate-200"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteMovie(m.movie_id)}
                              className="px-2.5 py-1 rounded bg-rose-600/15 hover:bg-rose-600/30 text-xs text-rose-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Theatres CRUD Tab */}
          {tab === 'theatres' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Manage Theatres</h1>
              <form
                onSubmit={(e) => void handleAddTheatre(e)}
                className="bg-[#0E1525] border border-white/10 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
              >
                <label className="block text-xs font-medium text-slate-300">
                  Theatre Name
                  <input
                    type="text"
                    required
                    value={theatreName}
                    onChange={(e) => setTheatreName(e.target.value)}
                    placeholder="CineVault Central"
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                  />
                </label>
                <label className="block text-xs font-medium text-slate-300">
                  City
                  <select
                    value={theatreCity}
                    onChange={(e) => setTheatreCity(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-medium text-slate-300">
                  Address
                  <input
                    type="text"
                    required
                    value={theatreAddress}
                    onChange={(e) => setTheatreAddress(e.target.value)}
                    placeholder="MG Road, Sector 4"
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                  />
                </label>
                <div className="flex items-end gap-2">
                  <label className="block text-xs font-medium text-slate-300 w-24">
                    Screens
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={theatreScreens}
                      onChange={(e) => setTheatreScreens(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                    />
                  </label>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold"
                  >
                    Add Theatre
                  </button>
                </div>
              </form>

              <div className="bg-[#0E1525] border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-xs text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Theatre</th>
                      <th className="px-4 py-3">City</th>
                      <th className="px-4 py-3">Address</th>
                      <th className="px-4 py-3 text-right">Screens</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {theatres.map((t) => (
                      <tr key={t.theatre_id}>
                        <td className="px-4 py-3 font-medium text-white">{t.name}</td>
                        <td className="px-4 py-3 text-slate-300">{t.city}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{t.address}</td>
                        <td className="px-4 py-3 text-right font-mono-tabular text-slate-300">{t.screens}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => void handleDeleteTheatre(t.theatre_id)}
                            className="p-1.5 rounded bg-rose-600/15 hover:bg-rose-600/30 text-rose-300"
                            title="Delete Theatre"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Shows & Seat Availability Tab */}
          {tab === 'shows' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Showtimes, Pricing & Seat Availability</h1>

              <form
                onSubmit={(e) => void handleAddShow(e)}
                className="bg-[#0E1525] border border-white/10 rounded-xl p-6 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="block text-xs font-medium text-slate-300">
                    Movie
                    <select
                      value={showMovieId}
                      onChange={(e) => setShowMovieId(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                    >
                      {movies.map((m) => (
                        <option key={m.movie_id} value={m.movie_id}>{m.title}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-slate-300">
                    Theatre
                    <select
                      value={showTheatreId}
                      onChange={(e) => setShowTheatreId(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                    >
                      {theatres.map((t) => (
                        <option key={t.theatre_id} value={t.theatre_id}>{t.name} ({t.city})</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-slate-300">
                    Date
                    <input
                      type="date"
                      value={showDate}
                      onChange={(e) => setShowDate(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                    />
                  </label>
                  <label className="block text-xs font-medium text-slate-300">
                    Showtime
                    <input
                      type="text"
                      value={showTime}
                      onChange={(e) => setShowTime(e.target.value)}
                      placeholder="07:30 PM"
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                    />
                  </label>
                  <label className="block text-xs font-medium text-slate-300">
                    Screen & Format
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <input
                        type="text"
                        value={showScreen}
                        onChange={(e) => setShowScreen(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                      />
                      <input
                        type="text"
                        value={showFormat}
                        onChange={(e) => setShowFormat(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm text-white"
                      />
                    </div>
                  </label>
                  <label className="block text-xs font-medium text-slate-300">
                    Silver / Gold / Premium (₹)
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <input
                        type="number"
                        value={silverPrice}
                        onChange={(e) => setSilverPrice(e.target.value)}
                        className="px-2 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm font-mono-tabular text-white"
                      />
                      <input
                        type="number"
                        value={goldPrice}
                        onChange={(e) => setGoldPrice(e.target.value)}
                        className="px-2 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm font-mono-tabular text-white"
                      />
                      <input
                        type="number"
                        value={premiumPrice}
                        onChange={(e) => setPremiumPrice(e.target.value)}
                        className="px-2 py-2 rounded-lg bg-[#060913] border border-white/10 text-sm font-mono-tabular text-white"
                      />
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold"
                >
                  Schedule Showtime
                </button>
              </form>

              {/* Seat Availability Manager */}
              <div className="bg-[#0E1525] border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Manage Seat Availability</h2>
                    <p className="text-xs text-slate-400">
                      Click any seat to block or release it for maintenance or VIP hold
                    </p>
                  </div>
                  <select
                    value={manageShowId}
                    onChange={(e) => setManageShowId(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[#060913] border border-white/10 text-xs text-white max-w-sm"
                  >
                    {shows.slice(0, 40).map((s) => {
                      const mv = movies.find((m) => m.movie_id === s.movie_id);
                      const th = theatres.find((t) => t.theatre_id === s.theatre_id);
                      return (
                        <option key={s.show_id} value={s.show_id}>
                          {mv?.title} — {th?.name} ({s.showDate} {s.showTime})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="overflow-x-auto pt-2">
                  <div className="min-w-[460px] space-y-1.5">
                    {SEAT_ROWS.map((rowDef) => (
                      <div key={rowDef.row} className="flex items-center justify-center gap-1.5">
                        <span className="w-5 text-xs font-mono-tabular text-slate-400">{rowDef.row}</span>
                        {Array.from({ length: SEATS_PER_ROW }, (_, idx) => {
                          const seatId = `${rowDef.row}${idx + 1}`;
                          const lock = managedShowLocks[seatId];
                          return (
                            <button
                              key={seatId}
                              type="button"
                              onClick={() => void handleToggleSeatLock(seatId)}
                              title={`${seatId}: ${lock ? lock.status : 'available'}`}
                              className={`w-8 h-7 rounded text-[10px] font-mono-tabular border transition-colors ${
                                lock?.status === 'booked'
                                  ? 'bg-slate-700 border-slate-600 text-slate-300'
                                  : lock?.status === 'blocked'
                                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                              }`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shows List */}
              <div className="bg-[#0E1525] border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-white/10 text-xs text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Movie</th>
                        <th className="px-4 py-3">Theatre</th>
                        <th className="px-4 py-3">Date & Time</th>
                        <th className="px-4 py-3 text-right">Pricing (S/G/P)</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {shows.slice(0, 25).map((s) => {
                        const mv = movies.find((m) => m.movie_id === s.movie_id);
                        const th = theatres.find((t) => t.theatre_id === s.theatre_id);
                        return (
                          <tr key={s.show_id}>
                            <td className="px-4 py-2.5 text-white font-medium">{mv?.title || s.movie_id}</td>
                            <td className="px-4 py-2.5 text-slate-300 text-xs">{th?.name || s.theatre_id}</td>
                            <td className="px-4 py-2.5 text-slate-300 text-xs tabular-nums">
                              {s.showDate} · {s.showTime} ({s.format})
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono-tabular text-xs text-slate-300">
                              ₹{s.silverPrice} / ₹{s.goldPrice} / ₹{s.premiumPrice}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => void handleDeleteShow(s.show_id)}
                                className="px-2.5 py-1 rounded bg-rose-600/15 hover:bg-rose-600/30 text-xs text-rose-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* All Bookings Tab */}
          {tab === 'bookings' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-white">All Bookings & Payment Monitor</h1>
              <div className="bg-[#0E1525] border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-white/10 text-xs text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Booking ID</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Movie & Show</th>
                        <th className="px-4 py-3">Seats</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {!overview || overview.bookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                            No customer bookings recorded yet.
                          </td>
                        </tr>
                      ) : (
                        overview.bookings.map((b) => (
                          <tr key={b.booking_id}>
                            <td className="px-4 py-3 font-mono-tabular text-xs text-white">{b.booking_id}</td>
                            <td className="px-4 py-3 text-xs text-slate-300">
                              <div>{b.user_name}</div>
                              <div className="text-slate-500">{b.user_email}</div>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-300">
                              <div className="text-white font-medium">{b.movie_title}</div>
                              <div className="text-slate-400">{b.show_date} · {b.show_time}</div>
                            </td>
                            <td className="px-4 py-3 font-mono-tabular text-xs text-white">
                              {b.seat_numbers.join(', ')}
                            </td>
                            <td className="px-4 py-3 text-right font-mono-tabular text-white">
                              {formatCurrencyINR(b.total_amount)}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <span className={b.booking_status === 'confirmed' ? 'text-emerald-400' : 'text-rose-400'}>
                                {b.booking_status} / {b.payment_status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Directory Tab */}
          {tab === 'users' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-white">Registered Users</h1>
              <div className="bg-[#0E1525] border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-white/10 text-xs text-slate-400">
                      <tr>
                        <th className="px-4 py-3">User ID</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {!overview || overview.users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                            No registered local users yet. Users registering via the Sign Up form appear here.
                          </td>
                        </tr>
                      ) : (
                        overview.users.map((u) => (
                          <tr key={u.user_id}>
                            <td className="px-4 py-3 font-mono-tabular text-xs text-slate-400">{u.user_id}</td>
                            <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                            <td className="px-4 py-3 text-slate-300">{u.email}</td>
                            <td className="px-4 py-3 text-slate-400 font-mono-tabular">{u.phone || '—'}</td>
                            <td className="px-4 py-3 text-xs text-slate-300">{u.role}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

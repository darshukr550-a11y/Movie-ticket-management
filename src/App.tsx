import { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { Footer } from './components/Footer.tsx';
import { Navbar } from './components/Navbar.tsx';
import {
  BOOTSTRAP_ADMIN_EMAIL,
  auth,
  cancelBookingInFirestore,
  createAtomicBookingInFirestore,
  fetchShowSeatLocksFromFirestore,
  fetchUserBookingsFromFirestore,
  signInWithGoogleFirebase,
  signOutFirebase,
  testFirestoreConnection,
} from './firebase.ts';
import { AdminPage } from './pages/AdminPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { InfoPage } from './pages/InfoPage.tsx';
import { MovieDetailPage } from './pages/MovieDetailPage.tsx';
import { MoviesPage } from './pages/MoviesPage.tsx';
import { MyBookingsPage } from './pages/MyBookingsPage.tsx';
import { PaymentPage } from './pages/PaymentPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { SeatSelectionPage } from './pages/SeatSelectionPage.tsx';
import { TheatresPage } from './pages/TheatresPage.tsx';
import { TicketPage } from './pages/TicketPage.tsx';
import type { TalukLocation } from './data/karnatakaLocations.ts';
import type {
  AppView,
  Booking,
  Movie,
  PaymentMethod,
  Show,
  ShowSeatLock,
  Theatre,
  UserProfile,
} from './types.ts';
import { CITIES, calculateBookingTotals } from './utils/cinema.ts';

function CineVaultApp() {
  const [view, setView] = useState<AppView>('home');
  const [infoSection, setInfoSection] = useState<'about' | 'contact' | 'help' | 'terms'>('about');

  // Catalog State
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [seatLocks, setSeatLocks] = useState<Record<string, Record<string, ShowSeatLock>>>({});

  // Discovery & Booking Flow State
  const [selectedCity, setSelectedCity] = useState<string>(CITIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [activeTicket, setActiveTicket] = useState<Booking | null>(null);
  const [pendingRedirectView, setPendingRedirectView] = useState<AppView | null>(null);

  // Auth & Session State (Bearer tokens kept strictly in React memory)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  const fetchCatalog = useCallback(async () => {
    try {
      const res = await fetch('/api/catalog');
      if (!res.ok) throw new Error('Unable to load cinema catalog.');
      const data = await res.json();
      setMovies(data.movies || []);
      setTheatres(data.theatres || []);
      setShows(data.shows || []);
      setSeatLocks(data.seatLocks || {});
      setCatalogError(null);
    } catch (err) {
      setCatalogError(err instanceof Error ? err.message : 'Failed to load catalog.');
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  const refreshBookings = useCallback(
    async (currentUser: UserProfile | null, token: string | null) => {
      if (!currentUser) {
        setUserBookings([]);
        return;
      }
      const combined = new Map<string, Booking>();

      if (token) {
        try {
          const res = await fetch('/api/bookings/my', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            for (const b of (data.bookings || []) as Booking[]) {
              combined.set(b.booking_id, b);
            }
          }
        } catch {
          // Ignore network blip
        }
      }

      if (currentUser.authProvider === 'firebase' && currentUser.emailVerified) {
        try {
          const fbBookings = await fetchUserBookingsFromFirestore(currentUser.user_id);
          for (const b of fbBookings) {
            combined.set(b.booking_id, b);
          }
        } catch {
          // Firestore read handled gracefully
        }
      }

      const sorted = Array.from(combined.values()).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );
      setUserBookings(sorted);
    },
    []
  );

  // Initial Boot: Test Firestore connection + load catalog
  useEffect(() => {
    void testFirestoreConnection();
    void fetchCatalog();
  }, [fetchCatalog]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) return;
      const isAdmin =
        fbUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL && fbUser.emailVerified;
      const profile: UserProfile = {
        user_id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Cinema Guest',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '',
        role: isAdmin ? 'admin' : 'customer',
        authProvider: 'firebase',
        emailVerified: fbUser.emailVerified,
      };
      setUser(profile);

      if (fbUser.emailVerified) {
        try {
          const res = await fetch('/api/auth/firebase-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: fbUser.uid,
              email: fbUser.email,
              name: profile.name,
              emailVerified: fbUser.emailVerified,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setAuthToken(data.token);
            if (isAdmin) setAdminToken(data.token);
            void refreshBookings(profile, data.token);
            return;
          }
        } catch {
          // Continue with client Firestore
        }
      }
      void refreshBookings(profile, null);
    });
    return () => unsub();
  }, [refreshBookings]);

  const selectedMovie = useMemo(
    () => movies.find((m) => m.movie_id === selectedMovieId) || null,
    [movies, selectedMovieId]
  );

  const selectedShow = useMemo(
    () => shows.find((s) => s.show_id === selectedShowId) || null,
    [shows, selectedShowId]
  );

  const selectedTheatre = useMemo(() => {
    if (!selectedShow) return null;
    return theatres.find((t) => t.theatre_id === selectedShow.theatre_id) || null;
  }, [theatres, selectedShow]);

  const handleNavigate = (nextView: AppView, section?: 'about' | 'contact' | 'help' | 'terms') => {
    if (section) setInfoSection(section);
    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovieId(movie.movie_id);
    setView('movie-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectShow = async (show: Show) => {
    setSelectedMovieId(show.movie_id);
    setSelectedShowId(show.show_id);
    setSelectedSeats([]);
    setView('seat-selection');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fetch freshest seat locks from both server and Firestore
    try {
      const [serverRes, fsLocks] = await Promise.all([
        fetch(`/api/shows/${show.show_id}/seats`).then((r) => (r.ok ? r.json() : null)),
        fetchShowSeatLocksFromFirestore(show.show_id).catch(() => ({})),
      ]);
      setSeatLocks((prev) => ({
        ...prev,
        [show.show_id]: {
          ...(prev[show.show_id] || {}),
          ...(serverRes?.seats || {}),
          ...fsLocks,
        },
      }));
    } catch {
      // Keep existing seat map state
    }
  };

  const handleSelectTalukLocation = useCallback(
    async (loc: TalukLocation, stayOnCurrentPage = false) => {
      const res = await fetch('/api/theatres/ensure-taluk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district: loc.district, taluk: loc.taluk }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Unable to load theatre for selected taluk.');
      }
      const data = await res.json();
      const ensuredTheatre = data.theatre as Theatre;
      const ensuredShows = (data.shows || []) as Show[];
      const ensuredLocks = (data.seatLocks || {}) as Record<string, Record<string, ShowSeatLock>>;

      setTheatres((prev) => {
        const filtered = prev.filter((t) => t.theatre_id !== ensuredTheatre.theatre_id);
        return [...filtered, ensuredTheatre];
      });

      setShows((prev) => {
        const map = new Map<string, Show>();
        prev.forEach((s) => map.set(s.show_id, s));
        ensuredShows.forEach((s) => map.set(s.show_id, s));
        return Array.from(map.values());
      });

      setSeatLocks((prev) => ({
        ...prev,
        ...ensuredLocks,
      }));

      setSelectedCity(ensuredTheatre.city || loc.taluk);
      if (!stayOnCurrentPage) {
        setView('theatres');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    []
  );

  const completeAuthNavigation = useCallback(
    async (loggedInUser: UserProfile, token: string | null) => {
      setUser(loggedInUser);
      if (token) setAuthToken(token);
      if (loggedInUser.role === 'admin' && token) setAdminToken(token);
      await refreshBookings(loggedInUser, token);
      if (pendingRedirectView) {
        const dest = pendingRedirectView;
        setPendingRedirectView(null);
        setView(dest);
      } else {
        setView('home');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [pendingRedirectView, refreshBookings]
  );

  const handleGoogleLogin = async () => {
    const profile = await signInWithGoogleFirebase();
    let syncedToken: string | null = null;
    if (profile.emailVerified) {
      const res = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: profile.user_id,
          email: profile.email,
          name: profile.name,
          emailVerified: profile.emailVerified,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        syncedToken = data.token;
      }
    }
    await completeAuthNavigation(profile, syncedToken);
  };

  const handleEmailLogin = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid email or password.');
    }
    await completeAuthNavigation(data.user, data.token);
  };

  const handleEmailRegister = async (params: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed.');
    }
    await completeAuthNavigation(data.user, data.token);
  };

  const handleLogout = async () => {
    if (user?.authProvider === 'firebase') {
      await signOutFirebase().catch(() => {});
    }
    setUser(null);
    setAuthToken(null);
    setAdminToken(null);
    setUserBookings([]);
    setView('home');
  };

  const handleUpdateProfile = async (name: string, phone: string) => {
    if (!user) return;
    if (authToken && user.authProvider === 'local_express') {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Profile update failed.');
      setUser(data.user);
    } else {
      setUser({ ...user, name, phone });
    }
  };

  const handleCompletePayment = async (method: PaymentMethod, simulateFailure: boolean) => {
    if (!user || !selectedShow || !selectedMovie || !selectedTheatre || selectedSeats.length === 0) {
      throw new Error('Booking session expired. Please reselect seats.');
    }
    if (!authToken) {
      throw new Error('Session token missing. Please sign in again.');
    }

    // Step 1: Server-side atomic seat lock + simulated payment authorization
    const res = await fetch('/api/bookings/reserve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        show_id: selectedShow.show_id,
        seat_numbers: selectedSeats,
        payment_method: method,
        simulate_failure: simulateFailure,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      if (res.status === 409) {
        await fetchCatalog();
      }
      throw new Error(data.error || 'Payment failed. Please retry.');
    }

    const confirmedBooking = data.booking as Booking;

    // Step 2: If verified Firebase user, mirror atomic seat locks + booking into Cloud Firestore
    if (user.authProvider === 'firebase' && user.emailVerified) {
      try {
        const totals = calculateBookingTotals(selectedShow, selectedSeats);
        await createAtomicBookingInFirestore({
          booking: {
            booking_id: confirmedBooking.booking_id,
            user_id: user.user_id,
            user_name: user.name,
            user_email: user.email,
            show_id: selectedShow.show_id,
            movie_id: selectedMovie.movie_id,
            movie_title: selectedMovie.title,
            movie_poster: selectedMovie.posterUrl,
            theatre_id: selectedTheatre.theatre_id,
            theatre_name: selectedTheatre.name,
            theatre_address: selectedTheatre.address,
            city: selectedTheatre.city,
            screen_name: selectedShow.screenName,
            show_date: selectedShow.showDate,
            show_time: selectedShow.showTime,
            seat_numbers: selectedSeats,
            ticket_count: totals.ticketCount,
            ticket_subtotal: totals.ticketSubtotal,
            convenience_fee: totals.convenienceFee,
            total_amount: totals.totalAmount,
            payment_status: 'paid',
            booking_status: 'confirmed',
            payment_method: method,
            transaction_ref: confirmedBooking.transaction_ref,
            verification_code: confirmedBooking.verification_code,
          },
          show: selectedShow,
          paymentId: data.payment?.payment_id || `pay_${Date.now()}`,
          method,
        });
      } catch {
        // Express booking remains confirmed; Firestore sync skipped if show doc not mirrored yet
      }
    }

    setSeatLocks((prev) => ({
      ...prev,
      [selectedShow.show_id]: data.seatLocks || prev[selectedShow.show_id] || {},
    }));
    setUserBookings((prev) => [confirmedBooking, ...prev]);
    setSelectedSeats([]);
    setActiveTicket(confirmedBooking);
    setView('ticket');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelBooking = async (booking: Booking) => {
    if (authToken) {
      const res = await fetch(`/api/bookings/${booking.booking_id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to cancel booking.');
      }
      setSeatLocks((prev) => ({
        ...prev,
        [booking.show_id]: data.seatLocks || {},
      }));
    }

    if (user?.authProvider === 'firebase' && user.emailVerified) {
      try {
        await cancelBookingInFirestore(booking);
      } catch {
        // Handled gracefully
      }
    }

    setUserBookings((prev) =>
      prev.map((item) =>
        item.booking_id === booking.booking_id
          ? { ...item, booking_status: 'cancelled', payment_status: 'refunded' }
          : item
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060913] text-slate-100">
      <Navbar
        currentView={view}
        user={user}
        onNavigate={(v) => handleNavigate(v)}
        onLogout={() => void handleLogout()}
      />

      <main className="flex-1">
        {loadingCatalog ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            <p className="text-sm">Loading theatres, movies, and live seat availability...</p>
          </div>
        ) : catalogError ? (
          <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
            <h1 className="text-xl font-bold text-white">Unable to Load Cinema Catalog</h1>
            <p className="text-sm text-slate-400">{catalogError}</p>
            <button
              type="button"
              onClick={() => void fetchCatalog()}
              className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {view === 'home' && (
              <HomePage
                movies={movies}
                selectedCity={selectedCity}
                searchQuery={searchQuery}
                onCityChange={setSelectedCity}
                onSearchChange={setSearchQuery}
                onSelectMovie={handleSelectMovie}
                onSelectTalukLocation={(loc) => handleSelectTalukLocation(loc, false)}
                onNavigate={(v) => handleNavigate(v)}
              />
            )}

            {view === 'movies' && (
              <MoviesPage
                movies={movies}
                selectedCity={selectedCity}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectMovie={handleSelectMovie}
              />
            )}

            {view === 'theatres' && (
              <TheatresPage
                theatres={theatres}
                movies={movies}
                shows={shows}
                selectedCity={selectedCity}
                onCityChange={setSelectedCity}
                onSelectShow={(s) => void handleSelectShow(s)}
                onSelectMovie={handleSelectMovie}
                onSelectTalukLocation={(loc) => handleSelectTalukLocation(loc, true)}
              />
            )}

            {view === 'movie-detail' && selectedMovie && (
              <MovieDetailPage
                movie={selectedMovie}
                theatres={theatres}
                shows={shows}
                selectedCity={selectedCity}
                onCityChange={setSelectedCity}
                onSelectShow={(s) => void handleSelectShow(s)}
                onSelectTalukLocation={(loc) => handleSelectTalukLocation(loc, true)}
                onBack={() => handleNavigate('movies')}
              />
            )}

            {view === 'seat-selection' && selectedMovie && selectedShow && selectedTheatre && (
              <SeatSelectionPage
                movie={selectedMovie}
                theatre={selectedTheatre}
                show={selectedShow}
                seatLocks={seatLocks[selectedShow.show_id] || {}}
                selectedSeats={selectedSeats}
                user={user}
                onSeatsChange={setSelectedSeats}
                onProceedToPayment={() => handleNavigate('payment')}
                onRequireAuth={() => {
                  setPendingRedirectView('payment');
                  handleNavigate('auth');
                }}
                onBack={() => handleNavigate('movie-detail')}
              />
            )}

            {view === 'payment' && selectedMovie && selectedShow && selectedTheatre && (
              <PaymentPage
                movie={selectedMovie}
                theatre={selectedTheatre}
                show={selectedShow}
                selectedSeats={selectedSeats}
                onCompletePayment={handleCompletePayment}
                onBack={() => handleNavigate('seat-selection')}
              />
            )}

            {view === 'ticket' && activeTicket && (
              <TicketPage
                booking={activeTicket}
                onViewAllBookings={() => handleNavigate('my-bookings')}
                onBookAnother={() => handleNavigate('home')}
              />
            )}

            {view === 'my-bookings' && (
              <MyBookingsPage
                user={user}
                bookings={userBookings}
                onOpenTicket={(booking) => {
                  setActiveTicket(booking);
                  handleNavigate('ticket');
                }}
                onCancelBooking={handleCancelBooking}
                onRequireAuth={() => {
                  setPendingRedirectView('my-bookings');
                  handleNavigate('auth');
                }}
                onBrowseMovies={() => handleNavigate('movies')}
              />
            )}

            {view === 'profile' && (
              <ProfilePage
                user={user}
                onUpdateProfile={handleUpdateProfile}
                onLogout={() => void handleLogout()}
                onRequireAuth={() => {
                  setPendingRedirectView('profile');
                  handleNavigate('auth');
                }}
              />
            )}

            {view === 'auth' && (
              <AuthPage
                currentUser={user}
                pendingActionLabel={
                  pendingRedirectView === 'payment'
                    ? 'Sign in or create an account to confirm your selected seats and pay'
                    : undefined
                }
                onGoogleLogin={handleGoogleLogin}
                onEmailLogin={handleEmailLogin}
                onEmailRegister={handleEmailRegister}
              />
            )}

            {view === 'admin' && (
              <AdminPage
                user={user}
                adminToken={adminToken}
                movies={movies}
                theatres={theatres}
                shows={shows}
                seatLocks={seatLocks}
                onAdminAuthSuccess={(token, profile) => {
                  setAdminToken(token);
                  setAuthToken(token);
                  setUser(profile);
                }}
                onRefreshCatalog={fetchCatalog}
                onGoogleLogin={handleGoogleLogin}
              />
            )}

            {view === 'info' && (
              <InfoPage section={infoSection} onChangeSection={setInfoSection} />
            )}
          </>
        )}
      </main>

      <Footer
        onNavigate={(v, section) => handleNavigate(v, section)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <CineVaultApp />
    </ErrorBoundary>
  );
}

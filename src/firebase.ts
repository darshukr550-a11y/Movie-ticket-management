import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getDocs,
  getFirestore,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import type { Booking, Movie, PaymentMethod, Show, ShowSeatLock, Theatre, UserProfile } from './types.ts';
import { getSeatPrice } from './utils/cinema.ts';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const BOOTSTRAP_ADMIN_EMAIL = 'darshankr550@gmail.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

export async function signInWithGoogleFirebase(): Promise<UserProfile> {
  const cred = await signInWithPopup(auth, googleProvider);
  const fbUser = cred.user;
  const isAdmin = fbUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL && fbUser.emailVerified;
  const profile: UserProfile = {
    user_id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Cinema Guest',
    email: fbUser.email || '',
    phone: fbUser.phoneNumber || '',
    role: isAdmin ? 'admin' : 'customer',
    authProvider: 'firebase',
    emailVerified: fbUser.emailVerified,
  };

  if (fbUser.emailVerified) {
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      await setDoc(
        userRef,
        {
          user_id: profile.user_id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          role: profile.role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch {
      // User doc may already exist with immutable createdAt; ignore merge mismatch and update mutable fields
      try {
        await setDoc(
          doc(db, 'users', fbUser.uid),
          {
            name: profile.name,
            phone: profile.phone,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch {
        // Handled safely without crashing login
      }
    }
  }
  return profile;
}

export async function tryFirebaseEmailRegister(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  return cred.user;
}

export async function tryFirebaseEmailLogin(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOutFirebase() {
  await signOut(auth);
}

export async function fetchShowSeatLocksFromFirestore(showId: string): Promise<Record<string, ShowSeatLock>> {
  const path = `shows/${showId}/seats`;
  try {
    const snap = await getDocs(collection(db, path));
    const map: Record<string, ShowSeatLock> = {};
    snap.forEach((docSnap) => {
      const data = docSnap.data() as ShowSeatLock;
      map[data.seat_id] = data;
    });
    return map;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createAtomicBookingInFirestore(params: {
  booking: Omit<Booking, 'createdAt'>;
  show: Show;
  paymentId: string;
  method: PaymentMethod;
}): Promise<void> {
  const { booking, show, paymentId, method } = params;
  const bookingPath = `bookings/${booking.booking_id}`;
  try {
    await runTransaction(db, async (tx) => {
      // Step 1: Verify every seat is still unbooked inside the Firestore transaction
      for (const seatId of booking.seat_numbers) {
        const seatRef = doc(db, 'shows', show.show_id, 'seats', seatId);
        const seatSnap = await tx.get(seatRef);
        if (seatSnap.exists()) {
          throw new Error(`Seat ${seatId} was just booked by another customer. Please choose different seats.`);
        }
      }

      // Step 2: Write Booking document
      const bookingRef = doc(db, 'bookings', booking.booking_id);
      tx.set(bookingRef, {
        ...booking,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Step 3: Lock all selected seats atomically
      for (const seatId of booking.seat_numbers) {
        const { category, price } = getSeatPrice(show, seatId);
        const seatRef = doc(db, 'shows', show.show_id, 'seats', seatId);
        tx.set(seatRef, {
          seat_id: seatId,
          show_id: show.show_id,
          booking_id: booking.booking_id,
          user_id: booking.user_id,
          category,
          price,
          status: 'booked',
          bookedAt: serverTimestamp(),
        });
      }

      // Step 4: Record payment audit trail
      const paymentRef = doc(db, 'payments', paymentId);
      tx.set(paymentRef, {
        payment_id: paymentId,
        booking_id: booking.booking_id,
        user_id: booking.user_id,
        amount: booking.total_amount,
        method,
        status: 'paid',
        transaction_ref: booking.transaction_ref,
        mode: 'simulated',
        createdAt: serverTimestamp(),
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('already booked') || (error instanceof Error && error.message.includes('just booked'))) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, bookingPath);
  }
}

export async function cancelBookingInFirestore(booking: Booking): Promise<void> {
  const path = `bookings/${booking.booking_id}`;
  try {
    await runTransaction(db, async (tx) => {
      const bookingRef = doc(db, 'bookings', booking.booking_id);
      tx.update(bookingRef, {
        booking_status: 'cancelled',
        updatedAt: serverTimestamp(),
      });
      for (const seatId of booking.seat_numbers) {
        const seatRef = doc(db, 'shows', booking.show_id, 'seats', seatId);
        tx.delete(seatRef);
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function fetchUserBookingsFromFirestore(userId: string): Promise<Booking[]> {
  const path = 'bookings';
  try {
    const q = query(collection(db, path), where('user_id', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const raw = d.data();
      return {
        ...raw,
        createdAt: raw.createdAt?.toDate ? raw.createdAt.toDate().toISOString() : String(raw.createdAt || new Date().toISOString()),
      } as Booking;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function upsertMovieInFirestore(movie: Movie): Promise<void> {
  const path = `movies/${movie.movie_id}`;
  try {
    await setDoc(doc(db, 'movies', movie.movie_id), {
      ...movie,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMovieInFirestore(movieId: string): Promise<void> {
  const path = `movies/${movieId}`;
  try {
    await deleteDoc(doc(db, 'movies', movieId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function upsertTheatreInFirestore(theatre: Theatre): Promise<void> {
  const path = `theatres/${theatre.theatre_id}`;
  try {
    await setDoc(doc(db, 'theatres', theatre.theatre_id), {
      ...theatre,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function upsertShowInFirestore(show: Show): Promise<void> {
  const path = `shows/${show.show_id}`;
  try {
    await setDoc(doc(db, 'shows', show.show_id), {
      ...show,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

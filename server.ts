import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import {
  SEED_MOVIES,
  SEED_THEATRES,
  generateInitialSeatLocks,
  generateSeedShows,
} from './src/data/seedData.ts';
import type {
  Booking,
  Movie,
  PaymentMethod,
  PaymentRecord,
  Show,
  ShowSeatLock,
  Theatre,
} from './src/types.ts';
import { MAX_SEATS_PER_BOOKING, calculateBookingTotals, getSeatPrice } from './src/utils/cinema.ts';

dotenv.config();

interface StoredUser {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

interface ServerDatabase {
  users: StoredUser[];
  adminPasscodeHash: string | null;
  movies: Movie[];
  theatres: Theatre[];
  shows: Show[];
  seatLocks: Record<string, Record<string, ShowSeatLock>>;
  bookings: Booking[];
  payments: PaymentRecord[];
}

interface AuthTokenPayload {
  uid: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  exp: number;
}

interface AuthenticatedRequest extends Request {
  authUser?: AuthTokenPayload;
}

const PORT = 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.resolve(DATA_DIR, 'cinevault-db.json');
const UPLOAD_DIR = path.resolve(DATA_DIR, 'uploads');

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  const keyBuf = Buffer.from(keyHex, 'hex');
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}

function timingSafeCompareString(a: string, b: string): boolean {
  const digestA = crypto.createHash('sha256').update(a).digest();
  const digestB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

function signToken(payload: Omit<AuthTokenPayload, 'exp'>, ttlSeconds = 60 * 60 * 24): string {
  const fullPayload: AuthTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token: string): AuthTokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  if (!timingSafeCompareString(sig, expectedSig)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as AuthTokenPayload;
    if (!parsed.uid || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function loadDatabase(): ServerDatabase {
  ensureDirectories();
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw) as ServerDatabase;
      if (Array.isArray(parsed.movies) && parsed.movies.length > 0) {
        return parsed;
      }
    } catch {
      // Fallback to fresh seed if corrupted
    }
  }
  const initialShows = generateSeedShows();
  const initialDb: ServerDatabase = {
    users: [],
    adminPasscodeHash: null,
    movies: SEED_MOVIES,
    theatres: SEED_THEATRES,
    shows: initialShows,
    seatLocks: generateInitialSeatLocks(initialShows),
    bookings: [],
    payments: [],
  };
  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(dbState: ServerDatabase) {
  ensureDirectories();
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(dbState, null, 2), 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
}

const dbState = loadDatabase();

function sanitizeUser(user: StoredUser) {
  return {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    authProvider: 'local_express' as const,
    emailVerified: true,
    createdAt: user.createdAt,
  };
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in to continue.' });
    return;
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    return;
  }
  req.authUser = decoded;
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Admin authentication required.' });
    return;
  }
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Administrator privileges required.' });
    return;
  }
  req.authUser = decoded;
  next();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 160;
}

function isValidSeatCode(seatId: string): boolean {
  return /^[A-I](10|[1-9])$/.test(seatId);
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '6mb' }));

  // Serve uploaded posters safely with strict filename confinement
  app.get('/uploads/:filename', (req: Request, res: Response) => {
    const filename = String(req.params.filename || '');
    if (!/^[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp)$/.test(filename)) {
      res.status(400).json({ error: 'Invalid upload filename' });
      return;
    }
    const resolved = path.resolve(UPLOAD_DIR, filename);
    if (!resolved.startsWith(UPLOAD_DIR + path.sep) || !fs.existsSync(resolved)) {
      res.status(404).json({ error: 'Poster file not found' });
      return;
    }
    res.sendFile(resolved);
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'cinevault-api', timestamp: new Date().toISOString() });
  });

  // ---------------------------------------------------------------------------
  // Customer Authentication Routes (scrypt + HMAC Bearer Token)
  // ---------------------------------------------------------------------------
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password, phone } = req.body ?? {};
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      res.status(400).json({ error: 'Full name must be between 2 and 100 characters.' });
      return;
    }
    if (typeof email !== 'string' || !isValidEmail(email.trim().toLowerCase())) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }
    const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
    if (cleanPhone && !/^[0-9+\-\s]{7,20}$/.test(cleanPhone)) {
      res.status(400).json({ error: 'Phone number must be 7 to 20 digits.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const exists = dbState.users.some((u) => u.email === normalizedEmail);
    if (exists) {
      res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
      return;
    }

    const newUser: StoredUser = {
      user_id: `usr_${crypto.randomBytes(8).toString('hex')}`,
      name: name.trim(),
      email: normalizedEmail,
      phone: cleanPhone,
      passwordHash: hashPassword(password),
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    dbState.users.push(newUser);
    saveDatabase(dbState);

    const token = signToken({
      uid: newUser.user_id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    res.status(201).json({ token, user: sanitizeUser(newUser) });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = dbState.users.find((u) => u.email === normalizedEmail);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = signToken({
      uid: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.json({ token, user: sanitizeUser(user) });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const authUser = req.authUser!;
    if (authUser.role === 'admin') {
      res.json({
        user: {
          user_id: authUser.uid,
          name: authUser.name,
          email: authUser.email,
          phone: '',
          role: 'admin',
          authProvider: 'local_express',
          emailVerified: true,
        },
      });
      return;
    }
    const found = dbState.users.find((u) => u.user_id === authUser.uid);
    if (!found) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }
    res.json({ user: sanitizeUser(found) });
  });

  app.put('/api/auth/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const authUser = req.authUser!;
    const { name, phone } = req.body ?? {};
    const found = dbState.users.find((u) => u.user_id === authUser.uid);
    if (!found) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }
    if (typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 100) {
      found.name = name.trim();
    }
    if (typeof phone === 'string' && (!phone.trim() || /^[0-9+\-\s]{7,20}$/.test(phone.trim()))) {
      found.phone = phone.trim();
    }
    saveDatabase(dbState);
    res.json({ user: sanitizeUser(found) });
  });

  // Exchange verified Firebase Google Admin session for server admin token when needed
  app.post('/api/auth/firebase-sync', (req: Request, res: Response) => {
    const { uid, email, name, emailVerified } = req.body ?? {};
    if (typeof uid !== 'string' || typeof email !== 'string' || !emailVerified) {
      res.status(400).json({ error: 'Valid verified Firebase user details required.' });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === 'darshankr550@gmail.com';
    const token = signToken({
      uid,
      email: cleanEmail,
      name: typeof name === 'string' && name.trim() ? name.trim() : cleanEmail,
      role: isAdmin ? 'admin' : 'customer',
    });
    res.json({ token, role: isAdmin ? 'admin' : 'customer' });
  });

  // ---------------------------------------------------------------------------
  // Standalone Admin Auth (Env override OR one-time first-run claim setup)
  // ---------------------------------------------------------------------------
  app.get('/api/admin/status', (_req: Request, res: Response) => {
    const envConfigured = Boolean(process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.trim().length > 0);
    const claimed = Boolean(dbState.adminPasscodeHash);
    res.json({
      envConfigured,
      claimed,
      needsFirstRunSetup: !envConfigured && !claimed,
    });
  });

  app.post('/api/admin/setup', (req: Request, res: Response) => {
    const envPasscode = process.env.ADMIN_PASSCODE?.trim();
    if (envPasscode) {
      res.status(403).json({ error: 'Admin passcode is already managed via environment secrets.' });
      return;
    }
    if (dbState.adminPasscodeHash) {
      res.status(409).json({ error: 'Admin passcode has already been claimed. Please sign in.' });
      return;
    }
    const { passcode } = req.body ?? {};
    if (typeof passcode !== 'string' || passcode.length < 8 || passcode.length > 128) {
      res.status(400).json({ error: 'Admin passcode must be at least 8 characters long.' });
      return;
    }
    dbState.adminPasscodeHash = hashPassword(passcode);
    saveDatabase(dbState);

    const token = signToken({
      uid: 'admin_console',
      email: 'admin@cinevault.local',
      name: 'Cinema Administrator',
      role: 'admin',
    });

    res.status(201).json({
      token,
      user: {
        user_id: 'admin_console',
        name: 'Cinema Administrator',
        email: 'admin@cinevault.local',
        phone: '',
        role: 'admin',
        authProvider: 'local_express',
        emailVerified: true,
      },
    });
  });

  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { passcode } = req.body ?? {};
    if (typeof passcode !== 'string' || !passcode) {
      res.status(400).json({ error: 'Admin passcode is required.' });
      return;
    }
    const envPasscode = process.env.ADMIN_PASSCODE?.trim();
    let authorized = false;

    if (envPasscode) {
      authorized = timingSafeCompareString(passcode, envPasscode);
    } else if (dbState.adminPasscodeHash) {
      authorized = verifyPassword(passcode, dbState.adminPasscodeHash);
    } else {
      res.status(400).json({ error: 'Admin passcode is not set up yet. Complete first-run setup first.' });
      return;
    }

    if (!authorized) {
      res.status(401).json({ error: 'Invalid admin passcode.' });
      return;
    }

    const token = signToken({
      uid: 'admin_console',
      email: 'admin@cinevault.local',
      name: 'Cinema Administrator',
      role: 'admin',
    });

    res.json({
      token,
      user: {
        user_id: 'admin_console',
        name: 'Cinema Administrator',
        email: 'admin@cinevault.local',
        phone: '',
        role: 'admin',
        authProvider: 'local_express',
        emailVerified: true,
      },
    });
  });

  // ---------------------------------------------------------------------------
  // Public Catalog & Seat Availability Routes
  // ---------------------------------------------------------------------------
  app.get('/api/catalog', (_req: Request, res: Response) => {
    res.json({
      movies: dbState.movies,
      theatres: dbState.theatres,
      shows: dbState.shows,
      seatLocks: dbState.seatLocks,
    });
  });

  app.get('/api/shows/:showId/seats', (req: Request, res: Response) => {
    const showId = String(req.params.showId || '');
    const show = dbState.shows.find((s) => s.show_id === showId);
    if (!show) {
      res.status(404).json({ error: 'Show not found.' });
      return;
    }
    res.json({ seats: dbState.seatLocks[showId] || {} });
  });

  // ---------------------------------------------------------------------------
  // Booking & Simulated Payment Gateway Routes (Atomic Seat Locking)
  // ---------------------------------------------------------------------------
  app.post('/api/bookings/reserve', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const authUser = req.authUser!;
    const { show_id, seat_numbers, payment_method, simulate_failure } = req.body ?? {};

    if (typeof show_id !== 'string' || !show_id) {
      res.status(400).json({ error: 'Valid show_id is required.' });
      return;
    }
    if (!Array.isArray(seat_numbers) || seat_numbers.length < 1 || seat_numbers.length > MAX_SEATS_PER_BOOKING) {
      res.status(400).json({ error: `Select between 1 and ${MAX_SEATS_PER_BOOKING} seats.` });
      return;
    }

    const uniqueSeats: string[] = [];
    for (const rawSeat of seat_numbers) {
      if (typeof rawSeat !== 'string' || !isValidSeatCode(rawSeat)) {
        res.status(400).json({ error: `Invalid seat identifier: ${String(rawSeat)}` });
        return;
      }
      if (!uniqueSeats.includes(rawSeat)) {
        uniqueSeats.push(rawSeat);
      }
    }

    const allowedMethods: PaymentMethod[] = ['upi', 'debit_card', 'credit_card', 'wallet'];
    if (typeof payment_method !== 'string' || !allowedMethods.includes(payment_method as PaymentMethod)) {
      res.status(400).json({ error: 'Invalid payment method selected.' });
      return;
    }

    const show = dbState.shows.find((s) => s.show_id === show_id);
    if (!show) {
      res.status(404).json({ error: 'Selected showtime no longer exists.' });
      return;
    }

    const movie = dbState.movies.find((m) => m.movie_id === show.movie_id);
    const theatre = dbState.theatres.find((t) => t.theatre_id === show.theatre_id);
    if (!movie || !theatre) {
      res.status(404).json({ error: 'Movie or theatre details unavailable.' });
      return;
    }

    // Step 1: Atomic check on seat availability BEFORE payment confirmation
    const showLocks = dbState.seatLocks[show.show_id] || {};
    const conflictingSeats = uniqueSeats.filter((seatId) => Boolean(showLocks[seatId]));
    if (conflictingSeats.length > 0) {
      res.status(409).json({
        error: `Seat(s) ${conflictingSeats.join(', ')} are no longer available. Please reselect seats.`,
        conflictingSeats,
      });
      return;
    }

    // Step 2: Authoritative server-side price calculation
    const totals = calculateBookingTotals(show, uniqueSeats);

    // Step 3: Simulated payment gateway execution
    if (simulate_failure === true) {
      const failedPayment: PaymentRecord = {
        payment_id: `pay_${crypto.randomBytes(6).toString('hex')}`,
        booking_id: `unconfirmed_${crypto.randomBytes(4).toString('hex')}`,
        user_id: authUser.uid,
        amount: totals.totalAmount,
        method: payment_method as PaymentMethod,
        status: 'failed',
        transaction_ref: `SIM-FAIL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
        mode: 'simulated',
        createdAt: new Date().toISOString(),
      };
      dbState.payments.unshift(failedPayment);
      saveDatabase(dbState);
      res.status(402).json({
        error: 'Simulated payment authorization declined by issuer. No booking confirmed and no seats locked. You may retry payment.',
        payment: failedPayment,
      });
      return;
    }

    // Step 4: Payment succeeded -> Lock seats & confirm booking atomically
    const bookingId = `CV-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const paymentId = `pay_${crypto.randomBytes(6).toString('hex')}`;
    const transactionRef = `SIM-TXN-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
    const verificationCode = `VER-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const nowIso = new Date().toISOString();

    if (!dbState.seatLocks[show.show_id]) {
      dbState.seatLocks[show.show_id] = {};
    }

    for (const seatId of uniqueSeats) {
      const { category, price } = getSeatPrice(show, seatId);
      dbState.seatLocks[show.show_id][seatId] = {
        seat_id: seatId,
        show_id: show.show_id,
        booking_id: bookingId,
        user_id: authUser.uid,
        category,
        price,
        status: 'booked',
      };
    }

    const newBooking: Booking = {
      booking_id: bookingId,
      user_id: authUser.uid,
      user_name: authUser.name,
      user_email: authUser.email,
      show_id: show.show_id,
      movie_id: movie.movie_id,
      movie_title: movie.title,
      movie_poster: movie.posterUrl,
      theatre_id: theatre.theatre_id,
      theatre_name: theatre.name,
      theatre_address: theatre.address,
      city: theatre.city,
      screen_name: show.screenName,
      show_date: show.showDate,
      show_time: show.showTime,
      seat_numbers: uniqueSeats,
      ticket_count: totals.ticketCount,
      ticket_subtotal: totals.ticketSubtotal,
      convenience_fee: totals.convenienceFee,
      total_amount: totals.totalAmount,
      payment_status: 'paid',
      booking_status: 'confirmed',
      payment_method: payment_method as PaymentMethod,
      transaction_ref: transactionRef,
      verification_code: verificationCode,
      createdAt: nowIso,
    };

    const paymentRecord: PaymentRecord = {
      payment_id: paymentId,
      booking_id: bookingId,
      user_id: authUser.uid,
      amount: totals.totalAmount,
      method: payment_method as PaymentMethod,
      status: 'paid',
      transaction_ref: transactionRef,
      mode: 'simulated',
      createdAt: nowIso,
    };

    dbState.bookings.unshift(newBooking);
    dbState.payments.unshift(paymentRecord);
    saveDatabase(dbState);

    res.status(201).json({
      booking: newBooking,
      payment: paymentRecord,
      seatLocks: dbState.seatLocks[show.show_id],
    });
  });

  app.get('/api/bookings/my', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const uid = req.authUser!.uid;
    const bookings = dbState.bookings.filter((b) => b.user_id === uid);
    res.json({ bookings });
  });

  app.post('/api/bookings/:bookingId/cancel', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const uid = req.authUser!.uid;
    const bookingId = String(req.params.bookingId || '');
    const booking = dbState.bookings.find((b) => b.booking_id === bookingId);
    if (!booking) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }
    if (booking.user_id !== uid && req.authUser!.role !== 'admin') {
      res.status(403).json({ error: 'You cannot cancel another user booking.' });
      return;
    }
    if (booking.booking_status === 'cancelled') {
      res.status(400).json({ error: 'Booking is already cancelled.' });
      return;
    }

    booking.booking_status = 'cancelled';
    booking.payment_status = 'refunded';

    const showLocks = dbState.seatLocks[booking.show_id];
    if (showLocks) {
      for (const seatId of booking.seat_numbers) {
        if (showLocks[seatId]?.booking_id === booking.booking_id) {
          delete showLocks[seatId];
        }
      }
    }

    const payment = dbState.payments.find((p) => p.booking_id === booking.booking_id);
    if (payment) {
      payment.status = 'refunded';
    }

    saveDatabase(dbState);
    res.json({ booking, seatLocks: dbState.seatLocks[booking.show_id] || {} });
  });

  // ---------------------------------------------------------------------------
  // Admin Dashboard & CRUD Routes (Protected by requireAdmin)
  // ---------------------------------------------------------------------------
  app.get('/api/admin/overview', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
    const totalRevenue = dbState.bookings
      .filter((b) => b.booking_status === 'confirmed' && b.payment_status === 'paid')
      .reduce((sum, b) => sum + b.total_amount, 0);
    const totalTicketsSold = dbState.bookings
      .filter((b) => b.booking_status === 'confirmed')
      .reduce((sum, b) => sum + b.ticket_count, 0);

    res.json({
      stats: {
        totalMovies: dbState.movies.length,
        totalTheatres: dbState.theatres.length,
        totalShows: dbState.shows.length,
        totalBookings: dbState.bookings.length,
        totalUsers: dbState.users.length,
        totalRevenue,
        totalTicketsSold,
      },
      bookings: dbState.bookings,
      payments: dbState.payments,
      users: dbState.users.map(sanitizeUser),
    });
  });

  app.post('/api/admin/upload-poster', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { dataUrl, filename } = req.body ?? {};
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      res.status(400).json({ error: 'Valid base64 image data URL required.' });
      return;
    }
    const match = /^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!match) {
      res.status(400).json({ error: 'Only PNG, JPG, or WEBP images are supported.' });
      return;
    }
    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 4 * 1024 * 1024) {
      res.status(400).json({ error: 'Poster image must be smaller than 4 MB.' });
      return;
    }
    const baseName =
      typeof filename === 'string'
        ? filename.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32) || 'poster'
        : 'poster';
    const finalName = `${baseName}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}.${ext}`;
    const destPath = path.resolve(UPLOAD_DIR, finalName);
    if (!destPath.startsWith(UPLOAD_DIR + path.sep)) {
      res.status(400).json({ error: 'Invalid file destination.' });
      return;
    }
    fs.writeFileSync(destPath, buffer);
    res.status(201).json({ url: `/uploads/${finalName}` });
  });

  app.post('/api/admin/movies', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const body = req.body ?? {};
    if (typeof body.title !== 'string' || body.title.trim().length < 1) {
      res.status(400).json({ error: 'Movie title is required.' });
      return;
    }
    const movie: Movie = {
      movie_id: `mov_${crypto.randomBytes(5).toString('hex')}`,
      title: body.title.trim().slice(0, 140),
      genre: String(body.genre || 'Drama').trim().slice(0, 80),
      duration: String(body.duration || '2h 10m').trim().slice(0, 32),
      rating: Number(body.rating) >= 0 && Number(body.rating) <= 10 ? Number(body.rating) : 8.0,
      language: String(body.language || 'English').trim().slice(0, 64),
      releaseDate: String(body.releaseDate || new Date().toISOString().slice(0, 10)).slice(0, 32),
      certificate: String(body.certificate || 'UA').slice(0, 8),
      description: String(body.description || '').trim().slice(0, 2000),
      posterUrl: String(body.posterUrl || '/src/assets/images/poster_obsidian_horizon_1795491656675.jpg').slice(0, 500),
      bannerUrl: String(body.bannerUrl || body.posterUrl || '/src/assets/images/hero_obsidian_horizon_1795491655967.jpg').slice(0, 500),
      trailerUrl: String(body.trailerUrl || '').slice(0, 500),
      cast: Array.isArray(body.cast) ? body.cast.map(String).slice(0, 20) : [],
      crew: Array.isArray(body.crew) ? body.crew.map(String).slice(0, 20) : [],
      formats: Array.isArray(body.formats) && body.formats.length > 0 ? body.formats.map(String).slice(0, 10) : ['2D'],
      status: body.status === 'coming_soon' ? 'coming_soon' : 'now_showing',
      trending: Boolean(body.trending),
      recommended: Boolean(body.recommended),
      featured: Boolean(body.featured),
    };
    dbState.movies.unshift(movie);
    saveDatabase(dbState);
    res.status(201).json({ movie });
  });

  app.put('/api/admin/movies/:movieId', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const movieId = String(req.params.movieId || '');
    const index = dbState.movies.findIndex((m) => m.movie_id === movieId);
    if (index === -1) {
      res.status(404).json({ error: 'Movie not found.' });
      return;
    }
    const current = dbState.movies[index];
    const body = req.body ?? {};
    const updated: Movie = {
      ...current,
      title: typeof body.title === 'string' && body.title.trim() ? body.title.trim().slice(0, 140) : current.title,
      genre: typeof body.genre === 'string' && body.genre.trim() ? body.genre.trim().slice(0, 80) : current.genre,
      duration: typeof body.duration === 'string' && body.duration.trim() ? body.duration.trim().slice(0, 32) : current.duration,
      rating: typeof body.rating === 'number' && body.rating >= 0 && body.rating <= 10 ? body.rating : current.rating,
      language: typeof body.language === 'string' && body.language.trim() ? body.language.trim().slice(0, 64) : current.language,
      releaseDate: typeof body.releaseDate === 'string' ? body.releaseDate.slice(0, 32) : current.releaseDate,
      description: typeof body.description === 'string' ? body.description.slice(0, 2000) : current.description,
      posterUrl: typeof body.posterUrl === 'string' && body.posterUrl.trim() ? body.posterUrl.slice(0, 500) : current.posterUrl,
      bannerUrl: typeof body.bannerUrl === 'string' && body.bannerUrl.trim() ? body.bannerUrl.slice(0, 500) : current.bannerUrl,
      trailerUrl: typeof body.trailerUrl === 'string' ? body.trailerUrl.slice(0, 500) : current.trailerUrl,
      cast: Array.isArray(body.cast) ? body.cast.map(String).slice(0, 20) : current.cast,
      crew: Array.isArray(body.crew) ? body.crew.map(String).slice(0, 20) : current.crew,
      formats: Array.isArray(body.formats) && body.formats.length > 0 ? body.formats.map(String).slice(0, 10) : current.formats,
      status: body.status === 'coming_soon' ? 'coming_soon' : body.status === 'now_showing' ? 'now_showing' : current.status,
      trending: typeof body.trending === 'boolean' ? body.trending : current.trending,
      recommended: typeof body.recommended === 'boolean' ? body.recommended : current.recommended,
      featured: typeof body.featured === 'boolean' ? body.featured : current.featured,
    };
    dbState.movies[index] = updated;
    saveDatabase(dbState);
    res.json({ movie: updated });
  });

  app.delete('/api/admin/movies/:movieId', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const movieId = String(req.params.movieId || '');
    const before = dbState.movies.length;
    dbState.movies = dbState.movies.filter((m) => m.movie_id !== movieId);
    if (dbState.movies.length === before) {
      res.status(404).json({ error: 'Movie not found.' });
      return;
    }
    dbState.shows = dbState.shows.filter((s) => s.movie_id !== movieId);
    saveDatabase(dbState);
    res.json({ deleted: movieId });
  });

  app.post('/api/admin/theatres', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const body = req.body ?? {};
    if (typeof body.name !== 'string' || !body.name.trim() || typeof body.city !== 'string' || !body.city.trim()) {
      res.status(400).json({ error: 'Theatre name and city are required.' });
      return;
    }
    const theatre: Theatre = {
      theatre_id: `tht_${crypto.randomBytes(5).toString('hex')}`,
      name: body.name.trim().slice(0, 140),
      city: body.city.trim().slice(0, 64),
      address: String(body.address || '').trim().slice(0, 240),
      screens: Math.max(1, Math.min(30, Number(body.screens) || 4)),
      amenities: Array.isArray(body.amenities) ? body.amenities.map(String).slice(0, 12) : ['Dolby Atmos'],
    };
    dbState.theatres.unshift(theatre);
    saveDatabase(dbState);
    res.status(201).json({ theatre });
  });

  app.delete('/api/admin/theatres/:theatreId', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const theatreId = String(req.params.theatreId || '');
    const before = dbState.theatres.length;
    dbState.theatres = dbState.theatres.filter((t) => t.theatre_id !== theatreId);
    if (dbState.theatres.length === before) {
      res.status(404).json({ error: 'Theatre not found.' });
      return;
    }
    dbState.shows = dbState.shows.filter((s) => s.theatre_id !== theatreId);
    saveDatabase(dbState);
    res.json({ deleted: theatreId });
  });

  app.post('/api/admin/shows', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const body = req.body ?? {};
    const movie = dbState.movies.find((m) => m.movie_id === body.movie_id);
    const theatre = dbState.theatres.find((t) => t.theatre_id === body.theatre_id);
    if (!movie || !theatre) {
      res.status(400).json({ error: 'Valid movie_id and theatre_id are required.' });
      return;
    }
    const show: Show = {
      show_id: `shw_${crypto.randomBytes(5).toString('hex')}`,
      movie_id: movie.movie_id,
      theatre_id: theatre.theatre_id,
      city: theatre.city,
      screenName: String(body.screenName || 'Audi 1').slice(0, 64),
      showDate: String(body.showDate || new Date().toISOString().slice(0, 10)).slice(0, 20),
      showTime: String(body.showTime || '07:30 PM').slice(0, 24),
      format: String(body.format || '2D').slice(0, 32),
      silverPrice: Math.max(50, Number(body.silverPrice) || 150),
      goldPrice: Math.max(50, Number(body.goldPrice) || 200),
      premiumPrice: Math.max(50, Number(body.premiumPrice) || 300),
    };
    dbState.shows.unshift(show);
    dbState.seatLocks[show.show_id] = {};
    saveDatabase(dbState);
    res.status(201).json({ show });
  });

  app.put('/api/admin/shows/:showId', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const showId = String(req.params.showId || '');
    const index = dbState.shows.findIndex((s) => s.show_id === showId);
    if (index === -1) {
      res.status(404).json({ error: 'Show not found.' });
      return;
    }
    const current = dbState.shows[index];
    const body = req.body ?? {};
    const updated: Show = {
      ...current,
      screenName: typeof body.screenName === 'string' && body.screenName.trim() ? body.screenName.trim().slice(0, 64) : current.screenName,
      showDate: typeof body.showDate === 'string' && body.showDate.trim() ? body.showDate.trim().slice(0, 20) : current.showDate,
      showTime: typeof body.showTime === 'string' && body.showTime.trim() ? body.showTime.trim().slice(0, 24) : current.showTime,
      format: typeof body.format === 'string' && body.format.trim() ? body.format.trim().slice(0, 32) : current.format,
      silverPrice: Number(body.silverPrice) >= 50 ? Number(body.silverPrice) : current.silverPrice,
      goldPrice: Number(body.goldPrice) >= 50 ? Number(body.goldPrice) : current.goldPrice,
      premiumPrice: Number(body.premiumPrice) >= 50 ? Number(body.premiumPrice) : current.premiumPrice,
    };
    dbState.shows[index] = updated;
    saveDatabase(dbState);
    res.json({ show: updated });
  });

  app.delete('/api/admin/shows/:showId', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const showId = String(req.params.showId || '');
    const before = dbState.shows.length;
    dbState.shows = dbState.shows.filter((s) => s.show_id !== showId);
    if (dbState.shows.length === before) {
      res.status(404).json({ error: 'Show not found.' });
      return;
    }
    delete dbState.seatLocks[showId];
    saveDatabase(dbState);
    res.json({ deleted: showId });
  });

  app.post('/api/admin/shows/:showId/seats/toggle', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const showId = String(req.params.showId || '');
    const { seatId } = req.body ?? {};
    if (typeof seatId !== 'string' || !isValidSeatCode(seatId)) {
      res.status(400).json({ error: 'Valid seatId required (e.g. D5).' });
      return;
    }
    const show = dbState.shows.find((s) => s.show_id === showId);
    if (!show) {
      res.status(404).json({ error: 'Show not found.' });
      return;
    }
    if (!dbState.seatLocks[showId]) {
      dbState.seatLocks[showId] = {};
    }
    const existing = dbState.seatLocks[showId][seatId];
    if (existing) {
      delete dbState.seatLocks[showId][seatId];
    } else {
      const { category, price } = getSeatPrice(show, seatId);
      dbState.seatLocks[showId][seatId] = {
        seat_id: seatId,
        show_id: showId,
        booking_id: 'admin_block',
        user_id: req.authUser!.uid,
        category,
        price,
        status: 'blocked',
      };
    }
    saveDatabase(dbState);
    res.json({ seats: dbState.seatLocks[showId] });
  });

  // ---------------------------------------------------------------------------
  // Vite Middleware (Dev) or Static Dist Serving (Prod)
  // ---------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CineVault server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start CineVault server:', err);
  process.exit(1);
});

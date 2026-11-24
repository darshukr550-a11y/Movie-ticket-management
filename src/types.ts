export type MovieStatus = 'now_showing' | 'coming_soon';
export type SeatCategory = 'silver' | 'gold' | 'premium';
export type SeatStatus = 'available' | 'selected' | 'booked' | 'blocked';
export type PaymentMethod = 'upi' | 'debit_card' | 'credit_card' | 'wallet';
export type PaymentStatus = 'paid' | 'failed' | 'refunded';
export type BookingStatus = 'confirmed' | 'cancelled';

export interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  authProvider: 'firebase' | 'local_express';
  emailVerified?: boolean;
  createdAt?: string;
}

export interface Movie {
  movie_id: string;
  title: string;
  genre: string;
  duration: string;
  rating: number;
  language: string;
  releaseDate: string;
  description: string;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string;
  cast: string[];
  crew: string[];
  formats: string[];
  status: MovieStatus;
  trending: boolean;
  recommended: boolean;
  featured: boolean;
  certificate?: string;
}

export interface Theatre {
  theatre_id: string;
  name: string;
  city: string;
  address: string;
  screens: number;
  amenities: string[];
}

export interface Show {
  show_id: string;
  movie_id: string;
  theatre_id: string;
  city: string;
  screenName: string;
  showDate: string;
  showTime: string;
  format: string;
  silverPrice: number;
  goldPrice: number;
  premiumPrice: number;
}

export interface ShowSeatLock {
  seat_id: string;
  show_id: string;
  booking_id: string;
  user_id: string;
  category: SeatCategory;
  price: number;
  status: 'booked' | 'blocked';
}

export interface Booking {
  booking_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  show_id: string;
  movie_id: string;
  movie_title: string;
  movie_poster: string;
  theatre_id: string;
  theatre_name: string;
  theatre_address: string;
  city: string;
  screen_name: string;
  show_date: string;
  show_time: string;
  seat_numbers: string[];
  ticket_count: number;
  ticket_subtotal: number;
  convenience_fee: number;
  total_amount: number;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  payment_method: PaymentMethod;
  transaction_ref: string;
  verification_code: string;
  createdAt: string;
}

export interface PaymentRecord {
  payment_id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_ref: string;
  mode: 'simulated' | 'gateway';
  createdAt: string;
}

export interface SeatLayoutItem {
  seatId: string;
  row: string;
  col: number;
  category: SeatCategory;
  price: number;
}

export type AppView =
  | 'home'
  | 'movies'
  | 'theatres'
  | 'movie-detail'
  | 'seat-selection'
  | 'payment'
  | 'ticket'
  | 'my-bookings'
  | 'profile'
  | 'auth'
  | 'admin'
  | 'info';

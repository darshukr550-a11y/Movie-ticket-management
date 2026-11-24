/**
 * Payload-First Security TDD Spec for CineVault Firestore Rules
 * Verifies that all "Dirty Dozen" adversarial payloads violate invariants
 * and are rejected by the Firestore ruleset.
 */

export interface SecurityTestCase {
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const DIRTY_DOZEN_CASES: SecurityTestCase[] = [
  {
    name: '01. Self-escalation on user create',
    operation: 'create',
    path: 'users/user_1',
    auth: { uid: 'user_1', email: 'alice@example.com', email_verified: true },
    payload: {
      user_id: 'user_1',
      name: 'Alice',
      email: 'alice@example.com',
      phone: '9999999999',
      role: 'admin',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '02. Shadow field injection on booking',
    operation: 'create',
    path: 'bookings/bkg_1',
    auth: { uid: 'user_1', email: 'alice@example.com', email_verified: true },
    payload: {
      booking_id: 'bkg_1',
      user_id: 'user_1',
      isVerifiedFree: true,
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '03. Unauthenticated booking creation',
    operation: 'create',
    path: 'bookings/bkg_2',
    auth: null,
    payload: { booking_id: 'bkg_2', user_id: 'anon' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '04. Unverified email booking creation',
    operation: 'create',
    path: 'bookings/bkg_3',
    auth: { uid: 'user_2', email: 'bob@example.com', email_verified: false },
    payload: { booking_id: 'bkg_3', user_id: 'user_2' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '05. Identity spoofing on booking',
    operation: 'create',
    path: 'bookings/bkg_4',
    auth: { uid: 'user_1', email: 'alice@example.com', email_verified: true },
    payload: { booking_id: 'bkg_4', user_id: 'user_victim' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '06. Over-limit seat booking (>10 seats)',
    operation: 'create',
    path: 'bookings/bkg_5',
    auth: { uid: 'user_1', email: 'alice@example.com', email_verified: true },
    payload: {
      booking_id: 'bkg_5',
      user_id: 'user_1',
      seat_numbers: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11'],
      ticket_count: 11,
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '07. Unpaid booking confirmation bypass',
    operation: 'create',
    path: 'bookings/bkg_6',
    auth: { uid: 'user_1', email: 'alice@example.com', email_verified: true },
    payload: {
      booking_id: 'bkg_6',
      user_id: 'user_1',
      payment_status: 'failed',
      booking_status: 'confirmed',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '08. Double-booking overwrite on existing seat',
    operation: 'update',
    path: 'shows/show_1/seats/D5',
    auth: { uid: 'user_2', email: 'bob@example.com', email_verified: true },
    payload: { user_id: 'user_2', status: 'booked' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '09. Orphaned seat lock without booking',
    operation: 'create',
    path: 'shows/show_1/seats/D6',
    auth: { uid: 'user_1', email: 'alice@example.com', email_verified: true },
    payload: {
      seat_id: 'D6',
      show_id: 'show_1',
      booking_id: 'missing_bkg',
      user_id: 'user_1',
      status: 'booked',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '10. PII scraping list query on users',
    operation: 'list',
    path: 'users',
    auth: { uid: 'user_1', email: 'alice@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '11. Cross-user booking read',
    operation: 'get',
    path: 'bookings/bkg_other',
    auth: { uid: 'user_1', email: 'alice@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '12. Client timestamp forgery on booking',
    operation: 'create',
    path: 'bookings/bkg_7',
    auth: { uid: 'user_1', email: 'alice@example.com', email_verified: true },
    payload: {
      booking_id: 'bkg_7',
      user_id: 'user_1',
      createdAt: '2020-01-01T00:00:00Z',
    },
    expected: 'PERMISSION_DENIED',
  },
];

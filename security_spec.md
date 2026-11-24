# CineVault Firestore Security Specification

## 1. Data Invariants
1. **Identity & Privilege Integrity**: Users cannot self-assign `role: "admin"` when creating or updating `/users/{userId}` documents; only existing admins can create `/admins/{uid}` documents or assign admin roles.
2. **PII Isolation**: `/users/{userId}` documents (containing email and phone) are readable and writable only by the owner (`request.auth.uid == userId`) or an administrator. Blanket `list` queries on `/users` are restricted to administrators.
3. **Referential Integrity**: A `/shows/{showId}` record must reference an existing `/movies/{movieId}` and `/theatres/{theatreId}`. A `/bookings/{bookingId}` record must reference an existing `/shows/{showId}`.
4. **Atomic Seat Locking**: A seat document `/shows/{showId}/seats/{seatId}` can only be created if it does not already exist (`allow create`, `allow update: if isAdmin()`), guaranteeing two concurrent users cannot claim the same seat for the same show. Every customer-created seat lock must reference a booking created atomically in the same transaction (`existsAfter(/databases/$(database)/documents/bookings/$(incoming().booking_id))`).
5. **Booking Boundaries & Payment Gate**: A customer booking must contain 1 to 10 seats (`seat_numbers.size() >= 1 && seat_numbers.size() <= 10`), `payment_status == 'paid'`, `booking_status == 'confirmed'`, and `createdAt == request.time`.
6. **Terminal State Protection**: Once a booking transitions to `booking_status == 'cancelled'`, non-admin users cannot modify it further.

## 2. "Dirty Dozen" Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Self-Escalation on User Create**: `POST /users/u1` with `{ user_id: "u1", role: "admin", ... }` by non-admin.
2. **Shadow Field Injection on Booking**: `POST /bookings/b1` with extra ghost key `{ ..., isVerifiedFree: true }`.
3. **Unauthenticated Booking Creation**: `POST /bookings/b1` without `request.auth`.
4. **Unverified Email Booking**: `POST /bookings/b1` with `request.auth.token.email_verified == false`.
5. **Identity Spoofing on Booking**: `POST /bookings/b1` where `user_id != request.auth.uid`.
6. **Over-Limit Seat Booking**: `POST /bookings/b1` with 11 seats in `seat_numbers`.
7. **Unpaid Booking Confirmation**: `POST /bookings/b1` with `payment_status: "failed"` and `booking_status: "confirmed"`.
8. **Double-Booking Overwrite on Seat**: `UPDATE /shows/s1/seats/D5` by non-admin customer attempting to steal an already booked seat.
9. **Orphaned Seat Lock Without Booking**: `POST /shows/s1/seats/D5` without a matching `bookings/{booking_id}` in the same transaction.
10. **PII Scraping List Query**: `LIST /users` by non-admin user.
11. **Cross-User Booking Read**: `GET /bookings/b_other` where `booking.user_id != request.auth.uid` by non-admin.
12. **Client Timestamp Forgery**: `POST /bookings/b1` with `createdAt` set to a past client timestamp instead of `request.time`.

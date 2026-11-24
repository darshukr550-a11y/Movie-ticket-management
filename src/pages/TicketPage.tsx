import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Calendar, CheckCircle2, Download, MapPin, Printer, Ticket } from 'lucide-react';
import type { Booking } from '../types.ts';
import { formatCurrencyINR } from '../utils/cinema.ts';

interface TicketPageProps {
  booking: Booking;
  onViewAllBookings: () => void;
  onBookAnother: () => void;
}

export function TicketPage({ booking, onViewAllBookings, onBookAnother }: TicketPageProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const payload = JSON.stringify({
      bookingId: booking.booking_id,
      verificationCode: booking.verification_code,
      movie: booking.movie_title,
      theatre: booking.theatre_name,
      date: booking.show_date,
      time: booking.show_time,
      seats: booking.seat_numbers,
    });
    QRCode.toDataURL(payload, {
      width: 240,
      margin: 2,
      color: {
        dark: '#060913',
        light: '#ffffff',
      },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [booking]);

  const handleDownloadTicket = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 520;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark cinema ticket background
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header bar
    ctx.fillStyle = '#E11D48';
    ctx.fillRect(0, 0, canvas.width, 64);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('CineVault E-Ticket', 36, 41);

    ctx.font = '14px monospace';
    ctx.fillText(`BOOKING ID: ${booking.booking_id}`, 560, 40);

    // Movie & Venue Info
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(booking.movie_title, 36, 124);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '16px sans-serif';
    ctx.fillText(`${booking.theatre_name} (${booking.screen_name})`, 36, 162);
    ctx.fillText(booking.theatre_address, 36, 190);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`Date & Time: ${booking.show_date} at ${booking.show_time}`, 36, 244);
    ctx.fillText(`Seats: ${booking.seat_numbers.join(', ')} (${booking.ticket_count} Tickets)`, 36, 280);
    ctx.fillText(`Total Paid: ${formatCurrencyINR(booking.total_amount)}`, 36, 316);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px monospace';
    ctx.fillText(`Verification Code: ${booking.verification_code}`, 36, 376);
    ctx.fillText(`Transaction Ref: ${booking.transaction_ref}`, 36, 404);
    ctx.fillText(`Status: ${booking.booking_status.toUpperCase()} / ${booking.payment_status.toUpperCase()}`, 36, 432);

    // Draw QR image on right side
    if (qrDataUrl) {
      const qrImg = new Image();
      qrImg.onload = () => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(620, 120, 232, 232);
        ctx.drawImage(qrImg, 632, 132, 208, 208);
        ctx.fillStyle = '#94A3B8';
        ctx.font = '13px monospace';
        ctx.fillText('Scan at Auditorium Gate', 642, 380);

        const link = document.createElement('a');
        link.download = `CineVault-Ticket-${booking.booking_id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      qrImg.src = qrDataUrl;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Booking Confirmed</h1>
            <p className="text-sm text-slate-400">
              Your electronic ticket and QR verification code are ready below
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => void handleDownloadTicket()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Ticket
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0E1525] hover:bg-[#17223B] border border-white/15 text-white text-sm font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Ticket
          </button>
        </div>
      </div>

      {/* Electronic Ticket Card */}
      <div className="print-ticket bg-[#0E1525] border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-rose-600 px-6 py-4 flex flex-wrap items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Ticket className="w-5 h-5" />
            <span>CineVault E-Ticket</span>
          </div>
          <div className="text-xs font-mono-tabular">
            Booking ID: {booking.booking_id}
          </div>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-[150px_1fr_200px] gap-6 items-center">
          <div className="aspect-[3/4] rounded-lg overflow-hidden border border-white/10 bg-slate-900 max-w-[150px]">
            <img
              src={booking.movie_poster}
              alt={booking.movie_title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{booking.movie_title}</h2>
              <p className="text-sm text-slate-400 mt-0.5">{booking.screen_name} · {booking.city}</p>
            </div>

            <div className="space-y-1.5 text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">{booking.theatre_name}</div>
                  <div className="text-xs text-slate-400">{booking.theatre_address}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 tabular-nums">
                <Calendar className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{booking.show_date} at {booking.show_time}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10 text-sm">
              <div>
                <div className="text-xs text-slate-400">Seat Numbers ({booking.ticket_count})</div>
                <div className="font-mono-tabular font-bold text-white text-base mt-0.5">
                  {booking.seat_numbers.join(', ')}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Total Paid</div>
                <div className="font-mono-tabular font-bold text-rose-400 text-base mt-0.5">
                  {formatCurrencyINR(booking.total_amount)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-white/10 font-mono-tabular">
              <span>Status: {booking.booking_status.toUpperCase()}</span>
              <span>Payment: {booking.payment_status.toUpperCase()}</span>
              <span>Ref: {booking.transaction_ref}</span>
            </div>
          </div>

          {/* QR Code Verification */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white text-slate-900 space-y-2">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Ticket QR Code" className="w-36 h-36" />
            ) : (
              <div className="w-36 h-36 bg-slate-200 flex items-center justify-center text-xs">
                Generating QR...
              </div>
            )}
            <div className="text-[11px] font-mono-tabular font-bold text-slate-900">
              {booking.verification_code}
            </div>
            <div className="text-[10px] text-slate-500 text-center">
              Show QR at theatre entry
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 no-print">
        <button
          type="button"
          onClick={onViewAllBookings}
          className="px-5 py-2.5 rounded-lg bg-[#0E1525] hover:bg-[#17223B] border border-white/15 text-sm font-medium text-white"
        >
          Go to My Bookings
        </button>
        <button
          type="button"
          onClick={onBookAnother}
          className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-sm font-semibold text-white"
        >
          Book Another Movie
        </button>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CreditCard,
  Info,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react';
import type { Movie, PaymentMethod, Show, Theatre } from '../types.ts';
import { calculateBookingTotals, formatCurrencyINR } from '../utils/cinema.ts';

interface PaymentPageProps {
  movie: Movie;
  theatre: Theatre;
  show: Show;
  selectedSeats: string[];
  onCompletePayment: (method: PaymentMethod, simulateFailure: boolean) => Promise<void>;
  onBack: () => void;
}

export function PaymentPage({
  movie,
  theatre,
  show,
  selectedSeats,
  onCompletePayment,
  onBack,
}: PaymentPageProps) {
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('viewer@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 8810 2291 4409');
  const [cardName, setCardName] = useState('Cinema Guest');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('412');
  const [walletProvider, setWalletProvider] = useState('CineVault Pay');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totals = useMemo(() => calculateBookingTotals(show, selectedSeats), [show, selectedSeats]);

  const validateInputs = (): string | null => {
    if (method === 'upi') {
      if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
        return 'Enter a valid UPI ID (e.g. username@okaxis).';
      }
    } else if (method === 'debit_card' || method === 'credit_card') {
      const digits = cardNumber.replace(/\s+/g, '');
      if (!/^\d{16}$/.test(digits)) {
        return 'Enter a valid 16-digit card number.';
      }
      if (!cardName.trim() || cardName.trim().length < 2) {
        return 'Enter the cardholder name.';
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry.trim())) {
        return 'Enter expiry date in MM/YY format.';
      }
      if (!/^\d{3,4}$/.test(cardCvv.trim())) {
        return 'Enter a valid 3 or 4 digit CVV.';
      }
    }
    return null;
  };

  const handlePay = async (forceSuccess = false) => {
    setErrorMsg(null);
    const validationErr = validateInputs();
    if (validationErr) {
      setErrorMsg(validationErr);
      return;
    }

    setProcessing(true);
    try {
      await onCompletePayment(method, forceSuccess ? false : simulateFailure);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Payment failed. Please retry.');
    } finally {
      setProcessing(false);
    }
  };

  const methods: { id: PaymentMethod; label: string; sub: string; icon: typeof Smartphone }[] = [
    { id: 'upi', label: 'UPI', sub: 'GPay, PhonePe, BHIM', icon: Smartphone },
    { id: 'debit_card', label: 'Debit Card', sub: 'Visa, Mastercard, RuPay', icon: CreditCard },
    { id: 'credit_card', label: 'Credit Card', sub: 'All major networks', icon: CreditCard },
    { id: 'wallet', label: 'Wallet', sub: 'CineVault / Mobile Wallets', icon: Wallet },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        type="button"
        onClick={onBack}
        disabled={processing}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Seat Selection
      </button>

      {/* Clearly Labelled Simulated Payment Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-200 text-sm">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-white">Simulated Payment Gateway (Academic & Demo Environment)</div>
          <p className="text-xs text-sky-200/80">
            No real money is charged or debited. Payment authorization is processed by the server-side checkout simulation layer, structured for drop-in Razorpay / Stripe gateway integration in production.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Payment Method & Form */}
        <div className="bg-[#0E1525] border border-white/10 rounded-xl p-6 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h1 className="text-2xl font-bold text-white">Complete Payment</h1>
            <p className="text-sm text-slate-400 mt-1">
              Booking confirms only after successful payment authorization
            </p>
          </div>

          {/* Method Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {methods.map((m) => {
              const Icon = m.icon;
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMethod(m.id);
                    setErrorMsg(null);
                  }}
                  className={`p-3.5 rounded-lg border text-left transition-colors ${
                    active
                      ? 'bg-rose-600/15 border-rose-500 text-white'
                      : 'bg-[#060913] border-white/10 text-slate-300 hover:border-white/25'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-2 ${active ? 'text-rose-400' : 'text-slate-400'}`} />
                  <div className="text-sm font-semibold">{m.label}</div>
                  <div className="text-[11px] text-slate-400 truncate">{m.sub}</div>
                </button>
              );
            })}
          </div>

          {/* Method-Specific Form */}
          {method === 'upi' && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-300">
                UPI ID / VPA
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="name@okaxis"
                  className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg bg-[#060913] border border-white/10 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </label>
              <p className="text-xs text-slate-400">
                Simulated instant VPA verification request.
              </p>
            </div>
          )}

          {(method === 'debit_card' || method === 'credit_card') && (
            <div className="space-y-4">
              <label className="block text-xs font-medium text-slate-300">
                {method === 'debit_card' ? 'Debit Card Number' : 'Credit Card Number'}
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4532 8810 2291 4409"
                  maxLength={19}
                  className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg bg-[#060913] border border-white/10 text-sm font-mono-tabular text-white focus:outline-none focus:border-rose-500"
                />
              </label>

              <label className="block text-xs font-medium text-slate-300">
                Cardholder Name
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg bg-[#060913] border border-white/10 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block text-xs font-medium text-slate-300">
                  Expiry (MM/YY)
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="08/29"
                    maxLength={5}
                    className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg bg-[#060913] border border-white/10 text-sm font-mono-tabular text-white focus:outline-none focus:border-rose-500"
                  />
                </label>
                <label className="block text-xs font-medium text-slate-300">
                  CVV
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="412"
                    maxLength={4}
                    className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg bg-[#060913] border border-white/10 text-sm font-mono-tabular text-white focus:outline-none focus:border-rose-500"
                  />
                </label>
              </div>
            </div>
          )}

          {method === 'wallet' && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-300">
                Select Digital Wallet
                <select
                  value={walletProvider}
                  onChange={(e) => setWalletProvider(e.target.value)}
                  className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg bg-[#060913] border border-white/10 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="CineVault Pay">CineVault Pay Wallet</option>
                  <option value="PayTM Wallet">PayTM Wallet</option>
                  <option value="Amazon Pay">Amazon Pay Balance</option>
                  <option value="PhonePe Wallet">PhonePe Wallet</option>
                </select>
              </label>
            </div>
          )}

          {/* Simulation Test Toggle for Flowchart Failed->Retry Testing */}
          <div className="pt-3 border-t border-white/10">
            <label className="inline-flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="rounded border-white/20 bg-[#060913] text-rose-600 focus:ring-rose-500"
              />
              <span>Test payment failure branch (simulate declined payment to verify Retry flow)</span>
            </label>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/40 space-y-3"
            >
              <div className="flex items-start gap-2.5 text-sm text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                disabled={processing}
                onClick={() => {
                  setSimulateFailure(false);
                  void handlePay(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Payment Now
              </button>
            </div>
          )}

          <button
            type="button"
            disabled={processing}
            onClick={() => void handlePay(false)}
            className="w-full py-3.5 px-5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authorizing Simulated Payment...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Pay {formatCurrencyINR(totals.totalAmount)} (Simulated)
              </>
            )}
          </button>
        </div>

        {/* Order Summary */}
        <aside className="bg-[#0E1525] border border-white/10 rounded-xl p-6 space-y-5">
          <div className="flex gap-3.5 border-b border-white/10 pb-4">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              referrerPolicy="no-referrer"
              className="w-16 h-22 rounded-md object-cover bg-slate-800 shrink-0"
            />
            <div className="space-y-1 min-w-0">
              <h2 className="text-base font-semibold text-white truncate">{movie.title}</h2>
              <p className="text-xs text-slate-400">{movie.language} · {show.format}</p>
              <p className="text-xs text-slate-300">{theatre.name}</p>
              <p className="text-xs text-slate-400 tabular-nums">
                {show.showDate} · {show.showTime} · {show.screenName}
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between text-slate-300">
              <span>Seats</span>
              <span className="font-mono-tabular font-semibold text-white">
                {selectedSeats.join(', ')}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Ticket Subtotal ({totals.ticketCount})</span>
              <span className="font-mono-tabular">{formatCurrencyINR(totals.ticketSubtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Convenience Fee</span>
              <span className="font-mono-tabular">{formatCurrencyINR(totals.convenienceFee)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-bold text-white pt-3 border-t border-white/10">
              <span>Total Amount</span>
              <span className="font-mono-tabular text-rose-400">{formatCurrencyINR(totals.totalAmount)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { CheckCircle2, HelpCircle, Mail, Shield } from 'lucide-react';

interface InfoPageProps {
  section: 'about' | 'contact' | 'help' | 'terms';
  onChangeSection: (section: 'about' | 'contact' | 'help' | 'terms') => void;
}

export function InfoPage({ section, onChangeSection }: InfoPageProps) {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const tabs: { id: 'about' | 'contact' | 'help' | 'terms'; label: string }[] = [
    { id: 'about', label: 'About CineVault' },
    { id: 'contact', label: 'Contact Support' },
    { id: 'help', label: 'Help & FAQs' },
    { id: 'terms', label: 'Terms of Service' },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;
    setSubmitted(true);
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChangeSection(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              section === t.id
                ? 'bg-rose-600 text-white'
                : 'bg-[#0E1525] text-slate-300 border border-white/10 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {section === 'about' && (
        <div className="bg-[#0E1525] border border-white/10 rounded-xl p-8 space-y-5">
          <h1 className="text-3xl font-bold text-white">About CineVault</h1>
          <p className="text-slate-300 leading-relaxed">
            CineVault is a full-stack Movie Ticket Booking System engineered to deliver fast movie discovery, multi-city multiplex showtime scheduling, tiered auditorium seat reservation (Silver, Gold, and Premium), atomic double-booking prevention, simulated payment processing, and instant QR electronic tickets.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-lg bg-[#060913] border border-white/10 space-y-1">
              <div className="text-lg font-bold text-white tabular-nums">5 Cities</div>
              <p className="text-xs text-slate-400">Bengaluru, Mumbai, Delhi NCR, Hyderabad, and Chennai.</p>
            </div>
            <div className="p-4 rounded-lg bg-[#060913] border border-white/10 space-y-1">
              <div className="text-lg font-bold text-white tabular-nums">Atomic Locking</div>
              <p className="text-xs text-slate-400">Transactional seat reservation prevents concurrent double booking.</p>
            </div>
            <div className="p-4 rounded-lg bg-[#060913] border border-white/10 space-y-1">
              <div className="text-lg font-bold text-white tabular-nums">QR E-Tickets</div>
              <p className="text-xs text-slate-400">Downloadable PNG and print-ready passes with verification codes.</p>
            </div>
          </div>
        </div>
      )}

      {section === 'contact' && (
        <div className="bg-[#0E1525] border border-white/10 rounded-xl p-8 space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2.5">
              <Mail className="w-6 h-6 text-rose-400" />
              Contact Support
            </h1>
            <p className="text-sm text-slate-400">
              Need assistance with a booking ID or auditorium schedule? Send us a message below.
            </p>
          </div>

          {submitted && (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Your inquiry has been logged. Our support desk will respond to your email shortly.</span>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4 max-w-xl">
            <label className="block text-xs font-medium text-slate-300">
              Your Name
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg bg-[#060913] border border-white/10 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </label>
            <label className="block text-xs font-medium text-slate-300">
              Email Address
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg bg-[#060913] border border-white/10 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </label>
            <label className="block text-xs font-medium text-slate-300">
              Message / Booking ID
              <textarea
                rows={4}
                required
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg bg-[#060913] border border-white/10 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </label>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold"
            >
              Send Support Request
            </button>
          </form>
        </div>
      )}

      {section === 'help' && (
        <div className="bg-[#0E1525] border border-white/10 rounded-xl p-8 space-y-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-rose-400" />
            Help & Frequently Asked Questions
          </h1>
          <div className="space-y-4">
            {[
              {
                q: 'How many seats can I book in a single transaction?',
                a: 'You can select up to 10 seats per booking across Silver, Gold, and Premium tiers.',
              },
              {
                q: 'What happens if two users try to book the same seat at the same time?',
                a: 'CineVault enforces atomic database transactions on show seat locks. Only the first confirmed payment acquires the seat; subsequent attempts receive an immediate conflict notice to choose other seats.',
              },
              {
                q: 'Does CineVault charge real money during checkout?',
                a: 'No. The current checkout runs a clearly marked Simulated Payment Gateway structured for future Razorpay integration.',
              },
              {
                q: 'Can I cancel a confirmed booking?',
                a: 'Yes. Open My Bookings, click Cancel on any upcoming confirmed booking, and your reserved seats are immediately released.',
              },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-lg bg-[#060913] border border-white/10 space-y-1.5">
                <h2 className="text-sm font-semibold text-white">{item.q}</h2>
                <p className="text-sm text-slate-400">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'terms' && (
        <div className="bg-[#0E1525] border border-white/10 rounded-xl p-8 space-y-4 text-sm text-slate-300 leading-relaxed">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-rose-400" />
            Terms & Conditions
          </h1>
          <p>
            1. E-tickets issued by CineVault are valid strictly for the specified movie, theatre, screen, date, and showtime printed on the pass.
          </p>
          <p>
            2. Convenience fees apply per ticket and are itemized transparently prior to payment confirmation.
          </p>
          <p>
            3. Simulated payment transactions do not process live financial instruments. Verification QR codes validate ticket authenticity within the CineVault demonstration system.
          </p>
          <p>
            4. Theatre entry is subject to age certification rules (U, UA, A) and standard cinema house guidelines.
          </p>
        </div>
      )}
    </div>
  );
}

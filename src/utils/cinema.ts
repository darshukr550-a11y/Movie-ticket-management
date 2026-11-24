import type { SeatCategory, SeatLayoutItem, Show } from '../types.ts';

export const CITIES = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai'] as const;

export const SEAT_ROWS: { row: string; category: SeatCategory; label: string }[] = [
  { row: 'A', category: 'silver', label: 'Silver' },
  { row: 'B', category: 'silver', label: 'Silver' },
  { row: 'C', category: 'silver', label: 'Silver' },
  { row: 'D', category: 'gold', label: 'Gold' },
  { row: 'E', category: 'gold', label: 'Gold' },
  { row: 'F', category: 'gold', label: 'Gold' },
  { row: 'G', category: 'gold', label: 'Gold' },
  { row: 'H', category: 'premium', label: 'Premium' },
  { row: 'I', category: 'premium', label: 'Premium' },
];

export const SEATS_PER_ROW = 10;
export const MAX_SEATS_PER_BOOKING = 10;
export const CONVENIENCE_FEE_RATE = 0.08;
export const CONVENIENCE_FEE_FIXED_PER_TICKET = 25;

export function getSeatPriceForCategory(show: Show, category: SeatCategory): number {
  if (category === 'silver') return show.silverPrice;
  if (category === 'gold') return show.goldPrice;
  return show.premiumPrice;
}

export function getSeatCategoryByRow(row: string): SeatCategory {
  const found = SEAT_ROWS.find((item) => item.row === row);
  return found ? found.category : 'silver';
}

export function getSeatPrice(show: Show, seatId: string): { category: SeatCategory; price: number } {
  const row = seatId.charAt(0).toUpperCase();
  const category = getSeatCategoryByRow(row);
  return {
    category,
    price: getSeatPriceForCategory(show, category),
  };
}

export function buildSeatLayout(show: Show): SeatLayoutItem[] {
  const layout: SeatLayoutItem[] = [];
  for (const rowDef of SEAT_ROWS) {
    for (let col = 1; col <= SEATS_PER_ROW; col += 1) {
      layout.push({
        seatId: `${rowDef.row}${col}`,
        row: rowDef.row,
        col,
        category: rowDef.category,
        price: getSeatPriceForCategory(show, rowDef.category),
      });
    }
  }
  return layout;
}

export function calculateBookingTotals(show: Show, seatIds: string[]) {
  const subtotal = seatIds.reduce((sum, seatId) => sum + getSeatPrice(show, seatId).price, 0);
  const convenienceFee = seatIds.length > 0
    ? Math.round(subtotal * CONVENIENCE_FEE_RATE) + seatIds.length * CONVENIENCE_FEE_FIXED_PER_TICKET
    : 0;
  const totalAmount = subtotal + convenienceFee;
  return {
    ticketCount: seatIds.length,
    ticketSubtotal: subtotal,
    convenienceFee,
    totalAmount,
  };
}

export function formatCurrencyINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function getUpcomingDates(days = 4): { iso: string; dayLabel: string; dateLabel: string }[] {
  const result: { iso: string; dayLabel: string; dateLabel: string }[] = [];
  const base = new Date();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' });
    const dateLabel = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    result.push({ iso, dayLabel, dateLabel });
  }
  return result;
}

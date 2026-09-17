import { create } from "zustand";

export interface SaleRecord {
  id: string;
  invoiceNo: string;
  date: Date;
  branchId?: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  items: { id?: string; name: string; qty: number; price: number; batch?: string; expiry?: string }[];
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  paymentMethod: string;
}

export interface RefundRecord {
  id: string;
  refundNo: string;
  originalInvoiceNo: string;
  date: Date;
  customerName: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  vat: number;
  total: number;
  reason: string;
  refundMethod: string;
}

// Seed data: past 7 days of sales for a realistic dashboard
function generateSeedSales(): SaleRecord[] {
  const medicines = [
    "Napa 500mg", "Amoxin 250mg", "Seclo 20mg", "Alatrol 10mg",
    "Losatan 50mg", "Profen 400mg", "Comet 500mg", "Atorva 10mg",
    "Voltalin 50mg", "Neotack 150mg", "Azin 500mg", "Ciprocin 500mg",
  ];
  const prices = [1.2, 7.0, 7.0, 3.0, 8.0, 2.5, 3.5, 10.0, 4.0, 2.5, 35.0, 12.0];
  const customers = ["Abdul Karim", "Shirin Akter", "Walk-in", "Nasrin Sultana", "Mohammad Rahman", "Jahangir Alam", "Rina Begum", "Walk-in"];

  const sales: SaleRecord[] = [];
  const now = new Date();

  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const numSales = 8 + Math.floor(Math.random() * 12);
    for (let s = 0; s < numSales; s++) {
      const d = new Date(now);
      d.setDate(d.getDate() - dayOffset);
      d.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));

      const itemCount = 1 + Math.floor(Math.random() * 5);
      const items: SaleRecord["items"] = [];
      for (let i = 0; i < itemCount; i++) {
        const idx = Math.floor(Math.random() * medicines.length);
        items.push({ name: medicines[idx], qty: 1 + Math.floor(Math.random() * 4), price: prices[idx] });
      }

      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      const discountPct = Math.random() < 0.3 ? Math.floor(Math.random() * 15) : 0;
      const discountAmt = subtotal * (discountPct / 100);
      const vat = 0; // medicines are VAT-exempt in Bangladesh by default
      const total = subtotal - discountAmt + vat;

      sales.push({
        id: crypto.randomUUID(),
        invoiceNo: `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(sales.length + 1).padStart(4, "0")}`,
        date: d,
        customerName: customers[Math.floor(Math.random() * customers.length)],
        customerPhone: Math.random() > 0.4 ? `+1 ${Math.floor(1000000000 + Math.random() * 9000000000)}` : "",
        items,
        subtotal,
        discount: discountAmt,
        vat,
        total,
        paymentMethod: ["cash", "card", "mobile"][Math.floor(Math.random() * 3)],
      });
    }
  }

  return sales.sort((a, b) => a.date.getTime() - b.date.getTime());
}

interface SalesStore {
  sales: SaleRecord[];
  refunds: RefundRecord[];
  addSale: (sale: SaleRecord) => void;
  addRefund: (refund: RefundRecord) => void;
  getRefundsForInvoice: (invoiceNo: string) => RefundRecord[];
}

export const useSalesStore = create<SalesStore>((set, get) => ({
  sales: generateSeedSales(),
  refunds: [],
  addSale: (sale) => set((state) => ({ sales: [...state.sales, sale] })),
  addRefund: (refund) => set((state) => ({ refunds: [...state.refunds, refund] })),
  getRefundsForInvoice: (invoiceNo) => get().refunds.filter((r) => r.originalInvoiceNo === invoiceNo),
}));

// Derived helpers
export function getTodaySales(sales: SaleRecord[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return sales.filter((s) => s.date >= today);
}

export function getThisMonthSales(sales: SaleRecord[]) {
  const now = new Date();
  return sales.filter((s) => s.date.getMonth() === now.getMonth() && s.date.getFullYear() === now.getFullYear());
}

export function getWeeklySalesChart(sales: SaleRecord[]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const result: { day: string; sales: number; date: string }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);

    const daySales = sales
      .filter((s) => s.date >= d && s.date < nextD)
      .reduce((sum, s) => sum + s.total, 0);

    result.push({ day: days[d.getDay()], sales: Math.round(daySales * 100) / 100, date: `${d.getMonth() + 1}/${d.getDate()}` });
  }

  return result;
}

export function getTopMedicines(sales: SaleRecord[], limit = 5) {
  const counts: Record<string, number> = {};
  for (const sale of sales) {
    for (const item of sale.items) {
      counts[item.name] = (counts[item.name] || 0) + item.qty;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, sold]) => ({ name, sold }));
}

export function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

import { create } from "zustand";

export type ExpenseCategory =
  | "Rent"
  | "Utilities"
  | "Salaries"
  | "Supplies"
  | "Transport"
  | "Marketing"
  | "Maintenance"
  | "Other";

export interface ExpenseRecord {
  id: string;
  date: Date;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paidTo: string;
  paymentMethod: string;
}

const categories: ExpenseCategory[] = [
  "Rent", "Utilities", "Salaries", "Supplies", "Transport", "Marketing", "Maintenance", "Other",
];

function generateSeedExpenses(): ExpenseRecord[] {
  const descriptions: Record<ExpenseCategory, string[]> = {
    Rent: ["Monthly shop rent"],
    Utilities: ["Electricity bill", "Water bill", "Internet bill"],
    Salaries: ["Staff salary - pharmacist", "Staff salary - cashier", "Staff salary - cleaner"],
    Supplies: ["Packaging materials", "Receipt paper rolls", "Cleaning supplies"],
    Transport: ["Delivery fuel", "Courier charges"],
    Marketing: ["Flyers printing", "Social media ads"],
    Maintenance: ["AC repair", "Plumbing fix", "Computer maintenance"],
    Other: ["Miscellaneous", "License renewal"],
  };

  const payees: Record<ExpenseCategory, string[]> = {
    Rent: ["Landlord - Al-Noor Properties"],
    Utilities: ["City Power Co.", "Water Authority", "TeleCom ISP"],
    Salaries: ["Ahmed Pharmacist", "Sara Cashier", "Ali Cleaner"],
    Supplies: ["PharmaSupply Co.", "Office Depot", "CleanCo"],
    Transport: ["PetroStation", "FastCourier"],
    Marketing: ["PrintShop", "MetaAds"],
    Maintenance: ["FixIt Services", "TechRepair"],
    Other: ["Government", "Misc Vendor"],
  };

  const expenses: ExpenseRecord[] = [];
  const now = new Date();

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const d = new Date(now);
    d.setDate(d.getDate() - dayOffset);
    d.setHours(10, 0, 0, 0);

    // 1-3 expenses per day
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const descs = descriptions[cat];
      const pays = payees[cat];

      const amountRanges: Record<ExpenseCategory, [number, number]> = {
        Rent: [45000, 45000],
        Utilities: [4000, 15000],
        Salaries: [30000, 120000],
        Supplies: [1500, 8000],
        Transport: [800, 5000],
        Marketing: [2500, 12000],
        Maintenance: [3000, 20000],
        Other: [800, 6000],
      };
      const [min, max] = amountRanges[cat];
      const amount = Math.round((min + Math.random() * (max - min)) * 100) / 100;

      expenses.push({
        id: crypto.randomUUID(),
        date: new Date(d),
        category: cat,
        description: descs[Math.floor(Math.random() * descs.length)],
        amount,
        paidTo: pays[Math.floor(Math.random() * pays.length)],
        paymentMethod: ["cash", "card", "bank_transfer"][Math.floor(Math.random() * 3)],
      });
    }
  }

  return expenses.sort((a, b) => a.date.getTime() - b.date.getTime());
}

interface ExpenseStore {
  expenses: ExpenseRecord[];
  addExpense: (expense: ExpenseRecord) => void;
  deleteExpense: (id: string) => void;
}

export const useExpenseStore = create<ExpenseStore>((set) => ({
  expenses: generateSeedExpenses(),
  addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
  deleteExpense: (id) => set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),
}));

export function getExpensesByDateRange(expenses: ExpenseRecord[], start: Date, end: Date) {
  return expenses.filter((e) => e.date >= start && e.date < end);
}

export function getExpensesByCategory(expenses: ExpenseRecord[]) {
  const grouped: Record<string, number> = {};
  for (const e of expenses) {
    grouped[e.category] = (grouped[e.category] || 0) + e.amount;
  }
  return Object.entries(grouped)
    .map(([category, total]) => ({ category, total: Math.round(total * 100) / 100 }))
    .sort((a, b) => b.total - a.total);
}

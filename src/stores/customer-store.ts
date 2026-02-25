import { create } from "zustand";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  loyaltyPoints: number;
  totalSpent: number;
  totalDue: number;
  joinDate: Date;
  status: "active" | "inactive";
  notes: string;
}

export interface PaymentRecord {
  id: string;
  customerId: string;
  date: Date;
  amount: number;
  method: string;
  note: string;
}

function generateSeedCustomers(): Customer[] {
  const names = [
    "Ahmed Khan", "Sara Ali", "Fatima Noor", "Omar Hassan",
    "Lina Saeed", "Yusuf Iqbal", "Nadia Bashir", "Tariq Mahmood",
    "Hana Youssef", "Bilal Farooq", "Maryam Qureshi", "Zain Aslam",
  ];
  const phones = [
    "+1 5551234567", "+1 5559876543", "+1 5554567890", "+1 5553216549",
    "+1 5557891234", "+1 5556543210", "+1 5558527413", "+1 5559638527",
    "+1 5551472583", "+1 5553698521", "+1 5552583691", "+1 5557418529",
  ];
  const emails = names.map((n) => `${n.split(" ")[0].toLowerCase()}@email.com`);

  return names.map((name, i) => {
    const totalSpent = Math.round((200 + Math.random() * 2000) * 100) / 100;
    const totalDue = Math.random() < 0.4 ? Math.round(Math.random() * 150 * 100) / 100 : 0;
    const joinDate = new Date();
    joinDate.setDate(joinDate.getDate() - Math.floor(30 + Math.random() * 300));

    return {
      id: crypto.randomUUID(),
      name,
      phone: phones[i],
      email: emails[i],
      address: `${100 + i * 12} Main Street, City`,
      loyaltyPoints: Math.floor(totalSpent / 10),
      totalSpent,
      totalDue,
      joinDate,
      status: Math.random() > 0.15 ? "active" : "inactive",
      notes: "",
    };
  });
}

function generateSeedPayments(customers: Customer[]): PaymentRecord[] {
  const records: PaymentRecord[] = [];
  for (const c of customers) {
    if (c.totalDue > 0) {
      // some past payments
      const count = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const d = new Date();
        d.setDate(d.getDate() - Math.floor(Math.random() * 60));
        records.push({
          id: crypto.randomUUID(),
          customerId: c.id,
          date: d,
          amount: Math.round((20 + Math.random() * 100) * 100) / 100,
          method: ["cash", "card", "bank_transfer"][Math.floor(Math.random() * 3)],
          note: "Partial payment",
        });
      }
    }
  }
  return records.sort((a, b) => a.date.getTime() - b.date.getTime());
}

interface CustomerStore {
  customers: Customer[];
  payments: PaymentRecord[];
  addCustomer: (c: Customer) => void;
  updateCustomer: (c: Customer) => void;
  deleteCustomer: (id: string) => void;
  addPayment: (p: PaymentRecord) => void;
  recordDuePayment: (customerId: string, amount: number, method: string) => void;
  addLoyaltyPoints: (customerId: string, points: number) => void;
  redeemLoyaltyPoints: (customerId: string, points: number) => void;
}

const seedCustomers = generateSeedCustomers();
const seedPayments = generateSeedPayments(seedCustomers);

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: seedCustomers,
  payments: seedPayments,
  addCustomer: (c) => set((s) => ({ customers: [...s.customers, c] })),
  updateCustomer: (c) =>
    set((s) => ({ customers: s.customers.map((x) => (x.id === c.id ? c : x)) })),
  deleteCustomer: (id) =>
    set((s) => ({ customers: s.customers.filter((x) => x.id !== id) })),
  addPayment: (p) => set((s) => ({ payments: [...s.payments, p] })),
  recordDuePayment: (customerId, amount, method) => {
    const payment: PaymentRecord = {
      id: crypto.randomUUID(),
      customerId,
      date: new Date(),
      amount,
      method,
      note: "Due payment",
    };
    set((s) => ({
      payments: [...s.payments, payment],
      customers: s.customers.map((c) =>
        c.id === customerId ? { ...c, totalDue: Math.max(0, c.totalDue - amount) } : c,
      ),
    }));
  },
  addLoyaltyPoints: (customerId, points) =>
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === customerId ? { ...c, loyaltyPoints: c.loyaltyPoints + points } : c,
      ),
    })),
  redeemLoyaltyPoints: (customerId, points) =>
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === customerId
          ? { ...c, loyaltyPoints: Math.max(0, c.loyaltyPoints - points) }
          : c,
      ),
    })),
}));

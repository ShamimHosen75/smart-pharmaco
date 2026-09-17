import { create } from "zustand";

export interface PurchaseItem {
  medicineName: string;
  batchNo: string;
  qty: number;
  unitCost: number;
  expiryDate: string;
}

export interface Purchase {
  id: string;
  purchaseNo: string;
  companyId: string;
  companyName: string;
  date: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: "received" | "pending" | "cancelled";
  notes: string;
  createdAt: string;
}

interface PurchaseStore {
  purchases: Purchase[];
  addPurchase: (p: Omit<Purchase, "id" | "createdAt" | "purchaseNo">) => void;
  updatePurchase: (id: string, p: Partial<Purchase>) => void;
  deletePurchase: (id: string) => void;
}

const initialPurchases: Purchase[] = [
  {
    id: "pu-001",
    purchaseNo: "PO-20260301-0001",
    companyId: "co-001",
    companyName: "Square Pharmaceuticals Ltd",
    date: "2026-03-01",
    items: [
      { medicineName: "Napa 500mg", batchNo: "B-2026-101", qty: 500, unitCost: 0.95, expiryDate: "2028-03-01" },
      { medicineName: "Comet 500mg", batchNo: "B-2026-102", qty: 200, unitCost: 2.4, expiryDate: "2028-06-15" },
    ],
    subtotal: 955,
    discount: 48,
    total: 907,
    status: "received",
    notes: "Regular monthly order",
    createdAt: "2026-03-01",
  },
  {
    id: "pu-002",
    purchaseNo: "PO-20260305-0002",
    companyId: "co-002",
    companyName: "Beximco Pharmaceuticals Ltd",
    date: "2026-03-05",
    items: [
      { medicineName: "Amoxin 250mg", batchNo: "B-2026-201", qty: 300, unitCost: 5.5, expiryDate: "2027-09-20" },
      { medicineName: "Alatrol 10mg", batchNo: "B-2026-202", qty: 400, unitCost: 2.0, expiryDate: "2028-01-10" },
    ],
    subtotal: 2450,
    discount: 0,
    total: 2450,
    status: "received",
    notes: "",
    createdAt: "2026-03-05",
  },
  {
    id: "pu-003",
    purchaseNo: "PO-20260310-0003",
    companyId: "co-003",
    companyName: "Incepta Pharmaceuticals Ltd",
    date: "2026-03-10",
    items: [
      { medicineName: "Seclo 20mg", batchNo: "B-2026-301", qty: 150, unitCost: 5.0, expiryDate: "2027-12-01" },
    ],
    subtotal: 750,
    discount: 37.5,
    total: 712.5,
    status: "pending",
    notes: "Awaiting delivery",
    createdAt: "2026-03-10",
  },
];

let counter = 4;

export const usePurchaseStore = create<PurchaseStore>((set) => ({
  purchases: initialPurchases,

  addPurchase: (p) =>
    set((s) => ({
      purchases: [
        ...s.purchases,
        {
          ...p,
          id: `pu-${Date.now()}`,
          purchaseNo: `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(counter++).padStart(4, "0")}`,
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ],
    })),

  updatePurchase: (id, data) =>
    set((s) => ({
      purchases: s.purchases.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),

  deletePurchase: (id) =>
    set((s) => ({ purchases: s.purchases.filter((p) => p.id !== id) })),
}));

import { create } from "zustand";

export interface Medicine {
  id: string;
  name: string;
  generic: string;
  category: string;
  company: string;
  batch: string;
  expiry: string;
  stock: number;
  lowStockThreshold: number;
  purchasePrice: number;
  price: number;
  discount: number;
  createdAt: string;
}

export type MedicineStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Expired" | "Expiring Soon";

export const getMedicineStatus = (m: Medicine): MedicineStatus => {
  const today = new Date();
  const expiry = new Date(m.expiry);
  const days = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "Expired";
  if (m.stock === 0) return "Out of Stock";
  if (days <= 90) return "Expiring Soon";
  if (m.stock <= m.lowStockThreshold) return "Low Stock";
  return "In Stock";
};

export const MEDICINE_CATEGORIES = [
  "Analgesic",
  "Antibiotic",
  "Antacid",
  "Antidiabetic",
  "Antihistamine",
  "Antihypertensive",
  "NSAID",
  "Statin",
  "Vitamin",
  "Other",
];

interface MedicineStore {
  medicines: Medicine[];
  addMedicine: (m: Omit<Medicine, "id" | "createdAt">) => void;
  updateMedicine: (id: string, m: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
}

const initialMedicines: Medicine[] = [
  { id: "m-001", name: "Paracetamol 500mg", generic: "Acetaminophen", category: "Analgesic", company: "PharmaCo International", batch: "B-2024-001", expiry: "2027-03-15", stock: 450, lowStockThreshold: 50, purchasePrice: 1.2, price: 2.5, discount: 0, createdAt: "2024-01-10" },
  { id: "m-002", name: "Amoxicillin 250mg", generic: "Amoxicillin", category: "Antibiotic", company: "MedLife Sciences", batch: "B-2024-012", expiry: "2026-08-20", stock: 280, lowStockThreshold: 50, purchasePrice: 3.0, price: 5.75, discount: 0, createdAt: "2024-02-05" },
  { id: "m-003", name: "Omeprazole 20mg", generic: "Omeprazole", category: "Antacid", company: "HealthPlus Pharma", batch: "B-2024-023", expiry: "2026-08-10", stock: 12, lowStockThreshold: 30, purchasePrice: 1.8, price: 3.2, discount: 0, createdAt: "2024-03-12" },
  { id: "m-004", name: "Metformin 500mg", generic: "Metformin HCl", category: "Antidiabetic", company: "PharmaCo International", batch: "B-2024-034", expiry: "2025-03-01", stock: 0, lowStockThreshold: 40, purchasePrice: 2.5, price: 4.1, discount: 0, createdAt: "2024-01-22" },
  { id: "m-005", name: "Cetirizine 10mg", generic: "Cetirizine", category: "Antihistamine", company: "MedLife Sciences", batch: "B-2024-045", expiry: "2027-12-01", stock: 620, lowStockThreshold: 80, purchasePrice: 0.9, price: 1.8, discount: 0, createdAt: "2024-04-08" },
  { id: "m-006", name: "Losartan 50mg", generic: "Losartan Potassium", category: "Antihypertensive", company: "CardioMed Labs", batch: "B-2024-056", expiry: "2027-06-15", stock: 195, lowStockThreshold: 40, purchasePrice: 3.5, price: 6.4, discount: 0, createdAt: "2024-05-15" },
  { id: "m-007", name: "Ibuprofen 400mg", generic: "Ibuprofen", category: "NSAID", company: "HealthPlus Pharma", batch: "B-2024-067", expiry: "2026-07-20", stock: 8, lowStockThreshold: 30, purchasePrice: 1.4, price: 2.9, discount: 0, createdAt: "2024-06-01" },
  { id: "m-008", name: "Atorvastatin 10mg", generic: "Atorvastatin", category: "Statin", company: "CardioMed Labs", batch: "B-2024-078", expiry: "2027-09-30", stock: 340, lowStockThreshold: 50, purchasePrice: 4.2, price: 7.5, discount: 0, createdAt: "2024-07-19" },
];

export const useMedicineStore = create<MedicineStore>((set) => ({
  medicines: initialMedicines,

  addMedicine: (m) =>
    set((s) => ({
      medicines: [
        ...s.medicines,
        { ...m, id: `m-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) },
      ],
    })),

  updateMedicine: (id, data) =>
    set((s) => ({
      medicines: s.medicines.map((m) => (m.id === id ? { ...m, ...data } : m)),
    })),

  deleteMedicine: (id) =>
    set((s) => ({ medicines: s.medicines.filter((m) => m.id !== id) })),

  adjustStock: (id, delta) =>
    set((s) => ({
      medicines: s.medicines.map((m) =>
        m.id === id ? { ...m, stock: Math.max(0, m.stock + delta) } : m
      ),
    })),
}));

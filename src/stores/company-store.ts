import { create } from "zustand";

export interface Company {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  status: "active" | "inactive";
  totalOrders: number;
  totalValue: number;
  lastSupply: string;
  createdAt: string;
}

interface CompanyStore {
  companies: Company[];
  addCompany: (c: Omit<Company, "id" | "createdAt" | "totalOrders" | "totalValue" | "lastSupply">) => void;
  updateCompany: (id: string, c: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  toggleStatus: (id: string) => void;
}

const initialCompanies: Company[] = [
  {
    id: "co-001",
    name: "PharmaCo International",
    contactPerson: "John Richardson",
    phone: "+1 555-1001",
    email: "supply@pharmaco.com",
    address: "100 Pharma Drive, Industrial Zone",
    city: "New York",
    status: "active",
    totalOrders: 48,
    totalValue: 125400,
    lastSupply: "2026-02-28",
    createdAt: "2022-05-10",
  },
  {
    id: "co-002",
    name: "MedLife Sciences",
    contactPerson: "Sarah Bennett",
    phone: "+1 555-1002",
    email: "orders@medlife.com",
    address: "250 Health Blvd, Suite 4",
    city: "Chicago",
    status: "active",
    totalOrders: 35,
    totalValue: 89200,
    lastSupply: "2026-03-01",
    createdAt: "2023-01-15",
  },
  {
    id: "co-003",
    name: "HealthPlus Pharma",
    contactPerson: "David Lee",
    phone: "+1 555-1003",
    email: "info@healthplus.com",
    address: "78 Wellness Street",
    city: "Los Angeles",
    status: "active",
    totalOrders: 22,
    totalValue: 54300,
    lastSupply: "2026-02-15",
    createdAt: "2023-06-20",
  },
  {
    id: "co-004",
    name: "CardioMed Labs",
    contactPerson: "Emily Zhang",
    phone: "+1 555-1004",
    email: "supply@cardiomed.com",
    address: "400 Research Park",
    city: "Boston",
    status: "inactive",
    totalOrders: 12,
    totalValue: 31800,
    lastSupply: "2025-11-10",
    createdAt: "2024-02-01",
  },
  {
    id: "co-005",
    name: "GeneriCure Ltd",
    contactPerson: "Omar Patel",
    phone: "+1 555-1005",
    email: "orders@genericure.com",
    address: "55 Generic Lane",
    city: "Houston",
    status: "active",
    totalOrders: 18,
    totalValue: 42600,
    lastSupply: "2026-02-20",
    createdAt: "2024-04-12",
  },
];

export const useCompanyStore = create<CompanyStore>((set) => ({
  companies: initialCompanies,

  addCompany: (c) =>
    set((s) => ({
      companies: [
        ...s.companies,
        {
          ...c,
          id: `co-${Date.now()}`,
          totalOrders: 0,
          totalValue: 0,
          lastSupply: "—",
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ],
    })),

  updateCompany: (id, data) =>
    set((s) => ({
      companies: s.companies.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),

  deleteCompany: (id) =>
    set((s) => ({ companies: s.companies.filter((c) => c.id !== id) })),

  toggleStatus: (id) =>
    set((s) => ({
      companies: s.companies.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "active" ? "inactive" : "active" }
          : c
      ),
    })),
}));

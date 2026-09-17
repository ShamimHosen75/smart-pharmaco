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
    name: "Square Pharmaceuticals Ltd",
    contactPerson: "Md. Rafiqul Islam",
    phone: "+880 1711-101010",
    email: "supply@squarepharma.com.bd",
    address: "Square Centre, 48 Mohakhali C/A",
    city: "Dhaka",
    status: "active",
    totalOrders: 48,
    totalValue: 4850000,
    lastSupply: "2026-02-28",
    createdAt: "2022-05-10",
  },
  {
    id: "co-002",
    name: "Beximco Pharmaceuticals Ltd",
    contactPerson: "Nusrat Jahan",
    phone: "+880 1712-202020",
    email: "orders@beximcopharma.com",
    address: "19 Dhanmondi R/A, Road 7",
    city: "Dhaka",
    status: "active",
    totalOrders: 35,
    totalValue: 3120000,
    lastSupply: "2026-03-01",
    createdAt: "2023-01-15",
  },
  {
    id: "co-003",
    name: "Incepta Pharmaceuticals Ltd",
    contactPerson: "Shahriar Kabir",
    phone: "+880 1713-303030",
    email: "info@inceptapharma.com",
    address: "40 Shahid Tajuddin Ahmed Sarani, Tejgaon",
    city: "Dhaka",
    status: "active",
    totalOrders: 22,
    totalValue: 1980000,
    lastSupply: "2026-02-15",
    createdAt: "2023-06-20",
  },
  {
    id: "co-004",
    name: "Renata Limited",
    contactPerson: "Tasnim Ara",
    phone: "+880 1714-404040",
    email: "supply@renata.com.bd",
    address: "Plot 1, Milk Vita Road, Mirpur 7",
    city: "Dhaka",
    status: "inactive",
    totalOrders: 12,
    totalValue: 940000,
    lastSupply: "2025-11-10",
    createdAt: "2024-02-01",
  },
  {
    id: "co-005",
    name: "ACI Pharmaceuticals Ltd",
    contactPerson: "Anisur Rahman",
    phone: "+880 1715-505050",
    email: "orders@aci-bd.com",
    address: "245 Tejgaon Industrial Area",
    city: "Chattogram",
    status: "active",
    totalOrders: 18,
    totalValue: 1360000,
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

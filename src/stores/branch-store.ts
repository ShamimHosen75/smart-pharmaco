import { create } from "zustand";

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  manager: string;
  email: string;
  status: "active" | "inactive";
  createdAt: string;
}

interface BranchStore {
  branches: Branch[];
  currentBranchId: string;
  setCurrentBranch: (id: string) => void;
  addBranch: (b: Omit<Branch, "id" | "createdAt">) => void;
  updateBranch: (id: string, b: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;
  toggleStatus: (id: string) => void;
}

const initialBranches: Branch[] = [
  {
    id: "br-001",
    name: "Main Branch",
    address: "123 Medical Plaza, Block A",
    city: "Downtown",
    phone: "+1 555-0100",
    manager: "Dr. Sarah Ahmed",
    email: "main@medicore.com",
    status: "active",
    createdAt: "2023-01-15",
  },
  {
    id: "br-002",
    name: "North Wing Pharmacy",
    address: "456 Health Avenue, Suite 12",
    city: "Northside",
    phone: "+1 555-0200",
    manager: "Ali Hassan",
    email: "north@medicore.com",
    status: "active",
    createdAt: "2023-06-20",
  },
  {
    id: "br-003",
    name: "City Center Outlet",
    address: "789 Commerce Street",
    city: "City Center",
    phone: "+1 555-0300",
    manager: "Fatima Khan",
    email: "citycenter@medicore.com",
    status: "inactive",
    createdAt: "2024-02-10",
  },
];

export const useBranchStore = create<BranchStore>((set) => ({
  branches: initialBranches,

  addBranch: (b) =>
    set((s) => ({
      branches: [
        ...s.branches,
        {
          ...b,
          id: `br-${Date.now()}`,
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ],
    })),

  updateBranch: (id, data) =>
    set((s) => ({
      branches: s.branches.map((b) => (b.id === id ? { ...b, ...data } : b)),
    })),

  deleteBranch: (id) =>
    set((s) => ({ branches: s.branches.filter((b) => b.id !== id) })),

  toggleStatus: (id) =>
    set((s) => ({
      branches: s.branches.map((b) =>
        b.id === id
          ? { ...b, status: b.status === "active" ? "inactive" : "active" }
          : b
      ),
    })),
}));

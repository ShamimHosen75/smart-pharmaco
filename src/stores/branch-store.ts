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
    name: "Dhanmondi Main Branch",
    address: "House 12, Road 5, Dhanmondi",
    city: "Dhaka",
    phone: "+880 1711-000100",
    manager: "Dr. Sharmin Ahmed",
    email: "dhanmondi@medicore.com.bd",
    status: "active",
    createdAt: "2023-01-15",
  },
  {
    id: "br-002",
    name: "Uttara Branch",
    address: "Sector 7, Road 14, Uttara",
    city: "Dhaka",
    phone: "+880 1712-000200",
    manager: "Mahbub Alam",
    email: "uttara@medicore.com.bd",
    status: "active",
    createdAt: "2023-06-20",
  },
  {
    id: "br-003",
    name: "Chattogram Outlet",
    address: "GEC Circle, Nasirabad",
    city: "Chattogram",
    phone: "+880 1713-000300",
    manager: "Farhana Khan",
    email: "chattogram@medicore.com.bd",
    status: "inactive",
    createdAt: "2024-02-10",
  },
];

export const useBranchStore = create<BranchStore>((set) => ({
  branches: initialBranches,
  currentBranchId: initialBranches[0].id,
  setCurrentBranch: (id) => set({ currentBranchId: id }),



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

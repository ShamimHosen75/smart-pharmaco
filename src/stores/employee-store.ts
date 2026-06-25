import { create } from "zustand";

export type Role = "Super Admin" | "Branch Admin" | "Pharmacist" | "Sales Staff" | "Accountant";
export type AttendanceStatus = "present" | "absent" | "late" | "leave";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  branch: string;
  salary: number;
  joinDate: string;
  status: "active" | "inactive";
}

export interface AttendanceRecord {
  employeeId: string;
  date: string; // yyyy-MM-dd
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
}

export const ROLES: Role[] = [
  "Super Admin",
  "Branch Admin",
  "Pharmacist",
  "Sales Staff",
  "Accountant",
];

const initialEmployees: Employee[] = [
  { id: "1", name: "Dr. Ahmed Khan", email: "ahmed@medicore.com", phone: "+1 555 100 0001", role: "Super Admin", branch: "Main Branch", salary: 8500, joinDate: "2023-01-15", status: "active" },
  { id: "2", name: "Sara Ali", email: "sara@medicore.com", phone: "+1 555 100 0002", role: "Pharmacist", branch: "Main Branch", salary: 5200, joinDate: "2023-03-20", status: "active" },
  { id: "3", name: "Omar Hassan", email: "omar@medicore.com", phone: "+1 555 100 0003", role: "Sales Staff", branch: "Main Branch", salary: 3200, joinDate: "2023-06-10", status: "active" },
  { id: "4", name: "Fatima Noor", email: "fatima@medicore.com", phone: "+1 555 100 0004", role: "Branch Admin", branch: "North Wing Pharmacy", salary: 6000, joinDate: "2023-08-01", status: "active" },
  { id: "5", name: "Yusuf Iqbal", email: "yusuf@medicore.com", phone: "+1 555 100 0005", role: "Pharmacist", branch: "North Wing Pharmacy", salary: 5000, joinDate: "2024-01-12", status: "active" },
  { id: "6", name: "Lina Saeed", email: "lina@medicore.com", phone: "+1 555 100 0006", role: "Accountant", branch: "Main Branch", salary: 4500, joinDate: "2024-02-20", status: "active" },
  { id: "7", name: "Tariq Mahmoud", email: "tariq@medicore.com", phone: "+1 555 100 0007", role: "Sales Staff", branch: "City Center Outlet", salary: 3000, joinDate: "2024-05-15", status: "inactive" },
];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function ymd(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function seedAttendance(employees: Employee[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const now = new Date();
  const statuses: AttendanceStatus[] = ["present", "present", "present", "present", "late", "absent", "leave"];
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const d = new Date(now);
    d.setDate(d.getDate() - dayOffset);
    if (d.getDay() === 0) continue;
    const dateStr = ymd(d);
    for (const emp of employees) {
      if (emp.status === "inactive") continue;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      records.push({
        employeeId: emp.id,
        date: dateStr,
        status,
        checkIn: status === "present" ? "09:00" : status === "late" ? "09:45" : undefined,
        checkOut: status === "present" || status === "late" ? "18:00" : undefined,
      });
    }
  }
  return records;
}

interface EmployeeStore {
  employees: Employee[];
  attendance: AttendanceRecord[];
  addEmployee: (e: Omit<Employee, "id" | "joinDate" | "status"> & { status?: Employee["status"] }) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  toggleStatus: (id: string) => void;
  markAttendance: (employeeId: string, date: string, status: AttendanceStatus) => void;
}

export const useEmployeeStore = create<EmployeeStore>((set) => ({
  employees: initialEmployees,
  attendance: seedAttendance(initialEmployees),

  addEmployee: (e) =>
    set((s) => ({
      employees: [
        ...s.employees,
        {
          ...e,
          id: crypto.randomUUID(),
          joinDate: ymd(new Date()),
          status: e.status ?? "active",
        },
      ],
    })),

  updateEmployee: (id, data) =>
    set((s) => ({
      employees: s.employees.map((e) => (e.id === id ? { ...e, ...data } : e)),
    })),

  deleteEmployee: (id) =>
    set((s) => ({
      employees: s.employees.filter((e) => e.id !== id),
      attendance: s.attendance.filter((a) => a.employeeId !== id),
    })),

  toggleStatus: (id) =>
    set((s) => ({
      employees: s.employees.map((e) =>
        e.id === id ? { ...e, status: e.status === "active" ? "inactive" : "active" } : e
      ),
    })),

  markAttendance: (employeeId, date, status) =>
    set((s) => {
      const now = new Date();
      const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      const record: AttendanceRecord = {
        employeeId,
        date,
        status,
        checkIn: status === "present" ? "09:00" : status === "late" ? time : undefined,
        checkOut: undefined,
      };
      const idx = s.attendance.findIndex((a) => a.employeeId === employeeId && a.date === date);
      if (idx >= 0) {
        const updated = [...s.attendance];
        updated[idx] = record;
        return { attendance: updated };
      }
      return { attendance: [...s.attendance, record] };
    }),
}));

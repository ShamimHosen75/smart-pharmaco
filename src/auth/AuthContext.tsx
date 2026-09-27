import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

export type StaffRole = "super_admin" | "branch_admin" | "pharmacist" | "sales_staff" | "accountant";
type Profile = Tables<"profiles">;
type AuthState = { user: User | null; profile: Profile | null; role: StaffRole | null; assignedBranches: string[]; loading: boolean; refresh: () => Promise<void>; signOut: () => Promise<void> };
const AuthContext = createContext<AuthState | null>(null);
let loadSequence = 0;
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<StaffRole | null>(null);
  const [assignedBranches, setAssignedBranches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    const sequence = ++loadSequence;
    setLoading(true);
    const { data: { user: current }, error } = await supabase.auth.getUser();
    if (sequence !== loadSequence) return;
    if (error || !current) { setUser(null); setProfile(null); setRole(null); setAssignedBranches([]); setLoading(false); return; }
    setUser(current);
    await supabase.rpc("claim_staff_account");
    const [{ data: person }, { data: access }, { data: assignments }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", current.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", current.id).maybeSingle(),
      supabase.from("staff_branch_assignments").select("branch_name").eq("user_id", current.id),
    ]);
    if (sequence !== loadSequence) return;
    setProfile(person?.is_active ? person : null);
    setAssignedBranches(person?.is_active ? (assignments ?? []).map((a) => a.branch_name) : []);
    setRole(person?.is_active && assignments?.length ? (access?.role ?? null) : null);
    setLoading(false);
  };
  useEffect(() => {
    void refresh();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { setTimeout(() => void refresh(), 0); });
    const onFocus = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onFocus);
    return () => { subscription.unsubscribe(); document.removeEventListener("visibilitychange", onFocus); loadSequence++; };
  }, []);
  const signOut = async () => { await supabase.auth.signOut(); setProfile(null); setRole(null); setAssignedBranches([]); setUser(null); };
  return <AuthContext.Provider value={{ user, profile, role, assignedBranches, loading, refresh, signOut }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const state = useContext(AuthContext); if (!state) throw new Error("AuthProvider missing"); return state; }

export const accessByRole: Record<StaffRole, string[]> = {
  super_admin: ["/", "/pos", "/returns", "/receipts", "/medicines", "/companies", "/purchases", "/alerts", "/customers", "/employees", "/accounting", "/reports", "/branches", "/subscriptions", "/settings"],
  branch_admin: ["/", "/pos", "/returns", "/receipts", "/medicines", "/companies", "/purchases", "/alerts", "/customers", "/employees", "/reports", "/branches", "/settings"],
  pharmacist: ["/", "/pos", "/returns", "/receipts", "/medicines", "/alerts", "/customers", "/settings"],
  sales_staff: ["/", "/pos", "/returns", "/receipts", "/customers", "/settings"],
  accountant: ["/", "/receipts", "/purchases", "/accounting", "/reports", "/settings"],
};
export const roleName: Record<StaffRole, string> = { super_admin: "Super Admin", branch_admin: "Branch Admin", pharmacist: "Pharmacist", sales_staff: "Sales Staff", accountant: "Accountant" };

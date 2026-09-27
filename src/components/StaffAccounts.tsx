import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, roleName, type StaffRole } from "@/auth/AuthContext";
import type { Tables } from "@/integrations/supabase/types";
import { useBranchStore } from "@/stores/branch-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import StaffAccessRecommendation from "@/components/StaffAccessRecommendation";

type Invitation = Tables<"staff_invitations">;
type Assignment = Tables<"staff_branch_assignments">;
export default function StaffAccounts() {
  const { role, user, assignedBranches, refresh } = useAuth();
  const branches = useBranchStore((s) => s.branches);
  const [list, setList] = useState<Invitation[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [assignedRole, setAssignedRole] = useState<StaffRole>("sales_staff");
  const [branch, setBranch] = useState("");
  const [extraBranches, setExtraBranches] = useState<string[]>([]);
  const allowed: StaffRole[] = role === "super_admin" ? ["super_admin", "branch_admin", "pharmacist", "sales_staff", "accountant"] : ["branch_admin", "pharmacist", "sales_staff", "accountant"];
  const available = branches.filter((b) => b.status === "active" && (role === "super_admin" || assignedBranches.includes(b.name)));
  const primary = available.some((b) => b.name === branch) ? branch : available[0]?.name;
  const load = useCallback(async () => {
    const [invites, assigned] = await Promise.all([
      supabase.from("staff_invitations").select("*").order("created_at", { ascending: false }),
      supabase.from("staff_branch_assignments").select("*"),
    ]);
    if (invites.error || assigned.error) toast({ title: invites.error?.message ?? assigned.error?.message, variant: "destructive" });
    else { setList(invites.data ?? []); setAssignments(assigned.data ?? []); }
  }, []);
  useEffect(() => { if (role === "super_admin" || role === "branch_admin") void load(); }, [role, load]);
  if (role !== "super_admin" && role !== "branch_admin") return <p className="text-sm text-muted-foreground">Only administrators can manage staff accounts.</p>;
  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!primary) return;
    setBusy(true);
    const { error } = await supabase.from("staff_invitations").insert({ email: email.trim().toLowerCase(), full_name: name.trim(), role: assignedRole, branch: primary });
    setBusy(false);
    if (error) toast({ title: error.message, variant: "destructive" });
    else {
      // Additional locations can be assigned after the staff member activates their account.
      setEmail(""); setName(""); setExtraBranches([]);
      toast({ title: "Staff invitation created", description: "Add other branches after this account is activated." });
      void load();
    }
  };
  const change = async (invite: Invitation, patch: Partial<Invitation>) => {
    const next = { ...invite, ...patch };
    setBusy(true);
    const { error } = await supabase.rpc("manage_staff_invitation", { _id: invite.id, _email: next.email, _name: next.full_name, _role: next.role, _branch: next.branch, _status: next.status });
    setBusy(false);
    if (error) toast({ title: error.message, variant: "destructive" });
    else { toast({ title: "Staff access updated" }); await load(); if (invite.claimed_by === user?.id) await refresh(); }
  };
  const toggleAssignment = async (invite: Invitation, branchName: string, checked: boolean) => {
    if (!invite.claimed_by) return;
    setBusy(true);
    const result = checked
      ? await supabase.from("staff_branch_assignments").insert({ user_id: invite.claimed_by, branch_name: branchName })
      : await supabase.from("staff_branch_assignments").delete().eq("user_id", invite.claimed_by).eq("branch_name", branchName);
    setBusy(false);
    if (result.error) toast({ title: result.error.message, variant: "destructive" });
    else { await load(); if (invite.claimed_by === user?.id) await refresh(); }
  };
  return <div className="space-y-6">
    <StaffAccessRecommendation onUse={(recommended) => { setAssignedRole(recommended); document.getElementById("invite-name")?.focus(); }} />
    <section><h3 className="text-sm font-semibold">Create staff account</h3><p className="mb-3 text-xs text-muted-foreground">Add an email, then ask the staff member to activate their account on the sign-in screen.</p>
      <form onSubmit={(e) => void add(e)} className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1"><Label htmlFor="invite-name">Full name</Label><Input id="invite-name" required value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="space-y-1"><Label htmlFor="invite-email">Email</Label><Input id="invite-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-1"><Label>Role</Label><Select value={assignedRole} onValueChange={(v) => setAssignedRole(v as StaffRole)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{allowed.map((r) => <SelectItem key={r} value={r}>{roleName[r]}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1"><Label>Primary branch</Label><Select value={primary} onValueChange={setBranch}><SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger><SelectContent>{available.map((b) => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}</SelectContent></Select></div>
        <Button type="submit" disabled={busy || !primary} className="sm:col-span-2 sm:w-fit"><Plus /> Add staff account</Button>
      </form>
    </section>
    <section className="space-y-2 border-t border-border pt-5"><h3 className="text-sm font-semibold">Staff access</h3>
      {list.map((invite) => {
        const assigned = assignments.filter((a) => a.user_id === invite.claimed_by).map((a) => a.branch_name);
        const editable = !busy && invite.claimed_by !== user?.id && (role === "super_admin" || invite.role !== "super_admin");
        return <div key={invite.id} className="space-y-3 rounded-md border border-border p-3">
          <div className="flex flex-wrap items-center gap-3"><div className="min-w-[150px] flex-1"><p className="text-sm font-medium">{invite.full_name}</p><p className="break-all text-xs text-muted-foreground">{invite.email} · {invite.branch}</p></div>
            <Select value={invite.role} onValueChange={(v) => void change(invite, { role: v as StaffRole })} disabled={!editable}><SelectTrigger className="w-40" aria-label={`Role for ${invite.full_name}`}><SelectValue /></SelectTrigger><SelectContent>{allowed.map((r) => <SelectItem key={r} value={r}>{roleName[r]}</SelectItem>)}</SelectContent></Select>
            <Select value={invite.branch} onValueChange={(v) => void change(invite, { branch: v })} disabled={!editable}><SelectTrigger className="w-40" aria-label={`Primary branch for ${invite.full_name}`}><SelectValue /></SelectTrigger><SelectContent>{available.filter((b) => b.name === invite.branch || b.status === "active").map((b) => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}</SelectContent></Select>
            <Select value={invite.status} onValueChange={(v) => void change(invite, { status: v })} disabled={!editable}><SelectTrigger className="w-32" aria-label={`Status for ${invite.full_name}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value={invite.claimed_by ? "claimed" : "pending"}>{invite.claimed_by ? "Active" : "Pending"}</SelectItem><SelectItem value="disabled">Disabled</SelectItem></SelectContent></Select>
          </div>
          {invite.claimed_by && <div><p className="mb-2 text-xs font-medium text-muted-foreground">Assigned branches</p><div className="flex flex-wrap gap-x-5 gap-y-2">{available.map((b) => <label key={b.id} className="flex items-center gap-2 text-sm"><Checkbox checked={assigned.includes(b.name)} disabled={!editable || (assigned.includes(b.name) && b.name === invite.branch)} onCheckedChange={(v) => void toggleAssignment(invite, b.name, v === true)} aria-label={`${b.name} for ${invite.full_name}`} />{b.name}{b.name === invite.branch ? " (primary)" : ""}</label>)}</div></div>}
          {!invite.claimed_by && <p className="text-xs text-muted-foreground">Other branches can be assigned after account activation.</p>}
        </div>;
      })}
      {list.length === 0 && <p className="text-xs text-muted-foreground">No invitations yet.</p>}
    </section>
  </div>;
}

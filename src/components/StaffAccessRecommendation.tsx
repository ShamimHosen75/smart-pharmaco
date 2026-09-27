import { useState } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { roleName, type StaffRole } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Recommendation = { role: StaffRole; rationale: string; gaps: string[]; permissions: string[] };
const recommendable: StaffRole[] = ["sales_staff", "pharmacist", "accountant", "branch_admin"];
export default function StaffAccessRecommendation({ onUse }: { onUse: (role: StaffRole) => void }) {
  const [duties, setDuties] = useState("");
  const [result, setResult] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recommend = async () => {
    setError(""); setResult(null); setLoading(true);
    try {
      const { data, error: requestError } = await supabase.functions.invoke("recommend-staff-access", { body: { duties: duties.trim() } });
      if (requestError) {
        const response = await requestError.context?.json?.().catch(() => null);
        throw new Error(response?.error || requestError.message);
      }
      if (!data || !recommendable.includes(data.role) || !Array.isArray(data.permissions) || !Array.isArray(data.gaps)) throw new Error("No valid recommendation was returned.");
      setResult(data as Recommendation);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Recommendation unavailable."); }
    finally { setLoading(false); }
  };
  return <section className="space-y-3 border-b border-border pb-5">
    <div><h3 className="text-sm font-semibold">Recommend staff access</h3><p className="text-xs text-muted-foreground">Describe duties without personal or patient information. Recommendations are advisory; access changes only when an administrator saves them.</p></div>
    <div className="space-y-1"><Label htmlFor="staff-duties">Staff duties</Label><Textarea id="staff-duties" rows={3} maxLength={2000} value={duties} placeholder="e.g. Process counter sales and refunds, but do not manage inventory or staff." onChange={(e) => { setDuties(e.target.value); setResult(null); setError(""); }} /></div>
    <Button type="button" variant="outline" disabled={loading || duties.trim().length < 15} onClick={() => void recommend()}><Sparkles className="h-4 w-4"/>{loading ? "Reviewing duties…" : "Recommend role"}</Button>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {result && <div className="space-y-3 rounded-md border border-border bg-muted/30 p-4" aria-live="polite"><div><p className="text-xs font-medium text-muted-foreground">Recommended role</p><p className="text-base font-semibold">{roleName[result.role]}</p><p className="mt-1 text-sm">{result.rationale}</p></div><div><p className="text-xs font-semibold">Included access</p><ul className="list-inside list-disc text-sm text-muted-foreground">{result.permissions.map((permission) => <li key={permission}>{permission}</li>)}</ul></div>{result.gaps.length > 0 && <div><p className="text-xs font-semibold text-destructive">Duties not covered by this role</p><ul className="list-inside list-disc text-sm">{result.gaps.map((gap, i) => <li key={i}>{gap}</li>)}</ul></div>}<p className="text-xs text-muted-foreground">Page-level access only. Branch separation of operational data is not enforced yet.</p><Button type="button" size="sm" variant="outline" onClick={() => onUse(result.role)}>Use for new staff account</Button></div>}
  </section>;
}

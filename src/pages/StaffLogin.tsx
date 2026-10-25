import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function StaffLogin() {
  const { user, role, loading, signOut } = useAuth();
  const [mode, setMode] = useState<"sign-in" | "activate">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  if (!loading && role) return <Navigate to="/" replace />;
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage("");
    const result = mode === "activate"
      ? await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (result.error) setMessage(result.error.message);
    else if (mode === "activate") setMessage("Check your email to confirm your account, then sign in. Access requires a staff invitation.");
    else setMessage("Signed in. Checking your staff invitation…");
    setBusy(false);
  };
  return <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8"><div className="w-full max-w-sm space-y-6 rounded-md border border-border bg-card p-6 shadow-sm">
    <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground"><ShieldCheck /></span><div><h1 className="font-heading text-xl font-bold">MediCore</h1><p className="text-xs text-muted-foreground">Staff access</p></div></div>
    {user && !role && !loading ? <div className="space-y-4"><p className="text-sm text-muted-foreground">This account has no active staff invitation. Ask an administrator to add your email in Settings → Staff accounts.</p><Button variant="outline" onClick={() => void signOut()}>Sign out</Button></div> : <><div><h2 className="text-lg font-semibold">{mode === "sign-in" ? "Sign in" : "Activate invited account"}</h2><p className="text-xs text-muted-foreground">Only invited staff can access the pharmacy.</p></div><form onSubmit={(e) => void submit(e)} className="space-y-4"><div className="space-y-1.5"><Label htmlFor="staff-email">Email</Label><Input id="staff-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}/></div><div className="space-y-1.5"><Label htmlFor="staff-password">Password</Label><Input id="staff-password" type="password" required minLength={6} autoComplete={mode === "activate" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)}/></div>{message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}<Button type="submit" disabled={busy} className="w-full">{busy ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Activate account"}</Button></form><Button variant="link" className="px-0" onClick={() => { setMode(mode === "sign-in" ? "activate" : "sign-in"); setMessage(""); }}>{mode === "sign-in" ? "Have an invitation? Activate account" : "Already activated? Sign in"}</Button><div className="border-t border-border pt-4"><Button variant="outline" className="w-full" onClick={async () => { setMessage(""); const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin }); if (result.error) setMessage(result.error.message); }}>Continue with Google</Button></div></>}
  </div></div>;
}

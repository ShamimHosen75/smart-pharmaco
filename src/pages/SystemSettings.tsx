import { useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth, roleName } from "@/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StaffAccounts from "@/components/StaffAccounts";
import { Link, useSearchParams } from "react-router-dom";
import { useSettingsStore } from "@/stores/settings-store";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Activity, Bell, Building2, Check, ChevronRight, CreditCard, Download, Globe,
  KeyRound, Link2, LockKeyhole, Megaphone, MessageCircle, Package, Palette,
  Plug, Receipt, Search, Settings2, ShieldCheck, ShoppingCart, Store,
  UploadCloud, UserRound, Users, Workflow, X, type LucideIcon,
} from "lucide-react";

type Section = "profile" | "staff" | "account" | "security" | "subscription" | "store" | "items" | "receipt" | "appearance" | "notifications" | "social" | "campaigns" | "metaAds" | "metaLeads" | "whatsapp" | "automations" | "integrations" | "pixels" | "api";
const groups: { label: string; items: { id: Section; label: string; icon: LucideIcon }[] }[] = [
  { label: "Account", items: [{ id: "profile", label: "Profile", icon: UserRound }, { id: "staff", label: "Staff accounts", icon: Users }, { id: "account", label: "Account", icon: Users }, { id: "security", label: "Security", icon: ShieldCheck }] },
  { label: "Billing", items: [{ id: "subscription", label: "Subscription", icon: CreditCard }] },
  { label: "Workspace", items: [{ id: "store", label: "POS & Store", icon: Store }, { id: "items", label: "Menu Items", icon: Package }, { id: "receipt", label: "Receipt", icon: Receipt }, { id: "appearance", label: "Appearance", icon: Palette }, { id: "notifications", label: "Notifications", icon: Bell }] },
  { label: "Marketing", items: [{ id: "social", label: "Social Overview", icon: Activity }, { id: "campaigns", label: "Campaigns", icon: Megaphone }, { id: "metaAds", label: "Meta Ads", icon: Megaphone }, { id: "metaLeads", label: "Meta Leads", icon: Users }, { id: "whatsapp", label: "WhatsApp", icon: MessageCircle }, { id: "automations", label: "Automations", icon: Workflow }] },
  { label: "Integrations", items: [{ id: "integrations", label: "Integrations", icon: Plug }, { id: "pixels", label: "Meta Pixels & Datasets", icon: Activity }, { id: "api", label: "API & Webhooks", icon: KeyRound }] },
];
const titles: Record<Section, { title: string; description: string; icon: LucideIcon }> = {
  profile: { title: "Profile details", description: "Manage your personal details and profile picture.", icon: UserRound },
  staff: { title: "Staff accounts", description: "Invite staff and manage their access.", icon: Users },
  account: { title: "Account settings", description: "Currency, tax and regional preferences.", icon: Globe },
  security: { title: "Security", description: "Account access and protection.", icon: ShieldCheck },
  subscription: { title: "Subscription", description: "Your plans and billing workspace.", icon: CreditCard },
  store: { title: "POS & Store", description: "Pharmacy identity and sales preferences.", icon: Store },
  items: { title: "Menu Items", description: "Manage medicines and inventory.", icon: Package },
  receipt: { title: "Receipt", description: "Printed invoice and receipt details.", icon: Receipt },
  appearance: { title: "Appearance", description: "Personalize the workspace colors and corners.", icon: Palette },
  notifications: { title: "Notifications", description: "Choose the alerts you want to receive.", icon: Bell },
  social: { title: "Social Overview", description: "Your pharmacy's customer engagement preferences.", icon: Activity },
  campaigns: { title: "Campaigns", description: "Loyalty and promotion settings.", icon: Megaphone },
  metaAds: { title: "Meta Ads", description: "Advertising connection.", icon: Megaphone },
  metaLeads: { title: "Meta Leads", description: "Lead capture connection.", icon: Users },
  whatsapp: { title: "WhatsApp", description: "Messaging connection.", icon: MessageCircle },
  automations: { title: "Automations", description: "Workflow connections.", icon: Workflow },
  integrations: { title: "Integrations", description: "Connected services.", icon: Plug },
  pixels: { title: "Meta Pixels & Datasets", description: "Tracking connection.", icon: Activity },
  api: { title: "API & Webhooks", description: "Developer access.", icon: KeyRound },
};
const colors = [
  { name: "Blue", value: "217 91% 50%" }, { name: "Green", value: "160 60% 45%" },
  { name: "Coral", value: "12 76% 61%" }, { name: "Amber", value: "38 92% 50%" },
  { name: "Cyan", value: "185 80% 50%" }, { name: "Rose", value: "350 70% 55%" },
];
function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <div role="group" aria-label={label} className="min-w-0 space-y-1.5"><Label className="text-[11px] font-bold uppercase text-foreground">{label}</Label>{children}{hint && <p className="text-xs text-muted-foreground">{hint}</p>}</div>;
}
function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <div className="flex min-h-12 items-center justify-between gap-4 rounded-md border border-border px-3 py-2.5"><div className="min-w-0"><p className="text-sm font-medium">{label}</p>{hint && <p className="text-xs text-muted-foreground">{hint}</p>}</div>{children}</div>;
}
function Block({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section className="grid gap-4 border-b border-border py-5 last:border-b-0 sm:grid-cols-[160px_minmax(0,1fr)] lg:grid-cols-[180px_minmax(0,1fr)]">
    <div><h3 className="text-sm font-semibold">{title}</h3>{description && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>}</div>
    <div className="min-w-0 space-y-3">{children}</div>
  </section>;
}
function Unavailable({ subject }: { subject: string }) {
  return <Block title="Connection status" description="Online features are not yet connected.">
    <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-4"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"/><div><p className="text-sm font-medium">{subject} is not connected</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">This workspace currently stores its settings on this device. An online account and service connection are needed before this feature can work.</p></div></div>
  </Block>;
}

export default function SystemSettings() {
  const [params] = useSearchParams();
  const [active, setActive] = useState<Section>(params.get("section") === "staff" ? "staff" : "profile");
  const [search, setSearch] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const profile = useSettingsStore((s) => s.profile);
  const setProfile = useSettingsStore((s) => s.setProfile);
  const { profile: staffProfile, role, user, refresh } = useAuth();
  const [staffDraft, setStaffDraft] = useState<{ display_name: string; phone: string; job_title: string; bio: string } | null>(null);
  const own = staffDraft ?? { display_name: staffProfile?.display_name ?? "", phone: staffProfile?.phone ?? "", job_title: staffProfile?.job_title ?? "", bio: staffProfile?.bio ?? "" };
  const store = useSettingsStore((s) => s.storeInfo);
  const setStore = useSettingsStore((s) => s.setStoreInfo);
  const global = useSettingsStore((s) => s.global);
  const setGlobal = useSettingsStore((s) => s.setGlobal);
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const marketing = useSettingsStore((s) => s.marketing);
  const setMarketing = useSettingsStore((s) => s.setMarketing);
  const plans = useSubscriptionStore((s) => s.plans);
  const tenants = useSubscriptionStore((s) => s.tenants);
  const filtered = useMemo(() => groups.map((group) => ({ ...group, items: group.items.filter((item) => (role === "super_admin" || role === "branch_admin" || ["profile", "account", "security"].includes(item.id)) && item.label.toLowerCase().includes(search.toLowerCase().trim())) })).filter((group) => group.items.length), [search, role]);
  const section = titles[active];
  const Icon = section.icon;
  const exportConfig = () => {
    const data = { profile: { ...profile, avatar: undefined }, storeInfo: store, global, theme, marketing };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "medicore-settings.json"; a.click(); URL.revokeObjectURL(url);
  };
  const uploadAvatar = (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type) || file.size > 1024 * 1024) {
      toast({ title: "Choose an SVG, JPG or PNG under 1 MB", variant: "destructive" }); return;
    }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") setProfile({ avatar: reader.result }); };
    reader.readAsDataURL(file);
  };
  const saved = () => toast({ title: "Settings saved on this device" });
  const saveStaffProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update(own).eq("id", user.id);
    if (error) toast({ title: error.message, variant: "destructive" });
    else { await refresh(); setStaffDraft(null); toast({ title: "Profile saved" }); }
  };
  const link = (to: string, text: string) => <Button asChild variant="outline" size="sm"><Link to={to}>{text}<ChevronRight /></Link></Button>;

  return <div className="animate-fade-in min-h-full rounded-md border border-border bg-card p-4 sm:p-5">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-xl font-bold font-heading">Settings</h1><p className="text-xs text-muted-foreground">Everything about your pharmacy, workspace and growth tools.</p></div><Button variant="outline" size="sm" onClick={exportConfig}><Download /> Export config</Button></div>
    <div className="grid min-h-[680px] overflow-hidden rounded-md border border-border md:grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-[210px_minmax(0,1fr)]">
      <aside className="border-b border-border p-2.5 md:border-b-0 md:border-r"><Button variant="outline" className="mb-2 w-full justify-between md:hidden" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}><span className="flex items-center gap-2"><Settings2 className="h-4 w-4"/>{groups.flatMap((group) => group.items).find((item) => item.id === active)?.label}</span><ChevronRight className={cn("h-4 w-4 transition-transform", mobileNavOpen && "rotate-90")}/></Button><div className={cn("md:block", mobileNavOpen ? "block" : "hidden")}><div className="relative mb-3"><Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground"/><Input aria-label="Search settings" placeholder="Search settings..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-8 text-xs" /></div>
        <nav aria-label="Settings sections" className="space-y-3">{filtered.length ? filtered.map((group) => <div key={group.label}><p className="px-2 pb-1 text-[10px] font-bold uppercase text-muted-foreground">{group.label}</p><div className="space-y-0.5">{group.items.map((item) => <Button key={item.id} variant="ghost" size="sm" onClick={() => { setActive(item.id); setMobileNavOpen(false); }} aria-current={active === item.id ? "page" : undefined} className={cn("h-8 w-full justify-start gap-2 px-2 text-xs font-normal", active === item.id && "bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary")}><item.icon className="h-3.5 w-3.5"/>{item.label}{active === item.id && <ChevronRight className="ml-auto h-3 w-3"/>}</Button>)}</div></div>) : <p className="px-2 text-xs text-muted-foreground">No matching settings</p>}</nav></div>
      </aside>
      <div className="min-w-0"><div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4"/></span><div><h2 className="text-sm font-semibold">{section.title}</h2><p className="text-xs text-muted-foreground">{section.description}</p></div></div>
        <div className="px-4 sm:px-5">
           {active === "profile" && <>
             <Block title="Staff identity" description="Verified account and assigned access."><p className="text-sm">{staffProfile?.full_name} · {user?.email}</p><p className="text-xs text-muted-foreground">{role ? roleName[role] : "No assigned role"} · {staffProfile?.branch}</p></Block>
             <Block title="Display" description="Your display information for this workspace."><Field label="Display name"><Input value={own.display_name} onChange={(e) => setStaffDraft({ ...own, display_name: e.target.value })} /></Field><Row label="Public profile" hint="Preference only; a public link is not connected."><Switch aria-label="Public profile" checked={profile.publicProfile} onCheckedChange={(v) => setProfile({ publicProfile: v })}/></Row></Block>
            <Block title="Profile picture" description="Shown on your settings profile."><div className="flex items-center gap-3"><div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-lg font-bold text-primary-foreground">{profile.avatar ? <img src={profile.avatar} alt="Your profile" className="h-full w-full object-cover"/> : (profile.displayName || "M").charAt(0).toUpperCase()}</div><div className="flex-1"><input ref={fileRef} type="file" accept="image/svg+xml,image/png,image/jpeg" className="hidden" onChange={(e) => { uploadAvatar(e.target.files?.[0]); e.target.value = ""; }}/><Button variant="outline" className="h-20 w-full border-dashed" onClick={() => fileRef.current?.click()}><UploadCloud/> Click to upload <span className="hidden sm:inline">or drag & drop</span></Button><p className="mt-1 text-center text-[11px] text-muted-foreground">SVG, JPG or PNG (1 MB each)</p></div>{profile.avatar && <Button title="Remove picture" aria-label="Remove picture" size="icon" variant="ghost" onClick={() => setProfile({ avatar: "" })}><X/></Button>}</div><Row label="Use avatar on printed receipts" hint="Saved as a preference; current receipts print the pharmacy identity only."><Switch aria-label="Use avatar on printed receipts" checked={profile.printAvatar} onCheckedChange={(v) => setProfile({ printAvatar: v })}/></Row></Block>
             <Block title="Personal details" description="Your contact details for internal records."><div className="grid gap-3 sm:grid-cols-2"><Field label="Job title"><Input value={own.job_title} onChange={(e) => setStaffDraft({ ...own, job_title: e.target.value })}/></Field><Field label="Phone"><Input type="tel" value={own.phone} onChange={(e) => setStaffDraft({ ...own, phone: e.target.value })}/></Field><Field label="Interface language"><Select value={global.language} onValueChange={(v) => setGlobal({ language: v })}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="bn">বাংলা (Bangla)</SelectItem><SelectItem value="ar">Arabic</SelectItem><SelectItem value="fr">French</SelectItem><SelectItem value="es">Spanish</SelectItem></SelectContent></Select></Field></div><Field label="Bio"><Textarea maxLength={300} value={own.bio} onChange={(e) => setStaffDraft({ ...own, bio: e.target.value })} rows={3}/><p className="text-right text-[11px] text-muted-foreground">{own.bio.length}/300</p></Field><Button onClick={() => void saveStaffProfile()}><Check/> Save changes</Button></Block>
          </>}
           {active === "staff" && <div className="py-5"><StaffAccounts/></div>}
          {active === "account" && <><Block title="Tax & currency" description="Used for prices and invoices."><div className="grid gap-3 sm:grid-cols-3"><Field label="Currency"><Select value={global.currency} onValueChange={(v) => setGlobal({ currency: v as typeof global.currency })}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{[["BDT", "BDT (৳)"], ["USD", "USD ($)"], ["INR", "INR (₹)"], ["EUR", "EUR (€)"], ["GBP", "GBP (£)"], ["SAR", "SAR (﷼)"], ["AED", "AED (د.إ)"]].map(([v, name]) => <SelectItem key={v} value={v}>{name}</SelectItem>)}</SelectContent></Select></Field><Field label="VAT %"><Input type="number" min="0" max="100" value={global.vat} onChange={(e) => setGlobal({ vat: e.target.value })}/></Field><Field label="Tax ID"><Input value={global.taxId} onChange={(e) => setGlobal({ taxId: e.target.value })}/></Field></div></Block><Block title="Regional" description="Local formats for your workspace."><div className="grid gap-3 sm:grid-cols-2"><Field label="Timezone"><Select value={global.timezone} onValueChange={(v) => setGlobal({ timezone: v })}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{["Asia/Dhaka", "UTC", "EST", "PST", "GST", "IST"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></Field><Field label="Date format"><Select value={global.dateFormat} onValueChange={(v) => setGlobal({ dateFormat: v })}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></Field></div></Block></>}
           {active === "security" && <Block title="Sign-in security" description="Your account uses verified email and password or Google sign-in."><p className="text-sm">Signed in as {user?.email}</p><p className="text-xs text-muted-foreground">Access is determined by your administrator-assigned staff role.</p></Block>}
          {active === "subscription" && <Block title="Plans & billing" description="Manage your SaaS plans and tenant subscriptions."><p className="text-sm">{plans.length} plans · {tenants.length} tenants</p>{link("/subscriptions", "Open subscriptions")}<p className="text-xs text-muted-foreground">Payment status here is recorded manually; live payments are not connected.</p></Block>}
          {active === "store" && <><Block title="Pharmacy details" description="Shown on invoices and receipts."><div className="grid gap-3 sm:grid-cols-2"><Field label="Pharmacy name"><Input value={store.name} onChange={(e) => setStore({ name: e.target.value })}/></Field><Field label="Phone"><Input value={store.phone} onChange={(e) => setStore({ phone: e.target.value })}/></Field><Field label="Email"><Input type="email" value={store.email} onChange={(e) => setStore({ email: e.target.value })}/></Field><Field label="License no."><Input value={store.license} onChange={(e) => setStore({ license: e.target.value })}/></Field></div><Field label="Address"><Input value={store.address} onChange={(e) => setStore({ address: e.target.value })}/></Field></Block><Block title="Branches" description="Manage locations and their contacts.">{link("/branches", "Manage branches")}</Block></>}
          {active === "items" && <Block title="Medicines" description="Catalog, pricing and stock are managed in inventory.">{link("/medicines", "Open medicines")}</Block>}
          {active === "receipt" && <><Block title="Receipt message" description="Printed at the bottom of your invoice."><Field label="Footer message"><Textarea rows={3} value={global.receiptFooter} onChange={(e) => setGlobal({ receiptFooter: e.target.value })}/></Field></Block><Block title="Receipt history" description="Find, reprint and export your past sales.">{link("/receipts", "Open receipts")}</Block></>}
          {active === "appearance" && <><Block title="Brand color" description="Applied to buttons and highlights across the workspace."><div className="flex flex-wrap gap-3">{colors.map((color) => <Button key={color.name} variant="ghost" size="icon" title={color.name} aria-label={color.name} aria-pressed={theme.accent === color.value} className={cn("h-9 w-9 rounded-full p-1", theme.accent === color.value && "ring-2 ring-ring ring-offset-2")} onClick={() => setTheme({ accent: color.value })}><span className="h-full w-full rounded-full" style={{ backgroundColor: `hsl(${color.value})` }}/></Button>)}</div></Block><Block title="Corner style" description="Adjust the interface shape."><div className="flex items-center gap-4"><Slider value={[theme.radius]} min={0} max={1} step={0.05} onValueChange={([v]) => setTheme({ radius: v })}/><span className="w-14 text-right text-xs text-muted-foreground">{theme.radius.toFixed(2)}rem</span></div></Block></>}
          {active === "notifications" && <Block title="Pharmacy alerts" description="Turn alerts on or off."><Row label="Low stock alerts" hint="When medicine stock falls below its threshold"><Switch checked={global.lowStockAlert} onCheckedChange={(v) => setGlobal({ lowStockAlert: v })}/></Row><Row label="Expiry alerts" hint="For medicines approaching expiry"><Switch checked={global.expiryAlert} onCheckedChange={(v) => setGlobal({ expiryAlert: v })}/></Row><Row label="Email notifications" hint="Preference only; email delivery is not connected"><Switch checked={global.emailNotifications} onCheckedChange={(v) => setGlobal({ emailNotifications: v })}/></Row></Block>}
          {active === "social" && <Block title="Customer engagement" description="Loyalty and promotions for your pharmacy.">{link("/customers", "Open customers")}<Button variant="outline" size="sm" onClick={() => setActive("campaigns")}>Campaign settings<ChevronRight/></Button></Block>}
          {active === "campaigns" && <><Block title="Loyalty program" description="Reward customers for their purchases."><Row label="Enable loyalty program" hint="Customers earn points on purchases"><Switch checked={marketing.loyaltyEnabled} onCheckedChange={(v) => setMarketing({ loyaltyEnabled: v })}/></Row>{marketing.loyaltyEnabled && <div className="grid gap-3 sm:grid-cols-2"><Field label="Points per ৳100 spent"><Input type="number" min="0" value={marketing.pointsPerDollar} onChange={(e) => setMarketing({ pointsPerDollar: e.target.value })}/></Field><Field label="Points for ৳1 redemption"><Input type="number" min="0" value={marketing.redemptionRate} onChange={(e) => setMarketing({ redemptionRate: e.target.value })}/></Field></div>}</Block><Block title="Promotions" description="Offers and campaign preferences."><Field label="Welcome discount (%)"><Input type="number" min="0" max="100" value={marketing.welcomeDiscount} onChange={(e) => setMarketing({ welcomeDiscount: e.target.value })}/></Field><Field label="Promotional message"><Textarea value={marketing.promoMessage} onChange={(e) => setMarketing({ promoMessage: e.target.value })}/></Field><Row label="SMS campaigns" hint="Preference only; sending is not connected"><Switch checked={marketing.smsEnabled} onCheckedChange={(v) => setMarketing({ smsEnabled: v })}/></Row><Row label="Email campaigns" hint="Preference only; sending is not connected"><Switch checked={marketing.emailCampaigns} onCheckedChange={(v) => setMarketing({ emailCampaigns: v })}/></Row></Block></>}
          {(["metaAds", "metaLeads", "whatsapp", "automations", "integrations", "pixels", "api"] as Section[]).includes(active) && <Unavailable subject={section.title}/>}
        </div>
      </div>
    </div>
  </div>;
}

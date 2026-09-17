import { useMemo, useState } from "react";
import {
  CreditCard,
  Plus,
  Search,
  Edit,
  Trash2,
  Power,
  PowerOff,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Users,
  Sparkles,
  RefreshCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  useSubscriptionStore,
  type Plan,
  type Tenant,
  type BillingCycle,
  type PaymentStatus,
} from "@/stores/subscription-store";
import { useSettingsStore, CURRENCY_SYMBOLS } from "@/stores/settings-store";
import { toast } from "@/hooks/use-toast";
import { MoreVertical } from "lucide-react";
import { money } from "@/lib/currency";
import { fmtDate } from "@/lib/format-date";

const statusVariant = (s: Tenant["status"]) => {
  switch (s) {
    case "active":
      return { label: "Active", icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
    case "trialing":
      return { label: "Trial", icon: Sparkles, cls: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
    case "past_due":
      return { label: "Past Due", icon: AlertTriangle, cls: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
    case "canceled":
      return { label: "Canceled", icon: XCircle, cls: "bg-muted text-muted-foreground" };
    case "disabled":
      return { label: "Disabled", icon: PowerOff, cls: "bg-destructive/10 text-destructive border-destructive/20" };
  }
};

const payVariant = (s: PaymentStatus) => {
  switch (s) {
    case "paid":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "pending":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "failed":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "refunded":
      return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const emptyPlan = {
  name: "",
  tier: "starter" as Plan["tier"],
  description: "",
  priceMonthly: 0,
  priceYearly: 0,
  trialDays: 14,
  maxBranches: 1,
  maxUsers: 3,
  maxProducts: 500,
  features: "",
  active: true,
};

const emptyTenant = {
  name: "",
  ownerEmail: "",
  phone: "",
  planId: "",
  billingCycle: "monthly" as BillingCycle,
  status: "trialing" as Tenant["status"],
  paymentStatus: "none" as PaymentStatus,
  stripeCustomerId: "",
  stripeSubscriptionId: "",
  notes: "",
  enabled: true,
};

export default function Subscriptions() {
  const {
    plans, tenants,
    addPlan, updatePlan, deletePlan, togglePlanActive,
    addTenant, updateTenant, deleteTenant, setTenantEnabled,
    startTrial, recordPayment, changePlan,
  } = useSubscriptionStore();
  const currency = useSettingsStore((s) => s.global.currency);
  const sym = CURRENCY_SYMBOLS[currency];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planDialog, setPlanDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState(emptyPlan);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  const [tenantDialog, setTenantDialog] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [tenantForm, setTenantForm] = useState(emptyTenant);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [payDialog, setPayDialog] = useState<Tenant | null>(null);
  const [payAmount, setPayAmount] = useState("0");
  const [payStatus, setPayStatus] = useState<PaymentStatus>("paid");

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.ownerEmail.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tenants, search, statusFilter]);

  const stats = useMemo(() => {
    const mrr = tenants.filter((t) => t.enabled).reduce((s, t) => s + t.mrr, 0);
    return {
      mrr,
      arr: mrr * 12,
      active: tenants.filter((t) => t.status === "active").length,
      trialing: tenants.filter((t) => t.status === "trialing").length,
      pastDue: tenants.filter((t) => t.status === "past_due").length,
      disabled: tenants.filter((t) => !t.enabled).length,
    };
  }, [tenants]);

  const openPlanDialog = (p?: Plan) => {
    if (p) {
      setEditingPlan(p);
      setPlanForm({ ...p, features: p.features.join(", ") });
    } else {
      setEditingPlan(null);
      setPlanForm(emptyPlan);
    }
    setPlanDialog(true);
  };

  const savePlan = () => {
    if (!planForm.name.trim()) {
      toast({ title: "Plan name required", variant: "destructive" });
      return;
    }
    const payload = {
      ...planForm,
      features: planForm.features.split(",").map((f) => f.trim()).filter(Boolean),
    };
    if (editingPlan) {
      updatePlan(editingPlan.id, payload);
      toast({ title: "Plan updated" });
    } else {
      addPlan(payload);
      toast({ title: "Plan created" });
    }
    setPlanDialog(false);
  };

  const openTenantDialog = (t?: Tenant) => {
    if (t) {
      setEditingTenant(t);
      setTenantForm({
        name: t.name,
        ownerEmail: t.ownerEmail,
        phone: t.phone || "",
        planId: t.planId,
        billingCycle: t.billingCycle,
        status: t.status,
        paymentStatus: t.paymentStatus,
        stripeCustomerId: t.stripeCustomerId || "",
        stripeSubscriptionId: t.stripeSubscriptionId || "",
        notes: t.notes || "",
        enabled: t.enabled,
      });
    } else {
      setEditingTenant(null);
      setTenantForm({ ...emptyTenant, planId: plans[0]?.id || "" });
    }
    setTenantDialog(true);
  };

  const saveTenant = () => {
    if (!tenantForm.name.trim() || !tenantForm.ownerEmail.trim() || !tenantForm.planId) {
      toast({ title: "Name, email and plan are required", variant: "destructive" });
      return;
    }
    if (editingTenant) {
      updateTenant(editingTenant.id, tenantForm);
      toast({ title: "Tenant updated" });
    } else {
      addTenant(tenantForm);
      toast({ title: "Tenant created" });
    }
    setTenantDialog(false);
  };

  const submitPayment = () => {
    if (!payDialog) return;
    recordPayment(payDialog.id, parseFloat(payAmount) || 0, payStatus);
    toast({ title: `Payment ${payStatus}` });
    setPayDialog(null);
  };

  const planName = (id: string) => plans.find((p) => p.id === id)?.name || "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">
            Manage SaaS plans, trials, payments and tenant access.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "MRR", value: money(stats.mrr), icon: DollarSign, color: "text-emerald-600" },
          { label: "ARR", value: money(stats.arr, 0), icon: DollarSign, color: "text-blue-600" },
          { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Trialing", value: stats.trialing, icon: Sparkles, color: "text-blue-600" },
          { label: "Past Due", value: stats.pastDue, icon: AlertTriangle, color: "text-amber-600" },
          { label: "Disabled", value: stats.disabled, icon: PowerOff, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="mt-2 text-xl font-bold font-heading">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="tenants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tenants">
            <Users className="h-4 w-4 mr-2" /> Tenants
          </TabsTrigger>
          <TabsTrigger value="plans">
            <CreditCard className="h-4 w-4 mr-2" /> Plans
          </TabsTrigger>
        </TabsList>

        {/* TENANTS */}
        <TabsContent value="tenants" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trialing">Trialing</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => openTenantDialog()}>
              <Plus className="h-4 w-4 mr-2" /> New Tenant
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3">Tenant</th>
                      <th className="text-left px-4 py-3">Plan</th>
                      <th className="text-left px-4 py-3">Cycle</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Payment</th>
                      <th className="text-left px-4 py-3">Trial / Period</th>
                      <th className="text-right px-4 py-3">MRR</th>
                      <th className="text-center px-4 py-3">Enabled</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTenants.map((t) => {
                      const sv = statusVariant(t.status);
                      const Icon = sv.icon;
                      return (
                        <tr key={t.id} className="border-t border-border hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <div className="font-medium">{t.name}</div>
                            <div className="text-xs text-muted-foreground">{t.ownerEmail}</div>
                          </td>
                          <td className="px-4 py-3">{planName(t.planId)}</td>
                          <td className="px-4 py-3 capitalize">{t.billingCycle}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={sv.cls}>
                              <Icon className="h-3 w-3 mr-1" />
                              {sv.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={payVariant(t.paymentStatus)}>
                              {t.paymentStatus}
                            </Badge>
                            {t.stripeSubscriptionId && (
                              <div className="text-[10px] text-muted-foreground mt-1">{t.stripeSubscriptionId}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {t.status === "trialing" && t.trialEndsAt && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <Clock className="h-3 w-3" />
                                Trial ends {fmtDate(t.trialEndsAt)}
                              </span>
                            )}
                            {t.currentPeriodEnd && t.status !== "trialing" && (
                              <span className="text-muted-foreground">
                                Renews {fmtDate(t.currentPeriodEnd)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">{sym}{t.mrr.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            <Switch
                              checked={t.enabled}
                              onCheckedChange={(v) => {
                                setTenantEnabled(t.id, v);
                                toast({ title: v ? "Tenant enabled" : "Tenant disabled" });
                              }}
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openTenantDialog(t)}>
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setPayDialog(t);
                                    setPayAmount(String(t.mrr || plans.find((p) => p.id === t.planId)?.priceMonthly || 0));
                                    setPayStatus("paid");
                                  }}
                                >
                                  <DollarSign className="h-4 w-4 mr-2" /> Record Payment
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    startTrial(t.id, plans.find((p) => p.id === t.planId)?.trialDays || 14);
                                    toast({ title: "Trial started" });
                                  }}
                                >
                                  <Sparkles className="h-4 w-4 mr-2" /> Start Trial
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setTenantEnabled(t.id, !t.enabled);
                                  }}
                                >
                                  {t.enabled ? <PowerOff className="h-4 w-4 mr-2" /> : <Power className="h-4 w-4 mr-2" />}
                                  {t.enabled ? "Disable" : "Enable"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setTenantToDelete(t)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredTenants.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-muted-foreground">
                          No tenants match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PLANS */}
        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openPlanDialog()}>
              <Plus className="h-4 w-4 mr-2" /> New Plan
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((p) => {
              const subs = tenants.filter((t) => t.planId === p.id).length;
              return (
                <Card key={p.id} className={!p.active ? "opacity-60" : ""}>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2 capitalize">{p.tier}</Badge>
                        <h3 className="font-heading font-bold text-lg">{p.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                      </div>
                      <Switch checked={p.active} onCheckedChange={() => togglePlanActive(p.id)} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-heading">
                        {sym}{p.priceMonthly}
                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        or {sym}{p.priceYearly}/yr · {p.trialDays}-day trial
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <div className="font-semibold">{p.maxBranches}</div>
                        <div className="text-muted-foreground">branches</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <div className="font-semibold">{p.maxUsers}</div>
                        <div className="text-muted-foreground">users</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <div className="font-semibold">{p.maxProducts}</div>
                        <div className="text-muted-foreground">products</div>
                      </div>
                    </div>
                    {p.features.length > 0 && (
                      <ul className="space-y-1">
                        {p.features.map((f) => (
                          <li key={f} className="text-xs flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">{subs} subscriber{subs !== 1 && "s"}</span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openPlanDialog(p)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setPlanToDelete(p)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* PLAN DIALOG */}
      <Dialog open={planDialog} onOpenChange={setPlanDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Plan" : "New Plan"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Name</Label>
              <Input value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Tier</Label>
              <Select value={planForm.tier} onValueChange={(v: Plan["tier"]) => setPlanForm({ ...planForm, tier: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trial days</Label>
              <Input type="number" value={planForm.trialDays} onChange={(e) => setPlanForm({ ...planForm, trialDays: +e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea rows={2} value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} />
            </div>
            <div>
              <Label>Price / month ({sym})</Label>
              <Input type="number" value={planForm.priceMonthly} onChange={(e) => setPlanForm({ ...planForm, priceMonthly: +e.target.value })} />
            </div>
            <div>
              <Label>Price / year ({sym})</Label>
              <Input type="number" value={planForm.priceYearly} onChange={(e) => setPlanForm({ ...planForm, priceYearly: +e.target.value })} />
            </div>
            <div>
              <Label>Max branches</Label>
              <Input type="number" value={planForm.maxBranches} onChange={(e) => setPlanForm({ ...planForm, maxBranches: +e.target.value })} />
            </div>
            <div>
              <Label>Max users</Label>
              <Input type="number" value={planForm.maxUsers} onChange={(e) => setPlanForm({ ...planForm, maxUsers: +e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Max products</Label>
              <Input type="number" value={planForm.maxProducts} onChange={(e) => setPlanForm({ ...planForm, maxProducts: +e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Features (comma-separated)</Label>
              <Textarea rows={2} value={planForm.features} onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Switch checked={planForm.active} onCheckedChange={(v) => setPlanForm({ ...planForm, active: v })} />
              <Label>Active (available for new subscriptions)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialog(false)}>Cancel</Button>
            <Button onClick={savePlan}>{editingPlan ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TENANT DIALOG */}
      <Dialog open={tenantDialog} onOpenChange={setTenantDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTenant ? "Edit Tenant" : "New Tenant"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={tenantForm.name} onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Owner email</Label>
              <Input type="email" value={tenantForm.ownerEmail} onChange={(e) => setTenantForm({ ...tenantForm, ownerEmail: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={tenantForm.phone} onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })} />
            </div>
            <div>
              <Label>Plan</Label>
              <Select value={tenantForm.planId} onValueChange={(v) => setTenantForm({ ...tenantForm, planId: v })}>
                <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                <SelectContent>
                  {plans.filter((p) => p.active).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} — {sym}{p.priceMonthly}/mo</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Billing cycle</Label>
              <Select value={tenantForm.billingCycle} onValueChange={(v: BillingCycle) => setTenantForm({ ...tenantForm, billingCycle: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={tenantForm.status} onValueChange={(v: Tenant["status"]) => setTenantForm({ ...tenantForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="trialing">Trialing</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment status</Label>
              <Select value={tenantForm.paymentStatus} onValueChange={(v: PaymentStatus) => setTenantForm({ ...tenantForm, paymentStatus: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stripe customer ID</Label>
              <Input value={tenantForm.stripeCustomerId} onChange={(e) => setTenantForm({ ...tenantForm, stripeCustomerId: e.target.value })} placeholder="cus_…" />
            </div>
            <div>
              <Label>Stripe subscription ID</Label>
              <Input value={tenantForm.stripeSubscriptionId} onChange={(e) => setTenantForm({ ...tenantForm, stripeSubscriptionId: e.target.value })} placeholder="sub_…" />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={tenantForm.notes} onChange={(e) => setTenantForm({ ...tenantForm, notes: e.target.value })} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Switch checked={tenantForm.enabled} onCheckedChange={(v) => setTenantForm({ ...tenantForm, enabled: v })} />
              <Label>Tenant enabled (can log in and use the system)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTenantDialog(false)}>Cancel</Button>
            <Button onClick={saveTenant}>{editingTenant ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PAYMENT DIALOG */}
      <Dialog open={!!payDialog} onOpenChange={(o) => !o && setPayDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment — {payDialog?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount ({sym})</Label>
              <Input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={payStatus} onValueChange={(v: PaymentStatus) => setPayStatus(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialog(null)}>Cancel</Button>
            <Button onClick={submitPayment}>
              <RefreshCcw className="h-4 w-4 mr-2" /> Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE PLAN */}
      <AlertDialog open={!!planToDelete} onOpenChange={(o) => !o && setPlanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Existing tenants on "{planToDelete?.name}" will keep their reference but new subscriptions will fail. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                if (planToDelete) {
                  deletePlan(planToDelete.id);
                  toast({ title: "Plan deleted" });
                }
                setPlanToDelete(null);
              }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE TENANT */}
      <AlertDialog open={!!tenantToDelete} onOpenChange={(o) => !o && setTenantToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tenant?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes "{tenantToDelete?.name}" from billing records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                if (tenantToDelete) {
                  deleteTenant(tenantToDelete.id);
                  toast({ title: "Tenant deleted" });
                }
                setTenantToDelete(null);
              }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { create } from "zustand";

export type BillingCycle = "monthly" | "yearly";
export type PlanTier = "starter" | "professional" | "enterprise" | "custom";

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  trialDays: number;
  maxBranches: number;
  maxUsers: number;
  maxProducts: number;
  features: string[];
  active: boolean;
  createdAt: string;
}

export type TenantStatus = "active" | "trialing" | "past_due" | "canceled" | "disabled";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded" | "none";

export interface Tenant {
  id: string;
  name: string;
  ownerEmail: string;
  phone?: string;
  planId: string;
  billingCycle: BillingCycle;
  status: TenantStatus;
  paymentStatus: PaymentStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  lastPaymentAt?: string;
  lastPaymentAmount?: number;
  mrr: number;
  enabled: boolean;
  createdAt: string;
  notes?: string;
}

interface SubscriptionStore {
  plans: Plan[];
  tenants: Tenant[];
  addPlan: (p: Omit<Plan, "id" | "createdAt">) => void;
  updatePlan: (id: string, p: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  togglePlanActive: (id: string) => void;
  addTenant: (t: Omit<Tenant, "id" | "createdAt" | "mrr"> & { mrr?: number }) => void;
  updateTenant: (id: string, t: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;
  setTenantEnabled: (id: string, enabled: boolean) => void;
  startTrial: (tenantId: string, days: number) => void;
  recordPayment: (tenantId: string, amount: number, status: PaymentStatus) => void;
  changePlan: (tenantId: string, planId: string, cycle: BillingCycle) => void;
}

const now = () => new Date().toISOString();
const addDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString();

const seedPlans: Plan[] = [
  {
    id: "plan-starter",
    name: "Starter",
    tier: "starter",
    description: "For single-branch pharmacies getting started.",
    priceMonthly: 29,
    priceYearly: 290,
    trialDays: 14,
    maxBranches: 1,
    maxUsers: 3,
    maxProducts: 500,
    features: ["POS & Receipts", "Basic Reports", "Email Support"],
    active: true,
    createdAt: now(),
  },
  {
    id: "plan-pro",
    name: "Professional",
    tier: "professional",
    description: "Growing chains needing multi-branch and analytics.",
    priceMonthly: 89,
    priceYearly: 890,
    trialDays: 14,
    maxBranches: 5,
    maxUsers: 15,
    maxProducts: 5000,
    features: ["Multi-branch", "Advanced Reports", "Loyalty", "Priority Support"],
    active: true,
    createdAt: now(),
  },
  {
    id: "plan-enterprise",
    name: "Enterprise",
    tier: "enterprise",
    description: "Unlimited scale with SLA and dedicated support.",
    priceMonthly: 249,
    priceYearly: 2490,
    trialDays: 30,
    maxBranches: 999,
    maxUsers: 999,
    maxProducts: 999999,
    features: ["Unlimited everything", "Custom integrations", "SLA", "Dedicated CSM"],
    active: true,
    createdAt: now(),
  },
];

const seedTenants: Tenant[] = [
  {
    id: "t-1",
    name: "MediCore HQ",
    ownerEmail: "owner@medicore.com",
    phone: "+1 234 567 890",
    planId: "plan-enterprise",
    billingCycle: "yearly",
    status: "active",
    paymentStatus: "paid",
    stripeCustomerId: "cus_demo_001",
    stripeSubscriptionId: "sub_demo_001",
    currentPeriodEnd: addDays(180),
    lastPaymentAt: addDays(-15),
    lastPaymentAmount: 2490,
    mrr: 207.5,
    enabled: true,
    createdAt: now(),
  },
  {
    id: "t-2",
    name: "GreenLeaf Pharmacy",
    ownerEmail: "admin@greenleaf.com",
    planId: "plan-pro",
    billingCycle: "monthly",
    status: "trialing",
    paymentStatus: "none",
    trialEndsAt: addDays(7),
    mrr: 0,
    enabled: true,
    createdAt: now(),
  },
  {
    id: "t-3",
    name: "City Drugs",
    ownerEmail: "billing@citydrugs.com",
    planId: "plan-pro",
    billingCycle: "monthly",
    status: "past_due",
    paymentStatus: "failed",
    stripeCustomerId: "cus_demo_003",
    stripeSubscriptionId: "sub_demo_003",
    currentPeriodEnd: addDays(-3),
    lastPaymentAt: addDays(-33),
    lastPaymentAmount: 89,
    mrr: 89,
    enabled: true,
    createdAt: now(),
  },
  {
    id: "t-4",
    name: "Sunrise Meds",
    ownerEmail: "ops@sunrisemeds.com",
    planId: "plan-starter",
    billingCycle: "monthly",
    status: "canceled",
    paymentStatus: "refunded",
    mrr: 0,
    enabled: false,
    createdAt: now(),
  },
];

const calcMrr = (plan: Plan | undefined, cycle: BillingCycle) => {
  if (!plan) return 0;
  return cycle === "yearly" ? +(plan.priceYearly / 12).toFixed(2) : plan.priceMonthly;
};

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  plans: seedPlans,
  tenants: seedTenants,

  addPlan: (p) =>
    set((s) => ({
      plans: [...s.plans, { ...p, id: `plan-${Date.now()}`, createdAt: now() }],
    })),
  updatePlan: (id, p) =>
    set((s) => ({ plans: s.plans.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
  deletePlan: (id) => set((s) => ({ plans: s.plans.filter((x) => x.id !== id) })),
  togglePlanActive: (id) =>
    set((s) => ({
      plans: s.plans.map((x) => (x.id === id ? { ...x, active: !x.active } : x)),
    })),

  addTenant: (t) => {
    const plan = get().plans.find((p) => p.id === t.planId);
    const mrr = t.mrr ?? calcMrr(plan, t.billingCycle);
    set((s) => ({
      tenants: [
        ...s.tenants,
        { ...t, mrr, id: `t-${Date.now()}`, createdAt: now() },
      ],
    }));
  },
  updateTenant: (id, t) =>
    set((s) => ({ tenants: s.tenants.map((x) => (x.id === id ? { ...x, ...t } : x)) })),
  deleteTenant: (id) => set((s) => ({ tenants: s.tenants.filter((x) => x.id !== id) })),
  setTenantEnabled: (id, enabled) =>
    set((s) => ({
      tenants: s.tenants.map((x) =>
        x.id === id ? { ...x, enabled, status: enabled ? x.status : "disabled" } : x,
      ),
    })),
  startTrial: (tenantId, days) =>
    set((s) => ({
      tenants: s.tenants.map((x) =>
        x.id === tenantId
          ? { ...x, status: "trialing", trialEndsAt: addDays(days), paymentStatus: "none" }
          : x,
      ),
    })),
  recordPayment: (tenantId, amount, status) =>
    set((s) => ({
      tenants: s.tenants.map((x) =>
        x.id === tenantId
          ? {
              ...x,
              paymentStatus: status,
              lastPaymentAmount: amount,
              lastPaymentAt: now(),
              status: status === "paid" ? "active" : x.status,
              currentPeriodEnd:
                status === "paid"
                  ? addDays(x.billingCycle === "yearly" ? 365 : 30)
                  : x.currentPeriodEnd,
            }
          : x,
      ),
    })),
  changePlan: (tenantId, planId, cycle) => {
    const plan = get().plans.find((p) => p.id === planId);
    set((s) => ({
      tenants: s.tenants.map((x) =>
        x.id === tenantId
          ? { ...x, planId, billingCycle: cycle, mrr: calcMrr(plan, cycle) }
          : x,
      ),
    }));
  },
}));

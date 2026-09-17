import { create } from "zustand";

export interface StoreInfo {
  name: string;
  phone: string;
  address: string;
  email: string;
  license: string;
}

export interface GlobalSettings {
  currency: "BDT" | "USD" | "EUR" | "GBP" | "INR" | "SAR" | "AED";
  vat: string;
  taxId: string;
  timezone: string;
  dateFormat: string;
  language: string;
  lowStockAlert: boolean;
  expiryAlert: boolean;
  emailNotifications: boolean;
  receiptFooter: string;
}

export interface ThemeSettings {
  accent: string;
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  card: string;
  radius: number;
}

export interface MarketingSettings {
  loyaltyEnabled: boolean;
  pointsPerDollar: string;
  redemptionRate: string;
  welcomeDiscount: string;
  smsEnabled: boolean;
  emailCampaigns: boolean;
  promoMessage: string;
}

interface SettingsStore {
  storeInfo: StoreInfo;
  global: GlobalSettings;
  theme: ThemeSettings;
  marketing: MarketingSettings;
  setStoreInfo: (data: Partial<StoreInfo>) => void;
  setGlobal: (data: Partial<GlobalSettings>) => void;
  setTheme: (data: Partial<ThemeSettings>) => void;
  setMarketing: (data: Partial<MarketingSettings>) => void;
}

export const CURRENCY_SYMBOLS: Record<GlobalSettings["currency"], string> = {
  BDT: "৳",
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  SAR: "﷼",
  AED: "د.إ",
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  storeInfo: {
    name: "MediCore Pharmacy",
    phone: "+880 1711 000000",
    address: "House 12, Road 5, Dhanmondi, Dhaka 1205, Bangladesh",
    email: "info@medicore.com.bd",
    license: "DGDA-DH-2024-12345",
  },
  global: {
    currency: "BDT",
    vat: "0",
    taxId: "BIN-001234567-0101",
    timezone: "Asia/Dhaka",
    dateFormat: "DD/MM/YYYY",
    language: "en",
    lowStockAlert: true,
    expiryAlert: true,
    emailNotifications: true,
    receiptFooter: "Thank you for your purchase!",
  },
  theme: {
    accent: "217 91% 50%",
    primary: "215 25% 15%",
    secondary: "210 40% 96%",
    background: "210 20% 98%",
    foreground: "215 25% 15%",
    muted: "215 15% 47%",
    border: "214 20% 90%",
    card: "0 0% 100%",
    radius: 0.5,
  },
  marketing: {
    loyaltyEnabled: true,
    pointsPerDollar: "1",
    redemptionRate: "100",
    welcomeDiscount: "10",
    smsEnabled: false,
    emailCampaigns: true,
    promoMessage: "Get 10% off on your first purchase!",
  },

  setStoreInfo: (data) => set((s) => ({ storeInfo: { ...s.storeInfo, ...data } })),
  setGlobal: (data) => set((s) => ({ global: { ...s.global, ...data } })),
  setTheme: (data) => set((s) => ({ theme: { ...s.theme, ...data } })),
  setMarketing: (data) => set((s) => ({ marketing: { ...s.marketing, ...data } })),
}));

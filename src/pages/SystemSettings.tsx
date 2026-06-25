import { useSettingsStore } from "@/stores/settings-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Store, Globe, Palette, Megaphone, Check,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ACCENT_PRESETS = [
  { label: "Coral", value: "12 76% 61%" },
  { label: "Blue", value: "217 91% 50%" },
  { label: "Emerald", value: "160 60% 45%" },
  { label: "Purple", value: "270 60% 55%" },
  { label: "Amber", value: "38 92% 50%" },
  { label: "Pink", value: "330 80% 60%" },
  { label: "Cyan", value: "185 80% 50%" },
  { label: "Rose", value: "350 70% 55%" },
  { label: "Green", value: "142 76% 36%" },
];

const RADIUS_OPTIONS = [
  { label: "Sharp", value: 0 },
  { label: "Subtle", value: 0.25 },
  { label: "Default", value: 0.5 },
  { label: "Rounded", value: 0.75 },
  { label: "Pill", value: 1.25 },
];

function hslToHex(hslStr: string): string {
  const parts = hslStr.split(" ").map((s) => parseFloat(s));
  if (parts.length < 3) return "#000000";
  const [h, s, l] = parts;
  const sN = s / 100;
  const lN = l / 100;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lN - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const ColorField = ({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">{label}</Label>
    <div className="flex items-center gap-2">
      <div
        className="h-10 w-10 rounded-lg border border-border shrink-0"
        style={{ backgroundColor: `hsl(${value})` }}
      />
      <Input value={hslToHex(value)} readOnly className="font-mono text-sm" />
    </div>
    <p className="text-[11px] text-muted-foreground">{description}</p>
  </div>
);

const SystemSettings = () => {
  const storeInfo = useSettingsStore((s) => s.storeInfo);
  const setStoreInfoStore = useSettingsStore((s) => s.setStoreInfo);
  const globalSettings = useSettingsStore((s) => s.global);
  const setGlobalStore = useSettingsStore((s) => s.setGlobal);
  const theme = useSettingsStore((s) => s.theme);
  const setThemeStore = useSettingsStore((s) => s.setTheme);
  const marketing = useSettingsStore((s) => s.marketing);
  const setMarketingStore = useSettingsStore((s) => s.setMarketing);

  // Adapters so existing { ...obj, field: v } onChange handlers keep working
  const setStoreInfo = (data: typeof storeInfo) => setStoreInfoStore(data);
  const setGlobalSettings = (data: typeof globalSettings) => setGlobalStore(data);
  const setTheme = (data: typeof theme) => setThemeStore(data);
  const setMarketing = (data: typeof marketing) => setMarketingStore(data);

  const handleSave = (section: string) => {
    toast({ title: `${section} saved`, description: "Settings updated successfully." });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage store configuration and preferences</p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="w-full max-w-2xl grid grid-cols-4">
          <TabsTrigger value="store" className="gap-1.5">
            <Store className="h-4 w-4" /> Store Info
          </TabsTrigger>
          <TabsTrigger value="global" className="gap-1.5">
            <Globe className="h-4 w-4" /> Global Settings
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-1.5">
            <Palette className="h-4 w-4" /> Theme
          </TabsTrigger>
          <TabsTrigger value="marketing" className="gap-1.5">
            <Megaphone className="h-4 w-4" /> Marketing
          </TabsTrigger>
        </TabsList>

        {/* STORE INFO */}
        <TabsContent value="store">
          <Card className="border-none shadow-sm max-w-3xl">
            <CardHeader>
              <CardTitle className="text-base font-heading">Pharmacy Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Pharmacy Name</Label>
                  <Input value={storeInfo.name} onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={storeInfo.phone} onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Address</Label>
                <Input value={storeInfo.address} onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={storeInfo.email} onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>License No.</Label>
                  <Input value={storeInfo.license} onChange={(e) => setStoreInfo({ ...storeInfo, license: e.target.value })} />
                </div>
              </div>
              <Button onClick={() => handleSave("Store Info")}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GLOBAL SETTINGS */}
        <TabsContent value="global">
          <div className="space-y-4 max-w-3xl">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-heading">Tax & Currency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Currency</Label>
                    <Select value={globalSettings.currency} onValueChange={(v) => setGlobalSettings({ ...globalSettings, currency: v as typeof globalSettings.currency })}>}
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="SAR">SAR (﷼)</SelectItem>
                        <SelectItem value="AED">AED (د.إ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>VAT %</Label>
                    <Input type="number" value={globalSettings.vat} onChange={(e) => setGlobalSettings({ ...globalSettings, vat: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tax ID</Label>
                    <Input value={globalSettings.taxId} onChange={(e) => setGlobalSettings({ ...globalSettings, taxId: e.target.value })} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-heading">Regional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Timezone</Label>
                    <Select value={globalSettings.timezone} onValueChange={(v) => setGlobalSettings({ ...globalSettings, timezone: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">EST (UTC-5)</SelectItem>
                        <SelectItem value="PST">PST (UTC-8)</SelectItem>
                        <SelectItem value="GST">GST (UTC+4)</SelectItem>
                        <SelectItem value="IST">IST (UTC+5:30)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date Format</Label>
                    <Select value={globalSettings.dateFormat} onValueChange={(v) => setGlobalSettings({ ...globalSettings, dateFormat: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Language</Label>
                    <Select value={globalSettings.language} onValueChange={(v) => setGlobalSettings({ ...globalSettings, language: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-heading">Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Low Stock Alerts</p>
                    <p className="text-xs text-muted-foreground">Get notified when stock falls below threshold</p>
                  </div>
                  <Switch checked={globalSettings.lowStockAlert} onCheckedChange={(v) => setGlobalSettings({ ...globalSettings, lowStockAlert: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Expiry Alerts</p>
                    <p className="text-xs text-muted-foreground">Alert before medicines expire</p>
                  </div>
                  <Switch checked={globalSettings.expiryAlert} onCheckedChange={(v) => setGlobalSettings({ ...globalSettings, expiryAlert: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive daily summary reports via email</p>
                  </div>
                  <Switch checked={globalSettings.emailNotifications} onCheckedChange={(v) => setGlobalSettings({ ...globalSettings, emailNotifications: v })} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-heading">Receipt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Receipt Footer Message</Label>
                  <Textarea value={globalSettings.receiptFooter} onChange={(e) => setGlobalSettings({ ...globalSettings, receiptFooter: e.target.value })} rows={2} />
                </div>
                <Button onClick={() => handleSave("Global Settings")}>Save Changes</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* THEME */}
        <TabsContent value="theme">
          <div className="space-y-6 max-w-4xl">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <Palette className="h-4 w-4" /> Brand Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ColorField label="Accent / CTA" description="Buttons, links, badges" value={theme.accent} onChange={(v) => setTheme({ ...theme, accent: v })} />
                  <ColorField label="Primary" description="Header, headings, text" value={theme.primary} onChange={(v) => setTheme({ ...theme, primary: v })} />
                  <ColorField label="Secondary" description="Secondary surfaces" value={theme.secondary} onChange={(v) => setTheme({ ...theme, secondary: v })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ColorField label="Background" description="Page background" value={theme.background} onChange={(v) => setTheme({ ...theme, background: v })} />
                  <ColorField label="Text" description="Main text color" value={theme.foreground} onChange={(v) => setTheme({ ...theme, foreground: v })} />
                  <ColorField label="Muted Text" description="Secondary text" value={theme.muted} onChange={(v) => setTheme({ ...theme, muted: v })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ColorField label="Border" description="Borders, dividers" value={theme.border} onChange={(v) => setTheme({ ...theme, border: v })} />
                  <ColorField label="Card / Surface" description="Cards, modals, popups" value={theme.card} onChange={(v) => setTheme({ ...theme, card: v })} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-heading">Border Radius</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Slider
                      value={[theme.radius]}
                      onValueChange={([v]) => setTheme({ ...theme, radius: v })}
                      min={0}
                      max={1.5}
                      step={0.05}
                    />
                  </div>
                  <span className="text-sm font-mono w-16 text-right">{theme.radius.toFixed(2)}rem</span>
                </div>
                <div className="flex gap-2">
                  {RADIUS_OPTIONS.map((opt) => (
                    <Button
                      key={opt.label}
                      size="sm"
                      variant={Math.abs(theme.radius - opt.value) < 0.05 ? "default" : "outline"}
                      onClick={() => setTheme({ ...theme, radius: opt.value })}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-heading">Quick Accent Presets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {ACCENT_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      className={`h-11 w-11 rounded-xl border-2 transition-all ${
                        theme.accent === preset.value
                          ? "border-foreground scale-110 shadow-md"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: `hsl(${preset.value})` }}
                      onClick={() => setTheme({ ...theme, accent: preset.value })}
                      title={preset.label}
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <Button onClick={() => handleSave("Theme")}>Save Theme</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* MARKETING */}
        <TabsContent value="marketing">
          <div className="space-y-4 max-w-3xl">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-heading">Loyalty Program</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enable Loyalty Program</p>
                    <p className="text-xs text-muted-foreground">Customers earn points on purchases</p>
                  </div>
                  <Switch checked={marketing.loyaltyEnabled} onCheckedChange={(v) => setMarketing({ ...marketing, loyaltyEnabled: v })} />
                </div>
                {marketing.loyaltyEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <Label>Points per $1 spent</Label>
                      <Input type="number" value={marketing.pointsPerDollar} onChange={(e) => setMarketing({ ...marketing, pointsPerDollar: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Points for $1 redemption</Label>
                      <Input type="number" value={marketing.redemptionRate} onChange={(e) => setMarketing({ ...marketing, redemptionRate: e.target.value })} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-heading">Promotions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Welcome Discount (%)</Label>
                  <Input type="number" value={marketing.welcomeDiscount} onChange={(e) => setMarketing({ ...marketing, welcomeDiscount: e.target.value })} />
                  <p className="text-xs text-muted-foreground">Discount applied to first-time customer purchases</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Promotional Message</Label>
                  <Textarea value={marketing.promoMessage} onChange={(e) => setMarketing({ ...marketing, promoMessage: e.target.value })} rows={2} />
                  <p className="text-xs text-muted-foreground">Displayed on receipts and customer-facing screens</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-heading">Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">SMS Campaigns</p>
                    <p className="text-xs text-muted-foreground">Send promotions via SMS</p>
                  </div>
                  <Switch checked={marketing.smsEnabled} onCheckedChange={(v) => setMarketing({ ...marketing, smsEnabled: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email Campaigns</p>
                    <p className="text-xs text-muted-foreground">Send promotions via email</p>
                  </div>
                  <Switch checked={marketing.emailCampaigns} onCheckedChange={(v) => setMarketing({ ...marketing, emailCampaigns: v })} />
                </div>
                <Button onClick={() => handleSave("Marketing")}>Save Changes</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, PackageX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMedicineStore, getMedicineStatus } from "@/stores/medicine-store";

interface AlertItem {
  type: "Expired" | "Expiring Soon" | "Low Stock" | "Out of Stock";
  medicine: string;
  batch: string;
  detail: string;
  severity: "destructive" | "warning";
}

const Alerts = () => {
  const { medicines } = useMedicineStore();

  const alerts = useMemo<AlertItem[]>(() => {
    const list: AlertItem[] = [];
    for (const m of medicines) {
      const status = getMedicineStatus(m);
      if (status === "Expired") {
        list.push({ type: "Expired", medicine: m.name, batch: m.batch, detail: `Expired: ${m.expiry}`, severity: "destructive" });
      } else if (status === "Expiring Soon") {
        list.push({ type: "Expiring Soon", medicine: m.name, batch: m.batch, detail: `Expires: ${m.expiry}`, severity: "warning" });
      }
      if (status === "Out of Stock") {
        list.push({ type: "Out of Stock", medicine: m.name, batch: m.batch, detail: `Stock: 0 units`, severity: "destructive" });
      } else if (status === "Low Stock") {
        list.push({ type: "Low Stock", medicine: m.name, batch: m.batch, detail: `Stock: ${m.stock} units (threshold ${m.lowStockThreshold})`, severity: "warning" });
      }
    }
    return list;
  }, [medicines]);

  const expiredCount = alerts.filter((a) => a.type === "Expired").length;
  const expiringCount = alerts.filter((a) => a.type === "Expiring Soon").length;
  const stockCount = alerts.filter((a) => a.type === "Low Stock" || a.type === "Out of Stock").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Expiry & Stock Alerts</h1>
        <p className="text-sm text-muted-foreground">Monitor expired and low-stock medicines</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard icon={<PackageX className="h-5 w-5" />} label="Expired" value={expiredCount} tone="destructive" />
        <SummaryCard icon={<Clock className="h-5 w-5" />} label="Expiring Soon" value={expiringCount} tone="warning" />
        <SummaryCard icon={<AlertTriangle className="h-5 w-5" />} label="Stock Issues" value={stockCount} tone="warning" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                alert.severity === "destructive" ? "bg-destructive/10" : "bg-warning/10"
              }`}>
                <AlertTriangle className={`h-5 w-5 ${
                  alert.severity === "destructive" ? "text-destructive" : "text-warning"
                }`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{alert.medicine}</p>
                <p className="text-xs text-muted-foreground">
                  {alert.batch} · {alert.detail}
                </p>
              </div>
              <Badge variant={alert.severity === "destructive" ? "destructive" : "secondary"}>
                {alert.type}
              </Badge>
            </CardContent>
          </Card>
        ))}
        {alerts.length === 0 && (
          <Card className="border-none shadow-sm md:col-span-2">
            <CardContent className="p-8 text-center text-muted-foreground">
              No active alerts. Inventory is healthy.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "warning" | "destructive" }) => {
  const toneCls = tone === "destructive" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning";
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneCls}`}>{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-heading font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Alerts;

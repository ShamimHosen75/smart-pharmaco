import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const alerts = [
  { type: "Expired", medicine: "Metformin 500mg", batch: "B-2024-034", date: "2025-03-01", severity: "destructive" },
  { type: "Expiring Soon", medicine: "Omeprazole 20mg", batch: "B-2024-023", date: "2025-04-10", severity: "warning" },
  { type: "Expiring Soon", medicine: "Ibuprofen 400mg", batch: "B-2024-067", date: "2025-05-20", severity: "warning" },
  { type: "Low Stock", medicine: "Omeprazole 20mg", batch: "B-2024-023", qty: 12, severity: "warning" },
  { type: "Low Stock", medicine: "Ibuprofen 400mg", batch: "B-2024-067", qty: 8, severity: "destructive" },
];

const Alerts = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-2xl font-heading font-bold">Expiry & Stock Alerts</h1>
      <p className="text-sm text-muted-foreground">Monitor expired and low-stock medicines</p>
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
                {alert.batch} · {"date" in alert ? `Expires: ${alert.date}` : `Stock: ${alert.qty} units`}
              </p>
            </div>
            <Badge variant={alert.severity === "destructive" ? "destructive" : "secondary"}>
              {alert.type}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default Alerts;

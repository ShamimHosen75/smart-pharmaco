import { useMemo, useState } from "react";
import { BarChart3, FileSpreadsheet, FileText, Store, CalendarRange } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useSalesStore } from "@/stores/sales-store";
import { useBranchStore } from "@/stores/branch-store";
import { exportSalesCSV, exportSalesPDF } from "@/lib/report-export";

type Range = "today" | "week" | "month" | "all";

const RANGE_LABEL: Record<Range, string> = {
  today: "Today",
  week: "Last 7 days",
  month: "This month",
  all: "All time",
};

function filterByRange<T extends { date: Date }>(items: T[], range: Range): T[] {
  if (range === "all") return items;
  const now = new Date();
  const start = new Date(now);
  if (range === "today") start.setHours(0, 0, 0, 0);
  else if (range === "week") { start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0); }
  else if (range === "month") { start.setDate(1); start.setHours(0, 0, 0, 0); }
  return items.filter((i) => i.date >= start);
}

const Reports = () => {
  const sales = useSalesStore((s) => s.sales);
  const branches = useBranchStore((s) => s.branches);
  const [range, setRange] = useState<Range>("today");
  const [branchId, setBranchId] = useState<string>("all");
  const [busy, setBusy] = useState(false);

  const branchName = branches.find((b) => b.id === branchId)?.name;

  const scopedSales = useMemo(() => {
    let list = sales;
    if (branchId !== "all") list = list.filter((s) => s.branchId === branchId);
    return filterByRange(list, range).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [sales, branchId, range]);

  const stats = useMemo(() => {
    const items = scopedSales.reduce((a, s) => a + s.items.reduce((b, i) => b + i.qty, 0), 0);
    const revenue = scopedSales.reduce((a, s) => a + s.total, 0);
    return { invoices: scopedSales.length, items, revenue };
  }, [scopedSales]);

  const title = `Sales Register — ${RANGE_LABEL[range]}${branchName ? ` (${branchName})` : ""}`;
  const filename = `sales-register-${range}-${new Date().toISOString().slice(0, 10)}`;

  const handleCSV = () => {
    if (!scopedSales.length) {
      toast({ title: "Nothing to export", description: "No sales in range", variant: "destructive" });
      return;
    }
    exportSalesCSV(scopedSales, { title, branchName, filename });
    toast({ title: "Excel/CSV exported", description: `${filename}.csv (with batch & expiry)` });
  };

  const handlePDF = async () => {
    if (!scopedSales.length) {
      toast({ title: "Nothing to export", description: "No sales in range", variant: "destructive" });
      return;
    }
    setBusy(true);
    toast({ title: "Preparing PDF...", description: `${filename}.pdf` });
    try {
      await exportSalesPDF(scopedSales, { title, branchName, filename });
    } catch (e) {
      toast({ title: "PDF failed", description: String(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Generate and download business reports — sales register includes per-line batch & expiry for audit
        </p>
      </div>

      {/* Sales Register exporter */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Sales Register
            <Badge variant="secondary" className="ml-2 text-[10px]">Batch & Expiry</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
              <Select value={range} onValueChange={(v) => setRange(v as Range)}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(RANGE_LABEL) as Range[]).map((r) => (
                    <SelectItem key={r} value={r}>{RANGE_LABEL[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger className="w-[220px]"><SelectValue placeholder="All branches" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All branches</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Invoices</p>
              <p className="text-lg font-semibold">{stats.invoices}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Items sold</p>
              <p className="text-lg font-semibold">{stats.items}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Revenue</p>
              <p className="text-lg font-semibold">{money(stats.revenue)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" /> Export Excel (.csv)
            </Button>
            <Button onClick={handlePDF} disabled={busy}>
              <FileText className="h-4 w-4 mr-2" /> Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Other report templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          "Monthly Sales Report",
          "Purchase Report",
          "Stock Report",
          "Expired Products Report",
          "Profit & Loss Report",
          "Customer Due Report",
          "Supplier Due Report",
        ].map((report) => (
          <Card key={report} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{report}</p>
                <p className="text-xs text-muted-foreground">PDF / Excel</p>
              </div>
              <Button variant="outline" size="sm" disabled>Soon</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reports;

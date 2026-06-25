import { useMemo, useState } from "react";
import { Search, Receipt, FileText, Download, Printer, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useSalesStore, type SaleRecord } from "@/stores/sales-store";
import { useBranchStore } from "@/stores/branch-store";
import { printInvoice, downloadInvoice, type InvoiceData } from "@/lib/invoice-printer";

function toInvoiceData(sale: SaleRecord): InvoiceData {
  return {
    invoiceNo: sale.invoiceNo,
    date: sale.date.toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    }),
    customerName: sale.customerName,
    customerPhone: sale.customerPhone,
    items: sale.items.map(({ name, qty, price }) => ({ name, qty, price })),
    subtotal: sale.subtotal,
    discount: sale.discount,
    vat: sale.vat,
    total: sale.total,
    paymentMethod: sale.paymentMethod,
  };
}

const Receipts = () => {
  const sales = useSalesStore((s) => s.sales);
  const branches = useBranchStore((s) => s.branches);
  const currentBranchId = useBranchStore((s) => s.currentBranchId);

  const [branchFilter, setBranchFilter] = useState<string>(currentBranchId || "all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...sales]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .filter((s) => {
        if (branchFilter !== "all") {
          // Include legacy sales (no branchId) only when "all" is selected
          if (s.branchId !== branchFilter) return false;
        }
        if (!q) return true;
        return (
          s.invoiceNo.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q) ||
          s.customerPhone.toLowerCase().includes(q)
        );
      });
  }, [sales, branchFilter, search]);

  const last = filtered[0];
  const branchName = (id?: string) =>
    branches.find((b) => b.id === id)?.name ?? "—";

  const handlePrint = (sale: SaleRecord, format: "thermal" | "a4") => {
    printInvoice(format, toInvoiceData(sale));
    toast({ title: "Reprinting", description: `${sale.invoiceNo} • ${format.toUpperCase()}` });
  };

  const handleDownload = (sale: SaleRecord, format: "thermal" | "a4") => {
    downloadInvoice(format, toInvoiceData(sale));
    toast({ title: "Download started", description: `${sale.invoiceNo}-${format}.html` });
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold">Receipts</h1>
          <p className="text-sm text-muted-foreground">
            Reprint or download past invoices by branch
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-muted-foreground" />
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All branches</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Last invoice quick-action */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            Last invoice
            {branchFilter !== "all" && (
              <Badge variant="secondary" className="ml-1 text-[10px]">
                {branchName(branchFilter)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!last ? (
            <p className="text-sm text-muted-foreground">No invoices yet for this selection.</p>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/30 p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">{last.invoiceNo}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {last.paymentMethod.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {last.date.toLocaleString()} • {last.customerName || "Walk-in"} •{" "}
                  <span className="text-foreground font-medium">
                    ${last.total.toFixed(2)}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handlePrint(last, "thermal")}>
                  <Printer className="h-3.5 w-3.5 mr-1" /> Thermal
                </Button>
                <Button size="sm" variant="outline" onClick={() => handlePrint(last, "a4")}>
                  <FileText className="h-3.5 w-3.5 mr-1" /> A4
                </Button>
                <Button size="sm" onClick={() => handleDownload(last, "a4")}>
                  <Download className="h-3.5 w-3.5 mr-1" /> Download
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search + table */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base font-heading">
              All receipts <span className="text-muted-foreground font-normal">({filtered.length})</span>
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by invoice, customer, phone..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                    No receipts match the current filters.
                  </TableCell>
                </TableRow>
              )}
              {filtered.slice(0, 200).map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.invoiceNo}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.date.toLocaleDateString()}{" "}
                    {s.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </TableCell>
                  <TableCell className="text-xs">{branchName(s.branchId)}</TableCell>
                  <TableCell className="text-sm">
                    <div className="truncate max-w-[160px]">{s.customerName || "Walk-in"}</div>
                    {s.customerPhone && (
                      <div className="text-[11px] text-muted-foreground">{s.customerPhone}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm">{s.items.length}</TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    ${s.total.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">Actions</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel className="text-xs">Reprint</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handlePrint(s, "thermal")}>
                          <Printer className="h-3.5 w-3.5 mr-2" /> Thermal (80mm)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePrint(s, "a4")}>
                          <FileText className="h-3.5 w-3.5 mr-2" /> A4 invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs">Download</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleDownload(s, "thermal")}>
                          <Download className="h-3.5 w-3.5 mr-2" /> Thermal .html
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(s, "a4")}>
                          <Download className="h-3.5 w-3.5 mr-2" /> A4 .html
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Receipts;

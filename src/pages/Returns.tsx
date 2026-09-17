import { useState, useMemo } from "react";
import { Search, RotateCcw, Check, Minus, Plus, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSalesStore, type SaleRecord, type RefundRecord, formatTimeAgo } from "@/stores/sales-store";
import { toast } from "@/hooks/use-toast";

interface ReturnItem {
  name: string;
  price: number;
  maxQty: number;
  returnQty: number;
}

const Returns = () => {
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("cash");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const sales = useSalesStore((s) => s.sales);
  const refunds = useSalesStore((s) => s.refunds);
  const addRefund = useSalesStore((s) => s.addRefund);
  const getRefundsForInvoice = useSalesStore((s) => s.getRefundsForInvoice);

  // Search results
  const searchResults = useMemo(() => {
    if (invoiceSearch.length < 2) return [];
    const q = invoiceSearch.toLowerCase();
    return [...sales]
      .filter(
        (s) =>
          s.invoiceNo.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q)
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);
  }, [invoiceSearch, sales]);

  const selectInvoice = (sale: SaleRecord) => {
    // Calculate already-refunded quantities
    const existingRefunds = getRefundsForInvoice(sale.invoiceNo);
    const refundedQty: Record<string, number> = {};
    for (const r of existingRefunds) {
      for (const item of r.items) {
        refundedQty[item.name] = (refundedQty[item.name] || 0) + item.qty;
      }
    }

    const items: ReturnItem[] = sale.items.map((item) => ({
      name: item.name,
      price: item.price,
      maxQty: item.qty - (refundedQty[item.name] || 0),
      returnQty: 0,
    }));

    setSelectedSale(sale);
    setReturnItems(items);
    setReason("");
    setRefundMethod("cash");
    setInvoiceSearch("");
  };

  const updateReturnQty = (index: number, delta: number) => {
    setReturnItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, returnQty: Math.max(0, Math.min(item.maxQty, item.returnQty + delta)) }
          : item
      )
    );
  };

  const returnItemsSelected = returnItems.filter((i) => i.returnQty > 0);
  const refundSubtotal = returnItemsSelected.reduce((s, i) => s + i.price * i.returnQty, 0);
  const refundVat = refundSubtotal * 0.05;
  const refundTotal = refundSubtotal + refundVat;

  const processRefund = () => {
    if (!selectedSale || returnItemsSelected.length === 0) return;

    const refund: RefundRecord = {
      id: crypto.randomUUID(),
      refundNo: `RFD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(refunds.length + 1).padStart(4, "0")}`,
      originalInvoiceNo: selectedSale.invoiceNo,
      date: new Date(),
      customerName: selectedSale.customerName,
      items: returnItemsSelected.map((i) => ({ name: i.name, qty: i.returnQty, price: i.price })),
      subtotal: refundSubtotal,
      vat: refundVat,
      total: refundTotal,
      reason,
      refundMethod,
    };

    addRefund(refund);
    setShowConfirmDialog(true);
  };

  const resetForm = () => {
    setSelectedSale(null);
    setReturnItems([]);
    setReason("");
    setShowConfirmDialog(false);
  };

  // Recent refunds
  const recentRefunds = useMemo(
    () => [...refunds].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10),
    [refunds]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Returns & Refunds</h1>
        <p className="text-sm text-muted-foreground">Process returns and issue refunds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Invoice Lookup + Item Selection */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">Lookup Invoice</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice number or customer name..."
                  className="pl-10"
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                />
              </div>

              {/* Search results dropdown */}
              {searchResults.length > 0 && !selectedSale && (
                <div className="mt-2 rounded-lg border border-border bg-card max-h-60 overflow-y-auto">
                  {searchResults.map((sale) => (
                    <button
                      key={sale.id}
                      onClick={() => selectInvoice(sale)}
                      className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium font-mono text-primary">{sale.invoiceNo}</p>
                        <p className="text-xs text-muted-foreground">
                          {sale.customerName || "Walk-in"} · {sale.items.length} items · {formatTimeAgo(sale.date)}
                        </p>
                      </div>
                      <span className="text-sm font-heading font-bold">{money(sale.total)}</span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected invoice items */}
          {selectedSale && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-heading">
                    Invoice {selectedSale.invoiceNo}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={resetForm}>
                    Clear
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedSale.customerName || "Walk-in"} · {selectedSale.date.toLocaleDateString()} · Paid: {selectedSale.paymentMethod}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Select items and quantities to return:</p>
                <div className="space-y-2">
                  {returnItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                        item.returnQty > 0 ? "bg-destructive/5 border border-destructive/20" : "bg-muted/30"
                      } ${item.maxQty === 0 ? "opacity-50" : ""}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {money(item.price)} each · Max returnable: {item.maxQty}
                        </p>
                      </div>
                      {item.maxQty > 0 ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateReturnQty(idx, -1)}
                            className="rounded p-1.5 hover:bg-muted transition-colors"
                            disabled={item.returnQty === 0}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.returnQty}</span>
                          <button
                            onClick={() => updateReturnQty(idx, 1)}
                            className="rounded p-1.5 hover:bg-muted transition-colors"
                            disabled={item.returnQty >= item.maxQty}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Already returned</Badge>
                      )}
                      <p className="w-16 text-right text-sm font-medium">
                        {money((item.price * item.returnQty))}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Refund Summary */}
        <Card className="lg:col-span-2 border-none shadow-sm h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading">Refund Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedSale ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <RotateCcw className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Search for an invoice to start a return</p>
              </div>
            ) : (
              <>
                {/* Return items list */}
                {returnItemsSelected.length > 0 ? (
                  <div className="space-y-2">
                    {returnItemsSelected.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>
                          {item.name} × {item.returnQty}
                        </span>
                        <span className="font-medium">{money((item.price * item.returnQty))}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-muted/30 p-3">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Select items to return</p>
                  </div>
                )}

                <Separator />

                {/* Totals */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{money(refundSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT (5%)</span>
                    <span>{money(refundVat)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-lg font-heading font-bold">
                    <span>Refund Total</span>
                    <span className="text-destructive">{money(refundTotal)}</span>
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <Label className="text-sm">Return Reason</Label>
                  <Textarea
                    placeholder="e.g. Wrong medicine, expired product, customer request..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>

                {/* Refund method */}
                <div className="space-y-2">
                  <Label className="text-sm">Refund Method</Label>
                  <Select value={refundMethod} onValueChange={setRefundMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card Reversal</SelectItem>
                      <SelectItem value="store_credit">Store Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  variant="destructive"
                  size="lg"
                  disabled={returnItemsSelected.length === 0 || !reason.trim()}
                  onClick={processRefund}
                >
                  Process Refund — {money(refundTotal)}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Refunds */}
      {recentRefunds.length > 0 && (
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading">Recent Refunds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-3 text-left font-medium">Refund #</th>
                    <th className="pb-3 text-left font-medium">Original Invoice</th>
                    <th className="pb-3 text-left font-medium">Customer</th>
                    <th className="pb-3 text-left font-medium">Items</th>
                    <th className="pb-3 text-left font-medium">Total</th>
                    <th className="pb-3 text-left font-medium">Reason</th>
                    <th className="pb-3 text-left font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRefunds.map((r) => (
                    <tr key={r.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 font-medium text-destructive font-mono">{r.refundNo}</td>
                      <td className="py-3 font-mono text-primary">{r.originalInvoiceNo}</td>
                      <td className="py-3">{r.customerName || "Walk-in"}</td>
                      <td className="py-3">{r.items.length}</td>
                      <td className="py-3 font-medium">{money(r.total)}</td>
                      <td className="py-3 text-muted-foreground max-w-[200px] truncate">{r.reason}</td>
                      <td className="py-3 text-muted-foreground">{formatTimeAgo(r.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <Check className="h-5 w-5 text-accent" />
              </div>
              Refund Processed!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/30 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Refund No.</span>
                <span className="font-mono font-medium">
                  {refunds.length > 0 ? refunds[refunds.length - 1]?.refundNo : ""}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Invoice</span>
                <span className="font-mono">{selectedSale?.invoiceNo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items Returned</span>
                <span>{returnItemsSelected.length}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-heading font-bold text-lg">
                <span>Refunded</span>
                <span className="text-destructive">{money(refundTotal)}</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={resetForm}>
              Done — Process Another Return
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Returns;

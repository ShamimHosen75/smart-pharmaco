import { useMemo, useState } from "react";
import {
  Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone,
  Receipt, FileText, Check, Store, UserPlus, AlertCircle, Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { printInvoice, downloadInvoicePDF, generateInvoiceNo, type InvoiceData } from "@/lib/invoice-printer";
import { useSalesStore } from "@/stores/sales-store";
import { useMedicineStore, getMedicineStatus } from "@/stores/medicine-store";
import { useBranchStore } from "@/stores/branch-store";
import { useCustomerStore } from "@/stores/customer-store";
import { money } from "@/lib/currency";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  maxStock: number;
  batch?: string;
  expiry?: string;
}


const POS = () => {
  const medicines = useMedicineStore((s) => s.medicines);
  const adjustStock = useMedicineStore((s) => s.adjustStock);
  const addSale = useSalesStore((s) => s.addSale);
  const branches = useBranchStore((s) => s.branches);
  const currentBranchId = useBranchStore((s) => s.currentBranchId);
  const setCurrentBranch = useBranchStore((s) => s.setCurrentBranch);
  const customers = useCustomerStore((s) => s.customers);
  const addLoyaltyPoints = useCustomerStore((s) => s.addLoyaltyPoints);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<InvoiceData | null>(null);

  const activeBranches = branches.filter((b) => b.status === "active");
  const currentBranch =
    branches.find((b) => b.id === currentBranchId) ?? activeBranches[0];

  const filteredMeds = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = medicines.filter((m) => {
      const status = getMedicineStatus(m);
      if (status === "Expired") return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.generic.toLowerCase().includes(q) ||
        m.batch.toLowerCase().includes(q)
      );
    });
    return list.slice(0, 60);
  }, [medicines, search]);

  const addToCart = (med: typeof medicines[number]) => {
    if (med.stock === 0) {
      toast({ title: "Out of stock", description: med.name, variant: "destructive" });
      return;
    }
    setCart((prev) => {
      const existing = prev.find((c) => c.id === med.id);
      if (existing) {
        if (existing.qty + 1 > med.stock) {
          toast({ title: "Stock limit", description: `Only ${med.stock} in stock`, variant: "destructive" });
          return prev;
        }
        return prev.map((c) =>
          c.id === med.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      const price = med.discount
        ? med.price * (1 - med.discount / 100)
        : med.price;
      return [
        ...prev,
        { id: med.id, name: med.name, price, qty: 1, maxStock: med.stock, batch: med.batch, expiry: med.expiry },
      ];

    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id !== id) return c;
          const next = c.qty + delta;
          if (next > c.maxStock) {
            toast({ title: "Stock limit", description: `Only ${c.maxStock} in stock`, variant: "destructive" });
            return c;
          }
          return { ...c, qty: next };
        })
        .filter((c) => c.qty > 0)
    );
  };

  const removeItem = (id: string) =>
    setCart((prev) => prev.filter((c) => c.id !== id));

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discountAmt = subtotal * (discount / 100);
  const vat = (subtotal - discountAmt) * 0.05;
  const total = subtotal - discountAmt + vat;

  const pickCustomer = (cId: string) => {
    const c = customers.find((x) => x.id === cId);
    if (!c) return;
    setCustomerId(c.id);
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setCustomerPickerOpen(false);
  };

  const clearCustomer = () => {
    setCustomerId(undefined);
    setCustomerName("");
    setCustomerPhone("");
  };

  const completeSale = () => {
    if (cart.length === 0) return;
    const invoiceNo = generateInvoiceNo();
    const now = new Date();
    const items = cart.map((c) => ({
      id: c.id, name: c.name, qty: c.qty, price: c.price, batch: c.batch, expiry: c.expiry,
    }));
    const invoice: InvoiceData = {
      invoiceNo,
      date: now.toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
      customerName,
      customerPhone,
      items: items.map(({ name, qty, price, batch, expiry }) => ({ name, qty, price, batch, expiry })),
      subtotal, discount: discountAmt, vat, total, paymentMethod,
    };


    addSale({
      id: crypto.randomUUID(),
      invoiceNo,
      date: now,
      branchId: currentBranch?.id,
      customerId,
      customerName,
      customerPhone,
      items,
      subtotal,
      discount: discountAmt,
      vat,
      total,
      paymentMethod,
    });

    // Deduct stock
    for (const item of cart) adjustStock(item.id, -item.qty);

    // Loyalty: 1 point per $10
    if (customerId) addLoyaltyPoints(customerId, Math.floor(total / 10));

    setLastInvoice(invoice);
    setShowInvoiceDialog(true);
    toast({
      title: "Sale completed",
      description: `${invoiceNo} • ${currentBranch?.name ?? "Branch"}`,
    });
  };

  const handlePrint = (format: "thermal" | "a4") => {
    if (lastInvoice) printInvoice(format, lastInvoice);
  };

  const handleDownloadPDF = async (format: "thermal" | "a4") => {
    if (!lastInvoice) return;
    toast({ title: "Preparing PDF...", description: `${lastInvoice.invoiceNo}-${format}.pdf` });
    try {
      await downloadInvoicePDF(format, lastInvoice);
    } catch (e) {
      toast({ title: "PDF failed", description: String(e), variant: "destructive" });
    }
  };

  const handleDone = () => {
    setShowInvoiceDialog(false);
    setCart([]);
    clearCustomer();
    setDiscount(0);
    setLastInvoice(null);
  };

  return (
    <div className="animate-fade-in h-[calc(100vh-7rem)]">
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold">Point of Sale</h1>
          <p className="text-sm text-muted-foreground">
            Quick sales terminal{currentBranch ? ` • ${currentBranch.name}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-muted-foreground" />
          <Select value={currentBranchId} onValueChange={setCurrentBranch}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {activeBranches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100%-4rem)]">
        {/* Product Grid */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Scan barcode, search by name, generic, or batch..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 overflow-y-auto flex-1 pr-1">
            {filteredMeds.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center h-40 text-sm text-muted-foreground gap-2">
                <AlertCircle className="h-6 w-6" />
                No medicines match "{search}"
              </div>
            )}
            {filteredMeds.map((med) => {
              const status = getMedicineStatus(med);
              const low = status === "Low Stock" || status === "Expiring Soon";
              const out = med.stock === 0;
              const finalPrice = med.discount
                ? med.price * (1 - med.discount / 100)
                : med.price;
              return (
                <button
                  key={med.id}
                  onClick={() => addToCart(med)}
                  disabled={out}
                  className={`flex flex-col items-start rounded-xl border bg-card p-3 text-left transition-all ${
                    out
                      ? "opacity-50 cursor-not-allowed border-border"
                      : "border-border hover:border-primary/40 hover:shadow-sm"
                  }`}
                >
                  <p className="text-sm font-medium leading-tight line-clamp-2">{med.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate w-full">
                    {med.generic}
                  </p>
                  <div className="mt-auto pt-2 flex items-center justify-between w-full">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-heading font-bold text-primary">
                        {money(finalPrice)}
                      </span>
                      {med.discount > 0 && (
                        <span className="text-[10px] text-muted-foreground line-through">
                          {money(med.price)}
                        </span>
                      )}
                    </div>
                    <Badge
                      variant={low ? "destructive" : "secondary"}
                      className="text-[10px]"
                    >
                      {out ? "Out" : med.stock}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cart */}
        <Card className="lg:col-span-2 border-none shadow-sm flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center justify-between">
              Cart
              <Badge variant="secondary">{cart.length} items</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-4 pt-0">
            {/* Customer */}
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-3">
              <Input
                placeholder="Customer name"
                className="text-sm"
                value={customerName}
                onChange={(e) => { setCustomerName(e.target.value); setCustomerId(undefined); }}
              />
              <Input
                placeholder="Phone number"
                className="text-sm"
                value={customerPhone}
                onChange={(e) => { setCustomerPhone(e.target.value); setCustomerId(undefined); }}
              />
              <Popover open={customerPickerOpen} onOpenChange={setCustomerPickerOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="icon" title="Pick customer">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-2" align="end">
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                    Select existing customer
                  </p>
                  <div className="max-h-60 overflow-y-auto">
                    {customers.filter((c) => c.status === "active").map((c) => (
                      <button
                        key={c.id}
                        onClick={() => pickCustomer(c.id)}
                        className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                      >
                        <div className="font-medium">{c.name}</div>
                        <div className="text-[11px] text-muted-foreground">{c.phone}</div>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {customerId && (
              <div className="mb-2 flex items-center justify-between rounded bg-primary/5 px-2 py-1 text-xs text-primary">
                <span>Linked customer • loyalty active</span>
                <button onClick={clearCustomer} className="hover:underline">clear</button>
              </div>
            )}

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {cart.length === 0 && (
                <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                  No items in cart
                </div>
              )}
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-2 rounded-lg bg-muted/30 p-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{money(item.price)} × {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.id, -1)} className="rounded p-1 hover:bg-muted"><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="rounded p-1 hover:bg-muted"><Plus className="h-3 w-3" /></button>
                    <button onClick={() => removeItem(item.id)} className="rounded p-1 hover:bg-muted ml-1"><Trash2 className="h-3 w-3 text-destructive" /></button>
                  </div>
                  <p className="w-16 text-right text-sm font-medium">{money((item.price * item.qty))}</p>
                </div>
              ))}
            </div>

            <Separator className="my-3" />

            {/* Discount */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-muted-foreground">Discount %</span>
              <Input
                type="number"
                min={0}
                max={100}
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                className="w-20 text-sm text-right"
              />
            </div>

            {/* Totals */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{money(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-destructive">-{money(discountAmt)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">VAT (5%)</span><span>{money(vat)}</span></div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-heading font-bold">
                <span>Total</span>
                <span className="text-primary">{money(total)}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="flex gap-2 mt-3">
              {[
                { id: "cash", icon: Banknote, label: "Cash" },
                { id: "card", icon: CreditCard, label: "Card" },
                { id: "mobile", icon: Smartphone, label: "Mobile" },
              ].map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`flex-1 flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-colors ${
                    paymentMethod === pm.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <pm.icon className="h-4 w-4" />
                  {pm.label}
                </button>
              ))}
            </div>

            <Button className="w-full mt-3" size="lg" disabled={cart.length === 0} onClick={completeSale}>
              Complete Sale — {money(total)}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Print Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <Check className="h-5 w-5 text-accent" />
              </div>
              Sale Completed!
            </DialogTitle>
          </DialogHeader>
          {lastInvoice && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/30 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Invoice</span>
                  <span className="font-mono font-medium">{lastInvoice.invoiceNo}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Branch</span>
                  <span>{currentBranch?.name ?? "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Customer</span>
                  <span>{lastInvoice.customerName || "Walk-in"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span>{lastInvoice.items.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-heading font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{money(lastInvoice.total)}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">Print or download as PDF</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handlePrint("thermal")}
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-border p-5 hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <Receipt className="h-8 w-8 text-primary" />
                  <span className="text-sm font-heading font-semibold">Thermal</span>
                  <span className="text-[11px] text-muted-foreground">80mm Receipt</span>
                </button>
                <button
                  onClick={() => handlePrint("a4")}
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-border p-5 hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <FileText className="h-8 w-8 text-accent" />
                  <span className="text-sm font-heading font-semibold">A4</span>
                  <span className="text-[11px] text-muted-foreground">Full Invoice</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" onClick={() => handleDownloadPDF("thermal")}>
                  <Download className="h-3.5 w-3.5 mr-1" /> PDF Thermal
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownloadPDF("a4")}>
                  <Download className="h-3.5 w-3.5 mr-1" /> PDF A4
                </Button>
              </div>

              <Button variant="outline" className="w-full" onClick={handleDone}>
                Done — New Sale
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POS;

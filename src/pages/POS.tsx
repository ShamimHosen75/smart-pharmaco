import { useState } from "react";
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Printer, Receipt, FileText, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { printInvoice, generateInvoiceNo, type InvoiceData } from "@/lib/invoice-printer";
import { useSalesStore } from "@/stores/sales-store";

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

const quickMeds = [
  { id: 1, name: "Paracetamol 500mg", price: 2.5, stock: 450 },
  { id: 2, name: "Amoxicillin 250mg", price: 5.75, stock: 280 },
  { id: 3, name: "Omeprazole 20mg", price: 3.2, stock: 120 },
  { id: 4, name: "Cetirizine 10mg", price: 1.8, stock: 620 },
  { id: 5, name: "Losartan 50mg", price: 6.4, stock: 195 },
  { id: 6, name: "Ibuprofen 400mg", price: 2.9, stock: 85 },
  { id: 7, name: "Metformin 500mg", price: 4.1, stock: 310 },
  { id: 8, name: "Atorvastatin 10mg", price: 7.5, stock: 340 },
  { id: 9, name: "Diclofenac 50mg", price: 3.0, stock: 220 },
  { id: 10, name: "Ranitidine 150mg", price: 2.2, stock: 180 },
  { id: 11, name: "Azithromycin 500mg", price: 8.5, stock: 150 },
  { id: 12, name: "Ciprofloxacin 500mg", price: 4.8, stock: 275 },
];

const POS = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<InvoiceData | null>(null);

  const addToCart = (med: typeof quickMeds[0]) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === med.id);
      if (existing) return prev.map((c) => (c.id === med.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { id: med.id, name: med.name, price: med.price, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const removeItem = (id: number) => setCart((prev) => prev.filter((c) => c.id !== id));

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discountAmt = subtotal * (discount / 100);
  const vat = (subtotal - discountAmt) * 0.05;
  const total = subtotal - discountAmt + vat;

  const filteredMeds = quickMeds.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const addSale = useSalesStore((s) => s.addSale);

  const completeSale = () => {
    const invoiceNo = generateInvoiceNo();
    const now = new Date();
    const invoice: InvoiceData = {
      invoiceNo,
      date: now.toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      }),
      customerName,
      customerPhone,
      items: cart.map((c) => ({ name: c.name, qty: c.qty, price: c.price })),
      subtotal,
      discount: discountAmt,
      vat,
      total,
      paymentMethod,
    };
    // Record in store
    addSale({
      id: crypto.randomUUID(),
      invoiceNo,
      date: now,
      customerName,
      customerPhone,
      items: invoice.items,
      subtotal,
      discount: discountAmt,
      vat,
      total,
      paymentMethod,
    });
    setLastInvoice(invoice);
    setShowInvoiceDialog(true);
  };

  const handlePrint = (format: "thermal" | "a4") => {
    if (lastInvoice) printInvoice(format, lastInvoice);
  };

  const handleDone = () => {
    setShowInvoiceDialog(false);
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setDiscount(0);
    setLastInvoice(null);
  };

  return (
    <div className="animate-fade-in h-[calc(100vh-7rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-heading font-bold">Point of Sale</h1>
        <p className="text-sm text-muted-foreground">Quick sales terminal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100%-4rem)]">
        {/* Product Grid */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Scan barcode or search medicine..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 overflow-y-auto flex-1">
            {filteredMeds.map((med) => (
              <button
                key={med.id}
                onClick={() => addToCart(med)}
                className="flex flex-col items-start rounded-xl border border-border bg-card p-3 text-left hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <p className="text-sm font-medium leading-tight">{med.name}</p>
                <div className="mt-auto pt-2 flex items-center justify-between w-full">
                  <span className="text-sm font-heading font-bold text-primary">${med.price.toFixed(2)}</span>
                  <Badge variant="secondary" className="text-[10px]">{med.stock}</Badge>
                </div>
              </button>
            ))}
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
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Input placeholder="Customer name" className="text-sm" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              <Input placeholder="Phone number" className="text-sm" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </div>

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
                    <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} × {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.id, -1)} className="rounded p-1 hover:bg-muted"><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="rounded p-1 hover:bg-muted"><Plus className="h-3 w-3" /></button>
                    <button onClick={() => removeItem(item.id)} className="rounded p-1 hover:bg-muted ml-1"><Trash2 className="h-3 w-3 text-destructive" /></button>
                  </div>
                  <p className="w-16 text-right text-sm font-medium">${(item.price * item.qty).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <Separator className="my-3" />

            {/* Discount */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-muted-foreground">Discount %</span>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-20 text-sm text-right"
              />
            </div>

            {/* Totals */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-destructive">-${discountAmt.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">VAT (5%)</span><span>${vat.toFixed(2)}</span></div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-heading font-bold">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
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
              Complete Sale — ${total.toFixed(2)}
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
                  <span className="text-primary">${lastInvoice.total.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">Choose print format</p>

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

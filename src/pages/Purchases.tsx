import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Package, Plus, Search, Edit, Trash2, Eye, X, DollarSign, ShoppingCart, Clock } from "lucide-react";
import { usePurchaseStore, type PurchaseItem } from "@/stores/purchase-store";
import { useCompanyStore } from "@/stores/company-store";

type FormData = {
  companyId: string;
  date: string;
  discount: string;
  notes: string;
  status: "received" | "pending" | "cancelled";
};

const emptyForm: FormData = { companyId: "", date: "", discount: "0", notes: "", status: "pending" };
const emptyItem: PurchaseItem = { medicineName: "", batchNo: "", qty: 0, unitCost: 0, expiryDate: "" };

const statusVariant = (s: string) => {
  if (s === "received") return "default";
  if (s === "pending") return "secondary";
  return "destructive";
};

const Purchases = () => {
  const { purchases, addPurchase, updatePurchase, deletePurchase } = usePurchaseStore();
  const { companies, updateCompany } = useCompanyStore();
  const activeCompanies = companies.filter((c) => c.status === "active");

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [items, setItems] = useState<PurchaseItem[]>([{ ...emptyItem }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(
    () =>
      purchases.filter(
        (p) =>
          p.purchaseNo.toLowerCase().includes(search.toLowerCase()) ||
          p.companyName.toLowerCase().includes(search.toLowerCase())
      ),
    [purchases, search]
  );

  const totalValue = purchases.reduce((s, p) => s + p.total, 0);
  const receivedCount = purchases.filter((p) => p.status === "received").length;
  const pendingCount = purchases.filter((p) => p.status === "pending").length;

  const viewPurchase = viewId ? purchases.find((p) => p.id === viewId) : null;

  const set_ = (k: keyof FormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const updateItem = (idx: number, key: keyof PurchaseItem, val: string | number) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));
  };
  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setItems([{ ...emptyItem }]);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    const p = purchases.find((x) => x.id === id);
    if (!p) return;
    setEditId(id);
    setForm({ companyId: p.companyId, date: p.date, discount: String(p.discount), notes: p.notes, status: p.status });
    setItems(p.items.map((i) => ({ ...i })));
    setErrors({});
    setDialogOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.companyId) e.companyId = "Required";
    if (!form.date) e.date = "Required";
    if (items.length === 0) e.items = "Add at least one item";
    items.forEach((it, i) => {
      if (!it.medicineName) e[`item_${i}_name`] = "Required";
      if (it.qty <= 0) e[`item_${i}_qty`] = "> 0";
      if (it.unitCost <= 0) e[`item_${i}_cost`] = "> 0";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const company = companies.find((c) => c.id === form.companyId);
    const subtotal = items.reduce((s, it) => s + it.qty * it.unitCost, 0);
    const discount = parseFloat(form.discount) || 0;
    const total = subtotal - discount;

    const payload = {
      companyId: form.companyId,
      companyName: company?.name || "",
      date: form.date,
      items,
      subtotal,
      discount,
      total,
      status: form.status,
      notes: form.notes,
    };

    if (editId) {
      updatePurchase(editId, payload);
    } else {
      addPurchase(payload as any);
      // Update supplier company stats
      if (company) {
        updateCompany(company.id, {
          totalOrders: company.totalOrders + 1,
          totalValue: company.totalValue + total,
          lastSupply: form.date,
        });
      }
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Purchase Management</h1>
          <p className="text-sm text-muted-foreground">Manage supplier purchases and stock entries</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />New Purchase</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><ShoppingCart className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Total Orders</p><p className="text-xl font-heading font-bold">{purchases.length}</p></div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center"><Package className="h-5 w-5 text-accent-foreground" /></div>
            <div><p className="text-xs text-muted-foreground">Received</p><p className="text-xl font-heading font-bold">{receivedCount}</p></div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center"><Clock className="h-5 w-5 text-secondary-foreground" /></div>
            <div><p className="text-xs text-muted-foreground">Pending</p><p className="text-xl font-heading font-bold">{pendingCount}</p></div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><DollarSign className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Total Value</p><p className="text-xl font-heading font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by PO number or company..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">PO #</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Supplier</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Items</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No purchases found</td></tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setViewId(p.id)}>
                      <td className="px-4 py-3 font-mono text-xs">{p.purchaseNo}</td>
                      <td className="px-4 py-3 font-medium">{p.companyName}</td>
                      <td className="px-4 py-3">{p.date}</td>
                      <td className="px-4 py-3">{p.items.length} item{p.items.length !== 1 && "s"}</td>
                      <td className="px-4 py-3 font-medium">${p.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3"><Badge variant={statusVariant(p.status) as any}>{p.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button className="rounded p-1.5 hover:bg-muted transition-colors" onClick={() => setViewId(p.id)}><Eye className="h-3.5 w-3.5 text-muted-foreground" /></button>
                          <button className="rounded p-1.5 hover:bg-muted transition-colors" onClick={() => openEdit(p.id)}><Edit className="h-3.5 w-3.5 text-muted-foreground" /></button>
                          <button className="rounded p-1.5 hover:bg-muted transition-colors" onClick={() => setDeleteId(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={!!viewPurchase} onOpenChange={() => setViewId(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {viewPurchase && (
            <>
              <SheetHeader>
                <SheetTitle className="font-heading">{viewPurchase.purchaseNo}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-muted-foreground">Supplier</p><p className="font-medium">{viewPurchase.companyName}</p></div>
                  <div><p className="text-muted-foreground">Date</p><p className="font-medium">{viewPurchase.date}</p></div>
                  <div><p className="text-muted-foreground">Status</p><Badge variant={statusVariant(viewPurchase.status) as any}>{viewPurchase.status}</Badge></div>
                  <div><p className="text-muted-foreground">Created</p><p className="font-medium">{viewPurchase.createdAt}</p></div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Items</p>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-muted/30 border-b border-border">
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Medicine</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Batch</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Qty</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Cost</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Line Total</th>
                      </tr></thead>
                      <tbody>
                        {viewPurchase.items.map((it, i) => (
                          <tr key={i} className="border-b border-border/50 last:border-0">
                            <td className="px-3 py-2">{it.medicineName}</td>
                            <td className="px-3 py-2 font-mono text-xs">{it.batchNo}</td>
                            <td className="px-3 py-2 text-right">{it.qty}</td>
                            <td className="px-3 py-2 text-right">{money(it.unitCost)}</td>
                            <td className="px-3 py-2 text-right font-medium">{money((it.qty * it.unitCost))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="border-t border-border pt-4 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{money(viewPurchase.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-{money(viewPurchase.discount)}</span></div>
                  <div className="flex justify-between font-bold text-base"><span>Total</span><span>{money(viewPurchase.total)}</span></div>
                </div>
                {viewPurchase.notes && (
                  <div><p className="text-sm text-muted-foreground">Notes</p><p className="text-sm">{viewPurchase.notes}</p></div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{editId ? "Edit Purchase" : "New Purchase Order"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier Company *</Label>
                <Select value={form.companyId} onValueChange={(v) => set_("companyId", v)}>
                  <SelectTrigger className={errors.companyId ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCompanies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.companyId && <p className="text-xs text-destructive">{errors.companyId}</p>}
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" value={form.date} onChange={(e) => set_("date", e.target.value)} className={errors.date ? "border-destructive" : ""} />
                {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set_("status", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Discount ($)</Label>
                <Input type="number" step="0.01" value={form.discount} onChange={(e) => set_("discount", e.target.value)} />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="mr-1 h-3 w-3" />Add Item</Button>
              </div>
              {errors.items && <p className="text-xs text-destructive">{errors.items}</p>}
              <div className="space-y-3">
                {items.map((it, idx) => (
                  <div key={idx} className="border border-border rounded-lg p-3 space-y-2 relative">
                    {items.length > 1 && (
                      <button className="absolute top-2 right-2 rounded p-1 hover:bg-muted" onClick={() => removeItem(idx)}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Medicine Name *</Label>
                        <Input value={it.medicineName} onChange={(e) => updateItem(idx, "medicineName", e.target.value)} placeholder="e.g. Paracetamol 500mg" className={errors[`item_${idx}_name`] ? "border-destructive" : ""} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Batch No.</Label>
                        <Input value={it.batchNo} onChange={(e) => updateItem(idx, "batchNo", e.target.value)} placeholder="B-2026-XXX" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Quantity *</Label>
                        <Input type="number" value={it.qty || ""} onChange={(e) => updateItem(idx, "qty", parseInt(e.target.value) || 0)} className={errors[`item_${idx}_qty`] ? "border-destructive" : ""} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Unit Cost *</Label>
                        <Input type="number" step="0.01" value={it.unitCost || ""} onChange={(e) => updateItem(idx, "unitCost", parseFloat(e.target.value) || 0)} className={errors[`item_${idx}_cost`] ? "border-destructive" : ""} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Expiry Date</Label>
                        <Input type="date" value={it.expiryDate} onChange={(e) => updateItem(idx, "expiryDate", e.target.value)} />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-right">Line total: {money((it.qty * it.unitCost))}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals preview */}
            <div className="border-t border-border pt-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{money(items.reduce((s, it) => s + it.qty * it.unitCost, 0))}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-{money((parseFloat(form.discount) || 0))}</span></div>
              <div className="flex justify-between font-bold"><span>Total</span><span>{money((items.reduce((s, it) => s + it.qty * it.unitCost, 0) - (parseFloat(form.discount) || 0)))}</span></div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => set_("notes", e.target.value)} placeholder="Optional notes..." rows={2} />
            </div>

            <Button className="w-full" onClick={save}>{editId ? "Update Purchase" : "Create Purchase Order"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deletePurchase(deleteId); setDeleteId(null); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Purchases;

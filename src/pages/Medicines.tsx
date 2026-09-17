import { useMemo, useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, Package, AlertTriangle, Clock, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Medicine,
  MedicineStatus,
  MEDICINE_CATEGORIES,
  getMedicineStatus,
  useMedicineStore,
} from "@/stores/medicine-store";
import { useCompanyStore } from "@/stores/company-store";

const statusVariant = (s: MedicineStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (s) {
    case "In Stock": return "default";
    case "Low Stock": return "secondary";
    case "Expiring Soon": return "secondary";
    case "Out of Stock": return "destructive";
    case "Expired": return "destructive";
    default: return "outline";
  }
};

type FormState = Omit<Medicine, "id" | "createdAt">;

const emptyForm: FormState = {
  name: "",
  generic: "",
  category: "Analgesic",
  company: "",
  batch: "",
  expiry: "",
  stock: 0,
  lowStockThreshold: 30,
  purchasePrice: 0,
  price: 0,
  discount: 0,
};

const Medicines = () => {
  const { medicines, addMedicine, updateMedicine, deleteMedicine } = useMedicineStore();
  const { companies } = useCompanyStore();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [viewing, setViewing] = useState<Medicine | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const enriched = useMemo(
    () => medicines.map((m) => ({ ...m, _status: getMedicineStatus(m) })),
    [medicines]
  );

  const filtered = enriched.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.generic.toLowerCase().includes(search.toLowerCase()) ||
      m.batch.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || m.category === categoryFilter;
    const matchStatus = statusFilter === "all" || m._status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const stats = useMemo(() => {
    const total = enriched.length;
    const lowStock = enriched.filter((m) => m._status === "Low Stock" || m._status === "Out of Stock").length;
    const expiring = enriched.filter((m) => m._status === "Expiring Soon" || m._status === "Expired").length;
    const value = enriched.reduce((acc, m) => acc + m.stock * m.purchasePrice, 0);
    return { total, lowStock, expiring, value };
  }, [enriched]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (m: Medicine) => {
    setEditingId(m.id);
    const { id: _id, createdAt: _c, ...rest } = m;
    setForm(rest);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.batch.trim() || !form.expiry) {
      toast({ title: "Missing fields", description: "Name, batch, and expiry are required.", variant: "destructive" });
      return;
    }
    if (editingId) {
      updateMedicine(editingId, form);
      toast({ title: "Medicine updated", description: form.name });
    } else {
      addMedicine(form);
      toast({ title: "Medicine added", description: form.name });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const m = medicines.find((x) => x.id === deleteId);
    deleteMedicine(deleteId);
    setDeleteId(null);
    toast({ title: "Medicine deleted", description: m?.name });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Medicines</h1>
          <p className="text-sm text-muted-foreground">Manage your medicine inventory</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Medicine
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Package className="h-5 w-5" />} label="Total Items" value={String(stats.total)} tone="default" />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Low / Out of Stock" value={String(stats.lowStock)} tone="warning" />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Expiring / Expired" value={String(stats.expiring)} tone="destructive" />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Inventory Value" value={`${money(stats.value)}`} tone="default" />
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, generic, or batch..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {MEDICINE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
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
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Company</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Batch</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Expiry</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stock</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((med) => (
                  <tr key={med.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-xs text-muted-foreground">{med.generic}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{med.category}</td>
                    <td className="px-4 py-3">{med.company || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{med.batch}</td>
                    <td className="px-4 py-3">{med.expiry}</td>
                    <td className="px-4 py-3">{med.stock}</td>
                    <td className="px-4 py-3 font-medium">${med.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(med._status)}>{med._status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setViewing(med)} className="rounded p-1.5 hover:bg-muted transition-colors" aria-label="View">
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => openEdit(med)} className="rounded p-1.5 hover:bg-muted transition-colors" aria-label="Edit">
                          <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => setDeleteId(med.id)} className="rounded p-1.5 hover:bg-muted transition-colors" aria-label="Delete">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                      No medicines found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {filtered.length} of {medicines.length} medicines
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingId ? "Edit Medicine" : "Add New Medicine"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Medicine Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Paracetamol 500mg" />
              </div>
              <div className="space-y-2">
                <Label>Generic Name</Label>
                <Input value={form.generic} onChange={(e) => setForm({ ...form, generic: e.target.value })} placeholder="e.g. Acetaminophen" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MEDICINE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Supplier Company</Label>
                <Select value={form.company} onValueChange={(v) => setForm({ ...form, company: v })}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>
                    {companies.filter((c) => c.status === "active").map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Batch No. *</Label>
                <Input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} placeholder="B-2026-XXX" />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date *</Label>
                <Input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Stock Qty</Label>
                <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Purchase $</Label>
                <Input type="number" step="0.01" min={0} value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Selling $</Label>
                <Input type="number" step="0.01" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input type="number" min={0} max={100} value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Low @</Label>
                <Input type="number" min={0} value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? "Save Changes" : "Add Medicine"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Sheet */}
      <Sheet open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-heading">{viewing?.name}</SheetTitle>
          </SheetHeader>
          {viewing && (
            <div className="mt-6 space-y-4 text-sm">
              <DetailRow label="Generic" value={viewing.generic || "—"} />
              <DetailRow label="Category" value={viewing.category} />
              <DetailRow label="Supplier" value={viewing.company || "—"} />
              <DetailRow label="Batch No." value={viewing.batch} />
              <DetailRow label="Expiry" value={viewing.expiry} />
              <DetailRow label="Stock" value={`${viewing.stock} units`} />
              <DetailRow label="Low-stock threshold" value={String(viewing.lowStockThreshold)} />
              <DetailRow label="Purchase price" value={`${money(viewing.purchasePrice)}`} />
              <DetailRow label="Selling price" value={`${money(viewing.price)}`} />
              <DetailRow label="Discount" value={`${viewing.discount}%`} />
              <DetailRow label="Inventory value" value={`${money((viewing.stock * viewing.purchasePrice))}`} />
              <div className="pt-2">
                <Badge variant={statusVariant(getMedicineStatus(viewing))}>
                  {getMedicineStatus(viewing)}
                </Badge>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete medicine?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the medicine from inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const StatCard = ({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "default" | "warning" | "destructive" }) => {
  const toneCls =
    tone === "warning" ? "bg-warning/10 text-warning" :
    tone === "destructive" ? "bg-destructive/10 text-destructive" :
    "bg-primary/10 text-primary";
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

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4 border-b border-border/50 pb-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right">{value}</span>
  </div>
);

export default Medicines;

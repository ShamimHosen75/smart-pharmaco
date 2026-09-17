import { useState, useMemo } from "react";
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  User,
  Package,
  DollarSign,
  CalendarClock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useCompanyStore, type Company } from "@/stores/company-store";
import { money } from "@/lib/currency";

type FormData = {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  status: "active" | "inactive";
};

const emptyForm: FormData = {
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  status: "active",
};

const fmt = (n: number) =>
  money(n, 0);

const Companies = () => {
  const { companies, addCompany, updateCompany, deleteCompany, toggleStatus } =
    useCompanyStore();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(
    () =>
      companies.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
          c.city.toLowerCase().includes(search.toLowerCase())
      ),
    [companies, search]
  );

  const totalValue = companies.reduce((s, c) => s + c.totalValue, 0);
  const activeCount = companies.filter((c) => c.status === "active").length;
  const totalOrders = companies.reduce((s, c) => s + c.totalOrders, 0);

  const detailCompany = detailId
    ? companies.find((c) => c.id === detailId) ?? null
    : null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Company name is required";
    if (!form.contactPerson.trim()) e.contactPerson = "Contact person is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (form.name.length > 100) e.name = "Max 100 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (c: Company) => {
    setEditId(c.id);
    setForm({
      name: c.name,
      contactPerson: c.contactPerson,
      phone: c.phone,
      email: c.email,
      address: c.address,
      city: c.city,
      status: c.status,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const save = () => {
    if (!validate()) return;
    if (editId) {
      updateCompany(editId, form);
    } else {
      addCompany(form);
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditId(null);
  };

  const set = (key: keyof FormData, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Medicine Companies</h1>
          <p className="text-sm text-muted-foreground">
            Manage suppliers and manufacturers
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">{companies.length}</p>
              <p className="text-xs text-muted-foreground">Total Companies</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/20">
              <Building2 className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active Suppliers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/20">
              <Package className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">{totalOrders}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/20">
              <DollarSign className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">{fmt(totalValue)}</p>
              <p className="text-xs text-muted-foreground">Total Supply Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by company, contact, or city..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Company</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contact</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Orders</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total Value</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Supply</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      No companies found
                    </td>
                  </tr>
                )}
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => setDetailId(c.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{c.name}</p>
                          {c.email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {c.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {c.contactPerson}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Phone className="h-3 w-3" />
                        {c.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-1">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">{c.city}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{c.totalOrders}</td>
                    <td className="px-4 py-3 font-medium">{fmt(c.totalValue)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.lastSupply}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={c.status === "active" ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(c.id);
                        }}
                      >
                        {c.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(c);
                          }}
                          className="rounded p-1.5 hover:bg-muted transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(c.id);
                          }}
                          className="rounded p-1.5 hover:bg-muted transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={!!detailCompany} onOpenChange={(open) => !open && setDetailId(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {detailCompany && (
            <>
              <SheetHeader>
                <SheetTitle className="font-heading">{detailCompany.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Contact Details
                  </h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{detailCompany.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{detailCompany.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{detailCompany.email || "—"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span>
                        {detailCompany.address}, {detailCompany.city}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Supply Stats */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Supply History
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="border-none shadow-sm">
                      <CardContent className="p-3 text-center">
                        <Package className="h-5 w-5 mx-auto text-primary mb-1" />
                        <p className="text-lg font-bold font-heading">
                          {detailCompany.totalOrders}
                        </p>
                        <p className="text-xs text-muted-foreground">Total Orders</p>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                      <CardContent className="p-3 text-center">
                        <DollarSign className="h-5 w-5 mx-auto text-chart-2 mb-1" />
                        <p className="text-lg font-bold font-heading">
                          {fmt(detailCompany.totalValue)}
                        </p>
                        <p className="text-xs text-muted-foreground">Total Value</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarClock className="h-4 w-4" />
                    Last supply: {detailCompany.lastSupply}
                  </div>
                </div>

                {/* Meta */}
                <div className="space-y-2 text-sm text-muted-foreground border-t border-border pt-4">
                  <p>Status: <Badge variant={detailCompany.status === "active" ? "default" : "secondary"}>{detailCompany.status}</Badge></p>
                  <p>Registered: {detailCompany.createdAt}</p>
                  <p>ID: <span className="font-mono text-xs">{detailCompany.id}</span></p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setDetailId(null);
                      openEdit(detailCompany);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setDetailId(null);
                      setDeleteId(detailCompany.id);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editId ? "Edit Company" : "Add New Company"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Company Name *</Label>
              <Input
                placeholder="e.g. PharmaCo International"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                maxLength={100}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Person *</Label>
                <Input
                  placeholder="Full name"
                  value={form.contactPerson}
                  onChange={(e) => set("contactPerson", e.target.value)}
                  maxLength={100}
                />
                {errors.contactPerson && <p className="text-xs text-destructive">{errors.contactPerson}</p>}
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  placeholder="+1 555-0100"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  maxLength={20}
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="supply@company.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                maxLength={255}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Address *</Label>
                <Input
                  placeholder="Street address"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  maxLength={200}
                />
                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  maxLength={100}
                />
                {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
              </div>
            </div>
            <Button className="w-full" onClick={save}>
              {editId ? "Update Company" : "Save Company"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The company record will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) deleteCompany(deleteId);
                setDeleteId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Companies;

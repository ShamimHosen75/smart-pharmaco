import { useState, useMemo } from "react";
import {
  Globe,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Phone,
  User,
  Mail,
  ToggleLeft,
  ToggleRight,
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
  DialogTrigger,
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
import { useBranchStore, type Branch } from "@/stores/branch-store";
import { useAssignedBranches } from "@/hooks/use-assigned-branches";
import { useAuth } from "@/auth/AuthContext";

const emptyForm: {
  name: string;
  address: string;
  city: string;
  phone: string;
  manager: string;
  email: string;
  status: "active" | "inactive";
} = {
  name: "",
  address: "",
  city: "",
  phone: "",
  manager: "",
  email: "",
  status: "active",
};

const Branches = () => {
  const { branches: allBranches, addBranch, updateBranch, deleteBranch, toggleStatus } =
    useBranchStore();
  const { branches: assignedBranches } = useAssignedBranches();
  const { role } = useAuth();
  const branches = role === "super_admin" ? allBranches : assignedBranches;

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(
    () =>
      branches.filter(
        (b) =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.manager.toLowerCase().includes(search.toLowerCase()) ||
          b.city.toLowerCase().includes(search.toLowerCase())
      ),
    [branches, search]
  );

  const activeBranches = branches.filter((b) => b.status === "active").length;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Branch name is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.manager.trim()) e.manager = "Manager name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email";
    if (form.name.length > 100) e.name = "Max 100 characters";
    if (form.phone.length > 20) e.phone = "Max 20 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => {
    if (role !== "super_admin") return;
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (b: Branch) => {
    if (role !== "super_admin") return;
    setEditId(b.id);
    setForm({
      name: b.name,
      address: b.address,
      city: b.city,
      phone: b.phone,
      manager: b.manager,
      email: b.email,
      status: b.status,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const save = () => {
    if (role !== "super_admin") return;
    if (!validate()) return;
    const data = { ...form, status: form.status as "active" | "inactive" };
    if (editId) {
      updateBranch(editId, data);
    } else {
      addBranch(data);
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditId(null);
  };

  const set = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">
            Branch Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage multi-branch operations
          </p>
        </div>
        {role === "super_admin" && <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Branch
        </Button>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">
                {branches.length}
              </p>
              <p className="text-xs text-muted-foreground">Total Branches</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/20">
              <ToggleRight className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">
                {activeBranches}
              </p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <ToggleLeft className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">
                {branches.length - activeBranches}
              </p>
              <p className="text-xs text-muted-foreground">Inactive</p>
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
              placeholder="Search by name, manager, or city..."
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
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Branch
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Manager
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No branches found
                    </td>
                  </tr>
                )}
                {filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                          {b.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{b.name}</p>
                          {b.email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {b.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-1">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                        <div>
                          <p>{b.address}</p>
                          <p className="text-xs text-muted-foreground">
                            {b.city}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {b.manager}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {b.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          b.status === "active" ? "default" : "secondary"
                        }
                         className={role === "super_admin" ? "cursor-pointer" : ""}
                         onClick={() => { if (role === "super_admin") toggleStatus(b.id); }}
                      >
                        {b.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {b.createdAt}
                    </td>
                    <td className="px-4 py-3">
                      {role === "super_admin" && <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(b)}
                          className="rounded p-1.5 hover:bg-muted transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => setDeleteId(b.id)}
                          className="rounded p-1.5 hover:bg-muted transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editId ? "Edit Branch" : "Add New Branch"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Branch Name *</Label>
              <Input
                placeholder="e.g. Main Branch"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                maxLength={100}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
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
                {errors.address && (
                  <p className="text-xs text-destructive">{errors.address}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  maxLength={100}
                />
                {errors.city && (
                  <p className="text-xs text-destructive">{errors.city}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Manager Name *</Label>
                <Input
                  placeholder="Branch manager"
                  value={form.manager}
                  onChange={(e) => set("manager", e.target.value)}
                  maxLength={100}
                />
                {errors.manager && (
                  <p className="text-xs text-destructive">{errors.manager}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  placeholder="+880 1711-000100"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  maxLength={20}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="branch@medicore.com.bd"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                maxLength={255}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <Button className="w-full" onClick={save}>
              {editId ? "Update Branch" : "Save Branch"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Branch?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The branch and its data will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) deleteBranch(deleteId);
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

export default Branches;

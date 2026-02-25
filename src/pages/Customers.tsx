import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Users, Plus, Search, Star, DollarSign, AlertCircle,
  Pencil, Trash2, Eye, Gift, CreditCard, Award,
} from "lucide-react";
import { useCustomerStore, type Customer } from "@/stores/customer-store";
import { useSalesStore } from "@/stores/sales-store";

const fmt = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

const Customers = () => {
  const {
    customers, payments, addCustomer, updateCustomer, deleteCustomer,
    recordDuePayment, redeemLoyaltyPoints,
  } = useCustomerStore();
  const { sales } = useSalesStore();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [payDueOpen, setPayDueOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemPts, setRedeemPts] = useState("");

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search) ||
          c.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [customers, search],
  );

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "active").length;
  const totalDue = customers.reduce((s, c) => s + c.totalDue, 0);
  const totalLoyalty = customers.reduce((s, c) => s + c.loyaltyPoints, 0);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditingId(c.id);
    setForm({ name: c.name, phone: c.phone, email: c.email, address: c.address, notes: c.notes });
    setDialogOpen(true);
  };

  const saveCustomer = () => {
    if (!form.name || !form.phone) return;
    if (editingId) {
      const existing = customers.find((c) => c.id === editingId)!;
      updateCustomer({ ...existing, ...form });
    } else {
      addCustomer({
        id: crypto.randomUUID(),
        ...form,
        loyaltyPoints: 0,
        totalSpent: 0,
        totalDue: 0,
        joinDate: new Date(),
        status: "active",
      });
    }
    setDialogOpen(false);
  };

  // Purchase history for detail view
  const customerSales = useMemo(() => {
    if (!detailCustomer) return [];
    return sales
      .filter(
        (s) =>
          s.customerName.toLowerCase() === detailCustomer.name.toLowerCase() ||
          s.customerPhone === detailCustomer.phone,
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 30);
  }, [detailCustomer, sales]);

  const customerPayments = useMemo(() => {
    if (!detailCustomer) return [];
    return payments
      .filter((p) => p.customerId === detailCustomer.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [detailCustomer, payments]);

  const handlePayDue = () => {
    if (!detailCustomer || !payAmount) return;
    recordDuePayment(detailCustomer.id, parseFloat(payAmount), payMethod);
    setDetailCustomer(customers.find((c) => c.id === detailCustomer.id) || detailCustomer);
    setPayAmount("");
    setPayDueOpen(false);
  };

  const handleRedeem = () => {
    if (!detailCustomer || !redeemPts) return;
    redeemLoyaltyPoints(detailCustomer.id, parseInt(redeemPts));
    setRedeemPts("");
    setRedeemOpen(false);
  };

  // Keep detail customer in sync
  const liveDetail = detailCustomer
    ? customers.find((c) => c.id === detailCustomer.id) || detailCustomer
    : null;

  const stats = [
    { label: "Total Customers", value: totalCustomers, icon: Users, bg: "bg-primary/10", color: "text-primary" },
    { label: "Active", value: activeCustomers, icon: Award, bg: "bg-emerald-500/10", color: "text-emerald-600" },
    { label: "Outstanding Dues", value: fmt(totalDue), icon: AlertCircle, bg: "bg-red-500/10", color: "text-red-500" },
    { label: "Total Loyalty Pts", value: totalLoyalty.toLocaleString(), icon: Star, bg: "bg-amber-500/10", color: "text-amber-600" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer records, loyalty points, and dues
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-none shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-heading font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Customer Table */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Loyalty Pts</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => setDetailCustomer(c)}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.phone}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3" /> {c.loyaltyPoints}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{fmt(c.totalSpent)}</TableCell>
                    <TableCell>
                      {c.totalDue > 0 ? (
                        <span className="text-red-600 font-medium">{fmt(c.totalDue)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.status === "active" ? "default" : "secondary"}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.joinDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailCustomer(c)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteCustomer(c.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingId ? "Edit Customer" : "Add Customer"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ahmed Khan" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Phone *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555..." />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            <Button className="w-full" onClick={saveCustomer} disabled={!form.name || !form.phone}>
              {editingId ? "Update Customer" : "Add Customer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Detail Sheet */}
      <Sheet open={!!liveDetail} onOpenChange={(open) => !open && setDetailCustomer(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {liveDetail && (
            <>
              <SheetHeader>
                <SheetTitle className="font-heading text-xl">{liveDetail.name}</SheetTitle>
                <p className="text-sm text-muted-foreground">{liveDetail.phone} · {liveDetail.email}</p>
              </SheetHeader>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <Card className="border-none shadow-sm">
                  <CardContent className="p-3 text-center">
                    <Star className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                    <p className="text-lg font-bold">{liveDetail.loyaltyPoints}</p>
                    <p className="text-[10px] text-muted-foreground">Loyalty Points</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-3 text-center">
                    <DollarSign className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
                    <p className="text-lg font-bold">{fmt(liveDetail.totalSpent)}</p>
                    <p className="text-[10px] text-muted-foreground">Total Spent</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-3 text-center">
                    <AlertCircle className="h-4 w-4 mx-auto mb-1 text-red-500" />
                    <p className="text-lg font-bold">{fmt(liveDetail.totalDue)}</p>
                    <p className="text-[10px] text-muted-foreground">Outstanding</p>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                {liveDetail.totalDue > 0 && (
                  <Button size="sm" variant="outline" onClick={() => setPayDueOpen(true)}>
                    <CreditCard className="h-3.5 w-3.5 mr-1" /> Pay Due
                  </Button>
                )}
                {liveDetail.loyaltyPoints > 0 && (
                  <Button size="sm" variant="outline" onClick={() => setRedeemOpen(true)}>
                    <Gift className="h-3.5 w-3.5 mr-1" /> Redeem Points
                  </Button>
                )}
              </div>

              {/* Tabs: Purchase History / Payments */}
              <Tabs defaultValue="purchases" className="mt-6">
                <TabsList className="w-full">
                  <TabsTrigger value="purchases" className="flex-1">Purchase History</TabsTrigger>
                  <TabsTrigger value="payments" className="flex-1">Due Payments</TabsTrigger>
                </TabsList>

                <TabsContent value="purchases" className="mt-3 space-y-2">
                  {customerSales.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No purchase history found</p>
                  ) : (
                    customerSales.map((s) => (
                      <Card key={s.id} className="border-none shadow-sm">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium">{s.invoiceNo}</p>
                              <p className="text-[10px] text-muted-foreground">{s.date.toLocaleDateString()} · {s.items.length} items</p>
                            </div>
                            <p className="font-heading font-bold text-sm">{fmt(s.total)}</p>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {s.items.slice(0, 3).map((item, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px]">
                                {item.name} ×{item.qty}
                              </Badge>
                            ))}
                            {s.items.length > 3 && (
                              <Badge variant="secondary" className="text-[10px]">
                                +{s.items.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="payments" className="mt-3 space-y-2">
                  {customerPayments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No payment records</p>
                  ) : (
                    customerPayments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                        <div>
                          <p className="text-xs font-medium capitalize">{p.method.replace("_", " ")}</p>
                          <p className="text-[10px] text-muted-foreground">{p.date.toLocaleDateString()} · {p.note}</p>
                        </div>
                        <p className="text-sm font-bold text-emerald-600">{fmt(p.amount)}</p>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>

              {/* Info */}
              <div className="mt-6 space-y-2 text-sm">
                <p><span className="text-muted-foreground">Address:</span> {liveDetail.address || "—"}</p>
                <p><span className="text-muted-foreground">Joined:</span> {liveDetail.joinDate.toLocaleDateString()}</p>
                {liveDetail.notes && (
                  <p><span className="text-muted-foreground">Notes:</span> {liveDetail.notes}</p>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Pay Due Dialog */}
      <Dialog open={payDueOpen} onOpenChange={setPayDueOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Record Due Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Outstanding: <span className="font-bold text-foreground">{liveDetail ? fmt(liveDetail.totalDue) : ""}</span>
            </p>
            <div className="space-y-1.5">
              <Label>Amount ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                max={liveDetail?.totalDue}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Method</Label>
              <Select value={payMethod} onValueChange={setPayMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handlePayDue} disabled={!payAmount || parseFloat(payAmount) <= 0}>
              Record Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Redeem Points Dialog */}
      <Dialog open={redeemOpen} onOpenChange={setRedeemOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Redeem Loyalty Points</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Available: <span className="font-bold text-foreground">{liveDetail?.loyaltyPoints.toLocaleString()} pts</span>
            </p>
            <div className="space-y-1.5">
              <Label>Points to Redeem</Label>
              <Input
                type="number"
                min="0"
                max={liveDetail?.loyaltyPoints}
                value={redeemPts}
                onChange={(e) => setRedeemPts(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleRedeem} disabled={!redeemPts || parseInt(redeemPts) <= 0}>
              <Gift className="h-4 w-4 mr-2" /> Redeem
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;

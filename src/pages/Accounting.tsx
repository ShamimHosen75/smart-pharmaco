import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  DollarSign, TrendingUp, TrendingDown, PlusCircle, Trash2,
  ArrowUpRight, ArrowDownRight, Wallet, Receipt,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useSalesStore, getThisMonthSales } from "@/stores/sales-store";
import {
import { money } from "@/lib/currency";
import { fmtDate } from "@/lib/format-date";
  useExpenseStore, getExpensesByCategory, getExpensesByDateRange,
  type ExpenseCategory,
} from "@/stores/expense-store";

const expenseCategories: ExpenseCategory[] = [
  "Rent", "Utilities", "Salaries", "Supplies", "Transport", "Marketing", "Maintenance", "Other",
];

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(142 76% 36%)",
  "hsl(38 92% 50%)",
  "hsl(0 72% 51%)",
];

const fmt = (n: number) => money(n);

const Accounting = () => {
  const { sales } = useSalesStore();
  const { expenses, addExpense, deleteExpense } = useExpenseStore();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    category: "Supplies" as ExpenseCategory,
    description: "",
    amount: "",
    paidTo: "",
    paymentMethod: "cash",
  });

  const now = new Date();
  const todayStart = useMemo(() => { const d = new Date(now); d.setHours(0, 0, 0, 0); return d; }, []);
  const monthStart = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 1), []);
  const monthEnd = useMemo(() => new Date(now.getFullYear(), now.getMonth() + 1, 1), []);

  const monthSales = useMemo(() => getThisMonthSales(sales), [sales]);
  const monthExpenses = useMemo(() => getExpensesByDateRange(expenses, monthStart, monthEnd), [expenses, monthStart, monthEnd]);
  const todayExpenses = useMemo(() => getExpensesByDateRange(expenses, todayStart, new Date(todayStart.getTime() + 86400000)), [expenses, todayStart]);

  const monthIncome = useMemo(() => monthSales.reduce((s, r) => s + r.total, 0), [monthSales]);
  const monthExpenseTotal = useMemo(() => monthExpenses.reduce((s, e) => s + e.amount, 0), [monthExpenses]);
  const todayIncome = useMemo(() => {
    const end = new Date(todayStart.getTime() + 86400000);
    return sales.filter((s) => s.date >= todayStart && s.date < end).reduce((sum, s) => sum + s.total, 0);
  }, [sales, todayStart]);
  const todayExpenseTotal = useMemo(() => todayExpenses.reduce((s, e) => s + e.amount, 0), [todayExpenses]);
  const netProfit = monthIncome - monthExpenseTotal;

  const expenseByCat = useMemo(() => getExpensesByCategory(monthExpenses), [monthExpenses]);

  // Daily P&L for last 30 days
  const dailyPL = useMemo(() => {
    const result: { date: string; income: number; expenses: number; profit: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d.getTime() + 86400000);
      const dayIncome = sales.filter((s) => s.date >= d && s.date < next).reduce((sum, s) => sum + s.total, 0);
      const dayExp = expenses.filter((e) => e.date >= d && e.date < next).reduce((sum, e) => sum + e.amount, 0);
      result.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        income: Math.round(dayIncome * 100) / 100,
        expenses: Math.round(dayExp * 100) / 100,
        profit: Math.round((dayIncome - dayExp) * 100) / 100,
      });
    }
    return result;
  }, [sales, expenses]);

  const recentExpenses = useMemo(
    () => [...expenses].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 20),
    [expenses],
  );

  const handleAddExpense = () => {
    if (!form.description || !form.amount || !form.paidTo) return;
    addExpense({
      id: crypto.randomUUID(),
      date: new Date(),
      category: form.category,
      description: form.description,
      amount: parseFloat(form.amount),
      paidTo: form.paidTo,
      paymentMethod: form.paymentMethod,
    });
    setForm({ category: "Supplies", description: "", amount: "", paidTo: "", paymentMethod: "cash" });
    setAddOpen(false);
  };

  const stats = [
    { label: "Today's Income", value: fmt(todayIncome), icon: TrendingUp, trend: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Today's Expenses", value: fmt(todayExpenseTotal), icon: TrendingDown, trend: "text-red-500", bg: "bg-red-500/10" },
    { label: "Monthly Revenue", value: fmt(monthIncome), icon: Wallet, trend: "text-primary", bg: "bg-primary/10" },
    { label: "Net Profit (Month)", value: fmt(netProfit), icon: netProfit >= 0 ? ArrowUpRight : ArrowDownRight, trend: netProfit >= 0 ? "text-emerald-600" : "text-red-500", bg: netProfit >= 0 ? "bg-emerald-500/10" : "bg-red-500/10" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Accounting</h1>
          <p className="text-sm text-muted-foreground">Financial overview, expenses, and profit/loss</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Expense
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-none shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.trend}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-heading font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="pnl">Profit & Loss</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Daily Income vs Expenses */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-heading">Daily Income vs Expenses (30d)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={dailyPL}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="hsl(0 72% 51%)" fill="hsl(0 72% 51%)" fillOpacity={0.15} />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expense by Category Pie */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-heading">Expenses by Category (Month)</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={expenseByCat}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseByCat.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* EXPENSES */}
        <TabsContent value="expenses" className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <Receipt className="h-4 w-4" /> Recent Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Paid To</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentExpenses.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs">{fmtDate(e.date)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{e.category}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{e.description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{e.paidTo}</TableCell>
                      <TableCell className="text-xs capitalize">{e.paymentMethod.replace("_", " ")}</TableCell>
                      <TableCell className="text-right font-medium text-red-600">{fmt(e.amount)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteExpense(e.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROFIT & LOSS */}
        <TabsContent value="pnl" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm">
              <CardContent className="p-5 text-center">
                <p className="text-xs text-muted-foreground">Total Income</p>
                <p className="text-2xl font-heading font-bold text-emerald-600">{fmt(monthIncome)}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-5 text-center">
                <p className="text-xs text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-heading font-bold text-red-500">{fmt(monthExpenseTotal)}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-5 text-center">
                <p className="text-xs text-muted-foreground">Net Profit</p>
                <p className={`text-2xl font-heading font-bold ${netProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {fmt(netProfit)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading">Daily Profit/Loss (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyPL}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expenses" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} name="Expenses" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown Table */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading">Expense Breakdown by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseByCat.map((c) => (
                    <TableRow key={c.category}>
                      <TableCell className="font-medium">{c.category}</TableCell>
                      <TableCell className="text-right">{fmt(c.total)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {monthExpenseTotal > 0 ? ((c.total / monthExpenseTotal) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{fmt(monthExpenseTotal)}</TableCell>
                    <TableCell className="text-right">100%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Expense Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Add Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ExpenseCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Monthly electricity" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Amount ($)</Label>
                <Input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Payment Method</Label>
                <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Paid To</Label>
              <Input value={form.paidTo} onChange={(e) => setForm({ ...form, paidTo: e.target.value })} placeholder="Vendor / recipient name" />
            </div>
            <Button className="w-full" onClick={handleAddExpense} disabled={!form.description || !form.amount || !form.paidTo}>
              <DollarSign className="h-4 w-4 mr-2" /> Add Expense
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Accounting;

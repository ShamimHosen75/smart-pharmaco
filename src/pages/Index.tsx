import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  Pill,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  useSalesStore,
  getTodaySales,
  getThisMonthSales,
  getWeeklySalesChart,
  getTopMedicines,
  formatTimeAgo,
} from "@/stores/sales-store";
import { useMedicineStore, getMedicineStatus } from "@/stores/medicine-store";
import { useCustomerStore } from "@/stores/customer-store";
import { useEmployeeStore } from "@/stores/employee-store";
import { useAssignedBranches } from "@/hooks/use-assigned-branches";
import { money, currencySymbol } from "@/lib/currency";

const Dashboard = () => {
  const allSales = useSalesStore((s) => s.sales);
  const { branchIds } = useAssignedBranches();
  const sales = useMemo(() => allSales.filter((s) => s.branchId && branchIds.has(s.branchId)), [allSales, branchIds]);
  const medicines = useMedicineStore((s) => s.medicines);
  const customers = useCustomerStore((s) => s.customers);
  const employees = useEmployeeStore((s) => s.employees);
  const navigate = useNavigate();

  const todaySales = useMemo(() => getTodaySales(sales), [sales]);
  const monthSales = useMemo(() => getThisMonthSales(sales), [sales]);
  const weeklyChart = useMemo(() => getWeeklySalesChart(sales), [sales]);
  const topMeds = useMemo(() => getTopMedicines(sales), [sales]);

  const lowOrOutCount = useMemo(
    () => medicines.filter((m) => {
      const st = getMedicineStatus(m);
      return st === "Low Stock" || st === "Out of Stock";
    }).length,
    [medicines]
  );
  const activeStaff = employees.filter((e) => e.status === "active").length;

  const todayTotal = todaySales.reduce((s, r) => s + r.total, 0);
  const monthTotal = monthSales.reduce((s, r) => s + r.total, 0);
  const todayCount = todaySales.length;

  // Yesterday comparison
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);
  const yesterdaySales = sales.filter((s) => s.date >= yesterday && s.date < yesterdayEnd);
  const yesterdayTotal = yesterdaySales.reduce((s, r) => s + r.total, 0);
  const todayChange = yesterdayTotal > 0 ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100 : 0;

  const recentSales = useMemo(
    () =>
      [...sales]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 8),
    [sales]
  );

  const fmt = (n: number) =>
    n >= 1000 ? `${money((n / 1000), 1)}k` : `${money(n, 0)}`;
  const fmtFull = (n: number) =>
    money(n);

  const stats = [
    {
      title: "Today's Sales",
      value: fmtFull(todayTotal),
      change: `${todayChange >= 0 ? "+" : ""}${todayChange.toFixed(1)}%`,
      up: todayChange >= 0,
      subtitle: `${todayCount} transactions`,
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Monthly Revenue",
      value: fmtFull(monthTotal),
      change: `${monthSales.length} sales`,
      up: true,
      subtitle: "This month",
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      title: "Items Sold Today",
      value: String(todaySales.reduce((s, r) => s + r.items.reduce((a, i) => a + i.qty, 0), 0)),
      change: `${todaySales.length} invoices`,
      up: true,
      subtitle: "Total units",
      icon: Package,
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      title: "Avg. Order Value",
      value: todayCount > 0 ? fmtFull(todayTotal / todayCount) : money(0),
      change: todayCount > 0 ? `Per sale` : "No sales",
      up: true,
      subtitle: "Today",
      icon: AlertTriangle,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back! Here's your pharmacy overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-heading font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.up ? (
                      <ArrowUpRight className="h-3 w-3 text-accent" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-destructive" />
                    )}
                    <span className={`text-xs font-medium ${stat.up ? "text-accent" : "text-destructive"}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Medicines", value: medicines.length, sub: "in catalog", icon: Pill, color: "text-primary", bg: "bg-primary/10", path: "/medicines" },
          { label: "Stock Alerts", value: lowOrOutCount, sub: "low / out of stock", icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", path: "/alerts" },
          { label: "Customers", value: customers.length, sub: "registered", icon: Users, color: "text-accent", bg: "bg-accent/10", path: "/customers" },
          { label: "Active Staff", value: activeStaff, sub: "on roster", icon: ShoppingCart, color: "text-info", bg: "bg-info/10", path: "/employees" },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => navigate(s.path)}
            className="text-left"
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-heading font-bold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>


      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading">Weekly Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={weeklyChart}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217, 91%, 50%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(217, 91%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" tick={{ fill: "hsl(215, 15%, 47%)" }} />
                <YAxis className="text-xs" tick={{ fill: "hsl(215, 15%, 47%)" }} tickFormatter={(v) => (v >= 1000 ? `${currencySymbol()}${(v / 1000).toFixed(0)}k` : `${currencySymbol()}${v}`)} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(214, 20%, 90%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${money(value)}`, "Sales"]}
                />
                <Area type="monotone" dataKey="sales" stroke="hsl(217, 91%, 50%)" fill="url(#salesGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading">Top Selling Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            {topMeds.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topMeds} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" tick={{ fill: "hsl(215, 15%, 47%)", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "hsl(215, 15%, 47%)", fontSize: 11 }} width={110} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(214, 20%, 90%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="sold" fill="hsl(217, 91%, 50%)" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
                No sales data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales & Quick Actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-3 text-left font-medium">Invoice</th>
                    <th className="pb-3 text-left font-medium">Customer</th>
                    <th className="pb-3 text-left font-medium">Items</th>
                    <th className="pb-3 text-left font-medium">Total</th>
                    <th className="pb-3 text-left font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 font-medium text-primary">{sale.invoiceNo}</td>
                      <td className="py-3">{sale.customerName || "Walk-in"}</td>
                      <td className="py-3">{sale.items.length}</td>
                      <td className="py-3 font-medium">{money(sale.total)}</td>
                      <td className="py-3 text-muted-foreground">{formatTimeAgo(sale.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { icon: ShoppingCart, label: "New Sale", color: "bg-primary/10 text-primary", path: "/pos" },
              { icon: Pill, label: "Add Medicine", color: "bg-accent/10 text-accent", path: "/medicines" },
              { icon: Package, label: "New Purchase", color: "bg-info/10 text-info", path: "/purchases" },
              { icon: Users, label: "Add Customer", color: "bg-warning/10 text-warning", path: "/customers" },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex w-full items-center gap-3 rounded-lg border border-border/50 p-3 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.color}`}>
                  <action.icon className="h-4 w-4" />
                </div>
                {action.label}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

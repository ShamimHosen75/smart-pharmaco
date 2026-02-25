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

const salesData = [
  { day: "Mon", sales: 4200, purchases: 2400 },
  { day: "Tue", sales: 3800, purchases: 1800 },
  { day: "Wed", sales: 5100, purchases: 3200 },
  { day: "Thu", sales: 4700, purchases: 2100 },
  { day: "Fri", sales: 5900, purchases: 2800 },
  { day: "Sat", sales: 6200, purchases: 3100 },
  { day: "Sun", sales: 3500, purchases: 1500 },
];

const topMedicines = [
  { name: "Paracetamol 500mg", sold: 342 },
  { name: "Amoxicillin 250mg", sold: 287 },
  { name: "Omeprazole 20mg", sold: 234 },
  { name: "Metformin 500mg", sold: 198 },
  { name: "Cetirizine 10mg", sold: 176 },
];

const stats = [
  {
    title: "Today's Sales",
    value: "$12,426",
    change: "+12.5%",
    up: true,
    icon: DollarSign,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Monthly Revenue",
    value: "$284,500",
    change: "+8.2%",
    up: true,
    icon: TrendingUp,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    title: "Total Products",
    value: "2,847",
    change: "+24",
    up: true,
    icon: Package,
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    title: "Expired Alerts",
    value: "18",
    change: "+3",
    up: false,
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
  },
];

const recentSales = [
  { id: "INV-001", customer: "Ahmed Khan", items: 5, total: "$245.00", time: "2 min ago" },
  { id: "INV-002", customer: "Sara Ali", items: 3, total: "$128.50", time: "15 min ago" },
  { id: "INV-003", customer: "Walk-in", items: 1, total: "$45.00", time: "32 min ago" },
  { id: "INV-004", customer: "Fatima Noor", items: 8, total: "$567.25", time: "1 hr ago" },
  { id: "INV-005", customer: "Omar Hassan", items: 2, total: "$89.00", time: "2 hr ago" },
];

const Dashboard = () => {
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
                    <span
                      className={`text-xs font-medium ${
                        stat.up ? "text-accent" : "text-destructive"
                      }`}
                    >
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

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading">Sales & Purchases Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217, 91%, 50%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(217, 91%, 50%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="purchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" tick={{ fill: 'hsl(215, 15%, 47%)' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(215, 15%, 47%)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(214, 20%, 90%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="sales" stroke="hsl(217, 91%, 50%)" fill="url(#salesGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="purchases" stroke="hsl(160, 60%, 45%)" fill="url(#purchGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading">Top Selling Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topMedicines} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" tick={{ fill: 'hsl(215, 15%, 47%)', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(215, 15%, 47%)', fontSize: 11 }} width={110} />
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
                      <td className="py-3 font-medium text-primary">{sale.id}</td>
                      <td className="py-3">{sale.customer}</td>
                      <td className="py-3">{sale.items}</td>
                      <td className="py-3 font-medium">{sale.total}</td>
                      <td className="py-3 text-muted-foreground">{sale.time}</td>
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
              { icon: ShoppingCart, label: "New Sale", color: "bg-primary/10 text-primary" },
              { icon: Pill, label: "Add Medicine", color: "bg-accent/10 text-accent" },
              { icon: Package, label: "New Purchase", color: "bg-info/10 text-info" },
              { icon: Users, label: "Add Customer", color: "bg-warning/10 text-warning" },
            ].map((action) => (
              <button
                key={action.label}
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

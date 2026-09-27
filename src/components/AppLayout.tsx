import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Pill,
  ShoppingCart,
  RotateCcw,
  Receipt,
  Package,
  Users,
  BarChart3,
  Settings,
  Building2,
  AlertTriangle,
  DollarSign,
  UserCog,
  CreditCard,
  Globe,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth, accessByRole, roleName } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const navGroups = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, path: "/" },
      { title: "POS Sales", icon: ShoppingCart, path: "/pos" },
      { title: "Returns", icon: RotateCcw, path: "/returns" },
      { title: "Receipts", icon: Receipt, path: "/receipts" },
    ],
  },
  {
    label: "Inventory",
    items: [
      { title: "Medicines", icon: Pill, path: "/medicines" },
      { title: "Companies", icon: Building2, path: "/companies" },
      { title: "Purchases", icon: Package, path: "/purchases" },
      { title: "Expiry Alerts", icon: AlertTriangle, path: "/alerts" },
    ],
  },
  {
    label: "People",
    items: [
      { title: "Customers", icon: Users, path: "/customers" },
      { title: "Employees", icon: UserCog, path: "/employees" },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Accounting", icon: DollarSign, path: "/accounting" },
      { title: "Reports", icon: BarChart3, path: "/reports" },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Branches", icon: Globe, path: "/branches" },
      { title: "Subscriptions", icon: CreditCard, path: "/subscriptions" },
      { title: "Settings", icon: Settings, path: "/settings" },
    ],
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { role, profile, signOut } = useAuth();

  // close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const showSidebar = !isMobile || mobileOpen;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
          isMobile
            ? cn(
                "fixed inset-y-0 left-0 z-40 w-[260px] shadow-2xl",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
              )
            : collapsed
              ? "w-[68px]"
              : "w-[250px]"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-bold text-sm">
            M
          </div>
          {(!collapsed || isMobile) && (
            <div className="animate-slide-in flex-1">
              <h1 className="font-heading font-bold text-sm text-sidebar-primary-foreground leading-tight">
                MediCore
              </h1>
              <p className="text-[10px] text-sidebar-foreground/60">Pharmacy POS</p>
            </div>
          )}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
          {navGroups.map((group) => ({ ...group, items: group.items.filter((item) => role && accessByRole[role].includes(item.path)) })).filter((group) => group.items.length > 0).map((group) => (
            <div key={group.label}>
              {(!collapsed || isMobile) && (
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {(!collapsed || isMobile) && <span>{item.title}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle - desktop only */}
        {!isMobile && (
          <div className="border-t border-sidebar-border p-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 transition-colors"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between gap-3 border-b border-border bg-card px-3 sm:px-6">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isMobile && (
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <div className="relative w-full max-w-xs sm:max-w-sm md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="h-9 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/20 transition-shadow"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <div className="hidden sm:block h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                 {(profile?.full_name || "S").slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:block">
                 <p className="text-sm font-medium leading-tight">{profile?.full_name || "Staff"}</p>
                 <p className="text-[11px] text-muted-foreground">{role ? roleName[role] : ""} · {profile?.branch}</p>
              </div>
            </div>
            <Button size="icon" variant="ghost" title="Sign out" aria-label="Sign out" onClick={() => void signOut()}><LogOut className="h-4 w-4"/></Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

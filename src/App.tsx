import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import Medicines from "./pages/Medicines";
import POS from "./pages/POS";
import Returns from "./pages/Returns";
import Receipts from "./pages/Receipts";
import Purchases from "./pages/Purchases";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import SystemSettings from "./pages/SystemSettings";
import Companies from "./pages/Companies";
import Alerts from "./pages/Alerts";
import Accounting from "./pages/Accounting";
import Employees from "./pages/Employees";
import Branches from "./pages/Branches";
import NotFound from "./pages/NotFound";
import { useThemeSync } from "./hooks/use-theme-sync";

const queryClient = new QueryClient();

const ThemedApp = ({ children }: { children: React.ReactNode }) => {
  useThemeSync();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemedApp>
          <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/medicines" element={<Medicines />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/receipts" element={<Receipts />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SystemSettings />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AppLayout>
        </ThemedApp>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

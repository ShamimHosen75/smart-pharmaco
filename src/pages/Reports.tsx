import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Reports = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-2xl font-heading font-bold">Reports</h1>
      <p className="text-sm text-muted-foreground">Generate and download business reports</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        "Daily Sales Report",
        "Monthly Sales Report",
        "Purchase Report",
        "Stock Report",
        "Expired Products Report",
        "Profit & Loss Report",
        "Customer Due Report",
        "Supplier Due Report",
      ].map((report) => (
        <Card key={report} className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{report}</p>
              <p className="text-xs text-muted-foreground">PDF / Excel</p>
            </div>
            <Button variant="outline" size="sm">Generate</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default Reports;

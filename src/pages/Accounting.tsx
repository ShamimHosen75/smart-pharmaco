import { Card, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

const Accounting = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-2xl font-heading font-bold">Accounting</h1>
      <p className="text-sm text-muted-foreground">Financial overview and expense management</p>
    </div>
    <Card className="border-none shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-20">
        <DollarSign className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-lg font-heading font-medium">Financial records will appear here</p>
        <p className="text-sm text-muted-foreground mt-1">Track expenses, income, and profit/loss</p>
      </CardContent>
    </Card>
  </div>
);

export default Accounting;

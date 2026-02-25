import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users as UsersIcon, Plus } from "lucide-react";

const Customers = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-heading font-bold">Customers</h1>
        <p className="text-sm text-muted-foreground">Manage customer records and loyalty</p>
      </div>
      <Button><Plus className="mr-2 h-4 w-4" />Add Customer</Button>
    </div>
    <Card className="border-none shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-20">
        <UsersIcon className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-lg font-heading font-medium">Customer records will appear here</p>
        <p className="text-sm text-muted-foreground mt-1">Add customers to track purchases and loyalty</p>
      </CardContent>
    </Card>
  </div>
);

export default Customers;

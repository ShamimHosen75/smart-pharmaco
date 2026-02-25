import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";

const Purchases = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-heading font-bold">Purchase Management</h1>
        <p className="text-sm text-muted-foreground">Manage supplier purchases and stock entries</p>
      </div>
      <Button><Plus className="mr-2 h-4 w-4" />New Purchase</Button>
    </div>
    <Card className="border-none shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-20">
        <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-lg font-heading font-medium">Purchase records will appear here</p>
        <p className="text-sm text-muted-foreground mt-1">Add your first purchase to get started</p>
      </CardContent>
    </Card>
  </div>
);

export default Purchases;

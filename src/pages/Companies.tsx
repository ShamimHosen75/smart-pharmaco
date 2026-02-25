import { Card, CardContent } from "@/components/ui/card";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Companies = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-heading font-bold">Medicine Companies</h1>
        <p className="text-sm text-muted-foreground">Manage suppliers and manufacturers</p>
      </div>
      <Button><Plus className="mr-2 h-4 w-4" />Add Company</Button>
    </div>
    <Card className="border-none shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-lg font-heading font-medium">Company records will appear here</p>
        <p className="text-sm text-muted-foreground mt-1">Add pharmaceutical companies and suppliers</p>
      </CardContent>
    </Card>
  </div>
);

export default Companies;

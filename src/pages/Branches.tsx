import { Card, CardContent } from "@/components/ui/card";
import { Globe, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Branches = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-heading font-bold">Branch Management</h1>
        <p className="text-sm text-muted-foreground">Manage multi-branch operations</p>
      </div>
      <Button><Plus className="mr-2 h-4 w-4" />Add Branch</Button>
    </div>
    <Card className="border-none shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-20">
        <Globe className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-lg font-heading font-medium">Branch records will appear here</p>
        <p className="text-sm text-muted-foreground mt-1">Create and manage pharmacy branches</p>
      </CardContent>
    </Card>
  </div>
);

export default Branches;

import { Card, CardContent } from "@/components/ui/card";
import { UserCog, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Employees = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-heading font-bold">Employees</h1>
        <p className="text-sm text-muted-foreground">Manage staff and role assignments</p>
      </div>
      <Button><Plus className="mr-2 h-4 w-4" />Add Employee</Button>
    </div>
    <Card className="border-none shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-20">
        <UserCog className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-lg font-heading font-medium">Employee records will appear here</p>
        <p className="text-sm text-muted-foreground mt-1">Add staff members and manage roles</p>
      </CardContent>
    </Card>
  </div>
);

export default Employees;

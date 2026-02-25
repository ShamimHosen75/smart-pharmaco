import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const SystemSettings = () => (
  <div className="space-y-6 animate-fade-in max-w-3xl">
    <div>
      <h1 className="text-2xl font-heading font-bold">Settings</h1>
      <p className="text-sm text-muted-foreground">Manage pharmacy and system settings</p>
    </div>

    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-heading">Pharmacy Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Pharmacy Name</Label>
            <Input defaultValue="MediCore Pharmacy" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input defaultValue="+1 234 567 890" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Address</Label>
          <Input defaultValue="123 Health Street, Medical District" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue="info@medicore.com" />
          </div>
          <div className="space-y-2">
            <Label>License No.</Label>
            <Input defaultValue="PH-2024-12345" />
          </div>
        </div>
        <Button>Save Changes</Button>
      </CardContent>
    </Card>

    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-heading">Tax & Currency</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Currency</Label>
            <Input defaultValue="USD ($)" />
          </div>
          <div className="space-y-2">
            <Label>VAT %</Label>
            <Input type="number" defaultValue="5" />
          </div>
          <div className="space-y-2">
            <Label>Tax ID</Label>
            <Input defaultValue="TAX-001234" />
          </div>
        </div>
        <Button>Save Changes</Button>
      </CardContent>
    </Card>
  </div>
);

export default SystemSettings;

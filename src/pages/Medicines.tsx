import { useState } from "react";
import { Plus, Search, Filter, Edit, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockMedicines = [
  { id: 1, name: "Paracetamol 500mg", generic: "Acetaminophen", category: "Analgesic", company: "PharmaCo", batch: "B-2024-001", expiry: "2026-03-15", stock: 450, price: 2.50, status: "In Stock" },
  { id: 2, name: "Amoxicillin 250mg", generic: "Amoxicillin", category: "Antibiotic", company: "MedLife", batch: "B-2024-012", expiry: "2025-08-20", stock: 280, price: 5.75, status: "In Stock" },
  { id: 3, name: "Omeprazole 20mg", generic: "Omeprazole", category: "Antacid", company: "HealthPlus", batch: "B-2024-023", expiry: "2025-04-10", stock: 12, price: 3.20, status: "Low Stock" },
  { id: 4, name: "Metformin 500mg", generic: "Metformin HCl", category: "Antidiabetic", company: "PharmaCo", batch: "B-2024-034", expiry: "2025-03-01", stock: 0, price: 4.10, status: "Expired" },
  { id: 5, name: "Cetirizine 10mg", generic: "Cetirizine", category: "Antihistamine", company: "MedLife", batch: "B-2024-045", expiry: "2026-12-01", stock: 620, price: 1.80, status: "In Stock" },
  { id: 6, name: "Losartan 50mg", generic: "Losartan Potassium", category: "Antihypertensive", company: "CardioMed", batch: "B-2024-056", expiry: "2026-06-15", stock: 195, price: 6.40, status: "In Stock" },
  { id: 7, name: "Ibuprofen 400mg", generic: "Ibuprofen", category: "NSAID", company: "HealthPlus", batch: "B-2024-067", expiry: "2025-05-20", stock: 8, price: 2.90, status: "Low Stock" },
  { id: 8, name: "Atorvastatin 10mg", generic: "Atorvastatin", category: "Statin", company: "CardioMed", batch: "B-2024-078", expiry: "2026-09-30", stock: 340, price: 7.50, status: "In Stock" },
];

const statusVariant = (status: string) => {
  switch (status) {
    case "In Stock": return "default";
    case "Low Stock": return "secondary";
    case "Expired": return "destructive";
    default: return "outline";
  }
};

const Medicines = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = mockMedicines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.generic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Medicines</h1>
          <p className="text-sm text-muted-foreground">Manage your medicine inventory</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Medicine
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">Add New Medicine</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Medicine Name</Label>
                  <Input placeholder="e.g. Paracetamol 500mg" />
                </div>
                <div className="space-y-2">
                  <Label>Generic Name</Label>
                  <Input placeholder="e.g. Acetaminophen" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analgesic">Analgesic</SelectItem>
                      <SelectItem value="antibiotic">Antibiotic</SelectItem>
                      <SelectItem value="antacid">Antacid</SelectItem>
                      <SelectItem value="antidiabetic">Antidiabetic</SelectItem>
                      <SelectItem value="antihistamine">Antihistamine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input placeholder="Company name" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Batch No.</Label>
                  <Input placeholder="B-2024-XXX" />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Stock Qty</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Purchase Price</Label>
                  <Input type="number" step="0.01" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Selling Price</Label>
                  <Input type="number" step="0.01" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Discount %</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
              <Button className="w-full" onClick={() => setDialogOpen(false)}>
                Save Medicine
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or generic..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="analgesic">Analgesic</SelectItem>
                <SelectItem value="antibiotic">Antibiotic</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Company</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Batch</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Expiry</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stock</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((med) => (
                  <tr key={med.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-xs text-muted-foreground">{med.generic}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{med.category}</td>
                    <td className="px-4 py-3">{med.company}</td>
                    <td className="px-4 py-3 font-mono text-xs">{med.batch}</td>
                    <td className="px-4 py-3">{med.expiry}</td>
                    <td className="px-4 py-3">{med.stock}</td>
                    <td className="px-4 py-3 font-medium">${med.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(med.status) as any}>{med.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="rounded p-1.5 hover:bg-muted transition-colors"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></button>
                        <button className="rounded p-1.5 hover:bg-muted transition-colors"><Edit className="h-3.5 w-3.5 text-muted-foreground" /></button>
                        <button className="rounded p-1.5 hover:bg-muted transition-colors"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">Showing {filtered.length} of {mockMedicines.length} medicines</p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Medicines;

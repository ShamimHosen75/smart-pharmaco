import { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarIcon,
  UserCog,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  useEmployeeStore,
  ROLES,
  type Role,
  type Employee,
  type AttendanceStatus,
} from "@/stores/employee-store";
import { useBranchStore } from "@/stores/branch-store";
import { money } from "@/lib/currency";
import { Link } from "react-router-dom";

const roleBadgeVariant = (role: Role) => {
  switch (role) {
    case "Super Admin": return "default";
    case "Branch Admin": return "secondary";
    case "Pharmacist": return "outline";
    default: return "secondary";
  }
};

const attendanceColor = (status: AttendanceStatus) => {
  switch (status) {
    case "present": return "text-accent";
    case "late": return "text-warning";
    case "absent": return "text-destructive";
    case "leave": return "text-info";
  }
};

const attendanceBg = (status: AttendanceStatus) => {
  switch (status) {
    case "present": return "bg-accent/10";
    case "late": return "bg-warning/10";
    case "absent": return "bg-destructive/10";
    case "leave": return "bg-info/10";
  }
};

const Employees = () => {
  const employees = useEmployeeStore((s) => s.employees);
  const attendance = useEmployeeStore((s) => s.attendance);
  const addEmployee = useEmployeeStore((s) => s.addEmployee);
  const updateEmployee = useEmployeeStore((s) => s.updateEmployee);
  const deleteEmployee = useEmployeeStore((s) => s.deleteEmployee);
  const toggleStatus = useEmployeeStore((s) => s.toggleStatus);
  const markAttendance = useEmployeeStore((s) => s.markAttendance);

  const branchList = useBranchStore((s) => s.branches);
  const branchOptions = branchList.filter((b) => b.status === "active").map((b) => b.name);
  const defaultBranch = branchOptions[0] ?? "Main Branch";

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<Date>(new Date());

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<Role>("Sales Staff");
  const [formBranch, setFormBranch] = useState(defaultBranch);
  const [formSalary, setFormSalary] = useState("");

  const resetForm = () => {
    setFormName(""); setFormEmail(""); setFormPhone("");
    setFormRole("Sales Staff"); setFormBranch(defaultBranch); setFormSalary("");
    setEditingEmployee(null);
  };

  const openAdd = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormName(emp.name); setFormEmail(emp.email); setFormPhone(emp.phone);
    setFormRole(emp.role); setFormBranch(emp.branch); setFormSalary(String(emp.salary));
    setDialogOpen(true);
  };

  const saveEmployee = () => {
    if (!formName.trim() || !formEmail.trim()) return;
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, {
        name: formName, email: formEmail, phone: formPhone,
        role: formRole, branch: formBranch, salary: Number(formSalary) || 0,
      });
    } else {
      addEmployee({
        name: formName, email: formEmail, phone: formPhone,
        role: formRole, branch: formBranch, salary: Number(formSalary) || 0,
      });
    }
    setDialogOpen(false);
    resetForm();
    toast({ title: editingEmployee ? "Employee updated" : "Employee added" });
  };

  const attendanceDateStr = format(attendanceDate, "yyyy-MM-dd");
  const dayAttendance = attendance.filter((a) => a.date === attendanceDateStr);

  const filtered = employees.filter(
    (e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const activeCount = employees.filter((e) => e.status === "active").length;
  const todayPresent = dayAttendance.filter((a) => a.status === "present" || a.status === "late").length;
  const todayAbsent = dayAttendance.filter((a) => a.status === "absent").length;
  const totalSalary = employees.filter((e) => e.status === "active").reduce((s, e) => s + e.salary, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Employees</h1>
          <p className="text-sm text-muted-foreground">Local payroll and attendance records. Staff sign-in and access are managed separately.</p>
        </div>
        <div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link to="/settings?section=staff">Staff account access</Link></Button><Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Add payroll record</Button></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Staff", value: activeCount, icon: UserCog, color: "text-primary", bg: "bg-primary/10" },
          { label: "Present Today", value: todayPresent, icon: CheckCircle2, color: "text-accent", bg: "bg-accent/10" },
          { label: "Absent Today", value: todayAbsent, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Monthly Payroll", value: money(totalSalary, 0), icon: Clock, color: "text-warning", bg: "bg-warning/10" },
        ].map((s) => (
          <Card key={s.label} className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-heading font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="roster" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roster">Employee Roster</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        {/* === ROSTER TAB === */}
        <TabsContent value="roster" className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by name or role..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Employee</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Branch</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Salary</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((emp) => (
                      <tr key={emp.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                              {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium">{emp.name}</p>
                              <p className="text-xs text-muted-foreground">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={roleBadgeVariant(emp.role) as any}>{emp.role}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{emp.branch}</td>
                        <td className="px-4 py-3">{emp.phone}</td>
                        <td className="px-4 py-3 font-medium">{money(emp.salary, 0)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleStatus(emp.id)}>
                            <Badge variant={emp.status === "active" ? "default" : "secondary"} className="cursor-pointer">
                              {emp.status}
                            </Badge>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(emp)} className="rounded p-1.5 hover:bg-muted transition-colors">
                              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => deleteEmployee(emp.id)} className="rounded p-1.5 hover:bg-muted transition-colors">
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === ATTENDANCE TAB === */}
        <TabsContent value="attendance" className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[220px] justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(attendanceDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={attendanceDate}
                    onSelect={(d) => d && setAttendanceDate(d)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent" />Present: {dayAttendance.filter((a) => a.status === "present").length}</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" />Late: {dayAttendance.filter((a) => a.status === "late").length}</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" />Absent: {dayAttendance.filter((a) => a.status === "absent").length}</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-info" />Leave: {dayAttendance.filter((a) => a.status === "leave").length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Employee</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Check In</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Check Out</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Mark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.filter((e) => e.status === "active").map((emp) => {
                      const record = dayAttendance.find((a) => a.employeeId === emp.id);
                      return (
                        <tr key={emp.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                              <span className="font-medium">{emp.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{emp.role}</td>
                          <td className="px-4 py-3 font-mono text-xs">{record?.checkIn || "—"}</td>
                          <td className="px-4 py-3 font-mono text-xs">{record?.checkOut || "—"}</td>
                          <td className="px-4 py-3">
                            {record ? (
                              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${attendanceBg(record.status)} ${attendanceColor(record.status)}`}>
                                {record.status === "present" && <CheckCircle2 className="h-3 w-3" />}
                                {record.status === "late" && <Clock className="h-3 w-3" />}
                                {record.status === "absent" && <XCircle className="h-3 w-3" />}
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">Not marked</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {(["present", "late", "absent", "leave"] as AttendanceStatus[]).map((s) => (
                                <button
                                  key={s}
                                  onClick={() => markAttendance(emp.id, attendanceDateStr, s)}
                                  className={cn(
                                    "rounded px-2 py-1 text-[10px] font-medium border transition-colors",
                                    record?.status === s
                                      ? `${attendanceBg(s)} ${attendanceColor(s)} border-current`
                                      : "border-border text-muted-foreground hover:bg-muted"
                                  )}
                                >
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="e.g. John Smith" value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="rakib@medicore.com.bd" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+880 1711 000000" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Payroll role (not account access)</Label>
                <Select value={formRole} onValueChange={(v) => setFormRole(v as Role)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Branch</Label>
                <Select value={formBranch} onValueChange={setFormBranch}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {branchOptions.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Monthly Salary (৳)</Label>
                <Input type="number" placeholder="0" value={formSalary} onChange={(e) => setFormSalary(e.target.value)} />
              </div>
            </div>
            <Button className="w-full" onClick={saveEmployee} disabled={!formName.trim() || !formEmail.trim()}>
              {editingEmployee ? "Update Employee" : "Add Employee"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;

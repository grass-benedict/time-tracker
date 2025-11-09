import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Users, Calendar, Clock, TrendingUp, Mail, Phone } from 'lucide-react';

const initialStats = {
  totalEmployees: 0,
  activeToday: 231,
  onVacation: 16,
  averageFlexBalance: 5.2,
  pendingApprovals: 42,
  sickLeaveToday: 8,
};

interface EmployeeMinimal {
  id: number;
  name: string;
  surname?: string;
  department?: string | null;
  flexAccount?: number | null;
}

function generateMockEmail(emp: EmployeeMinimal) {
  const base = `${emp.name || 'user'}${emp.surname ? '.' + emp.surname : ''}`
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '');
  return `${base}@example.com`;
}

function generateMockPhone(emp: EmployeeMinimal) {
  // deterministic mock phone based on id
  const num = 100000 + (emp.id % 900000);
  return `+1 555 ${String(num).slice(0,3)} ${String(num).slice(3)}`;
}

export function SystemStatistics() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [systemStats, setSystemStats] = useState(initialStats);
  const [employees, setEmployees] = useState<EmployeeMinimal[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employee');
        if (!res.ok) {
          throw new Error(`Failed to fetch employee data: ${res.status}`);
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        // Map into EmployeeMinimal
        const mapped: EmployeeMinimal[] = list.map((e: any) => ({
          id: e.id,
          name: e.name ?? e.username ?? `${e.name ?? ''} ${e.surname ?? ''}`.trim(),
          surname: e.surname,
          department: e.department ?? 'Unassigned',
          flexAccount: typeof e.flexAccount === 'number' ? e.flexAccount : (typeof e.flexBalance === 'number' ? e.flexBalance : (e.flexAccount ? parseFloat(String(e.flexAccount)) : null))
        }));
        setEmployees(mapped);
        setSystemStats((s) => ({ ...s, totalEmployees: mapped.length }));

        // compute global average flex balance (only where value is numeric)
        const flexValues = mapped.map(m => m.flexAccount).filter((v): v is number => typeof v === 'number' && !isNaN(v));
        if (flexValues.length > 0) {
          const sum = flexValues.reduce((a, b) => a + b, 0);
          const avg = sum / flexValues.length;
          setSystemStats((s) => ({ ...s, averageFlexBalance: Number(avg.toFixed(1)) }));
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching employees', err);
      }
    };

    fetchEmployees();
  }, []);

  const handleDepartmentClick = (departmentName: string) => {
    setSelectedDepartment(departmentName);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-6 rounded-lg bg-accent border border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl text-foreground">{systemStats.totalEmployees}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Employees</div>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl text-blue-700 dark:text-blue-400">{systemStats.activeToday}</div>
              <div className="text-sm text-muted-foreground mt-1">Active Today</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl text-green-700 dark:text-green-400">{systemStats.onVacation}</div>
              <div className="text-sm text-muted-foreground mt-1">On Vacation</div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl text-blue-700 dark:text-blue-400">+{systemStats.averageFlexBalance}h</div>
              <div className="text-sm text-muted-foreground mt-1">Avg. Flex Balance</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl text-amber-700 dark:text-amber-400">{systemStats.pendingApprovals}</div>
              <div className="text-sm text-muted-foreground mt-1">Pending Approvals</div>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl text-red-700 dark:text-red-400">{systemStats.sickLeaveToday}</div>
              <div className="text-sm text-muted-foreground mt-1">Sick Leave Today</div>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Department Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {(() => {
              // Compute departments from fetched employees and per-department avg flex
              const stats: Record<string, { count: number; flexSum: number; flexCount: number }> = {};
              for (const e of employees) {
                const d = e.department ?? 'Unassigned';
                if (!stats[d]) stats[d] = { count: 0, flexSum: 0, flexCount: 0 };
                stats[d].count += 1;
                if (typeof e.flexAccount === 'number' && !isNaN(e.flexAccount)) {
                  stats[d].flexSum += e.flexAccount;
                  stats[d].flexCount += 1;
                }
              }
              const depts = Object.keys(stats).sort();
              if (depts.length === 0) {
                return <div className="text-sm text-muted-foreground">No departments found</div>;
              }

              return depts.map((name) => {
                const s = stats[name]!;
                const avg = s.flexCount > 0 ? Number((s.flexSum / s.flexCount).toFixed(1)) : null;
                return (
                  <div
                    key={name}
                    className="flex justify-between items-center py-3 px-4 rounded-lg bg-muted/50 border border-border cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => handleDepartmentClick(name)}
                  >
                    <div>
                      <div>{name}</div>
                      <div className="text-sm text-muted-foreground">{s.count} employees</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Avg. Flex</div>
                      <div className="text-green-700 dark:text-green-400">{avg === null ? '-' : `+${avg}h`}</div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedDepartment} - Employees</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {selectedDepartment && employees.filter(e => (e.department ?? 'Unassigned') === selectedDepartment).map((emp) => (
                <div key={emp.id} className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium">{emp.name}{emp.surname ? ` ${emp.surname}` : ''}</div>
                      <div className="text-sm text-muted-foreground">ID: {emp.id} • {emp.department ?? 'Unassigned'}</div>
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-400">
                      {typeof emp.flexAccount === 'number' && !isNaN(emp.flexAccount) ? `+${emp.flexAccount.toFixed(1)}h` : '-'}
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{generateMockEmail(emp)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{generateMockPhone(emp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

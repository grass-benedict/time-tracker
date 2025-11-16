import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronRight, Users, User, TrendingUp, TrendingDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface Employee {
  id: number;
  name?: string;
  surname?: string;
  email?: string;
  department?: string | null;
  flexAccount?: number | null;
  vacationDays?: number | null;
  status?: 'active' | 'vacation' | 'sick' | string;
  managerId?: number | null;
  role?: string | null;
}

interface Supervisor {
  id: number;
  name: string;
  email?: string;
  department?: string | null;
  employeeCount: number;
  employees: Employee[];
}

// state will hold supervisors derived from API
const emptySupervisors: Supervisor[] = [];

export function HierarchyView() {
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [supervisors, setSupervisors] = useState<Supervisor[]>(emptySupervisors);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchAndBuild = async () => {
      try {
        const res = await fetch('/api/employee');
        if (!res.ok) return;
        const data = await res.json();
        const employees: Employee[] = Array.isArray(data) ? data : [];

        // managers are employees with role === 'manager'
  const managers = employees.filter(e => e.role === 'manager');

        const supList: Supervisor[] = managers.map(m => {
          const reports = employees.filter(emp => emp.managerId === m.id);
          return {
            id: m.id,
            name: `${m.name ?? m.surname ?? m.email ?? 'Manager'}`,
            email: m.email ?? '',
            department: m.department ?? 'Unassigned',
            employeeCount: reports.length,
            employees: reports
          };
        });

        if (!mounted) return;
        setSupervisors(supList);
      } catch (err) {
        console.error('Failed loading hierarchy data', err);
      }
    };

    fetchAndBuild();
    return () => { mounted = false; };
  }, []);

  const handleSupervisorClick = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    setIsDialogOpen(true);
  };

  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, string> = {
      'Engineering': 'from-blue-500 to-blue-600',
      'Sales': 'from-blue-500 to-blue-600',
      'Marketing': 'from-blue-500 to-blue-600',
      'HR': 'from-blue-500 to-blue-600',
      'Finance': 'from-blue-500 to-blue-600',
    };
    return colors[dept] || 'from-blue-500 to-blue-600';
  };

  const deptColor = (dept?: string | null) => getDepartmentColor((dept ?? '') as string);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Organization Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(() => {
              const visible = showAll ? supervisors : supervisors.slice(0, 6);
              return visible.map((supervisor) => (
              <button
                key={supervisor.id}
                onClick={() => handleSupervisorClick(supervisor)}
                className="group relative overflow-hidden rounded-xl bg-card border-2 border-border hover:border-primary transition-all hover:shadow-lg p-6 text-left"
              >
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-opacity"></div>
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${deptColor(supervisor.department)} flex items-center justify-center text-white`}>
                          <User className="h-6 w-6" />
                        </div>
                      </div>
                      <h4 className="mb-1">{supervisor.name}</h4>
                      <p className="text-sm text-muted-foreground">{supervisor.email}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <Badge variant="default">
                        {supervisor.department}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{supervisor.employeeCount} employees</span>
                    </div>
                  </div>
                </div>
              </button>
              ));
            })()}
          </div>
          {supervisors.length > 6 && (
            <div className="mt-4 text-center">
              <Button variant="ghost" onClick={() => setShowAll(s => !s)}>
                {showAll ? `Show less` : `Show all (${supervisors.length})`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${deptColor(selectedSupervisor?.department)} flex items-center justify-center text-white`}>
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div>{selectedSupervisor?.name}</div>
                <div className="text-sm text-muted-foreground">{selectedSupervisor?.department} Department</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {selectedSupervisor?.employees.map((employee) => (
              <div
                key={employee.id}
                className="p-5 rounded-lg border bg-muted/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {(() => {
                        const display = employee.name ?? employee.email ?? '—';
                        const initials = display.split(' ').map(n => n[0]).join('').slice(0, 3);
                        return (
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${deptColor(employee.department)} flex items-center justify-center text-white text-sm`}>
                            {initials}
                          </div>
                        );
                      })()}
                      <div>
                        <h5>{employee.name ?? employee.email ?? 'Unknown'}</h5>
                        <p className="text-sm text-muted-foreground">{employee.email ?? '—'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        {(employee.flexAccount ?? 0) >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <div className="text-xs text-muted-foreground">Flex Balance</div>
                          <div className={(employee.flexAccount ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {(employee.flexAccount ?? 0) >= 0 ? '+' : ''}{(employee.flexAccount ?? 0).toFixed(1)}h
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground">Vacation Days</div>
                        <div className="text-blue-700 dark:text-blue-400">{employee.vacationDays} days</div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground">Status</div>
                        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                          {employee.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

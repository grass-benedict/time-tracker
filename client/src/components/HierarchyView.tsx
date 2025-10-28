import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronRight, Users, User, TrendingUp, TrendingDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  flexBalance: number;
  vacationDays: number;
  status: 'active' | 'vacation' | 'sick';
}

interface Supervisor {
  id: string;
  name: string;
  email: string;
  department: string;
  employeeCount: number;
  employees: Employee[];
}

const mockSupervisors: Supervisor[] = [
  {
    id: 'SUP-001',
    name: 'Harald Schmidt',
    email: 'harald.schmidt@stc.com',
    department: 'Engineering',
    employeeCount: 12,
    employees: [
      { id: 'EMP-001', name: 'Sophie Meier', email: 'sophie.meier@stc.com', department: 'Engineering', flexBalance: 12.5, vacationDays: 15, status: 'active' },
      { id: 'EMP-003', name: 'Michael Weber', email: 'michael.weber@stc.com', department: 'Engineering', flexBalance: 16.0, vacationDays: 10, status: 'active' },
      { id: 'EMP-006', name: 'Anna Schmidt', email: 'anna.schmidt@stc.com', department: 'Engineering', flexBalance: 8.5, vacationDays: 18, status: 'active' },
      { id: 'EMP-008', name: 'Thomas Klein', email: 'thomas.klein@stc.com', department: 'Engineering', flexBalance: -2.5, vacationDays: 12, status: 'vacation' },
      { id: 'EMP-011', name: 'Julia Wagner', email: 'julia.wagner@stc.com', department: 'Engineering', flexBalance: 5.0, vacationDays: 20, status: 'active' },
    ],
  },
  {
    id: 'SUP-002',
    name: 'Maria Weber',
    email: 'maria.weber@stc.com',
    department: 'Sales',
    employeeCount: 8,
    employees: [
      { id: 'EMP-002', name: 'Lisa Müller', email: 'lisa.muller@stc.com', department: 'Sales', flexBalance: 4.0, vacationDays: 16, status: 'active' },
      { id: 'EMP-007', name: 'Robert Fischer', email: 'robert.fischer@stc.com', department: 'Sales', flexBalance: 10.5, vacationDays: 14, status: 'active' },
      { id: 'EMP-009', name: 'Sarah Becker', email: 'sarah.becker@stc.com', department: 'Sales', flexBalance: -1.0, vacationDays: 22, status: 'sick' },
    ],
  },
  {
    id: 'SUP-003',
    name: 'Klaus Müller',
    email: 'klaus.muller@stc.com',
    department: 'Marketing',
    employeeCount: 6,
    employees: [
      { id: 'EMP-004', name: 'Emma Schneider', email: 'emma.schneider@stc.com', department: 'Marketing', flexBalance: 6.5, vacationDays: 17, status: 'active' },
      { id: 'EMP-010', name: 'Max Hoffmann', email: 'max.hoffmann@stc.com', department: 'Marketing', flexBalance: 3.0, vacationDays: 19, status: 'active' },
    ],
  },
];

export function HierarchyView() {
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
            {mockSupervisors.map((supervisor) => (
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
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getDepartmentColor(supervisor.department)} flex items-center justify-center text-white`}>
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
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedSupervisor ? getDepartmentColor(selectedSupervisor.department) : 'from-gray-400 to-gray-500'} flex items-center justify-center text-white`}>
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
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getDepartmentColor(employee.department)} flex items-center justify-center text-white text-sm`}>
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h5>{employee.name}</h5>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        {employee.flexBalance >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <div className="text-xs text-muted-foreground">Flex Balance</div>
                          <div className={employee.flexBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {employee.flexBalance >= 0 ? '+' : ''}{employee.flexBalance}h
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

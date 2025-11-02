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

const departmentStats = [
  { name: 'Engineering', employees: 85, avgFlex: 7.5 },
  { name: 'Sales', employees: 62, avgFlex: 3.2 },
  { name: 'Marketing', employees: 34, avgFlex: 4.8 },
  { name: 'HR', employees: 18, avgFlex: 2.1 },
  { name: 'Finance', employees: 28, avgFlex: 6.3 },
  { name: 'Operations', employees: 20, avgFlex: 5.9 },
];

const departmentEmployees: Record<string, Array<{ name: string; position: string; email: string; phone: string; flexBalance: string }>> = {
  'Engineering': [
    { name: 'Thomas Müller', position: 'Senior Developer', email: 't.mueller@stc.com', phone: '+49 123 4567890', flexBalance: '+8.5h' },
    { name: 'Sarah Schmidt', position: 'Frontend Developer', email: 's.schmidt@stc.com', phone: '+49 123 4567891', flexBalance: '+6.2h' },
    { name: 'Michael Weber', position: 'Backend Developer', email: 'm.weber@stc.com', phone: '+49 123 4567892', flexBalance: '+9.1h' },
    { name: 'Julia Fischer', position: 'DevOps Engineer', email: 'j.fischer@stc.com', phone: '+49 123 4567893', flexBalance: '+7.3h' },
    { name: 'Andreas Hoffmann', position: 'Full Stack Developer', email: 'a.hoffmann@stc.com', phone: '+49 123 4567894', flexBalance: '+5.8h' },
    { name: 'Lisa Wagner', position: 'QA Engineer', email: 'l.wagner@stc.com', phone: '+49 123 4567895', flexBalance: '+6.9h' },
    { name: 'Martin Becker', position: 'System Architect', email: 'm.becker@stc.com', phone: '+49 123 4567896', flexBalance: '+10.2h' },
    { name: 'Anna Schulz', position: 'Junior Developer', email: 'a.schulz@stc.com', phone: '+49 123 4567897', flexBalance: '+4.5h' },
  ],
  'Sales': [
    { name: 'Peter Klein', position: 'Sales Manager', email: 'p.klein@stc.com', phone: '+49 123 4567900', flexBalance: '+3.5h' },
    { name: 'Claudia Richter', position: 'Account Executive', email: 'c.richter@stc.com', phone: '+49 123 4567901', flexBalance: '+2.8h' },
    { name: 'Stefan Meyer', position: 'Sales Representative', email: 's.meyer@stc.com', phone: '+49 123 4567902', flexBalance: '+4.1h' },
    { name: 'Monika Braun', position: 'Business Development', email: 'm.braun@stc.com', phone: '+49 123 4567903', flexBalance: '+3.9h' },
    { name: 'Frank Zimmermann', position: 'Regional Sales Lead', email: 'f.zimmermann@stc.com', phone: '+49 123 4567904', flexBalance: '+2.5h' },
  ],
  'Marketing': [
    { name: 'Sophie Krause', position: 'Marketing Director', email: 's.krause@stc.com', phone: '+49 123 4567910', flexBalance: '+5.2h' },
    { name: 'Daniel Hartmann', position: 'Content Manager', email: 'd.hartmann@stc.com', phone: '+49 123 4567911', flexBalance: '+4.6h' },
    { name: 'Kathrin Schmitt', position: 'Social Media Manager', email: 'k.schmitt@stc.com', phone: '+49 123 4567912', flexBalance: '+5.8h' },
    { name: 'Oliver Werner', position: 'SEO Specialist', email: 'o.werner@stc.com', phone: '+49 123 4567913', flexBalance: '+3.9h' },
  ],
  'HR': [
    { name: 'Julia Lang', position: 'HR Director', email: 'j.lang@stc.com', phone: '+49 123 4567920', flexBalance: '+2.5h' },
    { name: 'Robert Schwarz', position: 'Recruiter', email: 'r.schwarz@stc.com', phone: '+49 123 4567921', flexBalance: '+1.8h' },
    { name: 'Christina Krüger', position: 'HR Business Partner', email: 'c.krueger@stc.com', phone: '+49 123 4567922', flexBalance: '+2.3h' },
  ],
  'Finance': [
    { name: 'Wolfgang Neumann', position: 'Finance Director', email: 'w.neumann@stc.com', phone: '+49 123 4567930', flexBalance: '+6.8h' },
    { name: 'Sabine Koch', position: 'Controller', email: 's.koch@stc.com', phone: '+49 123 4567931', flexBalance: '+7.1h' },
    { name: 'Marcus Bauer', position: 'Accountant', email: 'm.bauer@stc.com', phone: '+49 123 4567932', flexBalance: '+5.9h' },
    { name: 'Andrea Berger', position: 'Financial Analyst', email: 'a.berger@stc.com', phone: '+49 123 4567933', flexBalance: '+6.5h' },
  ],
  'Operations': [
    { name: 'Harald Vogel', position: 'Operations Manager', email: 'h.vogel@stc.com', phone: '+49 123 4567940', flexBalance: '+6.2h' },
    { name: 'Petra Schneider', position: 'Logistics Coordinator', email: 'p.schneider@stc.com', phone: '+49 123 4567941', flexBalance: '+5.5h' },
    { name: 'Jürgen Wolf', position: 'Operations Specialist', email: 'j.wolf@stc.com', phone: '+49 123 4567942', flexBalance: '+6.1h' },
  ],
};

export function SystemStatistics() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [systemStats, setSystemStats] = useState(initialStats);

  useEffect(() => {
    const fetchEmployeeCount = async () => {
      try {
        const res = await fetch('/api/employee');
        if (!res.ok) {
          throw new Error(`Failed to fetch employee data: ${res.status}`);
        }
        const employees = await res.json();
        const count = Array.isArray(employees) ? employees.length : (employees?.count ?? 0);
        setSystemStats((s) => ({ ...s, totalEmployees: count }));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching employee count', err);
      }
    };

    fetchEmployeeCount();
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
            {departmentStats.map((dept, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center py-3 px-4 rounded-lg bg-muted/50 border border-border cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleDepartmentClick(dept.name)}
              >
                <div>
                  <div>{dept.name}</div>
                  <div className="text-sm text-muted-foreground">{dept.employees} employees</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Avg. Flex</div>
                  <div className="text-green-700 dark:text-green-400">+{dept.avgFlex}h</div>
                </div>
              </div>
            ))}
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
              {selectedDepartment && departmentEmployees[selectedDepartment]?.map((employee, index) => (
                <div key={index} className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">{employee.position}</div>
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-400">
                      {employee.flexBalance}
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{employee.phone}</span>
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

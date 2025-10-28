import { SystemStatistics } from './SystemStatistics';
import { MasterDataForm } from './MasterDataForm';
import { SickLeaveForm } from './SickLeaveForm';
import { HierarchyView } from './HierarchyView';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';

const allEmployees = [
  { id: 'EMP-001', name: 'Sophie Meier', department: 'Engineering', supervisor: 'Harald Schmidt', status: 'active', flexBalance: 12.5 },
  { id: 'EMP-002', name: 'Anna Schmidt', department: 'Sales', supervisor: 'Maria Weber', status: 'active', flexBalance: 8.5 },
  { id: 'EMP-003', name: 'Michael Weber', department: 'Engineering', supervisor: 'Harald Schmidt', status: 'active', flexBalance: 16.0 },
  { id: 'EMP-004', name: 'Lisa Müller', department: 'Marketing', supervisor: 'Klaus Müller', status: 'active', flexBalance: 4.0 },
  { id: 'EMP-005', name: 'Thomas Klein', department: 'Sales', supervisor: 'Maria Weber', status: 'vacation', flexBalance: 2.5 },
];

export function HRDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState(allEmployees);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<typeof allEmployees[0] | null>(null);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (employee: typeof allEmployees[0]) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (employeeToDelete) {
      setEmployees(employees.filter(emp => emp.id !== employeeToDelete.id));
      toast.success(`Employee ${employeeToDelete.name} has been deleted successfully.`);
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl mb-1">Welcome back, Julia 👋</h1>
          <p className="text-muted-foreground">HR Dashboard - Manage employees and organizational data</p>
        </div>
      </div>

      <SystemStatistics />

      {/* New Hierarchy View */}
      <HierarchyView />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MasterDataForm />
        <SickLeaveForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Employee Master Data
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>Flex Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.supervisor}</TableCell>
                  <TableCell className={employee.flexBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {employee.flexBalance >= 0 ? '+' : ''}{employee.flexBalance}h
                  </TableCell>
                  <TableCell>
                    <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(employee)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{employeeToDelete?.name}</span> ({employeeToDelete?.id})?
              <br /><br />
              This action cannot be undone. This will permanently remove the employee profile from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Employee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

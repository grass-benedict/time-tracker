import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Trash2 } from 'lucide-react';
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
import { toast } from 'sonner';

interface EmployeeAPI {
  id: number;
  name: string;
  surname?: string;
  username?: string;
  vacationDays?: number;
  flexAccount?: number;
  role?: string;
  department?: string;
  managerId?: number | null;
}

type EmployeeRow = {
  id: string;
  name: string;
  department: string;
  supervisor: string;
  flexBalance: number;
  status: string;
};

export function EmployeeMasterTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeRow | null>(null);
  const [sortBy, setSortBy] = useState<keyof EmployeeRow | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/employee');
        if (!res.ok) throw new Error(`Failed to fetch employees: ${res.status}`);
        const data: EmployeeAPI[] = await res.json();

        const idToName = new Map<number, string>();
        data.forEach((e) => idToName.set(e.id, `${e.name}${e.surname ? ' ' + e.surname : ''}`));

        const rows: EmployeeRow[] = data.map((e) => ({
          id: String(e.id),
          name: `${e.name}${e.surname ? ' ' + e.surname : ''}`,
          department: e.department ?? '—',
          supervisor: e.managerId ? (idToName.get(e.managerId) ?? '—') : '—',
          flexBalance: Number(e.flexAccount ?? 0),
          status: e.role ?? 'active',
        }));

        if (mounted) setEmployees(rows);
      } catch (err) {
        console.error(err);
        toast.error('Could not load employee list');
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.id.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q) ||
      emp.supervisor.toLowerCase().includes(q)
    );
  });

  const sortedEmployees = React.useMemo(() => {
    if (!sortBy) return filteredEmployees;
    const copy = [...filteredEmployees];
    copy.sort((a, b) => {
      const va = (a as any)[sortBy];
      const vb = (b as any)[sortBy];
      // numeric compare for id and flexBalance
      if (sortBy === 'flexBalance' || sortBy === 'id') {
        const na = Number(va ?? 0);
        const nb = Number(vb ?? 0);
        return sortDir === 'asc' ? na - nb : nb - na;
      }
      // string compare
      const sa = String(va ?? '').toLowerCase();
      const sb = String(vb ?? '').toLowerCase();
      if (sa < sb) return sortDir === 'asc' ? -1 : 1;
      if (sa > sb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filteredEmployees, sortBy, sortDir]);

  const handleSort = (key: keyof EmployeeRow) => {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const handleDeleteClick = (employee: EmployeeRow) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (employeeToDelete) {
      setEmployees((prev) => prev.filter((emp) => emp.id !== employeeToDelete.id));
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
    <>
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
          {/* Use table-fixed so column widths are determined by the header; make tbody block for scrolling */}
          <div className = "overflow-x-auto overflow-y-auto max-h-[260px] rounded-lg border">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[96px]">
                  <button className="w-full text-left flex items-center justify-start gap-2" onClick={() => handleSort('id')}>
                    ID
                    {sortBy === 'id' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : null}
                  </button>
                </TableHead>
                <TableHead className="w-[220px]">
                  <button className="w-full text-left flex items-center justify-start gap-2" onClick={() => handleSort('name')}>
                    Name
                    {sortBy === 'name' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : null}
                  </button>
                </TableHead>
                <TableHead className="w-[160px]">
                  <button className="w-full text-left flex items-center justify-start gap-2" onClick={() => handleSort('department')}>
                    Department
                    {sortBy === 'department' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : null}
                  </button>
                </TableHead>
                <TableHead className="w-[160px]">
                  <button className="w-full text-left flex items-center justify-start gap-2" onClick={() => handleSort('supervisor')}>
                    Supervisor
                    {sortBy === 'supervisor' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : null}
                  </button>
                </TableHead>
                <TableHead className="w-[120px]">
                  <button className="w-full text-left flex items-center justify-start gap-2" onClick={() => handleSort('flexBalance')}>
                    Flex Balance
                    {sortBy === 'flexBalance' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : null}
                  </button>
                </TableHead>
                <TableHead className="w-[100px]">
                  <button className="w-full text-left flex items-center justify-start gap-2" onClick={() => handleSort('status')}>
                    Status
                    {sortBy === 'status' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : null}
                  </button>
                </TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="block max-h-[240px] overflow-auto">
              {sortedEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="w-[96px]">{employee.id}</TableCell>
                  <TableCell className="w-[220px]">{employee.name}</TableCell>
                  <TableCell className="w-[160px]">{employee.department}</TableCell>
                  <TableCell className="w-[160px]">{employee.supervisor}</TableCell>
                  <TableCell className={`w-[120px] ${employee.flexBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {employee.flexBalance >= 0 ? '+' : ''}{employee.flexBalance}h
                  </TableCell>
                  <TableCell className="w-[100px]">
                    <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[80px] text-right">
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
          </div>
        </CardContent>
      </Card>

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
    </>
  );
}

export default EmployeeMasterTable;

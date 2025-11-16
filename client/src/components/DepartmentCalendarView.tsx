import { useEffect, useState } from 'react';
import { SharedVacationCalendar } from './SharedVacationCalendar';
import type { VacationEntry } from './SharedVacationCalendar';

interface Employee {
  id: number;
  name: string;
  surname: string;
  department: string;
}

interface LeaveRequest {
  id: number;
  employeeId: number;
  type: string;
  startDate: string;
  endDate: string;
  approvedStatus: string;
}

interface DepartmentCalendarViewProps {
  employeeId?: number;
}

export function DepartmentCalendarView({ employeeId }: DepartmentCalendarViewProps) {
  const [vacationData, setVacationData] = useState<VacationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentName, setDepartmentName] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    const fetchDepartmentVacations = async () => {
      if (!employeeId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Fetch current employee to get their department
        const empRes = await fetch(`/api/employee/${employeeId}`);
        if (!empRes.ok) throw new Error(`Failed to fetch employee: ${empRes.status}`);
        const currentEmployee = await empRes.json();
        const department = currentEmployee.department;

        if (!department) {
          if (mounted) {
            setVacationData([]);
            setDepartmentName('');
            setLoading(false);
          }
          return;
        }

        if (mounted) setDepartmentName(department);

        // 2. Fetch all employees to filter by department
        const allEmpRes = await fetch('/api/employee');
        if (!allEmpRes.ok) throw new Error(`Failed to fetch all employees: ${allEmpRes.status}`);
        const allEmployees: Employee[] = await allEmpRes.json();

        // Filter employees in the same department
        const departmentEmployees = allEmployees.filter(emp => emp.department === department);
        const departmentEmployeeMap = new Map(
          departmentEmployees.map(emp => [emp.id, emp])
        );

        // 3. Fetch all leave requests
        const leaveRes = await fetch('/api/leaveRequests');
        if (!leaveRes.ok) throw new Error(`Failed to fetch leave requests: ${leaveRes.status}`);
        const allLeaveRequests: LeaveRequest[] = await leaveRes.json();

        // 4. Filter leave requests for department employees
        const departmentLeaves = allLeaveRequests.filter(lr => 
          departmentEmployeeMap.has(lr.employeeId)
        );

        // 5. Transform leave requests into VacationEntry format
        // Each leave request spans from startDate to endDate, create an entry for each day
        const vacationEntries: VacationEntry[] = [];
        
        departmentLeaves.forEach(leave => {
          const employee = departmentEmployeeMap.get(leave.employeeId);
          if (!employee) return;

          const startDate = new Date(leave.startDate);
          const endDate = new Date(leave.endDate);
          const currentDate = new Date(startDate);

          // Generate an entry for each day in the leave period
          while (currentDate <= endDate) {
            const isoString = currentDate.toISOString();
            const dateStr = isoString.split('T')[0];
            if (!dateStr) continue;
            
            vacationEntries.push({
              employeeId: String(employee.id),
              employeeName: `${employee.name} ${employee.surname}`,
              date: dateStr,
              status: leave.approvedStatus === 'approved' ? 'approved' : 'pending',
              department: employee.department,
              type: leave.type as 'vacation' | 'sick'
            });
            currentDate.setDate(currentDate.getDate() + 1);
          }
        });

        if (mounted) {
          setVacationData(vacationEntries);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch department vacations:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      }
    };

    fetchDepartmentVacations();
    return () => { mounted = false; };
  }, [employeeId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl mb-1">Department Calendar</h1>
            <p className="text-muted-foreground">Loading vacation schedules...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl mb-1">Department Calendar</h1>
            <p className="text-red-600">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  const title = departmentName 
    ? `${departmentName} Department Vacation Calendar`
    : 'Department Vacation Calendar';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl mb-1">Department Calendar</h1>
          <p className="text-muted-foreground">
            View vacation schedules for all {departmentName || 'department'} employees
          </p>
        </div>
      </div>

      <SharedVacationCalendar 
        title={title}
        vacationData={vacationData}
        description="Overview of all approved and pending vacation requests in your department"
      />
    </div>
  );
}

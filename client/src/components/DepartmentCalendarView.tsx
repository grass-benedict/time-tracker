import { SharedVacationCalendar, VacationEntry } from './SharedVacationCalendar';

// Mock data: All employees in Engineering department
// Demonstrates aggregation when more than 2 employees have vacation on the same day
const departmentVacationData: VacationEntry[] = [
  // November 2025 - Aggregation test on Nov 10 (3 employees)
  { employeeId: 'EMP-001', employeeName: 'Sophie Meier', date: '2025-11-10', status: 'approved', department: 'Engineering' },
  { employeeId: 'EMP-001', employeeName: 'Sophie Meier', date: '2025-11-11', status: 'approved', department: 'Engineering' },
  { employeeId: 'EMP-001', employeeName: 'Sophie Meier', date: '2025-11-12', status: 'approved', department: 'Engineering' },
  { employeeId: 'EMP-003', employeeName: 'Michael Weber', date: '2025-11-10', status: 'approved', department: 'Engineering' },
  { employeeId: 'EMP-003', employeeName: 'Michael Weber', date: '2025-11-11', status: 'approved', department: 'Engineering' },
  { employeeId: 'EMP-011', employeeName: 'Markus Wagner', date: '2025-11-10', status: 'pending', department: 'Engineering' },
  { employeeId: 'EMP-006', employeeName: 'Sarah Fischer', date: '2025-11-15', status: 'pending', department: 'Engineering' },
  { employeeId: 'EMP-006', employeeName: 'Sarah Fischer', date: '2025-11-16', status: 'pending', department: 'Engineering' },
  { employeeId: 'EMP-007', employeeName: 'Thomas Berg', date: '2025-11-20', status: 'approved', department: 'Engineering' },
  { employeeId: 'EMP-007', employeeName: 'Thomas Berg', date: '2025-11-21', status: 'approved', department: 'Engineering' },
  
  // Aggregation test on Nov 25 (4 employees - should show 2 + "...and 2 more")
  { employeeId: 'EMP-008', employeeName: 'Julia Schneider', date: '2025-11-25', status: 'pending', department: 'Engineering' },
  { employeeId: 'EMP-009', employeeName: 'Martin Hoffmann', date: '2025-11-25', status: 'approved', department: 'Engineering' },
  { employeeId: 'EMP-010', employeeName: 'Laura Becker', date: '2025-11-25', status: 'approved', department: 'Engineering' },
  { employeeId: 'EMP-012', employeeName: 'Andreas Schulz', date: '2025-11-25', status: 'pending', department: 'Engineering' },
  
  // December 2025
  { employeeId: 'EMP-001', employeeName: 'Sophie Meier', date: '2025-12-23', status: 'pending', department: 'Engineering' },
  { employeeId: 'EMP-001', employeeName: 'Sophie Meier', date: '2025-12-24', status: 'pending', department: 'Engineering' },
  { employeeId: 'EMP-003', employeeName: 'Michael Weber', date: '2025-12-20', status: 'approved', department: 'Engineering' },
  { employeeId: 'EMP-003', employeeName: 'Michael Weber', date: '2025-12-21', status: 'approved', department: 'Engineering' },
  { employeeId: 'EMP-003', employeeName: 'Michael Weber', date: '2025-12-22', status: 'approved', department: 'Engineering' },
  { employeeId: 'EMP-003', employeeName: 'Michael Weber', date: '2025-12-23', status: 'approved', department: 'Engineering' },
  { employeeId: 'EMP-006', employeeName: 'Sarah Fischer', date: '2025-12-23', status: 'approved', department: 'Engineering' },
  { employeeId: 'EMP-007', employeeName: 'Thomas Berg', date: '2025-12-23', status: 'pending', department: 'Engineering' },
];

export function DepartmentCalendarView() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl mb-1">Department Calendar</h1>
          <p className="text-muted-foreground">View vacation schedules for all Engineering department employees</p>
        </div>
      </div>

      <SharedVacationCalendar 
        title="Engineering Department Vacation Calendar"
        vacationData={departmentVacationData}
        description="Overview of all approved and pending vacation requests in your department"
      />
    </div>
  );
}

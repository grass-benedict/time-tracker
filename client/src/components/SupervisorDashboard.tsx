import { TeamOverview } from './TeamOverview';
import { TimesheetApproval } from './TimesheetApproval';
import { VacationApproval } from './VacationApproval';
import { SharedVacationCalendar, VacationEntry } from './SharedVacationCalendar';

// Mock data: Direct reports' vacation data for supervisor Harald
// Demonstrates aggregation when more than 2 employees have vacation on the same day
const teamVacationData: VacationEntry[] = [
  // November 2025
  { employeeId: 'EMP-002', employeeName: 'Anna Schmidt', date: '2025-11-10', status: 'pending', department: 'Sales' },
  { employeeId: 'EMP-002', employeeName: 'Anna Schmidt', date: '2025-11-11', status: 'pending', department: 'Sales' },
  { employeeId: 'EMP-002', employeeName: 'Anna Schmidt', date: '2025-11-12', status: 'pending', department: 'Sales' },
  { employeeId: 'EMP-002', employeeName: 'Anna Schmidt', date: '2025-11-13', status: 'pending', department: 'Sales' },
  { employeeId: 'EMP-002', employeeName: 'Anna Schmidt', date: '2025-11-14', status: 'pending', department: 'Sales' },
  { employeeId: 'EMP-003', employeeName: 'Michael Weber', date: '2025-11-18', status: 'approved', department: 'Engineering' },
  { employeeId: 'EMP-003', employeeName: 'Michael Weber', date: '2025-11-19', status: 'approved', department: 'Engineering' },
  { employeeId: 'EMP-003', employeeName: 'Michael Weber', date: '2025-11-20', status: 'approved', department: 'Engineering' },
  { employeeId: 'EMP-004', employeeName: 'Lisa Müller', date: '2025-11-25', status: 'pending', department: 'Marketing' },
  { employeeId: 'EMP-004', employeeName: 'Lisa Müller', date: '2025-11-26', status: 'pending', department: 'Marketing' },
  { employeeId: 'EMP-004', employeeName: 'Lisa Müller', date: '2025-11-27', status: 'pending', department: 'Marketing' },
  { employeeId: 'EMP-004', employeeName: 'Lisa Müller', date: '2025-11-28', status: 'pending', department: 'Marketing' },
  { employeeId: 'EMP-004', employeeName: 'Lisa Müller', date: '2025-11-29', status: 'pending', department: 'Marketing' },
  
  // Aggregation test: Multiple employees on same days (Nov 15)
  { employeeId: 'EMP-005', employeeName: 'Thomas Klein', date: '2025-11-15', status: 'approved', department: 'Sales' },
  { employeeId: 'EMP-006', employeeName: 'Sarah Fischer', date: '2025-11-15', status: 'approved', department: 'Engineering' },
  { employeeId: 'EMP-007', employeeName: 'Peter Hoffmann', date: '2025-11-15', status: 'pending', department: 'Marketing' },
  
  // December 2025 - More aggregation examples
  { employeeId: 'EMP-003', employeeName: 'Michael Weber', date: '2025-12-20', status: 'pending', department: 'Engineering' },
  { employeeId: 'EMP-003', employeeName: 'Michael Weber', date: '2025-12-21', status: 'pending', department: 'Engineering' },
  { employeeId: 'EMP-003', employeeName: 'Michael Weber', date: '2025-12-22', status: 'pending', department: 'Engineering' },
  { employeeId: 'EMP-003', employeeName: 'Michael Weber', date: '2025-12-23', status: 'pending', department: 'Engineering' },
  { employeeId: 'EMP-003', employeeName: 'Michael Weber', date: '2025-12-24', status: 'pending', department: 'Engineering' },
  { employeeId: 'EMP-003', employeeName: 'Michael Weber', date: '2025-12-27', status: 'pending', department: 'Engineering' },
  { employeeId: 'EMP-002', employeeName: 'Anna Schmidt', date: '2025-12-23', status: 'approved', department: 'Sales' },
  { employeeId: 'EMP-004', employeeName: 'Lisa Müller', date: '2025-12-23', status: 'approved', department: 'Marketing' },
  { employeeId: 'EMP-005', employeeName: 'Thomas Klein', date: '2025-12-23', status: 'pending', department: 'Sales' },
];

export function SupervisorDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl mb-1">Welcome back, Harald 👋</h1>
          <p className="text-muted-foreground">Supervisor Dashboard - Manage your team and approvals</p>
        </div>
      </div>

      <TeamOverview />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimesheetApproval />
        <VacationApproval />
      </div>

      {/* Team Vacation Calendar */}
      <SharedVacationCalendar 
        title="Team Vacation Calendar"
        vacationData={teamVacationData}
        description="Overview of vacation schedules for your direct reports"
      />
    </div>
  );
}

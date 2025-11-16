import { useEffect, useState } from 'react';
import { SimpleClockInCard } from './SimpleClockInCard';
import { ClockDisplayCard } from './ClockDisplayCard';
import { UpdatedFlexAccountCard } from './UpdatedFlexAccountCard';
import { MonthSummaryCard } from './MonthSummaryCard';
import { RecentActivityCard } from './RecentActivityCard';
import { TimeEditCalendar } from './TimeEditCalendar';
import { StandaloneVacationRequest } from './StandaloneVacationRequest';
import { ProjectTimeEntry } from './ProjectTimeEntry';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar } from 'lucide-react';

type VacationData = {
  total: number;
  used: number;
  pending: number;
  remaining: number;
};

interface EmployeeAPI {
  id: number;
  name: string;
  surname: string;
  username: string;
  vacationDays: number;
  flexAccount: number;
  vacationDaysUsed?: number;
  vacationDaysPending?: number;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}


// recentTimeEntries and upcomingVacations removed; panels consolidated elsewhere

export function EmployeeDashboard({ employeeId }: { employeeId: number }) {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const [vacationData, setVacationData] = useState<VacationData | null>(null);
  const [flexAccount, setFlexAccount] = useState<number | null>(null);
  const [loadingFlex, setLoadingFlex] = useState<boolean>(true);
  const [loadingVacation, setLoadingVacation] = useState<boolean>(true);
  const [loadingEmployee, setLoadingEmployee] = useState<boolean>(true);
  const [vacationError, setVacationError] = useState<string>('');
  const [employee, setEmployee] = useState<EmployeeAPI | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchEmployee = async () => {
      try {
        // We're loading both profile and vacation in this request
        setLoadingVacation(true);
        setLoadingEmployee(true);
        setLoadingFlex(true);
        const res = await fetch(`http://localhost:5000/api/employee/${employeeId}`);
        if (!res.ok) {
          const contentType = res.headers.get('content-type');
          let errMsg = `Server returned ${res.status}`;
          if (contentType && contentType.includes('application/json')) {
            const body = await res.json();
            errMsg = body.message || JSON.stringify(body);
          } else {
            const text = await res.text();
            errMsg = text;
          }
          throw new Error(errMsg);
        }

  const emp: EmployeeAPI = await res.json();
  if (mounted) setEmployee(emp);
        // Map available fields into the vacation UI. If you have real used/pending fields,
        // update this mapping accordingly.
        const total = emp.vacationDays ?? 0;
        const used = emp.vacationDaysUsed ?? 0;
        const pending = emp.vacationDaysPending ?? 0;
        const mapped: VacationData = {
          total,
          used,
          pending,
          remaining: Math.max(0, total - used),
        };
        if (mounted) {
          setVacationData(mapped);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Failed to load employee vacation data:', message);
        if (mounted) setVacationError(message);
      } finally {
        if (mounted) {
          setLoadingVacation(false);
          setLoadingEmployee(false);
        }
      }
    };

    fetchEmployee();
    return () => { mounted = false; };
  }, [employeeId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl mb-1">{
            loadingVacation
              ? 'Good morning!'
              : employee
                ? `Good morning, ${employee.name}! 👋`
                : 'Good morning!'
          }</h1>
          <p className="text-muted-foreground">{
            vacationError ? `Unable to load profile: ${vacationError}` : 'Ready to start tracking your time today?'
          }</p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div>Today</div>
          <div>{dateString}</div>
        </div>
      </div>

      {/* Main Clock In Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleClockInCard employeeId={employeeId} />
        <ClockDisplayCard employeeId={employeeId} />
      </div>

      {/* Three Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UpdatedFlexAccountCard 
          flexAccount={employee?.flexAccount ?? 0}
          loading={loadingEmployee}
        />
        <MonthSummaryCard employeeId={employeeId} />
        <RecentActivityCard employeeId={employeeId} />
      </div>

  {/* Time Edit Calendar - NEW: Click to edit time entries */}
  <TimeEditCalendar employeeId={employeeId} />

      {/* Vacation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Vacation Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-accent border border-border">
              <div className="text-2xl text-foreground">{loadingVacation ? '…' : vacationData ? vacationData.total : 0}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Days</div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
              <div className="text-2xl text-blue-700 dark:text-blue-400">{loadingVacation ? '…' : vacationData ? vacationData.used : 0}</div>
              <div className="text-sm text-muted-foreground mt-1">Used</div>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
              <div className="text-2xl text-amber-700 dark:text-amber-400">{loadingVacation ? '…' : vacationData ? vacationData.pending : 0}</div>
              <div className="text-sm text-muted-foreground mt-1">Pending</div>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
              <div className="text-2xl text-green-700 dark:text-green-400">{loadingVacation ? '…' : vacationData ? vacationData.remaining : 0}</div>
              <div className="text-sm text-muted-foreground mt-1">Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Standalone Vacation Request - Dedicated section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StandaloneVacationRequest employeeId={employeeId} />
        <ProjectTimeEntry />
      </div>

      {/* recent activity and upcoming vacations removed (consolidated in other components) */}
    </div>
  );
}

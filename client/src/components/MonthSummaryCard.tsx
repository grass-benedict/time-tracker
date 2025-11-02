import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar } from 'lucide-react';
import { Progress } from './ui/progress';

export function MonthSummaryCard({ employeeId }: { employeeId?: number }) {
  const [hoursWorked, setHoursWorked] = useState<number | null>(null);
  const [expectedHours, setExpectedHours] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchEmployeeHours = async () => {
      if (!employeeId) return;
      try {
        const res = await fetch(`/api/employee/${employeeId}`);
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

        const emp = await res.json();
        if (!mounted) return;
        setHoursWorked(typeof emp.hoursWorked === 'number' ? emp.hoursWorked : 0);
        setExpectedHours(typeof emp.hoursMonthly === 'number' ? emp.hoursMonthly : 0);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Failed to fetch employee hours:', message);
        if (mounted) setError(message);
      }
    };

    fetchEmployeeHours();
    return () => { mounted = false; };
  }, [employeeId]);

  const hw = hoursWorked ?? 0;
  const eh = expectedHours ?? 0;
  const difference = hw - eh;
  const progressPercentage = eh > 0 ? (hw / eh) * 100 : 0;
  const diffDisplay = (difference > 0 ? '+' : '') + difference.toFixed(1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Month Summary</CardTitle>
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error ? (
          <div className="text-sm text-red-600">Error loading hours: {error}</div>
        ) : (
          <>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Hours worked:</span>
              <span className="text-lg">{hoursWorked === null ? '…' : `${hw.toFixed(1)}h`}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Expected:</span>
              <span className="text-lg">{expectedHours === null ? '…' : `${eh.toFixed(1)}h`}</span>
            </div>
            <Progress value={Math.min(100, Math.max(0, progressPercentage))} className="h-2" />
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Difference:</span>
              <span className={`text-lg ${difference < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {diffDisplay}h
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

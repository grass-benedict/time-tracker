import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Play, Coffee, StopCircle, Check } from 'lucide-react';
import { toast } from 'sonner';

type WorkStatus = 'off-duty' | 'working' | 'on-break';

export function SimpleClockInCard({ employeeId }: { employeeId?: number }) {
  const [status, setStatus] = useState<WorkStatus>('off-duty');
  const [workTime, setWorkTime] = useState(0); // in seconds
  const [breakTime, setBreakTime] = useState(0); // in seconds

  // Timer effect for work time
  useEffect(() => {
    if (status === 'working') {
      const interval = setInterval(() => {
        setWorkTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Timer effect for break time
  useEffect(() => {
    if (status === 'on-break') {
      const interval = setInterval(() => {
        setBreakTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClockIn = () => {
    setStatus('working');
    setWorkTime(0);
    setBreakTime(0);
    toast.success('Clocked in successfully - Work timer started');

    // Create a time log entry for IN
    (async () => {
      try {
        if (!employeeId) {
          console.warn('No employeeId provided for clock in; skipping server timeLog creation');
          return;
        }

        const res = await fetch('/api/timeLogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId,
            clockTime: new Date().toISOString(),
            eventType: 'IN'
          })
        });

        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Failed creating IN time log: ${res.status} ${body}`);
        }
        // notify listeners that time logs changed for this employee
        try {
          window.dispatchEvent(new CustomEvent('timeLogChanged', { detail: { employeeId } }));
        } catch (e) {
          const ev: any = document.createEvent('CustomEvent');
          ev.initCustomEvent('timeLogChanged', true, true, { employeeId });
          window.dispatchEvent(ev);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(message);
        toast.error('Failed to record clock in (server)');
      }
    })();
  };

  const handleStartBreak = () => {
    setStatus('on-break');
    toast.success('Break started - Work timer paused');
  };

  const handleFinishBreak = () => {
    setStatus('working');
    toast.success(`Break ended (${formatTime(breakTime)}) - Work timer resumed`);
  };

  const handleClockOut = () => {
    const totalWorkTime = formatTime(workTime);
    const totalBreakTime = formatTime(breakTime);
    setStatus('off-duty');
    setWorkTime(0);
    setBreakTime(0);
    toast.success(`Clocked out - Work: ${totalWorkTime}, Break: ${totalBreakTime}`);

    // Create OUT time log and update employee hoursWorked on success
    (async () => {
      try {
        if (!employeeId) {
          console.warn('No employeeId provided for clock out; skipping server timeLog and hours update');
          return;
        }

        // Post OUT time log
        const outRes = await fetch('/api/timeLogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId,
            clockTime: new Date().toISOString(),
            eventType: 'OUT'
          })
        });

        if (!outRes.ok) {
          const text = await outRes.text();
          throw new Error(`Failed creating OUT time log: ${outRes.status} ${text}`);
        }

        // Fetch current employee hoursWorked
        const empRes = await fetch(`/api/employee/${employeeId}`);
        if (!empRes.ok) {
          const t = await empRes.text();
          throw new Error(`Failed fetching employee: ${empRes.status} ${t}`);
        }
        const emp = await empRes.json();
        const currentHours = typeof emp.hoursWorked === 'number' ? emp.hoursWorked : 0;

        const deltaHours = workTime / 3600; // workTime is in seconds
        const newHours = Number((currentHours + deltaHours).toFixed(3));

        // Update employee hoursWorked
        const putRes = await fetch(`/api/employee/${employeeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hoursWorked: newHours })
        });

        if (!putRes.ok) {
          const t = await putRes.text();
          throw new Error(`Failed updating employee hours: ${putRes.status} ${t}`);
        }

        // Notify other components (ClockDisplayCard) to refresh both ways
        try {
          window.dispatchEvent(new CustomEvent('employeeHoursUpdated', { detail: { employeeId, hoursWorked: newHours } }));
          window.dispatchEvent(new CustomEvent('timeLogChanged', { detail: { employeeId } }));
        } catch (e) {
          // older browsers might not support CustomEvent constructor in some contexts
          const ev1: any = document.createEvent('CustomEvent');
          ev1.initCustomEvent('employeeHoursUpdated', true, true, { employeeId, hoursWorked: newHours });
          window.dispatchEvent(ev1);
          const ev2: any = document.createEvent('CustomEvent');
          ev2.initCustomEvent('timeLogChanged', true, true, { employeeId });
          window.dispatchEvent(ev2);
        }

      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(message);
        toast.error('Failed to record clock out or update hours (server)');
      }
    })();
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <Play className="h-5 w-5" />
          <h3 className="text-lg">
            {status === 'off-duty' && 'Ready to work'}
            {status === 'working' && 'Working'}
            {status === 'on-break' && 'On Break'}
          </h3>
        </div>

        {/* Timer Display */}
        {status !== 'off-duty' && (
          <div className="space-y-2 p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm">Work Timer:</span>
              <span className="text-lg font-mono">{formatTime(workTime)}</span>
            </div>
            {status === 'on-break' && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Break Timer:</span>
                <span className="text-lg font-mono text-orange-600 dark:text-orange-400">
                  {formatTime(breakTime)}
                </span>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          {status === 'off-duty' && 'Start tracking your time'}
          {status === 'working' && 'Work timer is running'}
          {status === 'on-break' && 'Break timer is running - Work timer paused'}
        </p>

        {/* Buttons based on state */}
        {status === 'off-duty' && (
          <Button 
            className="w-full h-11" 
            onClick={handleClockIn}
          >
            <Play className="mr-2 h-4 w-4" />
            Clock In
          </Button>
        )}

        {status === 'working' && (
          <div className="grid grid-cols-2 gap-2">
            <Button 
              className="h-11" 
              variant="outline"
              onClick={handleStartBreak}
            >
              <Coffee className="mr-2 h-4 w-4" />
              Break
            </Button>
            <Button 
              className="h-11" 
              variant="destructive"
              onClick={handleClockOut}
            >
              <StopCircle className="mr-2 h-4 w-4" />
              Clock Out
            </Button>
          </div>
        )}

        {status === 'on-break' && (
          <div className="grid grid-cols-2 gap-2">
            <Button 
              className="h-11" 
              onClick={handleFinishBreak}
            >
              <Check className="mr-2 h-4 w-4" />
              Finished Break
            </Button>
            <Button 
              className="h-11" 
              variant="destructive"
              onClick={handleClockOut}
              disabled
            >
              <StopCircle className="mr-2 h-4 w-4" />
              Clock Out
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Clock } from 'lucide-react';

export function ClockDisplayCard({ employeeId }: { employeeId?: number }) {
  const [hoursToday, setHoursToday] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const computeHoursFromLogs = (logs: Array<any>) => {
      // logs assumed sorted ASC by clockTime
      let totalSeconds = 0;
      let openIn: Date | null = null;
      const now = new Date();

      for (const l of logs) {
        const t = new Date(l.clockTime);
        if (l.eventType === 'IN') {
          openIn = t;
        } else if (l.eventType === 'OUT') {
          if (openIn) {
            const diff = (t.getTime() - openIn.getTime()) / 1000;
            if (diff > 0) totalSeconds += diff;
            openIn = null;
          } else {
            // OUT without IN — ignore
          }
        }
      }

      // If there's an open IN (user hasn't clocked out yet), count until now
      if (openIn) {
        const diff = (now.getTime() - openIn.getTime()) / 1000;
        if (diff > 0) totalSeconds += diff;
      }

      return totalSeconds / 3600; // hours
    };

    const fetchTodayLogs = async () => {
      if (!employeeId) return;
      try {
        const today = new Date();
        const iso = today.toISOString();
        const res = await fetch(`/api/timeLogs/employee/${employeeId}/daily?date=${encodeURIComponent(iso)}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`${res.status} ${text}`);
        }
        const logs = await res.json();
        if (!mounted) return;
        // ensure ascending order by clockTime
        logs.sort((a: any, b: any) => new Date(a.clockTime).getTime() - new Date(b.clockTime).getTime());
        const hrs = computeHoursFromLogs(logs);
        setHoursToday(Number(hrs.toFixed(3)));
      } catch (err) {
        console.error('Failed loading today time logs:', err);
      }
    };

    fetchTodayLogs();

    const refreshHandler = () => {
      fetchTodayLogs();
    };

    window.addEventListener('timeLogChanged', refreshHandler as EventListener);
    window.addEventListener('employeeHoursUpdated', refreshHandler as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener('timeLogChanged', refreshHandler as EventListener);
      window.removeEventListener('employeeHoursUpdated', refreshHandler as EventListener);
    };
  }, [employeeId]);

  const display = hoursToday === null ? '…' : `${hoursToday.toFixed(1)}h`;

  return (
    <Card className="h-full">
      <CardContent className="pt-6 flex flex-col items-center justify-center h-full min-h-[280px]">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-5xl tabular-nums text-foreground mb-2">
          {display}
        </div>
        <div className="text-sm text-muted-foreground">
          Total hours worked
        </div>
      </CardContent>
    </Card>
  );
}

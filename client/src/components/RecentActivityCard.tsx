import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TimeLog {
  id: number;
  employeeId: number;
  clockTime: string;
  eventType: string;
  createdAt: string;
  updatedAt: string;
}

interface ActivityItem {
  action: string;
  details: string;
  time: string;
}

interface RecentActivityCardProps {
  employeeId: number;
}

function formatEventType(eventType: string): string {
  switch (eventType.toUpperCase()) {
    case 'IN': return 'Clocked in';
    case 'OUT': return 'Clocked out';
    case 'BREAK_START': return 'Started break';
    case 'BREAK_END': return 'Ended break';
    default: return eventType;
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function RecentActivityCard({ employeeId }: RecentActivityCardProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchRecentActivity() {
      setLoading(true);
      setError(null);
      try {
        // use relative path so dev proxy works
        const response = await fetch(`/api/timeLogs/employee/${employeeId}`);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Server returned ${response.status}`);
        }

        const timeLogs: TimeLog[] = await response.json();

        if (!mounted) return;

        // Sort logs by clockTime descending (most recent first)
        timeLogs.sort((a, b) => new Date(b.clockTime).getTime() - new Date(a.clockTime).getTime());

        const activityItems = timeLogs.slice(0, 5).map((log) => ({
          action: formatEventType(log.eventType),
          details: '',
          time: formatTime(log.clockTime),
        }));

        setActivities(activityItems);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recent activity');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchRecentActivity();

    const onChange = () => { fetchRecentActivity(); };
    window.addEventListener('timeLogChanged', onChange as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener('timeLogChanged', onChange as EventListener);
    };
  }, [employeeId]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            Loading recent activity...
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 dark:text-red-400 text-center py-4">
            {error}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="flex justify-between items-start py-2 border-b last:border-0">
              <div className="flex-1">
                <div className="text-sm">{activity.action}</div>
                <div className="text-xs text-muted-foreground">{activity.time}</div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

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
    async function fetchRecentActivity() {
      try {
        // Instead of daily, let's get the most recent entries
        const response = await fetch(`http://localhost:5000/api/timeLogs/employee/${employeeId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch recent activity');
        }

        const timeLogs: TimeLog[] = await response.json();
        console.log('Fetched time logs:', timeLogs); // Debug log
        
        // Convert time logs to activity items and sort by most recent first
        const activityItems = timeLogs
          .map(log => {
            console.log('Processing log:', log); // Debug log
            return {
              action: formatEventType(log.eventType),
              details: '', // Could add more context here if needed
              time: formatTime(log.clockTime)
            };
          })
          .sort((a, b) => {
            try {
              const timeA = new Date(a.time).getTime();
              const timeB = new Date(b.time).getTime();
              return timeB - timeA;
            } catch (error) {
              console.error('Error sorting times:', error);
              return 0;
            }
          })
          .slice(0, 5); // Show only the 5 most recent activities

        setActivities(activityItems);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recent activity');
      } finally {
        setLoading(false);
      }
    }

    fetchRecentActivity();
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

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Activity } from 'lucide-react';

interface ActivityItem {
  action: string;
  details: string;
  time: string;
}

export function RecentActivityCard() {
  const activities: ActivityItem[] = [
    { action: 'Clocked out', details: 'Mobile App', time: '5:37 PM' },
    { action: 'Project changed', details: 'E-commerce', time: '2:15 PM' },
    { action: 'Break ended', details: '', time: '1:00 PM' },
  ];

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
        {activities.map((activity, index) => (
          <div key={index} className="flex justify-between items-start py-2 border-b last:border-0">
            <div className="flex-1">
              <div className="text-sm">{activity.action}</div>
              {activity.details && (
                <div className="text-xs text-muted-foreground">{activity.details}</div>
              )}
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
              {activity.time}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TimesheetEntry {
  id: string;
  employeeName: string;
  period: string;
  totalHours: number;
  overtime: number;
  status: 'pending' | 'approved' | 'rejected';
  warning?: boolean;
}

const mockTimesheets: TimesheetEntry[] = [
  {
    id: '1',
    employeeName: 'Anna Schmidt',
    period: 'October 2025',
    totalHours: 176,
    overtime: 8.5,
    status: 'pending',
  },
  {
    id: '2',
    employeeName: 'Michael Weber',
    period: 'October 2025',
    totalHours: 184,
    overtime: 16.0,
    status: 'pending',
    warning: true,
  },
  {
    id: '3',
    employeeName: 'Lisa Müller',
    period: 'October 2025',
    totalHours: 172,
    overtime: 4.0,
    status: 'pending',
  },
];

export function TimesheetApproval() {
  const handleApprove = (id: string, name: string) => {
    toast.success(`Timesheet approved for ${name}`);
  };

  const handleReject = (id: string, name: string) => {
    toast.error(`Timesheet rejected for ${name}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Check className="h-5 w-5" />
          Pending Timesheet Approvals
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {mockTimesheets.map((timesheet) => (
            <div key={timesheet.id} className="p-5 border rounded-lg space-y-3 bg-muted/30">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <div>{timesheet.employeeName}</div>
                    {timesheet.warning && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        High Overtime
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{timesheet.period}</div>
                </div>
                <Badge variant="secondary">{timesheet.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Hours: </span>
                  <span>{timesheet.totalHours}h</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Overtime: </span>
                  <span className={timesheet.overtime > 10 ? 'text-red-600' : 'text-green-600'}>
                    +{timesheet.overtime}h
                  </span>
                </div>
              </div>

              {timesheet.warning && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4 text-sm">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Warning: Overtime exceeds 10 hours</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleApprove(timesheet.id, timesheet.employeeName)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleReject(timesheet.id, timesheet.employeeName)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

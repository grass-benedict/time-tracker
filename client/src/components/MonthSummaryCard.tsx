import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar } from 'lucide-react';
import { Progress } from './ui/progress';

export function MonthSummaryCard() {
  const hoursWorked = 132.5;
  const expectedHours = 160;
  const difference = hoursWorked - expectedHours;
  const progressPercentage = (hoursWorked / expectedHours) * 100;

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
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-muted-foreground">Hours worked:</span>
          <span className="text-lg">{hoursWorked}h</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-muted-foreground">Expected:</span>
          <span className="text-lg">{expectedHours}h</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-muted-foreground">Difference:</span>
          <span className={`text-lg ${difference < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {difference > 0 ? '+' : ''}{difference}h
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

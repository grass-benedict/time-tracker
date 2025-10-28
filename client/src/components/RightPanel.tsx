import { Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';

type RightPanelProps = {
  currentTime: string;
  totalHours: string;
  date: string;
};

export function RightPanel({ currentTime, totalHours, date }: RightPanelProps) {
  return (
    <div className="w-80 h-screen bg-card border-l border-border p-6">
      <div className="flex flex-col h-full">
        {/* Date */}
        <div className="text-right mb-8">
          <div className="text-sm text-muted-foreground">Today</div>
          <div className="text-sm">{date}</div>
        </div>

        {/* Clock Display */}
        <Card className="flex-1 flex flex-col items-center justify-center">
          <CardContent className="pt-6 text-center">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <div className="text-5xl tabular-nums mb-3">{currentTime}</div>
            <div className="text-sm text-muted-foreground">Total hours worked</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

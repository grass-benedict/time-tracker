import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Clock } from 'lucide-react';

export function ClockDisplayCard() {
  const [time, setTime] = useState('00:00:00');

  useEffect(() => {
    // This would normally track actual work time
    // For now, just showing the static display
    setTime('00:00:00');
  }, []);

  return (
    <Card className="h-full">
      <CardContent className="pt-6 flex flex-col items-center justify-center h-full min-h-[280px]">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-5xl tabular-nums text-foreground mb-2">
          {time}
        </div>
        <div className="text-sm text-muted-foreground">
          Total hours worked
        </div>
      </CardContent>
    </Card>
  );
}

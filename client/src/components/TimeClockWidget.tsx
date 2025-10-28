import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Clock, Play, Square } from 'lucide-react';
import { Badge } from './ui/badge';

export function TimeClockWidget() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00:00');
  const [clockInTime, setClockInTime] = useState<string | null>(null);

  const handleClockToggle = () => {
    if (!isClockedIn) {
      const now = new Date();
      setClockInTime(now.toLocaleTimeString('de-DE'));
      setIsClockedIn(true);
    } else {
      setIsClockedIn(false);
      setClockInTime(null);
      setCurrentTime('00:00:00');
    }
  };

  // Simulate timer when clocked in
  useState(() => {
    if (isClockedIn) {
      const interval = setInterval(() => {
        if (clockInTime) {
          const start = new Date();
          start.setHours(parseInt(clockInTime.split(':')[0]));
          start.setMinutes(parseInt(clockInTime.split(':')[1]));
          start.setSeconds(parseInt(clockInTime.split(':')[2]));
          
          const now = new Date();
          const diff = now.getTime() - start.getTime();
          
          const hours = Math.floor(diff / 3600000);
          const minutes = Math.floor((diff % 3600000) / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          
          setCurrentTime(
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
          );
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  });

  return (
    <Card className="shadow-lg border-green-100 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Clock
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="text-center">
          {isClockedIn ? (
            <div className="space-y-2">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                ● Clocked In
              </Badge>
              <div className="text-5xl tabular-nums bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {currentTime}
              </div>
              <div className="text-sm text-muted-foreground">
                Started at {clockInTime}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-gray-200">○ Clocked Out</Badge>
              <div className="text-muted-foreground">Ready to start work</div>
            </div>
          )}
        </div>

        <Button
          size="lg"
          className={`w-full h-16 text-lg transition-all ${
            isClockedIn 
              ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700' 
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
          }`}
          onClick={handleClockToggle}
        >
          {isClockedIn ? (
            <>
              <Square className="mr-2 h-6 w-6" />
              Clock Out
            </>
          ) : (
            <>
              <Play className="mr-2 h-6 w-6" />
              Clock In
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

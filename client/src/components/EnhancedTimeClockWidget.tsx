import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Clock, Play, Square, Coffee, PlayCircle } from 'lucide-react';
import { Badge } from './ui/badge';

type ClockState = 'clocked-out' | 'working' | 'on-break';

export function EnhancedTimeClockWidget() {
  const [clockState, setClockState] = useState<ClockState>('clocked-out');
  const [workTime, setWorkTime] = useState('00:00:00');
  const [breakTime, setBreakTime] = useState('00:00:00');
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [breakStartTime, setBreakStartTime] = useState<string | null>(null);
  const [totalBreakMinutes, setTotalBreakMinutes] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (clockState === 'working' && clockInTime) {
        const start = new Date();
        const [h, m, s] = clockInTime.split(':');
        start.setHours(parseInt(h), parseInt(m), parseInt(s));
        
        const now = new Date();
        const diff = now.getTime() - start.getTime() - (totalBreakMinutes * 60000);
        
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        setWorkTime(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      } else if (clockState === 'on-break' && breakStartTime) {
        const start = new Date();
        const [h, m, s] = breakStartTime.split(':');
        start.setHours(parseInt(h), parseInt(m), parseInt(s));
        
        const now = new Date();
        const diff = now.getTime() - start.getTime();
        
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        setBreakTime(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [clockState, clockInTime, breakStartTime, totalBreakMinutes]);

  const handleClockIn = () => {
    const now = new Date();
    setClockInTime(now.toLocaleTimeString('de-DE'));
    setClockState('working');
    setTotalBreakMinutes(0);
  };

  const handleClockOut = () => {
    setClockState('clocked-out');
    setClockInTime(null);
    setWorkTime('00:00:00');
    setBreakTime('00:00:00');
    setTotalBreakMinutes(0);
  };

  const handleStartBreak = () => {
    const now = new Date();
    setBreakStartTime(now.toLocaleTimeString('de-DE'));
    setClockState('on-break');
    setBreakTime('00:00:00');
  };

  const handleEndBreak = () => {
    if (breakStartTime) {
      const start = new Date();
      const [h, m, s] = breakStartTime.split(':');
      start.setHours(parseInt(h), parseInt(m), parseInt(s));
      
      const now = new Date();
      const diff = now.getTime() - start.getTime();
      const minutes = Math.floor(diff / 60000);
      
      setTotalBreakMinutes(prev => prev + minutes);
    }
    setClockState('working');
    setBreakStartTime(null);
    setBreakTime('00:00:00');
  };

  const getWorkHours = () => {
    const [h] = workTime.split(':');
    return parseInt(h);
  };

  const showBreakWarning = () => {
    const hours = getWorkHours();
    if (hours >= 8 && totalBreakMinutes < 45) {
      return { show: true, required: 45, message: '45 min break required after 8 hours' };
    }
    if (hours >= 6 && totalBreakMinutes < 30) {
      return { show: true, required: 30, message: '30 min break required after 6 hours' };
    }
    return { show: false, required: 0, message: '' };
  };

  const warning = showBreakWarning();

  return (
    <Card>
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Clock
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* Status Display */}
        <div className="text-center space-y-3">
          {clockState === 'working' && (
            <>
              <Badge className="bg-green-600 dark:bg-green-500 text-white border-0 px-4 py-1">
                ● WORKING
              </Badge>
              <div className="text-5xl tabular-nums text-foreground">
                {workTime}
              </div>
              <div className="text-sm text-muted-foreground">
                Started at {clockInTime}
              </div>
              {totalBreakMinutes > 0 && (
                <div className="text-sm text-muted-foreground">
                  Total breaks: {totalBreakMinutes} minutes
                </div>
              )}
            </>
          )}
          
          {clockState === 'on-break' && (
            <>
              <Badge className="bg-amber-600 dark:bg-amber-500 text-white border-0 px-4 py-1">
                ☕ ON BREAK
              </Badge>
              <div className="text-5xl tabular-nums text-foreground">
                {breakTime}
              </div>
              <div className="text-sm text-muted-foreground">
                Break started at {breakStartTime}
              </div>
            </>
          )}
          
          {clockState === 'clocked-out' && (
            <>
              <Badge variant="secondary" className="px-4 py-1">
                ○ CLOCKED OUT
              </Badge>
              <div className="text-muted-foreground mt-4">Ready to start work</div>
            </>
          )}
        </div>

        {/* Break Warning */}
        {warning.show && clockState === 'working' && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <Coffee className="h-5 w-5" />
              <span className="text-sm">⚠️ {warning.message}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {clockState === 'clocked-out' && (
            <Button
              size="lg"
              className="w-full h-16"
              onClick={handleClockIn}
            >
              <Play className="mr-2 h-5 w-5" />
              Clock In
            </Button>
          )}

          {clockState === 'working' && (
            <>
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                onClick={handleStartBreak}
              >
                <Coffee className="mr-2 h-5 w-5" />
                Start Break
              </Button>
              <Button
                size="lg"
                variant="destructive"
                className="w-full h-12"
                onClick={handleClockOut}
              >
                <Square className="mr-2 h-5 w-5" />
                Clock Out
              </Button>
            </>
          )}

          {clockState === 'on-break' && (
            <Button
              size="lg"
              className="w-full h-16 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
              onClick={handleEndBreak}
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              End Break & Resume Work
            </Button>
          )}
        </div>

        {/* Legal Info */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>📋 Legal Break Requirements:</div>
            <div>• 30 min after 6 hours of work</div>
            <div>• 45 min after 8 hours of work</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

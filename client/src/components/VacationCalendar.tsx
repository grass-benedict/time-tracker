import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Badge } from './ui/badge';

interface VacationDay {
  date: string;
  type: 'approved' | 'pending' | 'sick';
  days: number;
}

const mockVacationDays: VacationDay[] = [
  { date: '2025-11-15', type: 'approved', days: 1 },
  { date: '2025-11-16', type: 'approved', days: 1 },
  { date: '2025-11-17', type: 'approved', days: 1 },
  { date: '2025-11-18', type: 'approved', days: 1 },
  { date: '2025-12-23', type: 'pending', days: 1 },
  { date: '2025-12-24', type: 'pending', days: 1 },
];

export function VacationCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 9)); // October 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getWeekDays = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(monday);
      currentDay.setDate(monday.getDate() + i);
      days.push(currentDay);
    }
    
    return days;
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    setSelectedDate(clickedDate);
    setSelectedEndDate(clickedDate);
    setIsDialogOpen(true);
  };

  const handleSubmitRequest = () => {
    if (!selectedDate || !selectedEndDate) return;
    
    const start = selectedDate.toISOString().split('T')[0];
    const end = selectedEndDate.toISOString().split('T')[0];
    
    toast.success(`Vacation request submitted: ${start} to ${end}`);
    setIsDialogOpen(false);
  };

  const getVacationForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mockVacationDays.find(v => v.date === dateStr);
  };

  const renderMonthView = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - startingDayOfWeek + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
      const vacation = isValidDay ? getVacationForDate(dayNumber) : null;

      days.push(
        <button
          key={i}
          onClick={() => isValidDay && handleDateClick(dayNumber)}
          disabled={!isValidDay}
          className={`
            aspect-square p-2 rounded-lg relative transition-all
            ${!isValidDay ? 'invisible' : ''}
            ${vacation?.type === 'approved' ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600' : ''}
            ${vacation?.type === 'pending' ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600' : ''}
            ${!vacation ? 'bg-white hover:bg-indigo-50 border border-gray-200' : ''}
          `}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <span className={vacation ? 'font-semibold' : ''}>{dayNumber}</span>
            {vacation && (
              <span className="text-xs mt-1 opacity-90">
                {vacation.type === 'approved' ? '✓' : '⏱'}
              </span>
            )}
          </div>
        </button>
      );
    }

    return days;
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(new Date(currentMonth));
    
    return weekDays.map((day, index) => {
      const dayNum = day.getDate();
      const monthNum = day.getMonth();
      const yearNum = day.getFullYear();
      const dateStr = `${yearNum}-${String(monthNum + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const vacation = mockVacationDays.find(v => v.date === dateStr);
      
      return (
        <div key={index} className="flex-1">
          <button
            onClick={() => handleDateClick(dayNum)}
            className={`
              w-full p-4 rounded-lg transition-all
              ${vacation?.type === 'approved' ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white' : ''}
              ${vacation?.type === 'pending' ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : ''}
              ${!vacation ? 'bg-white hover:bg-indigo-50 border border-gray-200' : ''}
            `}
          >
            <div className="text-sm opacity-75">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
            </div>
            <div className="text-2xl mt-1">{dayNum}</div>
            {vacation && (
              <Badge className="mt-2 text-xs" variant={vacation.type === 'approved' ? 'default' : 'secondary'}>
                {vacation.type}
              </Badge>
            )}
          </button>
        </div>
      );
    });
  };

  return (
    <>
      <Card className="shadow-md border-indigo-100">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Vacation Calendar
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewMode === 'month' ? 'secondary' : 'ghost'}
                onClick={() => setViewMode('month')}
                className="text-white hover:bg-white/20"
              >
                Month
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                onClick={() => setViewMode('week')}
                className="text-white hover:bg-white/20"
              >
                Week
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {viewMode === 'month' ? (
            <>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {renderMonthView()}
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              {renderWeekView()}
            </div>
          )}

          <div className="flex gap-4 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded"></div>
              <span className="text-sm">Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded"></div>
              <span className="text-sm">Pending</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Vacation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Selected Date</Label>
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                {selectedDate?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <input
                type="date"
                className="w-full p-2 border rounded-lg"
                value={selectedEndDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setSelectedEndDate(new Date(e.target.value))}
                min={selectedDate?.toISOString().split('T')[0]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRequest} className="bg-gradient-to-r from-indigo-500 to-purple-600">
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

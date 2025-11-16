import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

export interface VacationEntry {
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'approved' | 'pending';
  department: string;
  type?: 'vacation' | 'sick';
}

interface SharedVacationCalendarProps {
  title: string;
  vacationData: VacationEntry[];
  description?: string;
}

export function SharedVacationCalendar({ title, vacationData, description }: SharedVacationCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 10)); // November 2025
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getVacationsForDate = (day: number): VacationEntry[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return vacationData.filter(v => v.date === dateStr);
  };

  const handleDateClick = (day: number) => {
    const vacations = getVacationsForDate(day);
    if (vacations.length > 0) {
      const clickedDate = new Date(year, month, day);
      setSelectedDate(clickedDate);
      setIsModalOpen(true);
    }
  };

  const renderDayContent = (vacations: VacationEntry[]) => {
    if (vacations.length === 0) return null;

    const approvedCount = vacations.filter(v => v.status === 'approved').length;
    const pendingCount = vacations.filter(v => v.status === 'pending').length;
    
    // Show first two entries
    const displayedVacations = vacations.slice(0, 2);
    const remainingCount = vacations.length - 2;

    return (
      <div className="mt-1 space-y-0.5">
        {displayedVacations.map((vacation, idx) => (
          <div
            key={idx}
            className={`text-xs px-1.5 py-0.5 rounded truncate ${
              vacation.status === 'approved'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
            }`}
          >
            {vacation.employeeName.split(' ')[0]}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="text-xs px-1.5 py-0.5 text-muted-foreground">
            ...and {remainingCount} more
          </div>
        )}
      </div>
    );
  };

  const renderMonthView = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - startingDayOfWeek + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
      const vacations = isValidDay ? getVacationsForDate(dayNumber) : [];
      const hasVacations = vacations.length > 0;

      days.push(
        <button
          key={i}
          onClick={() => isValidDay && hasVacations && handleDateClick(dayNumber)}
          disabled={!isValidDay || !hasVacations}
          className={`
            min-h-[80px] p-2 rounded-lg relative transition-all text-left
            ${!isValidDay ? 'invisible' : ''}
            ${hasVacations ? 'bg-muted/50 hover:bg-muted cursor-pointer border-2 border-primary/20' : 'bg-card hover:bg-accent/50 border border-border'}
            ${!hasVacations ? 'cursor-default' : ''}
          `}
        >
          {isValidDay && (
            <>
              <div className="mb-1">{dayNumber}</div>
              {renderDayContent(vacations)}
            </>
          )}
        </button>
      );
    }

    return days;
  };

  const getModalVacations = () => {
    if (!selectedDate) return [];
    const day = selectedDate.getDate();
    return getVacationsForDate(day);
  };

  const modalVacations = getModalVacations();
  const approvedVacations = modalVacations.filter(v => v.status === 'approved');
  const pendingVacations = modalVacations.filter(v => v.status === 'pending');

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {title}
          </CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          )}
        </CardHeader>
        <CardContent className="pt-6">
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

          <div className="flex gap-4 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded"></div>
              <span className="text-sm">Approved Vacation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded"></div>
              <span className="text-sm">Pending Request</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Vacation Details - {selectedDate?.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-4">
              {approvedVacations.length > 0 && (
                <div>
                  <h4 className="text-sm mb-3 flex items-center gap-2">
                    <Badge variant="default" className="bg-green-600">Approved</Badge>
                    <span className="text-muted-foreground">({approvedVacations.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {approvedVacations.map((vacation, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <div>
                            <div>{vacation.employeeName}</div>
                            <div className="text-xs text-muted-foreground">
                              {vacation.type && <span className="capitalize">{vacation.type}</span>}
                              {vacation.type && vacation.department && <span> • </span>}
                              {vacation.department}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingVacations.length > 0 && (
                <div>
                  <h4 className="text-sm mb-3 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-amber-600 text-white">Pending</Badge>
                    <span className="text-muted-foreground">({pendingVacations.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {pendingVacations.map((vacation, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <div>
                            <div>{vacation.employeeName}</div>
                            <div className="text-xs text-muted-foreground">
                              {vacation.type && <span className="capitalize">{vacation.type}</span>}
                              {vacation.type && vacation.department && <span> • </span>}
                              {vacation.department}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {modalVacations.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No vacation requests for this day
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

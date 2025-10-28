import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Badge } from './ui/badge';

interface TimeEntry {
  id: string;
  type: 'work' | 'break';
  start: string;
  end: string;
}

interface DayData {
  date: string;
  entries: TimeEntry[];
  totalHours: number;
}

const mockWorkData: Record<string, DayData> = {
  '2025-10-20': {
    date: '2025-10-20',
    entries: [
      { id: '1', type: 'work', start: '08:00', end: '12:00' },
      { id: '2', type: 'break', start: '12:00', end: '12:30' },
      { id: '3', type: 'work', start: '12:30', end: '17:00' },
    ],
    totalHours: 8.5,
  },
  '2025-10-21': {
    date: '2025-10-21',
    entries: [
      { id: '1', type: 'work', start: '09:00', end: '13:00' },
      { id: '2', type: 'break', start: '13:00', end: '14:00' },
      { id: '3', type: 'work', start: '14:00', end: '18:00' },
    ],
    totalHours: 8.0,
  },
  '2025-10-22': {
    date: '2025-10-22',
    entries: [
      { id: '1', type: 'work', start: '08:30', end: '17:30' },
      { id: '2', type: 'break', start: '12:30', end: '13:00' },
    ],
    totalHours: 8.5,
  },
};

export function TimeEditCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 9)); // October 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntries, setEditingEntries] = useState<TimeEntry[]>([]);

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

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    setSelectedDate(clickedDate);
    
    // Load existing entries or create empty array
    if (mockWorkData[dateStr]) {
      setEditingEntries([...mockWorkData[dateStr].entries]);
    } else {
      setEditingEntries([]);
    }
    
    setIsDialogOpen(true);
  };

  const getDataForDate = (day: number): DayData | null => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mockWorkData[dateStr] || null;
  };

  const addEntry = () => {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      type: 'work',
      start: '09:00',
      end: '17:00',
    };
    setEditingEntries([...editingEntries, newEntry]);
  };

  const updateEntry = (id: string, field: keyof TimeEntry, value: string) => {
    setEditingEntries(entries =>
      entries.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const deleteEntry = (id: string) => {
    setEditingEntries(entries => entries.filter(entry => entry.id !== id));
  };

  const handleSaveEntries = () => {
    if (!selectedDate) return;
    
    toast.success('Time entries updated successfully');
    setIsDialogOpen(false);
  };

  const renderCalendar = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - startingDayOfWeek + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
      const dayData = isValidDay ? getDataForDate(dayNumber) : null;

      days.push(
        <button
          key={i}
          onClick={() => isValidDay && handleDateClick(dayNumber)}
          disabled={!isValidDay}
          className={`
            min-h-24 p-2 rounded-lg relative transition-all border
            ${!isValidDay ? 'invisible' : ''}
            ${dayData ? 'bg-accent border-primary/30 hover:border-primary' : 'bg-card hover:bg-accent/50 border-border'}
          `}
        >
          {isValidDay && (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-base ${dayData ? 'font-semibold' : ''}`}>
                  {dayNumber}
                </span>
                {dayData && (
                  <Edit className="h-3 w-3 text-primary" />
                )}
              </div>
              {dayData && (
                <div className="flex-1 space-y-1">
                  <div className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                    {dayData.totalHours}h worked
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {dayData.entries.filter(e => e.type === 'work').length} periods
                  </div>
                </div>
              )}
            </div>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Time Tracking Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-6">Click any date to view or edit time entries</p>
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNextMonth}
            >
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
            {renderCalendar()}
          </div>

          <div className="flex gap-4 mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-accent border-2 border-primary/30 rounded"></div>
              <span className="text-sm">Has time entries</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit Time Entries
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {selectedDate?.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {editingEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No time entries for this day. Click "Add Entry" to create one.
              </div>
            ) : (
              editingEntries.map((entry, index) => (
                <div key={entry.id} className="p-4 border border-border rounded-lg bg-accent/50">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className={entry.type === 'work' ? 'bg-primary' : 'bg-amber-600'}>
                          {entry.type === 'work' ? '💼 Work' : '☕ Break'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">Entry {index + 1}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <select
                            value={entry.type}
                            onChange={(e) => updateEntry(entry.id, 'type', e.target.value)}
                            className="w-full p-2 border rounded-lg bg-white"
                          >
                            <option value="work">Work</option>
                            <option value="break">Break</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Start Time</Label>
                          <Input
                            type="time"
                            value={entry.start}
                            onChange={(e) => updateEntry(entry.id, 'start', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>End Time</Label>
                          <Input
                            type="time"
                            value={entry.end}
                            onChange={(e) => updateEntry(entry.id, 'end', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteEntry(entry.id)}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
            
            <Button
              variant="outline"
              className="w-full border-dashed border-2"
              onClick={addEntry}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEntries}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

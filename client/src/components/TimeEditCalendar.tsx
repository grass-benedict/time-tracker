import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';

interface TimeEntry {
  id: string;
  type: 'work' | 'break';
  start: string; // HH:MM or ISO
  end?: string | null; // HH:MM or ISO, optional for running timers
}

interface DayData {
  date: string; // YYYY-MM-DD
  entries: TimeEntry[];
  totalHours: number;
}

// We'll store fetched data here keyed by YYYY-MM-DD
const initialWorkData: Record<string, DayData> = {};

export function TimeEditCalendar({ employeeId }: { employeeId?: number }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 9)); // October 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntries, setEditingEntries] = useState<TimeEntry[]>([]);
  const [workData, setWorkData] = useState<Record<string, DayData>>(initialWorkData);
  const [loading, setLoading] = useState(false);

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

    // Load existing entries for the day (prefer fresh daily fetch to ensure inputs get HH:MM format)
    if (employeeId) {
      fetchDailyEntries(employeeId, dateStr).then(entries => {
        setEditingEntries(entries.length ? entries : []);
      }).catch(() => setEditingEntries([]));
    } else {
      // fallback to preloaded month data
      if (workData[dateStr]) {
        setEditingEntries([...workData[dateStr].entries]);
      } else {
        setEditingEntries([]);
      }
    }

    setIsDialogOpen(true);
  };

  const getDataForDate = (day: number): DayData | null => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return workData[dateStr] || null;
  };

  // Fetch daily logs and return entries formatted for the editor
  const fetchDailyEntries = async (id: number, dateKey: string): Promise<TimeEntry[]> => {
    try {
      const res = await fetch(`http://localhost:5000/api/timeLogs/employee/${id}/daily?date=${dateKey}`);
      if (!res.ok) return [];
      const logs = await res.json();

      // Sort ascending
      logs.sort((a: any, b: any) => new Date(a.clockTime).getTime() - new Date(b.clockTime).getTime());

      const entries: TimeEntry[] = [];
      let i = 0;
      while (i < logs.length) {
        const rec = logs[i];
        if (rec.eventType === 'IN') {
          const inTime = rec.clockTime;
          // find next OUT
          let outRec = null;
          for (let j = i + 1; j < logs.length; j++) {
            if (logs[j].eventType === 'OUT') {
              outRec = logs[j];
              break;
            }
          }
          const entry: TimeEntry = {
            id: `${rec.id}-${outRec ? outRec.id : 'open'}`,
            type: 'work',
            start: formatTimeHHMM(inTime),
            end: outRec ? formatTimeHHMM(outRec.clockTime) : '',
          };
          entries.push(entry);
          if (outRec) {
            i = logs.indexOf(outRec) + 1;
          } else {
            i += 1;
          }
        } else {
          i += 1;
        }
      }
      return entries;
    } catch (err) {
      console.error('Failed to fetch daily entries', err);
      return [];
    }
  };
  // Debug helper: log when daily entries are loaded (helps during QA)
  // Note: will only print in browser console, not server

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
    if (!selectedDate || !employeeId) return;

    (async () => {
      const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

      try {
        // Load existing logs for the day
        const res = await fetch(`http://localhost:5000/api/timeLogs/employee/${employeeId}/daily?date=${dateKey}`);
        if (!res.ok) throw new Error(`Failed to load existing logs: ${res.status}`);
        const existingLogs: any[] = await res.json();

        // Helper maps
        const existingById = new Map(existingLogs.map(l => [String(l.id), l]));

        // Track referenced ids so we can delete leftovers
        const referenced = new Set<string>();

        // Process each edited entry
        for (const entry of editingEntries) {
          const parts = String(entry.id).split('-');
          const inId = parts[0] && !isNaN(Number(parts[0])) ? String(parts[0]) : null;
          const outId = parts[1] && !isNaN(Number(parts[1])) ? String(parts[1]) : null;

          // Build ISO datetimes in local zone
          const dateParts = dateKey.split('-');
          const sy = Number(dateParts[0] ?? selectedDate.getFullYear());
          const sm = Number(dateParts[1] ?? (selectedDate.getMonth() + 1));
          const sd = Number(dateParts[2] ?? selectedDate.getDate());
          const [sh = 0, smin = 0] = entry.start.split(':').map(v => Number(v));
          const inDate = new Date(sy, sm - 1, sd, Number.isFinite(sh) ? sh : 0, Number.isFinite(smin) ? smin : 0, 0);

          // Create or update IN
          if (inId && existingById.has(inId)) {
            // update
            await fetch(`http://localhost:5000/api/timeLogs/${inId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ clockTime: inDate.toISOString(), eventType: 'IN' }),
            });
            referenced.add(inId);
          } else {
            // create
            const createRes = await fetch(`http://localhost:5000/api/timeLogs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ employeeId, clockTime: inDate.toISOString(), eventType: 'IN' }),
            });
            if (createRes.ok) {
              const created = await createRes.json();
              // update local id so future processing can reference it
              // entry.id originally like Date.now() for new ones
              const newInId = String(created.id);
              // If entry had outId stored as 'open', keep format newInId-outId later when set
              entry.id = outId ? `${newInId}-${outId}` : `${newInId}-open`;
              referenced.add(newInId);
            }
          }

          // Handle OUT
          if (entry.end && entry.end.length > 0) {
            const [eh = 0, emin = 0] = entry.end.split(':').map(v => Number(v));
            const outDate = new Date(sy, sm - 1, sd, Number.isFinite(eh) ? eh : 0, Number.isFinite(emin) ? emin : 0, 0);

            if (outId && existingById.has(outId)) {
              await fetch(`http://localhost:5000/api/timeLogs/${outId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clockTime: outDate.toISOString(), eventType: 'OUT' }),
              });
              referenced.add(outId);
            } else {
              // create OUT
              const createRes = await fetch(`http://localhost:5000/api/timeLogs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId, clockTime: outDate.toISOString(), eventType: 'OUT' }),
              });
              if (createRes.ok) {
                const created = await createRes.json();
                referenced.add(String(created.id));
                // If entry previously had in id created above, patch entry.id to include new out id
                const idParts = String(entry.id).split('-');
                entry.id = `${idParts[0] ?? 'open'}-${created.id}`;
              }
            }
          } else {
            // No end provided. If there was an existing out log, delete it
            if (outId && existingById.has(outId)) {
              await fetch(`http://localhost:5000/api/timeLogs/${outId}`, { method: 'DELETE' });
            }
          }
        }

        // Delete any existing logs for the day that were not referenced
        for (const l of existingLogs) {
          const idStr = String(l.id);
          if (!referenced.has(idStr)) {
            // remove orphaned log
            await fetch(`http://localhost:5000/api/timeLogs/${idStr}`, { method: 'DELETE' });
          }
        }

        // Refresh calendar data for employee
        await fetchTimeLogs(employeeId);

        toast.success('Time entries saved');
        setIsDialogOpen(false);
      } catch (err) {
        console.error('Failed to save time entries', err);
        toast.error('Failed to save time entries');
      }
    })();
  };

  // Helpers to format and compute day grouping from server time logs
  const formatTimeHHMM = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    } catch {
      return '';
    }
  };

  const isoDate = (iso: string) => {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Fetch time logs for the given employee and group into days
  const fetchTimeLogs = async (id?: number) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/timeLogs/employee/${id}`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const logs = await res.json();

      // Expect logs to be array of { id, eventType: 'IN'|'OUT', clockTime }
      // Group by date, pairing IN with next OUT
      const byDate: Record<string, { entries: TimeEntry[]; totalHours: number }> = {};

      // Sort logs by time
      logs.sort((a: any, b: any) => new Date(a.clockTime).getTime() - new Date(b.clockTime).getTime());

      let i = 0;
      while (i < logs.length) {
        const rec = logs[i];
        if (rec.eventType === 'IN') {
          const inTime = rec.clockTime;
          // find next OUT after this IN
          let outRec = null;
          for (let j = i + 1; j < logs.length; j++) {
            if (logs[j].eventType === 'OUT') {
              outRec = logs[j];
              break;
            }
          }

          const dayKey = isoDate(inTime);
          if (!byDate[dayKey]) byDate[dayKey] = { entries: [], totalHours: 0 };

          const entry: TimeEntry = {
            id: `${rec.id}-${outRec ? outRec.id : 'open'}`,
            type: 'work',
            start: formatTimeHHMM(inTime),
            end: outRec ? formatTimeHHMM(outRec.clockTime) : null,
          };

          // compute duration if we have out
          if (outRec) {
            const startMs = new Date(inTime).getTime();
            const endMs = new Date(outRec.clockTime).getTime();
            const hours = Math.max(0, (endMs - startMs) / (1000 * 60 * 60));
            byDate[dayKey].totalHours += hours;
          }

          byDate[dayKey].entries.push(entry);

          // if we used an OUT, skip to the outRec index + 1, else just advance one
          if (outRec) {
            i = logs.indexOf(outRec) + 1;
          } else {
            i += 1;
          }
        } else {
          // An OUT without a preceding IN — skip it
          i += 1;
        }
      }

      // Convert into DayData map
      const dayMap: Record<string, DayData> = {};
      for (const k of Object.keys(byDate)) {
        const b = byDate[k]!;
        dayMap[k] = { date: k, entries: b.entries, totalHours: Math.round(b.totalHours * 100) / 100 };
      }

      setWorkData(dayMap);
    } catch (err) {
      console.error('Failed to load time logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when employeeId changes
  useEffect(() => {
    // fetch on mount or when the employeeId changes
    fetchTimeLogs(employeeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

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
                          <Select value={entry.type} onValueChange={(val: string) => updateEntry(entry.id, 'type', val)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="work">Work</SelectItem>
                              <SelectItem value="break">Break</SelectItem>
                            </SelectContent>
                          </Select>
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
                            value={entry.end ?? ''}
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

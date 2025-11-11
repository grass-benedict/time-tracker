import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Plane } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from './ui/badge';

// upcoming vacations are loaded from the server into `upcoming`

export function StandaloneVacationRequest({ employeeId }: { employeeId?: number }) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [upcoming, setUpcoming] = useState<Array<any>>([]);

  const fetchUpcoming = async () => {
    if (!employeeId) return;
    try {
      const res = await fetch(`/api/leaveRequests/employee/${employeeId}`);
      if (!res.ok) return;
      const data = await res.json();
      setUpcoming(data.map((r: any) => ({
        id: r.id,
        startDate: new Date(r.startDate).toISOString().slice(0,10),
        endDate: new Date(r.endDate).toISOString().slice(0,10),
        status: r.approvedStatus,
        days: Math.ceil((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000*60*60*24)) + 1,
      })));
    } catch (err) {
      console.error('Failed to load upcoming vacations', err);
    }
  };

  // load upcoming when employeeId changes
  useEffect(() => {
    fetchUpcoming();
  }, [employeeId]);

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    if (endDate < startDate) {
      toast.error('End date cannot be before start date');
      return;
    }
    if (!employeeId) {
      toast.error('No employee selected');
      return;
    }

    setLoading(true);
    try {
      // fetch employee to get managerId for approvedBy
      const empRes = await fetch(`/api/employee/${employeeId}`);
      if (!empRes.ok) throw new Error('Failed to fetch employee');
      const emp = await empRes.json();
      const managerId = emp.managerId ?? null;

      const body = {
        employeeId,
        type: 'vacation',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        approvedBy: managerId,
      } as any;

      const res = await fetch('/api/leaveRequests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to create leave request');
      }

      toast.success('Vacation request submitted for approval');
      setStartDate(undefined);
      setEndDate(undefined);
      await fetchUpcoming();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Submit vacation failed', msg);
      toast.error('Failed to submit vacation request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Request Vacation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <p className="text-sm text-muted-foreground -mt-2 mb-4">Submit your vacation request for approval</p>
        {/* Request Form */}
        <div className="p-4 bg-accent border border-border rounded-lg space-y-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : 'Select start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : 'Select end date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full h-11"
            disabled={loading}
          >
            <Plane className="mr-2 h-4 w-4" />
            Submit Vacation Request
          </Button>
        </div>

        {/* Upcoming Vacations */}
        <div>
          <h4 className="mb-3">Upcoming Vacations</h4>
          <div className="space-y-3">
            {upcoming.length > 0 ? upcoming.map((vacation: any) => (
              <div 
                key={vacation.id} 
                className="p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm">{vacation.startDate} to {vacation.endDate}</div>
                    <div className="text-xs text-muted-foreground mt-1">{vacation.days} days</div>
                  </div>
                  <Badge 
                    className={
                      vacation.status === 'approved' 
                        ? 'bg-green-600 dark:bg-green-700' 
                        : 'bg-amber-600 dark:bg-amber-700'
                    }
                  >
                    {vacation.status}
                  </Badge>
                </div>
              </div>
            )) : (
              <div className="text-sm text-muted-foreground">No upcoming vacations</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

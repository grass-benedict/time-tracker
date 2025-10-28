import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Plane } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner@2.0.3';
import { Badge } from './ui/badge';

const upcomingVacations = [
  { id: 1, startDate: '2025-11-15', endDate: '2025-11-20', status: 'approved', days: 4 },
  { id: 2, startDate: '2025-12-23', endDate: '2026-01-02', status: 'pending', days: 7 },
];

export function StandaloneVacationRequest() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    toast.success('Vacation request submitted for approval');
    setStartDate(undefined);
    setEndDate(undefined);
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
          >
            <Plane className="mr-2 h-4 w-4" />
            Submit Vacation Request
          </Button>
        </div>

        {/* Upcoming Vacations */}
        <div>
          <h4 className="mb-3">Upcoming Vacations</h4>
          <div className="space-y-3">
            {upcomingVacations.map((vacation) => (
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
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

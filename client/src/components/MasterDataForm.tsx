import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const departments = [
  { id: '1', name: 'Engineering' },
  { id: '2', name: 'Sales' },
  { id: '3', name: 'Marketing' },
  { id: '4', name: 'HR' },
];

const supervisors = [
  { id: '1', name: 'Harald Schmidt' },
  { id: '2', name: 'Maria Weber' },
  { id: '3', name: 'Klaus Müller' },
];

export function MasterDataForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    department: '',
    supervisor: '',
    weeklyHours: '40',
    vacationDays: '30',
  });

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in required fields');
      return;
    }
    toast.success('Employee created successfully');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      employeeId: '',
      department: '',
      supervisor: '',
      weeklyHours: '40',
      vacationDays: '30',
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Create New Employee
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>First Name *</Label>
            <Input
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="John"
            />
          </div>

          <div className="space-y-2">
            <Label>Last Name *</Label>
            <Input
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email *</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="john.doe@stc.com"
          />
        </div>

        <div className="space-y-2">
          <Label>Employee ID</Label>
          <Input
            value={formData.employeeId}
            onChange={(e) => handleChange('employeeId', e.target.value)}
            placeholder="EMP-001"
          />
        </div>

        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Supervisor</Label>
          <Select value={formData.supervisor} onValueChange={(value) => handleChange('supervisor', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select supervisor" />
            </SelectTrigger>
            <SelectContent>
              {supervisors.map((supervisor) => (
                <SelectItem key={supervisor.id} value={supervisor.id}>
                  {supervisor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Weekly Hours</Label>
            <Input
              type="number"
              value={formData.weeklyHours}
              onChange={(e) => handleChange('weeklyHours', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Vacation Days/Year</Label>
            <Input
              type="number"
              value={formData.vacationDays}
              onChange={(e) => handleChange('vacationDays', e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleSubmit} className="w-full h-11">
          Create Employee
        </Button>
      </CardContent>
    </Card>
  );
}

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

// Departments mirror server enum in models/employee.ts
const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Executive'];

type SupervisorOption = { id: number; name: string };

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
  const [supervisors, setSupervisors] = useState<SupervisorOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/employee');
        if (!res.ok) throw new Error(`Failed to load employees: ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        // supervisors are employees with role === 'manager'
        const mgrs: SupervisorOption[] = data
          .filter((e: any) => e.role === 'manager')
          .map((e: any) => ({ id: e.id, name: `${e.name}${e.surname ? ' ' + e.surname : ''}` }));
        setSupervisors(mgrs);

        // compute next employee id default
        const maxId = data.reduce((acc: number, e: any) => Math.max(acc, Number(e.id ?? 0)), 0);
        const next = maxId + 1;
        setFormData((prev) => ({ ...prev, employeeId: String(next) }));
      } catch (err) {
        console.error(err);
        toast.error('Could not load supervisors');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in required fields');
      return;
    }

    const payload: any = {
      name: formData.firstName,
      surname: formData.lastName,
      username: formData.email.split('@')[0],
      password: 'password123',
      vacationDays: Number(formData.vacationDays) || 25,
      flexAccount: 0,
      role: 'employee',
      flexMonthly: null,
      vacationDaysUsed: 0,
      vacationDaysPending: 0,
      hoursMonthly: Number(formData.weeklyHours) * 4 || 160,
      hoursWorked: 0,
      department: formData.department || undefined,
      managerId: formData.supervisor ? Number(formData.supervisor) : null,
    };

    // If user provided an employeeId that's a number, include it to allow explicit id
    const explicitId = Number(formData.employeeId);
    if (!isNaN(explicitId) && explicitId > 0) payload.id = explicitId;

    try {
      const res = await fetch('/api/employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to create employee: ${res.status}`);
      }
      const created = await res.json();
      toast.success('Employee created successfully');

      // reset form and set next id
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        employeeId: String((explicitId || Number(created.id) || 0) + 1),
        department: '',
        supervisor: '',
        weeklyHours: '40',
        vacationDays: '30',
      });

      // refresh supervisors list in case a manager was added
      try {
        const r = await fetch('/api/employee');
        if (r.ok) {
          const data = await r.json();
          const mgrs: SupervisorOption[] = data
            .filter((e: any) => e.role === 'manager')
            .map((e: any) => ({ id: e.id, name: `${e.name}${e.surname ? ' ' + e.surname : ''}` }));
          setSupervisors(mgrs);
        }
      } catch {}
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to create employee');
    }
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
          <Select value={formData.department} onValueChange={(value: string) => handleChange('department', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Supervisor</Label>
          <Select value={formData.supervisor} onValueChange={(value: string) => handleChange('supervisor', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select supervisor" />
            </SelectTrigger>
            <SelectContent>
              {supervisors.map((supervisor) => (
                <SelectItem key={supervisor.id} value={String(supervisor.id)}>
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

        <Button onClick={handleSubmit} className="w-full h-11" disabled={loading}>
          Create Employee
        </Button>
      </CardContent>
    </Card>
  );
}

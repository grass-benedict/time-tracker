import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Users, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface EmployeeAPI {
  id: number;
  name: string;
  surname?: string;
  flexAccount?: number;
  managerId?: number | null;
}

export function TeamOverview({ managerId }: { managerId?: number | undefined }) {
  const [members, setMembers] = useState<EmployeeAPI[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (managerId === undefined) return;
      setLoading(true);
      try {
        const res = await fetch('/api/employee');
        if (!res.ok) throw new Error(`Failed to fetch employees: ${res.status}`);
        const data: EmployeeAPI[] = await res.json();
        const filtered = data.filter((e) => e.managerId === managerId);
        if (mounted) setMembers(filtered);
      } catch (err) {
        console.error(err);
        toast.error('Could not load team members');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [managerId]);

  const totalEmployees = members.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-lg bg-accent border border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl text-foreground">{totalEmployees}</div>
              <div className="text-sm text-muted-foreground mt-1">Team Members</div>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl text-blue-700 dark:text-blue-400">{totalEmployees}</div>
              <div className="text-sm text-muted-foreground mt-1">Working Today</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl text-green-700 dark:text-green-400">0</div>
              <div className="text-sm text-muted-foreground mt-1">On Vacation</div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl text-amber-700 dark:text-amber-400">0</div>
              <div className="text-sm text-muted-foreground mt-1">Pending Approvals</div>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Status
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading team members…</div>
            ) : members.length === 0 ? (
              <div className="text-sm text-muted-foreground">No direct reports found.</div>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex justify-between items-center py-3 px-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        {member.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Flex: {member.flexAccount && member.flexAccount > 0 ? '+' : ''}{member.flexAccount ?? 0}h
                      </div>
                    </div>
                  </div>
                  <Badge variant="default">Member</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TeamOverview;

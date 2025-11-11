import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface VacationRequest {
  id: string;
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  days: number;
  approvedBy?: number | null;
  approvedStatus: 'pending' | 'approved' | 'denied';
  note?: string | null;
}

export function VacationApproval({ managerId }: { managerId?: number | undefined }) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VacationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!managerId) return;
      setLoading(true);
      try {
        // fetch pending requests and filter by approvedBy (manager)
        const res = await fetch('/api/leaveRequests?status=pending');
        if (!res.ok) throw new Error(`Failed to fetch leave requests: ${res.status}`);
        const data: any[] = await res.json();
        const pending = data.filter((r) => r.approvedBy === managerId && r.approvedStatus === 'pending');

        const msPerDay = 24 * 60 * 60 * 1000;
        const calcDays = (startRaw: any, endRaw: any, fallback = 0) => {
          try {
            const s = new Date(startRaw);
            const e = new Date(endRaw);
            if (isNaN(s.getTime()) || isNaN(e.getTime())) return fallback;
            // inclusive days: difference in days + 1
            const diff = Math.round((e.getTime() - s.getTime()) / msPerDay) + 1;
            return diff >= 0 ? diff : fallback;
          } catch {
            return fallback;
          }
        };

        // initial mapping; leave employeeName undefined when not provided so we can fetch it
        let mapped = pending.map((r) => {
          const days = calcDays(r.startDate, r.endDate, r.days ?? 0);
          const startDateStr = r.startDate ? new Date(r.startDate).toISOString().slice(0, 10) : String(r.startDate ?? '');
          const endDateStr = r.endDate ? new Date(r.endDate).toISOString().slice(0, 10) : String(r.endDate ?? '');
          return {
            id: String(r.id),
            employeeId: r.employeeId,
            employeeName: r.employeeName ?? undefined,
            startDate: startDateStr,
            endDate: endDateStr,
            days,
            approvedBy: r.approvedBy,
            approvedStatus: r.approvedStatus ?? 'pending',
            note: r.note ?? null,
          } as VacationRequest;
        });

        // fetch names for any entries missing employeeName
        const idsToFetch = Array.from(new Set(mapped.filter((m) => !m.employeeName).map((m) => m.employeeId)));
        if (idsToFetch.length > 0) {
          const nameMap: Record<number, string> = {};
          await Promise.all(
            idsToFetch.map(async (id) => {
              try {
                const rres = await fetch(`/api/employee/${id}`);
                if (!rres.ok) return;
                const emp = await rres.json();
                nameMap[id] = `${emp.name}${emp.surname ? ' ' + emp.surname : ''}`;
              } catch (e) {
                // ignore individual failures
              }
            })
          );

          mapped = mapped.map((m) => ({
            ...m,
            employeeName: m.employeeName ?? nameMap[m.employeeId] ?? `Employee ${m.employeeId}`,
          }));
        }

        if (mounted) setRequests(mapped);
      } catch (err) {
        console.error(err);
        toast.error('Could not load vacation requests');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [managerId]);

  const handleApprove = async (req: VacationRequest) => {
    try {
      const res = await fetch(`/api/leaveRequests/${req.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedStatus: 'approved' }),
      });
      if (!res.ok) throw new Error(`Failed to approve: ${res.status}`);
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      toast.success(`Vacation approved for ${req.employeeName}`);
    } catch (err) {
      console.error(err);
      toast.error('Could not approve vacation request');
    }
  };

  const openRejectModal = (req: VacationRequest) => {
    setSelectedRequest(req);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    if (!selectedRequest) return;
    try {
      const res = await fetch(`/api/leaveRequests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedStatus: 'denied', note: rejectionReason }),
      });
      if (!res.ok) throw new Error(`Failed to reject: ${res.status}`);
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));
      toast.success(`Vacation rejected for ${selectedRequest.employeeName}`);
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (err) {
      console.error(err);
      toast.error('Could not reject vacation request');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            Pending Vacation Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="p-5 border rounded-lg space-y-3 bg-muted/30">
                <div className="flex justify-between items-start">
                  <div>
                    <div>{request.employeeName}</div>
                    <div className="text-sm text-muted-foreground">
                      {request.startDate} to {request.endDate}
                    </div>
                  </div>
                  <Badge variant="secondary">{request.approvedStatus}</Badge>
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Duration: </span>
                  <span>{request.days} days</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleApprove(request)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openRejectModal(request)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Vacation Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please provide a reason for rejecting this vacation request..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectSubmit}>
              <X className="h-4 w-4 mr-2" />
              Submit Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

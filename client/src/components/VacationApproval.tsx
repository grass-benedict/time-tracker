import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface VacationRequest {
  id: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
}

const mockRequests: VacationRequest[] = [
  {
    id: '1',
    employeeName: 'Anna Schmidt',
    startDate: '2025-11-10',
    endDate: '2025-11-14',
    days: 5,
    status: 'pending',
  },
  {
    id: '2',
    employeeName: 'Michael Weber',
    startDate: '2025-12-20',
    endDate: '2025-12-27',
    days: 6,
    status: 'pending',
  },
  {
    id: '3',
    employeeName: 'Lisa Müller',
    startDate: '2025-11-25',
    endDate: '2025-11-29',
    days: 5,
    status: 'pending',
  },
];

export function VacationApproval() {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{ id: string; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = (id: string, name: string) => {
    toast.success(`Vacation approved for ${name}`);
  };

  const openRejectModal = (id: string, name: string) => {
    setSelectedRequest({ id, name });
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    if (selectedRequest) {
      toast.error(`Vacation rejected for ${selectedRequest.name}: ${rejectionReason}`);
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
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
            {mockRequests.map((request) => (
              <div key={request.id} className="p-5 border rounded-lg space-y-3 bg-muted/30">
                <div className="flex justify-between items-start">
                  <div>
                    <div>{request.employeeName}</div>
                    <div className="text-sm text-muted-foreground">
                      {request.startDate} to {request.endDate}
                    </div>
                  </div>
                  <Badge variant="secondary">{request.status}</Badge>
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Duration: </span>
                  <span>{request.days} days</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleApprove(request.id, request.employeeName)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openRejectModal(request.id, request.employeeName)}
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

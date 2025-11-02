import express, { Router } from 'express';
import type { Request, Response } from 'express';
import LeaveRequest from '../models/leaveRequest.ts';
import { ValidationError, Op } from 'sequelize';

// Request body for creating a leave request
type CreateLeaveRequestBody = {
  employeeId: number;
  type: 'vacation' | 'sick';
  startDate: string | Date;
  endDate: string | Date;
  note?: string | null;
};

type UpdateLeaveRequestBody = Partial<CreateLeaveRequestBody> & {
  approvedStatus?: 'pending' | 'approved' | 'denied';
  approvedBy?: number | null;
};

type LeaveRequestParams = { id: string };

type LeaveRequestQuery = {
  employeeId?: string;
  type?: 'vacation' | 'sick';
  status?: 'pending' | 'approved' | 'denied';
  fromDate?: string;
  toDate?: string;
};

const router: Router = express.Router();

// GET all leave requests with optional filtering
router.get('/', async (req: Request<{}, {}, {}, LeaveRequestQuery>, res: Response) => {
  try {
    const { employeeId, type, status, fromDate, toDate } = req.query;
    const where: any = {};
    if (employeeId) where.employeeId = parseInt(employeeId);
    if (type) {
      if (!['vacation', 'sick'].includes(type)) return res.status(400).json({ message: 'Invalid type' });
      where.type = type;
    }
    if (status) {
      if (!['pending', 'approved', 'denied'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
      where.approvedStatus = status;
    }
    if (fromDate) where.startDate = { ...where.startDate, [Op.gte]: new Date(fromDate) };
    if (toDate) where.endDate = { ...where.endDate, [Op.lte]: new Date(toDate) };

    const requests = await LeaveRequest.findAll({ where, order: [['startDate', 'DESC']] });
    res.json(requests);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message });
  }
});

// GET single leave request
router.get('/:id', async (req: Request<LeaveRequestParams>, res: Response) => {
  try {
    const reqRec = await LeaveRequest.findByPk(req.params.id);
    if (reqRec) res.json(reqRec);
    else res.status(404).json({ message: 'Leave request not found' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message });
  }
});

// GET leave requests for an employee
router.get('/employee/:employeeId', async (req: Request<{ employeeId: string }>, res: Response) => {
  try {
    const requests = await LeaveRequest.findAll({ where: { employeeId: parseInt(req.params.employeeId) }, order: [['startDate', 'DESC']] });
    res.json(requests);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message });
  }
});

// POST create leave request
router.post('/', async (req: Request<{}, {}, CreateLeaveRequestBody>, res: Response) => {
  try {
    const body = {
      ...req.body,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
    };

    if (!['vacation', 'sick'].includes(body.type)) return res.status(400).json({ message: 'Invalid leave type' });
    if (body.endDate < body.startDate) return res.status(400).json({ message: 'End date cannot be before start date' });

    const newReq = await LeaveRequest.create(body as any);
    res.status(201).json(newReq);
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  }
});

// PUT update leave request (including approval)
router.put('/:id', async (req: Request<LeaveRequestParams, {}, UpdateLeaveRequestBody>, res: Response) => {
  try {
    const body: any = { ...req.body };
    if (body.startDate) body.startDate = new Date(body.startDate);
    if (body.endDate) body.endDate = new Date(body.endDate);
    if (body.type && !['vacation', 'sick'].includes(body.type)) return res.status(400).json({ message: 'Invalid leave type' });
    if (body.approvedStatus && !['pending', 'approved', 'denied'].includes(body.approvedStatus)) return res.status(400).json({ message: 'Invalid approvedStatus' });
    if (body.startDate && body.endDate && body.endDate < body.startDate) return res.status(400).json({ message: 'End date cannot be before start date' });

    const [updateCount] = await LeaveRequest.update(body, { where: { id: req.params.id } });
    if (updateCount > 0) {
      const updated = await LeaveRequest.findByPk(req.params.id);
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Leave request not found' });
    }
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
    }
  }
});

// DELETE leave request
router.delete('/:id', async (req: Request<LeaveRequestParams>, res: Response) => {
  try {
    const deleted = await LeaveRequest.destroy({ where: { id: req.params.id } });
    if (deleted > 0) res.json({ message: 'Leave request deleted' });
    else res.status(404).json({ message: 'Leave request not found' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message });
  }
});

export default router;

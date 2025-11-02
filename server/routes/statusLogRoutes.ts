import express, { Router } from 'express';
import type { Request, Response } from 'express';
import StatusLog from '../models/statusLog.ts';
import { ValidationError, Op } from 'sequelize';

// Type for creating a new status log
type CreateStatusLogBody = {
    employeeId: number;
    statusType: string;
    startDate: string | Date;
    endDate: string | Date;
    notes?: string;
};

// Type for updating an existing status log
type UpdateStatusLogBody = Partial<CreateStatusLogBody>;

// Type-safe request parameters
type StatusLogParams = {
    id: string;
};

// Type-safe query parameters for filtering
type StatusLogQuery = {
    employeeId?: string;
    statusType?: string;
    fromDate?: string;
    toDate?: string;
};

const router: Router = express.Router();

// GET all status logs with optional filtering
router.get('/', async (req: Request<{}, {}, {}, StatusLogQuery>, res: Response) => {
    try {
        const { employeeId, statusType, fromDate, toDate } = req.query;
        
        // Build query conditions
        const where: any = {};
        if (employeeId) where.employeeId = parseInt(employeeId);
        if (statusType) where.statusType = statusType;
        if (fromDate) where.startDate = { [Op.gte]: new Date(fromDate) };
        if (toDate) where.endDate = { [Op.lte]: new Date(toDate) };

        const statusLogs = await StatusLog.findAll({ where });
        res.json(statusLogs);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({ message });
    }
});

// GET single status log by ID
router.get('/:id', async (req: Request<StatusLogParams>, res: Response) => {
    try {
        const statusLog = await StatusLog.findByPk(req.params.id);
        if (statusLog) {
            res.json(statusLog);
        } else {
            res.status(404).json({ message: 'Status log not found' });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({ message });
    }
});

// GET status logs by employee ID
router.get('/employee/:employeeId', async (req: Request<{ employeeId: string }>, res: Response) => {
    try {
        const statusLogs = await StatusLog.findAll({
            where: { employeeId: parseInt(req.params.employeeId) },
            order: [['startDate', 'DESC']]
        });
        res.json(statusLogs);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({ message });
    }
});

// POST new status log
router.post('/', async (req: Request<{}, {}, CreateStatusLogBody>, res: Response) => {
    try {
        // Ensure dates are parsed correctly
        const body = {
            ...req.body,
            startDate: new Date(req.body.startDate),
            endDate: new Date(req.body.endDate)
        };

        // Validate dates
        if (body.endDate < body.startDate) {
            return res.status(400).json({ 
                message: 'End date cannot be before start date' 
            });
        }

        const statusLog = await StatusLog.create(body);
        res.status(201).json(statusLog);
    } catch (error: unknown) {
        if (error instanceof ValidationError) {
            res.status(400).json({ 
                message: 'Validation error', 
                details: error.errors.map(err => err.message) 
            });
        } else {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ message });
        }
    }
});

// PUT update status log
router.put('/:id', async (req: Request<StatusLogParams, {}, UpdateStatusLogBody>, res: Response) => {
    try {
        const body: any = { ...req.body };
        
        // Parse dates if provided
        if (body.startDate) body.startDate = new Date(body.startDate);
        if (body.endDate) body.endDate = new Date(body.endDate);

        // Validate dates if both are present
        if (body.startDate && body.endDate && body.endDate < body.startDate) {
            return res.status(400).json({ 
                message: 'End date cannot be before start date' 
            });
        }

        const [updateCount] = await StatusLog.update(body, {
            where: { id: req.params.id }
        });

        if (updateCount > 0) {
            const updatedLog = await StatusLog.findByPk(req.params.id);
            res.json(updatedLog);
        } else {
            res.status(404).json({ message: 'Status log not found' });
        }
    } catch (error: unknown) {
        if (error instanceof ValidationError) {
            res.status(400).json({ 
                message: 'Validation error', 
                details: error.errors.map(err => err.message) 
            });
        } else {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ message });
        }
    }
});

// DELETE status log
router.delete('/:id', async (req: Request<StatusLogParams>, res: Response) => {
    try {
        const deleteCount = await StatusLog.destroy({
            where: { id: req.params.id }
        });
        
        if (deleteCount > 0) {
            res.json({ message: 'Status log deleted' });
        } else {
            res.status(404).json({ message: 'Status log not found' });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({ message });
    }
});

export default router;

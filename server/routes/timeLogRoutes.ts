import express, { Router } from 'express';
import type { Request, Response } from 'express';
import TimeLog from '../models/timeLog.ts';
import { ValidationError, Op } from 'sequelize';

// Valid event types as defined in the DB model
type EventType = 'IN' | 'OUT';

// Type for creating a new time log
type CreateTimeLogBody = {
    employeeId: number;
    clockTime: string | Date;
    eventType: EventType;
};

// Type for updating an existing time log
type UpdateTimeLogBody = Partial<CreateTimeLogBody>;

// Type-safe request parameters
type TimeLogParams = {
    id: string;
};

// Type-safe query parameters for filtering
type TimeLogQuery = {
    employeeId?: string;
    eventType?: EventType;
    fromDate?: string;
    toDate?: string;
};

const router: Router = express.Router();

// GET all time logs with filtering options
router.get('/', async (req: Request<{}, {}, {}, TimeLogQuery>, res: Response) => {
    try {
        const { employeeId, eventType, fromDate, toDate } = req.query;

        // Build query conditions
        const where: any = {};
        if (employeeId) where.employeeId = parseInt(employeeId);
        if (eventType) {
            // Only accept valid event types
            if (!['IN', 'OUT'].includes(eventType)) {
                return res.status(400).json({ message: 'Invalid eventType query parameter' });
            }
            where.eventType = eventType;
        }
        if (fromDate) where.clockTime = { ...where.clockTime, [Op.gte]: new Date(fromDate) };
        if (toDate) where.clockTime = { ...where.clockTime, [Op.lte]: new Date(toDate) };

        const timeLogs = await TimeLog.findAll({
            where,
            order: [['clockTime', 'DESC']]
        });
        res.json(timeLogs);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({ message });
    }
});

// GET single time log by ID
router.get('/:id', async (req: Request<TimeLogParams>, res: Response) => {
    try {
        const timeLog = await TimeLog.findByPk(req.params.id);
        if (timeLog) {
            res.json(timeLog);
        } else {
            res.status(404).json({ message: 'Time log not found' });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({ message });
    }
});

// GET time logs by employee ID
router.get('/employee/:employeeId', async (req: Request<{ employeeId: string }>, res: Response) => {
    try {
        const timeLogs = await TimeLog.findAll({
            where: { employeeId: parseInt(req.params.employeeId) },
            order: [['clockTime', 'DESC']]
        });
        res.json(timeLogs);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({ message });
    }
});

// GET employee's daily time logs
router.get('/employee/:employeeId/daily', async (req: Request<{ employeeId: string }, {}, {}, { date?: string }>, res: Response) => {
    try {
        const date = req.query.date ? new Date(req.query.date) : new Date();
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const timeLogs = await TimeLog.findAll({
            where: {
                employeeId: parseInt(req.params.employeeId),
                clockTime: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            },
            order: [['clockTime', 'ASC']]
        });

        res.json(timeLogs);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({ message });
    }
});

// POST new time log
router.post('/', async (req: Request<{}, {}, CreateTimeLogBody>, res: Response) => {
    try {
        // Parse the clock time
        const body = {
            ...req.body,
            clockTime: new Date(req.body.clockTime)
        };

        // Validate event type
        if (!['IN', 'OUT'].includes(body.eventType)) {
            return res.status(400).json({
                message: 'Invalid event type. Must be IN or OUT'
            });
        }

        const timeLog = await TimeLog.create(body);
        res.status(201).json(timeLog);
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

// PUT update time log
router.put('/:id', async (req: Request<TimeLogParams, {}, UpdateTimeLogBody>, res: Response) => {
    try {
        const body: any = { ...req.body };
        
        // Parse clock time if provided
        if (body.clockTime) {
            body.clockTime = new Date(body.clockTime);
        }

        // Validate event type if provided
        if (body.eventType && !['IN', 'OUT'].includes(body.eventType)) {
            return res.status(400).json({
                message: 'Invalid event type. Must be IN or OUT'
            });
        }

        const [updateCount] = await TimeLog.update(body, {
            where: { id: req.params.id }
        });

        if (updateCount > 0) {
            const updatedLog = await TimeLog.findByPk(req.params.id);
            res.json(updatedLog);
        } else {
            res.status(404).json({ message: 'Time log not found' });
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

// DELETE time log
router.delete('/:id', async (req: Request<TimeLogParams>, res: Response) => {
    try {
        const deleteCount = await TimeLog.destroy({
            where: { id: req.params.id }
        });
        
        if (deleteCount > 0) {
            res.json({ message: 'Time log deleted' });
        } else {
            res.status(404).json({ message: 'Time log not found' });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({ message });
    }
});

export default router;

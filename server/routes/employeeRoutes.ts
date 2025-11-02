import express, { Router } from 'express';
import type { Request, Response } from 'express';
import Employee from '../models/employee.ts';

type CreateEmployeeBody = {
    name: string;
    surname: string;
    username: string;
    password: string;
    vacationDays: number;
    flexAccount: number;
    role?: string;
}

type UpdateEmployeeBody = Partial<CreateEmployeeBody>;

type EmployeeCreationAttributes = Omit<CreateEmployeeBody, 'id'>;

const router: Router = express.Router();

// GET all employees
router.get('/', async (_req: Request, res: Response) => {
    try {
        const employees = await Employee.findAll();
        res.json(employees);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ message });
    }
});

// GET single employee by ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
    try {
        const employee = await Employee.findByPk(req.params.id);
        if (employee) {
            res.json(employee);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ message });
    }
});

// POST new employee
router.post('/', async (req: Request<{}, {}, CreateEmployeeBody>, res: Response) => {
    try {
        const newEmployee = await Employee.create(req.body as EmployeeCreationAttributes);
        res.status(201).json(newEmployee);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ message });
    }
});

// PUT update employee
router.put('/:id', async (req: Request<{ id: string }, {}, UpdateEmployeeBody>, res: Response) => {
    try {
        const [updateCount] = await Employee.update(req.body, {
            where: { id: req.params.id }
        });

        if (updateCount > 0) {
            const updatedEmployee = await Employee.findByPk(req.params.id);
            res.json(updatedEmployee);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ message });
    }
});

// DELETE employee
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
    try {
        const deleteCount = await Employee.destroy({
            where: { id: req.params.id }
        });
        
        if (deleteCount > 0) {
            res.json({ message: 'Employee deleted' });
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ message });
    }
});

export default router;
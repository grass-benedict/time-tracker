import express, { Router } from 'express';
import type { Request, Response } from 'express';
import Employee from '../models/employee.ts';

type CreateEmployeeBody = {
    name: string;
    surname: string;
    username: string;
    password: string;
    vacationDays?: number;
    flexAccount?: number;
    role?: 'employee' | 'manager' | 'hr' | 'admin' | null;
    flexMonthly?: number | null;
    vacationDaysUsed?: number;
    vacationDaysPending?: number;
    hoursMonthly?: number;
    hoursWorked?: number;
    department?: string;
    managerId?: number | null;
}

type UpdateEmployeeBody = Partial<CreateEmployeeBody>;

type EmployeeCreationAttributes = Omit<CreateEmployeeBody, 'id'>;

const router: Router = express.Router();

// GET all employees
router.get('/', async (_req: Request, res: Response) => {
    try {
        // exclude password so we don't leak hashed passwords to clients
        const employees = await Employee.findAll({ attributes: { exclude: ['password'] } });
        res.json(employees);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ message });
    }
});

// GET single employee by ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
    try {
        const employee = await Employee.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
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
    // Cast to any here because incoming payload may not have strictly all creation defaults/types
    const newEmployee = await Employee.create(req.body as any);
        // do not return password to client
        const safeEmployee = await Employee.findByPk(newEmployee.id, { attributes: { exclude: ['password'] } });
        res.status(201).json(safeEmployee);
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
            const updatedEmployee = await Employee.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
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
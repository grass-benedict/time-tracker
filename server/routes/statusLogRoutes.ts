// Deprecated: statusLogRoutes
// The status log data structure was replaced by leave requests. This file remains as a stub
// to avoid accidental runtime errors if something still imports it. All new functionality
// lives in leaveRequestRoutes.ts and is mounted at /api/leaveRequests.

import express, { Router } from 'express';
import type { Request, Response } from 'express';

const router: Router = express.Router();

// Respond with 410 Gone for any calls to signpost removal
router.use((_req: Request, res: Response) => {
  res.status(410).json({ message: 'statusLogRoutes has been removed; use /api/leaveRequests instead' });
});

export default router;

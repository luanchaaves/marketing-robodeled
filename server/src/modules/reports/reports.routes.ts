import { Router } from 'express';
import { reportsController } from './reports.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireMarketing } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => reportsController.getReport(req, res, next));
router.get('/export-csv', requireMarketing, (req, res, next) => reportsController.exportCSV(req, res, next));

export const reportsRoutes = router;

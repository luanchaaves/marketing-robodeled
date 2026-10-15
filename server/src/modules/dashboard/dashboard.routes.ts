import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => dashboardController.getDashboard(req, res, next));

export const dashboardRoutes = router;

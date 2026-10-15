import { Router } from 'express';
import { auditController } from './audit.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/', auditController.listLogs);

export const auditRoutes = router;

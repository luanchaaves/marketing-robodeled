import { Router } from 'express';
import { leadsController } from './leads.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireMarketing } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  createLeadActivitySchema,
  createLeadTaskSchema,
  importLeadsSchema,
} from './leads.schemas.js';

const router = Router();

router.use(authenticate);

// Queries
router.get('/', (req, res, next) => leadsController.listLeads(req, res, next));
router.get('/kanban', (req, res, next) => leadsController.getKanban(req, res, next));
router.get('/check-duplicates', (req, res, next) => leadsController.checkDuplicates(req, res, next));
router.get('/export-csv', requireMarketing, (req, res, next) => leadsController.exportCSV(req, res, next));
router.get('/:id', (req, res, next) => leadsController.getLeadById(req, res, next));

// Mutations (Marketing + Admin)
router.post(
  '/',
  requireMarketing,
  validate({ body: createLeadSchema }),
  (req, res, next) => leadsController.createLead(req, res, next)
);

router.post(
  '/import',
  requireMarketing,
  validate({ body: importLeadsSchema }),
  (req, res, next) => leadsController.importLeads(req, res, next)
);

router.put(
  '/:id',
  requireMarketing,
  validate({ body: updateLeadSchema }),
  (req, res, next) => leadsController.updateLead(req, res, next)
);

router.patch(
  '/:id/status',
  requireMarketing,
  validate({ body: updateLeadStatusSchema }),
  (req, res, next) => leadsController.updateStatus(req, res, next)
);

router.delete('/:id', requireMarketing, (req, res, next) => leadsController.deleteLead(req, res, next));

router.post(
  '/:id/activities',
  requireMarketing,
  validate({ body: createLeadActivitySchema }),
  (req, res, next) => leadsController.addActivity(req, res, next)
);

router.post(
  '/:id/tasks',
  requireMarketing,
  validate({ body: createLeadTaskSchema }),
  (req, res, next) => leadsController.createTask(req, res, next)
);

router.patch('/:id/tasks/:taskId/toggle', requireMarketing, (req, res, next) =>
  leadsController.toggleTask(req, res, next)
);

export const leadsRoutes = router;

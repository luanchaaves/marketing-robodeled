import { Router } from 'express';
import { automationsController } from './automations.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireAdmin, requireMarketing } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => automationsController.listRules(req, res, next));
router.get('/rules', (req, res, next) => automationsController.listRules(req, res, next));
router.get('/:id', (req, res, next) => automationsController.getRuleById(req, res, next));

router.post('/', requireMarketing, (req, res, next) => automationsController.createRule(req, res, next));
router.post('/rules', requireMarketing, (req, res, next) => automationsController.createRule(req, res, next));
router.put('/:id', requireMarketing, (req, res, next) => automationsController.updateRule(req, res, next));
router.put('/rules/:id', requireMarketing, (req, res, next) => automationsController.updateRule(req, res, next));
router.put('/rules/:id/toggle', requireMarketing, (req, res, next) => automationsController.updateRule(req, res, next));
router.delete('/:id', requireAdmin, (req, res, next) => automationsController.deleteRule(req, res, next));
router.delete('/rules/:id', requireAdmin, (req, res, next) => automationsController.deleteRule(req, res, next));
router.post('/:id/test', requireMarketing, (req, res, next) => automationsController.testTrigger(req, res, next));
router.post('/rules/:id/test', requireMarketing, (req, res, next) => automationsController.testTrigger(req, res, next));

export const automationsRoutes = router;

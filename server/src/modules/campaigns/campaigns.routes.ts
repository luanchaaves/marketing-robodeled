import { Router } from 'express';
import { campaignsController } from './campaigns.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireMarketing } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  createCampaignSchema,
  updateCampaignSchema,
  logCampaignExpenseSchema,
} from './campaigns.schemas.js';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => campaignsController.listCampaigns(req, res, next));
router.get('/:id', (req, res, next) => campaignsController.getCampaignById(req, res, next));

router.post(
  '/',
  requireMarketing,
  validate({ body: createCampaignSchema }),
  (req, res, next) => campaignsController.createCampaign(req, res, next)
);

router.put(
  '/:id',
  requireMarketing,
  validate({ body: updateCampaignSchema }),
  (req, res, next) => campaignsController.updateCampaign(req, res, next)
);

router.post(
  '/:id/expenses',
  requireMarketing,
  validate({ body: logCampaignExpenseSchema }),
  (req, res, next) => campaignsController.logExpense(req, res, next)
);

router.delete('/:id', requireMarketing, (req, res, next) =>
  campaignsController.deleteCampaign(req, res, next)
);

export const campaignsRoutes = router;

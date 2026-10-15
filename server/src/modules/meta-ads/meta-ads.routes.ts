import { Router } from 'express';
import { metaAdsController } from './meta-ads.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireAdmin, requireMarketing } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/status', (req, res, next) => metaAdsController.getStatus(req, res, next));
router.get('/metrics', (req, res, next) => metaAdsController.getTrafficMetrics(req, res, next));

// Actions
router.post('/sync', requireMarketing, (req, res, next) => metaAdsController.triggerSync(req, res, next));
router.post('/connect', requireAdmin, (req, res, next) => metaAdsController.connect(req, res, next));
router.post('/disconnect', requireAdmin, (req, res, next) => metaAdsController.disconnect(req, res, next));

export const metaAdsRoutes = router;

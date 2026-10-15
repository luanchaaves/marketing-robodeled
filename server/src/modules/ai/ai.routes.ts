import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireMarketing } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.post('/generate-ideas', requireMarketing, (req, res, next) =>
  aiController.generateIdeas(req, res, next)
);

router.post('/generate-captions', requireMarketing, (req, res, next) =>
  aiController.generateCaptions(req, res, next)
);

router.post('/summarize-campaign', requireMarketing, (req, res, next) =>
  aiController.summarizeCampaign(req, res, next)
);

export const aiRoutes = router;

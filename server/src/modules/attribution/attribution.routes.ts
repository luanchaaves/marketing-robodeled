import { Router } from 'express';
import { attributionController } from './attribution.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/leads/:leadId', attributionController.getLeadAttribution);
router.post('/build-link', attributionController.buildUtmLink);

export const attributionRoutes = router;

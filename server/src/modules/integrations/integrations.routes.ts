import { Router } from 'express';
import { integrationsController } from './integrations.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { configureIntegrationSchema } from './integrations.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', integrationsController.listIntegrations);

router.post(
  '/configure',
  requireRole('ADMIN'),
  validate({ body: configureIntegrationSchema }),
  integrationsController.configure
);

router.delete(
  '/:provider',
  requireRole('ADMIN'),
  integrationsController.disconnect
);

export const integrationsRoutes = router;

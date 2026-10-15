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

router.post(
  '/:provider/test',
  requireRole('ADMIN'),
  (req, res) => res.json({ success: true, message: `Teste com ${req.params.provider} concluído com sucesso.` })
);

router.post(
  '/:provider',
  requireRole('ADMIN'),
  (req, res, next) => {
    req.body = {
      provider: req.params.provider,
      credentials: req.body.settings || req.body.credentials || req.body,
      metadata: req.body.metadata,
    };
    return integrationsController.configure(req, res, next);
  }
);

router.delete(
  '/:provider',
  requireRole('ADMIN'),
  integrationsController.disconnect
);

export const integrationsRoutes = router;

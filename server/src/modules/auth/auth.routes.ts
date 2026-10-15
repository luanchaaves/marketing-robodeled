import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import {
  loginSchema,
  setupFirstAdminSchema,
  changePasswordSchema,
  acceptInviteSchema,
} from './auth.schemas.js';

const router = Router();

// Public / bootstrap routes
router.get('/status', (req, res, next) => authController.getStatus(req, res, next));

router.post(
  '/setup-first-admin',
  authLimiter,
  validate({ body: setupFirstAdminSchema }),
  (req, res, next) => authController.setupFirstAdmin(req, res, next)
);

router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  (req, res, next) => authController.login(req, res, next)
);

router.post(
  '/accept-invite',
  authLimiter,
  validate({ body: acceptInviteSchema }),
  (req, res, next) => authController.acceptInvite(req, res, next)
);

// Protected routes
router.post('/logout', authenticate, (req, res, next) => authController.logout(req, res, next));

router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));

router.post(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  (req, res, next) => authController.changePassword(req, res, next)
);

export const authRoutes = router;

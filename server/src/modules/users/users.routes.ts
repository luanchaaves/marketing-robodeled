import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  createInviteSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from './users.schemas.js';

const router = Router();

router.use(authenticate);

// Authenticated users can list team members
router.get('/', (req, res, next) => usersController.listUsers(req, res, next));

// Admin only actions
router.get('/invites', requireAdmin, (req, res, next) => usersController.listInvites(req, res, next));

router.post(
  '/invites',
  requireAdmin,
  validate({ body: createInviteSchema }),
  (req, res, next) => usersController.createInvite(req, res, next)
);

router.post(
  '/invite',
  requireAdmin,
  validate({ body: createInviteSchema }),
  (req, res, next) => usersController.createInvite(req, res, next)
);

router.delete('/invites/:inviteId', requireAdmin, (req, res, next) =>
  usersController.revokeInvite(req, res, next)
);

router.patch(
  '/:userId/role',
  requireAdmin,
  validate({ body: updateUserRoleSchema }),
  (req, res, next) => usersController.updateUserRole(req, res, next)
);

router.put(
  '/:userId/role',
  requireAdmin,
  validate({ body: updateUserRoleSchema }),
  (req, res, next) => usersController.updateUserRole(req, res, next)
);

router.patch(
  '/:userId/status',
  requireAdmin,
  validate({ body: updateUserStatusSchema }),
  (req, res, next) => usersController.updateUserStatus(req, res, next)
);

router.post('/:userId/revoke-sessions', requireAdmin, (req, res, next) =>
  usersController.revokeUserSessions(req, res, next)
);

export const usersRoutes = router;

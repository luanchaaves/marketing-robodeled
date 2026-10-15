import { Router } from 'express';
import { instagramController } from './instagram.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireMarketing } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  createSocialPostSchema,
  updateSocialPostSchema,
  updatePostStatusSchema,
  createMediaAssetSchema,
} from './instagram.schemas.js';

const router = Router();

router.use(authenticate);

// Calendar & Posts
router.get('/posts', (req, res, next) => instagramController.listPosts(req, res, next));
router.get('/posts/:id', (req, res, next) => instagramController.getPostById(req, res, next));

router.post(
  '/posts',
  requireMarketing,
  validate({ body: createSocialPostSchema }),
  (req, res, next) => instagramController.createPost(req, res, next)
);

router.put(
  '/posts/:id',
  requireMarketing,
  validate({ body: updateSocialPostSchema }),
  (req, res, next) => instagramController.updatePost(req, res, next)
);

router.patch(
  '/posts/:id/status',
  requireMarketing,
  validate({ body: updatePostStatusSchema }),
  (req, res, next) => instagramController.updateStatus(req, res, next)
);

router.delete('/posts/:id', requireMarketing, (req, res, next) =>
  instagramController.deletePost(req, res, next)
);

// Media Library
router.get('/media', (req, res, next) => instagramController.listMedia(req, res, next));

router.post(
  '/media',
  requireMarketing,
  validate({ body: createMediaAssetSchema }),
  (req, res, next) => instagramController.createMedia(req, res, next)
);

router.delete('/media/:id', requireMarketing, (req, res, next) =>
  instagramController.deleteMedia(req, res, next)
);

export const instagramRoutes = router;

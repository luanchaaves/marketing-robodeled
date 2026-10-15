import { Request, Response, NextFunction } from 'express';
import { instagramService } from './instagram.service.js';
import { PostStatus, MediaCategory } from '@prisma/client';

export class InstagramController {
  async listPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        status: req.query.status as PostStatus,
        format: req.query.format as string,
      };
      const posts = await instagramService.listSocialPosts(filters);
      return res.json({ success: true, data: posts });
    } catch (error) {
      next(error);
    }
  }

  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const post = await instagramService.getSocialPostById(id);
      return res.json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await instagramService.createSocialPost(
        {
          ...req.body,
          scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined,
        },
        req.user?.id,
        req
      );
      return res.status(201).json({
        success: true,
        message: 'Publicação criada no calendário editorial!',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await instagramService.updateSocialPost(
        id,
        {
          ...req.body,
          scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined,
        },
        req.user?.id,
        req
      );
      return res.json({
        success: true,
        message: 'Publicação atualizada com sucesso.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, errorMessage } = req.body;
      const updated = await instagramService.updatePostStatus(id, status, errorMessage, req.user?.id, req);
      return res.json({
        success: true,
        message: `Status atualizado para ${status}.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await instagramService.deleteSocialPost(id, req.user?.id, req);
      return res.json({ success: true, message: 'Publicação excluída com sucesso.' });
    } catch (error) {
      next(error);
    }
  }

  // Media Library
  async listMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        category: req.query.category as MediaCategory,
        fileType: req.query.fileType as string,
        search: req.query.search as string,
      };
      const media = await instagramService.listMediaAssets(filters);
      return res.json({ success: true, data: media });
    } catch (error) {
      next(error);
    }
  }

  async createMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const media = await instagramService.createMediaAsset(req.body, req.user?.id, req);
      return res.status(201).json({
        success: true,
        message: 'Mídia adicionada à biblioteca com sucesso!',
        data: media,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await instagramService.deleteMediaAsset(id, req.user?.id, req);
      return res.json({ success: true, message: 'Mídia removida com sucesso.' });
    } catch (error) {
      next(error);
    }
  }
}

export const instagramController = new InstagramController();

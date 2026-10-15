import { prisma } from '../../database/prisma.js';
import { NotFoundError } from '../../utils/errors.js';
import { logAuditEvent } from '../../middleware/auditLogger.js';
import { PostStatus, MediaCategory, Prisma } from '@prisma/client';
import { Request } from 'express';

export class InstagramService {
  /**
   * List posts for Editorial Calendar with optional date range
   */
  async listSocialPosts(filters: {
    startDate?: string;
    endDate?: string;
    status?: PostStatus;
    format?: string;
  }) {
    const where: Prisma.SocialPostWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.scheduledAt = {};
      if (filters.startDate) where.scheduledAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.scheduledAt.lte = new Date(filters.endDate);
    }

    return prisma.socialPost.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      include: {
        campaign: { select: { id: true, name: true } },
        metricsDaily: {
          orderBy: { date: 'desc' },
          take: 7,
        },
      },
    });
  }

  async getSocialPostById(id: string) {
    const post = await prisma.socialPost.findUnique({
      where: { id },
      include: {
        campaign: true,
        metricsDaily: true,
      },
    });

    if (!post) throw new NotFoundError('Publicação não encontrada.');
    return post;
  }

  async createSocialPost(
    data: Prisma.SocialPostUncheckedCreateInput,
    userId?: string,
    req?: Request
  ) {
    const post = await prisma.socialPost.create({
      data,
    });

    await logAuditEvent({
      action: 'SOCIAL_POST_CREATED',
      entityType: 'SocialPost',
      entityId: post.id,
      userId,
      req,
      details: { title: post.title, format: post.format },
    });

    return post;
  }

  async updateSocialPost(
    id: string,
    data: Prisma.SocialPostUncheckedUpdateInput,
    userId?: string,
    req?: Request
  ) {
    const existing = await prisma.socialPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Publicação não encontrada.');

    const updated = await prisma.socialPost.update({
      where: { id },
      data,
    });

    await logAuditEvent({
      action: 'SOCIAL_POST_UPDATED',
      entityType: 'SocialPost',
      entityId: id,
      userId,
      req,
    });

    return updated;
  }

  async updatePostStatus(
    id: string,
    status: PostStatus,
    errorMessage?: string,
    userId?: string,
    req?: Request
  ) {
    const existing = await prisma.socialPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Publicação não encontrada.');

    const updated = await prisma.socialPost.update({
      where: { id },
      data: {
        status,
        errorMessage: status === 'FAILED' ? errorMessage : null,
        publishedAt: status === 'PUBLISHED' ? new Date() : existing.publishedAt,
      },
    });

    await logAuditEvent({
      action: 'SOCIAL_POST_STATUS_CHANGED',
      entityType: 'SocialPost',
      entityId: id,
      userId,
      req,
      details: { previousStatus: existing.status, newStatus: status },
    });

    return updated;
  }

  async deleteSocialPost(id: string, userId?: string, req?: Request) {
    const existing = await prisma.socialPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Publicação não encontrada.');

    await prisma.socialPost.delete({ where: { id } });

    await logAuditEvent({
      action: 'SOCIAL_POST_DELETED',
      entityType: 'SocialPost',
      entityId: id,
      userId,
      req,
      details: { title: existing.title },
    });
  }

  // ----------------------------------------------------
  // MEDIA ASSET LIBRARY
  // ----------------------------------------------------

  async listMediaAssets(filters: { category?: MediaCategory; fileType?: string; search?: string }) {
    const where: Prisma.MediaAssetWhereInput = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.fileType) {
      where.fileType = filters.fileType;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMediaAsset(
    data: Prisma.MediaAssetUncheckedCreateInput,
    userId?: string,
    req?: Request
  ) {
    const asset = await prisma.mediaAsset.create({
      data,
    });

    await logAuditEvent({
      action: 'MEDIA_ASSET_CREATED',
      entityType: 'MediaAsset',
      entityId: asset.id,
      userId,
      req,
      details: { title: asset.title, category: asset.category },
    });

    return asset;
  }

  async deleteMediaAsset(id: string, userId?: string, req?: Request) {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundError('Mídia não encontrada.');

    await prisma.mediaAsset.delete({ where: { id } });

    await logAuditEvent({
      action: 'MEDIA_ASSET_DELETED',
      entityType: 'MediaAsset',
      entityId: id,
      userId,
      req,
      details: { title: asset.title },
    });
  }
}

export const instagramService = new InstagramService();

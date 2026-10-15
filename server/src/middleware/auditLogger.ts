import { Request } from 'express';
import { prisma } from '../database/prisma.js';
import { logger } from '../utils/logger.js';
import { Prisma } from '@prisma/client';

export interface AuditLogOptions {
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Prisma.InputJsonValue;
  userId?: string;
  userEmail?: string;
  req?: Request;
}

export async function logAuditEvent(options: AuditLogOptions): Promise<void> {
  try {
    const { action, entityType, entityId, details, req } = options;

    const userId = options.userId || req?.user?.id;
    const userEmail = options.userEmail || req?.user?.email;
    const ipAddress = (req?.headers['x-forwarded-for'] as string) || req?.socket.remoteAddress || 'unknown';
    const userAgent = req?.headers['user-agent'] || 'unknown';

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userEmail: userEmail || null,
        action,
        entityType: entityType || null,
        entityId: entityId || null,
        ipAddress: typeof ipAddress === 'string' ? ipAddress.slice(0, 100) : null,
        userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 255) : null,
        details: details || undefined,
      },
    });
  } catch (error) {
    // Audit log should never crash the main transaction
    logger.error({ err: error, options }, 'Falha ao registrar log de auditoria');
  }
}

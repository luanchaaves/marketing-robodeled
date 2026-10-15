import { prisma } from '../../database/prisma.js';
import { generateSecureToken, hashToken } from '../../utils/security.js';
import { ConflictError, NotFoundError, ForbiddenError, ValidationError } from '../../utils/errors.js';
import { APP_CONSTANTS } from '../../config/constants.js';
import { logAuditEvent } from '../../middleware/auditLogger.js';
import { UserRole, UserStatus } from '@prisma/client';
import { Request } from 'express';

export class UsersService {
  async listUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listInvites() {
    return prisma.invite.findMany({
      where: {
        acceptedAt: null,
        revokedAt: null,
      },
      include: {
        invitedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInvite(params: {
    email: string;
    role: UserRole;
    invitedById: string;
    req?: Request;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: params.email },
    });

    if (existingUser) {
      throw new ConflictError('Já existe um usuário cadastrado com este e-mail.');
    }

    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + APP_CONSTANTS.INVITE_EXPIRATION_HOURS);

    // Revoke any previous pending invite for this email
    await prisma.invite.updateMany({
      where: {
        email: params.email,
        acceptedAt: null,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    const invite = await prisma.invite.create({
      data: {
        email: params.email,
        role: params.role,
        tokenHash,
        invitedById: params.invitedById,
        expiresAt,
      },
    });

    await logAuditEvent({
      action: 'USER_INVITED',
      entityType: 'Invite',
      entityId: invite.id,
      req: params.req,
      details: { email: params.email, role: params.role },
    });

    return {
      inviteId: invite.id,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
      inviteToken: rawToken, // Provided once to the admin to send securely
    };
  }

  async revokeInvite(inviteId: string, req?: Request) {
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      throw new NotFoundError('Convite não encontrado.');
    }

    await prisma.invite.update({
      where: { id: inviteId },
      data: { revokedAt: new Date() },
    });

    await logAuditEvent({
      action: 'INVITE_REVOKED',
      entityType: 'Invite',
      entityId: inviteId,
      req,
      details: { email: invite.email },
    });
  }

  async updateUserRole(targetUserId: string, newRole: UserRole, currentUserId: string, req?: Request) {
    if (targetUserId === currentUserId) {
      throw new ForbiddenError('Você não pode alterar seu próprio perfil.');
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

    await logAuditEvent({
      action: 'USER_ROLE_CHANGED',
      entityType: 'User',
      entityId: targetUserId,
      req,
      details: { oldRole: user.role, newRole },
    });

    return updated;
  }

  async updateUserStatus(targetUserId: string, newStatus: UserStatus, currentUserId: string, req?: Request) {
    if (targetUserId === currentUserId) {
      throw new ForbiddenError('Você não pode bloquear ou alterar o status da sua própria conta.');
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { status: newStatus },
    });

    // If blocked, immediately revoke all active sessions
    if (newStatus === 'BLOCKED') {
      await prisma.session.updateMany({
        where: { userId: targetUserId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    await logAuditEvent({
      action: 'USER_STATUS_CHANGED',
      entityType: 'User',
      entityId: targetUserId,
      req,
      details: { oldStatus: user.status, newStatus },
    });

    return updated;
  }

  async revokeUserSessions(targetUserId: string, req?: Request) {
    await prisma.session.updateMany({
      where: { userId: targetUserId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await logAuditEvent({
      action: 'USER_SESSIONS_REVOKED',
      entityType: 'User',
      entityId: targetUserId,
      req,
    });
  }
}

export const usersService = new UsersService();

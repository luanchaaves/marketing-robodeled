import { prisma } from '../../database/prisma.js';
import { hashPassword, verifyPassword, generateSecureToken, hashToken } from '../../utils/security.js';
import { UnauthorizedError, ConflictError, ValidationError, ForbiddenError } from '../../utils/errors.js';
import { APP_CONSTANTS } from '../../config/constants.js';
import { logAuditEvent } from '../../middleware/auditLogger.js';
import { Request } from 'express';

export class AuthService {
  /**
   * Checks if an admin already exists in the platform
   */
  async hasAdmin(): Promise<boolean> {
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN', status: 'ACTIVE' },
    });
    return adminCount > 0;
  }

  /**
   * Setup First Administrator with verification token check
   */
  async setupFirstAdmin(params: {
    name: string;
    email: string;
    password: string;
    setupToken: string;
    req?: Request;
  }) {
    const hasAdmin = await this.hasAdmin();
    if (hasAdmin) {
      throw new ForbiddenError('O administrador inicial da plataforma já foi configurado.');
    }

    // Verify token against SystemSetting or env
    const setupSetting = await prisma.systemSetting.findUnique({
      where: { key: 'FIRST_ADMIN_SETUP_TOKEN' },
    });

    if (setupSetting && setupSetting.value !== params.setupToken) {
      throw new UnauthorizedError('Token de inicialização inválido.');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: params.email },
    });

    if (existingUser) {
      throw new ConflictError('Este e-mail já está em uso.');
    }

    const passwordHash = await hashPassword(params.password);

    const user = await prisma.user.create({
      data: {
        name: params.name,
        email: params.email,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    // Clean up setup token
    if (setupSetting) {
      await prisma.systemSetting.delete({
        where: { key: 'FIRST_ADMIN_SETUP_TOKEN' },
      });
    }

    await logAuditEvent({
      action: 'FIRST_ADMIN_CONFIGURED',
      entityType: 'User',
      entityId: user.id,
      userId: user.id,
      userEmail: user.email,
      req: params.req,
      details: { email: user.email, name: user.name },
    });

    return user;
  }

  /**
   * Authenticate user with Email and Password
   */
  async login(params: {
    email: string;
    password: string;
    ipAddress?: string;
    userAgent?: string;
    req?: Request;
  }) {
    const user = await prisma.user.findUnique({
      where: { email: params.email },
    });

    // Constant-time check or generic failure to prevent user enumeration
    if (!user) {
      await logAuditEvent({
        action: 'LOGIN_FAILED',
        userEmail: params.email,
        req: params.req,
        details: { reason: 'USER_NOT_FOUND' },
      });
      throw new UnauthorizedError('E-mail ou senha incorretos.');
    }

    if (user.status === 'BLOCKED') {
      await logAuditEvent({
        action: 'LOGIN_FAILED',
        userId: user.id,
        userEmail: user.email,
        req: params.req,
        details: { reason: 'USER_BLOCKED' },
      });
      throw new ForbiddenError('Sua conta está bloqueada. Entre em contato com o administrador.');
    }

    const isPasswordValid = await verifyPassword(user.passwordHash, params.password);
    if (!isPasswordValid) {
      await logAuditEvent({
        action: 'LOGIN_FAILED',
        userId: user.id,
        userEmail: user.email,
        req: params.req,
        details: { reason: 'INVALID_PASSWORD' },
      });
      throw new UnauthorizedError('E-mail ou senha incorretos.');
    }

    // Generate high-entropy session token
    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + APP_CONSTANTS.SESSION_EXPIRATION_DAYS);

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        ipAddress: params.ipAddress ? params.ipAddress.slice(0, 100) : null,
        userAgent: params.userAgent ? params.userAgent.slice(0, 255) : null,
        expiresAt,
      },
    });

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await logAuditEvent({
      action: 'LOGIN_SUCCESS',
      userId: user.id,
      userEmail: user.email,
      req: params.req,
      details: { sessionId: session.id },
    });

    return {
      token: rawToken,
      expiresAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * Log out active session
   */
  async logout(sessionId: string, userId?: string, req?: Request) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    await logAuditEvent({
      action: 'LOGOUT',
      userId,
      req,
      details: { sessionId },
    });
  }

  /**
   * Change current user's password
   */
  async changePassword(userId: string, currentPass: string, newPass: string, req?: Request) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado.');
    }

    const isValid = await verifyPassword(user.passwordHash, currentPass);
    if (!isValid) {
      throw new ValidationError('A senha atual está incorreta.');
    }

    const newHash = await hashPassword(newPass);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    // Invalidate all sessions except current one or all for safety
    await prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await logAuditEvent({
      action: 'PASSWORD_CHANGED',
      userId: user.id,
      userEmail: user.email,
      req,
    });
  }

  /**
   * Accept an invitation and register account
   */
  async acceptInvite(params: {
    token: string;
    name: string;
    password: string;
    req?: Request;
  }) {
    const tokenHash = hashToken(params.token);

    const invite = await prisma.invite.findUnique({
      where: { tokenHash },
    });

    if (!invite) {
      throw new ValidationError('Convite não encontrado ou inválido.');
    }

    if (invite.acceptedAt) {
      throw new ValidationError('Este convite já foi utilizado.');
    }

    if (invite.revokedAt) {
      throw new ValidationError('Este convite foi revogado.');
    }

    if (new Date() > invite.expiresAt) {
      throw new ValidationError('Este convite está expirado.');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: invite.email },
    });

    if (existingUser) {
      throw new ConflictError('Já existe um usuário com este e-mail.');
    }

    const passwordHash = await hashPassword(params.password);

    const user = await prisma.user.create({
      data: {
        email: invite.email,
        name: params.name,
        passwordHash,
        role: invite.role,
        status: 'ACTIVE',
      },
    });

    await prisma.invite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });

    await logAuditEvent({
      action: 'INVITE_ACCEPTED',
      userId: user.id,
      userEmail: user.email,
      req: params.req,
      details: { inviteId: invite.id, role: user.role },
    });

    return user;
  }
}

export const authService = new AuthService();

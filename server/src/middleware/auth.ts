import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma.js';
import { hashToken } from '../utils/security.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { APP_CONSTANTS } from '../config/constants.js';
import { User, Session, UserRole, UserStatus } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl: string | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      session?: Session;
    }
  }
}

/**
 * Middleware to authenticate requests via HttpOnly cookie or Bearer header
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Get raw session token from Cookie or Authorization header
    let token = req.cookies?.[APP_CONSTANTS.SESSION_COOKIE_NAME];

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      throw new UnauthorizedError('Sessão não encontrada. Por favor, realize o login.');
    }

    // 2. Hash token to find session in DB
    const tokenHash = hashToken(token);

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: true,
      },
    });

    if (!session) {
      throw new UnauthorizedError('Sessão inválida ou expirada.');
    }

    // 3. Check if session was revoked
    if (session.revokedAt) {
      throw new UnauthorizedError('Sessão revogada.');
    }

    // 4. Check if session has expired
    if (new Date() > session.expiresAt) {
      throw new UnauthorizedError('Sessão expirada. Faça login novamente.');
    }

    // 5. Check if user is active
    if (session.user.status === 'BLOCKED') {
      throw new ForbiddenError('Esta conta de usuário foi bloqueada.');
    }

    // 6. Attach authenticated user and session to request
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      status: session.user.status,
      avatarUrl: session.user.avatarUrl,
    };
    req.session = session;

    next();
  } catch (error) {
    next(error);
  }
}

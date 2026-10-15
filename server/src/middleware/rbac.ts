import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 3,
  MARKETING: 2,
  READONLY: 1,
};

/**
 * Enforces minimum role requirement based on RBAC hierarchy
 */
export function requireRole(minimumRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Autenticação necessária.'));
    }

    const userRoleWeight = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredWeight = ROLE_HIERARCHY[minimumRole] || 0;

    if (userRoleWeight < requiredWeight) {
      return next(
        new ForbiddenError(
          `Acesso negado. Ação restrita a usuários com perfil ${minimumRole} ou superior.`
        )
      );
    }

    next();
  };
}

/**
 * Restrict strictly to Administrators
 */
export const requireAdmin = requireRole('ADMIN');

/**
 * Allow Admin and Marketing members
 */
export const requireMarketing = requireRole('MARKETING');

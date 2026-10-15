import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { env } from '../../config/env.js';
import { APP_CONSTANTS } from '../../config/constants.js';

export class AuthController {
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const hasAdmin = await authService.hasAdmin();
      return res.json({
        success: true,
        data: {
          hasAdmin,
          isAuthenticated: !!req.user,
          user: req.user || null,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async setupFirstAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, setupToken } = req.body;
      const user = await authService.setupFirstAdmin({
        name,
        email,
        password,
        setupToken,
        req,
      });

      return res.status(201).json({
        success: true,
        message: 'Administrador configurado com sucesso! Agora você pode realizar login.',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login({
        email,
        password,
        ipAddress,
        userAgent,
        req,
      });

      // Set secure HttpOnly cookie
      res.cookie(APP_CONSTANTS.SESSION_COOKIE_NAME, result.token, {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: 'lax',
        domain: env.COOKIE_DOMAIN || undefined,
        expires: result.expiresAt,
        path: '/',
      });

      return res.json({
        success: true,
        message: 'Autenticação realizada com sucesso.',
        data: {
          token: result.token,
          user: result.user,
          expiresAt: result.expiresAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.session) {
        await authService.logout(req.session.id, req.user?.id, req);
      }

      res.clearCookie(APP_CONSTANTS.SESSION_COOKIE_NAME, {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: 'lax',
        domain: env.COOKIE_DOMAIN || undefined,
        path: '/',
      });

      return res.json({
        success: true,
        message: 'Sessão encerrada com sucesso.',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      return res.json({
        success: true,
        data: {
          user: req.user,
          session: req.session ? { id: req.session.id, expiresAt: req.session.expiresAt } : null,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!req.user) return res.status(401).json({ success: false, message: 'Não autorizado' });

      await authService.changePassword(req.user.id, currentPassword, newPassword, req);

      res.clearCookie(APP_CONSTANTS.SESSION_COOKIE_NAME, {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: 'lax',
        path: '/',
      });

      return res.json({
        success: true,
        message: 'Senha alterada com sucesso. Faça login novamente com a nova senha.',
      });
    } catch (error) {
      next(error);
    }
  }

  async acceptInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, name, password } = req.body;
      const user = await authService.acceptInvite({
        token,
        name,
        password,
        req,
      });

      return res.status(201).json({
        success: true,
        message: 'Conta criada com sucesso! Faça login para acessar o sistema.',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service.js';
import { UserRole, UserStatus } from '@prisma/client';

export class UsersController {
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await usersService.listUsers();
      return res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async listInvites(req: Request, res: Response, next: NextFunction) {
    try {
      const invites = await usersService.listInvites();
      return res.json({ success: true, data: invites });
    } catch (error) {
      next(error);
    }
  }

  async createInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, role } = req.body;
      const invite = await usersService.createInvite({
        email,
        role: role as UserRole,
        invitedById: req.user!.id,
        req,
      });
      return res.status(201).json({
        success: true,
        message: 'Convite gerado com sucesso!',
        data: invite,
      });
    } catch (error) {
      next(error);
    }
  }

  async revokeInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const { inviteId } = req.params;
      await usersService.revokeInvite(inviteId, req);
      return res.json({ success: true, message: 'Convite revogado com sucesso.' });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const updated = await usersService.updateUserRole(userId, role as UserRole, req.user!.id, req);
      return res.json({
        success: true,
        message: 'Perfil de usuário atualizado com sucesso.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { status } = req.body;
      const updated = await usersService.updateUserStatus(userId, status as UserStatus, req.user!.id, req);
      return res.json({
        success: true,
        message: `Status do usuário alterado para ${status}.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async revokeUserSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      await usersService.revokeUserSessions(userId, req);
      return res.json({ success: true, message: 'Sessões do usuário revogadas com sucesso.' });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();

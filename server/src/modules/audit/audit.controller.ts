import { Request, Response, NextFunction } from 'express';
import { auditService } from './audit.service.js';

export class AuditController {
  async listLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
      const userId = req.query.userId as string | undefined;
      const action = req.query.action as string | undefined;
      const entityType = req.query.entityType as string | undefined;

      const result = await auditService.listLogs({ page, limit, userId, action, entityType });
      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();

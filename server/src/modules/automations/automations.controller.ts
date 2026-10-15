import { Request, Response, NextFunction } from 'express';
import { automationsService } from './automations.service.js';

export class AutomationsController {
  async listRules(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await automationsService.listRules();
      return res.json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  async getRuleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const rule = await automationsService.getRuleById(id);
      return res.json({ success: true, data: rule });
    } catch (error) {
      next(error);
    }
  }

  async createRule(req: Request, res: Response, next: NextFunction) {
    try {
      const rule = await automationsService.createRule(req.body, req.user?.id, req);
      return res.status(201).json({
        success: true,
        message: 'Regra de automação criada com sucesso!',
        data: rule,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await automationsService.updateRule(id, req.body, req.user?.id, req);
      return res.json({
        success: true,
        message: 'Regra de automação atualizada com sucesso.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await automationsService.deleteRule(id, req.user?.id, req);
      return res.json({ success: true, message: 'Regra de automação excluída.' });
    } catch (error) {
      next(error);
    }
  }

  async testTrigger(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await automationsService.executeRule(id, { test: true, timestamp: new Date() });
      return res.json({
        success: true,
        message: 'Teste de automação executado!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const automationsController = new AutomationsController();

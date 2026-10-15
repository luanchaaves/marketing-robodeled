import { Request, Response, NextFunction } from 'express';
import { campaignsService } from './campaigns.service.js';

export class CampaignsController {
  async listCampaigns(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await campaignsService.listCampaigns();
      return res.json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  async getCampaignById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const campaign = await campaignsService.getCampaignById(id);
      return res.json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  }

  async createCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignsService.createCampaign(
        {
          ...req.body,
          startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
          endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        },
        req.user?.id,
        req
      );
      return res.status(201).json({
        success: true,
        message: 'Campanha cadastrada com sucesso!',
        data: campaign,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await campaignsService.updateCampaign(
        id,
        {
          ...req.body,
          startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
          endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        },
        req.user?.id,
        req
      );
      return res.json({
        success: true,
        message: 'Campanha atualizada com sucesso.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async logExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      const updated = await campaignsService.logExpense(id, amount, req.user?.id, req);
      return res.json({
        success: true,
        message: 'Despesa registrada com sucesso.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await campaignsService.deleteCampaign(id, req.user?.id, req);
      return res.json({ success: true, message: 'Campanha excluída com sucesso.' });
    } catch (error) {
      next(error);
    }
  }
}

export const campaignsController = new CampaignsController();

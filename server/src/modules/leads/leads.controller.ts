import { Request, Response, NextFunction } from 'express';
import { leadsService } from './leads.service.js';
import { LeadStatus, SourceChannel } from '@prisma/client';

export class LeadsController {
  async listLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        search: req.query.search as string,
        status: req.query.status as LeadStatus,
        sourceChannel: req.query.sourceChannel as SourceChannel,
        campaignName: req.query.campaignName as string,
        assignedToUserId: req.query.assignedToUserId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 25,
        orderBy: req.query.orderBy as string,
        orderDir: req.query.orderDir as 'asc' | 'desc',
      };

      const result = await leadsService.listLeads(filters);
      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getKanban(req: Request, res: Response, next: NextFunction) {
    try {
      const board = await leadsService.getKanbanBoard();
      return res.json({ success: true, data: board });
    } catch (error) {
      next(error);
    }
  }

  async getLeadById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const lead = await leadsService.getLeadById(id);
      return res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }

  async checkDuplicates(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, email, name } = req.query;
      const result = await leadsService.checkDuplicates({
        phone: phone as string,
        email: email as string,
        name: name as string,
      });
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async createLead(req: Request, res: Response, next: NextFunction) {
    try {
      const lead = await leadsService.createLead(
        {
          ...req.body,
          eventDate: req.body.eventDate ? new Date(req.body.eventDate) : undefined,
          nextActionDate: req.body.nextActionDate ? new Date(req.body.nextActionDate) : undefined,
        },
        req.user?.id,
        req
      );
      return res.status(201).json({
        success: true,
        message: 'Lead cadastrado com sucesso!',
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateLead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await leadsService.updateLead(
        id,
        {
          ...req.body,
          eventDate: req.body.eventDate ? new Date(req.body.eventDate) : undefined,
          nextActionDate: req.body.nextActionDate ? new Date(req.body.nextActionDate) : undefined,
        },
        req.user?.id,
        req
      );
      return res.json({
        success: true,
        message: 'Lead atualizado com sucesso.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, lossReason, note } = req.body;
      const updated = await leadsService.updateLeadStatus(
        id,
        status,
        lossReason,
        note,
        req.user?.id,
        req
      );
      return res.json({
        success: true,
        message: `Status do lead atualizado para ${status}.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteLead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await leadsService.deleteLead(id, req.user?.id, req);
      return res.json({ success: true, message: 'Lead excluído com sucesso.' });
    } catch (error) {
      next(error);
    }
  }

  async addActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const activity = await leadsService.addActivity(id, req.body, req.user?.id);
      return res.status(201).json({ success: true, data: activity });
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const task = await leadsService.createTask(id, req.body);
      return res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async toggleTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const { isCompleted } = req.body;
      const task = await leadsService.toggleTask(taskId, isCompleted);
      return res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async exportCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        search: req.query.search as string,
        status: req.query.status as LeadStatus,
        sourceChannel: req.query.sourceChannel as SourceChannel,
        campaignName: req.query.campaignName as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const csvData = await leadsService.exportLeadsCSV(filters, req.user?.id, req);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="leads_roboled_export.csv"');
      return res.send(csvData);
    } catch (error) {
      next(error);
    }
  }

  async importLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const { leads } = req.body;
      const result = await leadsService.importLeads(leads, req.user?.id, req);
      return res.json({
        success: true,
        message: `${result.imported} leads importados com sucesso!`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const leadsController = new LeadsController();

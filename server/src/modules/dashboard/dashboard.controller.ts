import { Request, Response, NextFunction } from 'express';
import { dashboardService, DashboardPeriod } from './dashboard.service.js';

export class DashboardController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getExecutiveDashboard({
        period: req.query.period as DashboardPeriod,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      });

      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();

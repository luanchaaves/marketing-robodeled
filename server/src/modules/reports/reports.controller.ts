import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service.js';
import { DashboardPeriod } from '../dashboard/dashboard.service.js';

export class ReportsController {
  async getReport(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reportsService.getDetailedReport({
        period: req.query.period as DashboardPeriod,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      });
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async exportCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await reportsService.exportReportCSV(
        {
          period: req.query.period as DashboardPeriod,
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
        },
        req.user?.id,
        req
      );
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="relatorio_marketing_roboled.csv"');
      return res.send(csv);
    } catch (error) {
      next(error);
    }
  }
}

export const reportsController = new ReportsController();

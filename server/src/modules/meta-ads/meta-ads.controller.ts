import { Request, Response, NextFunction } from 'express';
import { metaAdsService } from './meta-ads.service.js';

export class MetaAdsController {
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = await metaAdsService.getConnectionStatus();
      return res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  }

  async connect(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, appId, appSecret } = req.body;
      const result = await metaAdsService.connectIntegration(
        { accessToken, appId, appSecret },
        req.user?.id,
        req
      );
      return res.json({
        success: true,
        message: 'Meta Marketing API conectada com sucesso!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async disconnect(req: Request, res: Response, next: NextFunction) {
    try {
      await metaAdsService.disconnectIntegration(req.user?.id, req);
      return res.json({ success: true, message: 'Integração Meta Ads desconectada.' });
    } catch (error) {
      next(error);
    }
  }

  async triggerSync(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await metaAdsService.syncMetaMetrics('MANUAL');
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTrafficMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await metaAdsService.getAggregatedPaidTrafficMetrics();
      return res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }
}

export const metaAdsController = new MetaAdsController();

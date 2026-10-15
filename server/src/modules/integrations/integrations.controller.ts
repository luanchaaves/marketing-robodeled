import { Request, Response, NextFunction } from 'express';
import { integrationsService } from './integrations.service.js';
import { IntegrationProvider } from '@prisma/client';

export class IntegrationsController {
  async listIntegrations(req: Request, res: Response, next: NextFunction) {
    try {
      const integrations = await integrationsService.listIntegrations();
      return res.json({ success: true, data: integrations });
    } catch (error) {
      next(error);
    }
  }

  async configure(req: Request, res: Response, next: NextFunction) {
    try {
      const { provider, credentials, metadata } = req.body;
      const result = await integrationsService.configureIntegration(
        provider as IntegrationProvider,
        credentials,
        metadata,
        req.user?.id,
        req
      );
      return res.json({
        success: true,
        message: `Integração ${provider} configurada com sucesso.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async disconnect(req: Request, res: Response, next: NextFunction) {
    try {
      const { provider } = req.params;
      const result = await integrationsService.disconnect(
        provider as IntegrationProvider,
        req.user?.id,
        req
      );
      return res.json({
        success: true,
        message: `Integração ${provider} desconectada com sucesso.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const integrationsController = new IntegrationsController();

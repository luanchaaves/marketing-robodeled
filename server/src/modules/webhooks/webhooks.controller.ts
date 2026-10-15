import { Request, Response, NextFunction } from 'express';
import { webhooksService } from './webhooks.service.js';
import { env } from '../../config/env.js';

export class WebhooksController {
  /**
   * Meta Webhook Verification Handshake
   */
  verifyMetaWebhook(req: Request, res: Response) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === env.META_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }

  /**
   * Meta Lead Ads incoming webhook
   */
  async handleMetaLeadWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-hub-signature-256'] as string;
      const isValid = webhooksService.verifyMetaSignature(JSON.stringify(req.body), signature);

      if (!isValid) {
        return res.status(401).json({ error: 'Assinatura inválida' });
      }

      await webhooksService.processMetaLeadWebhook(req.body);
      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * WhatsApp Webhook Verification Handshake
   */
  verifyWhatsAppWebhook(req: Request, res: Response) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }

  /**
   * WhatsApp incoming message webhook
   */
  async handleWhatsAppWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sistema de Cotação webhook
   */
  async handleCotacaoWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await webhooksService.processCotacaoWebhook(req.body);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sistema de Contrato webhook
   */
  async handleContratoWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await webhooksService.processContratoWebhook(req.body);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const webhooksController = new WebhooksController();

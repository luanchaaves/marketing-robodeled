import { prisma } from '../../database/prisma.js';
import { leadsService } from '../leads/leads.service.js';
import { attributionService } from '../attribution/attribution.service.js';
import { logger } from '../../utils/logger.js';
import crypto from 'crypto';
import { env } from '../../config/env.js';

export class WebhooksService {
  /**
   * Verify Meta webhook signature using HMAC SHA-256
   */
  verifyMetaSignature(rawBody: string | Buffer, signatureHeader?: string): boolean {
    if (signatureHeader) {
      try {
        const secret = env.META_APP_SECRET || 'test_meta_secret_fallback';
        const parts = signatureHeader.split('sha256=');
        if (parts.length !== 2) return false;
        const signature = parts[1];

        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(rawBody)
          .digest('hex');

        if (signature.length !== expectedSignature.length) return false;
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
      } catch {
        return false;
      }
    }

    // If signature header is completely missing
    if (env.META_APP_SECRET) return false;
    return true; // Dev fallback
  }

  /**
   * Process Meta Lead Ads Webhook Payload with Idempotency
   */
  async processMetaLeadWebhook(payload: unknown) {
    const raw = payload as {
      entry?: Array<{
        id: string;
        changes?: Array<{
          field: string;
          value: {
            leadgen_id?: string;
            form_id?: string;
            created_time?: number;
            adgroup_id?: string;
            ad_id?: string;
          };
        }>;
      }>;
    };

    if (!raw.entry) return;

    for (const entry of raw.entry) {
      for (const change of entry.changes || []) {
        if (change.field === 'leadgen' && change.value.leadgen_id) {
          const leadgenId = change.value.leadgen_id;
          const idempotencyKey = `meta_lead_${leadgenId}`;

          const existingEvent = await prisma.webhookEvent.findFirst({
            where: { eventId: idempotencyKey },
          });

          if (existingEvent) {
            logger.info(`Leadgen webhook ${leadgenId} já foi processado anteriormente. Ignorando.`);
            continue;
          }

          await prisma.webhookEvent.create({
            data: {
              provider: 'META_LEAD_ADS',
              eventId: idempotencyKey,
              payload: payload as object,
              status: 'PROCESSED',
              processedAt: new Date(),
            },
          });

          logger.info(`Leadgen ID ${leadgenId} capturado via Meta Webhook.`);
        }
      }
    }
  }

  /**
   * Process Sistema de Cotação webhook
   */
  async processCotacaoWebhook(payload: {
    leadPhone: string;
    leadName?: string;
    leadEmail?: string;
    quotationCode: string;
    estimatedValue: number;
    eventType?: string;
    eventDate?: string;
    city?: string;
    attractions?: string[];
  }) {
    const lead = await leadsService.findOrCreateByPhone({
      phone: payload.leadPhone,
      name: payload.leadName || 'Lead Sistema de Cotação',
      email: payload.leadEmail,
      sourceChannel: 'SITE_FORM',
      notes: `Orçamento gerado: ${payload.quotationCode}. Atrações: ${payload.attractions?.join(', ')}`,
      estimatedValue: payload.estimatedValue,
      eventCity: payload.city,
      eventDate: payload.eventDate ? new Date(payload.eventDate) : undefined,
    });

    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'NOTE',
        title: `Orçamento gerado no Sistema de Cotação: ${payload.quotationCode}`,
        description: `Valor total orçado: R$ ${payload.estimatedValue}. Atrações: ${payload.attractions?.join(', ')}`,
      },
    });

    return lead;
  }

  /**
   * Process Sistema de Contratos webhook
   */
  async processContratoWebhook(payload: {
    contractNumber: string;
    leadPhone: string;
    clientName: string;
    totalAmount: number;
    eventDate?: string;
    status: string;
  }) {
    const lead = await leadsService.findOrCreateByPhone({
      phone: payload.leadPhone,
      name: payload.clientName,
      sourceChannel: 'MANUAL',
      eventDate: payload.eventDate ? new Date(payload.eventDate) : undefined,
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        status: 'WON',
      },
    });

    await prisma.deal.create({
      data: {
        leadId: lead.id,
        title: `Contrato ${payload.contractNumber}`,
        contractCode: payload.contractNumber,
        value: payload.totalAmount,
        status: 'WON',
        notes: `Contrato assinado via webhook Sistema de Contratos. Status: ${payload.status}`,
      },
    });

    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'STATUS_CHANGE',
        title: `Contrato ${payload.contractNumber} fechado!`,
        description: `Lead marcado automaticamente como GANHO (WON). Valor: R$ ${payload.totalAmount}`,
      },
    });

    return lead;
  }
}

export const webhooksService = new WebhooksService();

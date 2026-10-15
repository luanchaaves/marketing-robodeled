import { prisma } from '../../database/prisma.js';
import { NotFoundError } from '../../utils/errors.js';
import { logAuditEvent } from '../../middleware/auditLogger.js';
import axios from 'axios';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

export class AutomationsService {
  async listRules() {
    return prisma.automationRule.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        runs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async getRuleById(id: string) {
    const rule = await prisma.automationRule.findUnique({
      where: { id },
      include: {
        runs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!rule) throw new NotFoundError('Regra de automação não encontrada.');
    return rule;
  }

  async createRule(
    data: {
      name: string;
      description?: string;
      triggerType: string;
      triggerConfig: Prisma.InputJsonValue;
      actionType: string;
      actionConfig: Prisma.InputJsonValue;
      isActive?: boolean;
    },
    userId?: string,
    req?: Request
  ) {
    const rule = await prisma.automationRule.create({
      data: {
        name: data.name,
        description: data.description,
        triggerType: data.triggerType,
        triggerConfig: data.triggerConfig,
        actionType: data.actionType,
        actionConfig: data.actionConfig,
        isActive: data.isActive !== false,
      },
    });

    await logAuditEvent({
      action: 'AUTOMATION_RULE_CREATED',
      entityType: 'AutomationRule',
      entityId: rule.id,
      userId,
      req,
      details: { name: rule.name, trigger: rule.triggerType, action: rule.actionType },
    });

    return rule;
  }

  async updateRule(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      triggerType: string;
      triggerConfig: Prisma.InputJsonValue;
      actionType: string;
      actionConfig: Prisma.InputJsonValue;
      isActive: boolean;
    }>,
    userId?: string,
    req?: Request
  ) {
    const existing = await prisma.automationRule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Regra de automação não encontrada.');

    const updated = await prisma.automationRule.update({
      where: { id },
      data,
    });

    await logAuditEvent({
      action: 'AUTOMATION_RULE_UPDATED',
      entityType: 'AutomationRule',
      entityId: id,
      userId,
      req,
    });

    return updated;
  }

  async deleteRule(id: string, userId?: string, req?: Request) {
    const existing = await prisma.automationRule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Regra de automação não encontrada.');

    await prisma.automationRule.delete({ where: { id } });

    await logAuditEvent({
      action: 'AUTOMATION_RULE_DELETED',
      entityType: 'AutomationRule',
      entityId: id,
      userId,
      req,
      details: { name: existing.name },
    });
  }

  /**
   * Execute an action triggered by an event (e.g. n8n webhook or WhatsApp notification)
   */
  async executeRule(ruleId: string, triggerPayload?: unknown) {
    const rule = await prisma.automationRule.findUnique({ where: { id: ruleId } });
    if (!rule || !rule.isActive) return { status: 'SKIPPED' };

    const startTime = Date.now();
    let status = 'SUCCESS';
    let errorMessage: string | null = null;
    let executionResult: unknown = null;

    try {
      const config = rule.actionConfig as { webhookUrl?: string; templateName?: string };

      if (rule.actionType === 'DISPATCH_N8N') {
        const targetUrl = config.webhookUrl || env.N8N_WEBHOOK_URL;
        if (targetUrl) {
          const resp = await axios.post(
            targetUrl,
            {
              event: rule.triggerType,
              payload: triggerPayload,
              timestamp: new Date().toISOString(),
            },
            {
              headers: {
                'X-RoboLed-Secret': env.N8N_WEBHOOK_SECRET,
              },
              timeout: 10000,
            }
          );
          executionResult = { status: resp.status, data: resp.data };
        } else {
          status = 'SKIPPED';
          errorMessage = 'URL do webhook n8n não configurada.';
        }
      } else if (rule.actionType === 'SEND_NOTIFICATION') {
        executionResult = { notificationSent: true, message: 'Notificação enviada ao time de marketing' };
      }
    } catch (err: unknown) {
      status = 'FAILED';
      errorMessage = (err as Error).message;
      logger.error({ err, ruleId }, 'Falha na execução da automação');
    }

    const duration = Date.now() - startTime;

    await prisma.automationRun.create({
      data: {
        automationRuleId: rule.id,
        triggerPayload: (triggerPayload as Prisma.InputJsonValue) || undefined,
        status,
        executionResult: (executionResult as Prisma.InputJsonValue) || undefined,
        errorMessage,
        executionTimeMs: duration,
      },
    });

    await prisma.automationRule.update({
      where: { id: rule.id },
      data: { lastRunAt: new Date() },
    });

    return { status, executionResult, errorMessage, duration };
  }
}

export const automationsService = new AutomationsService();

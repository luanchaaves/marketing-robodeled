import { prisma } from '../../database/prisma.js';
import { encryptCredentials } from '../../utils/encryption.js';
import { logAuditEvent } from '../../middleware/auditLogger.js';
import { IntegrationProvider, IntegrationStatus } from '@prisma/client';
import { Request } from 'express';

const ALL_PROVIDERS: IntegrationProvider[] = [
  'META_ADS',
  'INSTAGRAM',
  'WHATSAPP_CLOUD',
  'META_LEAD_ADS',
  'N8N',
  'SISTEMA_COTACAO',
  'SISTEMA_CONTRATO',
  'AI_ASSISTANT',
];

export class IntegrationsService {
  /**
   * Get all integration configurations and connection states
   */
  async listIntegrations() {
    const existing = await prisma.integration.findMany({
      include: {
        syncRuns: {
          orderBy: { startedAt: 'desc' },
          take: 3,
        },
      },
    });

    const existingMap = new Map(existing.map((item) => [item.provider, item]));

    return ALL_PROVIDERS.map((provider) => {
      const item = existingMap.get(provider);
      return {
        provider,
        id: item?.id || null,
        status: (item?.status || 'DISCONNECTED') as IntegrationStatus,
        hasCredentials: !!item?.encryptedCredentials,
        lastSyncAt: item?.lastSyncAt || null,
        errorDetails: item?.errorDetails || null,
        metadata: item?.metadata || null,
        recentSyncs: item?.syncRuns || [],
      };
    });
  }

  /**
   * Configure / save credentials for any provider
   */
  async configureIntegration(
    provider: IntegrationProvider,
    credentials: unknown,
    metadata?: object,
    userId?: string,
    req?: Request
  ) {
    const encrypted = encryptCredentials(credentials);

    const integration = await prisma.integration.upsert({
      where: { provider },
      create: {
        provider,
        status: 'CONNECTED',
        encryptedCredentials: encrypted,
        metadata: metadata ? (metadata as object) : undefined,
        lastSyncAt: new Date(),
      },
      update: {
        status: 'CONNECTED',
        encryptedCredentials: encrypted,
        metadata: metadata ? (metadata as object) : undefined,
        errorDetails: null,
        lastSyncAt: new Date(),
      },
    });

    await logAuditEvent({
      action: 'INTEGRATION_CONFIGURED',
      entityType: 'Integration',
      entityId: integration.id,
      userId,
      req,
      details: { provider },
    });

    return {
      success: true,
      provider: integration.provider,
      status: integration.status,
    };
  }

  /**
   * Disconnect an integration
   */
  async disconnect(provider: IntegrationProvider, userId?: string, req?: Request) {
    const integration = await prisma.integration.findUnique({ where: { provider } });
    if (integration) {
      await prisma.integration.update({
        where: { id: integration.id },
        data: {
          status: 'DISCONNECTED',
          encryptedCredentials: null,
          errorDetails: null,
        },
      });

      await logAuditEvent({
        action: 'INTEGRATION_DISCONNECTED',
        entityType: 'Integration',
        entityId: integration.id,
        userId,
        req,
        details: { provider },
      });
    }

    return { success: true };
  }
}

export const integrationsService = new IntegrationsService();

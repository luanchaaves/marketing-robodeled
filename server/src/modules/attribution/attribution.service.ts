import { prisma } from '../../database/prisma.js';
import { SourceChannel } from '@prisma/client';

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export class AttributionService {
  /**
   * Determine initial SourceChannel from UTM parameters or referrer
   */
  detectSourceChannel(utms?: UTMParams, referrer?: string): SourceChannel {
    if (!utms && !referrer) return 'MANUAL';

    const source = (utms?.utm_source || '').toLowerCase();
    const medium = (utms?.utm_medium || '').toLowerCase();

    if (source.includes('facebook') || source.includes('instagram') || source.includes('meta')) {
      if (medium.includes('cpc') || medium.includes('paid') || medium.includes('ads')) {
        return 'META_ADS';
      }
      return 'INSTAGRAM_ORGANIC';
    }

    if (source.includes('google')) {
      return medium.includes('cpc') ? 'GOOGLE_ADS' : 'SITE_FORM';
    }

    if (source.includes('whatsapp') || medium.includes('whatsapp')) {
      return 'WHATSAPP_DIRECT';
    }

    if (referrer && (referrer.includes('instagram.com') || referrer.includes('linktr.ee'))) {
      return 'INSTAGRAM_ORGANIC';
    }

    if (utms?.utm_source) {
      return 'SITE_FORM';
    }

    return 'MANUAL';
  }

  /**
   * Record a touchpoint for a lead
   */
  async recordTouchpoint(params: {
    leadId: string;
    touchType?: 'FIRST_TOUCH' | 'LAST_TOUCH' | 'MID_TOUCH';
    sourceChannel?: SourceChannel;
    utms?: UTMParams;
    platformId?: string;
    adId?: string;
  }) {
    return prisma.attributionTouch.create({
      data: {
        leadId: params.leadId,
        touchType: params.touchType || 'FIRST_TOUCH',
        sourceChannel: params.sourceChannel || 'SITE_FORM',
        utmSource: params.utms?.utm_source || null,
        utmMedium: params.utms?.utm_medium || null,
        utmCampaign: params.utms?.utm_campaign || null,
        utmContent: params.utms?.utm_content || null,
        utmTerm: params.utms?.utm_term || null,
        platformId: params.platformId || null,
        adId: params.adId || null,
      },
    });
  }
}

export const attributionService = new AttributionService();

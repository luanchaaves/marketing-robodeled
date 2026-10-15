import { Request, Response, NextFunction } from 'express';
import { attributionService } from './attribution.service.js';
import { prisma } from '../../database/prisma.js';

export class AttributionController {
  async getLeadAttribution(req: Request, res: Response, next: NextFunction) {
    try {
      const { leadId } = req.params;
      const touches = await prisma.attributionTouch.findMany({
        where: { leadId },
        orderBy: { createdAt: 'asc' },
      });
      return res.json({ success: true, data: touches });
    } catch (error) {
      next(error);
    }
  }

  async buildUtmLink(req: Request, res: Response, next: NextFunction) {
    try {
      const { baseUrl, source, medium, campaign, content, term } = req.body;
      const url = new URL(baseUrl || 'https://roboledpartner.com.br');
      if (source) url.searchParams.set('utm_source', source);
      if (medium) url.searchParams.set('utm_medium', medium);
      if (campaign) url.searchParams.set('utm_campaign', campaign);
      if (content) url.searchParams.set('utm_content', content);
      if (term) url.searchParams.set('utm_term', term);

      return res.json({
        success: true,
        data: {
          url: url.toString(),
          params: { source, medium, campaign, content, term },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const attributionController = new AttributionController();

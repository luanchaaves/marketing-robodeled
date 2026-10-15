import { Request, Response, NextFunction } from 'express';
import { aiAssistantService } from './ai.service.js';

export class AiController {
  async generateIdeas(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await aiAssistantService.generateContentIdeas(req.body);
      return res.json({ success: true, data: { content: result } });
    } catch (error) {
      next(error);
    }
  }

  async generateCaptions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await aiAssistantService.generateCaptions(req.body);
      return res.json({ success: true, data: { content: result } });
    } catch (error) {
      next(error);
    }
  }

  async summarizeCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await aiAssistantService.summarizeCampaign(req.body);
      return res.json({ success: true, data: { content: result } });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AiController();

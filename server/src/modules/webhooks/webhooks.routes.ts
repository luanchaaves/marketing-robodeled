import { Router } from 'express';
import { webhooksController } from './webhooks.controller.js';

const router = Router();

// Meta Lead Ads
router.get('/meta-leads', (req, res) => webhooksController.verifyMetaWebhook(req, res));
router.post('/meta-leads', (req, res, next) => webhooksController.handleMetaLeadWebhook(req, res, next));

// WhatsApp Business Cloud API
router.get('/whatsapp', (req, res) => webhooksController.verifyWhatsAppWebhook(req, res));
router.post('/whatsapp', (req, res, next) => webhooksController.handleWhatsAppWebhook(req, res, next));

// Ecosystem Webhooks
router.post('/cotacao', (req, res, next) => webhooksController.handleCotacaoWebhook(req, res, next));
router.post('/contrato', (req, res, next) => webhooksController.handleContratoWebhook(req, res, next));

export const webhooksRoutes = router;

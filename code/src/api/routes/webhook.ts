import { Router } from 'express';
import { WebhookController } from '../controllers/WebhookController';

const router = Router();
const webhookController = new WebhookController();

// Endpoint para receber webhooks do WhatsApp (MegaAPI)
router.post('/whatsapp', webhookController.handleWhatsappWebhook);

export default router; 
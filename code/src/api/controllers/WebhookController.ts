import { Request, Response } from 'express';
import { WhatsappWebhookService } from '../../services/integration/whatsapp/WhatsappWebhookService';

export class WebhookController {
  private webhookService: WhatsappWebhookService;

  constructor() {
    this.webhookService = new WhatsappWebhookService();
  }

  handleWhatsappWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      // Tratar o body se vier como Buffer
      let body = req.body;
      if (Buffer.isBuffer(body)) {
        console.log('Body recebido como Buffer, convertendo para JSON...');
        body = JSON.parse(body.toString());
      }
      
      console.log('Webhook recebido:', JSON.stringify(body, null, 2));
      
      const result = await this.webhookService.processWebhook(body);
      
      res.status(200).json({
        success: true,
        message: 'Webhook processado com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
} 
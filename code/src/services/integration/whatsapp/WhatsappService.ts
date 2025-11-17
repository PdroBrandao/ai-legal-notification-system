import axios from 'axios';
import { environment } from '../../../config/environment';
import { WhatsappMessage, WhatsappResponse } from './types';
import { AppError } from '../../../utils/errors';
export class WhatsappService {
  private readonly sendUrl: string;
  private readonly instanceKey: string;
  private readonly token: string;

  constructor() {
    this.sendUrl = environment.MEGA_API_URL;
    this.instanceKey = environment.MEGA_API_KEY;
    this.token = environment.MEGA_API_TOKEN;
  }

  async send({ to, text }: WhatsappMessage): Promise<WhatsappResponse> {
    if (environment.DISABLE_WHATSAPP) {
      console.log('[WhatsappService] Envio de WhatsApp desabilitado em ambiente de desenvolvimento');
      console.log('[WhatsappService] Mensagem que seria enviada:', { to, text });
      return { status: 'SENT' };
    }

    if (!this.sendUrl || !this.instanceKey || !this.token) {
      console.error('[WhatsappService] Configurações ausentes:', { url: !!this.sendUrl, key: !!this.instanceKey, token: !!this.token });
      throw new AppError('Configuração da API Mega ausente');
    }

    try {
      console.log('[WhatsappService] Iniciando envio para:', to);
      
      const response = await axios.post(
        `${this.sendUrl}/rest/sendMessage/${this.instanceKey}/text`,
        {
          messageData: {
            to: `${to}@c.whatsapp.net`,
            text,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          }
        }
      );

      console.log('[WhatsappService] Resposta da API:', {
        status: response.status,
        data: response.data,
        to
      });
      
      return { status: 'SENT' };
      
    } catch (error) {
      console.error('[WhatsappService] Erro detalhado:', {
        to,
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : error
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        status: 'FAILED',
        errorMessage
      };
    }
  }
}
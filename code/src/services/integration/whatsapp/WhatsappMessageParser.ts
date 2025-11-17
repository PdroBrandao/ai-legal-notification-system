import { WebhookPayload, ParsedMessage } from './WhatsappWebhookService';

export class WhatsappMessageParser {
  
  parseMessage(payload: WebhookPayload): ParsedMessage | null {
    try {
      const { messageType, message, key, pushName, messageTimestamp } = payload;
      
      // Extrair informações básicas
      const userId = key.remoteJid;
      const messageId = key.id;
      const timestamp = messageTimestamp;
      const userName = pushName || 'Usuário';

      // Parse baseado no tipo de mensagem
      switch (messageType) {
        case 'conversation':
          return this.parseConversationMessage(message, userId, messageId, timestamp, userName);
        
        case 'extendedTextMessage':
          return this.parseExtendedTextMessage(message, userId, messageId, timestamp, userName);
        
        case 'ephemeralMessage':
          return this.parseEphemeralMessage(message, userId, messageId, timestamp, userName);
        
        // Tipos de mídia
        case 'audioMessage':
        case 'videoMessage':
        case 'imageMessage':
        case 'documentMessage':
        case 'stickerMessage':
        case 'documentWithCaptionMessage':
          return this.parseMediaMessage(messageType, message, userId, messageId, timestamp, userName);
        
        // Tipos interativos
        case 'templateButtonReplyMessage':
        case 'listResponseMessage':
        case 'pollCreationMessageV3':
          return this.parseInteractiveMessage(messageType, message, userId, messageId, timestamp, userName);
        
        default:
          return this.parseUnknownMessage(messageType, userId, messageId, timestamp, userName);
      }
    } catch (error) {
      console.error('Erro ao fazer parse da mensagem:', error);
      return null;
    }
  }

  private parseConversationMessage(message: any, userId: string, messageId: string, timestamp: number, userName: string): ParsedMessage {
    const content = message.conversation || '';
    
    return {
      type: 'text',
      content,
      userId,
      messageId,
      timestamp,
      userName
    };
  }

  private parseExtendedTextMessage(message: any, userId: string, messageId: string, timestamp: number, userName: string): ParsedMessage {
    const content = message.extendedTextMessage?.text || '';
    
    return {
      type: 'text',
      content,
      userId,
      messageId,
      timestamp,
      userName
    };
  }

  private parseEphemeralMessage(message: any, userId: string, messageId: string, timestamp: number, userName: string): ParsedMessage {
    const content = message.ephemeralMessage?.message?.extendedTextMessage?.text || '';
    
    return {
      type: 'text',
      content,
      userId,
      messageId,
      timestamp,
      userName
    };
  }

  private parseMediaMessage(messageType: string, message: any, userId: string, messageId: string, timestamp: number, userName: string): ParsedMessage {
    let content = '';
    
    // Tentar extrair caption ou nome do arquivo
    switch (messageType) {
      case 'documentWithCaptionMessage':
        content = message.documentWithCaptionMessage?.message?.documentMessage?.caption || 
                 message.documentWithCaptionMessage?.message?.documentMessage?.fileName || '';
        break;
      case 'documentMessage':
        content = message.documentMessage?.fileName || '';
        break;
      case 'imageMessage':
        content = 'Imagem enviada';
        break;
      case 'videoMessage':
        content = message.videoMessage?.gifPlayback ? 'GIF enviado' : 'Vídeo enviado';
        break;
      case 'audioMessage':
        content = 'Áudio enviado';
        break;
      case 'stickerMessage':
        content = 'Sticker enviado';
        break;
      default:
        content = 'Arquivo enviado';
    }
    
    return {
      type: 'media',
      content,
      userId,
      messageId,
      timestamp,
      userName
    };
  }

  private parseInteractiveMessage(messageType: string, message: any, userId: string, messageId: string, timestamp: number, userName: string): ParsedMessage {
    let content = '';
    
    switch (messageType) {
      case 'templateButtonReplyMessage':
        content = `Botão selecionado: ${message.templateButtonReplyMessage?.selectedDisplayText || 'Opção'}`;
        break;
      case 'listResponseMessage':
        content = `Lista selecionada: ${message.listResponseMessage?.title || 'Opção'}`;
        break;
      case 'pollCreationMessageV3':
        content = `Enquete criada: ${message.pollCreationMessageV3?.name || 'Enquete'}`;
        break;
      default:
        content = 'Interação recebida';
    }
    
    return {
      type: 'button',
      content,
      userId,
      messageId,
      timestamp,
      userName
    };
  }

  private parseUnknownMessage(messageType: string, userId: string, messageId: string, timestamp: number, userName: string): ParsedMessage {
    return {
      type: 'unknown',
      content: `Tipo de mensagem não suportado: ${messageType}`,
      userId,
      messageId,
      timestamp,
      userName
    };
  }
} 
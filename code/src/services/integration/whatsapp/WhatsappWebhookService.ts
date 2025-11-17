import { WhatsappMessageParser } from './WhatsappMessageParser';
import { WhatsappNotificationService } from './WhatsappNotificationService';
import { WhatsappIntentExtractor, ExtractedIntent } from './WhatsappIntentExtractor';
import { WhatsappIntimacaoService } from './WhatsappIntimacaoService';
import { WhatsappResponseFormatter } from './WhatsappResponseFormatter';

export interface WebhookPayload {
  instance_key: string;
  jid: string;
  messageType: string;
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  messageTimestamp: number;
  pushName: string;
  broadcast: boolean;
  message: any;
}

export interface ParsedMessage {
  type: 'text' | 'media' | 'button' | 'list' | 'poll' | 'unknown';
  content: string;
  userId: string;
  messageId: string;
  timestamp: number;
  userName: string;
}

export class WhatsappWebhookService {
  private messageParser: WhatsappMessageParser;
  private notificationService: WhatsappNotificationService;
  private intentExtractor: WhatsappIntentExtractor;
  private intimacaoService: WhatsappIntimacaoService;
  private responseFormatter: WhatsappResponseFormatter;
  private processedMessages: Set<string> = new Set(); // Controle de duplicatas

  constructor() {
    this.messageParser = new WhatsappMessageParser();
    this.notificationService = new WhatsappNotificationService();
    this.intentExtractor = new WhatsappIntentExtractor();
    this.intimacaoService = new WhatsappIntimacaoService();
    this.responseFormatter = new WhatsappResponseFormatter();
  }

  async processWebhook(payload: WebhookPayload): Promise<any> {
    try {
      console.log(`Processando webhook - Tipo: ${payload.messageType}, Usuário: ${payload.pushName}`);

      // FILTRO CRÍTICO: Ignorar mensagens enviadas por nós mesmos
      if (payload.key?.fromMe === true) {
        console.log('Ignorando mensagem própria (fromMe: true)');
        return { 
          processed: false, 
          reason: 'Mensagem própria ignorada',
          action: 'self_message_ignored'
        };
      }

      // Verificar se é uma mensagem válida (não vazia)
      if (!payload.message || Object.keys(payload.message).length === 0) {
        console.log('Mensagem vazia ou inválida');
        return { 
          processed: false, 
          reason: 'Mensagem vazia',
          action: 'empty_message_ignored'
        };
      }

      // CONTROLE DE DUPLICATAS: Verificar se já processamos esta mensagem
      const messageId = payload.key?.id;
      if (messageId && this.processedMessages.has(messageId)) {
        console.log(`Mensagem duplicada ignorada: ${messageId}`);
        return {
          processed: false,
          reason: 'Mensagem duplicada',
          action: 'duplicate_message_ignored'
        };
      }

      // Adicionar à lista de mensagens processadas
      if (messageId) {
        this.processedMessages.add(messageId);
        // Limpar mensagens antigas (manter apenas as últimas 100)
        if (this.processedMessages.size > 100) {
          const messagesArray = Array.from(this.processedMessages);
          this.processedMessages = new Set(messagesArray.slice(-50));
        }
      }

      // Parse da mensagem
      const parsedMessage = this.messageParser.parseMessage(payload);
      
      if (!parsedMessage) {
        console.log('Mensagem não pôde ser parseada');
        return { processed: false, reason: 'Mensagem não suportada' };
      }

      console.log('Mensagem parseada:', parsedMessage);

      // Processar baseado no tipo
      const result = await this.processMessageByType(parsedMessage);

      return {
        processed: true,
        messageType: parsedMessage.type,
        result
      };

    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw error;
    }
  }

  private async processMessageByType(parsedMessage: ParsedMessage): Promise<any> {
    switch (parsedMessage.type) {
      case 'text':
        return await this.processTextMessage(parsedMessage);
      
      case 'media':
        return await this.processMediaMessage(parsedMessage);
      
      case 'button':
      case 'list':
      case 'poll':
        return await this.processInteractiveMessage(parsedMessage);
      
      default:
        return await this.processUnknownMessage(parsedMessage);
    }
  }

  private async processTextMessage(parsedMessage: ParsedMessage): Promise<any> {
    console.log(`Processando mensagem de texto: "${parsedMessage.content}"`);
    
    try {
      // 1. Extrair intenção e entidades usando GPT
      const extractedIntent = await this.intentExtractor.extractIntent(parsedMessage.content);
      console.log('Intenção extraída:', extractedIntent);
      
      // 2. Processar baseado na intenção
      if (extractedIntent.intent === 'buscar_intimacoes' && extractedIntent.confidence > 0.7) {
        return await this.processBuscarIntimacoes(parsedMessage, extractedIntent);
      } else if (extractedIntent.intent === 'consultar_prazos_vencendo' && extractedIntent.confidence > 0.7) {
        return await this.processConsultarPrazosVencendo(parsedMessage, extractedIntent);
      } else if (extractedIntent.intent === 'consultar_comparecimento' && extractedIntent.confidence > 0.7) {
        return await this.processConsultarComparecimento(parsedMessage, extractedIntent);
      } else if (extractedIntent.intent === 'consultar_detalhes_intimacao' && extractedIntent.confidence > 0.7) {
        return await this.processConsultarDetalhesIntimacao(parsedMessage, extractedIntent);
      } else {
        return await this.processFallbackMessage(parsedMessage, extractedIntent);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem de texto:', error);
      return await this.processFallbackMessage(parsedMessage, { intent: 'outro', entities: {}, confidence: 0 });
    }
  }

  private async processBuscarIntimacoes(parsedMessage: ParsedMessage, extractedIntent: ExtractedIntent): Promise<any> {
    console.log('Processando busca de intimações');
    
    try {
      // Extrair telefone do userId (remover @s.whatsapp.net se presente)
      const telefone = parsedMessage.userId.replace('@s.whatsapp.net', '');
      
      // Buscar dados do advogado primeiro
      const advogado = await this.intimacaoService.buscarAdvogadoPorTelefone(telefone);
      
      if (!advogado) {
        const response = 'Desculpe, você não está cadastrado no nosso banco de dados. Aguarde o nosso suporte.';
        await this.notificationService.sendMessage(parsedMessage.userId, response);
        
        return {
          action: 'advogado_nao_encontrado',
          response: response
        };
      }
      
      // Usar data extraída ou default para hoje
      const data = extractedIntent.entities.data || new Date().toISOString().split('T')[0];
      
      // Buscar intimações no banco
      const intimacoes = await this.intimacaoService.buscarIntimacoesPorData(telefone, data);
      
      // Formatar resposta usando GPT
      const formattedResponse = await this.responseFormatter.formatIntimacoesResponse(advogado, intimacoes, data);
      
      // Enviar resposta via WhatsApp
      await this.notificationService.sendMessage(parsedMessage.userId, formattedResponse);
      
      return {
        action: 'intimacoes_buscadas',
        response: formattedResponse,
        data: {
          advogado: advogado.nome,
          data: data,
          quantidade: intimacoes.length
        }
      };
    } catch (error) {
      console.error('Erro ao processar busca de intimações:', error);
      
      const response = 'Desculpe, ocorreu um erro ao buscar suas intimações. Tente novamente em alguns instantes.';
      await this.notificationService.sendMessage(parsedMessage.userId, response);
      
      return {
        action: 'erro_busca_intimacoes',
        response: response,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  private async processConsultarPrazosVencendo(parsedMessage: ParsedMessage, extractedIntent: ExtractedIntent): Promise<any> {
    console.log('Processando consulta de prazos vencendo');
    
    try {
      // Extrair telefone do userId
      const telefone = parsedMessage.userId.replace('@s.whatsapp.net', '');
      
      // Buscar dados do advogado
      const advogado = await this.intimacaoService.buscarAdvogadoPorTelefone(telefone);
      
      if (!advogado) {
        const response = 'Desculpe, você não está cadastrado no nosso banco de dados. Aguarde o nosso suporte.';
        await this.notificationService.sendMessage(parsedMessage.userId, response);
        
        return {
          action: 'advogado_nao_encontrado',
          response: response
        };
      }
      
      // Usar data extraída ou default para hoje
      const data = extractedIntent.entities.data || new Date().toISOString().split('T')[0];
      
      // Buscar prazos vencendo no banco
      const prazosVencendo = await this.intimacaoService.buscarPrazosVencendo(telefone, data);
      
      // Formatar resposta
      const formattedResponse = await this.responseFormatter.formatPrazosVencendoResponse(advogado, prazosVencendo, data);
      
      // Enviar resposta via WhatsApp
      await this.notificationService.sendMessage(parsedMessage.userId, formattedResponse);
      
      return {
        action: 'prazos_vencendo_buscados',
        response: formattedResponse,
        data: {
          advogado: advogado.nome,
          data: data,
          quantidade: prazosVencendo.length
        }
      };
    } catch (error) {
      console.error('Erro ao processar prazos vencendo:', error);
      
      const response = 'Desculpe, ocorreu um erro ao buscar seus prazos. Tente novamente em alguns instantes.';
      await this.notificationService.sendMessage(parsedMessage.userId, response);
      
      return {
        action: 'erro_busca_prazos',
        response: response,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  private async processConsultarComparecimento(parsedMessage: ParsedMessage, extractedIntent: ExtractedIntent): Promise<any> {
    console.log('Processando consulta de comparecimento');
    
    try {
      // Extrair telefone do userId
      const telefone = parsedMessage.userId.replace('@s.whatsapp.net', '');
      
      // Buscar dados do advogado
      const advogado = await this.intimacaoService.buscarAdvogadoPorTelefone(telefone);
      
      if (!advogado) {
        const response = 'Desculpe, você não está cadastrado no nosso banco de dados. Aguarde o nosso suporte.';
        await this.notificationService.sendMessage(parsedMessage.userId, response);
        
        return {
          action: 'advogado_nao_encontrado',
          response: response
        };
      }
      
      // Para "próximo", buscar a partir de hoje sem limite de data final
      // Para data específica, usar a data informada
      let dataInicio: string;
      let dataFim: string;
      
      if (extractedIntent.entities.proximo) {
        // Para "próximo", buscar a partir de hoje
        dataInicio = new Date().toISOString().split('T')[0];
        dataFim = '2099-12-31'; // Data muito futura para pegar todos os próximos
      } else {
        // Para data específica ou período
        dataInicio = extractedIntent.entities.data || new Date().toISOString().split('T')[0];
        dataFim = extractedIntent.entities.data || new Date().toISOString().split('T')[0];
      }
      
      // Buscar comparecimentos no banco
      const comparecimentos = await this.intimacaoService.buscarComparecimentos(
        telefone, 
        dataInicio, 
        dataFim,
        extractedIntent.entities.tipoComparecimento,
        extractedIntent.entities.proximo
      );
      
      // Formatar resposta
      const formattedResponse = await this.responseFormatter.formatComparecimentoResponse(
        advogado, 
        comparecimentos, 
        dataInicio,
        extractedIntent.entities.proximo
      );
      
      // Enviar resposta via WhatsApp
      await this.notificationService.sendMessage(parsedMessage.userId, formattedResponse);
      
      return {
        action: 'comparecimentos_buscados',
        response: formattedResponse,
        data: {
          advogado: advogado.nome,
          data: dataInicio,
          quantidade: comparecimentos.length,
          proximo: extractedIntent.entities.proximo
        }
      };
    } catch (error) {
      console.error('Erro ao processar comparecimentos:', error);
      
      const response = 'Desculpe, ocorreu um erro ao buscar seus comparecimentos. Tente novamente em alguns instantes.';
      await this.notificationService.sendMessage(parsedMessage.userId, response);
      
      return {
        action: 'erro_busca_comparecimentos',
        response: response,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  private async processConsultarDetalhesIntimacao(parsedMessage: ParsedMessage, extractedIntent: ExtractedIntent): Promise<any> {
    console.log('Processando consulta de detalhes de intimação');
    
    try {
      // Extrair telefone do userId
      const telefone = parsedMessage.userId.replace('@s.whatsapp.net', '');
      
      // Buscar dados do advogado
      const advogado = await this.intimacaoService.buscarAdvogadoPorTelefone(telefone);
      
      if (!advogado) {
        const response = 'Desculpe, você não está cadastrado no nosso banco de dados. Aguarde o nosso suporte.';
        await this.notificationService.sendMessage(parsedMessage.userId, response);
        
        return {
          action: 'advogado_nao_encontrado',
          response: response
        };
      }
      
      // Verificar se tem ID da intimação
      if (!extractedIntent.entities.idIntimacao) {
        const response = 'Por favor, informe o ID da intimação que você quer consultar. Exemplo: "Detalhes da intimação 256927443"';
        await this.notificationService.sendMessage(parsedMessage.userId, response);
        
        return {
          action: 'id_intimacao_nao_informado',
          response: response
        };
      }
      
      // Buscar detalhes da intimação
      const intimacao = await this.intimacaoService.buscarPorIdDgenDetalhado(
        extractedIntent.entities.idIntimacao,
        telefone
      );
      
      if (!intimacao) {
        const response = `Não encontrei a intimação ${extractedIntent.entities.idIntimacao} no seu nome. Verifique o ID e tente novamente.`;
        await this.notificationService.sendMessage(parsedMessage.userId, response);
        
        return {
          action: 'intimacao_nao_encontrada',
          response: response
        };
      }
      
      // Formatar resposta
      const formattedResponse = await this.responseFormatter.formatDetalhesIntimacaoResponse(
        advogado,
        intimacao,
        extractedIntent.entities.tipoDetalhe || 'todos'
      );
      
      // Enviar resposta via WhatsApp
      await this.notificationService.sendMessage(parsedMessage.userId, formattedResponse);
      
      return {
        action: 'detalhes_intimacao_buscados',
        response: formattedResponse,
        data: {
          advogado: advogado.nome,
          idIntimacao: extractedIntent.entities.idIntimacao,
          tipoDetalhe: extractedIntent.entities.tipoDetalhe
        }
      };
    } catch (error) {
      console.error('Erro ao processar detalhes da intimação:', error);
      
      const response = 'Desculpe, ocorreu um erro ao buscar os detalhes da intimação. Tente novamente em alguns instantes.';
      await this.notificationService.sendMessage(parsedMessage.userId, response);
      
      return {
        action: 'erro_busca_detalhes',
        response: response,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  private async processFallbackMessage(parsedMessage: ParsedMessage, extractedIntent: ExtractedIntent): Promise<any> {
    console.log('Processando mensagem com fallback');
    
    let response: string;
    
    if (extractedIntent.fallback || extractedIntent.confidence < 0.3) {
      response = `Olá! Não entendi exatamente o que você precisa. 

Por aqui posso te ajudar com:

📋 *Suas intimações* - "Quais minhas intimações hoje?"
⏰ *Prazos vencendo* - "Tenho prazos vencendo hoje?"
📅 *Comparecimentos* - "Tenho audiência amanhã?"
🔍 *Detalhes específicos* - "Detalhes da intimação 256927443"

Tente uma dessas opções ou me pergunte de outra forma! 😊`;
    } else if (extractedIntent.intent === 'buscar_intimacoes' && extractedIntent.confidence < 0.7) {
      response = 'Entendi que você quer saber sobre suas intimações, mas não consegui identificar a data. Tente ser mais específico, como:\n\n• "Minhas intimações de hoje"\n• "Intimações de ontem"\n• "Quais intimações do dia 10/07/2025"';
    } else {
      response = 'Por enquanto só consigo ajudar com consultas de intimações, prazos e comparecimentos. Tente perguntar sobre suas intimações de uma data específica.';
    }
    
    await this.notificationService.sendMessage(parsedMessage.userId, response);
    
    return {
      action: 'fallback_processed',
      response: response,
      confidence: extractedIntent.confidence
    };
  }

  private async processMediaMessage(parsedMessage: ParsedMessage): Promise<any> {
    console.log('Processando mensagem de mídia');
    
    const response = 'Desculpe, no momento só consigo processar mensagens de texto. Por favor, envie sua pergunta em texto.';
    
    await this.notificationService.sendMessage(parsedMessage.userId, response);
    
    return {
      action: 'media_rejected',
      response: response
    };
  }

  private async processInteractiveMessage(parsedMessage: ParsedMessage): Promise<any> {
    console.log('Processando mensagem interativa');
    
    const response = 'Interação recebida! Em breve implementaremos suporte completo para botões e listas.';
    
    await this.notificationService.sendMessage(parsedMessage.userId, response);
    
    return {
      action: 'interactive_processed',
      response: response
    };
  }

  private async processUnknownMessage(parsedMessage: ParsedMessage): Promise<any> {
    console.log('Processando mensagem desconhecida');
    
    const response = 'Tipo de mensagem não suportado. Por favor, envie uma mensagem de texto.';
    
    await this.notificationService.sendMessage(parsedMessage.userId, response);
    
    return {
      action: 'unknown_rejected',
      response: response
    };
  }
} 
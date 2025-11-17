import { WhatsappService } from './WhatsappService';
import { NotificationRepository } from '../../repositories/NotificationRepository';
import { TipoNotificacao, Advogado, Processo } from '@prisma/client';

// Interface para tipar corretamente a notificação com seus relacionamentos
interface NotificacaoCompleta {
  id: string;
  intimacao: {
    idDgen: string;
    dataPublicacao: Date;
    dataLimite: Date;
    prazo: number;
    tipoDocumento: string;
    tipoManifestacao?: string;
    regraAplicada: string;
    resumoIA: string | null;
    link: string | null;
    consequenciasPraticas: string | null;
    acoesSugeridas: string[];
    statusSistema: string | null;
    advogado: {
      id: string;
      nome: string;
      telefone: string;
    };
    processo: {
      numeroFormatado: string;
      autor: string;
      reu: string;
      tribunal: string;
      instancia: 'PRIMEIRA' | 'SEGUNDA';
    };
    tipoComunicacao?: string;
    tipoAgendamento?: string;
    horaAgendamento?: string;
  };
}

export class WhatsappNotificationService {
  private whatsappService: WhatsappService;
  private notificationRepository: NotificationRepository;

  constructor() {
    this.whatsappService = new WhatsappService();
    this.notificationRepository = new NotificationRepository();
  }

  async processarNotificacoesPendentes(): Promise<void> {
    console.log('[WhatsappNotificationService] Iniciando processamento de notificações pendentes');
    
    const notificacoes = await this.notificationRepository.buscarPendentes(TipoNotificacao.WHATSAPP) as NotificacaoCompleta[];
    console.log(`[WhatsappNotificationService] ${notificacoes.length} notificações encontradas`);

    for (const notificacao of notificacoes) {
      console.log(`[WhatsappNotificationService] Processando notificação:`, {
        id: notificacao.id,
        advogado: notificacao.intimacao?.advogado?.nome,
        telefone: notificacao.intimacao?.advogado?.telefone,
        processo: notificacao.intimacao?.processo?.numeroFormatado
      });

      try {
        const dataDisponibilizacao = new Date(notificacao.intimacao?.dataPublicacao);
        dataDisponibilizacao.setUTCHours(dataDisponibilizacao.getUTCHours() + 3);

        const dataLimite = new Date(notificacao.intimacao?.dataLimite);
        dataLimite.setUTCHours(dataLimite.getUTCHours() + 3);

        const instancia = notificacao.intimacao?.processo?.instancia === 'PRIMEIRA' ? '1ª Instância' : '2ª Instância';

        const mensagem = notificacao.intimacao.tipoAgendamento 
          ? `INTIMAÇÃO – ${notificacao.intimacao?.processo?.tribunal} (${instancia})

Processo nº ${notificacao.intimacao?.processo?.numeroFormatado}
Partes: ${notificacao.intimacao?.processo?.autor} *x* ${notificacao.intimacao?.processo?.reu}
⸻

Compromisso: ${notificacao.intimacao.tipoAgendamento}
Data: ${dataLimite.toLocaleDateString('pt-BR')}
Hora: ${notificacao.intimacao.horaAgendamento}
⸻

${notificacao.intimacao?.tipoDocumento}: ID ${notificacao.intimacao?.idDgen}
Resumo: ${notificacao.intimacao?.resumoIA}
⸻

Link do processo:
${notificacao.intimacao?.link || 'Não disponível'}
⸻

🗓️ Adicione lembrete no Google Agenda
${this.gerarLinkGoogleCalendar(notificacao)}`
          : `INTIMAÇÃO – ${notificacao.intimacao?.processo?.tribunal} (${instancia})

Processo nº ${notificacao.intimacao?.processo?.numeroFormatado}
Partes: ${notificacao.intimacao?.processo?.autor} *x* ${notificacao.intimacao?.processo?.reu}
⸻

Data da disponibilização: ${dataDisponibilizacao.toLocaleDateString('pt-BR')}
Prazo: ${notificacao.intimacao?.prazo} dias (Regra aplicada: ${notificacao.intimacao?.regraAplicada})
Prazo para manifestação: ${dataLimite.toLocaleDateString('pt-BR')}
⸻

${notificacao.intimacao?.tipoDocumento}: ID ${notificacao.intimacao?.idDgen}
Resumo: ${notificacao.intimacao?.resumoIA}
⸻

Link do processo:
${notificacao.intimacao?.link || 'Não disponível'}
⸻

🗓️ Adicione lembrete no Google Agenda
${this.gerarLinkGoogleCalendar(notificacao)}`;

        console.log('[DEBUG] Dados do agendamento:', {
          tipo: notificacao.intimacao.tipoAgendamento,
          hora: notificacao.intimacao.horaAgendamento || 'não informado'
        });

        console.log('[WhatsappNotificationService] Enviando mensagem:', {
          para: notificacao.intimacao.advogado.telefone,
          tamanhoMensagem: mensagem.length
        });

        const resultado = await this.whatsappService.send({
          to: notificacao.intimacao.advogado.telefone,
          text: mensagem
        });

        console.log('[WhatsappNotificationService] Resultado do envio:', {
          notificacaoId: notificacao.id,
          status: resultado.status,
          erro: resultado.errorMessage
        });

        await this.notificationRepository.atualizarStatus(
          notificacao.id,
          resultado.status === 'SENT' ? 'ENVIADO' : 'ERRO',
          resultado.errorMessage
        );

      } catch (error) {
        console.error(`[WhatsappNotificationService] Erro detalhado:`, {
          notificacaoId: notificacao.id,
          erro: error instanceof Error ? {
            message: error.message,
            name: error.name,
            stack: error.stack
          } : error
        });

        await this.notificationRepository.atualizarStatus(
          notificacao.id,
          'ERRO',
          error instanceof Error ? error.message : 'Erro desconhecido'
        );
      }
    }

    console.log('[WhatsappNotificationService] Finalizado processamento de notificações');
  }

  async sendMessage(userId: string, message: string): Promise<any> {
    try {
      console.log(`[WhatsappNotificationService] Enviando mensagem para ${userId}: ${message}`);
      
      const resultado = await this.whatsappService.send({
        to: userId,
        text: message
      });

      console.log('[WhatsappNotificationService] Resultado do envio:', {
        userId,
        status: resultado.status,
        erro: resultado.errorMessage
      });

      return resultado;
    } catch (error) {
      console.error(`[WhatsappNotificationService] Erro ao enviar mensagem:`, {
        userId,
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  }

  private gerarLinkGoogleCalendar(notificacao: NotificacaoCompleta): string {
    const dataLimite = new Date(notificacao.intimacao.dataLimite);
    dataLimite.setUTCHours(dataLimite.getUTCHours() + 3);

    const titulo = `${notificacao.intimacao.tipoManifestacao} ${notificacao.intimacao.tipoAgendamento || ''} | ${notificacao.intimacao.processo.numeroFormatado}`;
    
    // Criando o corpo do evento
    const detalhes = `${notificacao.intimacao.resumoIA || 'Não disponível'}`.trim();

    // Se tiver horário de agendamento, usa ele; se não, usa 09:00
    if (notificacao.intimacao.horaAgendamento) {
        const [hora, minuto] = notificacao.intimacao.horaAgendamento.split(':');
        dataLimite.setHours(parseInt(hora), parseInt(minuto));
    } else {
        dataLimite.setHours(9, 0); // 09:00 AM
    }
    
    const dataInicio = dataLimite.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const dataFim = new Date(dataLimite.setHours(dataLimite.getHours() + 1))
        .toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titulo)}&details=${encodeURIComponent(detalhes)}&dates=${dataInicio}/${dataFim}`;
  }
}
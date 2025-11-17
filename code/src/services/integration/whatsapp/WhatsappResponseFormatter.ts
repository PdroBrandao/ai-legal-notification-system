import { TextAnalysisService } from '../../analysis/TextAnalysisService';
import { Intimacao, Advogado, Processo } from '@prisma/client';

export interface IntimacaoCompleta extends Intimacao {
  advogado: Advogado;
  processo: Processo;
}

export class WhatsappResponseFormatter {
  private textAnalysisService: TextAnalysisService;

  constructor() {
    this.textAnalysisService = new TextAnalysisService();
  }

  async formatIntimacoesResponse(
    advogado: Advogado,
    intimacoes: IntimacaoCompleta[],
    dataConsulta: string
  ): Promise<string> {
    try {
      if (intimacoes.length === 0) {
        return `${advogado.nome}, não encontrei intimações para ${this.formatDate(dataConsulta)}.`;
      }

      const intimacoesText = intimacoes.map(intimacao => {
        const dataPublicacao = new Date(intimacao.dataPublicacao).toLocaleDateString('pt-BR');
        const prazo = intimacao.prazo;
        const resumo = intimacao.resumoIA || 'Sem resumo disponível';
        
        return {
          id: intimacao.idDgen,
          tribunal: intimacao.processo.tribunal,
          instancia: intimacao.processo.instancia === 'PRIMEIRA' ? '1ª Instância' : '2ª Instância',
          processo: intimacao.processo.numeroFormatado,
          dataPublicacao,
          prazo,
          resumo
        };
      });

      const prompt = `Formate a seguinte lista de intimações de forma natural e amigável para WhatsApp:

ADVOGADO: ${advogado.nome}
DATA CONSULTADA: ${this.formatDate(dataConsulta)}
QUANTIDADE: ${intimacoes.length} intimação(ões)

INTIMAÇÕES:
${JSON.stringify(intimacoesText, null, 2)}

Formate a resposta seguindo este padrão:
"Fulano, hoje você teve *X* intimações:

📋 [ID], [Tribunal], proc. [número], publ. [data], Prazo [X]d (até *[data limite]*). [resumo].

📋 [próxima intimação...]"

IMPORTANTE:
- Use *texto* para negrito no WhatsApp
- Use 📋 como ícone para cada intimação
- Destaque a quantidade com negrito: "*X* intimações"
- Prazo em dias: "10d"
- Inclua a data limite do prazo: "(até DD/MM/AAAA)"
- Use linguagem natural, seja conciso mas informativo
- Se houver apenas uma intimação, use singular: "*1* intimação"
- Se houver múltiplas, use plural: "*X* intimações"

Responda APENAS com o texto formatado, sem explicações adicionais.`;

      const response = await this.textAnalysisService.analyzeMessage(prompt);
      
      if (response.status === 'valid' && response.response) {
        return response.response;
      } else {
        console.log('GPT falhou na formatação, usando fallback');
        // Fallback se o GPT falhar
        return this.formatFallbackResponse(advogado, intimacoes, dataConsulta);
      }
    } catch (error) {
      console.error('Erro ao formatar resposta:', error);
      return this.formatFallbackResponse(advogado, intimacoes, dataConsulta);
    }
  }

  private formatFallbackResponse(
    advogado: Advogado,
    intimacoes: IntimacaoCompleta[],
    dataConsulta: string
  ): string {
    const dataFormatada = this.formatDate(dataConsulta);
    
    if (intimacoes.length === 0) {
      return `${advogado.nome}, não encontrei intimações para ${dataFormatada}.`;
    }

    // Destaque a quantidade com negrito
    const quantidade = intimacoes.length;
    const textoQuantidade = quantidade === 1 ? '*1* intimação' : `*${quantidade}* intimações`;
    
    let response = `${advogado.nome}, ${dataFormatada} você teve ${textoQuantidade}:\n\n`;

    intimacoes.forEach((intimacao, index) => {
      const dataPublicacao = new Date(intimacao.dataPublicacao).toLocaleDateString('pt-BR');
      const instancia = intimacao.processo.instancia === 'PRIMEIRA' ? '1ª Instância' : '2ª Instância';
      const resumo = intimacao.resumoIA || 'Sem resumo disponível';
      
      // Formatar data limite do prazo
      let prazoInfo = '';
      if (intimacao.dataLimite) {
        const dataLimite = new Date(intimacao.dataLimite).toLocaleDateString('pt-BR');
        prazoInfo = `Prazo: *${intimacao.prazo} dias* (até ${dataLimite})`;
      } else {
        prazoInfo = `Prazo: *${intimacao.prazo} dias*`;
      }
      
      response += `📋 Intimação *${intimacao.idDgen}*, *${intimacao.processo.tribunal}* ${instancia}, proc. *${intimacao.processo.numeroFormatado}*, publicada em *${dataPublicacao}*. ${prazoInfo}. ${resumo}.\n\n`;
    });

    return response.trim();
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'ontem';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  }

  async formatPrazosVencendoResponse(
    advogado: Advogado,
    prazosVencendo: IntimacaoCompleta[],
    dataConsulta: string
  ): Promise<string> {
    try {
      if (prazosVencendo.length === 0) {
        return `${advogado.nome}, não encontrei prazos vencendo para ${this.formatDate(dataConsulta)}.`;
      }

      const quantidade = prazosVencendo.length;
      const textoQuantidade = quantidade === 1 ? '*1* prazo vencendo' : `*${quantidade}* prazos vencendo`;
      
      let response = `${advogado.nome}, ${this.formatDate(dataConsulta)} você tem ${textoQuantidade}:\n\n`;

      prazosVencendo.forEach((intimacao) => {
        const dataLimite = new Date(intimacao.dataLimite!).toLocaleDateString('pt-BR');
        const resumo = intimacao.resumoIA || 'Sem resumo disponível';
        
        response += `⏰ Prazo *${intimacao.prazo} dias* (até *${dataLimite}*), proc. *${intimacao.processo.numeroFormatado}*, ${intimacao.processo.tribunal}. ${resumo}.\n\n`;
      });

      return response.trim();
    } catch (error) {
      console.error('Erro ao formatar prazos vencendo:', error);
      return `${advogado.nome}, ocorreu um erro ao formatar seus prazos vencendo.`;
    }
  }

  async formatComparecimentoResponse(
    advogado: Advogado,
    comparecimentos: IntimacaoCompleta[],
    dataConsulta: string,
    proximo?: boolean
  ): Promise<string> {
    try {
      if (comparecimentos.length === 0) {
        if (proximo) {
          return `${advogado.nome}, não encontrei próximos comparecimentos agendados.`;
        }
        return `${advogado.nome}, não encontrei comparecimentos para ${this.formatDate(dataConsulta)}.`;
      }

      if (proximo && comparecimentos.length === 1) {
        const comparecimento = comparecimentos[0];
        const dataComparecimento = new Date(comparecimento.dataComparecimento!).toLocaleDateString('pt-BR');
        const hora = comparecimento.horarioComparecimento || 'horário não informado';
        const tipo = this.formatTipoComparecimento(comparecimento.tipoComparecimento!);
        
        return `${advogado.nome}, seu próximo comparecimento é um(a) *${tipo}* do proc. *${comparecimento.processo.numeroFormatado}* no dia *${dataComparecimento}* às *${hora}*.`;
      }

      const quantidade = comparecimentos.length;
      const textoQuantidade = quantidade === 1 ? '*1* comparecimento' : `*${quantidade}* comparecimentos`;
      
      let response = `${advogado.nome}, ${this.formatDate(dataConsulta)} você tem ${textoQuantidade}:\n\n`;

      comparecimentos.forEach((comparecimento) => {
        const dataComparecimento = new Date(comparecimento.dataComparecimento!).toLocaleDateString('pt-BR');
        const hora = comparecimento.horarioComparecimento || 'horário não informado';
        const tipo = this.formatTipoComparecimento(comparecimento.tipoComparecimento!);
        
        response += `📅 *${tipo}* do proc. *${comparecimento.processo.numeroFormatado}* no dia *${dataComparecimento}* às *${hora}*.\n\n`;
      });

      return response.trim();
    } catch (error) {
      console.error('Erro ao formatar comparecimentos:', error);
      return `${advogado.nome}, ocorreu um erro ao formatar seus comparecimentos.`;
    }
  }

  async formatDetalhesIntimacaoResponse(
    advogado: Advogado,
    intimacao: IntimacaoCompleta,
    tipoDetalhe: string
  ): Promise<string> {
    try {
      let response = `${advogado.nome}, aqui estão os detalhes da intimação *${intimacao.idDgen}*:\n\n`;

      if (tipoDetalhe === 'prazo' || tipoDetalhe === 'todos') {
        const dataLimite = new Date(intimacao.dataLimite!).toLocaleDateString('pt-BR');
        response += `⏰ *Prazo:* ${intimacao.prazo} dias (até ${dataLimite})\n`;
      }

      if (tipoDetalhe === 'resumo' || tipoDetalhe === 'todos') {
        const resumo = intimacao.resumoIA || 'Sem resumo disponível';
        response += `📋 *Resumo:* ${resumo}\n`;
      }

      if (tipoDetalhe === 'acoes_sugeridas' || tipoDetalhe === 'todos') {
        const acoes = intimacao.acoesSugeridas?.join(', ') || 'Sem ações sugeridas';
        response += `✅ *Ações sugeridas:* ${acoes}\n`;
      }

      if (tipoDetalhe === 'todos') {
        response += `\n📄 *Processo:* ${intimacao.processo.numeroFormatado}\n`;
        response += `🏛️ *Tribunal:* ${intimacao.processo.tribunal}\n`;
        response += `📅 *Data publicação:* ${new Date(intimacao.dataPublicacao).toLocaleDateString('pt-BR')}\n`;
      }

      return response.trim();
    } catch (error) {
      console.error('Erro ao formatar detalhes da intimação:', error);
      return `${advogado.nome}, ocorreu um erro ao formatar os detalhes da intimação.`;
    }
  }

  private formatTipoComparecimento(tipo: string): string {
    switch (tipo) {
      case 'AUDIENCIA':
        return 'Audiência';
      case 'PERICIA':
        return 'Perícia';
      case 'PAUTA_DE_JULGAMENTO':
        return 'Pauta de Julgamento';
      default:
        return tipo;
    }
  }
} 
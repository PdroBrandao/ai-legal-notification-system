import { TextAnalysisService } from '../../analysis/TextAnalysisService';

export interface ExtractedIntent {
  intent: 'buscar_intimacoes' | 'consultar_prazos_vencendo' | 'consultar_comparecimento' | 'consultar_detalhes_intimacao' | 'outro';
  entities: {
    data?: string; // formato: YYYY-MM-DD
    dataRelativa?: 'hoje' | 'ontem' | 'amanha';
    tipoComparecimento?: 'AUDIENCIA' | 'PERICIA' | 'PAUTA_DE_JULGAMENTO';
    idIntimacao?: string; // idDgen
    tipoDetalhe?: 'prazo' | 'resumo' | 'acoes_sugeridas' | 'todos';
    proximo?: boolean; // para "próxima audiência"
  };
  confidence: number;
  fallback?: boolean;
}

export class WhatsappIntentExtractor {
  private textAnalysisService: TextAnalysisService;

  constructor() {
    this.textAnalysisService = new TextAnalysisService();
  }

  async extractIntent(message: string): Promise<ExtractedIntent> {
    try {
      const prompt = `Analise a seguinte mensagem do WhatsApp e extraia a intenção e entidades:

MENSAGEM: "${message}"

Extraia apenas as seguintes informações em formato JSON:
- intent: uma das opções:
  - "buscar_intimacoes" - quando quer consultar intimações gerais
  - "consultar_prazos_vencendo" - quando pergunta sobre prazos vencendo hoje/amanhã
  - "consultar_comparecimento" - quando pergunta sobre audiências, perícias, julgamentos
  - "consultar_detalhes_intimacao" - quando quer detalhes de uma intimação específica
  - "outro" - quando não se encaixa em nenhuma das anteriores

- entities: objeto com:
  - data: data específica no formato YYYY-MM-DD (ex: "2025-07-08") se mencionada
  - dataRelativa: "hoje", "ontem" ou "amanha" se mencionada
  - tipoComparecimento: "AUDIENCIA", "PERICIA" ou "PAUTA_DE_JULGAMENTO" se mencionado
  - idIntimacao: ID da intimação (idDgen) se mencionado
  - tipoDetalhe: "prazo", "resumo", "acoes_sugeridas" ou "todos" se mencionado
  - proximo: true se mencionar "próxima", "próximo", "próximos", "julgamento", "audiência", "perícia" sem data específica

- confidence: número entre 0 e 1 indicando confiança na extração
- fallback: true se a intenção não for clara

REGRAS IMPORTANTES:
1. Para comparecimentos/julgamentos:
   - Se mencionar "julgamento", "audiência", "perícia" sem data específica → intent: "consultar_comparecimento", proximo: true
   - Se mencionar "próximo", "próxima" → intent: "consultar_comparecimento", proximo: true
   - Se mencionar "que dia", "quando", "qual dia" sobre julgamento, pericia, audiencia → intent: "consultar_comparecimento", proximo: true
   - Se mencionar "será", "vai ser" sobre julgamento → intent: "consultar_comparecimento", proximo: true
   - Se mencionar data específica → intent: "consultar_comparecimento", data: "YYYY-MM-DD"
   
2. PALAVRAS-CHAVE para proximo = true:
   - "próximo", "próxima", "próximos", "próximas"
   - "julgamento" (sem data específica)
   - "audiência" (sem data específica)
   - "perícia" (sem data específica)
   - "que dia é", "qual dia será", "quando será"

EXEMPLOS:
- "Quais minhas intimações hoje?" → intent: "buscar_intimacoes"
- "Tenho prazos vencendo hoje?" → intent: "consultar_prazos_vencendo"
- "Qual minha próxima audiência?" → intent: "consultar_comparecimento", proximo: true
- "Qual meu próximo julgamento?" → intent: "consultar_comparecimento", proximo: true
- "Que dia é meu julgamento?" → intent: "consultar_comparecimento", proximo: true
- "Qual dia será meu julgamento?" → intent: "consultar_comparecimento", proximo: true
- "Próximo julgamento?" → intent: "consultar_comparecimento", proximo: true
- "Tenho audiência amanhã?" → intent: "consultar_comparecimento", dataRelativa: "amanha", tipoComparecimento: "AUDIENCIA"
- "Detalhes da intimação 256927443" → intent: "consultar_detalhes_intimacao", idIntimacao: "256927443"

Responda APENAS com o JSON válido, sem explicações adicionais.`;

      const response = await this.textAnalysisService.analyzeMessage(prompt);
      
      if (response.status === 'valid' && response.response) {
        const extracted = JSON.parse(response.response);
        // LOG DE DEBUG
        console.log('[INTENT DEBUG] Mensagem recebida:', message);
        console.log('[INTENT DEBUG] Intenção extraída:', JSON.stringify(extracted, null, 2));
        // Normalizar a data se for relativa
        if (extracted.entities?.dataRelativa && !extracted.entities.data) {
          extracted.entities.data = this.normalizeRelativeDate(extracted.entities.dataRelativa);
        }
        
        return extracted;
      } else {
        // Fallback se a análise falhar
        return {
          intent: 'outro',
          entities: {},
          confidence: 0.1,
          fallback: true
        };
      }
    } catch (error) {
      console.error('Erro ao extrair intenção:', error);
      return {
        intent: 'outro',
        entities: {},
        confidence: 0.1,
        fallback: true
      };
    }
  }

  private normalizeRelativeDate(relativeDate: string): string {
    const today = new Date();
    
    switch (relativeDate) {
      case 'hoje':
        return today.toISOString().split('T')[0];
      case 'ontem':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
      case 'amanha':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      default:
        return today.toISOString().split('T')[0];
    }
  }
} 
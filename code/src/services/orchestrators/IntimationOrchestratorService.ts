import { environment } from "../../config/environment";
import {
  Intimacao,
  IntimacaoResponse,
  LlmAnalysisResponse,
  APIIntimacao,
  JsonValidationResult,
} from "../../types/interfaces";
import {
  getCurrentDate,
  addBusinessDays,
  formatDateForAPI,
  getSearchDate,
} from "../../utils/dateUtils";
import { handleJsonResponse } from "../../utils/jsonUtils";
import { TextAnalysisService } from "../analysis/TextAnalysisService";
import { FeriadosService } from "../repositories/HolidaysRepository";
import { PrismaClient } from '@prisma/client';
import { ExecutionLogService } from '../logging/ExecutionLogService';
import { QueryLogService } from '../logging/QueryLogService';
import { IntimacaoRepository } from '../repositories/IntimationRepository';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { WhatsappNotificationService } from '../integration/whatsapp/WhatsappNotificationService';
import { Tribunal } from "../../config/environment";
import { FERIADOS } from '../../config/feriados';

interface AdvogadoInfo {
  id: string;
  nome: string;
}

export class IntimacaoService {
  private intimacoesPorAdvogado: Record<string, Intimacao[]> = {};
  private advogados: AdvogadoInfo[] = [];
  private TextAnalysisService: TextAnalysisService;
  private prisma: PrismaClient;
  private executionLogService: ExecutionLogService;
  private queryLogService: QueryLogService;
  private intimacaoRepository: IntimacaoRepository;
  private notificationRepository: NotificationRepository;

  constructor() {
    this.TextAnalysisService = new TextAnalysisService();
    this.prisma = new PrismaClient();
    this.executionLogService = new ExecutionLogService();
    this.queryLogService = new QueryLogService();
    this.intimacaoRepository = new IntimacaoRepository();
    this.notificationRepository = new NotificationRepository();
  }

  private async inicializarAdvogados(): Promise<void> {
    this.advogados = await this.prisma.advogado.findMany({
      where: { ativo: true },
      select: { id: true, nome: true }
    });

    this.advogados.forEach(advogado => {
      this.intimacoesPorAdvogado[advogado.nome] = [];
    });
  }

  private async fetchIntimacoes(advogado: AdvogadoInfo, execucaoLogId?: string): Promise<IntimacaoResponse> {
    const startTime = Date.now();
    const searchDate = formatDateForAPI(new Date(getSearchDate()));
    
    try {
      const url = `${environment.API_URL}?nomeAdvogado=${advogado.nome}&dataDisponibilizacaoInicio=${searchDate}&dataDisponibilizacaoFim=${searchDate}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      const tempoRespostaMs = Date.now() - startTime;

      // Converte Headers para objeto plano
      const requestHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        requestHeaders[key] = value;
      });

      // Registra log da consulta
      await this.queryLogService.registrarConsulta({
        advogadoId: advogado.id,
        tribunal: 'DJEN',
        parametrosBusca: { nomeAdvogado: advogado.nome, dataConsulta: searchDate },
        execucaoLogId,
        httpStatus: response.status,
        requestId: response.headers.get('x-request-id') || undefined, // Convertendo null para undefined
        requestHeaders,
        qtdResultados: data.items?.length || 0,
        tempoRespostaMs,
        status: 'SUCESSO'
      });

      return data as IntimacaoResponse;

    } catch (error) {
      const tempoRespostaMs = Date.now() - startTime;

      // Registra log de erro
      await this.queryLogService.registrarConsulta({
        advogadoId: advogado.id,
        tribunal: 'DJEN',
        parametrosBusca: { nomeAdvogado: advogado.nome, dataConsulta: searchDate },
        execucaoLogId,
        qtdResultados: 0,
        tempoRespostaMs,
        erro: error as Error,
        status: 'ERRO'
      });

      // Tratamento específico para erro de timeout
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.error(`[ERROR] Timeout ao buscar intimações para ${advogado.nome}`);
        } else {
          console.error(
            `[ERROR] Falha ao buscar intimações para ${advogado.nome}:`,
            error.message
          );
        }
      }

      // Retorna uma resposta vazia mas válida para não quebrar o fluxo
      return {
        status: "error",
        items: [], // Removido o campo 'message' pois não está na interface
        count: 0, // Adicionado campo 'count'
      };
    }
  }

  private async analisarTexto(texto: string): Promise<JsonValidationResult<LlmAnalysisResponse>> {
    const { analise } = await this.TextAnalysisService.analisarTexto(texto);
    return analise;
  }

  private mapearIntimacao(item: APIIntimacao, analise: LlmAnalysisResponse): Intimacao {
    const tribunal = item.siglaTribunal as Tribunal;
    
    // Aplica o algoritmo de prazos
    const { prazo, regraAplicada, dataLimite } = this.determinaPrazo(analise, tribunal);

    return {
      id: item.id,
      idDgen: item.id,
      data_disponibilizacao: item.data_disponibilizacao,
      dataPublicacao: item.data_disponibilizacao,
      sigla_tribunal: item.siglaTribunal,
      tipo_comunicacao: item.tipoComunicacao,
      texto: item.texto,
      tipo_ato: analise.tipo_ato,
      prazo: prazo,
      data_esperada_manifestacao: dataLimite ? dataLimite.toISOString() : new Date().toISOString(),
      base_legal_prazo: analise.base_legal_prazo || undefined,
      numeroComunicacao: item.numeroComunicacao,
      hash: item.hash,
      meio: item.meio,
      meiocompleto: item.meiocompleto,
      link: item.link,
      tipoDocumento: item.tipoDocumento,
      resumoIA: analise.resumo || undefined,
      tipoManifestacao: analise.tipo_ato || undefined,
      regraAplicada,
      consequenciasPraticas: analise.consequencias_praticas,
      acoesSugeridas: analise.acoes_sugeridas,
      statusSistema: analise.status_sistema,
      dataInicioPrazo: new Date(item.data_disponibilizacao).toISOString(),
      dataLimite: dataLimite ? dataLimite.toISOString() : new Date().toISOString(),
      
      // Flags
      isJuizado: false, //retirado
      isRecursoInominado: false, //retirado
      isContrarazoesInominado: false, //retirado
      
      // Campos de agendamento
      tipoComparecimento: analise.tipo_comparecimento || null,
      dataComparecimento: analise.data_comparecimento ? new Date(analise.data_comparecimento) : null,
      horarioComparecimento: analise.horario_comparecimento || null,
      
      // Processo (agora com os campos corretos)
      processo: {
        numeroProcesso: item.numero_processo,
        numeroFormatado: item.numeroprocessocommascara,
        vara: item.nomeOrgao,
        nomeOrgao: item.nomeOrgao,
        classeProcessual: item.nomeClasse,
        autor: item.destinatarios?.find(d => d.polo === "A")?.nome || "Não informado",
        reu: analise.reu || "Não informado",
        instancia: analise.instancia,
        categoria: analise.categoria_processual
      }
    };
  }

  private async processarIntimacao(advogado: AdvogadoInfo, execucaoLogId?: string): Promise<void> {
    console.log(`[LOG] Buscando intimações para: ${advogado.nome}...`);

    const response = await this.fetchIntimacoes(advogado, execucaoLogId);
    
    // Log da resposta completa do DGEN
    console.log('[DEBUG] Resposta completa do DGEN:', JSON.stringify(response, null, 2));

    if (response?.status === 'success') {
      await this.executionLogService.atualizarContadores(true);
    } else {
      await this.executionLogService.atualizarContadores(false);
    }

    if (!response || !response.status || response.status !== "success") {
      console.warn(`[WARN] Nenhum dado retornado para ${advogado.nome}.`);
      return;
    }

    for (const item of response.items) {
      try {
        const intimacaoExistente = await this.intimacaoRepository.buscarPorIdDgen(item.id, advogado.id);
        
        if (intimacaoExistente) {
          console.log(`[INFO] Intimação ${item.id} já existe para o advogado ${advogado.nome}. Pulando...`);
          continue;
        }

        // Log do item individual
        //console.log('[DEBUG] Item da intimação:', JSON.stringify(item, null, 2));

        const dataDisponibilizacao = new Date(item.data_disponibilizacao + "T00:00:00-03:00");
        const dataDesejada = new Date(getSearchDate() + "T00:00:00-03:00");

        if (dataDisponibilizacao.toISOString().split("T")[0] !== dataDesejada.toISOString().split("T")[0]) {
          console.log(`[LOG] Pulando intimação de ${dataDisponibilizacao.toLocaleDateString()} - fora do período desejado`);
          continue;
        }

        const { analise, dadosIA } = await this.TextAnalysisService.analisarTexto(item.texto);
        
        // Log da resposta da análise
        console.log('[DEBUG] Resposta da análise:', JSON.stringify(analise, null, 2));

        if (analise.status === "valid" && typeof analise.response !== "string") {
          console.log("[LOG] Prazo de manifestação:", analise.response.prazo);
          
          const intimacao = this.mapearIntimacao(item, analise.response);
          await this.aplicaPrazo(intimacao);

          // No método processarIntimacao, após a análise
          console.log('[DEBUG] Horário do agendamento na análise:', {
            horaAnalise: analise.response.horario_comparecimento,
            tipoAgendamento: analise.response.tipo_comparecimento
          });

          // Passa a análise como parâmetro
          const infoProcesso = await this.extrairInformacoesProcesso(
            item.texto, 
            analise.response,
            item
          );

          // Antes de chamar criarComProcesso
          console.log('[DEBUG] Valores antes de salvar:', {
            horarioComparecimento: intimacao.horarioComparecimento,
            dataComparecimento: intimacao.dataComparecimento,
            tipoComparecimento: intimacao.tipoComparecimento
          });

          // Salva a intimação no banco com as informações extraídas
          const intimacaoSalva = await this.intimacaoRepository.criarComProcesso({
            advogadoId: advogado.id,
            numeroProcesso: item.numero_processo,
            vara: infoProcesso.vara,
            tribunal: this.validaTribunal(item.siglaTribunal),
            classeProcessual: item.nomeClasse,
            autor: infoProcesso.autor,
            reu: infoProcesso.reu,
            nomeOrgao: item.nomeOrgao,
            numeroFormatado: item.numeroprocessocommascara,
            // Campos da intimação
            numeroComunicacao: item.numeroComunicacao,
            hash: item.hash,
            dataPublicacao: new Date(item.data_disponibilizacao),
            dataInicioPrazo: new Date(intimacao.data_disponibilizacao),
            prazo: intimacao.prazo || 0,
            dataLimite: new Date(intimacao.data_esperada_manifestacao || ''),
            conteudo: item.texto,
            resumoIA: analise.status === "valid" && typeof analise.response !== "string" ? analise.response.resumo : undefined,
            tipoManifestacao: analise.status === "valid" && typeof analise.response !== "string" ? analise.response.tipo_ato : undefined,
            baseLegalPrazo: analise.status === "valid" && typeof analise.response !== "string" ? analise.response.base_legal_prazo : undefined,
            tipoDocumento: item.tipoDocumento,
            meio: item.meio,
            meiocompleto: item.meiocompleto,
            link: item.link,
            id: item.id,
            status: 'PENDENTE',
            
            // Novos campos da análise
            consequenciasPraticas: analise.status === "valid" && typeof analise.response !== "string" 
              ? analise.response.consequencias_praticas 
              : undefined,
            acoesSugeridas: analise.status === "valid" && typeof analise.response !== "string" 
              ? analise.response.acoes_sugeridas 
              : undefined,
            statusSistema: analise.status === "valid" && typeof analise.response !== "string" 
              ? analise.response.status_sistema 
              : undefined,
            
            // Campos de classificação
            isJuizado: analise.status === "valid" && typeof analise.response !== "string" 
              ? analise.response.is_juizado 
              : false,
            isRecursoInominado: analise.status === "valid" && typeof analise.response !== "string" 
              ? analise.response.is_recurso_inominado 
              : false,
            isContrarazoesInominado: analise.status === "valid" && typeof analise.response !== "string" 
              ? analise.response.is_contrarazoes_inominado 
              : false,
            
            // Campo de rastreamento da regra
            regraAplicada: intimacao.regraAplicada,
            tipoComparecimento: intimacao.tipoComparecimento,
            dataComparecimento: intimacao.dataComparecimento,
            horarioComparecimento: intimacao.horarioComparecimento,
            instancia: analise.response.instancia,
            categoria: analise.response.categoria_processual,
          });

          // Converter para o formato da interface Intimacao
          const intimacaoFormatada: Intimacao = {
            id: intimacaoSalva.id,
            idDgen: item.id,
            data_disponibilizacao: intimacaoSalva.dataPublicacao.toISOString(),
            dataPublicacao: intimacaoSalva.dataPublicacao.toISOString(),
            sigla_tribunal: item.siglaTribunal,
            tipo_comunicacao: intimacaoSalva.tipoManifestacao || '',
            texto: intimacaoSalva.conteudo,
            tipo_ato: intimacaoSalva.resumoIA || undefined,
            prazo: intimacaoSalva.prazo,
            data_esperada_manifestacao: intimacaoSalva.dataLimite?.toISOString() || '',
            base_legal_prazo: intimacaoSalva.baseLegalPrazo || undefined,
            numeroComunicacao: intimacaoSalva.numeroComunicacao,
            hash: intimacaoSalva.hash,
            meio: item.meio,
            meiocompleto: item.meiocompleto,
            link: item.link || undefined,
            tipoDocumento: item.tipoDocumento || undefined,
            // Campos obrigatórios que faltavam
            dataInicioPrazo: intimacaoSalva.dataInicioPrazo.toISOString(),
            dataLimite: intimacaoSalva.dataLimite?.toISOString() || '',
            // Flags de classificação
            isJuizado: intimacaoSalva.isJuizado,
            isRecursoInominado: intimacaoSalva.isRecursoInominado,
            isContrarazoesInominado: intimacaoSalva.isContrarazoesInominado,
            regraAplicada: intimacaoSalva.regraAplicada,
            consequenciasPraticas: intimacaoSalva.consequenciasPraticas || undefined,
            acoesSugeridas: intimacaoSalva.acoesSugeridas || [],
            statusSistema: intimacaoSalva.statusSistema || undefined,
            // Adicionando objeto processo
            processo: {
              numeroProcesso: item.numero_processo,
              numeroFormatado: item.numeroprocessocommascara,
              vara: item.nomeOrgao,
              nomeOrgao: item.nomeOrgao,
              classeProcessual: item.nomeClasse,
              autor: item.destinatarios?.find(d => d.polo === "A")?.nome || "Não informado",
              reu: analise.response.reu || "Não informado",
              instancia: analise.response.instancia,
              categoria: analise.response.categoria_processual
            },
            tipoComparecimento: intimacaoSalva.tipoComparecimento,
            dataComparecimento: intimacaoSalva.dataComparecimento,
            horarioComparecimento: intimacaoSalva.horarioComparecimento,
          };

          // Após criar a intimação com sucesso, persiste os dados da análise
          await this.TextAnalysisService.persistirAnalise(intimacaoSalva.id, dadosIA);


          console.log(`[LOG] Intimação ${intimacaoSalva.id} salva com sucesso`);
          this.intimacoesPorAdvogado[advogado.nome].push(intimacaoFormatada);

          await this.criarNotificacao(intimacaoFormatada);

          // Após salvar a intimação
          console.log('[DEBUG] Valores após salvar:', {
            horarioComparecimentoSalvo: intimacaoSalva.horarioComparecimento,
            dataComparecimentoSalva: intimacaoSalva.dataComparecimento,
            tipoComparecimentoSalvo: intimacaoSalva.tipoComparecimento
          });
        } else {
          console.warn("[WARN]: Modelo respondeu com JSON inválido:", analise.response);
        }
      } catch (error) {
        console.error(`[ERROR] Falha ao processar intimação:`, error);
      }
    }
  }

  // Novo método para extrair informações do processo do texto
  private async extrairInformacoesProcesso(texto: string, analise: LlmAnalysisResponse, item: APIIntimacao) {
    // Encontra o destinatário do polo ATIVO (autor)
    const autor = item.destinatarios?.find(d => d.polo === "A")?.nome || "Não informado";

    return {
      numeroProcesso: item.numero_processo,
      vara: item.nomeOrgao || "Não informado",
      classeProcessual: item.nomeClasse || "Não informado",
      autor: autor,
      reu: analise.reu || "Não informado",
    };
  }

  private async criarNotificacao(intimacao: Intimacao): Promise<void> {
    //if (intimacao.advogado.whatsappVerificado) {
      await this.notificationRepository.criar({
        intimacaoId: intimacao.id,
        tipo: 'WHATSAPP',
        status: 'PENDENTE'
      });
    //}
  }

  public async processarTodasIntimacoes(): Promise<Record<string, Intimacao[]>> {
    console.log("[INFO] Iniciando processamento de intimações");
    
    try {
      await this.inicializarAdvogados();
      
      const execLog = await this.executionLogService.iniciarExecucao(
        this.advogados.map(a => a.nome).join(', ')
      );

      for (const advogado of this.advogados) {
        await this.processarIntimacao(advogado, execLog.id);
      }

      const total = Object.values(this.intimacoesPorAdvogado).reduce(
        (acc, arr) => acc + arr.length,
        0
      );
      console.log(`[INFO] Total de intimações processadas: ${total}`);

      // Processa as notificações WhatsApp pendentes
      console.log('[INFO] Iniciando processamento de notificações WhatsApp');
      const whatsappService = new WhatsappNotificationService();
      await whatsappService.processarNotificacoesPendentes();
      console.log('[INFO] Finalizado processamento de notificações WhatsApp');

      await this.executionLogService.finalizarExecucao();

      return this.intimacoesPorAdvogado;

    } catch (error) {
      await this.executionLogService.finalizarExecucao(error as Error);
      throw error;
    }
  }

  private determinaPrazo(analise: LlmAnalysisResponse, tribunal: Tribunal): {
    prazo: number;
    regraAplicada: string;
    dataLimite?: Date | null;
  } {
    // 1. Prazo explícito no texto
    if (analise.prazo !== null) {
      return {
        prazo: analise.prazo,
        regraAplicada: "PRAZO NO TEXTO"
      };
    }

    // 2. Audiência
    if (analise.tipo_comparecimento === 'AUDIENCIA' && analise.data_comparecimento) {
      return {
        prazo: 0,
        regraAplicada: "AUDIÊNCIA",
        dataLimite: null
      };
    }

    // 3. Perícia
    if (analise.tipo_comparecimento === 'PERICIA' && analise.data_comparecimento) {
      return {
        prazo: 0,
        regraAplicada: "PERICIA",
        dataLimite: null
      };
    }

    // 4. Pauta de julgamento
    if (analise.tipo_comparecimento === 'PAUTA_DE_JULGAMENTO' && analise.data_comparecimento) {
      return {
        prazo: 0,
        regraAplicada: "PAUTA DE JULGAMENTO",
        dataLimite: null
      };
    }

    // 4. Regras específicas por tribunal
    if (tribunal === 'TRT3') {
      if (analise.categoria_processual === 'TRABALHO') {
        return {
          prazo: 8,
          regraAplicada: "TRT TRABALHO"
        };
      }
    }

    if (tribunal === 'TJMG') {
      if (analise.categoria_processual === 'JUIZADO') {
        return {
          prazo: 10,
          regraAplicada: "TJMG JUIZADO"
        };
      }
      if (analise.categoria_processual === 'CIVIL') {
        return {
          prazo: 15,
          regraAplicada: "TJMG CIVIL"
        };
      }
      if (analise.categoria_processual === 'CRIMINAL') {
        return {
          prazo: 15,
          regraAplicada: "TJMG CRIMINAL"
        };
      }
    }

    if (tribunal === 'TRF6') {
      return {
        prazo: 15,
        regraAplicada: "TRF"
      };
    }

    // Caso padrão
    return {
      prazo: 5,
      regraAplicada: "PADRÃO"
    };
  }

  private async aplicaPrazo(intimacao: Intimacao): Promise<void> {
    // PASSO 1: Verifica se é audiência ou perícia
    if (intimacao.tipoComparecimento === 'AUDIENCIA' || intimacao.tipoComparecimento === 'PERICIA' || intimacao.tipoComparecimento === 'PAUTA_DE_JULGAMENTO') {
        try {
            console.log('[DEBUG] Processando agendamento:', {
                tipo: intimacao.tipoComparecimento,
                data: intimacao.dataComparecimento,
                isDate: intimacao.dataComparecimento instanceof Date
            });

            let dataValida: Date | null = null;

            // Verifica se já é uma data válida
            if (intimacao.dataComparecimento instanceof Date) {
                dataValida = intimacao.dataComparecimento;
            } 
            // Se for string, tenta converter
            else if (typeof intimacao.dataComparecimento === 'string') {
                const dataConvertida = new Date(intimacao.dataComparecimento);
                if (!isNaN(dataConvertida.getTime())) {
                    dataValida = dataConvertida;
                }
            }

            // Se temos uma data válida, atualiza a intimação
            if (dataValida && !isNaN(dataValida.getTime())) {
                intimacao.dataComparecimento = dataValida;
                intimacao.data_esperada_manifestacao = '';
                intimacao.dataLimite = null;
            } else {
                intimacao.dataComparecimento = null;
            }
            return;
        } catch (error) {
            console.error('[ERROR] Falha ao processar data de agendamento:', {
                dataOriginal: intimacao.dataComparecimento,
                erro: error
            });
            intimacao.dataComparecimento = null;
        }
    }

    // PASSO 2: Para outros casos, calcula o prazo normal
    const dataInicioPrazo = new Date(intimacao.data_disponibilizacao);
    dataInicioPrazo.setDate(dataInicioPrazo.getDate() + 1);

    // PASSO 3: Define o prazo (usa prazo definido ou default)
    const prazo = intimacao.prazo || 5;
    
    // PASSO 4: Pega os feriados da configuração ao invés do banco
    const tribunal = this.validaTribunal(intimacao.sigla_tribunal);
    const feriadosTribunal = FERIADOS[tribunal];

    // PASSO 5: Calcula data limite considerando dias úteis
    const dataLimiteStr = addBusinessDays(dataInicioPrazo, prazo, feriadosTribunal);
    const [dia, mes, ano] = dataLimiteStr.split('/');
    intimacao.data_esperada_manifestacao = `20${ano}-${mes}-${dia}T00:00:00-03:00`;
  }

  private validaTribunal(sigla: string): Tribunal {
    return sigla as Tribunal;  // Cast direto para Tribunal
  }
}

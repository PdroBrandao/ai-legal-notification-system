import { environment } from "../../config/environment";
import {
  Intimacao,
  IntimacaoResponse,
  LlmAnalysisResponse,
  APIIntimacao,
} from "../../types/interfaces";
import {
  addBusinessDays,
  formatDateForAPI,
  getSearchDate,
} from "../../utils/dateUtils";
import { TextAnalysisService } from "../analysis/TextAnalysisService";
import { Tribunal } from "../../config/environment";
import { HOLIDAYS } from '../../config/holidays';
import { Logger } from '../../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

interface LawyerInfo {
  id: string;
  name: string;
}

/**
 * IntimacaoService - Main orchestrator for court notification processing
 * 
 * DEMO MODE (MOCK_MODE=true):
 * - Loads sample notifications from fixtures (3 notifications from TRT3)
 * - Processes with real LLM (GPT-3.5-turbo) for text extraction
 * - Calculates legal deadlines considering business days and court holidays
 * - Saves structured results to output/processed_notifications.json
 * 
 * PRODUCTION MODE (MOCK_MODE=false):
 * - Fetches real data from DJEN API
 * - Same processing pipeline
 * - Persists to PostgreSQL database via Prisma ORM
 * - Triggers WhatsApp notifications to lawyers
 * 
 * Core capabilities demonstrated:
 * - LLM-powered information extraction from legal documents
 * - Complex deadline calculation algorithm (business days + holidays)
 * - Court-specific rules (TRT3, TJMG, TRF6)
 * - Structured data transformation and validation
 */
export class IntimacaoService {
  private notificationsByLawyer: Record<string, Intimacao[]> = {};
  private lawyers: LawyerInfo[] = [];
  private textAnalysisService: TextAnalysisService;
  
  // Metrics tracking for AI Engineering demonstration
  private llmLatencies: number[] = [];
  private llmCosts: number[] = [];
  private validationSuccesses: number = 0;
  private validationFailures: number = 0;

  constructor() {
    this.textAnalysisService = new TextAnalysisService();
  }

  /**
   * Initialize lawyers (mock data for demo, database query in production)
   */
  private async initializeLawyers(): Promise<void> {
    Logger.mock('Using sample lawyers from fixtures...');
    
    this.lawyers = [
      { id: 'mock-1', name: 'ALEXANDRE CORREA NASSER DE MELO' },
      { id: 'mock-2', name: 'PEDRO ABDER NUNES RAIM RAMOS' },
      { id: 'mock-3', name: 'ALFREDO RAMOS NETO' }
    ];
    
    Logger.mock(`Loaded ${this.lawyers.length} sample lawyers`);

    this.lawyers.forEach(lawyer => {
      this.notificationsByLawyer[lawyer.name] = [];
    });
  }

  /**
   * Fetch notifications from DJEN API or mock fixtures
   */
  private async fetchNotifications(lawyer: LawyerInfo): Promise<IntimacaoResponse> {
    try {
      Logger.fetch(`Loading notifications for ${lawyer.name}...`, true);
      
      const mockData = require('../../mocks/responses/notification_djen_response.json');
      
      Logger.fetch(`Loaded ${mockData.count} notifications`);
      
      return {
        status: 'success',
        count: mockData.count,
        items: mockData.items
      };
    } catch (error) {
      Logger.error(`Failed to fetch notifications for ${lawyer.name}`, error);
      return {
        status: "error",
        items: [],
        count: 0,
      };
    }
  }

  /**
   * Map API response and LLM analysis to structured Intimacao object
   */
  private mapNotification(item: APIIntimacao, analysis: LlmAnalysisResponse): Intimacao {
    const tribunal = item.siglaTribunal as Tribunal;
    
    // Apply deadline calculation algorithm
    const { deadline, appliedRule, deadlineDate } = this.determineDeadline(analysis, tribunal);

    return {
      id: item.id,
      idDgen: item.id,
      data_disponibilizacao: item.data_disponibilizacao,
      dataPublicacao: item.data_disponibilizacao,
      sigla_tribunal: item.siglaTribunal,
      tipo_comunicacao: item.tipoComunicacao,
      texto: item.texto,
      tipo_ato: analysis.tipo_ato,
      prazo: deadline,
      data_esperada_manifestacao: deadlineDate ? deadlineDate.toISOString() : new Date().toISOString(),
      base_legal_prazo: analysis.base_legal_prazo || undefined,
      numeroComunicacao: item.numeroComunicacao,
      hash: item.hash,
      meio: item.meio,
      meiocompleto: item.meiocompleto,
      link: item.link,
      tipoDocumento: item.tipoDocumento,
      resumoIA: analysis.resumo || undefined,
      tipoManifestacao: analysis.tipo_ato || undefined,
      regraAplicada: appliedRule,
      consequenciasPraticas: analysis.consequencias_praticas,
      acoesSugeridas: analysis.acoes_sugeridas,
      statusSistema: analysis.status_sistema,
      dataInicioPrazo: new Date(item.data_disponibilizacao).toISOString(),
      dataLimite: deadlineDate ? deadlineDate.toISOString() : new Date().toISOString(),
      
      // Classification flags
      isJuizado: false,
      isRecursoInominado: false,
      isContrarazoesInominado: false,
      
      // Appearance scheduling
      tipoComparecimento: analysis.tipo_comparecimento || null,
      dataComparecimento: analysis.data_comparecimento ? new Date(analysis.data_comparecimento) : null,
      horarioComparecimento: analysis.horario_comparecimento || null,
      
      // Process information
      processo: {
        numeroProcesso: item.numero_processo,
        numeroFormatado: item.numeroprocessocommascara,
        vara: item.nomeOrgao,
        nomeOrgao: item.nomeOrgao,
        classeProcessual: item.nomeClasse,
        autor: item.destinatarios?.find(d => d.polo === "A")?.nome || "Not informed",
        reu: analysis.reu || "Not informed",
        instancia: analysis.instancia,
        categoria: analysis.categoria_processual
      }
    };
  }

  /**
   * Process notifications for a specific lawyer
   */
  private async processLawyerNotifications(lawyer: LawyerInfo): Promise<void> {
    const response = await this.fetchNotifications(lawyer);

    if (!response || response.status !== "success") {
      Logger.warn(`No data returned for ${lawyer.name}`);
      return;
    }

    for (const item of response.items) {
      try {
        // In production, filter by date (only process notifications from today)
        // In mock mode, process all notifications from fixtures
        if (!environment.MOCK_MODE) {
          const publicationDate = new Date(item.data_disponibilizacao + "T00:00:00-03:00");
          const targetDate = new Date(getSearchDate() + "T00:00:00-03:00");

          if (publicationDate.toISOString().split("T")[0] !== targetDate.toISOString().split("T")[0]) {
            Logger.info(`Skipping notification from ${publicationDate.toLocaleDateString()} - outside target period`);
            continue;
          }
        }

        // LLM analysis
        Logger.llm(`Analyzing notification ${item.id}...`, true);
        const { analise, dadosIA } = await this.textAnalysisService.analisarTexto(item.texto);

        // Track metrics
        this.llmLatencies.push(dadosIA.responseTimeMs);
        this.llmCosts.push(dadosIA.estimatedCost);

        // Display latency and cost
        const latencyStr = `${dadosIA.responseTimeMs}ms`;
        const costStr = `$${dadosIA.estimatedCost.toFixed(6)}`;
        Logger.llm(`Response time: ${latencyStr} | Cost: ${costStr}`);

        // JSON validation
        if (analise.status === "valid" && typeof analise.response !== "string") {
          this.validationSuccesses++;
          Logger.success(`JSON structure validated ✓`);
          
          const deadlineDays = analise.response.prazo || 'not specified';
          Logger.llm(`Extracted deadline: ${deadlineDays} days`);
          
          const notification = this.mapNotification(item, analise.response);
          await this.applyDeadline(notification);

          this.notificationsByLawyer[lawyer.name].push(notification);
          Logger.success(`Notification ${item.id} processed`);
        } else {
          this.validationFailures++;
          Logger.warn(`JSON validation failed ✗`);
        }
        Logger.blank();
      } catch (error) {
        this.validationFailures++;
        Logger.error(`Failed to process notification`, error);
        Logger.blank();
      }
    }
  }

  /**
   * Main orchestration: Process all notifications and save results
   */
  public async processAllNotifications(): Promise<{
    notifications: Record<string, Intimacao[]>;
    metrics: {
      totalNotifications: number;
      validationRate: string;
    };
  }> {
    try {
      Logger.header('🤖 AI Legal Notification System - Demo Mode');
      Logger.system('Starting notification processing pipeline...');
      Logger.blank();
      
      await this.initializeLawyers();
      Logger.blank();
      
      Logger.divider();
      Logger.system('Processing notifications for all lawyers...');
      Logger.blank();
      
      let processedCount = 0;
      for (const lawyer of this.lawyers) {
        await this.processLawyerNotifications(lawyer);
        processedCount++;
        const lawyerNotifications = this.notificationsByLawyer[lawyer.name].length;
        Logger.progress(processedCount, this.lawyers.length, `${lawyer.name} (${lawyerNotifications} notifications)`);
      }
      
      Logger.blank();
      Logger.divider();
      
      const total = Object.values(this.notificationsByLawyer).reduce(
        (acc, arr) => acc + arr.length,
        0
      );

      // Save results to JSON file
      await this.saveResultsToJson(total);
      
      // Calculate aggregate metrics
      const avgLatency = this.llmLatencies.length > 0 
        ? (this.llmLatencies.reduce((a, b) => a + b, 0) / this.llmLatencies.length).toFixed(0)
        : 0;
      const totalCost = this.llmCosts.reduce((a, b) => a + b, 0);
      const validationRate = this.validationSuccesses > 0
        ? ((this.validationSuccesses / (this.validationSuccesses + this.validationFailures)) * 100).toFixed(1)
        : 0;
      
      Logger.blank();
      Logger.header('📊 Execution Summary');
      
      Logger.metrics('Total Lawyers', this.lawyers.length);
      Logger.metrics('Total Notifications', total);
      Logger.metrics('LLM Calls', this.llmLatencies.length);
      Logger.blank();
      
      Logger.metrics('Avg Latency', `${avgLatency}ms`);
      Logger.metrics('Total Cost', `$${totalCost.toFixed(6)}`);
      Logger.metrics('JSON Validation Rate', `${validationRate}%`);
      Logger.blank();
      
      Logger.metrics('LLM Model', 'GPT-3.5-turbo');
      Logger.metrics('Temperature', '0 (deterministic)');
      Logger.blank();

      return {
        notifications: this.notificationsByLawyer,
        metrics: {
          totalNotifications: total,
          validationRate: `${validationRate}%`
        }
      };

    } catch (error) {
      Logger.error('Processing failed', error);
      throw error;
    }
  }

  /**
   * Save processing results to JSON file (demo output)
   */
  private async saveResultsToJson(total: number): Promise<void> {
    const outputDir = path.join(process.cwd(), 'output');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const output = {
      timestamp: new Date().toISOString(),
      totalProcessed: total,
      lawyers: this.lawyers.map(l => l.name),
      notificationsByLawyer: Object.keys(this.notificationsByLawyer).map(lawyerName => ({
        lawyer: lawyerName,
        count: this.notificationsByLawyer[lawyerName].length,
        notifications: this.notificationsByLawyer[lawyerName].map(n => ({
          id: n.idDgen,
          processNumber: n.processo?.numeroFormatado || 'N/A',
          tribunal: (n.processo as any)?.tribunal || 'N/A',
          publicationDate: n.dataPublicacao,
          deadlineDate: n.dataLimite,
          deadlineDays: n.prazo,
          documentType: n.tipoDocumento || 'N/A',
          manifestationType: n.tipoManifestacao || 'N/A',
          summary: n.resumoIA || 'N/A',
          suggestedActions: (n as any).acoesSugeridas || [],
          appliedRule: (n as any).regraAplicada || 'N/A'
        }))
      }))
    };

    const outputPath = path.join(outputDir, 'processed_notifications.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    
    Logger.output(`Results saved to ${outputPath}`);
    Logger.output(`Summary: ${total} notifications processed for ${this.lawyers.length} lawyers`);
  }

  /**
   * Determine deadline based on LLM analysis and court-specific rules
   * 
   * ⚠️ DISCLAIMER: Deadline values shown here are approximations for demonstration purposes.
   * The production system uses precise values based on:
   * - Brazilian Civil Procedure Code (CPC - Lei 13.105/2015)
   * - Labor Law Code (CLT - Decreto-Lei 5.452/1943)
   * - Court-specific regulations and internal legal research
   * 
   * Priority hierarchy:
   * 1. Explicit deadline mentioned in notification text
   * 2. Scheduled appearance date (hearing, expert exam, trial)
   * 3. Court-specific and case-type rules
   * 4. Default fallback
   */
  private determineDeadline(analysis: LlmAnalysisResponse, tribunal: Tribunal): {
    deadline: number;
    appliedRule: string;
    deadlineDate?: Date | null;
  } {
    // 1. Explicit deadline in text (highest priority)
    if (analysis.prazo !== null) {
      return {
        deadline: analysis.prazo,
        appliedRule: "EXPLICIT_DEADLINE_IN_TEXT"
      };
    }

    // 2. Scheduled appearances (hearing, expert exam, trial)
    if (analysis.tipo_comparecimento === 'AUDIENCIA' && analysis.data_comparecimento) {
      return {
        deadline: 0,
        appliedRule: "SCHEDULED_HEARING",
        deadlineDate: null
      };
    }

    if (analysis.tipo_comparecimento === 'PERICIA' && analysis.data_comparecimento) {
      return {
        deadline: 0,
        appliedRule: "SCHEDULED_EXPERT_EXAM",
        deadlineDate: null
      };
    }

    if (analysis.tipo_comparecimento === 'PAUTA_DE_JULGAMENTO' && analysis.data_comparecimento) {
      return {
        deadline: 0,
        appliedRule: "SCHEDULED_TRIAL",
        deadlineDate: null
      };
    }

    // 3. Court-specific rules (demo values - see disclaimer above)
    if (tribunal === 'TRT3' && analysis.categoria_processual === 'TRABALHO') {
      return {
        deadline: 10,  // Demo value
        appliedRule: "TRT3_LABOR_LAW"
      };
    }

    if (tribunal === 'TJMG') {
      if (analysis.categoria_processual === 'JUIZADO') {
        return {
          deadline: 12,  // Demo value
          appliedRule: "TJMG_SMALL_CLAIMS"
        };
      }
      if (analysis.categoria_processual === 'CIVIL') {
        return {
          deadline: 15,  // Demo value
          appliedRule: "TJMG_CIVIL"
        };
      }
      if (analysis.categoria_processual === 'CRIMINAL') {
        return {
          deadline: 15,  // Demo value
          appliedRule: "TJMG_CRIMINAL"
        };
      }
    }

    if (tribunal === 'TRF6') {
      return {
        deadline: 20,  // Demo value
        appliedRule: "TRF6_FEDERAL"
      };
    }

    // 4. Default fallback
    return {
      deadline: 10,  // Demo value
      appliedRule: "DEFAULT_FALLBACK"
    };
  }

  /**
   * Apply deadline calculation considering business days and court holidays
   * 
   * For scheduled appearances: Uses the scheduled date
   * For other cases: Calculates based on business days excluding holidays
   */
  private async applyDeadline(notification: Intimacao): Promise<void> {
    // Handle scheduled appearances (hearing, expert exam, trial)
    if (notification.tipoComparecimento === 'AUDIENCIA' || 
        notification.tipoComparecimento === 'PERICIA' || 
        notification.tipoComparecimento === 'PAUTA_DE_JULGAMENTO') {
      try {
        let validDate: Date | null = null;

        if (notification.dataComparecimento instanceof Date) {
          validDate = notification.dataComparecimento;
        } else if (typeof notification.dataComparecimento === 'string') {
          const convertedDate = new Date(notification.dataComparecimento);
          if (!isNaN(convertedDate.getTime())) {
            validDate = convertedDate;
          }
        }

        if (validDate && !isNaN(validDate.getTime())) {
          notification.dataComparecimento = validDate;
          notification.data_esperada_manifestacao = '';
          notification.dataLimite = null;
        } else {
          notification.dataComparecimento = null;
        }
        return;
      } catch (error) {
        Logger.error('Failed to process scheduled date', error);
        notification.dataComparecimento = null;
      }
    }

    // Calculate normal deadline with business days
    const startDate = new Date(notification.data_disponibilizacao);
    startDate.setDate(startDate.getDate() + 1);

    const deadline = notification.prazo || 5;
    
    // Get court-specific holidays
    const tribunal = this.validateTribunal(notification.sigla_tribunal);
    const courtHolidays = HOLIDAYS[tribunal];

    // Calculate deadline considering business days and holidays
    const deadlineDateStr = addBusinessDays(startDate, deadline, courtHolidays);
    const [day, month, year] = deadlineDateStr.split('/');
    notification.data_esperada_manifestacao = `20${year}-${month}-${day}T00:00:00-03:00`;
  }

  private validateTribunal(sigla: string): Tribunal {
    return sigla as Tribunal;
  }
}

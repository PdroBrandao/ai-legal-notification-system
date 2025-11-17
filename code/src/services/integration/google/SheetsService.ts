import { GoogleSheetsConfig } from '../../../config/googleSheets';
import { Intimacao } from '../../../types/interfaces';
import { formatDateToBR } from '../../../utils/dateUtils';

export class GoogleSheetsService {
    private static instance: GoogleSheetsService;
    private sheetsConfig: GoogleSheetsConfig;

    private static readonly HEADERS = [
        'STATUS',
        'ID DGEN',
        'Data Disponibilização',
        'Data Início Prazo',
        'Data Limite',
        'Tribunal',
        'Instância',
        'Categoria Processual',
        'Tipo Comunicação',
        'Tipo Manifestação',
        'Tipo Documento',
        'Prazo (dias)',
        'Base Legal',
        'Regra Aplicada',
        'Advogado',
        'Texto Original',
        'Resumo IA',
        'É Juizado?',
        'É Recurso Inominado?',
        'É Contrarrazões?',
        'É Agendamento?',
        'Data Agendamento',
        'Horário Agendamento',
        'Número Processo',
        'Número Formatado',
        'Vara',
        'Órgão',
        'Classe Processual',
        'Autor',
        'Réu',
        'Consequências Práticas',
        'Ações Sugeridas',
        'Status Sistema'
    ];

    private constructor(sheetsConfig: GoogleSheetsConfig) {
        this.sheetsConfig = sheetsConfig;
    }

    public static async getInstance(): Promise<GoogleSheetsService> {
        if (!GoogleSheetsService.instance) {
            const sheetsConfig = await GoogleSheetsConfig.getInstance();
            GoogleSheetsService.instance = new GoogleSheetsService(sheetsConfig);
        }
        return GoogleSheetsService.instance;
    }

    public async saveIntimacoes(intimacoesPorAdvogado: Record<string, Intimacao[]>): Promise<void> {
        for (const [advogado, intimacoes] of Object.entries(intimacoesPorAdvogado)) {
            for (const intimacao of intimacoes) {
                const dataDisponibilizacao = new Date(intimacao.dataPublicacao);
                dataDisponibilizacao.setUTCHours(dataDisponibilizacao.getUTCHours() + 3);

                const dataInicioPrazo = new Date(intimacao.dataInicioPrazo);
                dataInicioPrazo.setUTCHours(dataInicioPrazo.getUTCHours() + 3);

                const dataLimite = intimacao.dataLimite ? new Date(intimacao.dataLimite) : null;
                if (dataLimite) {
                    dataLimite.setUTCHours(dataLimite.getUTCHours() + 3);
                }

                const dataComparecimento = intimacao.dataComparecimento 
                    ? new Date(intimacao.dataComparecimento.setUTCHours(intimacao.dataComparecimento.getUTCHours() + 3))
                    : null;
                
                const values = [
                    [
                        '',
                        intimacao.idDgen,
                        dataDisponibilizacao.toLocaleDateString('pt-BR'),
                        dataInicioPrazo.toLocaleDateString('pt-BR'),
                        dataLimite ? dataLimite.toLocaleDateString('pt-BR') : '',
                        intimacao.sigla_tribunal,
                        intimacao.processo.instancia,
                        intimacao.processo.categoria,
                        intimacao.tipo_comunicacao,
                        intimacao.tipoManifestacao || intimacao.tipo_comunicacao,
                        intimacao.tipoDocumento || '',
                        `'${intimacao.prazo}'`, // Forçando como texto com apóstrofo
                        intimacao.base_legal_prazo || '',
                        intimacao.regraAplicada,
                        advogado,
                        intimacao.texto,
                        intimacao.resumoIA || '',
                        // Flags de classificação
                        intimacao.isJuizado ? 'Sim' : 'Não',
                        intimacao.isRecursoInominado ? 'Sim' : 'Não',
                        intimacao.isContrarazoesInominado ? 'Sim' : 'Não',
                        intimacao.tipoComparecimento || '',
                        intimacao.dataComparecimento ? intimacao.dataComparecimento.toLocaleDateString('pt-BR') : '',
                        intimacao.horarioComparecimento || '',
                        // Informações do processo
                        intimacao.processo.numeroProcesso,
                        intimacao.processo.numeroFormatado || '',
                        intimacao.processo.vara,
                        intimacao.processo.nomeOrgao,
                        intimacao.processo.classeProcessual,
                        intimacao.processo.autor,
                        intimacao.processo.reu,
                        // Análise da IA
                        intimacao.consequenciasPraticas || '',
                        (intimacao.acoesSugeridas || []).join('; '),
                        intimacao.statusSistema || ''
                    ]
                ];

                await this.sheetsConfig.appendToSheet(values);
            }
        }
    }

    public async setupHeaders(): Promise<void> {
        await this.sheetsConfig.appendToSheet([GoogleSheetsService.HEADERS]);
    }
}

import { Request, Response } from 'express';
import { IntimacaoRepository } from '../../services/repositories/IntimationRepository';

export class IntimacaoController {
  private intimacaoRepository: IntimacaoRepository;

  constructor() {
    this.intimacaoRepository = new IntimacaoRepository();
  }

  buscarIntimacoes = async (req: Request, res: Response) => {
    try {
      const { advogadoId, data } = req.query;

      // Validação básica dos parâmetros
      if (!advogadoId || !data) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetros obrigatórios: advogadoId e data (formato YYYY-MM-DD)'
        });
      }

      // Validação do formato da data
      const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dataRegex.test(data as string)) {
        return res.status(400).json({
          success: false,
          error: 'Formato de data inválido. Use YYYY-MM-DD'
        });
      }

      console.log(`[API] Buscando intimações para advogado ${advogadoId} na data ${data}`);

      // Busca no banco de dados
      const resultado = await this.intimacaoRepository.buscarPorAdvogadoEData(
        advogadoId as string, 
        data as string
      );

      // Verifica se encontrou o advogado
      if (resultado.intimacoes.length === 0) {
        return res.json({
          success: true,
          data: {
            advogado: null,
            intimacoes: [],
            total: 0,
            pendentes: 0,
            notificadas: 0
          }
        });
      }

      // Pega os dados do advogado da primeira intimação
      const advogado = resultado.intimacoes[0].advogado;

      // Formata as intimações para a resposta
      const intimacoesFormatadas = resultado.intimacoes.map(intimacao => ({
        id: intimacao.id,
        idDgen: intimacao.idDgen,
        dataPublicacao: intimacao.dataPublicacao,
        prazo: intimacao.prazo,
        dataLimite: intimacao.dataLimite,
        tipoManifestacao: intimacao.tipoManifestacao,
        resumoIA: intimacao.resumoIA,
        status: intimacao.status,
        regraAplicada: intimacao.regraAplicada,
        consequenciasPraticas: intimacao.consequenciasPraticas,
        acoesSugeridas: intimacao.acoesSugeridas,
        statusSistema: intimacao.statusSistema,
        tipoComparecimento: intimacao.tipoComparecimento,
        dataComparecimento: intimacao.dataComparecimento,
        horarioComparecimento: intimacao.horarioComparecimento,
        processo: {
          numeroFormatado: intimacao.processo.numeroFormatado,
          autor: intimacao.processo.autor,
          reu: intimacao.processo.reu,
          tribunal: intimacao.processo.tribunal,
          instancia: intimacao.processo.instancia,
          categoria: intimacao.processo.categoria
        },
        notificacoes: intimacao.notificacoes.map(notificacao => ({
          tipo: notificacao.tipo,
          status: notificacao.status,
          dataEnvio: notificacao.dataEnvio
        }))
      }));

      res.json({
        success: true,
        data: {
          advogado: {
            id: advogado.id,
            nome: advogado.nome,
            oab: advogado.oab
          },
          intimacoes: intimacoesFormatadas,
          total: resultado.total,
          pendentes: resultado.pendentes,
          notificadas: resultado.notificadas
        }
      });

    } catch (error) {
      console.error('[API ERROR] buscarIntimacoes:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
} 
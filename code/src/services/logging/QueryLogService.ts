import { PrismaClient, ConsultaLog } from '@prisma/client';
import prisma from '../../config/database/prisma-client';

interface QueryLogParams {
  advogadoId: string;
  tribunal: string;
  parametrosBusca: Record<string, any>;
  execucaoLogId?: string;
  httpStatus?: number;
  requestId?: string;
  requestHeaders?: Record<string, string>;
  qtdResultados: number;
  tempoRespostaMs: number;
  consultaOrigemId?: string;
  erro?: Error;
  status?: 'SUCESSO' | 'ERRO' | 'RETENTATIVA';
}

export class QueryLogService {
  async registrarConsulta(params: QueryLogParams): Promise<ConsultaLog> {
    const startTime = Date.now();

    try {
      const consultaLog = await prisma.consultaLog.create({
        data: {
          advogadoId: params.advogadoId,
          tribunal: params.tribunal,
          parametrosBusca: JSON.stringify(params.parametrosBusca),
          status: params.erro ? 'ERRO' : 'SUCESSO',
          qtdResultados: params.qtdResultados,
          tempoRespostaMs: params.tempoRespostaMs,
          
          // Campos de monitoramento
          httpStatus: params.httpStatus,
          requestId: params.requestId,
          requestHeaders: params.requestHeaders ? JSON.stringify(params.requestHeaders) : null,
          
          // Campos de erro
          erro: params.erro?.message,
          stackTrace: params.erro?.stack,
          
          // Relações
          execucaoLogId: params.execucaoLogId,
          consultaOrigemId: params.consultaOrigemId
        }
      });

      console.log(`[LOG] Consulta registrada - ID: ${consultaLog.id} - Status: ${consultaLog.status}`);
      return consultaLog;

    } catch (error) {
      console.error('[ERROR] Falha ao registrar log de consulta:', error);
      throw error;
    }
  }

  async registrarRetentativa(
    consultaOrigemId: string, 
    params: Omit<QueryLogParams, 'consultaOrigemId'>
  ): Promise<ConsultaLog> {
    return this.registrarConsulta({
      ...params,
      consultaOrigemId,
      status: 'RETENTATIVA'
    });
  }

  async buscarConsultasAdvogado(advogadoId: string, periodo?: { inicio: Date; fim: Date }): Promise<ConsultaLog[]> {
    try {
      return await prisma.consultaLog.findMany({
        where: {
          advogadoId,
          ...(periodo && {
            dataConsulta: {
              gte: periodo.inicio,
              lte: periodo.fim
            }
          })
        },
        include: {
          retentativas: true
        },
        orderBy: {
          dataConsulta: 'desc'
        }
      });
    } catch (error) {
      console.error('[ERROR] Falha ao buscar logs de consulta:', error);
      throw error;
    }
  }
}
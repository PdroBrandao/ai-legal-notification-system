import { PrismaClient, StatusExecucao, Ambiente, ExecucaoLog } from '@prisma/client';
import prisma from '../../config/database/prisma-client';

export class ExecutionLogService {
  private execucaoLogId?: string;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  async iniciarExecucao(advogado: string): Promise<ExecucaoLog> {
    try {
      const execucaoLog = await prisma.execucaoLog.create({
        data: {
          status: 'INICIADO',
          advogado,
          dataConsulta: new Date(),
          qtdRequisicoes: 0,
          qtdSucesso: 0,
          qtdFalhas: 0,
          tempoExecucao: 0,
          ambiente: (process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV') as Ambiente,
          memoriaUtilizada: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) // MB
        }
      });

      this.execucaoLogId = execucaoLog.id;
      console.log(`[LOG] Iniciada execução ${execucaoLog.id} para ${advogado}`);
      
      return execucaoLog;
    } catch (error) {
      console.error('[ERROR] Falha ao criar log de execução:', error);
      throw error;
    }
  }

  async atualizarContadores(sucesso: boolean): Promise<void> {
    if (!this.execucaoLogId) return;

    try {
      await prisma.execucaoLog.update({
        where: { id: this.execucaoLogId },
        data: {
          qtdRequisicoes: { increment: 1 },
          qtdSucesso: { increment: sucesso ? 1 : 0 },
          qtdFalhas: { increment: sucesso ? 0 : 1 }
        }
      });
    } catch (error) {
      console.error('[ERROR] Falha ao atualizar contadores:', error);
    }
  }

  async finalizarExecucao(erro?: Error): Promise<void> {
    if (!this.execucaoLogId) return;

    const tempoExecucao = Date.now() - this.startTime;
    const memoriaUtilizada = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

    try {
      const execucao = await prisma.execucaoLog.findUnique({
        where: { id: this.execucaoLogId }
      });

      if (!execucao) return;

      const status: StatusExecucao = erro ? 'ERRO' 
        : execucao.qtdFalhas > 0 ? 'PARCIAL' 
        : 'SUCESSO';

      await prisma.execucaoLog.update({
        where: { id: this.execucaoLogId },
        data: {
          status,
          tempoExecucao,
          memoriaUtilizada,
          erro: erro?.message,
          stackTrace: erro?.stack
        }
      });

      console.log(`[LOG] Finalizada execução ${this.execucaoLogId} - Status: ${status}`);
    } catch (error) {
      console.error('[ERROR] Falha ao finalizar log de execução:', error);
    }
  }
}
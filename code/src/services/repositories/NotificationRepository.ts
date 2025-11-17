import { PrismaClient, Notificacao, StatusNotificacao, TipoNotificacao, Prisma } from '@prisma/client';
import prisma from '../../config/database/prisma-client';

type CreateNotificacaoData = Omit<
  Prisma.NotificacaoUncheckedCreateInput,
  'id' | 'createdAt' | 'updatedAt' | 'dataEnvio'
>;

// Definindo o tipo do retorno com os relacionamentos
type NotificacaoComRelacionamentos = Prisma.NotificacaoGetPayload<{
  include: {
    intimacao: {
      include: {
        advogado: true;
        processo: true;
      };
      // Garantindo que todos os campos da intimação estejam disponíveis
      select: {
        id: true,
        idDgen: true,
        dataPublicacao: true,
        tipoDocumento: true,
        resumoIA: true,
        link: true,
        consequenciasPraticas: true,
        acoesSugeridas: true,
        statusSistema: true,
        // ... outros campos necessários
      };
    };
  };
}> & {
  intimacao: {
    acoesSugeridas: string[];  // Definindo explicitamente como array de strings
  };
};

export class NotificationRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async criar(data: CreateNotificacaoData): Promise<Notificacao> {
    return this.prisma.notificacao.create({
      data: {
        ...data,
        status: data.status || 'PENDENTE'
      }
    });
  }

  async atualizarStatus(
    id: string, 
    status: StatusNotificacao, 
    erro?: string
  ): Promise<Notificacao> {
    return this.prisma.notificacao.update({
      where: { id },
      data: { 
        status,
        erro,
        dataEnvio: status === 'ENVIADO' ? new Date() : undefined,
        tentativas: { increment: 1 }
      }
    });
  }

  async buscarPendentes(tipo: TipoNotificacao): Promise<NotificacaoComRelacionamentos[]> {
    const notificacoes = await this.prisma.notificacao.findMany({
      where: { 
        status: 'PENDENTE',
        tipo 
      },
      include: {
        intimacao: {
          include: {
            advogado: true,
            processo: true
          }
        }
      }
    });

    // Garantindo que acoesSugeridas é sempre um array
    return notificacoes.map(notificacao => ({
      ...notificacao,
      intimacao: {
        ...notificacao.intimacao,
        acoesSugeridas: notificacao.intimacao?.acoesSugeridas || []
      }
    }));
  }
}
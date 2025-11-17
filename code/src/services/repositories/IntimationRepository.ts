import { PrismaClient, Intimacao, StatusIntimacao, Prisma, Tribunal } from '@prisma/client';
import prisma from '../../config/database/prisma-client';

// Usando os tipos do Prisma diretamente
type CreateProcessoData = Omit<Prisma.ProcessoCreateInput, 'intimacoes' | 'advogados'>;
type CreateIntimacaoData = Omit<Prisma.IntimacaoUncheckedCreateInput, 'id' | 'createdAt' | 'updatedAt' | 'googleEventId' | 'googleEventStatus' | 'textoManifestacao'>;

interface CreateIntimacaoComProcessoDTO {
  // Dados do processo
  numeroProcesso: string;
  numeroFormatado: string;
  vara: string;
  nomeOrgao: string;
  tribunal: Tribunal;
  classeProcessual: string;
  autor: string;
  reu: string;
  instancia: 'PRIMEIRA' | 'SEGUNDA';
  categoria: 'CIVIL' | 'JUIZADO' | 'CRIMINAL' | 'TRABALHO';
  
  // Dados da intimação
  advogadoId: string;
  numeroComunicacao: number;
  hash: string;
  dataPublicacao: Date;
  dataInicioPrazo: Date;
  prazo: number;
  dataLimite?: Date | null;
  conteudo: string;
  resumoIA?: string | null;
  tipoManifestacao?: string;
  tipoDocumento?: string;
  baseLegalPrazo?: string | null;
  meio: string;
  meiocompleto: string;
  link?: string;
  status: StatusIntimacao;
  id: string | number;
  consequenciasPraticas?: string;
  acoesSugeridas?: string[];
  statusSistema?: string;
  isJuizado: boolean;
  isRecursoInominado: boolean;
  isContrarazoesInominado: boolean;
  regraAplicada: string;
  
  // Campos de Comparecimento
  tipoComparecimento?: 'AUDIENCIA' | 'PERICIA' | 'PAUTA_DE_JULGAMENTO' | null;
  dataComparecimento?: Date | null;
  horarioComparecimento?: string | null;
}

export class IntimacaoRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async criar(data: CreateIntimacaoData): Promise<Intimacao> {
    return this.prisma.intimacao.create({
      data: {
        ...data,
        status: data.status || 'PENDENTE'
      }
    });
  }

  async criarComProcesso(data: CreateIntimacaoComProcessoDTO): Promise<Intimacao> {
    return this.prisma.$transaction(async (tx) => {
      // Cria/atualiza processo
      const processo = await tx.processo.upsert({
        where: { numeroProcesso: data.numeroProcesso },
        create: {
          numeroProcesso: data.numeroProcesso,
          vara: data.vara,
          tribunal: data.tribunal,
          classeProcessual: data.classeProcessual,
          autor: data.autor,
          reu: data.reu,
          nomeOrgao: data.nomeOrgao,
          numeroFormatado: data.numeroFormatado,
          status: 'ATIVO',
          categoria: data.categoria,
          instancia: data.instancia
        },
        update: {}
      });

      // Cria intimação
      const intimacaoData: Prisma.IntimacaoCreateInput = {
        idDgen: data.id.toString(),
        processo: { connect: { id: processo.id } },
        advogado: { connect: { id: data.advogadoId } },
        numeroComunicacao: data.numeroComunicacao,
        hash: data.hash,
        dataPublicacao: new Date(data.dataPublicacao),
        dataInicioPrazo: new Date(data.dataInicioPrazo),
        prazo: data.prazo || 0,
        dataLimite: data.tipoComparecimento ? null : (data.dataLimite || null),
        conteudo: data.conteudo,
        resumoIA: data.resumoIA,
        tipoManifestacao: data.tipoManifestacao,
        tipoDocumento: data.tipoDocumento,
        baseLegalPrazo: data.baseLegalPrazo,
        meio: data.meio,
        meiocompleto: data.meiocompleto,
        link: data.link,
        status: data.status,
        consequenciasPraticas: data.consequenciasPraticas,
        acoesSugeridas: data.acoesSugeridas,
        statusSistema: data.statusSistema,
        isJuizado: data.isJuizado,
        isRecursoInominado: data.isRecursoInominado,
        isContrarazoesInominado: data.isContrarazoesInominado,
        tipoComparecimento: data.tipoComparecimento,
        dataComparecimento: data.tipoComparecimento && data.dataComparecimento 
          ? new Date(data.dataComparecimento) 
          : null,
        horarioComparecimento: data.horarioComparecimento !== 'não informado' 
          ? data.horarioComparecimento 
          : null,
        regraAplicada: data.regraAplicada
      };

      return tx.intimacao.create({
        data: intimacaoData,
        include: {
          processo: true,
          advogado: true
        }
      });
    });
  }

  async buscarPorAdvogado(advogadoId: string): Promise<Intimacao[]> {
    return this.prisma.intimacao.findMany({
      where: { advogadoId },
      include: {
        processo: true,
        notificacoes: true
      },
      orderBy: { dataLimite: 'asc' }
    });
  }

  async buscarPendentes(): Promise<Intimacao[]> {
    return this.prisma.intimacao.findMany({
      where: { status: 'PENDENTE' },
      include: {
        processo: true,
        advogado: true
      },
      orderBy: { dataLimite: 'asc' }
    });
  }

  async atualizarStatus(id: string, status: StatusIntimacao): Promise<Intimacao> {
    return this.prisma.intimacao.update({
      where: { id },
      data: { status }
    });
  }

  async buscarPorIdDgen(idDgen: string | number, advogadoId: string): Promise<Intimacao | null> {
    return this.prisma.intimacao.findFirst({
      where: { 
        AND: [
          { idDgen: idDgen.toString() },
          { advogadoId: advogadoId }
        ]
      }
    });
  }

  async buscarPorAdvogadoEData(advogadoId: string, data: string): Promise<{
    intimacoes: (Intimacao & {
      processo: {
        numeroFormatado: string | null;
        autor: string;
        reu: string;
        tribunal: string;
        instancia: string;
        categoria: string;
      };
      notificacoes: {
        tipo: string;
        status: string;
        dataEnvio: Date | null;
      }[];
      advogado: {
        id: string;
        nome: string;
        oab: string;
      };
    })[];
    total: number;
    pendentes: number;
    notificadas: number;
  }> {
    const dataInicio = new Date(data + 'T00:00:00.000Z');
    const dataFim = new Date(data + 'T23:59:59.999Z');

    const intimacoes = await this.prisma.intimacao.findMany({
      where: {
        AND: [
          { advogadoId },
          {
            dataPublicacao: {
              gte: dataInicio,
              lte: dataFim
            }
          }
        ]
      },
      include: {
        processo: {
          select: {
            numeroFormatado: true,
            autor: true,
            reu: true,
            tribunal: true,
            instancia: true,
            categoria: true
          }
        },
        notificacoes: {
          orderBy: { createdAt: 'desc' }
        },
        advogado: {
          select: {
            id: true,
            nome: true,
            oab: true
          }
        }
      },
      orderBy: { dataPublicacao: 'desc' }
    });

    const total = intimacoes.length;
    const pendentes = intimacoes.filter(i => i.status === 'PENDENTE').length;
    const notificadas = intimacoes.filter(i => 
      i.notificacoes.some(n => n.status === 'ENVIADO')
    ).length;

    return {
      intimacoes,
      total,
      pendentes,
      notificadas
    };
  }

  // NOVA QUERY: Buscar prazos vencendo (3 dias antes do vencimento)
  async buscarPrazosVencendo(advogadoId: string, dataConsulta: string): Promise<Intimacao[]> {
    const hoje = new Date(dataConsulta + 'T00:00:00.000Z');
    const tresDiasDepois = new Date(hoje);
    tresDiasDepois.setDate(tresDiasDepois.getDate() + 3);

    return this.prisma.intimacao.findMany({
      where: {
        AND: [
          { advogadoId },
          { dataLimite: { not: null } }, // Só prazos com data limite
          { dataLimite: { gte: hoje } }, // Não vencidos ainda
          { dataLimite: { lte: tresDiasDepois } } // Vencendo nos próximos 3 dias
        ]
      },
      include: {
        processo: true,
        advogado: true
      },
      orderBy: { dataLimite: 'asc' }
    });
  }

  // NOVA QUERY: Buscar comparecimentos (audiências, perícias, julgamentos)
  async buscarComparecimentos(
    advogadoId: string, 
    dataInicio: string, 
    dataFim: string,
    tipoComparecimento?: string,
    proximo?: boolean
  ): Promise<Intimacao[]> {
    const inicio = new Date(dataInicio + 'T00:00:00.000Z');
    const fim = new Date(dataFim + 'T23:59:59.999Z');

    const where: any = {
      AND: [
        { advogadoId },
        { dataComparecimento: { not: null } }, // Só comparecimentos com data
        { dataComparecimento: { gte: inicio } },
        { dataComparecimento: { lte: fim } }
      ]
    };

    // Filtrar por tipo se especificado
    if (tipoComparecimento) {
      where.AND.push({ tipoComparecimento });
    }

    // Para "próximo", buscar apenas o mais próximo
    if (proximo) {
      return this.prisma.intimacao.findMany({
        where,
        include: {
          processo: true,
          advogado: true
        },
        orderBy: { dataComparecimento: 'asc' },
        take: 1
      });
    }

    return this.prisma.intimacao.findMany({
      where,
      include: {
        processo: true,
        advogado: true
      },
      orderBy: { dataComparecimento: 'asc' }
    });
  }

  // NOVA QUERY: Buscar detalhes de intimação específica
  async buscarPorIdDgenDetalhado(idDgen: string, advogadoId: string): Promise<Intimacao | null> {
    return this.prisma.intimacao.findFirst({
      where: { 
        AND: [
          { idDgen: idDgen },
          { advogadoId: advogadoId }
        ]
      },
      include: {
        processo: true,
        advogado: true,
        notificacoes: true
      }
    });
  }
}

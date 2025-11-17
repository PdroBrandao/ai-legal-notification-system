import { PrismaClient, Intimacao, Advogado, Processo } from '@prisma/client';
import { IntimacaoCompleta } from './WhatsappResponseFormatter';

export class WhatsappIntimacaoService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async buscarIntimacoesPorData(
    telefone: string,
    data: string
  ): Promise<IntimacaoCompleta[]> {
    try {
      console.log(`[WhatsappIntimacaoService] Buscando intimações para ${telefone} na data ${data}`);

      // Primeiro, encontrar o advogado pelo telefone
      const advogado = await this.prisma.advogado.findFirst({
        where: {
          telefone: telefone,
          ativo: true
        }
      });

      if (!advogado) {
        console.log(`[WhatsappIntimacaoService] Advogado não encontrado para telefone: ${telefone}`);
        return [];
      }

      console.log(`[WhatsappIntimacaoService] Advogado encontrado: ${advogado.nome}`);

      // Buscar intimações para a data específica
      const dataInicio = new Date(data);
      dataInicio.setHours(0, 0, 0, 0);
      
      const dataFim = new Date(data);
      dataFim.setHours(23, 59, 59, 999);

      const intimacoes = await this.prisma.intimacao.findMany({
        where: {
          advogadoId: advogado.id,
          dataPublicacao: {
            gte: dataInicio,
            lte: dataFim
          },
          status: {
            in: ['PENDENTE', 'PROCESSADO', 'NOTIFICADO']
          }
        },
        include: {
          advogado: true,
          processo: true
        },
        orderBy: {
          dataPublicacao: 'desc'
        }
      });

      console.log(`[WhatsappIntimacaoService] Encontradas ${intimacoes.length} intimações`);

      return intimacoes;
    } catch (error) {
      console.error('[WhatsappIntimacaoService] Erro ao buscar intimações:', error);
      return [];
    }
  }

  async buscarAdvogadoPorTelefone(telefone: string): Promise<Advogado | null> {
    try {
      console.log(`[WhatsappIntimacaoService] Buscando advogado com telefone: "${telefone}"`);
      
      // Buscar exatamente como está no banco
      const advogado = await this.prisma.advogado.findFirst({
        where: {
          telefone: telefone,
          ativo: true
        }
      });

      if (advogado) {
        console.log(`[WhatsappIntimacaoService] Advogado encontrado: ${advogado.nome} (${advogado.telefone})`);
      } else {
        console.log(`[WhatsappIntimacaoService] Advogado NÃO encontrado para telefone: "${telefone}"`);
        
        // Buscar todos os advogados para debug
        const todosAdvogados = await this.prisma.advogado.findMany({
          where: { ativo: true },
          select: { nome: true, telefone: true }
        });
        
        console.log(`[WhatsappIntimacaoService] Todos os advogados cadastrados:`, todosAdvogados);
      }

      return advogado;
    } catch (error) {
      console.error('[WhatsappIntimacaoService] Erro ao buscar advogado:', error);
      return null;
    }
  }

  async buscarPrazosVencendo(telefone: string, dataConsulta: string): Promise<IntimacaoCompleta[]> {
    try {
      console.log(`[WhatsappIntimacaoService] Buscando prazos vencendo para ${telefone} na data ${dataConsulta}`);

      // Primeiro, encontrar o advogado pelo telefone
      const advogado = await this.prisma.advogado.findFirst({
        where: {
          telefone: telefone,
          ativo: true
        }
      });

      if (!advogado) {
        console.log(`[WhatsappIntimacaoService] Advogado não encontrado para telefone: ${telefone}`);
        return [];
      }

      console.log(`[WhatsappIntimacaoService] Advogado encontrado: ${advogado.nome}`);

      // Buscar prazos vencendo (3 dias antes do vencimento)
      const hoje = new Date(dataConsulta + 'T00:00:00.000Z');
      const tresDiasDepois = new Date(hoje);
      tresDiasDepois.setDate(tresDiasDepois.getDate() + 3);

      const prazosVencendo = await this.prisma.intimacao.findMany({
        where: {
          AND: [
            { advogadoId: advogado.id },
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

      console.log(`[WhatsappIntimacaoService] Encontrados ${prazosVencendo.length} prazos vencendo`);

      return prazosVencendo;
    } catch (error) {
      console.error('[WhatsappIntimacaoService] Erro ao buscar prazos vencendo:', error);
      return [];
    }
  }

  async buscarComparecimentos(
    telefone: string, 
    dataInicio: string, 
    dataFim: string,
    tipoComparecimento?: string,
    proximo?: boolean
  ): Promise<IntimacaoCompleta[]> {
    try {
      console.log(`[WhatsappIntimacaoService] Buscando comparecimentos para ${telefone} entre ${dataInicio} e ${dataFim}`);

      // Primeiro, encontrar o advogado pelo telefone
      const advogado = await this.prisma.advogado.findFirst({
        where: {
          telefone: telefone,
          ativo: true
        }
      });

      if (!advogado) {
        console.log(`[WhatsappIntimacaoService] Advogado não encontrado para telefone: ${telefone}`);
        return [];
      }

      console.log(`[WhatsappIntimacaoService] Advogado encontrado: ${advogado.nome}`);

      const inicio = new Date(dataInicio + 'T00:00:00.000Z');
      const fim = new Date(dataFim + 'T23:59:59.999Z');

      const where: any = {
        AND: [
          { advogadoId: advogado.id },
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
        const comparecimentos = await this.prisma.intimacao.findMany({
          where,
          include: {
            processo: true,
            advogado: true
          },
          orderBy: { dataComparecimento: 'asc' },
          take: 1
        });

        console.log(`[WhatsappIntimacaoService] Encontrado ${comparecimentos.length} próximo comparecimento`);
        return comparecimentos;
      }

      const comparecimentos = await this.prisma.intimacao.findMany({
        where,
        include: {
          processo: true,
          advogado: true
        },
        orderBy: { dataComparecimento: 'asc' }
      });

      console.log(`[WhatsappIntimacaoService] Encontrados ${comparecimentos.length} comparecimentos`);

      return comparecimentos;
    } catch (error) {
      console.error('[WhatsappIntimacaoService] Erro ao buscar comparecimentos:', error);
      return [];
    }
  }

  async buscarPorIdDgenDetalhado(idDgen: string, telefone: string): Promise<IntimacaoCompleta | null> {
    try {
      console.log(`[WhatsappIntimacaoService] Buscando intimação ${idDgen} para telefone ${telefone}`);

      // Primeiro, encontrar o advogado pelo telefone
      const advogado = await this.prisma.advogado.findFirst({
        where: {
          telefone: telefone,
          ativo: true
        }
      });

      if (!advogado) {
        console.log(`[WhatsappIntimacaoService] Advogado não encontrado para telefone: ${telefone}`);
        return null;
      }

      const intimacao = await this.prisma.intimacao.findFirst({
        where: { 
          AND: [
            { idDgen: idDgen },
            { advogadoId: advogado.id }
          ]
        },
        include: {
          processo: true,
          advogado: true,
          notificacoes: true
        }
      });

      if (intimacao) {
        console.log(`[WhatsappIntimacaoService] Intimação ${idDgen} encontrada`);
      } else {
        console.log(`[WhatsappIntimacaoService] Intimação ${idDgen} não encontrada`);
      }

      return intimacao;
    } catch (error) {
      console.error('[WhatsappIntimacaoService] Erro ao buscar intimação por ID:', error);
      return null;
    }
  }
} 
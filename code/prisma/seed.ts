import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Limpar tabelas existentes na ordem correta
  await prisma.notificacao.deleteMany({});
  await prisma.googleAuth.deleteMany({});
  await prisma.consultaLog.deleteMany({});
  await prisma.execucaoLog.deleteMany({});
  await prisma.intimacao.deleteMany({});
  await prisma.processo.deleteMany({});
  await prisma.advogado.deleteMany({});
  await prisma.escritorio.deleteMany({});
  await prisma.feriado.deleteMany({});

  // Criar escritórios e advogados
  const escritorios = await Promise.all([
    prisma.escritorio.create({
      data: {
        id: "32338510-403d-4114-9aed-e951e95fcd24",
        nome: "Escritório Pedro Abder",
        email: "pdrobrand@gmail.com",
        ativo: false,
        plano: "TRIAL",
        firstEntry: true,
        advogados: {
          create: {
            id: "e09148ec-da9c-43c2-9dbd-80144573635a",
            nome: "Pedro Abder Nunes Raim Ramos",
            oab: "215993/MG",
            email: "pdrobrand@gmail.com",
            telefone: "5538999710148",
            googleCalendarId: "primary",
            ativo: true,
            whatsappVerificado: false,
            magicLinkToken: "c1fb65ecd6021fd574d3762717c88c246d6d1d64ebc83004cc5d09563189f7a1",
            magicLinkExpiry: new Date("2025-05-08 20:02:50.996"),
            createdAt: new Date("2025-05-02 18:11:35.399"),
            updatedAt: new Date("2025-05-07 20:02:50.997")
          }
        }
      },
      include: { advogados: true }
    }),
    
    prisma.escritorio.create({
      data: {
        id: "06a1e312-9e3f-464a-8ac5-a9c56fc60033",
        nome: "Escritório Alfredo Ramos",
        email: "alfredo@escritorio.com",
        ativo: false,
        plano: "TRIAL",
        firstEntry: true,
        advogados: {
          create: {
            id: "a8ff85e0-304e-493a-a4c4-2b6544e398f7",
            nome: "Alfredo Ramos Neto",
            oab: "123456/MG",
            email: "alfredo@escritorio.com",
            telefone: "5531994998233",
            googleCalendarId: "primary",
            ativo: true,
            whatsappVerificado: false,
            createdAt: new Date("2025-05-02 18:11:35.399"),
            updatedAt: new Date("2025-05-02 18:11:35.399")
          }
        }
      },
      include: { advogados: true }
    }),

    prisma.escritorio.create({
      data: {
        id: "1428b517-776a-4c98-8897-47f3dc73bb5f",
        nome: "Escritório Jussara Guimarães",
        email: "jussara@escritorio.com",
        ativo: false,
        plano: "TRIAL",
        firstEntry: true,
        advogados: {
          create: {
            id: "8dd5a999-d8a6-4f74-80f1-019e287ac14f",
            nome: "Jussara Emanoely Guimaraes Rodrigues",
            oab: "789012/MG",
            email: "jussara@escritorio.com",
            telefone: "5538999060417",
            googleCalendarId: "primary",
            ativo: true,
            whatsappVerificado: false,
            createdAt: new Date("2025-05-02 18:11:35.399"),
            updatedAt: new Date("2025-05-02 18:11:35.399")
          }
        }
      },
      include: { advogados: true }
    }),

    prisma.escritorio.create({
      data: {
        id: "21b454db-bb58-4afa-85e9-de395360818f",
        nome: "Escritório Hércules",
        email: "fffff@gmail.com",
        ativo: false,
        plano: "TRIAL",
        firstEntry: true,
        advogados: {
          create: {
            id: "03b50af8-7771-439d-b209-3e0e99011d7a",
            nome: "HERCULES HELOISIO DA COSTA SILVA",
            oab: "MG320504",
            email: "fffff@gmail.com",
            telefone: "5538991870203",
            googleCalendarId: null,
            ativo: true,
            whatsappVerificado: false,
            createdAt: new Date("2025-05-05 18:05:20.505"),
            updatedAt: new Date("2025-05-05 18:05:20.505")
          }
        }
      },
      include: { advogados: true }
    }),

    prisma.escritorio.create({
      data: {
        id: "26990579-959b-4eda-bb98-4d9956e13d81",
        nome: "Escritório Barbara",
        email: "barbara@escritorio.com",
        ativo: false,
        plano: "TRIAL",
        firstEntry: true,
        advogados: {
          create: {
            id: "925888aa-fe02-4fb7-a069-5ab2a2db1e7a",
            nome: "Barbara Dayane Martins Alves",
            oab: "MG123456",
            email: "barbara@escritorio.com",
            telefone: "5538991870203",
            googleCalendarId: null,
            ativo: true,
            whatsappVerificado: true,
            createdAt: new Date("2025-05-03 13:11:50.2"),
            updatedAt: new Date("2025-05-03 14:14:45.267")
          }
        }
      },
      include: { advogados: true }
    })
  ]);

  const feriadosTJMG = [
    // Janeiro - Confraternização e Feriado Forense
    { siglaTribunal: "TJMG", data: "2025-01-01T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-01-02T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-01-03T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-01-04T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-01-05T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-01-06T00:00:00Z" },

    // Março - Carnaval
    { siglaTribunal: "TJMG", data: "2025-03-03T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-03-04T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-03-05T00:00:00Z" },

    // Abril - Semana Santa e Tiradentes
    { siglaTribunal: "TJMG", data: "2025-04-16T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-04-17T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-04-18T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-04-21T00:00:00Z" },

    // Maio - Trabalho e Suspensão
    { siglaTribunal: "TJMG", data: "2025-05-01T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-05-02T00:00:00Z" },

    // Junho - Corpus Christi e Suspensão
    { siglaTribunal: "TJMG", data: "2025-06-19T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-06-20T00:00:00Z" },

    // Julho - Aniversário de Montes Claros
    { siglaTribunal: "TJMG", data: "2025-07-03T00:00:00Z" },

    // Agosto - Assunção Nossa Senhora (BH)
    { siglaTribunal: "TJMG", data: "2025-08-15T00:00:00Z" },

    // Setembro - Independência
    { siglaTribunal: "TJMG", data: "2025-09-07T00:00:00Z" },

    // Outubro - N.Sra Aparecida e Funcionário Público
    { siglaTribunal: "TJMG", data: "2025-10-12T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-10-27T00:00:00Z" },

    // Novembro - Finados, Proclamação, Consciência Negra e Suspensão
    { siglaTribunal: "TJMG", data: "2025-11-02T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-11-15T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-11-20T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-11-21T00:00:00Z" },

    // Dezembro - Dia da Justiça, Natal e Feriado Forense
    { siglaTribunal: "TJMG", data: "2025-12-08T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-12-20T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-12-21T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-12-22T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-12-23T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-12-24T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-12-25T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-12-26T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-12-27T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-12-28T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-12-29T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-12-30T00:00:00Z" },
    { siglaTribunal: "TJMG", data: "2025-12-31T00:00:00Z" }
  ];

  const feriadosTRT3 = [
    // Janeiro - Confraternização e Recesso
    { siglaTribunal: "TRT3", data: "2025-01-01T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-01-02T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-01-03T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-01-04T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-01-05T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-01-06T00:00:00Z" },

    // Março - Carnaval
    { siglaTribunal: "TRT3", data: "2025-03-03T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-03-04T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-03-05T00:00:00Z" },

    // Abril - Semana Santa e Tiradentes
    { siglaTribunal: "TRT3", data: "2025-04-16T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-04-17T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-04-18T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-04-19T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-04-20T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-04-21T00:00:00Z" },

    // Maio - Dia do Trabalho
    { siglaTribunal: "TRT3", data: "2025-05-01T00:00:00Z" },

    // Junho - Corpus Christi
    { siglaTribunal: "TRT3", data: "2025-06-19T00:00:00Z" },

    // Julho - Aniversário de Montes Claros
    { siglaTribunal: "TRT3", data: "2025-07-03T00:00:00Z" },

    // Agosto - Dia do Magistrado e Assunção
    { siglaTribunal: "TRT3", data: "2025-08-14T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-08-15T00:00:00Z" },

    // Setembro - Independência
    { siglaTribunal: "TRT3", data: "2025-09-07T00:00:00Z" },

    // Outubro - N.Sra Aparecida e Servidor Público
    { siglaTribunal: "TRT3", data: "2025-10-12T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-10-31T00:00:00Z" },

    // Novembro - Todos os Santos, Finados, Proclamação e Consciência Negra
    { siglaTribunal: "TRT3", data: "2025-11-01T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-11-02T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-11-15T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-11-20T00:00:00Z" },

    // Dezembro - Dia da Justiça, Natal e Recesso
    { siglaTribunal: "TRT3", data: "2025-12-08T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-12-20T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-12-21T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-12-22T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-12-23T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-12-24T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-12-25T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-12-26T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-12-27T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-12-28T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-12-29T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-12-30T00:00:00Z" },
    { siglaTribunal: "TRT3", data: "2025-12-31T00:00:00Z" }
  ];

  await prisma.feriado.createMany({
    data: [...feriadosTJMG, ...feriadosTRT3]
  });

  console.log('Seeds inseridos com sucesso:', {
    escritorios: escritorios.map(escritorio => ({
      id: escritorio.id,
      nome: escritorio.nome,
      plano: escritorio.plano,
      advogado: {
        id: escritorio.advogados[0].id,
        nome: escritorio.advogados[0].nome,
        oab: escritorio.advogados[0].oab,
        email: escritorio.advogados[0].email
      }
    }))
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

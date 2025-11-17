ERRO #1:

Teste: TOMAR_CIENCIA || AUDIENCIA [FALSO_POSITIVO] - Não foi designação de audiência
INTIMAÇÃO USADA: PODER JUDICIÁRIO DO ESTADO DE MINAS GERAIS Justiça de Primeira Instância Comarca de Belo Horizonte / 2ª Vara Empresarial da Comarca de Belo Horizonte Avenida Raja Gabaglia, 1753, Luxemburgo, Belo Horizonte - MG - CEP: 30380-900 PROCESSO Nº: 5052425-33.2025.8.13.0024 CLASSE: [CÍVEL] IMPUGNAÇÃO DE CRÉDITO (114) ALCIDES SOARES DE OLIVEIRA CPF: 702.860.196-04 COTEMINAS S.A. CPF: 07.663.140/0001-99 Intime-se a parte autora sobre a manifestação da Recuperanda. MICHELLE NICOLLE PEREIRA Belo Horizonte, data da assinatura eletrônica.
Categoria: Testes de Ação Recomendada
Status: ❌ FALHOU
Esperado: {
  acao_recomendada: TOMAR_CIENCIA,
  tipo_comparecimento: null,
  data_comparecimento: null,
  horario_comparecimento: null
}
Recebido: {
  tipo_ato: DESPACHO,
  tipo_manifestacao: IMPUGNAÇÃO,
  prazo: null,
  base_legal_prazo: null,
  resumo: Intimação da parte autora sobre manifestação da Recuperanda.,
  reu: COTEMINAS S.A.,
  advogado_destinatario: MICHELLE NICOLLE PEREIRA,
  consequencias_praticas: Prazo para manifestação em curso,
  acoes_sugeridas: [
    MANIFESTAR_SE
  ],
  status_sistema: Prazo para IMPUGNAÇÃO em curso,
  tipo_comparecimento: null,
  data_comparecimento: null,
  horario_comparecimento: null,
  instancia: PRIMEIRA,
  categoria_processual: CIVIL,
  acao_recomendada: MANIFESTAR_SE
}
</pre>

Erro #2:
Teste: MANIFESTAR-SE || PRAZO NO TEXTO - Devolução de Autos com Penalidade
INTIMAÇÃO: "COMARCA DE MONTES CLAROS<br />2ª VARA DE FAMÍLIA<br />SEPARAÇÃO LITIGIOSA<br />DATA DE EXPEDIENTE: 20/05/2025<br /><br />REQUERENTE: R.R.B. ; REQUERIDO: W.S.B.<br />Intime-se o advogado, inscrito na OAB sob número 085981MG, Dr(a). MATEUS RODRIGUES GONCALVES para devolução dos autos à Secretaria no prazo de 3 dias, sob pena de busca e apreensão, de perder o direito à vista fora da secretaria e incorrer em multa correspondente à metade do salário-mínimo. ** AVERBADO **<br />Adv - ALFREDO RAMOS NETO, GERALDO HONORATO MARQUES, JOAO ADILSON NUNES OLIVEIRA, ROMILDA RABELO BARBOSA, RITA EDITE LOPES BORGES, MARK DAMON DUARTE BORGES, VALDEMAR NOVAIS, FERNANDO PEREIRA JORGE, LEONARDO DE OLIVEIRA LOPES, LUIZ SOARES BARBOSA, MATEUS RODRIGUES GONCALVES.",
Categoria: Testes de Ação Recomendada
Status: ❌ FALHOU
Esperado: {
  acao_recomendada: MANIFESTAR_SE,
  prazo: 3
}
Recebido: {
  tipo_ato: DESPACHO,
  tipo_manifestacao: DEVOLUÇÃO DOS AUTOS,
  prazo: 3,
  base_legal_prazo: Código de Processo Civil - Art. 190,
  resumo: Intimação para devolução dos autos à Secretaria em 3 dias sob pena de busca e apreensão e multa.,
  reu: W.S.B.,
  advogado_destinatario: MATEUS RODRIGUES GONCALVES,
  consequencias_praticas: Busca e apreensão dos autos, perda do direito à vista fora da secretaria e multa.,
  acoes_sugeridas: [
    Devolver os autos à Secretaria dentro do prazo estabelecido
  ],
  status_sistema: Prazo para devolução dos autos em curso,
  tipo_comparecimento: null,
  data_comparecimento: null,
  horario_comparecimento: null,
  instancia: PRIMEIRA,
  categoria_processual: CIVIL,
  acao_recomendada: TOMAR_CIENCIA
}
</pre>

ERRO #3:
Teste: COMPARECER || PAUTA DE JULGAMENTO - Virtual RITJMG com Memoriais
INTIMAÇÃO: Apelante(s) - RICARDO SANTOS BRANT; Apelado(a)(s) - MINISTÉRIO PÚBLICO DO ESTADO DE MINAS GERAIS; <br />Relator - Des(a). Doorgal Borges de Andrada<br />Revisor - Des(a). Corrêa Camargo<br />Intimação: Designado o feito para julgamento virtual, nos termos do art. 118 do RITJMG, não havendo nesta modalidade de julgamento a possibilidade de participação de advogados, partes e interessados. Em caso de eventual oposição ao julgamento virtual, as partes deverão se manifestar no prazo de cinco dias e o feito será incluído, oportunamente, em sessão de julgamento presencial ou por videoconferência. : Este feito foi incluído na sessão de julgamento VIRTUAL (art. 118, RITJMG) do dia 11/06/2025, às 13 horas. As partes habilitadas que desejarem apresentar memoriais orais poderão encaminhar, para o e-mail cacri4@tjmg.jus.br, juntamente com o pedido de inscrição, áudio ou vídeo contendo sua manifestação, até 48 horas antes do início do julgamento, nos termos da Portaria Conjunta 963/PR/2020, anexo III, TJMG. Podem, ainda, opor-se ao julgamento virtual. Não havendo inscrição para assistência/sustentação oral nem oposição ao julgamento virtual, o feito será julgado pelo sistema eletrônico.<br />Adv - ANA LUIZA ARAUJO ANTUNES, BRUNA SUELLEN GONCALVES SIQUEIRA, HERCULES HELOISIO DA COSTA SILVA, JUSSARA EMANOELY GUIMARAES RODRIGUES, LARISSA SANTOS FERREIRA, LIVIA CAROLLINE ALVES ANDRADE, ROGERIO VELLOSO NETO.
Categoria: Testes de Ação Recomendada
Status: ❌ FALHOU
Esperado: {
  acao_recomendada: COMPARECER,
  tipo_comparecimento: PAUTA_DE_JULGAMENTO,
  data_comparecimento: 2025-06-11,
  horario_comparecimento: 13:00
}
Recebido: {
  tipo_ato: DECISÃO,
  tipo_manifestacao: PAUTA_DE_JULGAMENTO,
  prazo: null,
  base_legal_prazo: art. 118 do RITJMG,
  resumo: Designado julgamento virtual. Possibilidade de apresentação de memoriais orais. Oposição ao julgamento virtual em 5 dias.,
  reu: MINISTÉRIO PÚBLICO DO ESTADO DE MINAS GERAIS,
  advogado_destinatario: ANA LUIZA ARAUJO ANTUNES, BRUNA SUELLEN GONCALVES SIQUEIRA, HERCULES HELOISIO DA COSTA SILVA, JUSSARA EMANOELY GUIMARAES RODRIGUES, LARISSA SANTOS FERREIRA, LIVIA CAROLLINE ALVES ANDRADE, ROGERIO VELLOSO NETO,
  consequencias_praticas: Julgamento virtual sem participação presencial. Possibilidade de apresentação de memoriais orais.,
  acoes_sugeridas: [
    MANIFESTAR_SE
  ],
  status_sistema: Prazo para PAUTA_DE_JULGAMENTO em curso,
  tipo_comparecimento: PAUTA_DE_JULGAMENTO,
  data_comparecimento: 2025-06-11,
  horario_comparecimento: 13:00,
  instancia: SEGUNDA,
  categoria_processual: CIVIL,
  acao_recomendada: MANIFESTAR_SE
}
</pre>


ERRO #4:
Teste: COMPARECER || AUDIENCIA - AGC Recuperação Judicial
INTIMAÇÃO: COMARCA DE BELO HORIZONTE<br />2ª VARA EMPRESARIAL<br />RECUPERAÇÃO JUDICIAL<br />DATA DE EXPEDIENTE: 05/05/2025<br /><br />2ª VARA EMPRESARIAL DA COMARCA DE BELO HORIZONTE. EDITAL DE CONVOCAÇÃO DE ASSEMBLEIA GERAL DE CREDORES REFERENTE AO PROCESSO JUDICIAL ELETRÔNICO (PJE) nº: 5110566-79.2024.8.13.0024, da ação de RECUPERAÇÃO JUDICIAL DAS EMPRESAS: COTEMINAS S.A. - CNPJ: 07.663.140/0001-99; EMPRESA NACIONAL DE COMÉRCIO, CRÉDITO E PARTICIPAÇÕES S.A.-ENCORPAR - CNPJ: 01.971.614/0001-83; ENCORPAR EMPREENDIMENTOS IMOBILIÁRIOS LTDA - CNPJ: 17.721.008/0001-40; COMPANHIA DE TECIDOS NORTE DE MINAS COTEMINAS - CNPJ: 22.677.520/0001-76; SANTANENSE EMPREENDIMENTOS IMOBILIÁRIOS LTDA - CNPJ: 17.749.864/0001-03; OXFORD COMÉRCIO E PARTICIPAÇÕES S.A. - CNPJ: 06.316.597/0001-64; COMPANHIA TECIDOS SANTANENSE - CNPJ: 21.255.567/0001-89; SPRINGS GLOBAL PARTICIPAÇÕES S.A. - CNPJ: 07.718.269/0001-57; AMMO VAREJO S.A. - CNPJ: 03.494.776/0001-01; FAZENDA DO CANTAGALO LTDA - CNPJ: 18.892.091/0001-82. O Dr. Murilo Silvio de Abreu, Juiz de Direito da 2ª Vara Empresarial de Belo Horizonte/MG, em pleno exercício de seu cargo, na forma da lei, etc. Faz saber a todos, nos termos do art. 36 da lei. nº 11.101/2005 que, pelo presente edital, fica convocada ASSEMBLEIA GERAL DE CREDORES, cuja realização não se dará antes de quinze dias da data de publicação deste edital, a realizar-se EM AMBIENTE VIRTUAL. A assembleia ocorrerá em em primeira convocação no dia 12/06/2025, quinta-feira, às 13:30 horas e, em segunda convocação, às 13:30 horas do dia 26/06/2025, com a finalidade de deliberar sobre o plano de recuperação judicial, ou outra matéria que possa afetar os interesses dos credores. E, para que chegue ao conhecimento de todos, é expedido o presente edital que será publicado no Diário de Justiça Eletrônico e disponibilizado no site da Administração Judicial: <https://inocenciodepaulaadvogados.com.br/>, conforme estabelece o artigo 36 da Lei 11.101/2005. Devendo-se observar os procedimentos trazidos pela Administração Judicial em sua petição de ID10440128025 do processo, a seguir transcritos: DOS PROCEDIMENTOS PARA AGC. CONSOLIDAÇÃO DO PROCEDIMENTO DE CADASTRAMENTO PARA ASSEMBLEIA GERAL DE CREDORESNA FORMA VIRTUAL: Todos os credores terão ciência formal da data de realização da assembleiavirtual realizada através da Plataforma Assemblex, pelo Edital a ser publicado. Visando o transcurso natural da Assembleia Geral de Credores virtual, esta Administradora Judicial entende ser de extrema importância trazer ao referendo judicial os procedimentos que serão adotados para a realização do conclave em ambiente virtual, sugerindo que após a homologação do procedimento por este Juízo, seja remetido à publicação, dando ciência a todos credores e interessados. DO CADASTRAMENTO PRÉVIO DOS CREDORES: A assembleia ocorrerá de forma virtual, através da Plataforma Assemblex, sendo imprescindível que o credor ou seu representante efetue sua habilitação da seguinte forma: I - Para participar da AGC do Grupo Coteminas por meio da plataforma Assemblex, os credores/procuradores devem seguir as seguintes instruções: Criar uma Conta na Plataforma da Assemblex (https://assemblexpillar.com.br). Realizar o cadastro como credor. Após o cadastro, será recebido um e-mail da plataforma com um link para criação de senha. Após criar a senha, utilize o e-mail e a senha cadastrada para acessar a plataforma. No menu principal, vá até a seção Processos RJ. Localize o processo de Recuperação Judicial do Grupo Coteminas. Solicite a habilitação no processo. Para que a habilitação seja concluída com sucesso, é necessário: fazer o upload dos documentos solicitados, como documento próprio do credor e documento de representação (caso atue por meio de representante). Selecionar o credor que será representado. Para participar da assembleia, clique na opção Acessar Assembleia disponível na plataforma. A Assemblex oferece suporte técnico para auxiliar em todas as etapas do processo, disponível via chat online na plataforma e pelo WhatsApp 48 3372-8910, de segunda-feira a sexta-feira das 08:00hs às 18:00hs. II - Caso o representante assista a diversos credores, este deverá indicar todos os dados de cada credor (constantes na lista acima), e para a representação receberá apenas um login e senha, que possibilitará o acesso ao sistema para todos os credores e posterior votação de forma individual de seus representados. III - Somente será permitido 01 (um) acesso por login na plataforma durante a Assembleia Geral de Credores. IV - O participante habilitado no PRÉ-CADASTRO pela Administração Judicial receberá no endereço de e-mail indicado, as instruções necessárias para participação na assembleia virtual, com o login e a senha provisória para acesso à plataforma Digital Assemblex. V - Caso o participante não receba o e-mail com as informações para acesso, com o login e a senha provisória, deverá entrar em contato por um dos canais de suporte para verificação e solicitação dos dados necessários para o ingresso na plataforma. VI - O participante responsabiliza-se pela verificação dos seus dados pessoais no momento do login, bem como pela proteção de sua senha, que é pessoal e intransferível. VII - No dia anterior à realização da Assembleia Geral de Credores, o participante DEVERÁ realizar o login na plataforma para testar seus acessos. VIII - No dia da Assembleia Geral de Credores o participante deverá estar conectado à internet por meio de uma rede segura, estável e operacional, utilizando o dispositivo de sua preferência (computador ou celular). IX - Recomenda-se o uso de laptops ou desktops com o navegador de internet atualizado (preferencialmente sistema operacional Windows e navegador Google Chrome), bem como dispositivo backup para o caso de o dispositivo principal apresentar problemas. X - A admissão ocorrerá das 10h30min às 13h29min do dia 12/06/2025 (03 horas antes do início da assembleia), devendo cada credor e representante promover sua admissão por meio de acesso à plataforma Assemblex. DA ASSEMBLEIA VIRTUAL:  A assembleia será transmitida ao vivo pela Plataforma Assemblex para todos os representantes e credores aptos a participar do conclave que tenham promovido seu cadastro e admissão. A Administradora redigirá a ata, que poderá ser validada com a gravação do conclave que ficará disponível no canal da Assemblex e da plataforma de streaming Youtube. O participante da assembleia terá na tela de seu computador, a página da assembleia virtual na qual conterá também a área destinada a vídeo chamada, cujo acesso dependerá apenas da inclusão do seu nome. Durante a fase de deliberações o Presidente franqueará a palavra aos credores, através de vídeo chamada e também via chat de perguntas (ambas disponíveis na Plataforma Assemblex), as quais serão todas respondidas e posteriormente acostadas à ata. Finalizada a fase de deliberações, terá início a fase de votação, também via plataforma Assemblex, quando os presentes serão instruídos a votar por meio da plataforma, conforme instruções que serão passadas. Computados os votos, o Administrador Judicial encerra a fase de votação, informado em seguida o resultado, promovendo o posterior encerramento da AGC. OUVINTES: Os ouvintes interessados em assistir à Assembleia deverão acessar o canal da Assemblex da plataforma digital de streaming YouTube, tendo em vista que a Assembleia Geral de Credores será transmitida ao vivo. SUPORTE: Esta Administradora Judicial esclarece ainda que, caso o credor ou representante tenha dificuldade no acesso durante o período de admissão, ocorra a perda de conexão de qualquer credor ou representante durante a Assembleia ou ocorra qualquer dificuldade na reconexão ao conclave, terá à disposição um chat online e WhatsApp 48 3372-8910 a partir das 09:00hs até às 18:00hs do dia anterior a realização da Assembleia Geral de Credores e no dia da Assembleia Geral de Credores, no mesmo horário. O suporte por estes canais de atendimento são somente para sanar suas dúvidas e receber suporte da equipe técnica. Restando fixada a data para realização da Assembleia ao dia 12/06/2025 (quinta-feira), os credores e/ou representantes de credores deverão realizar seu pré-cadastramento na forma acima especificada até o dia 11/06/2025, 13h30, sob pena de não poderem participar do ato, na forma do art. 37, §4º, da Lei 11.101/2005. O credor que queira ser representado na assembleia por mandatário ou representante legal, na forma do art. 37, § 4º, da Lei 11.101/2005, deverá enviar, no prazo assinalado (24h antes do ato), toda a documentação que comprove a regularidade dos poderes de representação, incluindo cláusula para transigir, e inclusive apresentando os atos societários que demonstrem a cadeia de representação. Os sindicatos de trabalhadores poderão representar seus associados titulares de créditos derivados da legislação do trabalho ou decorrentes de acidente de trabalho que não comparecerem, pessoalmente ou por procurador, à assembleia, mas deverão, para tanto, apresentar ao administrador judicial, até 10 (dez) dias antes da assembleia, por meio do e-mail contato@rjcoteminas.com.br a relação dos associados que pretende representar, e o trabalhador que conste da relação de mais de um sindicato deverá esclarecer, até 24 (vinte e quatro) horas antes da assembleia, qual sindicato o representa, sob pena de não ser representado em assembleia por nenhum deles. VISÃO GERAL: É importante consignar que, uma vez realizada a habilitação dos credores ou de seus representantes para participação na Assembleia Geral de Credores em 1ª convocação (não instalada), não há necessidade de um novo cadastro. Em caso de não instalação da Assembleia Geral de Credores em 1ª convocação, aqueles credores ou seus representantes que não se habilitaram para a Assembleia em 1ª convocação e pretendam participar da 2ª convocação, a ser realizada no dia 26/06/2025, às 13h30min, de forma virtual, deverão efetuar a sua habilitação nos moldes do item DO CADASTRAMENTO PRÉVIO DOS CREDORES até o dia 25/06/2025 às 13h30min, sob pena de não poderem participar do ato, na forma do art. 37, §4º, da Lei 11.101/2005. O credor que queira ser representado na assembleia por mandatário ou representante legal, na forma do art. 37, § 4º, da Lei 11.101/2005, deverá enviar, no prazo assinalado (24h antes do ato), toda a documentação que comprove a regularidade dos poderes de representação, incluindo cláusula para transigir, e inclusive apresentando os atos societários que demonstrem a cadeia de representação. Os sindicatos de trabalhadores poderão representar seus associados titulares de créditos derivados da legislação do trabalho ou decorrentes de acidente de trabalho que não comparecerem, pessoalmente ou por procurador, à assembleia, mas deverão, para tanto, apresentar à Administradora judicial, até 10 (dez) dias antes da assembleia, por meio do e-mail contato@rjcoteminas.com.br a relação dos associados que pretende representar, e o trabalhador que conste da relação de mais de um sindicato deverá esclarecer, até 24 (vinte e quatro) horas antes da assembleia, qual sindicato o representa, sob pena de não ser representado em assembleia por nenhum deles. Belo Horizonte, aos 05 de maio de 2025. Claudio Lourenço Vieira, eventual substituto da Escrivã Judicial, por determinação do MM. Juiz de Direito.
Categoria: Testes de Ação Recomendada
Status: ❌ FALHOU
Esperado: {
  acao_recomendada: COMPARECER,
  tipo_comparecimento: AUDIENCIA,
  data_comparecimento: 2025-06-12,
  horario_comparecimento: 13:30
}
Recebido: {
  tipo_ato: DECISÃO,
  tipo_manifestacao: AUDIÊNCIA,
  prazo: null,
  base_legal_prazo: null,
  resumo: Convocação de Assembleia Geral de Credores em ambiente virtual para deliberar sobre plano de recuperação judicial.,
  reu: COTEMINAS S.A., EMPRESA NACIONAL DE COMÉRCIO, CRÉDITO E PARTICIPAÇÕES S.A.-ENCORPAR, ENCORPAR EMPREENDIMENTOS IMOBILIÁRIOS LTDA, COMPANHIA DE TECIDOS NORTE DE MINAS COTEMINAS, SANTANENSE EMPREENDIMENTOS IMOBILIÁRIOS LTDA, OXFORD COMÉRCIO E PARTICIPAÇÕES S.A., COMPANHIA TECIDOS SANTANENSE, SPRINGS GLOBAL PARTICIPAÇÕES S.A., AMMO VAREJO S.A., FAZENDA DO CANTAGALO LTDA,
  advogado_destinatario: não informado,
  consequencias_praticas: Deliberar sobre o plano de recuperação judicial ou outra matéria que possa afetar os interesses dos credores.,
  acoes_sugeridas: [
    TOMAR_CIENCIA
  ],
  status_sistema: Prazo para AUDIÊNCIA em curso,
  tipo_comparecimento: AUDIENCIA,
  data_comparecimento: 2025-06-12,
  horario_comparecimento: 13:30,
  instancia: PRIMEIRA,
  categoria_processual: CIVIL,
  acao_recomendada: TOMAR_CIENCIA
}
</pre>







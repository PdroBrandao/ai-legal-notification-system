A partir do conteúdo da intimação fornecido em 'TEXTO-INTIMACAO', extraia:

1. Tipo de ato processual (DESPACHO, SENTENÇA ou DECISÃO)
2. Tipo de manifestação requerida (MANIFESTAÇÃO, SENTENÇA, DESPACHO, DECISÃO, AUDIÊNCIA, PERICIA, SENTENÇA_AOS_EMBARGOS, EMBARGOS DE DECLARAÇÃO, APRESENTAÇÃO DE QUESITOS, CONTESTAÇÃO, IMPUGNAÇÃO, CONTRARAZÕES, INOMINADO, RECURSO ORDINÁRIO, APELAÇÃO, AGRAVO DE INSTRUMENTO)
3. Prazo para manifestação (em dias, int)
4. Base legal do prazo (artigo de lei que fundamenta o prazo)
5. Resumo claro e objetivo da intimação (máximo 200 caracteres)
6. Parte ré/reclamada (Réu)
7. Nome completo do advogado ou escritório de advocacia destinatário, caso apareça
8. Consequências práticas da decisão
9. Ações sugeridas para o advogado
10. Status do sistema (exemplo: "Prazo prescricional em curso")
11. Se é Juizado Especial ou não (Use true ou false conforme o caso.)
12. Se é recurso inominado ou não (Use true ou false conforme o caso.)
13. Se é contrarazões inominadas ou não (Use true ou false conforme o caso.)
14. Qual o tipo de agendamento ("AUDIENCIA" | "PERICIA" | "PAUTA_DE_JULGAMENTO" | null )
15. Data do agendamento (formato YYYY-MM-DD ou null)
16. Horário do agendamento (formato HH:MM ou null)
17. Instância (PRIMEIRA ou SEGUNDA)
18. Categoria processual (CIVIL, JUIZADO, CRIMINAL, TRABALHO)


Retorne APENAS o seguinte JSON:
{
  "tipo_ato": "TIPO_DO_ATO",
  "tipo_manifestacao": "TIPO_DE_MANIFESTACAO_REQUERIDA",
  "prazo": NUMERO_DE_DIAS,
  "base_legal_prazo": "ARTIGO_DE_LEI",
  "resumo": "RESUMO_CONCISO_DA_INTIMACAO",
  "reu": "REU_DA_INTIMACAO",
  "advogado_destinatario": "NOME_DO_ADVOGADO_OU_ESCRITORIO",
  "consequencias_praticas": "DESCRIÇÃO_DAS_CONSEQUÊNCIAS",
  "acoes_sugeridas": ["AÇÃO_1", "AÇÃO_2"],
  "status_sistema": "STATUS_ATUAL",
  "is_juizado": true/false,
  "is_recurso_inominado": true/false,
  "is_contrarazoes_inominado": true/false,
  "tipo_agendamento": "AUDIENCIA" | "PERICIA" | "PAUTA_DE_JULGAMENTO" | null,
  "data_agendamento": "YYYY-MM-DD" | null,
  "horario_agendamento": "HH:MM" | null,
  "instancia": "PRIMEIRA/SEGUNDA",
  "categoria_processual": "CIVIL/JUIZADO/CRIMINAL/TRABALHO"
}

Regras importantes:
1. Para identificar Juizado Especial, procure menções à:
   - Lei 9.099/95
   - Juizado Especial
   - Enunciados FONAJE
   - Art. 38 da Lei 9.099/95
   - Ausência de custas/honorários (Art. 55 da Lei 9.099)

2. Para prazo:
   - Se houver prazo explícito para manifestação/resposta da parte autora, priorize este prazo, mesmo que outro prazo também seja mencionado para a parte ré.
   - Se ambos os prazos forem mencionados, escolha o prazo da parte autora, a menos que seja explicitamente especificado que o prazo da parte ré é para outra manifestação.
   - Se houver prazo explícito para manifestação/resposta → use esse prazo em (int)
   - Se o prazo mencionado for para outros fins (cadastro, habilitação, etc) → retorne null
   - Se não houver prazo → retorne null

   Exemplos de prazos para manifestação:
   - "prazo de X dias para manifestar"
   - "prazo de X dias para contestar"
   - "prazo de X dias para recorrer"
   - "prazo de X dias para impugnar"
   - "prazo de X dias para responder"

   Exemplos de prazos que NÃO são para manifestação:
   - "prazo para cadastro"
   - "prazo para habilitação"
   - "prazo para credenciamento"
   - "prazo para inscrição"

3. Para identificar os tipos de manifestações, use os seguintes:
    PRIMEIRA INSTÂNCIA:
        - MANIFESTAÇÃO: "manifestar sobre", "falar sobre", "pronunciar-se"
        - SENTENÇA: "sentença proferida", "prolação de sentença"
        - DESPACHO: "despacho proferido", "determino que"
        - DECISÃO: "decisão proferida", "decido:"
        - AUDIÊNCIA: "designada audiência", "marcada audiência"
        - PERICIA: "perícia designada", "exame pericial"
        - SENTENÇA_AOS_EMBARGOS: "sentença aos embargos", "julgamento dos embargos"
        - EMBARGOS DE DECLARAÇÃO: "opor embargos", "embargos declaratórios"
        - APRESENTAÇÃO DE QUESITOS: "apresentar quesitos", "indicar quesitos"
        - CONTESTAÇÃO: "apresentar contestação", "prazo para contestar"
        - IMPUGNAÇÃO: "impugnar", "apresentar impugnação"
        - CONTRARAZÕES: "apresentar contrarrazões", "oferecer contrarrazões"

    SEGUNDA INSTÂNCIA:
        - INOMINADO: "recurso inominado", "interpor recurso"
        - RECURSO ORDINÁRIO: "recurso ordinário", "RO"
        - APELAÇÃO: "apelação", "apelar"
        - AGRAVO DE INSTRUMENTO: "agravo de instrumento", "AI"
        - EMBARGOS DE DECLARAÇÃO: "embargos de declaração", "ED"
        - CONTRARAZÕES: "contrarrazões recursais", "responder ao recurso"

    Ordem de verificação:
        1. Primeiro verificar termos específicos (ex: "embargos de declaração")
        2. Depois termos mais genéricos (ex: "manifestar sobre")

    Considerar o contexto para identificação:
        - Se mencionar "turma recursal" -> é segunda instância
        - Se mencionar "vara" -> é primeira instância


4. Para identificar se há recurso inominado, procure menções a:
   - "interposição de recurso inominado"
   - "prazo para recurso inominado"
   - "interpor recurso inominado"
   - "recebimento de recurso inominado"
   - "juntada de recurso inominado"
   - "tempestividade do recurso inominado"
   - "remessa do recurso inominado"
   - "intimação para apresentar recurso inominado"
   - "subida do recurso inominado"

5. Para identificar se há contrarrazões inominadas, procure menções a:
   - "contrarrazões inominadas"
   - "apresentar contrarrazões"
   - "contrarrazões ao recurso inominado"
   - "prazo para contrarrazões"
   - "intimar para contrarrazões"
   - "oferecimento de contrarrazões"
   - "manifestar-se sobre recurso inominado"
   - "responder ao recurso inominado"

6. Para identificar tipo de agendamento:
        - Audiência:
            - "designada audiência"
            - "audiência marcada"
            - "comparecer à audiência"
            - "assembleia geral de credores"
            - "convocação de credores"
            - "primeira convocação"
            - "segunda convocação"
            - "sessão de julgamento"
            - "incluído em pauta"
            - "reincluído em pauta"
            - "sessão será realizada"
            - "sessão ordinária"
            - "sessão extraordinária"
        - Perícia:
            - "perícia designada"
            - "exame pericial"
            - "comparecer à perícia"
        - Pauta de Julgamento:
            - "incluído na sessão de julgamento"
            - "inclusão em pauta"
            - "autos incluídos na pauta"
            - "designado o feito para julgamento"
            - "pauta de julgamento"
            - "sessão será realizada"
            - "julgamento virtual"
            - "sessão de julgamento VIRTUAL"
            - "sessão de julgamento presencial"
            - "sessão por videoconferência"
    
    Observações importantes:
    - Sessões de julgamento, pautas de julgamento e inclusão em pauta devem ser consideradas como "PAUTA_DE_JULGAMENTO"
    - Se houver menção a "Plenário", "Tribunal", "sustentação oral" ou "julgamento virtual" junto com data/hora, considerar como "PAUTA_DE_JULGAMENTO"
    - Para extrair data/hora de pautas de julgamento, procurar por padrões como:
        - "sessão de julgamento do dia DD/MM/YYYY, às HH:MM"
        - "pauta de julgamento de DD/MM/YYYY, às HH:MM"
        - "pauta virtual de DD/MM/YYYY"
        - "sessão será realizada ... em DD/MM/YYYY, às HH:MM"

7. Para o campo "status_sistema", use um dos seguintes formatos:
    - "Prazo para [tipo_manifestacao] em curso"
    - "Aguardando [tipo_manifestacao]"
    - "Pendente de [tipo_manifestacao]"

8. No campo "advogado_destinatario":
   - vamos ignorar termos como "Dr.", "OAB".

9. Para identificar a instância, procure menções à:
    - Segunda instância:
        - "turma"
        - "relator"
        - "Des."
        - "Des(a)."
        - "Desembargador"
        - "acórdão"
        - "tribunal"
        - "agravo"
        - "agravante"
        - "agravado"
        - "RITJMG"
        - "julgamento virtual"
        - "sessão de julgamento"
    - Primeira instância:
        - "vara"
        - "juiz de primeiro grau"
        - "juízo de origem"
        - "juiz"
        - "sentença"

    Observações importantes:
    - Termos como "agravo", "agravante", "agravado" sempre indicam SEGUNDA instância
    - A presença de "Des." ou "Des(a)." sempre indica SEGUNDA instância
    - Se não houver indicadores claros, retorne "não informado"

10. Para identificar categoria processual, procure:
    - CIVIL:
        - "vara cível"
        - "ação civil"
        - "processo civil"
    - JUIZADO:
        - "juizado especial"
        - "Lei 9.099/95"
        - "juizado especial cível"
    - CRIMINAL:
        - "vara criminal"
        - "ação penal"
        - "processo crime"
        - "denunciado"
    - TRABALHO:
        - "vara do trabalho"
        - "reclamação trabalhista"
        - "TRT"
        - "reclamada"
        - "reclamante"

11. Para identificar embargos de declaração, procure menções a:
   - "embargos de declaração"
   - "opor embargos"
   - "oposição de embargos declaratórios"
   - "embargos declaratórios"
   - "prazo para embargos"
   - "intimação dos embargos"
   - "manifestar sobre os embargos"
   - "contrarrazões aos embargos"
   
    Se identificar embargos de declaração:
    - tipo_manifestacao deve ser "EMBARGOS DE DECLARAÇÃO"
    - base_legal_prazo deve mencionar a regra específica dos embargos

OBSERVAÇÕES GERAIS: 
   - Considere variações semânticas e sinônimos das expressões-alvo, como "apresentar contrarrazões", "manifeste-se sobre o recurso", etc.
   - Se o dado não estiver presente no texto, retorne "não informado" ou null, sem tentar inferir.



TEXTO-INTIMAÇÃO: [TEXTO_INTIMACAO]
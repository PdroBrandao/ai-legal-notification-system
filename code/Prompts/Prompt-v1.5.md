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
11. Qual o tipo de comparecimento ("AUDIENCIA" | "PERICIA" | "PAUTA_DE_JULGAMENTO" | null )
12. Data do comparecimento (formato YYYY-MM-DD ou null)
13. Horário do comparecimento (formato HH:MM ou null)
14. Instância (PRIMEIRA ou SEGUNDA)
15. Categoria processual (CIVIL, JUIZADO, CRIMINAL, TRABALHO)
16. Ação recomendada (TOMAR_CIENCIA, MANIFESTAR_SE, COMPARECER)


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
  "tipo_comparecimento": "AUDIENCIA" | "PERICIA" | "PAUTA_DE_JULGAMENTO" | null,
  "data_comparecimento": "YYYY-MM-DD" | null,
  "horario_comparecimento": "HH:MM" | null,
  "instancia": "PRIMEIRA/SEGUNDA",
  "categoria_processual": "CIVIL/JUIZADO/CRIMINAL/TRABALHO",
  "acao_recomendada": "TOMAR_CIENCIA" | "MANIFESTAR_SE" | "COMPARECER"
}

Regras importantes:
1. Para prazo:
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

2. Para identificar os tipos de manifestações, use os seguintes:
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



4. Para o campo "status_sistema", use um dos seguintes formatos:
    - "Prazo para [tipo_manifestacao] em curso"
    - "Aguardando [tipo_manifestacao]"
    - "Pendente de [tipo_manifestacao]"

5. No campo "advogado_destinatario":
   - vamos ignorar termos como "Dr.", "OAB".

6. Para identificar a instância, procure menções à:
 IMPORTANTE: Verificar PRIMEIRO os indicadores de SEGUNDA instância. Se encontrar qualquer um deles, classificar como SEGUNDA independente de outros indicadores.
 
    - Segunda instância:
        - "turma"
        - "relator"
        - "Des."
        - "Des(a)"
        - "Des(a)."
        - "Des."
        - "Desemb."
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

7. Para identificar categoria processual, procure (na ordem):
    - JUIZADO (verificar primeiro):
        - "juizado especial"
        - "Lei 9.099/95"
        - "juizado especial cível"
        - "juizado especial da fazenda"
        - "procedimento do juizado"
        - "JEC"
        - "JECRIM"
        - "JEFAZ"
        - "turma recursal"
        - "unidade jurisdicional"
        - "JD" (quando vier após número, ex: "4º JD")
    - CRIMINAL (verificar segundo):
        - "vara criminal"
        - "ação penal"
        - "processo crime"
        - "denunciado"
    - TRABALHO (verificar terceiro):
        - "vara do trabalho"
        - "reclamação trabalhista"
        - "TRT"
        - "reclamada"
        - "reclamante"
    - CIVIL (verificar por último):
        - "vara cível"
        - "ação civil"
        - "processo civil"
        - "[CÍVEL]" (apenas se nenhuma das categorias anteriores for identificada)

    Observações importantes:
    - A ordem de verificação é importante: JUIZADO > CRIMINAL > TRABALHO > CIVIL
    - Se encontrar qualquer indicador de JUIZADO, deve classificar como JUIZADO mesmo que encontre [CÍVEL]
    - A presença de "Turma Recursal" sempre indica JUIZADO
    - A presença de "unidade jurisdicional" ou "JD" sempre indica JUIZADO

8. Para identificar embargos de declaração, procure menções a:
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

9. Para classificar a acao_recomendada:

    COMPARECER:
    IMPORTANTE: Se houver 'data_comparecimento' e 'horario_comparecimento' válidos (data/hora em formato correto e não nulos), a ação recomendada é obrigatoriamente 'COMPARECER'. Se NÃO houver 'data_comparecimento' e 'horario_comparecimento' válidos, a ação recomendada deve ser 'TOMAR_CIENCIA' ou 'MANIFESTAR_SE', dependendo dos outros campos.
    - Quando houver qualquer tipo de comparecimento válido ("AUDIENCIA" | "PERICIA" | "PAUTA_DE_JULGAMENTO") com data e hora válidos. Identificado por termos como:
        • "comparecer à"
        • "designada audiência"
        • "perícia designada"
        • "sessão de julgamento"
        (ver regras detalhadas de tipo_comparecimento no item 10)

    MANIFESTAR_SE:
    IMPORTANTE: Se houver "prazo" válido (int e não nulo), e o prazo for de manifestação então, a ação recomendada é obrigatoriamente 'MANIFESTAR_SE'. Se não houver prazo válido, a acao_recomendada jamais será 'MANIFESTAR_SE'
    - Identificaremos 'MANIFESTAR_SE' quando houver prazo para manifestação ou qualquer tipo de resposta necessária. Identificado por termos como:
        • "prazo para manifestar"
        • "prazo para contestar"
        • "prazo para recorrer"
        • "prazo para impugnar"
        • "prazo para responder"

    TOMAR_CIENCIA:
    IMPORTANTE: Se não houver 'prazo', 'data_comparecimento' e 'horario_comparecimento' válidos (formato correto e não nulos) então obrigatoriamente a acao_recomendada será 'TOMAR_CIENCIA'
    - Quando for apenas uma comunicação sem necessidade de manifestação ou comparecimento. Identificado por termos como:
        • "Autos distribuídos e conclusos"
        • "autos e conclusos"
        • "para ciência"
        • "dou ciência às partes"
        • "ficam as partes intimadas"
        • "publique-se"
        • "ciente"
        • Decisões/despachos sem determinação específica
        • Atos meramente informativos

    Observações importantes:
    - Se classificado como COMPARECER, o campo 'tipo_comparecimento' DEVE ser preenchido
    - Se classificado como MANIFESTAR_SE, o campo 'prazo' DEVE ser preenchido
    - Se classificado como TOMAR_CIENCIA, não é necessário preencher 'prazo' nem 'tipo_comparecimento'

10. Para identificar tipo_comparecimento:
    IMPORTANTE: Se mencionar audiência, perícia, ou pauta de julgamento, preencher o tipo_comparecimento apenas se data e hora explícitas forem fornecidas. Caso contrário, deixar como null

        - "AUDIENCIA":
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
        - "PERICIA":
            - "perícia designada"
            - "exame pericial"
            - "comparecer à perícia"
        - "PAUTA_DE_JULGAMENTO":
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
    - Se houver menção a "Plenário", "Tribunal", "sustentação oral" ou "julgamento virtual" junto com data/horario, considerar como "PAUTA_DE_JULGAMENTO"
    - NÃO considerar como comparecimento quando:
        - "aguarde-se a audiência já designada"
        - "mantida a audiência designada"
        - "mantidas as cominações"
        - "audiência anteriormente designada"
        - Referências a audiências já marcadas sem nova designação

    - Para extrair data/horario, procurar por padrões como:
        - "sessão de julgamento do dia DD/MM/YYYY, às HH:MM"
        - "pauta de julgamento de DD/MM/YYYY, às HH:MM"
        - "pauta virtual de DD/MM/YYYY"
        - "sessão será realizada ... em DD/MM/YYYY, às HH:MM"
        - "dia DD.MM.YYYY, às HHhMMmin"
        - "DD.MM.YYYY, às HHhMMmin"    
        - "DD/MM/YYYY, às HHhMMmin"
        - "DD.MM.YYYY às HHhMMmin"
        - "DD/MM/YYYY às HHhMMmin"

    Observações importantes sobre datas e horários:
    - Aceitar datas nos formatos:
        • DD/MM/YYYY
        • DD.MM.YYYY
    - Aceitar horários nos formatos:
        • HH:MM
        • HHhMMmin
        • HH:MM horas
        • HHhMM
    - Converter sempre para o formato padrão:
        • Data: YYYY-MM-DD
        • Hora: HH:MM


TEXTO-INTIMAÇÃO: [TEXTO_INTIMACAO]
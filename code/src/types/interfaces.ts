// Interface que representa a estrutura exata que vem da API
export interface APIIntimacao {
  id: string;
  data_disponibilizacao: string;
  siglaTribunal: string;
  tipoComunicacao: string;
  texto: string;
  nomeOrgao: string;
  numero_processo: string;
  numeroprocessocommascara: string;
  meio: string;
  meiocompleto: string;
  link: string;
  tipoDocumento: string;
  nomeClasse: string;
  codigoClasse: string;
  numeroComunicacao: number;
  ativo: boolean;
  hash: string;
  status: string;
  motivo_cancelamento: string | null;
  data_cancelamento: string | null;
  datadisponibilizacao: string;
  destinatarios: Array<{
    polo: string;
    nome: string;
    comunicacao_id: number;
  }>;
  destinatarioadvogados: Array<{
    id: number;
    comunicacao_id: number;
    advogado_id: number;
    created_at: string;
    updated_at: string;
    advogado: {
      id: number;
      nome: string;
      numero_oab: string;
      uf_oab: string;
    };
  }>;
}

// Interface para uso interno na aplicação
export interface Intimacao {
  id: string;
  idDgen: string;
  data_disponibilizacao: string;
  dataPublicacao: string;
  sigla_tribunal: string;
  tipo_comunicacao: string;
  texto: string;
  tipo_ato?: string;
  prazo: number;
  data_esperada_manifestacao: string;
  base_legal_prazo?: string;
  numeroComunicacao: number;
  hash: string;
  meio: string;
  meiocompleto: string;
  link?: string;
  tipoDocumento?: string;
  resumoIA?: string;
  tipoManifestacao?: string;
  dataInicioPrazo: string;
  dataLimite: string | null;
  
  // Flags de classificação
  isJuizado: boolean;
  isRecursoInominado: boolean;
  isContrarazoesInominado: boolean;
  regraAplicada: string;
  consequenciasPraticas?: string;
  acoesSugeridas?: string[];
  statusSistema?: string;
  
  // Campos de agendamento (conforme schema.prisma)
  tipoComparecimento?: 'AUDIENCIA' | 'PERICIA' | 'PAUTA_DE_JULGAMENTO' | null;
  dataComparecimento: Date | null;
  horarioComparecimento: string | null;

  // Relacionamento com processo (agora com os campos corretos)
  processo: {
    numeroProcesso: string;
    numeroFormatado?: string;
    vara: string;
    nomeOrgao: string;
    classeProcessual: string;
    autor: string;
    reu: string;
    instancia: 'PRIMEIRA' | 'SEGUNDA';
    categoria: 'CIVIL' | 'JUIZADO' | 'CRIMINAL' | 'TRABALHO';
  };
}

export interface IntimacaoResponse {
  status: string;
  count: number;
  items: APIIntimacao[];
}

// Interface da resposta do LLM
export interface LlmAnalysisResponse {
  tipo_ato: string;
  tipo_manifestacao: string;
  prazo: number | null;
  base_legal_prazo: string;
  resumo: string;
  reu: string;
  advogado_destinatario: string;
  consequencias_praticas: string;
  acoes_sugeridas: string[];
  status_sistema: string;
  is_juizado: boolean;
  is_recurso_inominado: boolean;
  is_contrarazoes_inominado: boolean;
  tipo_comparecimento: 'AUDIENCIA' | 'PERICIA' | 'PAUTA_DE_JULGAMENTO'| null;
  data_comparecimento: string;
  horario_comparecimento: string;
  instancia: 'PRIMEIRA' | 'SEGUNDA';
  categoria_processual: 'CIVIL' | 'JUIZADO' | 'CRIMINAL' | 'TRABALHO';
}

// Interface para o resultado da validação do JSON
export interface JsonValidationResult<T> {
  status: "valid" | "invalid";
  response: T | string;
}

// Interface para a resposta da API do ChatGPT
export interface ChatGPTResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface FeriadoTribunal {
  siglaTribunal: string;
  data: string;
}

interface CreateIntimacaoComProcessoDTO {
  id: string | number;
}

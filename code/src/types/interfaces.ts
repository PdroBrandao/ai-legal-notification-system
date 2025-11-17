/**
 * Type definitions for court notification system
 * 
 * This module defines all interfaces used throughout the application:
 * - API response structures from DJEN (Brazilian court notification system)
 * - Internal application data models
 * - LLM analysis response format
 * - Utility types for JSON validation
 */

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

/**
 * Raw API response structure from DJEN API
 * 
 * Represents the exact structure returned by PJe Comunicação API.
 * Field names are kept in Portuguese as they come directly from the government API.
 * 
 * @see https://comunicaapi.pje.jus.br/api/v1/comunicacao
 */
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

/**
 * API response wrapper for notifications list
 */
export interface IntimacaoResponse {
  status: string;
  count: number;
  items: APIIntimacao[];
}

// ============================================================================
// INTERNAL APPLICATION INTERFACES
// ============================================================================

/**
 * Internal notification model with enriched data
 * 
 * This interface represents a notification after processing:
 * - Original API data is preserved
 * - LLM-extracted fields are added (resumoIA, tipo_ato, etc.)
 * - Deadline calculations are applied
 * - Business rules are flagged (isJuizado, isRecursoInominado, etc.)
 * 
 * Used throughout the application after the initial API fetch.
 */
export interface Intimacao {
  // Core identification
  id: string;
  idDgen: string;
  hash: string;
  numeroComunicacao: number;
  
  // Publication metadata
  data_disponibilizacao: string;
  dataPublicacao: string;
  sigla_tribunal: string;
  tipo_comunicacao: string;
  meio: string;
  meiocompleto: string;
  link?: string;
  tipoDocumento?: string;
  
  // Legal document content
  texto: string;
  tipo_ato?: string;
  tipoManifestacao?: string;
  
  // Deadline information
  prazo: number;
  dataInicioPrazo: string;
  dataLimite: string | null;
  data_esperada_manifestacao: string;
  base_legal_prazo?: string;
  regraAplicada: string;
  
  // LLM-extracted insights
  resumoIA?: string;
  consequenciasPraticas?: string;
  acoesSugeridas?: string[];
  statusSistema?: string;
  
  // Classification flags (specific to Brazilian law)
  isJuizado: boolean;
  isRecursoInominado: boolean;
  isContrarazoesInominado: boolean;
  
  // Scheduled appearance information
  tipoComparecimento?: 'AUDIENCIA' | 'PERICIA' | 'PAUTA_DE_JULGAMENTO' | null;
  dataComparecimento: Date | null;
  horarioComparecimento: string | null;

  // Associated legal case information
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

// ============================================================================
// LLM ANALYSIS INTERFACES
// ============================================================================

/**
 * LLM analysis response structure
 * 
 * This interface defines the expected JSON structure returned by the LLM
 * after analyzing a court notification text. The LLM extracts:
 * - Document type and required response
 * - Deadline information (explicit or inferred)
 * - Legal classification flags
 * - Practical consequences and suggested actions
 * - Scheduled appearance details (if applicable)
 * 
 * Field names are in Portuguese to match the LLM prompt configuration.
 */
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

// ============================================================================
// UTILITY INTERFACES
// ============================================================================

/**
 * JSON validation result wrapper
 * 
 * Generic interface for validating and parsing JSON responses from the LLM.
 * 
 * @template T - Expected type of the parsed response
 * @property status - "valid" if JSON is parseable and matches expected structure, "invalid" otherwise
 * @property response - Parsed object of type T if valid, error message string if invalid
 */
export interface JsonValidationResult<T> {
  status: "valid" | "invalid";
  response: T | string;
}

/**
 * OpenAI ChatGPT API response structure
 * 
 * Represents the complete response from OpenAI's chat completion endpoint.
 * Used for parsing LLM responses and extracting usage metrics.
 * 
 * @see https://platform.openai.com/docs/api-reference/chat/create
 */
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

/**
 * Court-specific holiday definition
 * 
 * Used by the deadline calculator to exclude court holidays from business day calculations.
 * Each court (tribunal) can have its own set of holidays beyond national holidays.
 */
export interface FeriadoTribunal {
  siglaTribunal: string;
  data: string;
}

/**
 * Environment configuration module
 * 
 * Centralizes all environment variables and application constants.
 * Configuration is loaded from .env file at runtime.
 */

declare const process: {
  env: {
    MOCK_MODE?: string;
    API_KEY?: string;
    NODE_ENV?: string;
  };
};

/**
 * Application environment configuration
 * 
 * @property MOCK_MODE - Enable mock mode for offline demo (loads fixtures instead of calling DJEN API)
 * @property API_URL - Brazilian court notification system API endpoint (PJe Comunicação)
 * @property API_MODEL_URL - OpenAI GPT API endpoint for LLM text extraction
 * @property API_KEY - OpenAI API key for authentication
 * @property DEFAULT_DEADLINES - Default deadline values by court (demo values for portfolio)
 */
export const environment = {
  MOCK_MODE: process.env.MOCK_MODE === 'true',
  API_URL: "https://comunicaapi.pje.jus.br/api/v1/comunicacao",
  API_MODEL_URL: "https://api.openai.com/v1/chat/completions",
  API_KEY: process.env.API_KEY || "",
  DEFAULT_DEADLINES: {
    TJMG: 15,  // Minas Gerais State Court
    TRT3: 5,   // Labor Court - 3rd Region
    TRF6: 15,  // Federal Court - 6th Region
  } as const,
} as const;

/**
 * Supported Brazilian courts
 * 
 * TJMG - Tribunal de Justiça de Minas Gerais (State Court)
 * TRT3 - Tribunal Regional do Trabalho da 3ª Região (Labor Court)
 * TRF6 - Tribunal Regional Federal da 6ª Região (Federal Court)
 */
export type Tribunal = keyof typeof environment.DEFAULT_DEADLINES;

declare const process: {
  env: {
    API_KEY?: string;
    GOOGLE_CREDENTIALS?: string;
    NODE_ENV?: string;
    MEGA_API_URL?: string;
    MEGA_API_KEY?: string;
    MEGA_API_TOKEN?: string;
    ENABLE_WHATSAPP?: string;
  };
};

export const environment = {
  API_URL: "https://comunicaapi.pje.jus.br/api/v1/comunicacao",
  API_MODEL_URL: "https://api.openai.com/v1/chat/completions",
  API_KEY: process.env.API_KEY || "",
  GOOGLE_CREDENTIALS: process.env.GOOGLE_CREDENTIALS || "",
  SPREADSHEET_ID: "1CnLhImZkeugQRIVDv89fU1lE7l1HltRAx5U95ZglHew",
  DEFAULT_DEADLINES: {
    TJMG: 15,
    TRT3: 5,
    TRF6: 15,
  } as const,
  USE_STATIC_DATE: process.env.NODE_ENV !== 'production',
  STATIC_DATE: "2025-07-10",
  MEGA_API_URL: process.env.MEGA_API_URL || "",
  MEGA_API_KEY: process.env.MEGA_API_KEY || "",
  MEGA_API_TOKEN: process.env.MEGA_API_TOKEN || "",
  DISABLE_WHATSAPP: process.env.NODE_ENV !== 'production' && process.env.ENABLE_WHATSAPP !== 'true',
} as const;

// Tipo para os tribunais suportados
export type Tribunal = keyof typeof environment.DEFAULT_DEADLINES;

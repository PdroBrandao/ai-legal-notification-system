/**
 * EXAMPLE PROMPT - Simplified version for demonstration purposes
 * 
 * This is a generic prompt structure used to extract structured information
 * from Brazilian court notifications (intimações). The actual production prompt
 * contains proprietary business logic and legal rules.
 * 
 * For testing purposes, this simplified version extracts basic fields only.
 */

export const SYSTEM_MESSAGE = `You are a specialized assistant for analyzing Brazilian court notifications (intimações judiciais). 
Your task is to extract structured information from the provided text and return it in strict JSON format. 
Be objective and precise, extracting only information explicitly present in the text.`;

export const USER_MESSAGE = `Extract the following basic information from the court notification:

1. Type of legal act (DESPACHO, SENTENÇA, DECISÃO)
2. Deadline in days (if mentioned)
3. Brief summary (max 150 chars)
4. Defendant name (if mentioned)

Return ONLY this JSON structure:
{
  "tipo_ato": "DESPACHO|SENTENÇA|DECISÃO",
  "prazo": 15,
  "resumo": "Brief notification summary",
  "reu": "Defendant name or null"
}

TEXTO_INTIMACAO:
[TEXTO_INTIMACAO]`;

/**
 * Example notification text for testing (real case from public DJEN portal)
 */
export const TEXTO_INTIMACAO = `PODER JUDICIÁRIO
JUSTIÇA DO TRABALHO
TRIBUNAL REGIONAL DO TRABALHO DA 3ª REGIÃO
3ª VARA DO TRABALHO DE MONTES CLAROS

INTIMAÇÃO
Fica V. Sa. intimado para tomar ciência do Despacho proferido nos autos.

DESPACHO
Vistos, etc.

Intime-se a parte exequente para, querendo, impugnar os cálculos de liquidação apresentados pela parte executada, no prazo de oito dias, sob pena de preclusão, nos termos do §2o, do art. 879 da CLT.

Desde já, inclua-se o feito na pauta de audiências para tentativa de conciliação.

Designo audiência virtual para tentativa de conciliação no dia 16/06/2025 às 10:15 horas.

Intimem-se as partes.

MONTES CLAROS/MG, 02 de junho de 2025.
SERGIO SILVEIRA MOURAO
Juiz do Trabalho Substituto`;


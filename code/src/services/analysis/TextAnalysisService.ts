import { LlmAnalysisResponse, JsonValidationResult, ChatGPTResponse } from '../../types/interfaces';
import { handleJsonResponse } from '../../utils/jsonUtils';
import { environment } from '../../config/environment';
import { SYSTEM_MESSAGE, USER_MESSAGE } from '../../config/prompts/intimacao-prompt';

interface AnalysisMetadata {
  prompt: string;
  response: string;
  model: string;
  temperature: number;
  responseTimeMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  success: boolean;
  error?: string;
}

// OpenAI pricing for GPT-3.5-turbo (as of 2024)
const COST_PER_INPUT_TOKEN = 0.0005 / 1000;   // $0.0005 per 1K input tokens
const COST_PER_OUTPUT_TOKEN = 0.0015 / 1000;  // $0.0015 per 1K output tokens

/**
 * TextAnalysisService - LLM-powered text analysis for court notifications
 * 
 * Core responsibilities:
 * - Constructs prompts with court notification text
 * - Calls OpenAI API (GPT-3.5-turbo)
 * - Validates and parses JSON responses
 * - Tracks costs and performance metrics
 * 
 * In production: Analysis metadata is persisted to database for monitoring
 * In demo: Metadata is returned but not persisted
 */
export class TextAnalysisService {
  constructor(
    private readonly apiUrl: string = environment.API_MODEL_URL,
    private readonly apiKey: string = environment.API_KEY
  ) {}

  /**
   * Analyze court notification text using LLM
   * 
   * Sends notification text to GPT-3.5-turbo with structured prompt,
   * extracts JSON response, and calculates token usage/costs.
   * 
   * @param texto - Raw notification text from DJEN
   * @returns Structured analysis result and metadata (cost, tokens, latency)
   */
  async analisarTexto(texto: string): Promise<{
    analise: JsonValidationResult<LlmAnalysisResponse>;
    dadosIA: AnalysisMetadata;
  }> {
    const startTime = Date.now();
    
    try {
      const prompt = this.buildPrompt(texto);
      
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: SYSTEM_MESSAGE
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0
        })
      });

      const data = await response.json() as ChatGPTResponse;
      const responseTimeMs = Date.now() - startTime;

      // Calculate cost based on token usage
      const inputCost = data.usage.prompt_tokens * COST_PER_INPUT_TOKEN;
      const outputCost = data.usage.completion_tokens * COST_PER_OUTPUT_TOKEN;
      const totalCost = inputCost + outputCost;

      const metadata: AnalysisMetadata = {
        prompt,
        response: data.choices[0]?.message?.content || '',
        model: "gpt-3.5-turbo",
        temperature: 0,
        responseTimeMs,
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
        estimatedCost: totalCost,
        success: true
      };

      return {
        analise: handleJsonResponse<LlmAnalysisResponse>(data.choices[0].message.content),
        dadosIA: metadata
      };
      
    } catch (error) {
      const metadata: AnalysisMetadata = {
        prompt: this.buildPrompt(texto),
        response: '',
        model: "gpt-3.5-turbo",
        temperature: 0,
        responseTimeMs: Date.now() - startTime,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCost: 0,
        success: false,
        error: String(error)
      };

      return {
        analise: { status: 'invalid', response: String(error) },
        dadosIA: metadata
      };
    }
  }

  /**
   * Construct full prompt by injecting notification text into template
   */
  private buildPrompt(texto: string): string {
    return USER_MESSAGE.replace('[TEXTO_INTIMACAO]', texto);
  }
}

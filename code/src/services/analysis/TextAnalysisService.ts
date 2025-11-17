import { LlmAnalysisResponse, JsonValidationResult, ChatGPTResponse } from '../../types/interfaces';
import { handleJsonResponse } from '../../utils/jsonUtils';
import { environment } from '../../config/environment';
import { PrismaClient } from '@prisma/client';
import { SYSTEM_MESSAGE, USER_MESSAGE } from '../../config/prompts/intimacao-prompt';

interface AnaliseIATemp {
  prompt: string;
  resposta: string;
  modeloIA: string;
  temperatura: number;
  tempoRespostaMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  custoEstimado: number;
  sucesso: boolean;
  erro?: string;
}

const CUSTO_POR_TOKEN_INPUT = 0.0005 / 1000;  // $0.0005 por 1000 tokens de entrada
const CUSTO_POR_TOKEN_OUTPUT = 0.0015 / 1000;  // $0.0015 por 1000 tokens de saída

export class TextAnalysisService {
  private prisma: PrismaClient;

  constructor(
    private readonly apiUrl: string = environment.API_MODEL_URL,
    private readonly apiKey: string = environment.API_KEY
  ) {
    this.prisma = new PrismaClient();
  }

  async analisarTexto(texto: string): Promise<{
    analise: JsonValidationResult<LlmAnalysisResponse>;
    dadosIA: AnaliseIATemp;
  }> {
    const startTime = Date.now();
    try {
      const prompt = this.construirPrompt(texto);
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
      const tempoRespostaMs = Date.now() - startTime;

      // Calcula o custo baseado nos tokens
      const custoInput = data.usage.prompt_tokens * CUSTO_POR_TOKEN_INPUT;
      const custoOutput = data.usage.completion_tokens * CUSTO_POR_TOKEN_OUTPUT;
      const custoTotal = custoInput + custoOutput;

      const dadosIA: AnaliseIATemp = {
        prompt,
        resposta: data.choices[0]?.message?.content || '',
        modeloIA: "gpt-3.5-turbo",
        temperatura: 0,
        tempoRespostaMs,
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
        custoEstimado: custoTotal,
        sucesso: true
      };

      return {
        analise: handleJsonResponse<LlmAnalysisResponse>(data.choices[0].message.content),
        dadosIA
      };
    } catch (error) {
      const dadosIA: AnaliseIATemp = {
        prompt: this.construirPrompt(texto),
        resposta: '',
        modeloIA: "gpt-3.5-turbo",
        temperatura: 0,
        tempoRespostaMs: Date.now() - startTime,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        custoEstimado: 0,
        sucesso: false,
        erro: String(error)
      };

      return {
        analise: { status: 'invalid', response: String(error) },
        dadosIA
      };
    }
  }

  // Método para persistir a análise depois que a intimação for criada
  async persistirAnalise(intimacaoId: string, dadosIA: AnaliseIATemp): Promise<void> {
    await this.prisma.analiseIALog.create({
      data: {
        intimacaoId,
        ...dadosIA
      }
    });
  }

  async analyzeMessage(prompt: string): Promise<{ status: 'valid' | 'invalid'; response?: string; error?: string }> {
    const startTime = Date.now();
    try {
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
              role: "user",
              content: prompt
            }
          ],
          temperature: 0
        })
      });

      const data = await response.json() as ChatGPTResponse;
      
      return {
        status: 'valid',
        response: data.choices[0]?.message?.content || ''
      };
    } catch (error) {
      return {
        status: 'invalid',
        error: String(error)
      };
    }
  }

  private construirPrompt(texto: string): string {
    return USER_MESSAGE.replace('[TEXTO_INTIMACAO]', texto);
  }
}
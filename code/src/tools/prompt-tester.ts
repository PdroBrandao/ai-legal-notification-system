import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Carrega o .env da raiz do projeto
dotenv.config({ path: resolve(__dirname, '../../.env') });

import { SYSTEM_MESSAGE, USER_MESSAGE, TEXTO_INTIMACAO } from '../config/prompts/intimacao-prompt';
import { environment } from '../config/environment';

async function testarPrompt(textoIntimacao: string = TEXTO_INTIMACAO) {
  const response = await fetch(environment.API_MODEL_URL, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.API_KEY}`
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
          content: USER_MESSAGE.replace('[TEXTO_INTIMACAO]', textoIntimacao)
        }
      ],
      temperature: 0
    })
  });

  const data = await response.json();

  if (!data.choices || !data.choices[0]) {
    console.error('Erro na resposta da API:', data);
    throw new Error('Resposta inválida da API');
  }
  console.log('\nUsage:');
  console.log('Total tokens:', data.usage.prompt_tokens);
  console.log('Completion tokens:', data.usage.completion_tokens);
  console.log('Total cost:', data.usage.total_tokens);

  console.log('\nResposta do GPT:\n');
  console.log(data.choices[0].message.content);

}

// Interface CLI
async function main() {
  // Verifica se conseguiu carregar a API_KEY
  if (!environment.API_KEY) {
    console.error('API_KEY não encontrada no arquivo .env');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usando texto padrão de teste');
    await testarPrompt();
    return;
  }

  console.log('Usando texto fornecido:', args[0]);
  await testarPrompt(args[0]);
}

main().catch(error => {
  console.error('\nErro:', error);
  process.exit(1);
}); 
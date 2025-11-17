import 'dotenv/config';
import { IntimacaoService } from './services/orchestrators/IntimationOrchestratorService';
import { GoogleSheetsService } from './services/integration/google/SheetsService';

async function main() {
    try {
        console.log('[INFO] Iniciando processamento...');
        const intimacaoService = new IntimacaoService();
        const googleSheetsService = await GoogleSheetsService.getInstance();

        const intimacoes = await intimacaoService.processarTodasIntimacoes();
        await googleSheetsService.saveIntimacoes(intimacoes);
        
        console.log('Processo finalizado com sucesso!');
    } catch (error) {
        console.error('Erro durante a execução:', error);
        process.exit(1);
    }
}

// Executa main() quando rodando localmente
if (process.env.NODE_ENV !== 'production') {
    main();
}

// Handler para AWS Lambda
export const handler = async (event: any, context: any) => {
    try {
        console.log('[INFO] Lambda iniciada - Timestamp:', new Date().toISOString());
        await main();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Execução concluída com sucesso' })
        };
    } catch (error) {
        console.error('[ERROR] Falha na execução:', error);
        throw error;
    }
};

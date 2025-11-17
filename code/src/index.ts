/**
 * Main Entry Point - Court Notification Automation System
 * 
 * DEMO MODE (MOCK_MODE=true):
 * Processes sample court notifications from fixtures, demonstrates
 * LLM-powered extraction, deadline calculation with business days,
 * and saves structured results to output/processed_notifications.json
 * 
 * PRODUCTION MODE (MOCK_MODE=false):
 * Fetches real data from DJEN API, processes with the same pipeline,
 * and persists to PostgreSQL. Runs on AWS Lambda every 20 minutes.
 */

import 'dotenv/config';
import { IntimacaoService } from './services/orchestrators/IntimationOrchestratorService';
import { Logger } from './utils/logger';

async function main() {
    try {
        const intimacaoService = new IntimacaoService();
        const result = await intimacaoService.processAllNotifications();
        
        Logger.complete(result.metrics.totalNotifications, result.metrics.validationRate);
    } catch (error) {
        Logger.blank();
        Logger.error('Execution failed', error);
        Logger.blank();
        process.exit(1);
    }
}

main();
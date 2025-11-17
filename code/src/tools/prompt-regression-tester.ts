import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';
import * as path from 'path';

// Carrega o .env da raiz do projeto
dotenv.config({ path: resolve(__dirname, '../../.env') });

import { SYSTEM_MESSAGE, USER_MESSAGE } from '../config/prompts/intimacao-prompt';
import { environment } from '../config/environment';

// Função para carregar prompts dinamicamente dos arquivos markdown
function loadPromptFromFile(version: string): { system: string; user: string } {
  try {
    const promptPath = path.join(__dirname, `../../Prompts/Prompt-${version}.md`);
    console.log(`📖 Carregando prompt ${version} de: ${promptPath}`);
    const content = fs.readFileSync(promptPath, 'utf-8');
    
    // Adicionar instrução de confidence score no final do prompt
    const contentWithConfidence = content + `

IMPORTANTE: No final da sua resposta JSON, adicione um campo "confidence_score" com um valor de 1 a 10, onde:
- 10 = Muito confiante, informação clara e explícita no texto
- 7-9 = Confiante, mas com alguma ambiguidade
- 4-6 = Moderadamente confiante, texto ambíguo
- 1-3 = Pouco confiante, informação implícita ou vaga

Exemplo de resposta final:
{
  "tipo_ato": "DESPACHO",
  "prazo": 8,
  // ... outros campos
  "confidence_score": 8
}`;
    
    return {
      system: SYSTEM_MESSAGE,
      user: contentWithConfidence
    };
  } catch (error) {
    console.warn(`⚠️  Não foi possível carregar prompt ${version}: ${error}`);
    return {
      system: SYSTEM_MESSAGE,
      user: USER_MESSAGE
    };
  }
}

// Sistema de carregamento de versões de prompts
const PROMPT_VERSIONS = {
  'v1.0': loadPromptFromFile('v1.0'),
  'v1.1': loadPromptFromFile('v1.1'),
  'v1.2': loadPromptFromFile('v1.2'),
  'v1.3': loadPromptFromFile('v1.3'),
  'v1.4': loadPromptFromFile('v1.4'),
  'v1.5': loadPromptFromFile('v1.5')
} as const;

type PromptVersion = keyof typeof PROMPT_VERSIONS;

// Interfaces para diferentes tipos de testes
interface BaseTestCase {
  descricao: string;
  texto_intimacao: string;
  resultado_esperado: Record<string, any>;
}

interface ComparecimentoTestCase extends BaseTestCase {
  resultado_esperado: {
    tipo_comparecimento: string;
    data_comparecimento: string;
    horario_comparecimento: string;
  };
}

interface InstanciaTestCase extends BaseTestCase {
  resultado_esperado: {
    instancia: string;
  };
}

interface ClasseProcessualTestCase extends BaseTestCase {
  resultado_esperado: {
    categoria_processual: string;
  };
}

interface TestResult {
  descricao: string;
  passou: boolean;
  esperado: any;
  recebido: any;
  erro?: string;
  tipo_teste: string;
  categoria_teste: string;
  confidence_score?: number;
  metrics?: { latency_ms: number; total_tokens: number; prompt_tokens: number; completion_tokens: number; cost_usd: number };
}

interface TestMetrics {
  test_name: string;
  prompt_version: string;
  accuracy: number; // 1 = passou, 0 = falhou
  latency_ms: number;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  cost_usd: number;
  confidence_score?: number;
}

// Nova interface para relatório comparativo
interface VersionComparison {
  version: string;
  total_tests: number;
  passed_tests: number;
  accuracy_percentage: number;
  avg_latency_ms: number;
  avg_tokens: number;
  avg_cost_usd: number;
  avg_confidence: number;
  categories: Record<string, { total: number; passed: number; accuracy: number }>;
}

interface EvolutionMetrics {
  from_version: string;
  to_version: string;
  accuracy_improvement: number;
  latency_change: number;
  cost_change: number;
  confidence_change: number;
  new_failures: string[];
  new_successes: string[];
}

// Mapeamento de diretórios para categorias de teste
const CATEGORIAS_TESTE = {
  'recommended_actions': 'Testes de Ação Recomendada',
  'procedural_category': 'Testes de Classe Processual',
  'instance': 'Testes de Instância',
  'deadlines': 'Testes de Prazos',
} as const;

// Configuração de filtros para desenvolvimento
// Verificar argumentos de linha de comando
const args = process.argv.slice(2);
const allCategories = args.includes('--all-categories');

const CATEGORIAS_ATIVAS = {
  'deadlines': true,        // ✅ Sempre ativo
  'recommended_actions': allCategories,  // ✅ Ativo se --all-categories
  'procedural_category': allCategories,  // ✅ Ativo se --all-categories  
  'instance': allCategories,        // ✅ Ativo se --all-categories
} as const;

type CategoriaTeste = keyof typeof CATEGORIAS_TESTE;

// Validadores específicos para cada tipo de teste
const validators = {
  recommended_actions: (resultado: any, esperado: any): boolean => {
    return resultado.tipo_comparecimento === esperado.tipo_comparecimento &&
           resultado.data_comparecimento === esperado.data_comparecimento &&
           resultado.horario_comparecimento === esperado.horario_comparecimento &&
           resultado.prazo === esperado.prazo;
  },

  instance: (resultado: any, esperado: any): boolean => {
    if (!resultado.instancia) return false;
    return resultado.instancia === esperado.instancia;
  },

  procedural_category: (resultado: any, esperado: any): boolean => {
    if (!resultado.categoria_processual) return false;
    return resultado.categoria_processual === esperado.categoria_processual;
  },

  deadlines: (resultado: any, esperado: any): boolean => {
    // Se esperamos null, o resultado também deve ser null
    if (esperado.prazo === null) {
      return resultado.prazo === null;
    }
    // Se não esperamos null, então validamos o valor
    if (!resultado.prazo) return false;
    return resultado.prazo === esperado.prazo;
  },


};

async function analisarIntimacao(texto: string, promptVersion: PromptVersion = 'v1.5'): Promise<{ resultado: any; metrics: { latency_ms: number; total_tokens: number; prompt_tokens: number; completion_tokens: number; cost_usd: number } }> {
  const startTime = Date.now();
  
  const prompt = PROMPT_VERSIONS[promptVersion];
  
  const response = await fetch(environment.API_MODEL_URL, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user.replace('[TEXTO_INTIMACAO]', texto) }
      ],
      temperature: 0
    })
  });

  const data = await response.json();
  if (!data.choices?.[0]) throw new Error('Resposta inválida da API');

  const endTime = Date.now();
  const latency_ms = endTime - startTime;

  // Calcular custo baseado no modelo GPT-3.5-turbo
  const costPer1kTokens = 0.0005; // $0.0005 per 1K tokens para GPT-3.5-turbo
  const total_tokens = data.usage?.total_tokens || 0;
  const prompt_tokens = data.usage?.prompt_tokens || 0;
  const completion_tokens = data.usage?.completion_tokens || 0;
  const cost_usd = (total_tokens / 1000) * costPer1kTokens;

  try {
    const resultado = JSON.parse(data.choices[0].message.content);
    return {
      resultado,
      metrics: {
        latency_ms,
        total_tokens,
        prompt_tokens,
        completion_tokens,
        cost_usd
      }
    };
  } catch (error) {
    console.error('Erro ao parsear resposta:', data.choices[0].message.content);
    throw new Error('Resposta não é um JSON válido');
  }
}

function validarFormatoTestCase(testCase: any): boolean {
  return !!(testCase.descricao && testCase.texto_intimacao && testCase.resultado_esperado);
}

function displayMetricsTable(results: (TestResult & { metrics?: { latency_ms: number; total_tokens: number; prompt_tokens: number; completion_tokens: number; cost_usd: number } })[], promptVersion?: string) {
  console.log('\n=== PERFORMANCE METRICS ===\n');
  
  // Filtrar apenas resultados com métricas
  const resultsWithMetrics = results.filter(r => r.metrics);
  
  if (resultsWithMetrics.length === 0) {
    console.log('No metrics available.');
    return;
  }

  // Calcular totais
  const totalTests = resultsWithMetrics.length;
  const totalLatency = resultsWithMetrics.reduce((sum, r) => sum + (r.metrics?.latency_ms || 0), 0);
  const totalTokens = resultsWithMetrics.reduce((sum, r) => sum + (r.metrics?.total_tokens || 0), 0);
  const totalCost = resultsWithMetrics.reduce((sum, r) => sum + (r.metrics?.cost_usd || 0), 0);
  const passedTests = resultsWithMetrics.filter(r => r.passou).length;
  
  // Calcular confidence score médio
  const resultsWithConfidence = resultsWithMetrics.filter(r => r.confidence_score !== null && r.confidence_score !== undefined);
  const avgConfidence = resultsWithConfidence.length > 0 
    ? resultsWithConfidence.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / resultsWithConfidence.length
    : 0;
  
  // Calcular médias
  const avgLatency = totalLatency / totalTests;
  const avgTokens = totalTokens / totalTests;
  const avgCost = totalCost / totalTests;
  const accuracy = (passedTests / totalTests) * 100;

  console.log('┌─────────────────────────────────────────────────────────────────────────────────────────────┐');
  console.log(`│                                    PERFORMANCE METRICS ${promptVersion ? `- ${promptVersion}` : ''}                           │`);
  console.log('├─────────────────────────────────────────────────────────────────────────────────────────────┤');
  console.log(`│ Tests Executed: ${totalTests.toString().padStart(3)} │ Passed: ${passedTests.toString().padStart(3)} │ Accuracy: ${accuracy.toFixed(1).padStart(5)}% │`);
  console.log('├─────────────────────────────────────────────────────────────────────────────────────────────┤');
  console.log(`│ Avg Latency: ${avgLatency.toFixed(0).padStart(4)}ms │ Avg Tokens: ${avgTokens.toFixed(0).padStart(4)} │ Total Cost: $${totalCost.toFixed(4).padStart(8)} │`);
  console.log(`│ Avg Cost: $${avgCost.toFixed(6).padStart(8)} │ Avg Confidence: ${avgConfidence.toFixed(1).padStart(4)}/10 │                          │`);
  console.log('└─────────────────────────────────────────────────────────────────────────────────────────────┘');
  
  // Métricas por categoria
  const metricsByCategory: Record<string, { total: number; passed: number; avgLatency: number; avgCost: number; avgConfidence: number }> = {};
  
  resultsWithMetrics.forEach(result => {
    const category = result.categoria_teste;
    if (!metricsByCategory[category]) {
      metricsByCategory[category] = { total: 0, passed: 0, avgLatency: 0, avgCost: 0, avgConfidence: 0 };
    }
    metricsByCategory[category].total++;
    if (result.passou) metricsByCategory[category].passed++;
    metricsByCategory[category].avgLatency += result.metrics?.latency_ms || 0;
    metricsByCategory[category].avgCost += result.metrics?.cost_usd || 0;
    metricsByCategory[category].avgConfidence += result.confidence_score || 0;
  });

  console.log('\n=== METRICS BY CATEGORY ===');
  console.log('┌─────────────────────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ Category                    │ Tests │ Passed │ Accuracy │ Avg Latency │ Confidence │');
  console.log('├─────────────────────────────────────────────────────────────────────────────────────────────┤');
  
  Object.entries(metricsByCategory).forEach(([category, metrics]) => {
    const accuracy = (metrics.passed / metrics.total) * 100;
    const avgLatency = metrics.avgLatency / metrics.total;
    const avgConfidence = metrics.avgConfidence / metrics.total;
    
    console.log(`│ ${category.padEnd(28)} │ ${metrics.total.toString().padStart(6)} │ ${metrics.passed.toString().padStart(8)} │ ${accuracy.toFixed(1).padStart(7)}% │ ${avgLatency.toFixed(0).padStart(13)}ms │ ${avgConfidence.toFixed(1).padStart(8)}/10 │`);
  });
  
  console.log('└─────────────────────────────────────────────────────────────────────────────────────────────┘');
}

// Função para gerar relatório comparativo entre versões
function generateVersionComparison(allResults: Record<string, TestResult[]>): VersionComparison[] {
  const comparisons: VersionComparison[] = [];

  Object.entries(allResults).forEach(([version, results]) => {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passou).length;
    const accuracyPercentage = (passedTests / totalTests) * 100;

    const avgLatency = results.reduce((sum, r) => sum + (r.metrics?.latency_ms || 0), 0) / totalTests;
    const avgTokens = results.reduce((sum, r) => sum + (r.metrics?.total_tokens || 0), 0) / totalTests;
    const avgCost = results.reduce((sum, r) => sum + (r.metrics?.cost_usd || 0), 0) / totalTests;
    
    const resultsWithConfidence = results.filter(r => r.confidence_score !== null && r.confidence_score !== undefined);
    const avgConfidence = resultsWithConfidence.length > 0 
      ? resultsWithConfidence.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / resultsWithConfidence.length
      : 0;

    // Agrupar por categoria
    const categories: Record<string, { total: number; passed: number; accuracy: number }> = {};
    results.forEach(result => {
      const category = result.categoria_teste;
      if (!categories[category]) {
        categories[category] = { total: 0, passed: 0, accuracy: 0 };
      }
      categories[category].total++;
      if (result.passou) categories[category].passed++;
    });

    // Calcular accuracy por categoria
    Object.values(categories).forEach(cat => {
      cat.accuracy = (cat.passed / cat.total) * 100;
    });

    comparisons.push({
      version,
      total_tests: totalTests,
      passed_tests: passedTests,
      accuracy_percentage: accuracyPercentage,
      avg_latency_ms: avgLatency,
      avg_tokens: avgTokens,
      avg_cost_usd: avgCost,
      avg_confidence: avgConfidence,
      categories
    });
  });

  return comparisons.sort((a, b) => a.version.localeCompare(b.version));
}

// Função para calcular métricas de evolução
function calculateEvolutionMetrics(allResults: Record<string, TestResult[]>): EvolutionMetrics[] {
  const versions = Object.keys(allResults).sort();
  const evolutions: EvolutionMetrics[] = [];

  for (let i = 0; i < versions.length - 1; i++) {
    const fromVersion = versions[i];
    const toVersion = versions[i + 1];
    const fromResults = allResults[fromVersion];
    const toResults = allResults[toVersion];

    // Criar mapas para comparação
    const fromMap = new Map(fromResults.map(r => [r.descricao, r]));
    const toMap = new Map(toResults.map(r => [r.descricao, r]));

    const fromAccuracy = (fromResults.filter(r => r.passou).length / fromResults.length) * 100;
    const toAccuracy = (toResults.filter(r => r.passou).length / toResults.length) * 100;
    const accuracyImprovement = toAccuracy - fromAccuracy;

    const fromAvgLatency = fromResults.reduce((sum, r) => sum + (r.metrics?.latency_ms || 0), 0) / fromResults.length;
    const toAvgLatency = toResults.reduce((sum, r) => sum + (r.metrics?.latency_ms || 0), 0) / toResults.length;
    const latencyChange = toAvgLatency - fromAvgLatency;

    const fromAvgCost = fromResults.reduce((sum, r) => sum + (r.metrics?.cost_usd || 0), 0) / fromResults.length;
    const toAvgCost = toResults.reduce((sum, r) => sum + (r.metrics?.cost_usd || 0), 0) / toResults.length;
    const costChange = toAvgCost - fromAvgCost;

    const fromAvgConfidence = fromResults.filter(r => r.confidence_score !== null && r.confidence_score !== undefined)
      .reduce((sum, r) => sum + (r.confidence_score || 0), 0) / fromResults.filter(r => r.confidence_score !== null && r.confidence_score !== undefined).length || 0;
    const toAvgConfidence = toResults.filter(r => r.confidence_score !== null && r.confidence_score !== undefined)
      .reduce((sum, r) => sum + (r.confidence_score || 0), 0) / toResults.filter(r => r.confidence_score !== null && r.confidence_score !== undefined).length || 0;
    const confidenceChange = toAvgConfidence - fromAvgConfidence;

    // Identificar novos sucessos e falhas
    const newFailures: string[] = [];
    const newSuccesses: string[] = [];

    fromResults.forEach(result => {
      const toResult = toMap.get(result.descricao);
      if (toResult && result.passou && !toResult.passou) {
        newFailures.push(result.descricao);
      }
      if (toResult && !result.passou && toResult.passou) {
        newSuccesses.push(result.descricao);
      }
    });

    evolutions.push({
      from_version: fromVersion,
      to_version: toVersion,
      accuracy_improvement: accuracyImprovement,
      latency_change: latencyChange,
      cost_change: costChange,
      confidence_change: confidenceChange,
      new_failures: newFailures,
      new_successes: newSuccesses
    });
  }

  return evolutions;
}

// Função para exibir relatório comparativo
function displayComparisonReport(comparisons: VersionComparison[], evolutions: EvolutionMetrics[]) {
  console.log('\n=== VERSION COMPARISON REPORT ===\n');

  // Tabela de comparação geral
  console.log('┌─────────────────────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ VERSION │ TESTS │ PASSED │ ACCURACY │ LATENCY │   COST   │ CONFIDENCE │');
  console.log('├─────────────────────────────────────────────────────────────────────────────────────────────┤');
  
  comparisons.forEach(comp => {
    console.log(`│ ${comp.version.padEnd(6)} │ ${comp.total_tests.toString().padStart(6)} │ ${comp.passed_tests.toString().padStart(6)} │ ${comp.accuracy_percentage.toFixed(1).padStart(7)}% │ ${comp.avg_latency_ms.toFixed(0).padStart(8)}ms │ $${comp.avg_cost_usd.toFixed(4).padStart(8)} │ ${comp.avg_confidence.toFixed(1).padStart(8)}/10 │`);
  });
  
  console.log('└─────────────────────────────────────────────────────────────────────────────────────────────┘');

  // Métricas de evolução
  if (evolutions.length > 0) {
    console.log('\n=== EVOLUTION BETWEEN VERSIONS ===\n');
    evolutions.forEach(evo => {
      console.log(`📈 ${evo.from_version} → ${evo.to_version}:`);
      console.log(`   Accuracy: ${evo.accuracy_improvement > 0 ? '+' : ''}${evo.accuracy_improvement.toFixed(1)}%`);
      console.log(`   Latency: ${evo.latency_change > 0 ? '+' : ''}${evo.latency_change.toFixed(0)}ms`);
      console.log(`   Cost: ${evo.cost_change > 0 ? '+' : ''}${evo.cost_change.toFixed(4)} USD`);
      console.log(`   Confidence: ${evo.confidence_change > 0 ? '+' : ''}${evo.confidence_change.toFixed(1)}/10`);
      
      if (evo.new_successes.length > 0) {
        console.log(`   ✅ New successes: ${evo.new_successes.length}`);
      }
      if (evo.new_failures.length > 0) {
        console.log(`   ❌ New failures: ${evo.new_failures.length}`);
      }
      console.log('');
    });
  }
}

// Função para exportar dados em CSV
function exportToCSV(allResults: Record<string, TestResult[]>, comparisons: VersionComparison[]): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // CSV de resultados detalhados
  let detailedCSV = 'version,test_name,category,passed,latency_ms,total_tokens,cost_usd,confidence_score\n';
  
  Object.entries(allResults).forEach(([version, results]) => {
    results.forEach(result => {
      detailedCSV += `${version},${result.descricao.replace(/,/g, ';')},${result.categoria_teste.replace(/,/g, ';')},${result.passou ? 1 : 0},${result.metrics?.latency_ms || 0},${result.metrics?.total_tokens || 0},${result.metrics?.cost_usd || 0},${result.confidence_score || ''}\n`;
    });
  });
  
  // CSV de comparação entre versões
  let comparisonCSV = 'version,total_tests,passed_tests,accuracy_percentage,avg_latency_ms,avg_tokens,avg_cost_usd,avg_confidence\n';
  
  comparisons.forEach(comp => {
    comparisonCSV += `${comp.version},${comp.total_tests},${comp.passed_tests},${comp.accuracy_percentage},${comp.avg_latency_ms},${comp.avg_tokens},${comp.avg_cost_usd},${comp.avg_confidence}\n`;
  });
  
  // Salvar arquivos
  const fs = require('fs');
  const path = require('path');
  
  const outputDir = path.join(__dirname, '../../logs/evals');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(outputDir, `detailed_results_${timestamp}.csv`), detailedCSV);
  fs.writeFileSync(path.join(outputDir, `version_comparison_${timestamp}.csv`), comparisonCSV);
  
  console.log(`\n📊 CSV files exported to: ${outputDir}`);
  console.log(`   - detailed_results_${timestamp}.csv`);
  console.log(`   - version_comparison_${timestamp}.csv`);
}

async function testarCaso(testCase: BaseTestCase, categoriaTeste: CategoriaTeste, promptVersion: PromptVersion = 'v1.5'): Promise<TestResult & { metrics?: { latency_ms: number; total_tokens: number; prompt_tokens: number; completion_tokens: number; cost_usd: number } }> {
  try {
    if (!validarFormatoTestCase(testCase)) {
      throw new Error('Formato do arquivo de teste inválido');
    }

    const { resultado, metrics } = await analisarIntimacao(testCase.texto_intimacao, promptVersion);
    const validator = validators[categoriaTeste];
    
    if (!validator) {
      throw new Error(`Validador não encontrado para categoria: ${categoriaTeste}`);
    }

    const passou = validator(resultado, testCase.resultado_esperado);
    
    // Extrair confidence score da resposta
    const confidence_score = resultado.confidence_score || null;

    return {
      descricao: testCase.descricao,
      passou,
      esperado: testCase.resultado_esperado,
      recebido: resultado,
      tipo_teste: Object.keys(testCase.resultado_esperado)[0],
      categoria_teste: CATEGORIAS_TESTE[categoriaTeste],
      metrics,
      confidence_score
    };
  } catch (error: unknown) {
    return {
      descricao: testCase.descricao,
      passou: false,
      esperado: testCase.resultado_esperado,
      recebido: null,
      erro: error instanceof Error ? error.message : 'Erro desconhecido',
      tipo_teste: Object.keys(testCase.resultado_esperado)[0],
      categoria_teste: CATEGORIAS_TESTE[categoriaTeste]
    };
  }
}

async function executarTestesCategoria(categoria: CategoriaTeste, diretorio: string, promptVersion: PromptVersion = 'v1.5'): Promise<TestResult[]> {
  const resultados: TestResult[] = [];
  const arquivos = fs.readdirSync(diretorio).filter(f => f.endsWith('.json'));

  for (const arquivo of arquivos) {
    try {
      const conteudoRaw = fs.readFileSync(path.join(diretorio, arquivo), 'utf-8');
      
      if (!conteudoRaw.trim()) {
        console.error(`Arquivo vazio: ${arquivo}`);
        continue;
      }
      
      let conteudo;
      try {
        conteudo = JSON.parse(conteudoRaw);
      } catch (parseError) {
        console.error(`Erro ao fazer parse do JSON no arquivo ${arquivo}:`, parseError);
        console.error('Conteúdo que causou erro:', conteudoRaw);
        continue;
      }
    
      // Verifica se é um arquivo com múltiplos casos
      const casos = conteudo.casos || [conteudo];
      
      for (const testCase of casos) {
        if (!validarFormatoTestCase(testCase)) {
          console.warn(`Formato inválido no caso "${testCase.descricao}" do arquivo ${arquivo}`);
          continue;
        }
        
        // Removido log individual para economizar espaço
        const resultado = await testarCaso(testCase, categoria, promptVersion);
        resultados.push(resultado);
      }
    } catch (error) {
      console.error(`Erro ao processar arquivo ${arquivo}:`, error);
    }
  }

  return resultados;
}

async function executarTestes() {
  console.log('🚀 Starting regression tests...\n');
  
  if (allCategories) {
    console.log('📊 FULL MODE: All categories enabled');
    console.log('   - Deadline Tests');
    console.log('   - Recommended Action Tests');
    console.log('   - Procedural Category Tests');
    console.log('   - Instance Tests\n');
  } else {
    console.log('🎯 QUICK MODE: Only deadline tests enabled\n');
  }

  const testDir = path.join(__dirname, '../../Prompts/tests/cases');
  if (!fs.existsSync(testDir)) {
    console.error(`Diretório de testes não encontrado: ${testDir}`);
    process.exit(1);
  }

  // Defina aqui as versões de prompt que deseja rodar
  const promptVersions: PromptVersion[] = ['v1.0', 'v1.1', 'v1.2', 'v1.3', 'v1.4', 'v1.5'];

  const allResults: Record<string, TestResult[]> = {};

  for (const promptVersion of promptVersions) {
    const resultadosPorCategoria: Record<string, { total: number, passou: number }> = {};
    let todosResultados: TestResult[] = [];

    console.log(`\n=== Running Regression Tests (Prompt ${promptVersion}) ===\n`);

    // Executa testes para cada categoria (apenas as ativas)
    for (const categoria of Object.keys(CATEGORIAS_TESTE) as CategoriaTeste[]) {
      // Verifica se a categoria está ativa
      if (!CATEGORIAS_ATIVAS[categoria]) {
        continue;
      }

      const categoriaDir = path.join(testDir, categoria);
      if (!fs.existsSync(categoriaDir)) {
        console.warn(`Directory not found for category: ${categoria}`);
        continue;
      }

      const resultados = await executarTestesCategoria(categoria, categoriaDir, promptVersion);
      todosResultados = todosResultados.concat(resultados);

      resultadosPorCategoria[categoria] = {
        total: resultados.length,
        passou: resultados.filter(r => r.passou).length
      };
    }

    // Exibir resultados detalhados (apenas falhas para economizar espaço)
    const failedTests = todosResultados.filter(r => !r.passou);
    if (failedTests.length > 0) {
      console.log(`\n=== Failed Tests (Prompt ${promptVersion}) ===\n`);
      failedTests.forEach(resultado => {
        console.log(`❌ ${resultado.descricao} (${resultado.categoria_teste})`);
      });
      console.log('');
    }

    // Exibir métricas detalhadas
    displayMetricsTable(todosResultados, promptVersion);

    // Resumo geral
    const totalGeral = todosResultados.length;
    const passaramGeral = todosResultados.filter(r => r.passou).length;
    console.log(`\nSummary: ${passaramGeral}/${totalGeral} tests passed (${((passaramGeral/totalGeral)*100).toFixed(2)}%)`);

    allResults[promptVersion] = todosResultados;
  }

  // Gerar relatório comparativo
  const comparisons = generateVersionComparison(allResults);
  displayComparisonReport(comparisons, calculateEvolutionMetrics(allResults));

  // Exportar dados em CSV
  exportToCSV(allResults, comparisons);
}

// Interface CLI
async function main() {
  if (!environment.API_KEY) {
    console.error('API_KEY não encontrada no arquivo .env');
    process.exit(1);
  }

  await executarTestes();
}

main().catch(error => {
  console.error('\nErro:', error);
  process.exit(1);
}); 
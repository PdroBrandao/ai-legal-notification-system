// Rodar
// npm run prazo 20/04/2025 5 TRT3

import { addBusinessDays } from '../utils/dateUtils';
import { Tribunal } from '../config/environment';
import { FERIADOS } from '../config/feriados';

interface CalculoPrazoResult {
  dataInicial: Date;
  dataFinal: Date;
  prazo: number;
  tribunal: Tribunal;
  diasPulados: {
    data: Date;
    motivo: 'Feriado' | 'Fim de Semana' | 'Dia Útil';
    considerado: boolean;
  }[];
}

async function calcularPrazo(
  dataInicial: Date,
  prazo: number,
  tribunal: Tribunal
): Promise<CalculoPrazoResult> {
  // Ajusta para começar no dia seguinte à publicação
  const dataInicioPrazo = new Date(dataInicial);
  dataInicioPrazo.setDate(dataInicioPrazo.getDate() + 1);

  console.log('\nDebug info:');
  console.log('Data Publicação:', dataInicial);
  console.log('Data Início Prazo:', dataInicioPrazo);
  console.log('Prazo:', prazo);
  console.log('Tribunal:', tribunal);

  const diasPulados: CalculoPrazoResult['diasPulados'] = [];
  
  // Usa feriados da configuração
  const feriadosTribunal = FERIADOS[tribunal];

  // Data final calculada
  const dataFinal = addBusinessDays(dataInicioPrazo, prazo, feriadosTribunal);
  
  // Converte a string "DD/MM/YY" para Date
  const [dia, mes, ano] = dataFinal.split('/');
  const dataFinalObj = new Date(`20${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T00:00:00`);

  // Gera array com todos os dias entre data inicial e final
  let currentDate = new Date(dataInicioPrazo);
  while (currentDate <= dataFinalObj) {
    const currentDateStr = currentDate.toISOString().split('T')[0];
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    const isFeriado = feriadosTribunal.includes(currentDateStr);

    diasPulados.push({
      data: new Date(currentDate),
      motivo: isFeriado ? 'Feriado' : isWeekend ? 'Fim de Semana' : 'Dia Útil',
      considerado: !isWeekend && !isFeriado
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    dataInicial,
    dataFinal: dataFinalObj,
    prazo,
    tribunal,
    diasPulados
  };
}

// Interface CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 3) {
    console.log('Uso: ts-node prazo-calculator.ts <data-inicial> <prazo> <tribunal>');
    console.log('Exemplo: ts-node prazo-calculator.ts 20/04/2025 5 TRT3');
    process.exit(1);
  }

  const [dataStr, prazoStr, tribunal] = args;
  
  // Converte data do formato DD/MM/YYYY para Date
  const [dia, mes, ano] = dataStr.split('/');
  const dataInicial = new Date(`${ano}-${mes}-${dia}T00:00:00`);

  if (isNaN(dataInicial.getTime())) {
    console.error('Data inválida. Use o formato DD/MM/YYYY');
    process.exit(1);
  }

  const resultado = await calcularPrazo(
    dataInicial,
    parseInt(prazoStr),
    tribunal as Tribunal
  );

  console.log('\n=== Resultado do Cálculo de Prazo ===\n');
  console.log(`Data Inicial: ${resultado.dataInicial.toLocaleDateString('pt-BR')}`);
  console.log(`Prazo: ${resultado.prazo} dias úteis`);
  console.log(`Tribunal: ${resultado.tribunal}`);
  console.log(`Data Final: ${resultado.dataFinal.toLocaleDateString('pt-BR')}`);
  
  console.log('\nDias analisados:');
  console.table(
    resultado.diasPulados.map(d => ({
      Data: d.data.toLocaleDateString('pt-BR'),
      Motivo: d.motivo,
      Considerado: d.considerado ? 'Sim' : 'Não'
    }))
  );
}

main()
  .catch(console.error);





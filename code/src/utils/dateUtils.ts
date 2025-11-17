import { environment } from "../config/environment";

// Função central para obter a data de busca
export function getSearchDate(): string {
  if (environment.USE_STATIC_DATE) {
    return environment.STATIC_DATE;
  }
  return new Date().toISOString().split("T")[0];
}

export function getCurrentDate(): string {
  const searchDate = new Date(getSearchDate());
  return searchDate.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function addBusinessDays(
  startDate: Date,
  daysToAdd: number,
  feriados: string[]
): string {
  // Garantir que a data está no timezone correto
  let currentDate = new Date(
    startDate.toISOString().split("T")[0] + "T00:00:00-03:00"
  );

  let addedDays = 0;

  while (addedDays < daysToAdd) {
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const currentDateStr = currentDate.toISOString().split("T")[0];
    const isHoliday = feriados.some(
      (feriado) => feriado.split("T")[0] === currentDateStr
    );
    if (!isWeekend && !isHoliday) {
      // 0 = Domingo, 6 = Sábado
      addedDays++;
    }

    if (addedDays < daysToAdd) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return formatDateToBR(currentDate);
}

export function formatDateToBR(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

// Nova função para formatar a data para a API
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split("T")[0]; // Retorna YYYY-MM-DD
}

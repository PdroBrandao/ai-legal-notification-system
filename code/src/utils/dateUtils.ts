/**
 * Date Utilities - Business day calculations for legal deadlines
 * 
 * This module handles all date operations considering:
 * - Brazilian timezone (America/Sao_Paulo / GMT-3)
 * - Business days (Monday-Friday only)
 * - Court-specific holidays
 * - Legal deadline calculation rules
 */

/**
 * Get the search date for DJEN API queries
 * 
 * Returns the current date in ISO format (YYYY-MM-DD).
 * In production, this is used to query notifications published today.
 * 
 * @returns Date string in YYYY-MM-DD format
 */
export function getSearchDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get current date formatted for Brazilian locale
 * 
 * @returns Date string in DD/MM/YYYY format
 */
export function getCurrentDate(): string {
  const searchDate = new Date(getSearchDate());
  return searchDate.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Add business days to a start date, excluding weekends and holidays
 * 
 * This is the core algorithm for legal deadline calculation.
 * Only counts working days (Monday-Friday, excluding holidays).
 * 
 * @param startDate - Starting date
 * @param daysToAdd - Number of business days to add
 * @param feriados - Array of holiday dates (ISO format)
 * @returns Final date in DD/MM/YY format
 * 
 * @example
 * // Publication: 2025-06-02, Deadline: 8 business days
 * addBusinessDays(new Date('2025-06-02'), 8, holidays)
 * // Returns: "12/06/25" (skipping weekends and holidays)
 */
export function addBusinessDays(
  startDate: Date,
  daysToAdd: number,
  feriados: string[]
): string {
  // Ensure date is in correct timezone (Brazil GMT-3)
  let currentDate = new Date(
    startDate.toISOString().split("T")[0] + "T00:00:00-03:00"
  );

  let addedDays = 0;

  while (addedDays < daysToAdd) {
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
    const currentDateStr = currentDate.toISOString().split("T")[0];
    const isHoliday = feriados.some(
      (feriado) => feriado.split("T")[0] === currentDateStr
    );
    
    // Only count if it's a business day (not weekend, not holiday)
    if (!isWeekend && !isHoliday) {
      addedDays++;
    }

    if (addedDays < daysToAdd) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return formatDateToBR(currentDate);
}

/**
 * Format date to Brazilian locale (DD/MM/YY)
 * 
 * @param date - Date object to format
 * @returns Formatted date string
 */
export function formatDateToBR(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

/**
 * Format date for DJEN API (YYYY-MM-DD)
 * 
 * @param date - Date object to format
 * @returns ISO date string (YYYY-MM-DD)
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Brazilian Court Holidays Configuration
 * 
 * This module defines court-specific holidays for accurate legal deadline calculation.
 * Different courts (TJMG, TRT3, TRF6) have different holiday calendars, including:
 * - National holidays
 * - State/Regional holidays
 * - Court recess periods (January, December)
 * 
 * Holidays are used by the deadline calculation algorithm to ensure only business
 * days are counted when determining legal response deadlines.
 * 
 * Format: ISO date strings (YYYY-MM-DD)
 * 
 * @example
 * // Get holidays for a specific court
 * const tjmgHolidays = HOLIDAYS['TJMG'];
 * 
 * // Used in deadline calculation
 * addBusinessDays(startDate, 15, HOLIDAYS[tribunal]);
 */

import { Tribunal } from './environment';

type HolidaysMap = {
  [key in Tribunal]: string[];
};

export const HOLIDAYS: HolidaysMap = {
  // Tribunal de Justiça de Minas Gerais (State Civil Court)
  TJMG: [
    // January - Court recess + New Year
    '2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05', '2025-01-06',
    // March - Carnival
    '2025-03-03', '2025-03-04', '2025-03-05',
    // April - Holy Week + Tiradentes Day
    '2025-04-16', '2025-04-17', '2025-04-18', '2025-04-21',
    // May - Labor Day
    '2025-05-01', '2025-05-02',
    // June - Corpus Christi
    '2025-06-19', '2025-06-20',
    // July
    '2025-07-03',
    // August
    '2025-08-15',
    // September - Independence Day
    '2025-09-07',
    // October - Nossa Senhora Aparecida
    '2025-10-12',
    // November - All Souls' Day, Republic Day, Black Consciousness Day
    '2025-11-02', '2025-11-15', '2025-11-20', '2025-11-21',
    // December - Court recess + Christmas
    '2025-12-08', '2025-12-20', '2025-12-21', '2025-12-22', '2025-12-23', 
    '2025-12-24', '2025-12-25', '2025-12-26', '2025-12-27', '2025-12-28',
    '2025-12-29', '2025-12-30', '2025-12-31'
  ],
  
  // Tribunal Regional do Trabalho 3ª Região (Labor Court)
  TRT3: [
    // January - Court recess
    '2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05', '2025-01-06',
    // March - Carnival
    '2025-03-03', '2025-03-04', '2025-03-05',
    // April - Holy Week
    '2025-04-16', '2025-04-17', '2025-04-18', '2025-04-19', '2025-04-20', '2025-04-21',
    // May - Labor Day
    '2025-05-01',
    // June - Corpus Christi
    '2025-06-19',
    // July
    '2025-07-03',
    // August
    '2025-08-14', '2025-08-15',
    // September - Independence Day
    '2025-09-07',
    // October
    '2025-10-12', '2025-10-31',
    // November
    '2025-11-01', '2025-11-02', '2025-11-15', '2025-11-20',
    // December - Court recess
    '2025-12-08', '2025-12-20', '2025-12-21', '2025-12-22', '2025-12-23',
    '2025-12-24', '2025-12-25', '2025-12-26', '2025-12-27', '2025-12-28',
    '2025-12-29', '2025-12-30', '2025-12-31'
  ],
  
  // Tribunal Regional Federal 6ª Região (Federal Court)
  // TODO: Add TRF6 holidays when available
  TRF6: []
} as const; 
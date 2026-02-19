import { useMemo } from 'react';
import { computeForecast } from '../utils/calculations';

/**
 * Returns a cash flow forecast for the current month
 * based on daily spending/income pace.
 */
export function useForecast(transactions) {
  return useMemo(() => computeForecast(transactions), [transactions]);
}

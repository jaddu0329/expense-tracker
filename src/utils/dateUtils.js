import { startOfMonth, endOfMonth, subMonths, format, isWithinInterval, parseISO } from 'date-fns';

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
export { startOfMonth, endOfMonth, subMonths, format, parseISO };

export const TODAY       = new Date();
export const THIS_MONTH  = { start: startOfMonth(TODAY), end: endOfMonth(TODAY) };
export const LAST_MONTH  = {
  start: startOfMonth(subMonths(TODAY, 1)),
  end:   endOfMonth(subMonths(TODAY, 1)),
};

export const fmtDate = (d) => format(new Date(d), 'd MMM yyyy');
export const fmtMonth = (d) => format(new Date(d), 'MMM yyyy');
export const fmtISO = (d) => format(new Date(d), 'yyyy-MM-dd');

export const inRange = (dateStr, range) => {
  try {
    return isWithinInterval(parseISO(dateStr), {
      start: range.start,
      end:   range.end,
    });
  } catch { return false; }
};

/** Returns the number of days left in the current month */
export const daysLeftInMonth = () => {
  const today = new Date();
  const lastDay = endOfMonth(today);
  return lastDay.getDate() - today.getDate();
};

/** Returns the day of month today */
export const dayOfMonth = () => new Date().getDate();

/** Returns total days in current month */
export const daysInMonth = () => endOfMonth(new Date()).getDate();

/**
 * Bucket transactions by month string "MMM yyyy" for last N months.
 */
export const bucketByMonth = (transactions, n = 6) => {
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = subMonths(TODAY, i);
    months.push({ label: format(d, 'MMM yy'), start: startOfMonth(d), end: endOfMonth(d) });
  }
  return months.map(m => ({
    label:   m.label,
    income:  transactions
      .filter(t => t.type === 'income' && inRange(t.date, m))
      .reduce((s, t) => s + Number(t.amount), 0),
    expense: transactions
      .filter(t => t.type === 'expense' && inRange(t.date, m))
      .reduce((s, t) => s + Number(t.amount), 0),
  }));
};

import { THIS_MONTH, LAST_MONTH, inRange } from './dateUtils';

// ─── CORE STATS SELECTOR ──────────────────────────────────────────────────────
/**
 * Computes all core financial stats from transactions + targets.
 * Pure function — no side effects — safe to use inside useMemo.
 */
export function computeStats(transactions, incomeTarget) {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);

  const expenses = transactions
    .filter(t => t.type === 'expense' && t.categoryId !== '6')
    .reduce((s, t) => s + Number(t.amount), 0);

  const investments = transactions
    .filter(t => t.categoryId === '6')
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalOutflow = expenses + investments;
  const balance      = income - totalOutflow;
  const savingsRate  = income > 0 ? ((income - expenses) / income) * 100 : 0;

  const suggestedExpenseLimit    = incomeTarget * 0.70;
  const suggestedInvestmentGoal  = incomeTarget * 0.20;
  const suggestedBuffer          = incomeTarget * 0.10;

  return {
    totalIncome:            income,
    totalExpenses:          expenses,
    totalInvestments:       investments,
    totalOutflow,
    balance,
    savingsRate:            +savingsRate.toFixed(1),
    incomeAchievement:      incomeTarget > 0 ? Math.min((income / incomeTarget) * 100, 100).toFixed(0) : 0,
    suggestedExpenseLimit,
    suggestedInvestmentGoal,
    suggestedBuffer,
    expenseVsLogic:  suggestedExpenseLimit   > 0 ? (expenses    / suggestedExpenseLimit  ) * 100 : 0,
    investVsLogic:   suggestedInvestmentGoal > 0 ? (investments / suggestedInvestmentGoal) * 100 : 0,
    bufferVsLogic:   suggestedBuffer         > 0 ? (balance     / suggestedBuffer         ) * 100 : 0,
  };
}

// ─── MONTHLY COMPARISON ───────────────────────────────────────────────────────
export function computeMonthStats(transactions, range) {
  const filtered = transactions.filter(t => inRange(t.date, range));
  const income   = filtered.filter(t => t.type === 'income') .reduce((s, t) => s + Number(t.amount), 0);
  const expenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  return { income, expenses, net: income - expenses, count: filtered.length };
}

export function computeComparison(transactions, mode, customRange) {
  const current = computeMonthStats(transactions,
    mode === 'lastMonth' ? LAST_MONTH : mode === 'custom' ? customRange : THIS_MONTH
  );
  const prior = computeMonthStats(transactions,
    mode === 'lastMonth' ? { start: new Date(LAST_MONTH.start.getTime()), end: new Date(LAST_MONTH.end.getTime()) } : LAST_MONTH
  );
  const pct = (a, b) => b === 0 ? 0 : ((a - b) / Math.abs(b)) * 100;
  return {
    current,
    prior,
    incomeDelta:   pct(current.income,   prior.income),
    expenseDelta:  pct(current.expenses, prior.expenses),
    netDelta:      pct(current.net,      Math.abs(prior.net)),
  };
}

// ─── CASH FLOW FORECAST ───────────────────────────────────────────────────────
export function computeForecast(transactions) {
  const { dayOfMonth, daysInMonth } = {
    dayOfMonth: new Date().getDate(),
    daysInMonth: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
  };

  const thisMonthTx = transactions.filter(t => inRange(t.date, THIS_MONTH));
  const incomeToDate  = thisMonthTx.filter(t => t.type === 'income') .reduce((s, t) => s + Number(t.amount), 0);
  const expenseToDate = thisMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

  const dailyRate     = dayOfMonth > 0 ? expenseToDate / dayOfMonth : 0;
  const projectedExp  = dailyRate * daysInMonth;
  const dailyIncome   = dayOfMonth > 0 ? incomeToDate / dayOfMonth : 0;
  const projectedInc  = dailyIncome * daysInMonth;
  const projectedSav  = projectedInc - projectedExp;

  return {
    incomeToDate,
    expenseToDate,
    projectedExpense:  Math.round(projectedExp),
    projectedIncome:   Math.round(projectedInc),
    projectedSavings:  Math.round(projectedSav),
    dailySpendRate:    Math.round(dailyRate),
    daysLeft:          daysInMonth - dayOfMonth,
    remainingBudget:   Math.max(0, projectedInc - expenseToDate),
  };
}

// ─── SAVINGS SCORE ───────────────────────────────────────────────────────────
export function computeSavingsScore(stats) {
  const { savingsRate, expenseVsLogic, investVsLogic, bufferVsLogic } = stats;

  // Budget adherence (25 pts): lower expense ratio = better
  const budgetScore = Math.max(0, 25 - Math.round((expenseVsLogic - 70) * 0.5));

  // Savings rate (25 pts): 20%+ = full
  const savingsScore = Math.min(25, Math.round((savingsRate / 20) * 25));

  // Investment ratio (25 pts): 20%+ of income = full
  const investScore = Math.min(25, Math.round((investVsLogic / 100) * 25));

  // Buffer (25 pts): buffer > target = full
  const bufferScore = Math.min(25, Math.round(Math.min(bufferVsLogic, 100) / 100 * 25));

  const total = Math.max(0, Math.min(100, budgetScore + savingsScore + investScore + bufferScore));

  return {
    total,
    breakdown: { budgetScore, savingsScore, investScore, bufferScore },
    grade: total >= 80 ? 'A' : total >= 60 ? 'B' : total >= 40 ? 'C' : total >= 20 ? 'D' : 'F',
    label: total >= 80 ? 'Excellent' : total >= 60 ? 'Good' : total >= 40 ? 'Fair' : total >= 20 ? 'Poor' : 'Critical',
    color: total >= 80 ? '#10b981' : total >= 60 ? '#6366f1' : total >= 40 ? '#f59e0b' : '#ef4444',
  };
}

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────
export function computeAchievements(transactions, stats) {
  const { savingsRate, investVsLogic, bufferVsLogic } = stats;

  // Check 3 months positive savings
  const last3 = [0, 1, 2].map(i => {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const inc = transactions.filter(t => t.type === 'income'  && new Date(t.date) >= start && new Date(t.date) <= end).reduce((s, t) => s + Number(t.amount), 0);
    const exp = transactions.filter(t => t.type === 'expense' && new Date(t.date) >= start && new Date(t.date) <= end).reduce((s, t) => s + Number(t.amount), 0);
    return inc - exp;
  });
  const consistent3 = last3.every(n => n > 0);

  // 6 months consistent saving
  const last6 = [0,1,2,3,4,5].map(i => {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const inc = transactions.filter(t => t.type === 'income'  && new Date(t.date) >= start && new Date(t.date) <= end).reduce((s, t) => s + Number(t.amount), 0);
    const exp = transactions.filter(t => t.type === 'expense' && new Date(t.date) >= start && new Date(t.date) <= end).reduce((s, t) => s + Number(t.amount), 0);
    return inc - exp;
  });
  const consistent6 = last6.every(n => n > 0);

  return [
    {
      id:    'budget3',
      emoji:  '🏆',
      title:  '3 Months Budget Control',
      desc:   'Maintained positive savings for 3 consecutive months',
      earned: consistent3,
    },
    {
      id:    'emergency',
      emoji:  '🛡️',
      title:  'Emergency Fund Complete',
      desc:   'Emergency buffer exceeds 100% of target',
      earned: bufferVsLogic >= 100,
    },
    {
      id:    'invest20',
      emoji:  '📈',
      title:  'Investment Above 20%',
      desc:   'Investments reached 20%+ of income target',
      earned: investVsLogic >= 100,
    },
    {
      id:    'save6',
      emoji:  '🎯',
      title:  '6 Months Consistent Saving',
      desc:   'Positive net savings for 6 months straight',
      earned: consistent6,
    },
    {
      id:    'rate30',
      emoji:  '✨',
      title:  'Super Saver',
      desc:   'Savings rate above 30%',
      earned: Number(savingsRate) >= 30,
    },
  ];
}

// ─── NET WORTH ────────────────────────────────────────────────────────────────
export function computeNetWorth(assets, liabilities) {
  const total_assets      = assets.reduce((s, a)      => s + Number(a.value), 0);
  const total_liabilities = liabilities.reduce((s, l) => s + Number(l.value), 0);
  return { total_assets, total_liabilities, netWorth: total_assets - total_liabilities };
}

import { useMemo } from 'react';
import { formatINR } from '../utils/formatters';
import { THIS_MONTH, LAST_MONTH, inRange } from '../utils/dateUtils';

/**
 * Generates smart AI-style insights from financial data.
 * Returns an array of insight objects: { id, type, emoji, title, message, severity }
 * severity: 'info' | 'warning' | 'danger' | 'success'
 */
export function useFinancialInsights(transactions, categories, budget, incomeTarget, stats) {
  return useMemo(() => {
    const insights = [];
    const {
      totalExpenses, totalIncome, totalInvestments,
      balance, savingsRate, suggestedExpenseLimit,
      suggestedInvestmentGoal, expenseVsLogic,
    } = stats;

    // ── 1. Budget Alert ──────────────────────────────────────────────────────
    if (expenseVsLogic > 100) {
      insights.push({
        id: 'budget-exceeded',
        type: 'danger',
        emoji: '🚨',
        title: 'Budget Exceeded',
        message: `Your expenses (${formatINR(totalExpenses)}) have exceeded the recommended 70% rule cap of ${formatINR(suggestedExpenseLimit)}.`,
      });
    } else if (expenseVsLogic > 80) {
      insights.push({
        id: 'budget-warning',
        type: 'warning',
        emoji: '⚠️',
        title: 'Approaching Budget Limit',
        message: `You've used ${expenseVsLogic.toFixed(0)}% of your recommended expense budget. Slow down spending.`,
      });
    }

    // ── 2. Savings Rate ──────────────────────────────────────────────────────
    if (totalIncome > 0) {
      if (savingsRate >= 30) {
        insights.push({
          id: 'saving-great',
          type: 'success',
          emoji: '🎉',
          title: 'Excellent Savings Rate',
          message: `Your savings rate is ${savingsRate}% — well above the recommended 20%. Keep it up!`,
        });
      } else if (savingsRate < 10 && savingsRate >= 0) {
        insights.push({
          id: 'saving-low',
          type: 'warning',
          emoji: '📉',
          title: 'Low Savings Rate',
          message: `You're saving only ${savingsRate}% of income. Aim for at least 20% to build financial security.`,
        });
      } else if (savingsRate < 0) {
        insights.push({
          id: 'saving-negative',
          type: 'danger',
          emoji: '🔴',
          title: 'Negative Net Balance',
          message: `You're spending more than you earn! Net deficit: ${formatINR(Math.abs(balance))}.`,
        });
      }
    }

    // ── 3. Month-over-month ──────────────────────────────────────────────────
    const thisMoInc  = transactions.filter(t => t.type === 'income'  && inRange(t.date, THIS_MONTH)).reduce((s, t) => s + Number(t.amount), 0);
    const lastMoInc  = transactions.filter(t => t.type === 'income'  && inRange(t.date, LAST_MONTH)).reduce((s, t) => s + Number(t.amount), 0);
    const thisMoExp  = transactions.filter(t => t.type === 'expense' && inRange(t.date, THIS_MONTH)).reduce((s, t) => s + Number(t.amount), 0);
    const lastMoExp  = transactions.filter(t => t.type === 'expense' && inRange(t.date, LAST_MONTH)).reduce((s, t) => s + Number(t.amount), 0);

    if (lastMoExp > 0) {
      const pct = ((thisMoExp - lastMoExp) / lastMoExp * 100).toFixed(1);
      if (Number(pct) > 20) {
        insights.push({
          id: 'mom-expense-spike',
          type: 'warning',
          emoji: '📊',
          title: 'Expense Spike Detected',
          message: `Expenses are up ${pct}% vs last month (${formatINR(lastMoExp)} → ${formatINR(thisMoExp)}).`,
        });
      } else if (Number(pct) < -15) {
        insights.push({
          id: 'mom-expense-down',
          type: 'success',
          emoji: '📉',
          title: 'Spending Reduced',
          message: `Great control! Expenses dropped ${Math.abs(pct)}% vs last month.`,
        });
      }
    }

    if (lastMoInc > 0 && thisMoInc > 0) {
      const pct = ((thisMoInc - lastMoInc) / lastMoInc * 100).toFixed(1);
      if (Number(pct) > 10) {
        insights.push({
          id: 'mom-income-up',
          type: 'success',
          emoji: '💹',
          title: 'Income Growing',
          message: `Income rose ${pct}% month-over-month. Consider allocating the extra to investments.`,
        });
      }
    }

    // ── 4. Category spikes ───────────────────────────────────────────────────
    categories.filter(c => c.type === 'expense').forEach(cat => {
      const thisMonCat = transactions
        .filter(t => t.categoryId === cat.id && inRange(t.date, THIS_MONTH))
        .reduce((s, t) => s + Number(t.amount), 0);
      const lastMonCat = transactions
        .filter(t => t.categoryId === cat.id && inRange(t.date, LAST_MONTH))
        .reduce((s, t) => s + Number(t.amount), 0);
      if (lastMonCat > 0 && thisMonCat / lastMonCat > 2) {
        insights.push({
          id: `cat-spike-${cat.id}`,
          type: 'warning',
          emoji: cat.icon,
          title: `${cat.name} Spending Doubled`,
          message: `${cat.name} spending is 2x compared to last month (${formatINR(lastMonCat)} → ${formatINR(thisMonCat)}).`,
        });
      }
    });

    // ── 5. Emergency buffer ──────────────────────────────────────────────────
    const bufferMonths = totalExpenses > 0 ? (balance / (totalExpenses || 1)) : 0;
    if (bufferMonths < 1 && balance > 0) {
      insights.push({
        id: 'buffer-low',
        type: 'warning',
        emoji: '🛡️',
        title: 'Build Emergency Fund',
        message: `Your buffer covers less than 1 month of expenses. Aim for 3–6 months.`,
      });
    } else if (bufferMonths >= 3) {
      insights.push({
        id: 'buffer-good',
        type: 'success',
        emoji: '🛡️',
        title: 'Emergency Fund Strong',
        message: `Your buffer covers ${bufferMonths.toFixed(1)} months of expenses — you're well protected.`,
      });
    }

    // ── 6. Investment nudge ──────────────────────────────────────────────────
    if (totalIncome > 0 && totalInvestments === 0) {
      insights.push({
        id: 'invest-none',
        type: 'info',
        emoji: '💡',
        title: 'Start Investing',
        message: `You haven't logged any investments this period. Even ${formatINR(suggestedInvestmentGoal)} (20% of goal) can compound significantly.`,
      });
    }

    // ── 7. Over-saving nudge ────────────────────────────────────────────────
    if (savingsRate > 50 && totalInvestments < suggestedInvestmentGoal) {
      insights.push({
        id: 'over-saving',
        type: 'info',
        emoji: '🏦',
        title: 'High Cash Holdings',
        message: `You're saving ${savingsRate}% but investments are low. Consider deploying idle cash into investments.`,
      });
    }

    return insights.slice(0, 8);  // cap at 8 insights
  }, [transactions, categories, budget, incomeTarget, stats]);
}

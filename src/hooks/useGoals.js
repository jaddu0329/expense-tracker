import { useMemo } from 'react';
import { differenceInMonths } from 'date-fns';

/**
 * Enriches raw goals with derived fields:
 * - progressPct
 * - monthsLeft
 * - requiredMonthlySaving
 * - estimatedCompletion
 * - isAchieved
 */
export function useGoals(goals) {
  return useMemo(() => {
    return goals.map(g => {
      const target   = Number(g.targetAmount) || 1;
      const current  = Number(g.currentAmount) || 0;
      const pct      = Math.min((current / target) * 100, 100);
      const deadlineDate = g.deadline ? new Date(g.deadline) : null;
      const today    = new Date();
      const monthsLeft = deadlineDate ? Math.max(0, differenceInMonths(deadlineDate, today)) : null;
      const remaining  = Math.max(0, target - current);
      const requiredMonthlySaving = (monthsLeft && monthsLeft > 0)
        ? Math.ceil(remaining / monthsLeft)
        : null;

      // Estimated completion at current saved amount vs start
      let estimatedCompletion = null;
      if (g.monthlyContribution > 0 && remaining > 0) {
        const months = Math.ceil(remaining / g.monthlyContribution);
        const est = new Date();
        est.setMonth(est.getMonth() + months);
        estimatedCompletion = est.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      }

      return {
        ...g,
        progressPct:            +pct.toFixed(1),
        monthsLeft,
        requiredMonthlySaving,
        estimatedCompletion,
        isAchieved:             current >= target,
        remaining,
      };
    });
  }, [goals]);
}

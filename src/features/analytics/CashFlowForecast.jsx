import React from 'react';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import { useForecast } from '../../hooks/useForecast';

export default function CashFlowForecast({ transactions }) {
  const fc = useForecast(transactions);

  const positive = fc.projectedSavings >= 0;

  return (
    <div className={`rounded-[2rem] border shadow-sm overflow-hidden ${
      positive
        ? 'bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-indigo-950/20 border-indigo-100 dark:border-indigo-900/40'
        : 'bg-gradient-to-br from-rose-50 to-white dark:from-slate-900 dark:to-rose-950/20 border-rose-100 dark:border-rose-900/40'
    }`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl ${positive ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-500'}`}>
            <Calendar size={16} />
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest">Cash Flow Forecast</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {fc.daysLeft} days left this month
            </p>
          </div>
        </div>

        {/* Hero message */}
        <div className={`p-4 rounded-2xl mb-4 ${positive ? 'bg-indigo-100/60 dark:bg-indigo-900/20' : 'bg-rose-100/60 dark:bg-rose-900/20'}`}>
          {positive
            ? <p className="text-sm font-black text-indigo-800 dark:text-indigo-200">
                At current pace, you will save{' '}
                <span className="text-emerald-600 dark:text-emerald-400">{formatINR(fc.projectedSavings)}</span>{' '}
                this month. 🎉
              </p>
            : <p className="text-sm font-black text-rose-800 dark:text-rose-200">
                At current pace, you may overspend by{' '}
                <span className="text-rose-600">{formatINR(Math.abs(fc.projectedSavings))}</span>{' '}
                this month. ⚠️
              </p>
          }
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Daily Spend Rate',    value: formatINR(fc.dailySpendRate),      sub: 'per day avg' },
            { label: 'Projected Income',    value: formatINR(fc.projectedIncome),     sub: 'end of month' },
            { label: 'Projected Expense',   value: formatINR(fc.projectedExpense),    sub: 'end of month' },
            { label: 'Income This Month',   value: formatINR(fc.incomeToDate),        sub: 'so far' },
          ].map(item => (
            <div key={item.label} className="p-3 bg-white/60 dark:bg-slate-800/40 rounded-xl">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
              <p className="font-black text-sm tnum text-slate-900 dark:text-white">{item.value}</p>
              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
            <span>Month Progress</span>
            <span>{Math.round((1 - fc.daysLeft / 31) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${positive ? 'bg-indigo-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.round((1 - fc.daysLeft / 31) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

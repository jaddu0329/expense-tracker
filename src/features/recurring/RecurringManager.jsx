import React from 'react';
import { RefreshCcw, Trash2, Calendar } from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import { fmtDate } from '../../utils/dateUtils';

const FREQ_LABELS = {
  weekly:  { label: 'Weekly',  color: 'text-sky-600 bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400' },
  monthly: { label: 'Monthly', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400' },
  yearly:  { label: 'Yearly',  color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400' },
};

export default function RecurringManager({ transactions, categories, dispatch }) {
  const recurring = transactions.filter(t => t.recurring && t.nextDate);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-xl text-sky-600">
          <RefreshCcw size={16} />
        </div>
        <div>
          <h4 className="font-black text-sm uppercase tracking-widest">Recurring Transactions</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            {recurring.length} active schedule{recurring.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {recurring.length === 0 ? (
        <div className="p-8 text-center">
          <RefreshCcw size={32} className="mx-auto mb-3 text-slate-200 dark:text-slate-700" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">No recurring transactions</p>
          <p className="text-[11px] text-slate-400 mt-1">Toggle "Recurring" when adding a transaction.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-50 dark:divide-slate-800">
          {recurring.map(t => {
            const cat = categories.find(c => c.id === t.categoryId);
            const freq = FREQ_LABELS[t.frequency] || FREQ_LABELS.monthly;
            const today = new Date().toISOString().split('T')[0];
            const isDue  = t.nextDate <= today;
            return (
              <li key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm"
                    style={{ backgroundColor: cat?.color || '#94a3b8' }}
                  >
                    {cat?.icon || '🏷️'}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{t.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${freq.color}`}>
                        {freq.label}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                        <Calendar size={9} />
                        Next: {fmtDate(t.nextDate)}
                        {isDue && <span className="text-rose-500 ml-1">• DUE</span>}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-black tnum ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}
                  </span>
                  <button
                    onClick={() => dispatch({ type: 'DELETE_TRANSACTION', payload: t.id })}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

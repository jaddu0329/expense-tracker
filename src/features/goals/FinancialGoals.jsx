import React, { useState } from 'react';
import { Target, Plus, Trash2, X, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import { useGoals } from '../../hooks/useGoals';

export default function FinancialGoals({ goals, dispatch }) {
  const enriched = useGoals(goals);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', targetAmount: '', currentAmount: '',
    deadline: '', monthlyContribution: '',
  });

  const handleAdd = () => {
    if (!form.title || !form.targetAmount) return;
    dispatch({
      type: 'ADD_GOAL',
      payload: { ...form, id: crypto.randomUUID() },
    });
    setForm({ title: '', targetAmount: '', currentAmount: '', deadline: '', monthlyContribution: '' });
    setShowForm(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
            <Target size={16} />
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest">Financial Goals</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {enriched.filter(g => g.isAchieved).length}/{enriched.length} achieved
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/20 hover:bg-emerald-200 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
        >
          {showForm ? <X size={12} /> : <Plus size={12} />}
          {showForm ? 'Cancel' : 'Add Goal'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2">
              <input
                type="text"
                placeholder="Goal title (e.g. Buy Car, Emergency Fund)"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500 transition-all"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                placeholder="Target Amount"
                className="w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-800 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500 transition-all"
                value={form.targetAmount}
                onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                placeholder="Current Saved"
                className="w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-800 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500 transition-all"
                value={form.currentAmount}
                onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))}
              />
            </div>
            <input
              type="date"
              className="col-span-1 w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500 transition-all"
              value={form.deadline}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                placeholder="Monthly contribution"
                className="w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-800 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500 transition-all"
                value={form.monthlyContribution}
                onChange={e => setForm(f => ({ ...f, monthlyContribution: e.target.value }))}
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            Create Goal 🎯
          </button>
        </div>
      )}

      {/* Goals List */}
      {enriched.length === 0 ? (
        <div className="p-8 text-center">
          <Target size={32} className="mx-auto mb-3 text-slate-200 dark:text-slate-700" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">No goals yet</p>
          <p className="text-[11px] text-slate-400 mt-1">Set a financial goal to start tracking.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-50 dark:divide-slate-800">
          {enriched.map(g => (
            <GoalCard key={g.id} goal={g} dispatch={dispatch} />
          ))}
        </ul>
      )}
    </div>
  );
}

function GoalCard({ goal, dispatch }) {
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositAmt, setDepositAmt] = useState('');

  const handleDeposit = () => {
    const amt = Number(depositAmt);
    if (!amt) return;
    dispatch({
      type: 'UPDATE_GOAL',
      payload: { ...goal, currentAmount: Number(goal.currentAmount) + amt },
    });
    setDepositAmt('');
    setIsDepositing(false);
  };

  return (
    <li className="p-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            {goal.isAchieved && <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />}
            <p className="text-sm font-black text-slate-900 dark:text-white">{goal.title}</p>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">
            {formatINR(goal.currentAmount)} / {formatINR(goal.targetAmount)}
            {goal.monthsLeft !== null && ` • ${goal.monthsLeft}mo left`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black tabular-nums ${goal.isAchieved ? 'text-emerald-500' : 'text-indigo-600'}`}>
            {goal.progressPct}%
          </span>
          <button
            onClick={() => dispatch({ type: 'DELETE_GOAL', payload: goal.id })}
            className="p-1 rounded-lg text-slate-300 hover:text-rose-500 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-700 ${goal.isAchieved ? 'bg-emerald-500' : 'bg-indigo-500'}`}
          style={{ width: `${goal.progressPct}%` }}
        />
      </div>

      {/* Meta info */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-2">
        {goal.requiredMonthlySaving !== null && (
          <span>Need {formatINR(goal.requiredMonthlySaving)}/mo</span>
        )}
        {goal.estimatedCompletion && (
          <span>Est. {goal.estimatedCompletion}</span>
        )}
        {goal.isAchieved && <span className="text-emerald-500">✅ Achieved!</span>}
      </div>

      {/* Deposit */}
      {!goal.isAchieved && (
        isDepositing ? (
          <div className="flex gap-2 mt-2">
            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
              <input
                autoFocus
                type="number"
                placeholder="Amount"
                className="w-full pl-6 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500 transition-all"
                value={depositAmt}
                onChange={e => setDepositAmt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDeposit()}
              />
            </div>
            <button onClick={handleDeposit} className="px-3 py-2 bg-emerald-500 text-white text-xs font-black rounded-lg hover:bg-emerald-600 transition-all">Save</button>
            <button onClick={() => setIsDepositing(false)} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-black rounded-lg transition-all">Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => setIsDepositing(true)}
            className="mt-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            + Add Deposit
          </button>
        )
      )}
    </li>
  );
}

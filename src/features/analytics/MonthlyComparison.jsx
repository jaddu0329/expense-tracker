import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';
import { formatINR, compactINR, fmtPct } from '../../utils/formatters';
import { computeComparison } from '../../utils/calculations';
import { bucketByMonth } from '../../utils/dateUtils';

export default function MonthlyComparison({ transactions, mode, customRange, dispatch }) {
  const { current, prior, incomeDelta, expenseDelta, netDelta } = computeComparison(
    transactions, mode, customRange
  );
  const chartData = bucketByMonth(transactions, 6);

  const Indicator = ({ delta }) => {
    if (Math.abs(delta) < 0.5) return <Minus size={12} className="text-slate-400" />;
    return delta > 0
      ? <TrendingUp size={12} className="text-emerald-500" />
      : <TrendingDown size={12} className="text-rose-500" />;
  };

  const deltaColor = (v, invert = false) => {
    if (Math.abs(v) < 0.5) return 'text-slate-400';
    const pos = v > 0;
    return (pos !== invert) ? 'text-emerald-500' : 'text-rose-500';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header + toggle */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest">Monthly Comparison</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">vs last period</p>
          </div>
        </div>
        <div className="flex gap-2">
          {['thisMonth', 'lastMonth'].map(m => (
            <button
              key={m}
              onClick={() => dispatch({ type: 'SET_COMPARISON_MODE', payload: m })}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                mode === m
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600'
              }`}
            >
              {m === 'thisMonth' ? 'This Month' : 'Last Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Delta Cards */}
      <div className="p-5 grid grid-cols-3 gap-3 border-b border-slate-100 dark:border-slate-800">
        {[
          { label: 'Income',   value: current.income,   delta: incomeDelta,  invert: false },
          { label: 'Expenses', value: current.expenses, delta: expenseDelta, invert: true  },
          { label: 'Net',      value: current.net,      delta: netDelta,     invert: false },
        ].map(({ label, value, delta, invert }) => (
          <div key={label} className="text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <p className="font-black text-base text-slate-900 dark:text-white tnum">{compactINR(value)}</p>
            <div className={`flex items-center justify-center gap-1 text-[10px] font-black mt-1 ${deltaColor(delta, invert)}`}>
              <Indicator delta={invert ? -delta : delta} />
              {fmtPct(delta)}
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="p-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">6-Month Trend</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={10} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => compactINR(v)} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                formatter={(v, name) => [formatINR(v), name]}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', fontSize: 11 }}
              />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
              <Bar dataKey="income"  name="Income"   fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="expense" name="Expenses" fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

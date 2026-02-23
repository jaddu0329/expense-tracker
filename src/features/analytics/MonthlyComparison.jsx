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
      : <TrendingDown size={12} className="text-indigo-500" />;
  };

  const deltaColor = (v, invert = false) => {
    if (Math.abs(v) < 0.5) return 'text-slate-400';
    const pos = v > 0;
    return (pos !== invert) ? 'text-emerald-500' : 'text-indigo-500';
  };

  return (
    <div
      className="relative overflow-hidden group text-white rounded-[2.5rem] p-6 shadow-2xl shadow-indigo-500/30"
      style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}
    >
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20 blur-2xl" style={{ background: '#c4b5fd' }} />

      {/* Header + toggle */}
      <div className="pb-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest text-white">Monthly Comparison</h4>
            <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider mt-0.5">vs last period</p>
          </div>
        </div>
        <div className="flex gap-2">
          {['thisMonth', 'lastMonth'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => dispatch?.({ type: 'SET_COMPARISON_MODE', payload: m })}
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest transition-all focus:outline-none ${
                mode === m
                  ? 'bg-[#4F46E5] text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {m === 'thisMonth' ? 'This Month' : 'Last Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Delta Cards */}
      <div className="p-5 grid grid-cols-3 gap-3 border-b border-white/10">
        {[
          { label: 'Income',   value: current.income,   delta: incomeDelta,  invert: false, accent: 'bg-emerald-400' },
          { label: 'Expenses', value: current.expenses, delta: expenseDelta, invert: true,  accent: 'bg-indigo-400' },
          { label: 'Net',      value: current.net,      delta: netDelta,     invert: false, accent: 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]' },
        ].map(({ label, value, delta, invert, accent }) => (
          <div key={label} className="text-center bg-white/5 rounded-xl p-3 shadow-sm border border-white/10">
            <div className={`h-1 w-10 mx-auto rounded-full mb-3 ${accent}`} />
            <p className="text-[9px] font-black uppercase tracking-widest text-white/70 mb-1">{label}</p>
            <p className="font-black text-base text-white tnum">{compactINR(value)}</p>
            <div className={`flex items-center justify-center gap-1 text-[10px] font-black mt-2 ${deltaColor(delta, invert)}`}>
              <Indicator delta={invert ? -delta : delta} />
              {fmtPct(delta)}
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="p-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-3">6-Month Trend</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={10} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fontWeight: 700, fill: 'rgba(255,255,255,0.85)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => compactINR(v)} tick={{ fontSize: 9, fontWeight: 700, fill: 'rgba(255,255,255,0.85)' }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                formatter={(v, name) => [formatINR(v), name]}
                contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.06)', boxShadow: '0 8px 32px rgba(15,23,42,0.2)', fontSize: 11, color: '#ffffff' }}
              />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10, fontWeight: 800, color: '#e9d5ff' }} />
              <Bar dataKey="income"  name="Income"   fill="#059669" radius={[4,4,0,0]} />
              <Bar dataKey="expense" name="Expenses" fill="#4f46e5" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

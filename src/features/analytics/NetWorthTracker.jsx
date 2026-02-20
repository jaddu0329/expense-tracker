import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Plus, Trash2, X } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { formatINR, compactINR } from '../../utils/formatters';
import { computeNetWorth } from '../../utils/calculations';
import { bucketByMonth } from '../../utils/dateUtils';

export default function NetWorthTracker({ assets, liabilities, transactions, dispatch, netWorthHistory = [] }) {
  const { total_assets, total_liabilities, netWorth } = computeNetWorth(assets, liabilities);
  const [showAddAsset, setShowAddAsset]       = useState(false);
  const [showAddLiability, setShowAddLiability] = useState(false);
  const [assetForm, setAssetForm]       = useState({ name: '', value: '' });
  const [liabForm,  setLiabForm]        = useState({ name: '', value: '' });

  // Build net worth trend using persisted monthly snapshots.
  // Current month always uses the live-computed netWorth.
  // Past months are immutable — they show the stored snapshot value (or 0 if none recorded yet).
  const monthBuckets = bucketByMonth(transactions, 6); // [oldest … current]
  const curKey = monthBuckets[monthBuckets.length - 1].label;
  const trendData = monthBuckets.map(m => {
    if (m.label === curKey) return { label: m.label, netWorth };
    const snap = netWorthHistory.find(h => h.month === m.label);
    return { label: m.label, netWorth: snap ? snap.netWorth : 0 };
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest">Net Worth</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Assets minus Liabilities</p>
          </div>
          <div className={`text-right flex flex-col items-end`}>
            <span className={`text-2xl font-black tnum ${netWorth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {compactINR(netWorth)}
            </span>
            {netWorth >= 0
              ? <TrendingUp size={14} className="text-emerald-500" />
              : <TrendingDown size={14} className="text-rose-500" />
            }
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">Total Assets</p>
            <p className="font-black text-base text-emerald-600 tnum">{formatINR(total_assets)}</p>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-900/30">
            <p className="text-[9px] font-black uppercase tracking-widest text-rose-600 mb-1">Liabilities</p>
            <p className="font-black text-base text-rose-600 tnum">{formatINR(total_liabilities)}</p>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="px-4 pt-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">6-Month Net Worth Trend</p>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => compactINR(v)} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={55} />
              <Tooltip
                formatter={(v) => [formatINR(v), 'Net Worth']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 3 }}
                activeDot={{ r: 5, fill: '#6366f1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assets */}
      <div className="p-5 border-t border-slate-100 dark:border-slate-800 mt-2">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Assets</p>
          <button
            onClick={() => { setShowAddAsset(s => !s); setShowAddLiability(false); }}
            className="text-[10px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            {showAddAsset ? <X size={10} /> : <Plus size={10} />}
            {showAddAsset ? 'Cancel' : 'Add'}
          </button>
        </div>
        {showAddAsset && (
          <div className="flex gap-2 mb-3 animate-in slide-in-from-top-1 duration-200">
            <input
              placeholder="Asset name"
              className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500 font-semibold transition-all"
              value={assetForm.name}
              onChange={e => setAssetForm(f => ({ ...f, name: e.target.value }))}
            />
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
              <input
                type="number"
                placeholder="Value"
                className="w-24 pl-5 pr-2 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500 font-semibold transition-all"
                value={assetForm.value}
                onChange={e => setAssetForm(f => ({ ...f, value: e.target.value }))}
              />
            </div>
            <button
              onClick={() => {
                if (assetForm.name && assetForm.value) {
                  dispatch({ type: 'ADD_ASSET', payload: { ...assetForm, id: crypto.randomUUID() } });
                  setAssetForm({ name: '', value: '' });
                  setShowAddAsset(false);
                }
              }}
              className="px-3 py-2 bg-emerald-500 text-white text-xs font-black rounded-lg hover:bg-emerald-600 transition-all"
            >
              Add
            </button>
          </div>
        )}
        {assets.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No assets added yet.</p>}
        <ul className="space-y-1.5">
          {assets.map(a => (
            <li key={a.id} className="flex items-center justify-between text-xs font-semibold px-1">
              <span className="text-slate-700 dark:text-slate-300">{a.name}</span>
              <div className="flex items-center gap-2">
                <span className="tnum text-emerald-600 font-black">{formatINR(a.value)}</span>
                <button onClick={() => dispatch({ type: 'DELETE_ASSET', payload: a.id })} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={11} /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Liabilities */}
      <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Liabilities</p>
          <button
            onClick={() => { setShowAddLiability(s => !s); setShowAddAsset(false); }}
            className="text-[10px] font-black uppercase tracking-wider text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            {showAddLiability ? <X size={10} /> : <Plus size={10} />}
            {showAddLiability ? 'Cancel' : 'Add'}
          </button>
        </div>
        {showAddLiability && (
          <div className="flex gap-2 mb-3 animate-in slide-in-from-top-1 duration-200">
            <input
              placeholder="Liability name"
              className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-rose-500 font-semibold transition-all"
              value={liabForm.name}
              onChange={e => setLiabForm(f => ({ ...f, name: e.target.value }))}
            />
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
              <input
                type="number"
                placeholder="Value"
                className="w-24 pl-5 pr-2 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-rose-500 font-semibold transition-all"
                value={liabForm.value}
                onChange={e => setLiabForm(f => ({ ...f, value: e.target.value }))}
              />
            </div>
            <button
              onClick={() => {
                if (liabForm.name && liabForm.value) {
                  dispatch({ type: 'ADD_LIABILITY', payload: { ...liabForm, id: crypto.randomUUID() } });
                  setLiabForm({ name: '', value: '' });
                  setShowAddLiability(false);
                }
              }}
              className="px-3 py-2 bg-rose-500 text-white text-xs font-black rounded-lg hover:bg-rose-600 transition-all"
            >
              Add
            </button>
          </div>
        )}
        {liabilities.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No liabilities added yet.</p>}
        <ul className="space-y-1.5">
          {liabilities.map(l => (
            <li key={l.id} className="flex items-center justify-between text-xs font-semibold px-1">
              <span className="text-slate-700 dark:text-slate-300">{l.name}</span>
              <div className="flex items-center gap-2">
                <span className="tnum text-rose-600 font-black">{formatINR(l.value)}</span>
                <button onClick={() => dispatch({ type: 'DELETE_LIABILITY', payload: l.id })} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={11} /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

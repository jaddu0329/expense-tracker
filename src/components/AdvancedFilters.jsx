import React from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';

export default function AdvancedFilters({ filters, categories, dispatch, isOpen, onClose }) {
  if (!isOpen) return null;

  const update = (payload) => dispatch({ type: 'SET_FILTER', payload });
  const clear  = () => dispatch({ type: 'CLEAR_FILTERS' });

  const activeCount = [
    filters.type !== 'all',
    filters.category !== 'all',
    !!filters.search,
    !!filters.startDate,
    !!filters.endDate,
    !!filters.amountMin,
    !!filters.amountMax,
  ].filter(Boolean).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[90] w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
              <Filter size={14} />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest">Advanced Filters</h4>
              {activeCount > 0 && (
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">{activeCount} active</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button
                onClick={clear}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
              >
                <RotateCcw size={10} /> Reset
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <X size={18} className="text-slate-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Search */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Keyword</label>
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition-all"
              value={filters.search}
              onChange={e => update({ search: e.target.value })}
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Type</label>
            <div className="flex gap-2">
              {['all', 'income', 'expense'].map(t => (
                <button
                  key={t}
                  onClick={() => update({ type: t })}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                    filters.type === t
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600'
                  }`}
                >
                  {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => update({ category: 'all' })}
                className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                  filters.category === 'all'
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600'
                }`}
              >
                All
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => update({ category: c.id })}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                    filters.category === c.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600'
                  }`}
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Date Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] font-bold text-slate-400 mb-1 uppercase">From</p>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 font-semibold transition-all"
                  value={filters.startDate}
                  onChange={e => update({ startDate: e.target.value })}
                />
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 mb-1 uppercase">To</p>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 font-semibold transition-all"
                  value={filters.endDate}
                  onChange={e => update({ endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Amount Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 font-semibold transition-all"
                  value={filters.amountMin}
                  onChange={e => update({ amountMin: e.target.value })}
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 font-semibold transition-all"
                  value={filters.amountMax}
                  onChange={e => update({ amountMax: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Apply */}
        <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
          >
            Apply Filters {activeCount > 0 && `(${activeCount})`}
          </button>
        </div>
      </div>
    </>
  );
}

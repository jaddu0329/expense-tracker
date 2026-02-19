import React, { useState, useMemo } from 'react';
import { X, Search, Trash2, Edit2, Calendar, Filter } from 'lucide-react';
import { formatINR } from '../utils/formatters';
import { fmtDate } from '../utils/dateUtils';
import AdvancedFilters from './AdvancedFilters';

export default function FullHistoryPage({ transactions, categories, filters, dispatch, theme, onClose, onEdit }) {
  const [localSearch, setLocalSearch]     = useState(filters.search || '');
  const [typeFilter, setTypeFilter]       = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder]         = useState('newest');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = transactions.filter(t => {
      const s  = localSearch.toLowerCase();
      const matchSearch   = !s || t.title.toLowerCase().includes(s);
      const matchType     = typeFilter === 'all' || t.type === typeFilter;
      const matchCategory = categoryFilter === 'all' || t.categoryId === categoryFilter;
      const matchMin      = !filters.amountMin || Number(t.amount) >= Number(filters.amountMin);
      const matchMax      = !filters.amountMax || Number(t.amount) <= Number(filters.amountMax);
      const matchStart    = !filters.startDate || t.date >= filters.startDate;
      const matchEnd      = !filters.endDate   || t.date <= filters.endDate;
      return matchSearch && matchType && matchCategory && matchMin && matchMax && matchStart && matchEnd;
    });
    result.sort((a, b) =>
      sortOrder === 'newest'
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );
    return result;
  }, [transactions, localSearch, typeFilter, categoryFilter, sortOrder, filters]);

  const totalIncome  = filtered.filter(t => t.type === 'income') .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(t => {
      const key = fmtDate(t.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-all active:scale-95"
            >
              <X size={22} />
            </button>
            <div>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">Full History 📋</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortOrder(s => s === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-all"
            >
              <Calendar size={16} /> {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            </button>
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-all"
            >
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>
      </header>

      {/* Search + Type Filters */}
      <div className="max-w-5xl mx-auto w-full px-6 py-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-600 text-base font-semibold transition-all"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'income', 'expense'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                  typeFilter === t
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                }`}
              >
                {t === 'all' ? 'All' : t === 'income' ? '💰 Income' : '💸 Expense'}
              </button>
            ))}
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              categoryFilter === 'all'
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'
                : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >All Categories</button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                categoryFilter === c.id
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'
                  : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="max-w-5xl mx-auto w-full px-6 pb-5">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Income',   value: totalIncome,              color: 'text-emerald-500' },
            { label: 'Expenses', value: totalExpense,             color: 'text-rose-500' },
            { label: 'Net',      value: totalIncome - totalExpense, color: totalIncome - totalExpense >= 0 ? 'text-indigo-600' : 'text-rose-500' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{s.label}</p>
              <p className={`text-xl font-black tracking-tight tnum ${s.color}`}>{formatINR(s.value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-8">
        <div className="max-w-5xl mx-auto px-6 space-y-8">
          {Object.keys(grouped).length > 0 ? (
            Object.entries(grouped).map(([date, txns]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">{date}</p>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  <p className="text-xs font-bold text-slate-400 tnum whitespace-nowrap">{txns.length} records</p>
                </div>
                <div className="space-y-3">
                  {txns.map(t => {
                    const category = categories.find(c => c.id === t.categoryId);
                    return (
                      <div
                        key={t.id}
                        className="group flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all hover:shadow-md cursor-pointer"
                        onClick={() => onEdit(t)}
                      >
                        <div className="flex items-center gap-5">
                          <div
                            className="rounded-2xl flex items-center justify-center text-white text-xl shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 w-[3.25rem] h-[3.25rem] flex-shrink-0"
                            style={{ backgroundColor: category?.color || '#94a3b8' }}
                          >
                            {category?.icon || '🏷️'}
                          </div>
                          <div>
                            <p className="text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{t.title}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                              {category?.name || 'General'} • {t.type === 'income' ? 'Income' : 'Expense'}
                              {t.recurring && <span className="ml-2 text-sky-500">↻ {t.frequency}</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-base font-black tracking-tighter tnum ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {t.type === 'income' ? '+' : '-'} {formatINR(t.amount)}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={(e) => { e.stopPropagation(); onEdit(t); }}
                              className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_TRANSACTION', payload: t.id }); }}
                              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-6xl mb-5 opacity-30">🔍</span>
              <p className="font-black text-base uppercase tracking-widest text-slate-400">No transactions found</p>
              <p className="text-sm text-slate-400 mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      <AdvancedFilters
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        categories={categories}
        dispatch={dispatch}
      />
    </div>
  );
}

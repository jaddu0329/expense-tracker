import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, Moon, Sun, Wallet, Target, RefreshCcw,
  TrendingUp, PieChart as PieChartIcon,
  Search, Activity, ArrowRight, Zap, BarChart3,
  Trophy, Filter, ArrowUpRight,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';

import { AppProvider, useAppContext } from './context/AppContext';
import { computeStats, computeSavingsScore, computeAchievements } from './utils/calculations';
import { formatINR } from './utils/formatters';
import { useFinancialInsights } from './hooks/useFinancialInsights';

import SplashScreen       from './components/SplashScreen';
import TransactionModal   from './components/TransactionModal';
import CategoryList       from './components/CategoryList';
import FullHistoryPage    from './components/FullHistoryPage';
import AdvancedFilters    from './components/AdvancedFilters';
import SavingsScore       from './components/SavingsScore';
import AchievementBadges  from './components/AchievementBadges';
import ExportMenu         from './components/ExportMenu';

import SmartInsightsPanel from './features/insights/SmartInsightsPanel';
import FinancialGoals     from './features/goals/FinancialGoals';
import RecurringManager   from './features/recurring/RecurringManager';
import NetWorthTracker    from './features/analytics/NetWorthTracker';
import MonthlyComparison  from './features/analytics/MonthlyComparison';
import CashFlowForecast   from './features/analytics/CashFlowForecast';

import moneyBagImg   from './assets/money-bag.png';
import incomeGoalImg from './assets/income-goal.png';

const CustomStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://api.fontshare.com/v2/css?f[]=satoshi@700,800,900&display=swap');
    body { font-family: 'Satoshi', system-ui, sans-serif; }
    .animate-float-emoji { display: inline-block; }
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
    .card-glow { transition: all 0.25s ease; }
    .card-glow:hover { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); transform: translateY(-2px); }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  `}} />
);

export const Currency = ({ value, className = '' }) => (
  <span className={`tnum ${className}`}>{formatINR(value)}</span>
);

const TABS = [
  { id: 'dashboard',     icon: Wallet,   label: 'Dashboard'    },
  { id: 'analytics',    icon: BarChart3, label: 'Analytics'    },
  { id: 'goals',        icon: Target,    label: 'Goals'        },
  { id: 'achievements', icon: Trophy,    label: 'Achievements' },
];

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

function AppShell() {
  const { state, dispatch } = useAppContext();
  const [loading,     setLoading]     = useState(true);
  const [fadeOut,     setFadeOut]     = useState(false);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editingTx,   setEditingTx]   = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [incomeModal, setIncomeModal] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true),  3900);
    const t2 = setTimeout(() => setLoading(false), 4600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      state.theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {loading && <SplashScreen fadeOut={fadeOut} />}
      <CustomStyles />
      <TopNav
        state={state}
        dispatch={dispatch}
        onAdd={() => { setEditingTx(null); setModalOpen(true); }}
        onFilterOpen={() => setFilterOpen(true)}
        onIncomeModal={() => setIncomeModal(true)}
      />
      <TabBar activeTab={state.activeTab} dispatch={dispatch} theme={state.theme} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {state.activeTab === 'dashboard'     && <DashboardTab    state={state} dispatch={dispatch} onShowHistory={() => setHistoryOpen(true)} onEdit={(t) => { setEditingTx(t); setModalOpen(true); }} />}
        {state.activeTab === 'analytics'    && <AnalyticsTab    state={state} dispatch={dispatch} />}
        {state.activeTab === 'goals'        && <GoalsTab        state={state} dispatch={dispatch} />}
        {state.activeTab === 'achievements' && <AchievementsTab state={state} />}
      </main>

      {historyOpen && (
        <FullHistoryPage
          transactions={state.transactions}
          categories={state.categories}
          filters={state.filters}
          dispatch={dispatch}
          theme={state.theme}
          onClose={() => setHistoryOpen(false)}
          onEdit={(t) => { setEditingTx(t); setModalOpen(true); setHistoryOpen(false); }}
        />
      )}
      {filterOpen && (
        <AdvancedFilters
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
          filters={state.filters}
          categories={state.categories}
          dispatch={dispatch}
        />
      )}
      {incomeModal && (
        <IncomeGoalModal value={state.incomeTarget} dispatch={dispatch} onClose={() => setIncomeModal(false)} incomeGoalImg={incomeGoalImg} />
      )}
      {modalOpen && (
        <TransactionModal
          categories={state.categories}
          editingTransaction={editingTx}
          onClose={() => setModalOpen(false)}
          onSave={(data) => {
            if (editingTx) dispatch({ type: 'EDIT_TRANSACTION', payload: { ...data, id: editingTx.id } });
            else           dispatch({ type: 'ADD_TRANSACTION',  payload: { ...data, id: crypto.randomUUID() } });
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function TopNav({ state, dispatch, onAdd, onFilterOpen, onIncomeModal }) {
  const stats = useMemo(() => computeStats(state.transactions, state.incomeTarget), [state.transactions, state.incomeTarget]);
  const score = useMemo(() => computeSavingsScore(stats), [stats]);
  return (
    <header className="sticky top-0 z-[1000] shadow-lg" style={{ background: 'linear-gradient(135deg, #5B2EFF, #8E54E9)' }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg text-white shadow-lg shadow-black/10"><Wallet size={22} /></div>
          <h1 className="text-xl font-black tracking-tight text-white hidden sm:block">FinTrack<span className="text-white/70">Pro</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/25 bg-white/15 text-white text-xs font-black">
            <Zap size={11} fill="currentColor" /> Score: {score.total}
          </div>
          <button
            onClick={onIncomeModal}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-black text-sm shadow-lg shadow-green-700/30 active:scale-95 transition-all duration-200 ease-in-out hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
          >
            <Target size={15} /> Set Goal
          </button>
          <button onClick={onFilterOpen} className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/10">
            <Filter size={18} />
          </button>
          <ExportMenu transactions={state.transactions} categories={state.categories} stats={stats} score={score} />
          <button onClick={() => dispatch({ type: 'TOGGLE_THEME' })} className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/10">
            {state.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={onAdd} className="bg-white text-[#5B2EFF] hover:bg-white/90 px-5 py-2.5 rounded-xl flex items-center gap-2 font-black shadow-lg shadow-black/20 active:scale-95 transition-all text-sm">
            <Plus size={18} /><span className="hidden sm:inline">Add Record</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function TabBar({ activeTab, dispatch, theme }) {
  const isDark = theme === 'dark';
  return (
    <div
      className="sticky top-16 z-[900] transition-colors duration-300"
      style={{
        background: isDark ? '#0F172A' : '#FFFFFF',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)',
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const activeColor = isDark ? '#8B5CF6' : '#5B2EFF';
            const inactiveColor = isDark ? '#94A3B8' : '#64748B';
            return (
              <button
                key={tab.id}
                onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id })}
                className={`relative flex items-center gap-2 px-5 py-3.5 text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                  isActive ? '' : isDark ? 'hover:text-[#8B5CF6]' : 'hover:text-[#5B2EFF]'
                }`}
                style={{ color: isActive ? activeColor : inactiveColor }}
              >
                {/* Active indicator: purple underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full pointer-events-none" style={{ background: activeColor }} />
                )}
                <span className="relative z-10 flex items-center gap-2"><Icon size={14} />{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DashboardTab({ state, dispatch, onShowHistory }) {
  const stats    = useMemo(() => computeStats(state.transactions, state.incomeTarget), [state.transactions, state.incomeTarget]);
  const insights = useFinancialInsights(state.transactions, state.categories, state.budget, state.incomeTarget, stats);

  const chartData = useMemo(() => {
    const expense = state.transactions.filter(t => t.type === 'expense');
    if (!expense.length) return [{ name: 'No Spending', value: 1, color: '#f1f5f9', isPlaceholder: true }];
    const totals = {};
    expense.forEach(t => {
      const cat = state.categories.find(c => c.id === t.categoryId);
      const name = cat?.name || 'Other';
      totals[name] = (totals[name] || 0) + Number(t.amount);
    });
    return Object.keys(totals).map(name => ({
      name, value: totals[name],
      color:      state.categories.find(c => c.name === name)?.color || '#94a3b8',
      percentage: ((totals[name] / Math.max(stats.totalOutflow, 1)) * 100).toFixed(1),
    }));
  }, [state.transactions, state.categories, stats.totalOutflow]);

  const filteredTx = useMemo(() => {
    const f = state.filters;
    return state.transactions.filter(t => {
      if (f.search     && !t.title.toLowerCase().includes(f.search.toLowerCase())) return false;
      if (f.type !== 'all'     && t.type !== f.type)           return false;
      if (f.category !== 'all' && t.categoryId !== f.category) return false;
      if (f.amountMin  && Number(t.amount) < Number(f.amountMin)) return false;
      if (f.amountMax  && Number(t.amount) > Number(f.amountMax)) return false;
      if (f.startDate  && t.date < f.startDate) return false;
      if (f.endDate    && t.date > f.endDate)   return false;
      return true;
    });
  }, [state.transactions, state.filters]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-8">

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 relative overflow-hidden group cursor-default" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.12) 25%, rgba(255,255,255,0.05) 40%, transparent 55%), linear-gradient(135deg, #16A34A, #22C55E, #15803D)', boxShadow: '0 10px 30px rgba(31,184,116,0.3)', border: '1px solid rgba(31,184,116,0.25)', borderRadius: '16px', overflow: 'hidden', isolation: 'isolate', transition: 'all 0.3s' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 15px 40px rgba(31,184,116,0.4)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 10px 30px rgba(31,184,116,0.3)';}}>            
            <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full opacity-20 blur-2xl" style={{ background: '#22C55E' }} />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-2 bg-white/20 rounded-2xl shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform">
                <img src={moneyBagImg} alt="Income" className="w-8 h-8 object-contain" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                <Zap size={10} fill="currentColor" /> {stats.incomeAchievement}%
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-1">Total Income</p>
              <h3 className="text-3xl font-black text-white tnum">{formatINR(stats.totalIncome)}</h3>
              <p className="text-[10px] text-white/60 font-bold mt-1">Target: {formatINR(state.incomeTarget)}</p>
            </div>
          </div>

          <div className="p-6 relative overflow-hidden group cursor-default" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.12) 25%, rgba(255,255,255,0.05) 40%, transparent 55%), linear-gradient(135deg, #B8860B, #FFD700, #7A5600)', boxShadow: '0 10px 30px rgba(184,134,11,0.35)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: '16px', overflow: 'hidden', isolation: 'isolate', transition: 'all 0.3s' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 15px 40px rgba(184,134,11,0.5)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 10px 30px rgba(184,134,11,0.35)';}}>
            {/* Background glow blob */}
            <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full opacity-20 blur-2xl" style={{ background: '#FFD700' }} />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-2 bg-white/20 rounded-2xl shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform">
                <span className="w-8 h-8 flex items-center justify-center text-[2rem] leading-none" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>📈</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                <Zap size={10} fill="currentColor" /> {stats.investVsLogic.toFixed(0)}% of Plan
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-1">Investments</p>
              <h3 className="text-3xl font-black text-white tnum">{formatINR(stats.totalInvestments)}</h3>
              <p className="text-[10px] text-white/60 font-bold mt-1">Goal: {formatINR(stats.suggestedInvestmentGoal)}</p>
            </div>
          </div>

          <div className="p-6 relative overflow-hidden group cursor-default" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.12) 25%, rgba(255,255,255,0.05) 40%, transparent 55%), linear-gradient(135deg, #5B2EFF, #8E54E9, #3B1A99)', boxShadow: '0 10px 30px rgba(91,46,255,0.35)', border: '1px solid rgba(142,84,233,0.25)', borderRadius: '16px', overflow: 'hidden', isolation: 'isolate', transition: 'all 0.3s' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 15px 40px rgba(91,46,255,0.5)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 10px 30px rgba(91,46,255,0.35)';}}>            
            <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full opacity-20 blur-2xl" style={{ background: '#c4b5fd' }} />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-2 bg-white/20 rounded-2xl shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform">
                <span className="w-8 h-8 flex items-center justify-center text-[2rem] leading-none" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>🏦</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                <Zap size={10} fill="currentColor" /> {stats.savingsRate}% Rate
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-1">Net Savings</p>
              <h3 className="text-3xl font-black text-white tnum">
                {stats.balance < 0 ? '-' : ''}{formatINR(Math.abs(stats.balance))}
              </h3>
              <p className="text-[10px] text-white/60 font-bold mt-1">{stats.savingsRate >= 20 ? 'Target Achieved ✓' : 'Target: 20% Rate'}</p>
            </div>
          </div>
        </div>

        {/* 70/20/10 Strategy */}
        <div className="rounded-[2.5rem] p-8 shadow-lg relative text-white" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/20"><TrendingUp size={18} /></div> Financial Strategy (70/20/10)
              </h2>
              <p className="text-sm text-indigo-100 mt-1 font-medium italic">For Income Goal: {formatINR(state.incomeTarget)}</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-white/30"/>Plan</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"/>Actual</span>
            </div>
          </div>
          <div className="space-y-8 relative z-10">
            {[
              { label: 'Needs & Expenses ', sub: 'Max 70%',  actual: stats.totalExpenses,    limit: stats.suggestedExpenseLimit,   pct: stats.expenseVsLogic  },
              { label: 'Investment Goal ',  sub: 'Ideal 20%', actual: stats.totalInvestments, limit: stats.suggestedInvestmentGoal, pct: stats.investVsLogic   },
              { label: 'Emergency Buffer ', sub: 'Safe 10%',  actual: stats.balance,          limit: stats.suggestedBuffer,         pct: stats.bufferVsLogic   },
            ].map(row => (
              <div key={row.label} className="space-y-3">
                <div className="flex justify-between text-sm items-end">
                  <span className="font-bold flex items-center gap-2">{row.label} <span className="text-[10px] text-indigo-200 font-normal">({row.sub})</span></span>
                  <span className="text-xs font-black tnum"><span className="text-indigo-200">{formatINR(row.actual)}</span> / <span className="text-white">{formatINR(row.limit)}</span></span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden p-0.5">
                  <div className={`h-full transition-all duration-1000 rounded-full ${row.pct > 100 ? 'bg-rose-400' : 'bg-white'}`} style={{ width: `${Math.min(row.pct, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts + Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black text-sm uppercase tracking-widest flex items-center gap-2"><PieChartIcon size={18} className="text-indigo-600" /> Spending Pattern</h4>
            </div>
            <div className="h-64 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} innerRadius={72} outerRadius={100} paddingAngle={6} dataKey="value" stroke="none" cornerRadius={10} animationBegin={200} animationDuration={1200} cx="50%" cy="45%">
                    {chartData.map((e, i) => <Cell key={i} fill={e.color} style={{ filter: `drop-shadow(0 0 8px ${e.color}44)` }} />)}
                  </Pie>
                  <Tooltip formatter={(v,n,p) => [formatINR(v), `${n} (${p.payload.percentage||0}%)`]} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px -12px rgba(0,0,0,.15)', fontSize: 12, fontWeight: 800 }} />
                  <Legend verticalAlign="bottom" iconType="circle" formatter={(v) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-28 text-center">
                {stats.totalOutflow > 0 ? <><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Spent</p><p className="text-xl font-black tnum">{((stats.totalOutflow/Math.max(stats.totalIncome,stats.totalOutflow))*100).toFixed(0)}%</p></> : <span className="text-3xl"></span>}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2"><Activity size={18} className="text-indigo-600" /><h4 className="font-black text-sm uppercase tracking-widest">Recent Activity</h4></div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <input type="text" placeholder="Find..." className="pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-indigo-600 outline-none text-xs font-bold transition-all w-36" value={state.filters.search} onChange={e => dispatch({ type: 'SET_FILTER', payload: { search: e.target.value } })} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[320px] custom-scrollbar">
              {filteredTx.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {filteredTx.slice(0,10).map((t,i) => {
                      const cat = state.categories.find(c => c.id === t.categoryId);
                      return (
                        <tr key={t.id} className="group/row hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all cursor-default animate-in fade-in slide-in-from-bottom-1" style={{ animationDelay: `${i*40}ms`, animationFillMode: 'both' }}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base shadow-sm group-hover/row:scale-110 group-hover/row:rotate-6 transition-all duration-300" style={{ backgroundColor: cat?.color || '#94a3b8' }}>{cat?.icon || ''}</div>
                              <div>
                                <span className="text-sm font-black text-slate-900 dark:text-white group-hover/row:text-indigo-600 transition-colors line-clamp-1">{t.title}</span>
                                <span className="text-[10px] font-bold uppercase text-slate-400">{new Date(t.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}  {cat?.name||'General'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right"><span className={`text-sm font-black tnum ${t.type==='income' ? 'text-emerald-500' : 'text-rose-500'}`}>{t.type==='income' ? '+' : '-'}{formatINR(t.amount)}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-10 text-center"><span className="text-4xl opacity-30 block mb-3"></span><p className="font-black text-sm text-slate-400">No transactions found</p></div>
              )}
            </div>
            {filteredTx.length > 0 && (
              <button onClick={onShowHistory} className="p-4 bg-slate-50/50 dark:bg-slate-800/20 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 border-t border-slate-100 dark:border-slate-800">
                Full History <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>

        <SmartInsightsPanel insights={insights} />
      </div>

      {/* Sidebar */}
      <aside className="lg:col-span-4 space-y-6">
        <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500"><ArrowUpRight size={80} strokeWidth={3} /></div>
          <h4 className="text-lg font-bold mb-2 flex items-center gap-2">Plan Setup </h4>
          <p className="text-indigo-100 text-xs mb-6 leading-relaxed font-medium">Set your monthly income target and we build your strategy.</p>
          <div className="space-y-5 relative z-10">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-indigo-300 block mb-2">Monthly Income Goal</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-indigo-200 text-xl">₹</span>
                <input type="number" value={state.incomeTarget||''} onChange={e=>dispatch({type:'SET_INCOME_TARGET',payload:e.target.value===''?0:parseInt(e.target.value)||0})} className="w-full pl-10 pr-4 py-4 bg-white/10 border-2 border-white/10 rounded-2xl outline-none focus:border-white/40 focus:bg-white/20 transition-all font-bold text-2xl" />
              </div>
              <p className="text-[10px] text-indigo-200 font-medium text-right mt-1">{formatINR(state.incomeTarget)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{label:'Invest Aim ',val:computeStats(state.transactions,state.incomeTarget).suggestedInvestmentGoal},{label:'Needs Cap ',val:computeStats(state.transactions,state.incomeTarget).suggestedExpenseLimit}].map(item=>(
                <div key={item.label} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <p className="text-[9px] text-indigo-200 font-black uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="font-bold text-sm tnum">{formatINR(item.val)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <CategoryList categories={state.categories} onAdd={cat=>dispatch({type:'ADD_CATEGORY',payload:cat})} onDelete={id=>dispatch({type:'DELETE_CATEGORY',payload:id})} />
        <button onClick={()=>dispatch({type:'RESET_ALL'})} className="w-full flex items-center justify-center gap-2 p-4 bg-red-600 hover:bg-red-700 text-white rounded-[1.5rem] text-sm font-bold transition-all active:scale-95">
          <RefreshCcw size={14} /> Reset All Data
        </button>
      </aside>
    </div>
  );
}

function AnalyticsTab({ state, dispatch }) {
  const stats = useMemo(() => computeStats(state.transactions, state.incomeTarget), [state.transactions, state.incomeTarget]);
  const score = useMemo(() => computeSavingsScore(stats), [stats]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-8">
        <MonthlyComparison transactions={state.transactions} mode={state.comparisonMode} customRange={state.comparisonRange} dispatch={dispatch} />
        <CashFlowForecast transactions={state.transactions} />
      </div>
      <div className="lg:col-span-4 space-y-6">
        <SavingsScore score={score} />
        <NetWorthTracker assets={state.assets} liabilities={state.liabilities} transactions={state.transactions} dispatch={dispatch} netWorthHistory={state.netWorthHistory} />
      </div>
    </div>
  );
}

function GoalsTab({ state, dispatch }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8"><FinancialGoals goals={state.goals} dispatch={dispatch} /></div>
      <div className="lg:col-span-4"><RecurringManager transactions={state.transactions} categories={state.categories} dispatch={dispatch} /></div>
    </div>
  );
}

function AchievementsTab({ state }) {
  const stats        = useMemo(() => computeStats(state.transactions, state.incomeTarget), [state.transactions, state.incomeTarget]);
  const score        = useMemo(() => computeSavingsScore(stats), [stats]);
  const achievements = useMemo(() => computeAchievements(state.transactions, stats), [state.transactions, stats]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8"><AchievementBadges achievements={achievements} /></div>
      <div className="lg:col-span-4"><SavingsScore score={score} /></div>
    </div>
  );
}

function IncomeGoalModal({ value, dispatch, onClose, incomeGoalImg }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] shadow-2xl p-10 border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-300">
        <div className="bg-emerald-500 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 mx-auto shadow-xl shadow-emerald-500/40">
          <img src={incomeGoalImg} alt="Income Goal" className="w-10 h-10 object-contain" />
        </div>
        <h3 className="text-2xl font-black mb-2 text-center">Set Income Goal</h3>
        <p className="text-slate-500 text-center text-sm mb-8">What is your monthly income target?</p>
        <div className="space-y-6">
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-2xl">₹</span>
            <input autoFocus type="number" placeholder="0" className="w-full pl-12 pr-6 py-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] outline-none border-2 border-transparent focus:border-indigo-600 transition-all font-black text-4xl tnum" value={value||''} onChange={e=>dispatch({type:'SET_INCOME_TARGET',payload:e.target.value===''?0:parseInt(e.target.value)||0})} />
          </div>
          <p className="text-sm font-bold text-center text-slate-400">{formatINR(value)}</p>
          <button onClick={onClose} className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-all text-lg">Save Strategy </button>
        </div>
      </div>
    </div>
  );
}

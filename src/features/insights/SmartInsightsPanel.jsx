import React, { useState } from 'react';
import { Zap, ChevronDown, ChevronUp } from 'lucide-react';

const SEVERITY_STYLES = {
  danger:  { bg: 'bg-rose-50 dark:bg-rose-900/20',    border: 'border-rose-200 dark:border-rose-800',    dot: 'bg-rose-500',    text: 'text-rose-700 dark:text-rose-300' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-900/20',  border: 'border-amber-200 dark:border-amber-800',  dot: 'bg-amber-500',   text: 'text-amber-700 dark:text-amber-300' },
  success: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
  info:    { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800', dot: 'bg-indigo-500',  text: 'text-indigo-700 dark:text-indigo-300' },
};

export default function SmartInsightsPanel({ insights }) {
  const [expanded, setExpanded] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4);

  if (!insights || insights.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
        <span className="text-4xl block mb-3">🤖</span>
        <p className="text-sm font-black uppercase tracking-widest text-slate-400">No Insights Yet</p>
        <p className="text-xs text-slate-400 mt-1">Add some transactions to unlock AI-style analysis.</p>
      </div>
    );
  }

  const visible = insights.slice(0, visibleCount);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <Zap size={16} fill="currentColor" />
          </div>
          <div className="text-left">
            <h4 className="font-black text-sm uppercase tracking-widest">Smart Insights</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {insights.length} insight{insights.length !== 1 ? 's' : ''} generated
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-full uppercase tracking-wider">AI</span>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {/* Insights List */}
      {expanded && (
        <div className="px-6 pb-6 space-y-3">
          {visible.map((insight, i) => {
            const s = SEVERITY_STYLES[insight.type] || SEVERITY_STYLES.info;
            return (
              <div
                key={insight.id}
                className={`flex items-start gap-3 p-4 rounded-2xl border ${s.bg} ${s.border} animate-in fade-in slide-in-from-bottom-1`}
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              >
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{insight.emoji}</span>
                    <p className={`text-xs font-black uppercase tracking-wider ${s.text}`}>{insight.title}</p>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{insight.message}</p>
                </div>
              </div>
            );
          })}

          {insights.length > 4 && visibleCount < insights.length && (
            <button
              onClick={() => setVisibleCount(insights.length)}
              className="w-full text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 py-2 transition-colors"
            >
              Show {insights.length - visibleCount} more insights ↓
            </button>
          )}
          {visibleCount > 4 && (
            <button
              onClick={() => setVisibleCount(4)}
              className="w-full text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 py-2 transition-colors"
            >
              Collapse ↑
            </button>
          )}
        </div>
      )}
    </div>
  );
}

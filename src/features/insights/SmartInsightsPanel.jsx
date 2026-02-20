import React, { useState } from 'react';
import { Zap, ChevronDown, ChevronUp } from 'lucide-react';

const SEVERITY_STYLES = {
  success: {
    gradient: 'linear-gradient(135deg, #16A34A, #22C55E)',
    shadow: '0 6px 20px rgba(22,163,74,0.3)',
    border: '1px solid rgba(34,197,94,0.4)',
  },
  warning: {
    gradient: 'linear-gradient(135deg, #B8860B, #FFD700)',
    shadow: '0 6px 20px rgba(184,134,11,0.3)',
    border: '1px solid rgba(255,215,0,0.4)',
  },
  info: {
    gradient: 'linear-gradient(135deg, #5B2EFF, #8E54E9)',
    shadow: '0 6px 20px rgba(91,46,255,0.3)',
    border: '1px solid rgba(142,84,233,0.4)',
  },
  danger: {
    gradient: 'linear-gradient(135deg, #4338CA, #6366F1)',
    shadow: '0 6px 20px rgba(67,56,202,0.3)',
    border: '1px solid rgba(99,102,241,0.4)',
  },
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
          <div className="p-2 rounded-xl text-white shadow-lg shadow-green-500/20" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}>
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
          <span className="px-2.5 py-1 bg-violet-100 dark:bg-violet-900/30 text-[#5B2EFF] dark:text-violet-400 text-[10px] font-black rounded-full uppercase tracking-wider">AI</span>
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
                className="flex items-start gap-3 p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-1"
                style={{
                  animationDelay: `${i * 60}ms`,
                  animationFillMode: 'both',
                  background: s.gradient,
                  border: s.border,
                  boxShadow: s.shadow,
                }}
              >
                <div className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0 bg-white/40" />
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{insight.emoji}</span>
                    <p className="text-xs font-black uppercase tracking-wider text-white">{insight.title}</p>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">{insight.message}</p>
                </div>
              </div>
            );
          })}

          {insights.length > 4 && visibleCount < insights.length && (
            <button
              onClick={() => setVisibleCount(insights.length)}
              className="w-full text-[11px] font-black uppercase tracking-widest text-[#5B2EFF] hover:text-violet-700 py-2 transition-colors"
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

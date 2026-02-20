import React from 'react';
import { Zap } from 'lucide-react';

/**
 * Circular progress indicator used for the Financial Health / Savings Score.
 * Animated SVG ring with colour-coded gradient.
 */
export default function SavingsScore({ score }) {
  const { total, grade, label, color, breakdown } = score;
  const radius = 52;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (total / 100) * circ;

  const breakdownItems = [
    { label: 'Budget Adherence', pts: breakdown.budgetScore,  max: 25, barColor: null },
    { label: 'Savings Rate',     pts: breakdown.savingsScore, max: 25, barColor: '#22C55E' },
    { label: 'Investments',      pts: breakdown.investScore,  max: 25, barColor: '#8E54E9' },
    { label: 'Emergency Buffer', pts: breakdown.bufferScore,  max: 25, barColor: null },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)', boxShadow: '0 4px 12px rgba(22,163,74,0.35)' }}>
            <Zap size={16} fill="currentColor" />
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest">Financial Health Score</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">0–100 performance index</p>
          </div>
        </div>

        {/* Circular Progress */}
        <div className="flex items-center gap-6 mb-5">
          <div className="relative flex-shrink-0">
            <svg width="132" height="132" className="-rotate-90">
              {/* Track */}
              <circle cx="66" cy="66" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10" className="dark:stroke-slate-800" />
              {/* Progress */}
              <circle
                cx="66" cy="66" r={radius}
                fill="none"
                stroke={color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 8px ${color}66)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black tnum" style={{ color }}>{total}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Score</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-2">
              <span className="text-4xl font-black" style={{ color }}>{grade}</span>
              <span className="ml-2 text-sm font-black text-slate-600 dark:text-slate-300">{label}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {total >= 80 ? "You're managing finances exceptionally well. Keep investing consistently." :
               total >= 60 ? "Good financial health. Focus on increasing your investment ratio." :
               total >= 40 ? "Room for improvement. Try reducing unnecessary expenses." :
               total >= 20 ? "Needs attention. Start by building an emergency buffer." :
               "Critical state. Prioritize budget control immediately."}
            </p>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="space-y-3">
          {breakdownItems.map(item => (
            <div key={item.label}>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-1">
                <span className="text-slate-400">{item.label}</span>
                <span className="text-slate-600 dark:text-slate-300">{item.pts}/{item.max}</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(item.pts / item.max) * 100}%`, backgroundColor: item.barColor || color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

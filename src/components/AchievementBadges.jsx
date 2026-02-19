import React from 'react';
import { Award } from 'lucide-react';

export default function AchievementBadges({ achievements }) {
  const earned = achievements.filter(a => a.earned);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
          <Award size={16} />
        </div>
        <div>
          <h4 className="font-black text-sm uppercase tracking-widest">Achievements</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            {earned.length}/{achievements.length} unlocked
          </p>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 gap-3">
        {achievements.map((a, i) => (
          <div
            key={a.id}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all animate-in fade-in`}
            style={{
              animationDelay: `${i * 60}ms`,
              animationFillMode: 'both',
              background: a.earned
                ? 'linear-gradient(135deg, #fffbeb, #fef3c7)'
                : undefined,
              border: a.earned
                ? '1px solid #fde68a'
                : undefined,
            }}
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm transition-all ${
                a.earned
                  ? 'scale-110'
                  : 'grayscale opacity-40'
              }`}
              style={{ background: a.earned ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#f1f5f9' }}
            >
              {a.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-black uppercase tracking-wider truncate ${a.earned ? 'text-amber-800' : 'text-slate-400'}`}>
                {a.title}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                {a.desc}
              </p>
            </div>
            {a.earned && (
              <span className="text-[9px] font-black uppercase tracking-widest bg-amber-400 text-amber-900 px-2 py-1 rounded-full flex-shrink-0">
                Unlocked
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

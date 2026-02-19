import React, { useState } from 'react';
import { Tag, Plus, X } from 'lucide-react';
import { EMOJI_OPTIONS } from '../context/AppContext';

export default function CategoryList({ categories, onAdd, onDelete }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat]   = useState({ name: '', color: '#6366f1', type: 'expense', icon: '🏷️' });

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold flex items-center gap-2">
          <Tag size={18} className="text-indigo-500" /> Categories
        </h4>
        <button
          onClick={() => setShowAdd(s => !s)}
          className="flex items-center gap-1 text-xs font-black px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 rounded-lg transition-all"
        >
          {showAdd ? <X size={11} /> : <Plus size={11} />}
          {showAdd ? 'Close' : 'Add'}
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-slate-100 dark:bg-slate-800 border-2"
                style={{ borderColor: cat.color }}
              >
                {cat.icon || '🏷️'}
              </div>
              <div>
                <span className="text-xs font-semibold block">{cat.name}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400">{cat.type}</span>
              </div>
            </div>
            {showAdd && (
              <button
                onClick={() => onDelete(cat.id)}
                className="p-1 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
              >
                <X size={13} />
              </button>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in slide-in-from-top-2 duration-300">
          <input
            type="text"
            placeholder="Category name..."
            className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl outline-none border border-transparent focus:border-indigo-600 transition-all font-semibold"
            value={newCat.name}
            onChange={e => setNewCat(c => ({ ...c, name: e.target.value }))}
          />
          <div className="flex gap-2 items-center">
            {/* Emoji picker */}
            <div className="relative group/emoji">
              <button className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg hover:scale-110 transition-transform">
                {newCat.icon}
              </button>
              <div className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 hidden group-hover/emoji:grid grid-cols-4 gap-1 w-48 z-50">
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNewCat(c => ({ ...c, icon: emoji }))}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-lg transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <input
              type="color"
              className="w-10 h-10 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 bg-transparent cursor-pointer"
              value={newCat.color}
              onChange={e => setNewCat(c => ({ ...c, color: e.target.value }))}
            />

            {/* Type toggle */}
            <select
              className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-slate-700 dark:text-slate-300"
              value={newCat.type}
              onChange={e => setNewCat(c => ({ ...c, type: e.target.value }))}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

            <button
              onClick={() => {
                if (newCat.name) {
                  onAdd({ ...newCat, id: crypto.randomUUID() });
                  setNewCat({ name: '', color: '#6366f1', type: 'expense', icon: '🏷️' });
                }
              }}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
            >
              ✨ Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

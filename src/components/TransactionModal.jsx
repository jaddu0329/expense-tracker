import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, RefreshCcw } from 'lucide-react';
import { formatINR } from '../utils/formatters';
import { EMOJI_OPTIONS } from '../context/AppContext';

const FREQ_OPTIONS = [
  { value: 'weekly',  label: '📅 Weekly' },
  { value: 'monthly', label: '🗓️ Monthly' },
  { value: 'yearly',  label: '🎂 Yearly' },
];

function calcNextDate(dateStr, frequency) {
  const d = new Date(dateStr);
  if (frequency === 'weekly')  d.setDate(d.getDate() + 7);
  if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
  if (frequency === 'yearly')  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

export default function TransactionModal({ onClose, categories, editingTransaction, onSave }) {
  const defaultDate = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState(
    editingTransaction || {
      title: '', amount: '', type: 'expense',
      categoryId: categories.find(c => c.type === 'expense')?.id || '',
      date: defaultDate,
      recurring: false,
      frequency: 'monthly',
      nextDate: '',
    }
  );
  const [catOpen, setCatOpen] = useState(false);

  const filteredCats = categories.filter(c => c.type === form.type);
  const selectedCat  = filteredCats.find(c => c.id === form.categoryId) || filteredCats[0];
  const inc          = form.type === 'income';

  const handleTypeChange = (type) => {
    const firstCat = categories.find(c => c.type === type);
    setForm(f => ({ ...f, type, categoryId: firstCat?.id || '' }));
  };

  const handleSave = () => {
    if (!form.title || !form.amount) return;
    const payload = {
      ...form,
      categoryId: selectedCat?.id || form.categoryId,
    };
    if (form.recurring && form.frequency) {
      payload.nextDate = calcNextDate(form.date, form.frequency);
    } else {
      payload.nextDate = undefined;
    }
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 dark:bg-slate-950/70 backdrop-blur-md" onClick={onClose} />
      <button
        onClick={onClose}
        className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 font-semibold text-sm shadow-lg transition-all active:scale-95"
      >
        <ArrowLeft size={16} /> Back
      </button>
      <div className="relative w-full max-w-sm flex flex-col">

        <div className="bg-white dark:bg-slate-900 w-full rounded-[3rem] shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-200">
          <h3 className="text-xl font-black mb-4 flex items-center gap-2">
            {editingTransaction ? 'Edit Transaction ✏️' : 'New Transaction ✨'}
          </h3>

          {/* Type toggle */}
          <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] mb-4">
            <button
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-2.5 text-sm font-black rounded-2xl transition-all ${form.type === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              Expense 💸
            </button>
            <button
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-2.5 text-sm font-black rounded-2xl transition-all ${form.type === 'income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              Income 🤑
            </button>
          </div>

          <div className="space-y-3">
            {/* Amount */}
            <div>
              <label className="text-xs uppercase font-black tracking-widest text-slate-400 ml-1 mb-2 block">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">₹</span>
                <input
                  autoFocus
                  type="number"
                  className="w-full pl-10 pr-5 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-300 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 transition-all font-bold text-xl tnum"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0"
                />
                {form.amount && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400/60 pointer-events-none">
                    {formatINR(form.amount)}
                  </span>
                )}
              </div>
            </div>

            {/* Category + Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase font-black tracking-widest text-slate-400 ml-1 mb-2 block">Category</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCatOpen(o => !o)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border-2 border-transparent hover:border-indigo-400 outline-none font-semibold text-sm flex items-center justify-between transition-all"
                  >
                    <span>{selectedCat?.icon} {selectedCat?.name}</span>
                    <ChevronDown size={15} className={`text-slate-400 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {catOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-150">
                      {filteredCats.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setForm(f => ({ ...f, categoryId: c.id })); setCatOpen(false); }}
                          className={`w-full px-4 py-3.5 text-left text-sm font-semibold transition-all flex items-center gap-2 ${
                            form.categoryId === c.id
                              ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span>{c.icon}</span> {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs uppercase font-black tracking-widest text-slate-400 ml-1 mb-2 block">Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 transition-all font-semibold text-sm"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>

            {/* Recurring Toggle */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCcw size={14} className={form.recurring ? 'text-sky-500' : 'text-slate-400'} />
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200">Recurring</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, recurring: !f.recurring }))}
                  className={`relative w-10 h-6 rounded-full transition-colors ${form.recurring ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.recurring ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>

              {form.recurring && (
                <div className="mt-4 animate-in slide-in-from-top-1 duration-200">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Frequency</label>
                  <div className="flex gap-2">
                    {FREQ_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, frequency: opt.value }))}
                        className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                          form.frequency === opt.value
                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                            : 'bg-white dark:bg-slate-700 text-slate-500 border border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-2">
                    Next occurrence: <strong>{form.date ? calcNextDate(form.date, form.frequency) : '—'}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-xs uppercase font-black tracking-widest text-slate-400 ml-1 mb-2 block">Description</label>
              <input
                type="text"
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 transition-all font-semibold text-base"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="What is this for?"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`w-full font-black text-lg py-4 rounded-[2rem] shadow-xl mt-5 active:scale-95 transition-all text-white ${
              inc
                ? 'bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-600'
                : 'bg-rose-500 shadow-rose-500/30 hover:bg-rose-600'
            }`}
          >
            {editingTransaction ? 'Save Changes ✅' : 'Add Transaction ✅'}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Camera, ChevronDown } from 'lucide-react';
import { exportCSV, exportPDF, exportSnapshotPDF } from '../utils/exportUtils';

export default function ExportMenu({ transactions, categories, stats, score }) {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const items = [
    {
      icon: FileSpreadsheet,
      label: 'Export as CSV',
      sub:   'All transactions in spreadsheet format',
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
      action: () => { exportCSV(transactions, categories); setOpen(false); },
    },
    {
      icon: FileText,
      label: 'Monthly PDF Report',
      sub:   'Full transaction report with summary',
      color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30',
      action: () => { exportPDF(transactions, categories, stats); setOpen(false); },
    },
    {
      icon: Camera,
      label: 'Snapshot Report',
      sub:   'Quick financial health snapshot PDF',
      color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30',
      action: () => { exportSnapshotPDF(stats, score); setOpen(false); },
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-sm font-black border border-white/10 active:scale-95 transition-all"
      >
        <Download size={14} />
        Export
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in zoom-in-95 fade-in duration-150">
          <div className="p-2">
            {items.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group"
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${item.color}`}>
                  <item.icon size={14} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{item.label}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

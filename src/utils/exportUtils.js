import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatINR } from './formatters';
import { fmtDate } from './dateUtils';

// ─── CSV ──────────────────────────────────────────────────────────────────────
export function exportCSV(transactions, categories) {
  const header = ['Date', 'Title', 'Type', 'Category', 'Amount (INR)'];
  const rows = transactions.map(t => {
    const cat = categories.find(c => c.id === t.categoryId);
    return [
      fmtDate(t.date),
      t.title,
      t.type,
      cat?.name || 'General',
      Number(t.amount),
    ];
  });
  const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  download(csv, `FinTrackPro_transactions_${yyyymm()}.csv`, 'text/csv');
}

// ─── PDF FULL REPORT ──────────────────────────────────────────────────────────
export function exportPDF(transactions, categories, stats) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FinTrack Pro — Monthly Report', 14, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}`, 14, 25);

  // Summary cards
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Summary', 14, 40);

  const summary = [
    ['Total Income',      formatINR(stats.totalIncome)],
    ['Total Expenses',    formatINR(stats.totalExpenses)],
    ['Total Investments', formatINR(stats.totalInvestments)],
    ['Net Savings',       formatINR(stats.balance)],
    ['Savings Rate',      `${stats.savingsRate}%`],
  ];

  autoTable(doc, {
    startY: 44,
    head: [['Metric', 'Value']],
    body: summary,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10 },
    columnStyles: { 1: { halign: 'right' } },
  });

  // Transaction table
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [['Date', 'Title', 'Category', 'Type', 'Amount']],
    body: transactions.slice(0, 100).map(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      return [
        fmtDate(t.date),
        t.title,
        cat?.name || 'General',
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        (t.type === 'income' ? '+' : '-') + formatINR(t.amount),
      ];
    }),
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9 },
    columnStyles: { 4: { halign: 'right' } },
  });

  doc.save(`FinTrackPro_report_${yyyymm()}.pdf`);
}

// ─── SNAPSHOT ─────────────────────────────────────────────────────────────────
export function exportSnapshotPDF(stats, score) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 297, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FinTrack Pro — Financial Snapshot', 14, 16);

  const body = [
    ['Income',      formatINR(stats.totalIncome)],
    ['Expenses',    formatINR(stats.totalExpenses)],
    ['Investments', formatINR(stats.totalInvestments)],
    ['Net Savings', formatINR(stats.balance)],
    ['Savings Rate',`${stats.savingsRate}%`],
    ['Health Score',`${score.total}/100 (${score.label})`],
  ];

  autoTable(doc, {
    startY: 32,
    head: [['Category', 'Amount']],
    body,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    styles: { fontSize: 11 },
    columnStyles: { 1: { halign: 'right' } },
  });

  doc.save(`FinTrackPro_snapshot_${yyyymm()}.pdf`);
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function download(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function yyyymm() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
}

import React, { useState, useEffect } from 'react';
import { listSavedPestIds, loadProtocol, isProtocolFilled, loadAllProtocols } from './organicData.js';
import { ALL_PESTS } from './data/index.js';

/**
 * Status banner shown to the editor user — tracks how many pests have organic protocols.
 * Re-reads localStorage when `tick` prop changes (called from parent after each save).
 */
export function EditorProgressBanner({ tick }) {
  const [stats, setStats] = useState({ total: 0, filled: 0, draft: 0 });

  useEffect(() => {
    const ids = listSavedPestIds();
    let filled = 0;
    let draft = 0;
    for (const id of ids) {
      const p = loadProtocol(id);
      if (isProtocolFilled(p)) filled++;
      else if (p) draft++;
    }
    setStats({ total: ALL_PESTS.length, filled, draft });
  }, [tick]);

  const pct = stats.total ? Math.round((stats.filled / stats.total) * 100) : 0;

  return (
    <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 md:p-5 mb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🌱</span>
            <h3 className="font-black text-purple-900 text-base md:text-lg uppercase tracking-wider">
              Organic Protocol Editor — Internal Build
            </h3>
          </div>
          <p className="text-sm text-purple-800">
            <span className="font-bold">{stats.filled}</span> of <span className="font-bold">{stats.total}</span> pests have an organic protocol
            {stats.draft > 0 && <span className="text-purple-600"> · {stats.draft} draft(s)</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-32 md:w-40 h-2.5 bg-purple-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-500"
              style={{ width: `${pct}%` }}
            ></div>
          </div>
          <span className="font-black text-purple-900 text-lg md:text-xl whitespace-nowrap">{pct}%</span>
          <ExportButton tick={tick} />
        </div>
      </div>
    </div>
  );
}

/**
 * Export-all button — generates CSV from all saved protocols.
 * Excel-compatible UTF-8 with BOM so Chinese characters display correctly.
 */
function ExportButton({ tick }) {
  const [downloading, setDownloading] = useState(false);

  const handleExport = (format) => {
    setDownloading(true);
    try {
      const protocols = loadAllProtocols();
      if (protocols.length === 0) {
        alert('No protocols saved yet — nothing to export.');
        setDownloading(false);
        return;
      }
      const rows = buildExportRows(protocols);
      if (format === 'csv') {
        downloadCSV(rows);
      } else {
        downloadXLSX(rows);
      }
    } catch (e) {
      console.error('Export failed:', e);
      alert('Export failed: ' + e.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative group">
      <button
        disabled={downloading}
        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-md transition-colors flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Export
      </button>
      <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 min-w-[140px]">
        <button
          onClick={() => handleExport('csv')}
          className="block w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-purple-50"
        >
          Export as CSV
        </button>
        <button
          onClick={() => handleExport('xlsx')}
          className="block w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-purple-50 border-t border-slate-100"
        >
          Export as Excel
        </button>
      </div>
    </div>
  );
}

/**
 * Build the flat row representation for export.
 * Schema (one row per phase/product combo):
 *   pest_id, pest_common_en, pest_common_zh, pest_scientific,
 *   phase, kind (product/adjuvant), seq,
 *   name, dosage, application_notes, phi, certification,
 *   pest_notes (general agronomist notes for this pest), updated_at
 */
function buildExportRows(protocols) {
  const headers = [
    'pest_id', 'pest_common_en', 'pest_common_zh', 'pest_scientific',
    'phase', 'kind', 'seq',
    'name', 'dosage', 'application_notes', 'phi', 'certification',
    'pest_notes', 'updated_at',
  ];
  const rows = [headers];

  for (const p of protocols) {
    const pest = ALL_PESTS.find(x => x.id === p.pestId);
    if (!pest) continue;
    const commonEn = pest.common?.en || '';
    const commonZh = pest.common?.zh || '';
    const scientific = pest.scientific || '';
    const updatedAt = p.updatedAt ? new Date(p.updatedAt).toISOString() : '';

    let emittedAnyRow = false;

    for (let phaseIdx = 0; phaseIdx < p.phases.length; phaseIdx++) {
      const phase = p.phases[phaseIdx];
      const phaseNum = phaseIdx + 1;

      phase.products?.forEach((prod, prodIdx) => {
        rows.push([
          p.pestId, commonEn, commonZh, scientific,
          phaseNum, 'product', prodIdx + 1,
          prod.name || '', prod.dosage || '', prod.applicationNotes || '',
          prod.phi || '', prod.certification || '',
          p.notes || '', updatedAt,
        ]);
        emittedAnyRow = true;
      });

      if (phase.adjuvant && phase.adjuvant.name) {
        rows.push([
          p.pestId, commonEn, commonZh, scientific,
          phaseNum, 'adjuvant', 1,
          phase.adjuvant.name, phase.adjuvant.dosage || '',
          phase.adjuvant.applicationNotes || '',
          '', '',
          p.notes || '', updatedAt,
        ]);
        emittedAnyRow = true;
      }
    }

    // If the protocol exists but has no products/adjuvants, still emit a stub row so notes are captured
    if (!emittedAnyRow && (p.notes || '').trim()) {
      rows.push([
        p.pestId, commonEn, commonZh, scientific,
        '', 'notes-only', '',
        '', '', '', '', '',
        p.notes, updatedAt,
      ]);
    }
  }

  return rows;
}

function csvEscape(v) {
  const s = String(v == null ? '' : v);
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function downloadCSV(rows) {
  // UTF-8 BOM ensures Excel opens Chinese characters correctly
  const BOM = '\uFEFF';
  const text = BOM + rows.map(r => r.map(csvEscape).join(',')).join('\r\n');
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, `organic-protocols-${todayString()}.csv`);
}

function downloadXLSX(rows) {
  // Excel can open CSV with .xlsx extension only if you use proper XLSX format.
  // Since we don't want to import a heavy library, we use a workaround:
  // a TSV with .xls extension (Excel opens TSV/.xls natively).
  // Note: the agronomist gets a file Excel handles, with sheets and styling unavailable —
  // it's effectively a tabular export. Good enough for review/import.
  const BOM = '\uFEFF';
  const text = BOM + rows.map(r => r.map(tsvEscape).join('\t')).join('\r\n');
  const blob = new Blob([text], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  triggerDownload(blob, `organic-protocols-${todayString()}.xls`);
}

function tsvEscape(v) {
  const s = String(v == null ? '' : v);
  // Strip tabs and CRs to keep TSV intact
  return s.replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

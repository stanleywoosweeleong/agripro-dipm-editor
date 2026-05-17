import React, { useState, useEffect, useCallback } from 'react';
import {
  loadProtocol, saveProtocol, emptyProtocol,
  emptyProduct, emptyAdjuvant,
} from './organicData.js';

// Phase metadata — matches the existing Tank Mix / Protocol structure
const PHASE_META = [
  { num: 1, label: 'Phase 1', desc: 'Knock-down (red alert / outbreak)', color: 'red' },
  { num: 2, label: 'Phase 2', desc: 'Break the cycle (orange alert)',     color: 'amber' },
  { num: 3, label: 'Phase 3', desc: 'Preventative barrier (green / low pressure)', color: 'emerald' },
];

const COLOR_MAP = {
  red: { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  amber: { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

export function OrganicEditor({ pest, onClose, onSaved }) {
  // Local state mirroring the protocol. Initialised from storage or empty skeleton.
  const [protocol, setProtocol] = useState(() => {
    return loadProtocol(pest.id) || emptyProtocol(pest.id);
  });
  const [saved, setSaved] = useState(true);  // tracks unsaved changes
  const [confirmDirtyClose, setConfirmDirtyClose] = useState(false);

  // Mark unsaved whenever the protocol changes
  useEffect(() => {
    setSaved(false);
  }, [protocol]);

  // Reset "saved" state on first mount (so opening a stored protocol doesn't immediately show "unsaved")
  useEffect(() => {
    setSaved(true);
  }, []);

  // Generic helper: produce an updated protocol with one phase modified
  const updatePhase = useCallback((phaseIndex, updater) => {
    setProtocol(prev => {
      const phases = [...prev.phases];
      phases[phaseIndex] = updater(phases[phaseIndex]);
      return { ...prev, phases };
    });
  }, []);

  const addProduct = (phaseIndex) => {
    updatePhase(phaseIndex, ph => ({ ...ph, products: [...ph.products, emptyProduct()] }));
  };

  const removeProduct = (phaseIndex, productIndex) => {
    updatePhase(phaseIndex, ph => ({
      ...ph,
      products: ph.products.filter((_, i) => i !== productIndex),
    }));
  };

  const updateProduct = (phaseIndex, productIndex, field, value) => {
    updatePhase(phaseIndex, ph => {
      const products = [...ph.products];
      products[productIndex] = { ...products[productIndex], [field]: value };
      return { ...ph, products };
    });
  };

  const toggleAdjuvant = (phaseIndex) => {
    updatePhase(phaseIndex, ph => ({
      ...ph,
      adjuvant: ph.adjuvant ? null : emptyAdjuvant(),
    }));
  };

  const updateAdjuvant = (phaseIndex, field, value) => {
    updatePhase(phaseIndex, ph => ({
      ...ph,
      adjuvant: { ...ph.adjuvant, [field]: value },
    }));
  };

  const handleSave = () => {
    const ok = saveProtocol(protocol);
    if (ok) {
      setSaved(true);
      if (onSaved) onSaved(protocol);
    } else {
      alert('Save failed. Browser storage may be full.');
    }
  };

  const handleClose = () => {
    if (!saved) {
      setConfirmDirtyClose(true);
      return;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-0.5">
              Organic Protocol Editor
            </div>
            <h2 className="text-xl md:text-2xl font-bold truncate">
              {pest.common.en} <span className="text-emerald-300 font-normal text-base">/ {pest.common.zh}</span>
            </h2>
            <div className="text-xs text-emerald-200 mt-1 font-mono">
              ID: <span className="bg-emerald-950 px-2 py-0.5 rounded">{pest.id}</span>
              <span className="ml-3">Scientific: <span className="italic">{pest.scientific}</span></span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-emerald-800 rounded-lg flex-shrink-0 ml-4"
            aria-label="Close"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* General notes */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              General Agronomist Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={protocol.notes}
              onChange={(e) => setProtocol(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any overall guidance — e.g. context, target market certification level, recommended rotation pattern."
              rows={2}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-colors text-sm"
            />
          </div>

          {/* Phases */}
          {PHASE_META.map((meta, phaseIndex) => {
            const phase = protocol.phases[phaseIndex];
            const c = COLOR_MAP[meta.color];
            return (
              <div key={phaseIndex} className={`${c.bg} ${c.border} border-2 rounded-2xl p-5`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`${c.dot} w-3 h-3 rounded-full`}></span>
                  <h3 className={`${c.text} font-black text-lg uppercase tracking-wider`}>
                    {meta.label}
                  </h3>
                  <span className="text-slate-600 text-sm italic">— {meta.desc}</span>
                </div>

                {/* Products */}
                {phase.products.length === 0 && (
                  <div className="text-sm text-slate-500 italic mb-3 px-2">
                    No products yet. Tap "Add Product" below to enter the first one.
                  </div>
                )}
                <div className="space-y-3">
                  {phase.products.map((product, productIndex) => (
                    <div key={productIndex} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5 relative">
                      <button
                        onClick={() => removeProduct(phaseIndex, productIndex)}
                        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Remove this product"
                        aria-label="Remove product"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                        </svg>
                      </button>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Product {productIndex + 1}
                      </div>
                      <Field
                        label="Product Name / SKU"
                        value={product.name}
                        onChange={(v) => updateProduct(phaseIndex, productIndex, 'name', v)}
                        placeholder="e.g. NeemPro 10EC"
                        required
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Field
                          label="Dosage"
                          value={product.dosage}
                          onChange={(v) => updateProduct(phaseIndex, productIndex, 'dosage', v)}
                          placeholder="e.g. 5 ml / L water"
                        />
                        <Field
                          label="PHI (days)"
                          value={product.phi}
                          onChange={(v) => updateProduct(phaseIndex, productIndex, 'phi', v)}
                          placeholder="e.g. 0 or 3"
                        />
                      </div>
                      <Field
                        label="Application Notes"
                        value={product.applicationNotes}
                        onChange={(v) => updateProduct(phaseIndex, productIndex, 'applicationNotes', v)}
                        placeholder="When and how to apply — e.g. spray underside of leaves at dusk."
                        textarea
                      />
                      <Field
                        label="Certification"
                        value={product.certification}
                        onChange={(v) => updateProduct(phaseIndex, productIndex, 'certification', v)}
                        placeholder="e.g. MS ORGANIC 1529:2015, USDA NOP, EU Organic"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addProduct(phaseIndex)}
                  className="mt-3 w-full bg-white border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Product
                </button>

                {/* Adjuvant section */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  {phase.adjuvant ? (
                    <div className="bg-sky-50 p-4 rounded-xl border border-sky-200 space-y-2.5 relative">
                      <button
                        onClick={() => toggleAdjuvant(phaseIndex)}
                        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Remove adjuvant"
                        aria-label="Remove adjuvant"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
                        </svg>
                      </button>
                      <div className="text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>
                        Adjuvant / Spreader
                      </div>
                      <Field
                        label="Adjuvant Name"
                        value={phase.adjuvant.name}
                        onChange={(v) => updateAdjuvant(phaseIndex, 'name', v)}
                        placeholder="e.g. OrgaSpread"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Field
                          label="Dosage"
                          value={phase.adjuvant.dosage}
                          onChange={(v) => updateAdjuvant(phaseIndex, 'dosage', v)}
                          placeholder="e.g. 1 ml / L"
                        />
                        <Field
                          label="Application Notes"
                          value={phase.adjuvant.applicationNotes}
                          onChange={(v) => updateAdjuvant(phaseIndex, 'applicationNotes', v)}
                          placeholder="e.g. Add to tank before products"
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleAdjuvant(phaseIndex)}
                      className="w-full bg-sky-50 border-2 border-dashed border-sky-200 hover:border-sky-400 hover:bg-sky-100 text-sky-700 font-bold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add Adjuvant for this Phase
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-500">
            {saved
              ? <span className="text-emerald-700 font-bold">✓ Saved</span>
              : <span className="text-amber-700 font-bold">● Unsaved changes</span>
            }
            {protocol.updatedAt > 0 && (
              <span className="ml-3 text-slate-400">
                Last saved: {new Date(protocol.updatedAt).toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg font-bold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={saved}
              className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                saved
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
              }`}
            >
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Unsaved-changes confirmation */}
      {confirmDirtyClose && (
        <div className="fixed inset-0 z-[130] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Unsaved changes</h3>
            <p className="text-sm text-slate-600">
              You have unsaved changes. Closing now will discard them.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDirtyClose(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-bold"
              >
                Keep Editing
              </button>
              <button
                onClick={() => { setConfirmDirtyClose(false); onClose(); }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Small reusable text field component
// ============================================================
function Field({ label, value, onChange, placeholder, textarea, required }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {textarea ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-colors text-sm"
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-colors text-sm"
        />
      )}
    </div>
  );
}

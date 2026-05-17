import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { UI_STRINGS } from './ui.js';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'agripro_lang';
const DEFAULT_LANG = 'zh'; // Chinese is default per user spec
const VALID_LANGS = ['en', 'zh'];

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && VALID_LANGS.includes(saved)) return saved;
    } catch (e) { /* localStorage disabled */ }
    return DEFAULT_LANG;
  });

  const setLang = useCallback((newLang) => {
    if (!VALID_LANGS.includes(newLang)) return;
    setLangState(newLang);
    try { localStorage.setItem(STORAGE_KEY, newLang); } catch (e) { /* ignore */ }
    // Update <html lang> for accessibility / SEO
    document.documentElement.lang = newLang === 'zh' ? 'zh-CN' : 'en';
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }, [lang]);

  // Pick translatable field: t({en, zh}) -> string for current language
  // Also accepts a plain string (returns it as-is — useful for already-neutral fields)
  const t = useCallback((field) => {
    if (field == null) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object' && (field.en || field.zh)) {
      return field[lang] || field.en || field.zh || '';
    }
    return String(field);
  }, [lang]);

  // Get a UI string by dotted key, e.g. ui('header.title')
  const ui = useCallback((key, fallback = '') => {
    const parts = key.split('.');
    let node = UI_STRINGS;
    for (const p of parts) {
      if (node && typeof node === 'object' && p in node) {
        node = node[p];
      } else {
        return fallback || key;
      }
    }
    if (node && typeof node === 'object' && (node.en || node.zh)) {
      return node[lang] || node.en || node.zh || fallback;
    }
    return fallback || key;
  }, [lang]);

  // Render DT50 chemical name (always bilingual regardless of lang)
  const bilingualName = useCallback((field) => {
    if (typeof field === 'string') return field; // already bilingual joined form
    if (field?.en && field?.zh) return `${field.en} (${field.zh})`;
    return String(field || '');
  }, []);

  const value = useMemo(() => ({ lang, setLang, t, ui, bilingualName }), [lang, setLang, t, ui, bilingualName]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>');
  return ctx;
}

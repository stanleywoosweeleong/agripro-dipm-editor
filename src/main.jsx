import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { registerSW } from 'virtual:pwa-register';

/**
 * PWAUpdatePrompt — small floating button shown when a new app version is detected.
 * Tap to reload with the new version active. Auto-detects bilingual context via document.documentElement.lang.
 */
function PWAUpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState(() => () => {});

  useEffect(() => {
    const update = registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[PWA] New version available.');
        setNeedRefresh(true);
      },
      onOfflineReady() {
        console.log('[PWA] App ready to work offline.');
      }
    });
    setUpdateSW(() => update);
  }, []);

  if (!needRefresh) return null;

  const isZh = document.documentElement.lang.startsWith('zh');
  const label = isZh ? '应用已更新 · 点击重新加载' : 'App updated · Tap to reload';

  return (
    <button
      onClick={() => updateSW(true)}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-full shadow-2xl border-2 border-emerald-700 flex items-center gap-2.5 font-bold text-sm animate-in fade-in slide-in-from-bottom duration-300"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      aria-label={label}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
      </svg>
      <span>{label}</span>
    </button>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <PWAUpdatePrompt />
  </React.StrictMode>
);

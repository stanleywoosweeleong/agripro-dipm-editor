import React, { lazy, Suspense } from 'react';
import { LanguageProvider, useLang } from './i18n/useLang.jsx';

// Code-split per language so users only download the bundle they need.
const EnApp = lazy(() => import('./EnApp.jsx'));
const ZhApp = lazy(() => import('./ZhApp.jsx'));

function AppShell() {
  const { lang } = useLang();
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-bold text-slate-600">
              {lang === 'zh' ? '正在加载...' : 'Loading...'}
            </div>
          </div>
        </div>
      }
    >
      {lang === 'en' ? <EnApp /> : <ZhApp />}
    </Suspense>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppShell />
    </LanguageProvider>
  );
}

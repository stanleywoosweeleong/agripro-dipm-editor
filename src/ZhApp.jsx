import React, { useState, useEffect, useMemo } from 'react';
import { ALL_PESTS, PEST_MOA_MAPPING, PEST_APPLICATION_MAPPING, DT50_DATABASE } from './data/index.js';
import { useLang } from './i18n/useLang.jsx';
import { WikiPhotoStrip } from './components/WikiPhotoStrip.jsx';
import { OrganicEditor } from './OrganicEditor.jsx';
import { loadProtocol, isProtocolFilled } from './organicData.js';
import { EditorProgressBanner } from './EditorProgressBanner.jsx';

// --- CRASH-PROOF INLINE ICONS (SCALED UP FOR READABILITY) ---
const Icon = ({ name, className }) => {
  const icons = {
    leaf: <path d="M11 20A7 7 0 0 1 14 6c7 0 7 7 7 7a7 7 0 0 1-7 7c-7 0-7-7-7-7"/>,
    bug: <><rect width="8" height="14" x="8" y="6" rx="4"/><path d="m19 7-3 2M5 7l3 2M19 19l-3-2M5 19l3-2M20 13h-4M4 13h4M10 4l1 2M14 4l-1 2"/></>,
    droplets: <path d="M7 16.3c0 2.6 2.24 4.7 5 4.7s5-2.1 5-4.7c0-2.4-2.24-5.3-5-8.8-2.76 3.5-5 6.4-5 8.8z" />,
    alert: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    info: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
    calculator: <><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></>,
    link: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    rain: <><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
    grid: <><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></>,
    list: <><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></>,
    'arrow-up': <><line x1="12" x2="12" y1="19" y2="5"/><polyline points="5 12 12 5 19 12"/></>,
    'arrow-down': <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>,
    share: <><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></>,
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>,
    sunset: <><path d="M12 2v6"/><path d="M4.93 10.93l2.83 2.83"/><path d="M2 18h20"/><path d="M19.07 10.93l-2.83 2.83"/><path d="M8 18a4 4 0 0 1 8 0"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    dash: <line x1="5" y1="12" x2="19" y2="12" />,
    'chevron-down': <polyline points="6 9 12 15 18 9"/>,
    'chevron-up': <polyline points="18 15 12 9 6 15"/>,
    'book-open': <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
    'eye': <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    'lightbulb': <><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></>,
    'dot': <circle cx="12" cy="12" r="10"/>,
    'target': <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    'dollar-sign': <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    'beaker': <><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></>
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name] || icons.info}
    </svg>
  );
};

// --- DATA ENRICHMENT: IPM, STAGE & PHOTOTAXIS TAGS ---

// --- MOA DATA ENRICHMENT (IRAC & FRAC CODES) ---

// --- SPRAY TARGET ENRICHMENT ---

// Enrichment moved inside component so language switches re-apply correctly.

// --- DT50 CHEMICAL LIFESPAN DATABASE ---

// --- ACTIVITY ICON HELPER ---
const getActivityIcon = (act) => {
  if (!act || act === 'N/A' || act === '无') return 'dash';
  if (act.includes('Diurnal') || act.includes('昼行')) return 'sun';
  if (act.includes('Nocturnal') || act.includes('夜行')) return 'moon';
  if (act.includes('Crepuscular') || act.includes('晨昏')) return 'sunset';
  if (act.includes('Continuous') || act.includes('全天候')) return 'clock';
  return 'info';
};

// --- MOBILITY TAG HELPER ---
const getMobilityTag = (code) => {
  if (code.includes('+') || code.includes('Mix') || code.includes('Premix')) return { label: '复配 (多重机制)', color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200' };
  if (code.match(/(23|P07)/i)) return { label: '双向内吸', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
  if (code.match(/(4A|4C|28|29|9B|30|FRAC 3|FRAC 1\b|FRAC 7\b|Antibiotic)/i)) return { label: '内吸性 (向上)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  if (code.match(/(IRAC 5|IRAC 6|FRAC 11|7C)/i)) return { label: '跨层传导', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
  if (code.match(/(RRAC|Bait|Iron Phosphate|Tape)/i)) return { label: '诱饵 / 屏障', color: 'bg-orange-100 text-orange-800 border-orange-200' };
  if (code.match(/Physical/i)) return { label: '物理防治', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  if (code.match(/Cultural/i)) return { label: '农业防治', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
  // Add UN and Chinese keywords (油, 皂, 印楝, 硫磺) to correctly tag as Contact/Surface
  if (code.match(/(3A|1B|2B|20B|22A|21A|12A|16|M01|M03|FRAC 20|FRAC 14|Oil|Soap|Neem|Bt|Sulfur|Biological|Molluscicide|Niclosamide|Bio|UN|油|皂|印楝|硫磺)/i)) return { label: '触杀 / 表面', color: 'bg-rose-100 text-rose-800 border-rose-200' };
  return { label: '其它方法', color: 'bg-slate-100 text-slate-700 border-slate-200' };
};

// --- 3-PHASE IPM PARSER ---
const getPhaseInfo = (phase, category) => {
  if (category === 'Fungi/Pathogens') {
      if (phase === 1) return { step: '阶段一', title: '快速灭除 (Eradicant)', desc: '爆发期。瞬间烧毁活跃的真菌病斑，阻止孢子扩散。', color: 'red' };
      if (phase === 2) return { step: '阶段二', title: '内吸防护 (Systemic)', desc: '巩固期。吸收到维管组织中，保护新梢免受内部感染蔓延。', color: 'amber' };
      if (phase === 3) return { step: '阶段三', title: '保护剂 (Protectant)', desc: '维护期。用接触性屏障或竞争性生物制剂覆盖叶面。', color: 'emerald' };
  }
  // Default Insects/Mites/Others
  if (phase === 1) return { step: '阶段一', title: '快速击倒', desc: '红色警报。快速消灭活跃成虫/虫群 (短 LT₅₀)。', color: 'red' };
  if (phase === 2) return { step: '阶段二', title: '阻断繁殖', desc: '橙色警报。打破生命周期，通过内吸剂或昆虫生长调节剂(IGR)锁定隐蔽的若虫/虫卵。', color: 'amber' };
  if (phase === 3) return { step: '阶段三', title: '预防屏障', desc: '绿色警报。低种群密度。保护益虫并建立生物屏障。', color: 'emerald' };
};

const categorizeMoa = (moaString, category) => {
  if (!moaString || moaString === 'N/A') return null;
  const items = moaString.split(' 🔄 ');
  const phases = { 1: [], 2: [], 3: [] };
  
  items.forEach(item => {
      // Add UN and Chinese keywords here to ensure they sort into Phase 3 (Preventative/Protectant)
      if (item.match(/(Bio|Oil|Soap|Neem|Bt|Sulfur|Physical|Cultural|Molluscicide|M01|M03|Bait|Wash|Sunlight|Brush|UN|生物|油|皂|印楝|硫磺)/i)) {
          phases[3].push(item);
      } else if (category === 'Fungi/Pathogens') {
          if (item.match(/(FRAC 11|FRAC 3|Premix|P07|FRAC 21|FRAC 14|FRAC 20|FRAC 7)/i)) phases[1].push(item);
          else phases[2].push(item);
      } else {
          if (item.match(/(3A|1B|2B|5|6|22A|Premix|RRAC|Iron Phosphate)/i)) phases[1].push(item);
          else if (item.match(/(4A|4C|23|28|29|16|7C|9B|12A|21A|30|20B|Antibiotic)/i)) phases[2].push(item);
          else phases[1].push(item);
      }
  });

  // Fallbacks for better UI distribution if a phase is empty but we have multiple items
  if (phases[1].length === 0 && phases[2].length > 0) { phases[1].push(phases[2].shift()); }
  if (phases[2].length === 0 && phases[1].length > 1) { phases[2].push(phases[1].pop()); }
  if (phases[3].length === 0 && phases[2].length > 1) { phases[3].push(phases[2].pop()); }
  if (phases[3].length === 0 && phases[1].length > 1) { phases[3].push(phases[1].pop()); }
  
  return phases;
};

// --- SEVERITY DOTS COMPONENT ---
const SeverityDots = ({ rating }) => {
  return (
    <div className="flex items-center gap-1.5" title={`严重程度评分: ${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((dot) => (
        <Icon 
          key={dot} 
          name="dot" 
          className={`w-4 h-4 transition-colors ${dot <= rating ? (rating >= 4 ? 'text-red-500 fill-red-500' : 'text-amber-500 fill-amber-500') : 'text-slate-200 fill-slate-200'}`} 
        />
      ))}
    </div>
  );
};

// --- VISUAL TRAPPING GUIDE COMPONENT ---
const TrappingGuide = () => (
  <div className="bg-white border-2 border-emerald-100 rounded-2xl p-6 mt-4 mb-4 shadow-md animate-in fade-in slide-in-from-top-4">
    <p className="text-lg text-slate-600 font-medium mb-6">
      视觉粘虫板利用了昼行性昆虫觅食或交配时自然被特定颜色频率吸引的原理。
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-12 bg-yellow-400 rounded-md border-2 border-yellow-600 shadow-sm flex-shrink-0"></div>
          <h4 className="font-bold text-xl text-slate-800">黄色粘虫板<br/><span className="text-sm text-slate-500 font-medium">(全能型)</span></h4>
        </div>
        <p className="text-lg font-medium text-slate-600 mb-4 leading-relaxed flex-1">
          模拟高氮嫩梢的反射光。最适合对付<strong>木虱、蚜虫、粉虱和果实蝇</strong>，大型黄板也能有效诱捕<strong>马蜂和虎头蜂</strong>等危险蜂类。
        </p>
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mt-auto">
          <strong className="text-yellow-800 block mb-2 uppercase tracking-wider text-xs">悬挂位置:</strong>
          <p className="text-yellow-900 font-bold text-base">与新梢高度齐平 (树冠外围)。捕蜂则挂于空旷通道。</p>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-12 bg-blue-400 rounded-md border-2 border-blue-600 shadow-sm flex-shrink-0"></div>
          <h4 className="font-bold text-xl text-slate-800">蓝色粘虫板<br/><span className="text-sm text-slate-500 font-medium">(蓟马专杀)</span></h4>
        </div>
        <p className="text-lg font-medium text-slate-600 mb-4 leading-relaxed flex-1">
          蓟马对特定的蓝色波长高度敏感。最适合对付<strong>茶黄蓟马成虫</strong>。在开花期使用可防止果实留疤。
        </p>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mt-auto">
          <strong className="text-blue-800 block mb-2 uppercase tracking-wider text-xs">悬挂位置:</strong>
          <p className="text-blue-900 font-bold text-base">悬挂在树冠内部靠近花簇的位置。</p>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-12 bg-slate-100 rounded-md border-2 border-slate-300 shadow-sm flex-shrink-0"></div>
          <h4 className="font-bold text-xl text-slate-800">白色粘虫板<br/><span className="text-sm text-slate-500 font-medium">(甲虫/蝽象)</span></h4>
        </div>
        <p className="text-lg font-medium text-slate-600 mb-4 leading-relaxed flex-1">
          吸引特定类型的植食性蝽象和小型甲虫。在榴莲园中较少使用，但对一般果园生物多样性监测很有用。
        </p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-auto">
          <strong className="text-slate-800 block mb-2 uppercase tracking-wider text-xs">悬挂位置:</strong>
          <p className="text-slate-900 font-bold text-base">树干高度或树冠中部的树杈处。</p>
        </div>
      </div>
    </div>
    
    <div className="mt-6 p-4 bg-emerald-900 text-emerald-50 rounded-xl flex items-center gap-4 border border-emerald-950 shadow-inner">
      <Icon name="info" className="w-6 h-6 text-emerald-400 flex-shrink-0" />
      <span className="text-lg font-medium"><strong>专家提示：</strong>大规模诱捕（每棵树 5-10 张）可以在不使用化学药剂的情况下使害虫种群减少高达 40%。当板面覆盖率达到 50% 时请及时更换。</span>
    </div>
  </div>
);

// --- NOCTURNAL LIGHT TRAPPING GUIDE COMPONENT ---
const LightTrappingGuide = () => (
  <div className="bg-white border-2 border-amber-100 rounded-2xl p-6 mt-4 mb-4 shadow-md animate-in fade-in slide-in-from-top-4">
    <p className="text-lg text-slate-600 font-medium mb-6">
      根据最新的农艺学研究，<strong>太阳能杀虫灯</strong>利用特定的紫外线和多波长LED灯，利用夜行性破坏性害虫的正趋光性，在它们交配或产卵之前将其大量拦截。
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-100 p-2 rounded-lg text-amber-600 shadow-sm flex-shrink-0"><Icon name="arrow-up" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800">高层树冠诱捕<br/><span className="text-sm text-slate-500 font-medium">(针对蛾类/蛀果蛾)</span></h4>
        </div>
        <p className="text-lg font-medium text-slate-600 mb-4 leading-relaxed flex-1">
          榴莲果蛀虫和皮蛀蛾通常在夜间飞行，并将卵直接产在幼果上。将杀虫灯悬挂在高处能够有效拦截这些在树冠间穿梭的成蛾。
        </p>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mt-auto">
          <strong className="text-amber-800 block mb-2 uppercase tracking-wider text-xs">部署策略:</strong>
          <p className="text-amber-900 font-bold text-base">离地 4-6 米高，挂在树冠外部空旷处。主要在结果期（开花后至果实膨大期）密集开启。</p>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shadow-sm flex-shrink-0"><Icon name="arrow-down" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800">低层地面诱捕<br/><span className="text-sm text-slate-500 font-medium">(针对鳃金龟/甲虫)</span></h4>
        </div>
        <p className="text-lg font-medium text-slate-600 mb-4 leading-relaxed flex-1">
          鳃金龟等甲虫白天隐藏在土壤中，夜晚羽化飞出并疯狂啃食幼苗和下层叶片。低处光源能在它们向新梢飞升前将其诱杀。
        </p>
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 mt-auto">
          <strong className="text-indigo-800 block mb-2 uppercase tracking-wider text-xs">部署策略:</strong>
          <p className="text-indigo-900 font-bold text-base">离地 1-1.5 米高。特别是在长旱季结束后的第一场暴雨后（金龟子羽化高峰期）连续开启。</p>
        </div>
      </div>
    </div>
    
    <div className="mt-6 p-4 bg-amber-900 text-amber-50 rounded-xl flex items-center gap-4 border border-amber-950 shadow-inner">
      <Icon name="clock" className="w-6 h-6 text-amber-400 flex-shrink-0" />
      <span className="text-lg font-medium"><strong>时间控制提示：</strong>大多数破坏性夜行害虫在黄昏后 3-4 小时内最活跃。建议将杀虫灯定时设置为 <strong>晚上 7:30 至 午夜 12:00</strong>，这既能节省电池，又能避免误杀在下半夜/凌晨活动的夜行性授粉者（如长舌果蝠）。</span>
    </div>
  </div>
);

// --- TANK MIXING & SYNERGY GUIDE COMPONENT ---
const TankMixGuide = () => (
  <div className="bg-white border-2 border-violet-100 rounded-2xl p-6 mt-4 mb-4 shadow-md animate-in fade-in slide-in-from-top-4">
    <p className="text-lg text-slate-600 font-medium mb-8 leading-relaxed">
      不正确的农药混配会破坏有效成分、堵塞设备并烧伤树冠。请遵循专业的 <strong>WALES</strong> 投放顺序和农艺规则，以确保最大的药效和安全性。
    </p>

    <div className="space-y-8">
      {/* 1. PROFESSIONAL MIXING SEQUENCE (WALES) */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <h4 className="font-extrabold text-2xl text-slate-800 flex items-center gap-3 mb-6">
          <Icon name="list" className="w-8 h-8 text-violet-600" />
          专业 WALES 混配顺序
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8">
          <div className="bg-white p-5 rounded-xl border-2 border-violet-100 flex flex-col items-center text-center shadow-sm relative group">
            <span className="text-4xl font-black text-violet-600 mb-2">W</span>
            <strong className="text-xs uppercase tracking-wider text-slate-800 mb-1 leading-tight">可湿性粉剂</strong>
            <p className="text-[10px] text-slate-500 font-bold uppercase">WP, WG, DF, SG</p>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 hidden md:block text-slate-300">
              <Icon name="chevron-right" className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border-2 border-violet-100 flex flex-col items-center text-center shadow-sm relative">
            <span className="text-4xl font-black text-violet-600 mb-2">A</span>
            <strong className="text-xs uppercase tracking-wider text-slate-800 mb-1 leading-tight">助剂 / 缓冲剂</strong>
            <p className="text-[10px] text-slate-500 font-bold uppercase">pH 水质调节剂</p>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 hidden md:block text-slate-300">
              <Icon name="chevron-right" className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border-2 border-violet-100 flex flex-col items-center text-center shadow-sm relative">
            <span className="text-4xl font-black text-violet-600 mb-2">L</span>
            <strong className="text-xs uppercase tracking-wider text-slate-800 mb-1 leading-tight">可溶剂 & 悬浮剂</strong>
            <p className="text-[10px] text-slate-500 font-bold uppercase">SL, SC, SE, CS</p>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 hidden md:block text-slate-300">
              <Icon name="chevron-right" className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border-2 border-violet-100 flex flex-col items-center text-center shadow-sm relative">
            <span className="text-4xl font-black text-violet-600 mb-2">E</span>
            <strong className="text-xs uppercase tracking-wider text-slate-800 mb-1 leading-tight">乳油</strong>
            <p className="text-[10px] text-slate-500 font-bold uppercase">EC, EW, ME, OD</p>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 hidden md:block text-slate-300">
              <Icon name="chevron-right" className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border-2 border-violet-100 flex flex-col items-center text-center shadow-sm relative">
            <span className="text-4xl font-black text-violet-600 mb-2">S</span>
            <strong className="text-xs uppercase tracking-wider text-slate-800 mb-1 leading-tight">表面活性剂</strong>
            <p className="text-[10px] text-slate-500 font-bold uppercase">展着剂，有机硅</p>
          </div>
        </div>

        {/* CRITICAL WARNING: TANK OVERLOAD */}
        <div className="bg-rose-900 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 border-4 border-rose-950 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
             <Icon name="alert" className="w-32 h-32" />
          </div>
          <div className="bg-rose-800 p-4 rounded-full flex-shrink-0 border-2 border-rose-700 shadow-lg z-10">
            <Icon name="alert" className="w-12 h-12 text-amber-400" />
          </div>
          <div className="text-center md:text-left z-10">
            <strong className="text-2xl font-black uppercase tracking-tight block mb-2 text-amber-300">⚠️ 严重警告：药桶超载原则</strong>
            <p className="text-lg font-bold leading-relaxed text-rose-50">
              绝对不要在同一个喷药桶中混合超过 <strong>3 种有效成分</strong>。
            </p>
            <p className="text-lg font-medium mt-3 opacity-95 leading-relaxed">
              混合过多种类的化学物质会造成"鸡尾酒灾难"。您将面临<strong>药害 (Phytotoxicity)</strong>(烧毁整个树冠)或<strong>化学中和</strong>的风险。如果化学物质相互抵消，您等于<strong>白白浪费了 40-60% 的成本</strong>，同时可能用未溶解的污泥堵塞喷嘴。
            </p>
          </div>
        </div>
      </div>

      {/* pH Section */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h4 className="font-bold text-xl text-slate-800 flex items-center gap-3 mb-4">
          <Icon name="droplets" className="w-6 h-6 text-blue-500" />
          黄金 pH 法则 (碱性水解)
        </h4>
        <p className="text-slate-600 mb-4 leading-relaxed">
          如果您的农场水源呈强碱性 (pH 7.5+)，它会在20分钟内将喷雾桶内的现代农药(如拟除虫菊酯)彻底分解失效。请始终先测试并缓冲您的水质！
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
             <strong className="text-blue-800 block mb-1">标准化学药剂：</strong>
             <span className="text-blue-900 font-bold text-lg">目标 pH值 5.5 - 6.5</span>
             <p className="text-lg font-medium text-blue-700 mt-2">在加入农药*之前*，先在水中使用缓冲剂/调节剂。</p>
           </div>
           <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
             <strong className="text-rose-800 block mb-1">⚠️ 铜制剂例外规则：</strong>
             <span className="text-rose-900 font-bold text-lg">目标 pH值 7.0+ (中性至微碱)</span>
             <p className="text-lg font-medium text-rose-700 mt-2">绝对不要将铜制剂放入酸性水中。它会迅速溶解出铜离子并严重烧毁您的树冠！</p>
           </div>
        </div>
      </div>

      {/* Synergy Section */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h4 className="font-bold text-xl text-slate-800 flex items-center gap-3 mb-4">
          <Icon name="beaker" className="w-6 h-6 text-violet-500" />
          经证实的协同增效配方 (1 + 1 = 3)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-violet-50 p-4 rounded-xl border border-violet-200">
             <strong className="text-violet-900 block mb-1 text-sm uppercase tracking-wider">抗性酶阻断剂</strong>
             <p className="font-bold text-violet-950 mb-2">PBO (增效醚) + 拟除虫菊酯 (IRAC 3A)</p>
             <p className="text-lg font-medium text-violet-800 leading-relaxed">昆虫利用体内酶来分解毒素存活。PBO能关闭这种酶，使拟除虫菊酯对付高抗性蛀虫的致死率提高近10倍。</p>
          </div>
          <div className="bg-fuchsia-50 p-4 rounded-xl border border-fuchsia-200">
             <strong className="text-fuchsia-900 block mb-1 text-sm uppercase tracking-wider">能量与护盾粉碎机</strong>
             <p className="font-bold text-fuchsia-950 mb-2">FRAC 11 + FRAC 3</p>
             <p className="text-lg font-medium text-fuchsia-800 leading-relaxed">嘧菌酯(阻断真菌呼吸) 混合 苯醚甲环唑(阻止细胞壁构建)。对抗炭疽病的终极组合。</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
             <strong className="text-indigo-900 block mb-1 text-sm uppercase tracking-wider">"驱赶与击杀" 战术</strong>
             <p className="font-bold text-indigo-950 mb-2">IRAC 3A + IRAC 4A</p>
             <p className="text-lg font-medium text-indigo-800 leading-relaxed">拟除虫菊酯具有刺激性，能将隐藏在叶缝里的害虫驱赶出来，迫使它们接触到早已喷洒的新烟碱内吸层。爆发期的完美对策。</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
             <strong className="text-amber-900 block mb-1 text-sm uppercase tracking-wider">物理装甲突破</strong>
             <p className="font-bold text-amber-950 mb-2">矿物油/白油 + IRAC 23</p>
             <p className="text-lg font-medium text-amber-800 leading-relaxed">油剂充当物理溶剂，融化盾介壳虫的蜡质盔甲，并将螺虫乙酯系统性地直接吸入昆虫体内。</p>
          </div>
        </div>
      </div>

      {/* Chemical Antagonism & Timing Section */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h4 className="font-bold text-xl text-slate-800 flex items-center gap-3 mb-4">
          <Icon name="x" className="w-6 h-6 text-red-500" />
          危险的混合与时机忌讳 (铜制剂法则)
        </h4>
        <div className="space-y-4">
          <div className="bg-red-50 p-5 rounded-xl border-2 border-red-200 flex flex-col md:flex-row gap-4 items-start shadow-inner">
            <div className="bg-red-100 p-2.5 rounded-full flex-shrink-0 mt-1">
              <Icon name="alert" className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <strong className="text-red-900 block mb-1 text-lg uppercase tracking-wider">铜制剂 "独行侠" 法则</strong>
              <p className="font-bold text-red-950 mb-2">铜制剂 (FRAC M01) + 合成有机物 (例如：戊菌隆)</p>
              <p className="text-lg text-red-800 leading-relaxed font-medium">
                绝不要将重金属杀菌剂(氧氯化铜 / 氢氧化铜)与合成有机化学品混合。高反应活性的铜离子会与有机分子结合，导致它们分离并作为白垩状污泥沉到桶底(絮凝现象)。这会破坏化学物质的药效并严重烧伤树木。<strong>铜制剂必须始终单独喷洒！</strong>
              </p>
            </div>
          </div>

          <div className="bg-amber-50 p-5 rounded-xl border-2 border-amber-200 flex flex-col md:flex-row gap-4 items-start shadow-inner">
            <div className="bg-amber-100 p-2.5 rounded-full flex-shrink-0 mt-1">
              <Icon name="alert" className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <strong className="text-amber-900 block mb-1 text-lg uppercase tracking-wider">"零铜制剂" 窗口期 (花期)</strong>
              <p className="font-bold text-amber-950 mb-2">在火柴头期或盛花期施用铜制剂</p>
              <p className="text-lg text-amber-800 leading-relaxed font-medium">
                <strong>绝对不要在开花期间喷洒铜制剂！</strong>高活性的铜离子会立即烧伤娇嫩的柱头并使花粉干瘪，导致大规模的花朵败育/落花。此外，金属残留物会驱离重要的夜间授粉者（如洞穴果蝠），并且对授粉昆虫的肠道生物群具有高度毒性。在此阶段请完全改用软性生物制剂（如 <em>枯草芽孢杆菌</em>）。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LT50 Section */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h4 className="font-bold text-xl text-slate-800 flex items-center gap-3 mb-4">
          <Icon name="target" className="w-6 h-6 text-rose-500" />
          理解 LT₅₀ (致死时间) 与击倒速度
        </h4>
        <p className="text-slate-600 mb-4 leading-relaxed">
          虽然 DT₅₀ 衡量的是环境寿命，但 <strong>LT₅₀</strong> 衡量的是昆虫实际死亡的速度。农艺师将快和慢 LT₅₀ 的化学品混合以创造终极防御：
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <strong className="text-rose-800 block mb-1 text-sm uppercase tracking-wider">短 LT₅₀ (快速击倒)</strong>
             <p className="font-bold text-rose-950 mb-1">触杀剂 (例如：拟除虫菊酯)</p>
             <p className="text-lg font-medium text-slate-600 leading-relaxed">几分钟内致死。害虫在物理接触后会立刻从树冠上掉落。</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <strong className="text-indigo-800 block mb-1 text-sm uppercase tracking-wider">长 LT₅₀ (内吸/调节)</strong>
             <p className="font-bold text-indigo-950 mb-1">IGR & 内吸剂 (如：螺虫乙酯)</p>
             <p className="text-lg font-medium text-slate-600 leading-relaxed">需要 3-7 天。害虫会立刻停止取食，但会像无害的"行尸走肉"一样停留在叶片上。</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
             <strong className="text-emerald-800 block mb-1 text-sm uppercase tracking-wider">完美的混配</strong>
             <p className="font-bold text-emerald-950 mb-1">快 + 慢 (驱赶与击杀)</p>
             <p className="text-lg font-medium text-emerald-900 leading-relaxed">快速的化学成分击倒当前的成虫群，而缓慢的内吸成分则保护几天后孵化出的新若虫。</p>
          </div>
        </div>
      </div>

      {/* Chemical Mobility Section */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h4 className="font-bold text-xl text-slate-800 flex items-center gap-3 mb-4">
          <Icon name="activity" className="w-6 h-6 text-fuchsia-500" />
          化学传导性：毒素是如何移动的
        </h4>
        <p className="text-slate-600 mb-4 leading-relaxed">
          作用机制(MoA)决定了生物死亡的方式，但 <strong>传导性</strong> 决定了您必须*如何*喷洒树木才能触及害虫：
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <strong className="text-fuchsia-800 block mb-1 text-sm uppercase tracking-wider flex items-center gap-1.5"><Icon name="shield" className="w-4 h-4"/> 触杀/表面保护</strong>
             <p className="font-bold text-fuchsia-950 mb-1">例如：IRAC 3A, FRAC M01</p>
             <p className="text-lg font-medium text-slate-600 leading-relaxed">落在哪里就停留在哪里。会被雨水冲刷掉。您必须物理上击中昆虫或完全覆盖叶片表面。</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <strong className="text-indigo-800 block mb-1 text-sm uppercase tracking-wider flex items-center gap-1.5"><Icon name="leaf" className="w-4 h-4"/> 跨层传导</strong>
             <p className="font-bold text-indigo-950 mb-1">例如：IRAC 6, FRAC 11</p>
             <p className="text-lg font-medium text-slate-600 leading-relaxed">被叶片吸收，但不会在树液中流动。喷洒树冠顶部，它能杀死隐藏在叶背的害虫(如螨虫/粉虱)。</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
             <strong className="text-emerald-800 block mb-1 text-sm uppercase tracking-wider flex items-center gap-1.5"><Icon name="arrow-up" className="w-4 h-4"/> 向上内吸 (木质部)</strong>
             <p className="font-bold text-emerald-950 mb-1">例如：IRAC 4A, FRAC 3</p>
             <p className="text-lg font-medium text-emerald-900 leading-relaxed"><strong>只能向上传导。</strong>顺着植物的导水管向上流。非常适合顶部树冠的嫩梢，但如果喷在叶片上对根部害虫毫无用处。</p>
          </div>
          <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-200 shadow-sm">
             <strong className="text-cyan-800 block mb-1 text-sm uppercase tracking-wider flex items-center gap-1.5"><Icon name="droplets" className="w-4 h-4"/> 双向内吸 (韧皮部)</strong>
             <p className="font-bold text-cyan-950 mb-1">例如：IRAC 23, FRAC P07</p>
             <p className="text-lg font-medium text-cyan-900 leading-relaxed"><strong>双向流动。</strong>高度工程化的药物。可以顺着食物导管向下移动到根部和隐藏的树皮裂缝中。对于深藏的害虫必不可少。</p>
          </div>
        </div>
      </div>

      {/* DT50 & MRL Section */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h4 className="font-bold text-xl text-slate-800 flex items-center gap-3 mb-4">
          <Icon name="clock" className="w-6 h-6 text-teal-500" />
          延长半衰期 (DT₅₀) 与 农药助剂
        </h4>
        <p className="text-slate-600 mb-4 leading-relaxed">
          热带的阳光和雨水会使化学物质迅速降解。您可以通过与特定的农药助剂桶混来延长喷洒液的活性寿命：
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <strong className="text-teal-800 block mb-1 text-sm uppercase tracking-wider">紫外线屏障</strong>
             <p className="font-bold text-teal-950 mb-1">抗紫外线助剂</p>
             <p className="text-lg font-medium text-slate-600 leading-relaxed">防止阳光破坏对紫外线敏感的化学物质，如阿维菌素和Bt菌。</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <strong className="text-cyan-800 block mb-1 text-sm uppercase tracking-wider">防雨锁</strong>
             <p className="font-bold text-cyan-950 mb-1">合成展着剂</p>
             <p className="text-lg font-medium text-slate-600 leading-relaxed">在叶片上形成一层防水的聚合物薄膜，防止季风暴雨的冲刷。</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <strong className="text-emerald-800 block mb-1 text-sm uppercase tracking-wider">防蒸发护盾</strong>
             <p className="font-bold text-emerald-950 mb-1">矿物油/园艺油</p>
             <p className="text-lg font-medium text-slate-600 leading-relaxed">包裹化学液滴以减缓蒸发速度，给内吸性液体更多的时间被叶片吸收。</p>
          </div>
        </div>
        
        {/* MRL WARNING CAUTION BOX */}
        <div className="bg-rose-50 p-5 rounded-xl border-2 border-rose-200 flex flex-col md:flex-row gap-4 items-start shadow-inner">
          <div className="bg-rose-100 p-2.5 rounded-full flex-shrink-0">
            <Icon name="alert" className="w-8 h-8 text-rose-600" />
          </div>
          <div>
            <strong className="text-rose-900 block mb-2 text-lg uppercase tracking-wider">⚠️ 严重警告：农残超标 (MRL) 陷阱</strong>
            <p className="text-lg text-rose-800 leading-relaxed font-medium">
              在<strong>果实成熟期</strong>，<strong>绝对不要</strong>使用能延长 DT₅₀ 的助剂(展着剂/抗紫剂)！在接近采收时人为延长化学品的寿命，注定会导致您的果实在海关出口的 <strong>MRL (最大农药残留限量)</strong> 检测中失败。请在采收前至少 30-45 天停止使用这些助剂，让农药自然降解。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- BIOLOGICAL WARFARE GUIDE COMPONENT ---
const BioControlGuide = () => (
  <div className="bg-white border-2 border-lime-100 rounded-2xl p-6 mt-4 mb-4 shadow-md animate-in fade-in slide-in-from-top-4">
    <p className="text-lg text-slate-600 font-medium mb-6">
      使用如 <strong>贝莱斯芽孢杆菌 (B. velezensis)</strong> 和 <strong>解淀粉芽孢杆菌 (B. amyloliquefaciens)</strong> 等有益细菌是抵御侵略性真菌枯萎病 (如<em>丝核菌</em>) 最有效的反制手段之一。以下是它们赢得微观战争的原理：
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-rose-100 p-2 rounded-lg text-rose-600 shadow-sm flex-shrink-0"><Icon name="shield" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800">脂肽类生物战</h4>
        </div>
        <p className="text-lg font-medium text-slate-600 mb-4 leading-relaxed flex-1">
          这些细菌能合成强大的天然抗真菌化合物(伊枯草菌素、表面活性素、丰原素)，这些物质能直接撕裂真菌脂质细胞膜上的孔洞，导致真菌细胞瞬间泄漏死亡。
        </p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-sky-100 p-2 rounded-lg text-sky-600 shadow-sm flex-shrink-0"><Icon name="target" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800">竞争性排斥</h4>
        </div>
        <p className="text-lg font-medium text-slate-600 mb-4 leading-relaxed flex-1">
          枯萎病不通过孢子传播，而是通过物理网状生长来蔓延。<em>芽孢杆菌</em>类微生物是超级活跃的定殖者，它们在物理上覆盖了叶片表面，剥夺了病原真菌的生存空间和营养。
        </p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-lime-100 p-2 rounded-lg text-lime-600 shadow-sm flex-shrink-0"><Icon name="activity" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800">诱导系统抗性 (ISR)</h4>
        </div>
        <p className="text-lg font-medium text-slate-600 mb-4 leading-relaxed flex-1">
          就像为树木注射疫苗一样。当细菌在植物上定殖时，它们会向植物组织发送化学信号，触发植物自身的免疫系统，从而自然地硬化植物细胞壁以抵御未来的攻击。
        </p>
      </div>
    </div>
    
    <div className="mt-6 p-4 bg-lime-50 text-lime-900 rounded-xl flex items-center gap-4 border border-lime-200 shadow-inner">
      <Icon name="info" className="w-8 h-8 text-lime-600 flex-shrink-0" />
      <span className="text-lg font-medium"><strong>爆发期专业提示：</strong>由于叶枯病在潮湿条件下的传播速度极快，生物制剂在<strong>预防</strong>方面效果最好。对于活跃的爆发期，先使用合成药物(如戊菌隆或噻呋酰胺)快速击倒病菌，一周后再喷施芽孢杆菌以保护新生枝叶并防止复发。</span>
    </div>
  </div>
);

// --- THE BIG 15 MICROBES GUIDE COMPONENT ---
const MicrobeGuide = () => (
  <div className="bg-white border-2 border-teal-100 rounded-2xl p-6 mt-4 mb-4 shadow-md animate-in fade-in slide-in-from-top-4">
    <p className="text-lg text-slate-600 font-medium mb-6">
      <strong>益生菌农艺学</strong>使用活的微生物作为生物武器和土壤合成器。通过将这 15 种精英微生物引入您的轮作计划，您可以在果园中建立一个自我维持的有机防御网：
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-teal-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-teal-100 p-2.5 rounded-lg text-teal-600 shadow-sm"><Icon name="bug" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">球孢白僵菌</h4>
        </div>
        <p className="text-sm font-extrabold text-teal-800 mb-3 uppercase tracking-wider">白色木乃伊刺客</p>
        <p className="text-slate-700 text-lg leading-relaxed font-medium">一种接触杀虫真菌，能够穿透昆虫外骨骼并吸干其养分，将它们变成毛茸茸的白色木乃伊。最好与轻质园艺油混合使用。<br/><br/><strong className="text-slate-900">目标靶点：</strong>粉蚧，蚧壳虫，露尾甲，蛀虫。</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-emerald-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-600 shadow-sm"><Icon name="target" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">绿僵菌</h4>
        </div>
        <p className="text-sm font-extrabold text-emerald-800 mb-3 uppercase tracking-wider">绿色地下刺客</p>
        <p className="text-slate-700 text-lg leading-relaxed font-medium">一种栖息在土壤中的杀手真菌，专门感染并消耗硬壳甲虫和地下蛴螬，在死去的宿主身上留下坚硬的绿色硬壳。<br/><br/><strong className="text-slate-900">目标靶点：</strong>犀角金龟，鳃金龟蛴螬，白蚁。</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-violet-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-violet-100 p-2.5 rounded-lg text-violet-600 shadow-sm"><Icon name="activity" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">莱氏绿僵菌 (莱氏野村菌)</h4>
        </div>
        <p className="text-sm font-extrabold text-violet-800 mb-3 uppercase tracking-wider">毛虫潜行者</p>
        <p className="text-slate-700 text-lg leading-relaxed font-medium">一接触就会将毛虫变成僵硬的木乃伊雕像，表面覆盖着淡绿色的孢子。对付高度活跃的食叶和蛀果毛虫效果极佳。<br/><br/><strong className="text-slate-900">目标靶点：</strong>蛀果蛾，蓑蛾，卷叶蛾。</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-sky-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-sky-100 p-2.5 rounded-lg text-sky-600 shadow-sm"><Icon name="leaf" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">蜡蚧轮枝菌</h4>
        </div>
        <p className="text-sm font-extrabold text-sky-800 mb-3 uppercase tracking-wider">吸汁害虫溶解剂</p>
        <p className="text-slate-700 text-lg leading-relaxed font-medium">在高湿度的树冠中茁壮成长，能直接溶解软体吸汁昆虫的角质层。独特之处在于，它能主动消化蜜露，瞬间治愈煤烟病。<br/><br/><strong className="text-slate-900">目标靶点：</strong>蚜虫，粉虱，木虱。</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-yellow-400 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-yellow-100 p-2.5 rounded-lg text-yellow-600 shadow-sm"><Icon name="sun" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">玫烟色棒束孢 (球孢白僵菌亚种)</h4>
        </div>
        <p className="text-sm font-extrabold text-yellow-800 mb-3 uppercase tracking-wider">树冠清道夫</p>
        <p className="text-slate-700 text-lg leading-relaxed font-medium">与其他真菌相比，对温度波动和阳光照射的适应力极强。非常适合对付高层树冠的害虫，用粉灰色的绒毛覆盖它们。<br/><br/><strong className="text-slate-900">目标靶点：</strong>茶黄蓟马，粉虱，蚜虫。</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-pink-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-pink-100 p-2.5 rounded-lg text-pink-600 shadow-sm"><Icon name="target" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">汤普森被毛孢</h4>
        </div>
        <p className="text-sm font-extrabold text-pink-800 mb-3 uppercase tracking-wider">红蜘蛛毁灭者</p>
        <p className="text-slate-700 text-lg leading-relaxed font-medium">高度专业化的蜘蛛螨类猎手。穿透螨虫角质层并产生致瘫毒素。能够在地势较低的螨虫群落中引发大规模的“真菌瘟疫”。<br/><br/><strong className="text-slate-900">目标靶点：</strong>红蜘蛛，茶黄螨，瘿螨。</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-amber-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-amber-100 p-2.5 rounded-lg text-amber-600 shadow-sm"><Icon name="shield" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">枯草芽孢杆菌</h4>
        </div>
        <p className="text-sm font-extrabold text-amber-800 mb-3 uppercase tracking-wider">韧性防护盾</p>
        <p className="text-slate-700 text-lg leading-relaxed font-medium">一种坚韧、能形成芽孢的细菌，对紫外线高度耐受。产生强大的天然抗生素(伊枯草菌素)来抑制广谱的叶片病害。也能作为强大的生物过滤器，利用EPS中和土壤中有毒的重金属。<br/><br/><strong className="text-slate-900">目标靶点：</strong>炭疽病，霉病，叶斑病，铜中毒。</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-indigo-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-100 p-2.5 rounded-lg text-indigo-600 shadow-sm"><Icon name="droplets" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">荧光假单胞菌</h4>
        </div>
        <p className="text-sm font-extrabold text-indigo-800 mb-3 uppercase tracking-wider">铁元素掠夺者</p>
        <p className="text-slate-700 text-lg leading-relaxed font-medium">一种具有强侵略性的根系/土壤细菌。它利用铁载体在土壤中与致病真菌激烈争夺铁元素，将病原菌"饿死"，同时增强树木的免疫力。<br/><br/><strong className="text-slate-900">目标靶点：</strong>疫霉病，腐霉根腐病。</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-rose-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-rose-100 p-2.5 rounded-lg text-rose-600 shadow-sm"><Icon name="activity" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">链霉菌属</h4>
        </div>
        <p className="text-sm font-extrabold text-rose-800 mb-3 uppercase tracking-wider">天然生物抗生素</p>
        <p className="text-slate-700 text-lg leading-relaxed font-medium">以生产天然抗生素而闻名的土壤细菌。它们分泌挥发性有机化合物，能够直接溶解极具侵略性的木材腐烂菌的细胞壁。<br/><br/><strong className="text-slate-900">目标靶点：</strong>枝枯病，长喙壳菌(猝萎病)，白根病。</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-fuchsia-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-fuchsia-100 p-2.5 rounded-lg text-fuchsia-600 shadow-sm"><Icon name="x" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">淡紫拟青霉</h4>
        </div>
        <p className="text-sm font-extrabold text-fuchsia-800 mb-3 uppercase tracking-wider">线虫猎手</p>
        <p className="text-slate-700 text-lg leading-relaxed font-medium">一种高度专业化、主动猎杀线虫的真菌。它的孢子会寄生线虫的卵和雌性成虫，将其溶解并彻底打破线虫的世代繁殖周期。<br/><br/><strong className="text-slate-900">目标靶点：</strong>根结线虫，根腐线虫。</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-orange-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-orange-100 p-2.5 rounded-lg text-orange-600 shadow-sm"><Icon name="calculator" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">拜氏青霉菌</h4>
        </div>
        <p className="text-sm font-extrabold text-orange-800 mb-3 uppercase tracking-wider">解磷钥匙</p>
        <p className="text-slate-700 text-lg leading-relaxed font-medium">一种有益的根部真菌，分泌有机酸来溶解土壤中被锁定的磷元素。能大规模促进根系质量增长，直接预防因营养胁迫诱发的根腐病。<br/><br/><strong className="text-slate-900">目标靶点：</strong>根系受压，营养锁定现象。</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-lime-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-lime-100 p-2.5 rounded-lg text-lime-600 shadow-sm"><Icon name="activity" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">哈茨木霉</h4>
        </div>
        <p className="text-sm font-extrabold text-lime-800 mb-3 uppercase tracking-wider">真菌寄生客</p>
        <p className="text-slate-700 text-lg leading-relaxed font-medium">一种极具攻击性的有益真菌，实行重寄生行为(寄生于真菌)。它真的会追踪致病真菌，盘绕在它们身上，并分泌酶来溶解和吃掉敌方的细胞壁。<br/><br/><strong className="text-slate-900">目标靶点：</strong>疫霉病，腐霉病，丝核菌。</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-cyan-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-cyan-100 p-2.5 rounded-lg text-cyan-600 shadow-sm"><Icon name="shield" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">贝莱斯芽孢杆菌</h4>
        </div>
        <p className="text-sm font-extrabold text-cyan-800 mb-3 uppercase tracking-wider">脂肽类战士</p>
        <p className="text-slate-700 text-lg leading-relaxed font-medium">能合成强大的天然抗真菌化合物（伊枯草菌素、表面活性素），能瞬间在致病真菌的脂质膜上撕开孔洞，导致侵略性枯萎病菌迅速细胞死亡。<br/><br/><strong className="text-slate-900">目标靶点：</strong>丝核菌叶枯病，各种病原真菌。</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-fuchsia-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-fuchsia-100 p-2.5 rounded-lg text-fuchsia-600 shadow-sm"><Icon name="target" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">解淀粉芽孢杆菌</h4>
        </div>
        <p className="text-sm font-extrabold text-fuchsia-800 mb-3 uppercase tracking-wider">空间竞争霸主</p>
        <p className="text-slate-700 text-lg leading-relaxed font-medium">与贝莱斯芽孢杆菌发挥完美的协同作用。它是一个超级活跃的定殖者，迅速覆盖叶片表面，剥夺入侵叶枯病菌丝的生长空间和营养。<br/><br/><strong className="text-slate-900">目标靶点：</strong>丝核菌，细菌性叶斑病。</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-blue-300 transition-colors shadow-sm lg:col-span-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 shadow-sm"><Icon name="rain" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">EM菌 (有效微生物群)</h4>
        </div>
        <p className="text-sm font-extrabold text-blue-800 mb-3 uppercase tracking-wider">土壤生态合成器</p>
        <p className="text-slate-700 text-lg leading-relaxed font-medium">由乳酸菌、酵母菌和光合细菌组成的联合体。能极快地将死去的覆盖物发酵转化为营养，并强势排挤会造成腐烂的厌氧环境。<br/><br/><strong className="text-slate-900">目标靶点：</strong>土壤毒性(重金属累积)，病虫害繁殖地。</p>
      </div>
    </div>

    {/* HEAVY METAL DETOXIFICATION INFO BOX */}
    <div className="mt-8 p-6 bg-emerald-950 text-emerald-50 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-5 border-2 border-emerald-800 shadow-lg">
      <div className="bg-emerald-900 p-4 rounded-full flex-shrink-0 border border-emerald-700 shadow-inner">
        <Icon name="shield" className="w-8 h-8 text-emerald-400" />
      </div>
      <div>
        <strong className="text-emerald-300 block mb-2 text-lg uppercase tracking-widest font-black">隐藏优势：重金属解毒 (生物修复)</strong>
        <p className="text-lg font-medium leading-relaxed text-emerald-100/90">
          几十年长期使用化肥和<strong className="text-white">铜制剂杀菌剂</strong> (FRAC M01) 会导致土壤中积累有毒重金属，最终毒害树木的吸收根（铜中毒）。诸如 <strong>枯草芽孢杆菌</strong>、<strong>假单胞菌</strong>、<strong>木霉菌</strong>和<strong>EM菌</strong>等微生物充当着天然的生物过滤器。它们分泌生物表面活性剂、EPS（粘性聚合物）和酶类，这些物质在土壤中主动绑定、中和并锁定多余的重金属，从而将根系从化学烧伤中拯救出来。
        </p>
      </div>
    </div>
  </div>
);

// --- DT50 LIFESPAN REFERENCE GUIDE COMPONENT ---
const DT50Guide = () => {
  const getFoliarColor = (val) => {
    if (val.includes('Infinite') || val.includes('永久')) return 'bg-red-100 text-red-800 border-red-200';
    if (val.includes('Weeks') || val.includes('Variable') || val.includes('数周') || val.includes('多变')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (val === 'N/A' || val === '无') return 'bg-slate-100 text-slate-500 border-slate-200';
    const num = parseFloat(val.match(/\d+(\.\d+)?/)?.[0] || 0);
    if (val.includes('<') && num <= 1) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (num <= 3) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (num <= 7) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getSoilColor = (val) => {
    if (val.includes('Infinite') || val.includes('100 -') || val.includes('永久')) return 'bg-red-100 text-red-800 border-red-200';
    if (val.includes('Indefinite') || val.includes('Variable') || val.includes('Weeks') || val.includes('无限期') || val.includes('数周') || val.includes('多变')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    const num = parseFloat(val.match(/\d+(\.\d+)?/)?.[0] || 0);
    if (val.includes('<') && num <= 1) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (num <= 30) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (num <= 70) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const translateLifespan = (text) => {
    return text.replace('Days', '天').replace('Day', '天')
               .replace('Infinite', '永久').replace('Weeks/Months', '数周/数月')
               .replace('Weeks', '数周').replace('Variable', '多变')
               .replace('Indefinite', '无限期').replace('N/A', '无');
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-0 mt-4 mb-4 shadow-md animate-in fade-in slide-in-from-top-4 overflow-hidden">
      
      {/* Intro Header */}
      <div className="bg-sky-50 p-6 border-b border-sky-100">
        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-3">
          <Icon name="clock" className="w-7 h-7 text-sky-600" />
          农药环境半衰期 (DT₅₀) 数据库
        </h3>
        <p className="text-lg text-slate-700 font-medium leading-relaxed">
          <strong>DT₅₀ (降解50%所需时间)</strong> 是指活性成分分解一半所需要的时间。
          <br/><strong className="text-sky-700">叶面 DT₅₀ (光解):</strong> 在紫外线阳光照射下留在叶片上的寿命。决定了采收安全性和 MRL (最大残留限量)。
          <br/><strong className="text-amber-700">土壤 DT₅₀:</strong> 在地下的寿命。高度持久的化学物质 (大于100天) 会造成累积并破坏土壤生态。
        </p>
      </div>

      {/* MRL Warning Box */}
      <div className="bg-rose-50 p-5 border-b-2 border-rose-200 flex flex-col md:flex-row gap-4 items-start shadow-inner">
        <div className="bg-rose-100 p-2.5 rounded-full flex-shrink-0 mt-1">
          <Icon name="alert" className="w-6 h-6 text-rose-600" />
        </div>
        <div>
          <strong className="text-rose-900 block mb-1 text-lg uppercase tracking-wider">农艺师专业提示：农残 (MRL) 与出口限制</strong>
          <p className="text-lg text-rose-800 leading-relaxed font-medium">
            如果您要出口榴莲，任何<strong>叶面 DT₅₀ 大于 7 天</strong>的化学药剂（例如氯虫苯甲酰胺、嘧菌酯），必须在<strong>采收前至少 30 到 45 天</strong>完全从您的喷洒计划中剔除。在最后的果实成熟阶段，请坚持使用快速降解的化学品（叶面 DT₅₀ 小于 3 天）或纯生物制剂，以确保顺利通过海关的农药残留检测。
          </p>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider">
              <th className="px-3 py-2.5 font-bold w-1/5">有效成分 (活性物质)</th>
              <th className="px-2 py-2.5 font-bold text-center w-24">作用机制(MoA)</th>
              <th className="px-2 py-2.5 font-bold text-center w-28">叶面 DT₅₀ (紫外线)</th>
              <th className="px-2 py-2.5 font-bold text-center w-28">土壤 DT₅₀</th>
              <th className="px-3 py-2.5 font-bold">农艺备注</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {['Insecticide', 'Fungicide', 'Bio/Other'].map(type => (
              <React.Fragment key={type}>
                <tr className="bg-slate-50 border-y border-slate-200">
                  <td colSpan="5" className="px-3 py-2 font-black text-slate-800 text-xs uppercase tracking-wider">
                    {type === 'Insecticide' ? '杀虫剂与杀螨剂' : type === 'Fungicide' ? '杀菌剂' : '植物源、生物制剂与杀软体动物剂'}
                  </td>
                </tr>
                {DT50_DATABASE.filter(item => item.type === type).map((chem, idx) => (
                  <tr key={idx} className="hover:bg-sky-50/50 transition-colors">
                    <td className="px-3 py-2.5">
                      <span className="font-extrabold text-slate-800 block text-sm leading-tight">{chem.name}</span>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md border border-slate-200 whitespace-nowrap">
                        {chem.moa}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap shadow-sm ${getFoliarColor(translateLifespan(chem.foliar))}`}>
                        {translateLifespan(chem.foliar)}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap shadow-sm ${getSoilColor(translateLifespan(chem.soil))}`}>
                        {translateLifespan(chem.soil)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[15px] text-slate-600 font-medium leading-snug">
                      {chem.notes.zh}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
};


// --- 叶片卷曲诊断图（内嵌 SVG，无需联网） ---
// 手绘植物学诊断图，直接展示每种卷曲模式的成因机理。
// 通过 id 区分两种诊断图：'downward_curl' 和 'upward_curl'。
const AIIllustration = ({ id, alt }) => {
  if (id === 'downward_curl') {
    return (
      <div className="relative mb-4 w-full h-48 rounded-xl border-2 border-slate-200 shadow-sm bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <svg viewBox="0 0 680 240" className="w-full h-full" role="img" aria-label={alt} xmlns="http://www.w3.org/2000/svg">
          <title>向下卷曲诊断图</title>
          {/* 叶片上表面（凸面，健康绿色） */}
          <path d="M 100 90 Q 340 20, 580 90 Q 575 105, 570 112 Q 340 48, 110 112 Q 105 105, 100 90 Z"
                fill="#639922" stroke="#3B6D11" strokeWidth="1"/>
          {/* 叶片背面（凹面，害虫聚集处） */}
          <path d="M 110 112 Q 340 48, 570 112 L 540 180 Q 340 110, 140 180 L 110 112 Z"
                fill="#97C459" stroke="#3B6D11" strokeWidth="0.5" opacity="0.95"/>
          {/* 卷曲的叶缘 */}
          <path d="M 100 90 Q 95 160, 140 180" fill="none" stroke="#3B6D11" strokeWidth="1.2"/>
          <path d="M 580 90 Q 585 160, 540 180" fill="none" stroke="#3B6D11" strokeWidth="1.2"/>
          {/* 主脉 */}
          <path d="M 110 112 Q 340 48, 570 112" fill="none" stroke="#27500A" strokeWidth="1.5" opacity="0.6"/>
          {/* 侧脉 */}
          <path d="M 200 105 Q 240 135, 260 175" fill="none" stroke="#27500A" strokeWidth="0.5" opacity="0.4"/>
          <path d="M 280 90 Q 300 125, 310 170" fill="none" stroke="#27500A" strokeWidth="0.5" opacity="0.4"/>
          <path d="M 400 90 Q 380 125, 370 170" fill="none" stroke="#27500A" strokeWidth="0.5" opacity="0.4"/>
          <path d="M 480 105 Q 440 135, 420 175" fill="none" stroke="#27500A" strokeWidth="0.5" opacity="0.4"/>
          {/* 害虫聚集点（叶背） */}
          <g fill="#4A1B0C" opacity="0.85">
            <circle cx="220" cy="155" r="3"/><circle cx="235" cy="160" r="2.5"/>
            <circle cx="250" cy="165" r="3"/><circle cx="265" cy="160" r="2"/>
            <circle cx="290" cy="155" r="3"/><circle cx="310" cy="160" r="2.5"/>
            <circle cx="340" cy="155" r="3.5"/><circle cx="370" cy="160" r="2.5"/>
            <circle cx="395" cy="155" r="3"/><circle cx="420" cy="160" r="2"/>
            <circle cx="440" cy="165" r="3"/><circle cx="460" cy="160" r="2.5"/>
          </g>
          {/* 向下卷曲箭头 */}
          <path d="M 100 50 Q 105 35, 130 45" fill="none" stroke="#D85A30" strokeWidth="2" strokeLinecap="round"/>
          <polygon points="125,40 138,46 130,53" fill="#D85A30"/>
          <path d="M 580 50 Q 575 35, 550 45" fill="none" stroke="#D85A30" strokeWidth="2" strokeLinecap="round"/>
          <polygon points="555,40 542,46 550,53" fill="#D85A30"/>
          {/* 标注 */}
          <text x="60" y="65" fontFamily="sans-serif" fontSize="11" fill="#27500A" fontWeight="600">叶面</text>
          <text x="60" y="78" fontFamily="sans-serif" fontSize="9" fill="#3B6D11" opacity="0.8">（外凸）</text>
          <text x="540" y="205" fontFamily="sans-serif" fontSize="11" fill="#4A1B0C" fontWeight="600">害虫</text>
          <text x="540" y="218" fontFamily="sans-serif" fontSize="9" fill="#993C1D">藏于叶背</text>
        </svg>
        <div className="absolute bottom-1.5 right-2 bg-white/90 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider backdrop-blur-sm shadow-sm pointer-events-none">
          诊断图
        </div>
      </div>
    );
  }

  if (id === 'upward_curl') {
    return (
      <div className="relative mb-4 w-full h-48 rounded-xl border-2 border-slate-200 shadow-sm bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <svg viewBox="0 0 680 240" className="w-full h-full" role="img" aria-label={alt} xmlns="http://www.w3.org/2000/svg">
          <title>向上翻卷诊断图</title>
          {/* 健康的绿色中部（凹面，向上翻起） */}
          <path d="M 140 110 Q 340 160, 540 110 L 545 140 Q 340 190, 135 140 L 140 110 Z"
                fill="#639922" stroke="#3B6D11" strokeWidth="1"/>
          {/* 左侧焦枯叶缘向上翻 */}
          <path d="M 60 50 Q 100 30, 140 60 L 140 110 Q 100 105, 60 90 L 60 50 Z"
                fill="#854F0B" stroke="#633806" strokeWidth="0.5"/>
          <path d="M 70 55 Q 90 52, 110 60" fill="none" stroke="#412402" strokeWidth="0.6" opacity="0.7"/>
          <path d="M 65 70 Q 95 68, 125 78" fill="none" stroke="#412402" strokeWidth="0.6" opacity="0.7"/>
          <path d="M 68 85 Q 100 84, 130 98" fill="none" stroke="#412402" strokeWidth="0.6" opacity="0.5"/>
          <path d="M 60 50 L 55 45 L 62 42 L 58 36 L 66 38 L 64 30" fill="none" stroke="#633806" strokeWidth="0.8"/>
          {/* 右侧焦枯叶缘向上翻 */}
          <path d="M 620 50 Q 580 30, 540 60 L 540 110 Q 580 105, 620 90 L 620 50 Z"
                fill="#854F0B" stroke="#633806" strokeWidth="0.5"/>
          <path d="M 610 55 Q 590 52, 570 60" fill="none" stroke="#412402" strokeWidth="0.6" opacity="0.7"/>
          <path d="M 615 70 Q 585 68, 555 78" fill="none" stroke="#412402" strokeWidth="0.6" opacity="0.7"/>
          <path d="M 612 85 Q 580 84, 550 98" fill="none" stroke="#412402" strokeWidth="0.6" opacity="0.5"/>
          <path d="M 620 50 L 625 45 L 618 42 L 622 36 L 614 38 L 616 30" fill="none" stroke="#633806" strokeWidth="0.8"/>
          {/* 过渡带（黄褐色） */}
          <path d="M 140 60 L 140 110 L 135 140 Q 142 125, 142 90 L 140 60 Z" fill="#BA7517" opacity="0.5"/>
          <path d="M 540 60 L 540 110 L 545 140 Q 538 125, 538 90 L 540 60 Z" fill="#BA7517" opacity="0.5"/>
          {/* 鲜绿色主脉 */}
          <path d="M 140 135 Q 340 175, 540 135" fill="none" stroke="#173404" strokeWidth="2.5"/>
          <path d="M 140 135 Q 340 175, 540 135" fill="none" stroke="#639922" strokeWidth="1.5"/>
          {/* 侧脉 */}
          <path d="M 220 125 Q 240 145, 250 160" fill="none" stroke="#27500A" strokeWidth="0.5" opacity="0.5"/>
          <path d="M 290 130 Q 305 150, 310 165" fill="none" stroke="#27500A" strokeWidth="0.5" opacity="0.5"/>
          <path d="M 390 130 Q 375 150, 370 165" fill="none" stroke="#27500A" strokeWidth="0.5" opacity="0.5"/>
          <path d="M 460 125 Q 440 145, 430 160" fill="none" stroke="#27500A" strokeWidth="0.5" opacity="0.5"/>
          {/* 向上翻卷箭头 */}
          <path d="M 90 18 Q 95 5, 110 12" fill="none" stroke="#D85A30" strokeWidth="2" strokeLinecap="round"/>
          <polygon points="105,8 117,14 110,21" fill="#D85A30"/>
          <path d="M 590 18 Q 585 5, 570 12" fill="none" stroke="#D85A30" strokeWidth="2" strokeLinecap="round"/>
          <polygon points="575,8 563,14 570,21" fill="#D85A30"/>
          {/* 标注 */}
          <text x="60" y="155" fontFamily="sans-serif" fontSize="11" fill="#633806" fontWeight="600">焦枯</text>
          <text x="60" y="168" fontFamily="sans-serif" fontSize="9" fill="#854F0B">褐色叶缘</text>
          <text x="555" y="155" fontFamily="sans-serif" fontSize="11" fill="#633806" fontWeight="600">焦枯</text>
          <text x="555" y="168" fontFamily="sans-serif" fontSize="9" fill="#854F0B">褐色叶缘</text>
          <text x="340" y="215" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fill="#3B6D11" fontWeight="600">中央主脉保持鲜绿</text>
        </svg>
        <div className="absolute bottom-1.5 right-2 bg-white/90 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider backdrop-blur-sm shadow-sm pointer-events-none">
          诊断图
        </div>
      </div>
    );
  }

  return null;
};

export default function ZhApp() {
  const { lang, setLang } = useLang();
  // Organic editor — which pest is being edited (or null if none)
  const [editingPest, setEditingPest] = useState(null);
  // Bumps to force re-render after a save so the "has-data" badges refresh
  const [savedTick, setSavedTick] = useState(0);
  // Collapse reference guides by default in the editor build —
  // agronomists don't need to scroll past them every time.
  const [showAllGuides, setShowAllGuides] = useState(false);
  // Enrich pests with MOA & application strings for THIS app's language.
  // Runs every render so switching languages re-applies the right values
  // (the data is shared across both apps; whichever mounts last wins, so
  // we re-apply on each render to guarantee freshness).
  ALL_PESTS.forEach(pest => {
    pest.moa = PEST_MOA_MAPPING[pest.id]?.zh || 'N/A';
    pest.application = PEST_APPLICATION_MAPPING[pest.id]?.zh || '针对性施用';
  });
  // Preserve UI state across language switches via sessionStorage.
  // Only restores within the same session — a fresh visit starts at the top.
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return sessionStorage.getItem('agripro_active_tab') || 'database';
    } catch (e) {
      return 'database';
    }
  });

  // Persist tab + scroll across remounts (e.g. language switch)
  useEffect(() => {
    try { sessionStorage.setItem('agripro_active_tab', activeTab); } catch (e) {}
  }, [activeTab]);

  useEffect(() => {
    // Restore scroll position on mount (slightly delayed so layout has stabilized)
    try {
      const saved = sessionStorage.getItem('agripro_scroll_y');
      if (saved) {
        const y = parseInt(saved, 10);
        if (!isNaN(y)) {
          requestAnimationFrame(() => window.scrollTo(0, y));
        }
      }
    } catch (e) {}

    // Throttled scroll persistence
    let pending = false;
    const onScroll = () => {
      if (pending) return;
      pending = true;
      setTimeout(() => {
        try { sessionStorage.setItem('agripro_scroll_y', String(window.scrollY)); } catch (e) {}
        pending = false;
      }, 200);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterPart, setFilterPart] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All'); 
  const [filterStage, setFilterStage] = useState('All Stages'); 
  const [viewMode, setViewMode] = useState('list'); 
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [showTrappingGuide, setShowTrappingGuide] = useState(false);
  const [showLightGuide, setShowLightGuide] = useState(false);
  const [showDiagGuide, setShowDiagGuide] = useState(false);
  const [showMixGuide, setShowMixGuide] = useState(false);
  const [showBioGuide, setShowBioGuide] = useState(false);
  const [showMicrobeGuide, setShowMicrobeGuide] = useState(false);
  const [showDT50Guide, setShowDT50Guide] = useState(false);

  // --- N-CALCULATOR STATE ---
  const [showNCalc, setShowNCalc] = useState(false);
  const [calcNPercent, setCalcNPercent] = useState(15);
  const [calcBagWeight, setCalcBagWeight] = useState(25);
  const [calcTreesPerBag, setCalcTreesPerBag] = useState(25);

  const calculatedNPerTree = useMemo(() => {
    if (!calcBagWeight || !calcTreesPerBag || !calcNPercent) return 0;
    return ((calcNPercent / 100) * calcBagWeight) / calcTreesPerBag;
  }, [calcNPercent, calcBagWeight, calcTreesPerBag]);

  // --- SIMULATOR STATE ---
  const [stage, setStage] = useState('vegetative'); 
  const [nitrogen, setNitrogen] = useState(0.4); 
  const [rain, setRain] = useState('low');
  const [humidity, setHumidity] = useState(70);
  const [dryDays, setDryDays] = useState(3);
  const [nearForest, setNearForest] = useState(false);
  const [risks, setRisks] = useState({ sapSuckers: 0, borers: 0, fungal: 0, wildlife: 0 });

  // Add logic to determine if the current stage is critical for formulations
  const isCriticalStage = useMemo(() => {
    const criticalStages = ['pre-flowering', 'flower-bud', 'matchstick', 'full-bloom', 'early-fruit', 'wave-1-culling', 'wave-2-flush', 'rapid-expansion', 'maturation'];
    return criticalStages.includes(stage);
  }, [stage]);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const sapStages = ['seedling', 'vegetative', 'wave-2-flush', 'post-harvest'];
    const borerStages = ['early-fruit', 'wave-1-culling', 'wave-2-flush', 'rapid-expansion', 'maturation'];
    const wildlifeStages = ['rapid-expansion', 'maturation'];

    let sap = (sapStages.includes(stage) ? 40 : 10) + (nitrogen * 30) + (dryDays > 4 ? 20 : 0);
    let bor = (borerStages.includes(stage) ? 60 : 10) + (rain === 'moderate' ? 10 : 0);
    let fun = (rain === 'high' ? 50 : (rain === 'moderate' ? 20 : 0)) + (humidity > 80 ? 30 : 0);
    let wild = (nearForest ? 50 : 0) + (wildlifeStages.includes(stage) ? 40 : 0);

    setRisks({
      sapSuckers: Math.min(100, Math.round(sap)),
      borers: Math.min(100, Math.round(bor)),
      fungal: Math.min(100, Math.round(fun)),
      wildlife: Math.min(100, Math.round(wild))
    });
  }, [stage, nitrogen, rain, humidity, dryDays, nearForest]);

  const filteredPests = useMemo(() => {
    return ALL_PESTS.filter(pest => {
      const matchCat = filterCat === 'All' || pest.category === filterCat;
      const matchPart = filterPart === 'All' || pest.part === filterPart || pest.part === 'General';
      // Bilingual (and future-proof) search: match any language variant of common name + scientific name.
      const q = search.toLowerCase();
      const matchSearch =
        Object.values(pest.common).some(v => typeof v === 'string' && v.toLowerCase().includes(q)) ||
        pest.scientific.toLowerCase().includes(q);
      
      let matchSeverity = true;
      if (filterSeverity === 'Critical') matchSeverity = pest.severity >= 4;
      if (filterSeverity === 'Moderate') matchSeverity = pest.severity <= 3;

      let matchLifeStage = true;
      if (filterCat === 'All' || filterCat === 'Insects') {
         if (filterStage === 'Juveniles') {
             matchLifeStage = /(若虫|蛴螬|幼蚧|毛虫|蛆|幼虫)/i.test(pest.common.zh);
         } else if (filterStage === 'Adults') {
             if (pest.category === 'Insects') {
                 matchLifeStage = !/(若虫|蛴螬|幼蚧|毛虫|蛆|幼虫)/i.test(pest.common.zh);
             }
         }
      }

      return matchCat && matchPart && matchSearch && matchSeverity && matchLifeStage;
    });
  }, [search, filterCat, filterPart, filterSeverity, filterStage]);

  const handleShare = (pest) => {
    let moaText = '';
    const categorizedMoa = categorizeMoa(pest.moa, pest.category);
    
    if (categorizedMoa && pest.moa !== 'N/A' && !['Vertebrates'].includes(pest.category)) {
      moaText = '\n\n[3阶段执行策略]';
      [1, 2, 3].forEach(phaseNum => {
        const items = categorizedMoa[phaseNum];
        if (items && items.length > 0) {
          const phaseInfo = getPhaseInfo(phaseNum, pest.category);
          moaText += `\n\n[${phaseInfo.step}]: ${phaseInfo.title}\n`;
          moaText += items.join('  (4-7天后) 轮换至 -> ');
        }
      });
    }

    const sprayTarget = pest.application && !['Vertebrates'].includes(pest.category) ? `\n\n[喷洒靶点]: ${pest.application}` : `\n\n[管理靶点]: ${pest.target.zh}`;

    const text = `AgriPro 病虫害管理警报\n\n` +
                 `目标: ${pest.common.zh}\n` +
                 `学名: ${pest.scientific}\n` +
                 `严重等级: ${pest.severity} / 5\n` +
                 `活动时间: ${translateActivity(pest.activity)}\n\n` +
                 `[症状与识别]:\n${pest.symptoms.zh}\n\n` +
                 `[防治总结]:\n${pest.control.zh}` + 
                 sprayTarget + 
                 moaText;
    
    // 使用官方推荐的 wa.me 链接，移动端兼容性更好
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    
    // 动态创建 <a> 标签模拟物理点击，有效绕过移动端和 iframe 的弹窗拦截 (Popup Blocker)
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRiskColor = (score) => score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-orange-500' : 'bg-emerald-500';
  const getRiskText = (score) => score >= 70 ? 'text-red-700' : score >= 40 ? 'text-orange-700' : 'text-emerald-700';

  // Map English internal category state to Chinese for display
  const categoryDisplayMap = {
    'All': '全部',
    'Insects': '昆虫',
    'Fungi/Pathogens': '真菌/病原体',
    'Mites/Nematodes': '螨虫/线虫',
    'Vertebrates': '野生动物',
    'Molluscs': '软体动物',
    'Weeds/Epiphytes': '杂草/附生植物'
  };

  const partDisplayMap = {
    'Fruit/Flower': '果实/花朵',
    'Leaves': '叶片与新梢',
    'Roots': '根部与土壤',
    'Trunk/Branches': '树干与枝条',
    'General': '全树通用'
  };

  const translateStage = (stageCode) => {
    const map = {
      'Vegetative': '营养生长期', 'Flowering': '开花期', 'Fruiting': '结果期', 
      'Seedling': '幼苗期', 'Post-Harvest': '采后恢复期', 'All Stages': '所有阶段'
    };
    return map[stageCode] || stageCode;
  };

  const translateIpm = (ipmCode) => {
    const map = {
      'Chemical': '化学防治', 'Biological': '生物防治', 'Cultural': '农业防治', 'Physical': '物理防治'
    };
    return map[ipmCode] || ipmCode;
  };

  const translateActivity = (act) => {
    if (act === 'Diurnal') return '昼行性 (白天)';
    if (act === 'Nocturnal') return '夜行性 (夜晚)';
    if (act === 'Crepuscular') return '晨昏性';
    if (act === 'Continuous') return '全天候活跃';
    if (act === 'N/A') return '无';
    return act;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 relative">
      
      {showTopBtn && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[90] bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-2xl transition-all hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8"
          title="返回顶部"
        >
          <Icon name="arrow-up" className="w-8 h-8" />
        </button>
      )}

<header className="safe-top bg-purple-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-[90rem] mx-auto px-4 py-4 flex flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="flex-shrink-0 bg-purple-800 p-1 md:p-2 rounded-lg border border-purple-700 flex items-center justify-center">
              <Icon name="leaf" className="w-3.5 h-3.5 md:w-6 md:h-6 text-purple-300" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-base md:text-2xl font-bold tracking-tight leading-none text-white text-left whitespace-nowrap">
                <span className="md:hidden">榴莲病虫害管理</span>
                <span className="hidden md:inline">AGRIPRO 榴莲病虫害管理</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <div className="flex bg-emerald-950 p-1 rounded-lg border border-emerald-800">
            <button 
              onClick={() => setActiveTab('simulator')}
              className={`px-2.5 py-1.5 md:px-5 md:py-2 rounded-md text-[11px] md:text-sm font-bold flex items-center gap-1 md:gap-2 transition-all ${activeTab === 'simulator' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-400 hover:text-white'}`}
            >
              <Icon name="activity" className="hidden md:inline-block w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">风险评估</span><span className="sm:hidden">风险</span>
            </button>
            <button 
              onClick={() => setActiveTab('database')}
              className={`px-2.5 py-1.5 md:px-5 md:py-2 rounded-md text-[11px] md:text-sm font-bold flex items-center gap-1 md:gap-2 transition-all ${activeTab === 'database' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-400 hover:text-white'}`}
            >
              <Icon name="search" className="hidden md:inline-block w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">数据库</span><span className="sm:hidden">数据</span>
            </button>
          </div>
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg text-[11px] md:text-sm font-bold bg-emerald-950 border border-emerald-800 text-emerald-100 hover:bg-emerald-800 hover:text-white transition-colors flex items-center gap-1 md:gap-1.5"
              title="切换到英文"
              aria-label="Switch language"
            >
              <span className="font-bold">{lang === 'zh' ? 'EN' : '中'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[90rem] mx-auto mt-8 px-6">
        
        {/* --- TAB 1: RISK ENGINE --- */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
            <div className="lg:col-span-12">
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-start gap-3">
                <Icon name="alert" className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm md:text-base text-amber-900 leading-relaxed">
                  <span className="font-bold">仅供参考估算 — 非经验证的专业建议。</span>
                  此风险百分比是基于一般农艺假设的规划参考，尚未经过田间试验或认证农艺师的验证。
                  在做出任何防治决定之前，请务必结合您自己的果园观察和专业意见加以确认。
                </p>
              </div>
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 p-6 border-b border-slate-200 flex items-center gap-3">
                  <Icon name="settings" className="w-8 h-8 text-slate-700" />
                  <h2 className="font-bold text-2xl text-slate-900">果园环境条件</h2>
                </div>
                
                <div className="p-8 space-y-8">
                  <div className="space-y-4">
                    <label className="text-xl font-bold text-slate-800 flex items-center gap-3">
                      <Icon name="leaf" className="w-6 h-6 text-emerald-600"/> 生长阶段
                    </label>
                    <select value={stage} onChange={(e) => setStage(e.target.value)} className="w-full p-4 text-xl bg-slate-50 border-2 border-slate-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all">
                      <option value="seedling">1. 幼苗 / 移栽期</option>
                      <option value="vegetative">2. 营养生长期 (抽梢)</option>
                      <option value="pre-flowering">3. 花芽分化期</option>
                      <option value="flower-bud">4. 蟹眼期 (花蕾初期)</option>
                      <option value="matchstick">5. 火柴头期 (花序伸长)</option>
                      <option value="full-bloom">6. 盛花期</option>
                      <option value="early-fruit">7. 幼果期 (0-10天)</option>
                      <option value="wave-1-culling">8. 第一次生理落果期 (10-25天)</option>
                      <option value="wave-2-flush">9. 第二次生理落果期 (35-50天)</option>
                      <option value="rapid-expansion">10. 果实膨大期</option>
                      <option value="maturation">11. 成熟与裂果期</option>
                      <option value="post-harvest">12. 采后恢复期</option>
                    </select>
                  </div>

                  <div className="space-y-4 border-t border-slate-200 pt-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xl font-bold text-slate-800 flex items-center gap-3"><Icon name="activity" className="w-6 h-6 text-blue-600 flex-shrink-0"/> 施氮量 (公斤/树)</label>
                      <div className="flex items-center justify-between gap-4">
                        <button onClick={() => setShowNCalc(!showNCalc)} className="text-sm font-bold text-blue-600 hover:text-blue-800 underline flex items-center gap-1 whitespace-nowrap">
                          <Icon name="calculator" className="w-4 h-4 flex-shrink-0" /> 计算器
                        </button>
                        <span className="text-blue-700 font-extrabold bg-blue-100 px-3 py-1 rounded-lg text-xl">{nitrogen.toFixed(2)}</span>
                      </div>
                    </div>
                    <input type="range" min="0" max="1.5" step="0.05" value={nitrogen} onChange={(e) => setNitrogen(Number(e.target.value))} className="w-full h-3 accent-blue-600 rounded-lg"/>
                    
                    {showNCalc && (
                      <div className="bg-blue-50/50 p-6 rounded-2xl border-2 border-blue-200 mt-4 animate-in fade-in zoom-in-95">
                         <h4 className="font-extrabold text-blue-900 flex items-center gap-2 mb-4 text-lg"><Icon name="calculator" className="w-6 h-6"/> 氮元素含量计算器</h4>
                         <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">氮含量 (%)</label>
                              <input type="number" value={calcNPercent} onChange={e=>setCalcNPercent(e.target.value === '' ? '' : Number(e.target.value))} onFocus={(e) => e.target.select()} className="w-full p-4 rounded-xl border-2 border-slate-300 mt-2 text-xl font-bold text-slate-800 focus:border-blue-500 outline-none" />
                            </div>
                            <div>
                              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">包装重量 (公斤)</label>
                              <input type="number" value={calcBagWeight} onChange={e=>setCalcBagWeight(e.target.value === '' ? '' : Number(e.target.value))} onFocus={(e) => e.target.select()} className="w-full p-4 rounded-xl border-2 border-slate-300 mt-2 text-xl font-bold text-slate-800 focus:border-blue-500 outline-none" />
                            </div>
                            <div>
                              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">每包施用树数</label>
                              <input type="number" value={calcTreesPerBag} onChange={e=>setCalcTreesPerBag(e.target.value === '' ? '' : Number(e.target.value))} onFocus={(e) => e.target.select()} className="w-full p-4 rounded-xl border-2 border-slate-300 mt-2 text-xl font-bold text-slate-800 focus:border-blue-500 outline-none" />
                            </div>
                         </div>
                         <div className="flex flex-col bg-blue-100 p-5 rounded-xl mt-6 border border-blue-200 gap-4">
                           <div>
                             <span className="block text-sm text-blue-800 font-bold uppercase tracking-wider">单包总氮量: {(Number(calcNPercent||0)/100 * Number(calcBagWeight||0)).toFixed(2)} 公斤</span>
                             <span className="block text-lg md:text-2xl font-black text-blue-950 mt-1">单株纯氮量: {calculatedNPerTree.toFixed(2)} 公斤</span>
                           </div>
                           <button onClick={() => { setNitrogen(parseFloat(calculatedNPerTree.toFixed(2))); setShowNCalc(false); }} className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg rounded-xl transition-colors shadow-md">应用至滑块</button>
                         </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 border-t border-slate-200 pt-6">
                    <label className="text-xl font-bold text-slate-800 flex items-center gap-3"><Icon name="rain" className="w-6 h-6 text-cyan-600"/> 天气模式</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">降雨季节</label>
                        <select value={rain} onChange={(e) => setRain(e.target.value)} className="w-full p-4 border-2 border-slate-300 rounded-xl text-xl bg-slate-50">
                          <option value="low">旱季</option>
                          <option value="moderate">阵雨/间歇性</option>
                          <option value="high">季风 / 雨季</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">连续晴天数</label>
                        <input type="number" placeholder="例如 3" value={dryDays} onChange={(e) => setDryDays(e.target.value === '' ? '' : Number(e.target.value))} onFocus={(e) => e.target.select()} className="w-full p-4 border-2 border-slate-300 rounded-xl text-xl bg-slate-50" title="连续没有下雨的天数" />
                      </div>
                    </div>
                    <div className="pt-4">
                       <label className="text-lg font-semibold text-slate-600 flex justify-between mb-3">环境湿度 <span>{humidity}%</span></label>
                       <input type="range" min="40" max="100" value={humidity} onChange={(e) => setHumidity(Number(e.target.value))} className="w-full h-3 accent-cyan-600 rounded-lg"/>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-slate-200 pt-6">
                    <label className="flex items-center gap-3 p-4 sm:p-5 bg-amber-50 border-2 border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors">
                      <input type="checkbox" checked={nearForest} onChange={(e) => setNearForest(e.target.checked)} className="w-6 h-6 flex-shrink-0 accent-amber-600"/>
                      <span className="text-base sm:text-xl font-bold text-amber-900 flex items-center gap-2"><Icon name="leaf" className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"/> 果园靠近原始森林或丛林</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div><h3 className="font-extrabold text-slate-900 text-2xl">吸汁害虫</h3><p className="text-lg text-slate-600 mt-1">青蚊, 蚧壳虫, 木虱</p></div>
                    <Icon name="bug" className={`w-10 h-10 ${getRiskText(risks.sapSuckers)}`} />
                  </div>
                  <div className="flex items-end gap-4 mt-6">
                    <span className={`text-6xl font-black ${getRiskText(risks.sapSuckers)}`}>{risks.sapSuckers}%</span>
                    <div className="flex-1 pb-2"><div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${getRiskColor(risks.sapSuckers)} transition-all duration-500`} style={{width: `${risks.sapSuckers}%`}}/></div></div>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div><h3 className="font-extrabold text-slate-900 text-2xl">蛀干/蛀果害虫</h3><p className="text-lg text-slate-600 mt-1">果蛀虫, 白蚁, 材小蠹</p></div>
                    <Icon name="bug" className={`w-10 h-10 ${getRiskText(risks.borers)}`} />
                  </div>
                  <div className="flex items-end gap-4 mt-6">
                    <span className={`text-6xl font-black ${getRiskText(risks.borers)}`}>{risks.borers}%</span>
                    <div className="flex-1 pb-2"><div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${getRiskColor(risks.borers)} transition-all duration-500`} style={{width: `${risks.borers}%`}}/></div></div>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div><h3 className="font-extrabold text-slate-900 text-2xl">真菌与病原体</h3><p className="text-lg text-slate-600 mt-1">疫霉病, 白根病, 藻斑病</p></div>
                    <Icon name="droplets" className={`w-10 h-10 ${getRiskText(risks.fungal)}`} />
                  </div>
                  <div className="flex items-end gap-4 mt-6">
                    <span className={`text-6xl font-black ${getRiskText(risks.fungal)}`}>{risks.fungal}%</span>
                    <div className="flex-1 pb-2"><div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${getRiskColor(risks.fungal)} transition-all duration-500`} style={{width: `${risks.fungal}%`}}/></div></div>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div><h3 className="font-extrabold text-slate-900 text-2xl">野生动物入侵</h3><p className="text-lg text-slate-600 mt-1">猕猴, 松鼠, 野猪</p></div>
                    <Icon name="alert" className={`w-10 h-10 ${getRiskText(risks.wildlife)}`} />
                  </div>
                  <div className="flex items-end gap-4 mt-6">
                    <span className={`text-6xl font-black ${getRiskText(risks.wildlife)}`}>{risks.wildlife}%</span>
                    <div className="flex-1 pb-2"><div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${getRiskColor(risks.wildlife)} transition-all duration-500`} style={{width: `${risks.wildlife}%`}}/></div></div>
                  </div>
                </div>
              </div>

              {/* TIERED ACTION PLAN - LIGHT THEME */}
              <div className="bg-white text-slate-900 rounded-2xl shadow-md overflow-hidden mt-8 border-2 border-slate-200">
                <div className="p-6 bg-slate-100 border-b border-slate-200 flex items-center gap-3">
                  <Icon name="alert" className="w-8 h-8 text-amber-500" />
                  <h3 className="font-extrabold text-2xl text-slate-900">分级防御行动计划</h3>
                </div>
                <div className="p-4 md:p-8 space-y-6">
                  <div className={`flex flex-col md:flex-row gap-2 md:gap-5 text-base md:text-xl p-4 md:p-5 rounded-xl border-2 transition-colors ${risks.sapSuckers >= 70 ? 'bg-red-50 border-red-200 text-red-900' : risks.sapSuckers >= 40 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <span className={`font-black w-full md:w-40 flex-shrink-0 uppercase tracking-tighter ${risks.sapSuckers >= 70 ? 'text-red-700' : risks.sapSuckers >= 40 ? 'text-amber-700' : 'text-emerald-700'}`}>吸汁害虫:</span>
                    <span className="leading-relaxed font-semibold">
                      {risks.sapSuckers >= 70 ? "爆发警报。在傍晚施用吡虫啉/啶虫脒。检查细枝是否有榴莲盾介壳虫造成的坑洞。" :
                       risks.sapSuckers >= 40 ? "种群数量增长中。施用印楝油(1%)或杀虫皂液。避免施用高氮肥以减少嫩梢的吸引力。" :
                       "预防期：悬挂黄色粘虫板进行监测。维护有益昆虫（如瓢虫/草蛉）的栖息地。"}
                    </span>
                  </div>

                  <div className={`flex flex-col md:flex-row gap-2 md:gap-5 text-base md:text-xl p-4 md:p-5 rounded-xl border-2 transition-colors ${risks.borers >= 70 ? 'bg-red-50 border-red-200 text-red-900' : risks.borers >= 40 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <span className={`font-black w-full md:w-40 flex-shrink-0 uppercase tracking-tighter ${risks.borers >= 70 ? 'text-red-700' : risks.borers >= 40 ? 'text-amber-700' : 'text-emerald-700'}`}>蛀干/蛀枝害虫:</span>
                    <span className="leading-relaxed font-semibold">
                      {risks.borers >= 70 ? "高危警报。立即部署高层树冠太阳能杀虫灯，拦截夜间飞行的蛀虫成蛾。检查树干是否有白蚁泥管或材小蠹虫粪。" :
                       risks.borers >= 40 ? "果实发育期开始。黄昏至午夜开启太阳能杀虫灯（高层），阻止飞蛾产卵。确保低层诱捕灯开启以对付鳃金龟。" :
                       "预防期：清除果园地面的落枝和腐烂果实。定期检查活树树干是否有白蚁活动迹象。"}
                    </span>
                  </div>

                  <div className={`flex flex-col md:flex-row gap-2 md:gap-5 text-base md:text-xl p-4 md:p-5 rounded-xl border-2 transition-colors ${risks.fungal >= 70 ? 'bg-red-50 border-red-200 text-red-900' : risks.fungal >= 40 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <span className={`font-black w-full md:w-40 flex-shrink-0 uppercase tracking-tighter ${risks.fungal >= 70 ? 'text-red-700' : risks.fungal >= 40 ? 'text-amber-700' : 'text-emerald-700'}`}>真菌病害:</span>
                    <span className="leading-relaxed font-semibold">
                      {risks.fungal >= 70 ? (
                        ['flower-bud', 'matchstick', 'full-bloom', 'early-fruit'].includes(stage) ? 
                          <span>高湿警报！<strong className="text-red-700 uppercase">⚠️ 零铜制剂窗口期激活！</strong>切勿使用铜制剂，否则会导致瞬间落花。立即进行亚磷酸土壤灌根，并在树冠喷施<em>枯草芽孢杆菌</em>。</span> :
                          "高湿警报。确保排水沟渠畅通，防止疫霉根颈腐烂。立即进行亚磷酸土壤灌根。"
                      ) : risks.fungal >= 40 ? (
                        ['flower-bud', 'matchstick', 'full-bloom', 'early-fruit'].includes(stage) ? 
                          <span>环境有利于孢子繁殖。<strong className="text-amber-800 uppercase">⚠️ 零铜制剂窗口期激活！</strong>切勿预防性喷洒铜制剂。改用<em>枯草芽孢杆菌</em>等软性生物制剂来保护娇嫩的花朵。</span> :
                          "环境有利于孢子繁殖。在树基部周围施用木霉菌。预防性喷洒铜制剂杀菌剂。"
                      ) : 
                       `预防期：${stage === 'post-harvest' ? '进行大型树冠结构修剪的理想时机，以为下个季节最大化气流和阳光。' : '仅进行轻微的卫生修剪（去除枯死/带病细枝）；将大型结构修剪留到采收后，以避免引起落花落果。'}`}
                    </span>
                  </div>

                  <div className={`flex flex-col md:flex-row gap-2 md:gap-5 text-base md:text-xl p-4 md:p-5 rounded-xl border-2 transition-colors ${risks.wildlife >= 70 ? 'bg-red-50 border-red-200 text-red-900' : risks.wildlife >= 40 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <span className={`font-black w-full md:w-40 flex-shrink-0 uppercase tracking-tighter ${risks.wildlife >= 70 ? 'text-red-700' : risks.wildlife >= 40 ? 'text-amber-700' : 'text-emerald-700'}`}>野生动物:</span>
                    <span className="leading-relaxed font-semibold">
                      {risks.wildlife >= 70 ? "高入侵风险。开启周边电围栏。使用锌片包裹树干以阻止果子狸。如果发现蛞蝓，施用防蜗牛颗粒诱饵。" :
                       risks.wildlife >= 40 ? "吸引力增加。清理果园边缘的森林灌木丛。安排护卫犬进行活跃巡逻。" :
                       "预防期：每月检查周边围栏并修复任何缺口。固定好垃圾桶。"}
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-2 md:gap-5 text-base md:text-xl p-4 md:p-5 rounded-xl border-2 transition-colors bg-indigo-50 border-indigo-200 text-indigo-900 mt-2">
                    <span className="font-black w-full md:w-40 flex-shrink-0 uppercase tracking-tighter text-indigo-700 flex flex-col gap-1">
                      <span className="flex items-center gap-2"><Icon name="dollar-sign" className="w-5 h-5"/> 剂型选择:</span>
                      <span className="text-sm font-bold text-indigo-500">成本控制</span>
                    </span>
                    <span className="leading-relaxed font-semibold">
                      {!isCriticalStage ? 
                        <span><strong className="text-emerald-700">节省成本模式已激活：</strong>您正处于非关键的营养生长或恢复期。为了降低运营成本，优先使用通用的<strong>粉状剂型 (如：可湿性粉剂WP、可溶粉剂SP、水分散粒剂WG)</strong>。它们具有极高的成本效益，足以满足广谱的树冠维护需求。</span> :
                        <span><strong className="text-amber-700">高级防护模式已激活：</strong>您正处于高度敏感的开花/结果期。请改用<strong>液态剂型 (如：乳油EC、悬浮剂SC、可溶剂SL、油分散浮剂OD)</strong>。虽然价格较高，但它们吸收更快、耐雨水冲刷能力更强，并且显著降低了烧伤娇嫩花朵或在优质果壳上留下白垩状残留物的风险。</span>
                      }
                    </span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: FULL PEST DATABASE WITH CUSTOM UPLOADS --- */}
        {activeTab === 'database' && (
          <div className="animate-in fade-in duration-300">
            <EditorProgressBanner tick={savedTick} />
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col gap-5">
              
              <div className="flex flex-col xl:flex-row gap-4 w-full">
                <div className="relative flex-1">
                  <Icon name="search" className="w-6 h-6 absolute left-4 top-4 text-slate-400 pointer-events-none z-10" />
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (document.activeElement && document.activeElement.blur) {
                        document.activeElement.blur();
                      }
                      const el = document.getElementById('results');
                      if (el) {
                        const top = el.getBoundingClientRect().top + window.scrollY - 72;
                        window.scrollTo({ top, behavior: 'smooth' });
                      }
                    }}
                  >
                    <input 
                      type="search" 
                      inputMode="search"
                      enterKeyHint="search"
                      placeholder="搜索病虫名称..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-14 pr-6 py-3.5 text-lg font-medium bg-slate-50 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                  </form>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                  <div className="relative w-full md:w-64 flex-shrink-0">
                    <Icon name="filter" className="w-5 h-5 absolute left-4 top-4.5 text-slate-400" />
                    <select 
                      value={filterPart}
                      onChange={(e) => setFilterPart(e.target.value)}
                      className="w-full pl-12 pr-6 py-3.5 text-lg font-bold bg-slate-50 border-2 border-slate-300 rounded-xl outline-none focus:border-emerald-500 transition-all text-slate-700"
                    >
                      <option value="All">目标部位: 全部</option>
                      <option value="Leaves">叶片与嫩梢</option>
                      <option value="Trunk/Branches">树干与枝条</option>
                      <option value="Roots">根部与土壤</option>
                      <option value="Fruit/Flower">果实与花朵</option>
                    </select>
                  </div>

                  <div className="relative w-full md:w-56 flex-shrink-0">
                    <Icon name="shield" className="w-5 h-5 absolute left-4 top-4.5 text-slate-400" />
                    <select 
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value)}
                      className="w-full pl-12 pr-6 py-3.5 text-lg font-bold bg-slate-50 border-2 border-slate-300 rounded-xl outline-none focus:border-emerald-500 transition-all text-slate-700"
                    >
                      <option value="All">严重等级: 全部</option>
                      <option value="Critical">极高危 (4-5 ●)</option>
                      <option value="Moderate">中低度 (1-3 ●)</option>
                    </select>
                  </div>

                  <div className="flex bg-slate-100 p-1 rounded-xl border-2 border-slate-200 w-full md:w-48 flex-shrink-0 h-[56px]">
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-700 border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Icon name="list" className="w-5 h-5" /> <span className="hidden md:block">列表</span>
                    </button>
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg font-bold transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-700 border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Icon name="grid" className="w-5 h-5" /> <span className="hidden md:block">网格</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto w-full pb-2 md:pb-0 hide-scrollbar pt-2 border-t border-slate-100">
                {['All', 'Insects', 'Fungi/Pathogens', 'Mites/Nematodes', 'Vertebrates', 'Molluscs', 'Weeds/Epiphytes'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => { setFilterCat(cat); setFilterStage('All Stages'); }} 
                    className={`px-5 py-2.5 rounded-full text-base font-bold whitespace-nowrap transition-colors ${filterCat === cat ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {categoryDisplayMap[cat]}
                  </button>
                ))}
              </div>

              {(filterCat === 'All' || filterCat === 'Insects') && (
                <div className="flex items-center gap-3 overflow-x-auto w-full pb-2 md:pb-0 hide-scrollbar pt-3 border-t border-slate-100 animate-in fade-in">
                  <Icon name="clock" className="w-5 h-5 text-slate-400 flex-shrink-0 hidden md:block" />
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:block">害虫发育阶段:</span>
                  {[
                    { id: 'All Stages', label: '所有发育阶段' },
                    { id: 'Juveniles', label: '🐛 幼虫/若虫/蛴螬' },
                    { id: 'Adults', label: '🦋 成虫/羽化成蛾' }
                  ].map(stage => (
                    <button 
                      key={stage.id}
                      onClick={() => setFilterStage(stage.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-2 ${filterStage === stage.id ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      {stage.label}
                    </button>
                  ))}
                </div>
              )}

            </div>

            <div className="max-w-4xl mx-auto mb-6">
              <button
                onClick={() => setShowAllGuides(!showAllGuides)}
                className="w-full bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 hover:border-slate-300 text-slate-700 p-3 rounded-xl flex justify-between items-center transition-all text-sm font-bold"
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="text-xl">📘</span>
                  <div>
                    <span className="block">{showAllGuides ? '隐藏参考指南' : '显示参考指南 (7 项)'}</span>
                    <span className="block text-xs text-slate-500 font-normal mt-0.5">田间诊断、视觉/夜间诱捕、混配、生物战、益生菌、DT₅₀ & MRL</span>
                  </div>
                </div>
                <span className="text-slate-400 text-lg">{showAllGuides ? '▴' : '▾'}</span>
              </button>
            </div>

            {showAllGuides && (filterCat === 'All' || filterCat === 'Insects' || filterCat === 'Mites/Nematodes') && (filterPart === 'All' || filterPart === 'Leaves') && (
              <div className="max-w-4xl mx-auto mb-8 flex flex-col gap-4">
                
                <div>
                  <button 
                    onClick={() => setShowDiagGuide(!showDiagGuide)}
                    className="w-full bg-indigo-50 border-2 border-indigo-100 hover:border-indigo-300 text-indigo-900 p-4 rounded-2xl flex justify-between items-center transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                        <Icon name="book-open" className="w-7 h-7" />
                      </div>
                      <div className="text-left">
                        <span className="block font-extrabold text-xl leading-tight">田间诊断：解读叶片卷曲症状</span>
                        <span className="block text-sm text-indigo-700 font-medium mt-0.5">通过观察叶片形状的变形特征来快速识别害虫类型</span>
                      </div>
                    </div>
                    <Icon name={showDiagGuide ? "chevron-up" : "chevron-down"} className="w-8 h-8 text-indigo-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                  </button>

                  {showDiagGuide && (
                    <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 mt-4 shadow-md animate-in fade-in slide-in-from-top-4">
                      <p className="text-lg text-slate-600 font-medium mb-6">
                        您知道吗？叶片卷曲的方向可以帮助您在看到害虫之前就识别出它。
                        以下是基于叶片形状的快速田间侦察指南：
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
                          <div className="flex items-center gap-3 mb-4">
                            <Icon name="chevron-down" className="w-8 h-8 text-amber-600" />
                            <h4 className="font-bold text-xl text-slate-800">向下 / 向内卷曲<br/><span className="text-sm text-slate-500 font-medium">(像杯子一样倒扣)</span></h4>
                          </div>
                          
                          <AIIllustration 
                            id="downward_curl"
                            alt="向下卷曲的榴莲叶片" 
                          />

                          <p className="text-slate-600 mb-4 leading-relaxed flex-1">
                            这表明害虫正在叶片的<strong>背面</strong>猛烈取食。它们的有毒唾液阻碍了叶背细胞的生长扩张，而叶面顶部的细胞继续生长，迫使叶片像帐篷一样向下弯曲。
                          </p>
                          <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <strong className="text-slate-800 block mb-2 uppercase tracking-wider text-xs">常见元凶:</strong>
                            <ul className="list-disc pl-5 text-amber-700 font-bold text-sm space-y-1.5">
                              <li>榴莲木虱</li>
                              <li>桔二叉蚜</li>
                              <li>侧多食跗线螨 (茶黄螨)</li>
                            </ul>
                          </div>
                          <p className="mt-4 text-sm font-bold text-indigo-600 flex items-center gap-2">
                            <Icon name="info" className="w-5 h-5 flex-shrink-0" /> 专业提示：遇到这种叶片，请务必翻过来看叶背，寻找虫群。
                          </p>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
                          <div className="flex items-center gap-3 mb-4">
                            <Icon name="chevron-up" className="w-8 h-8 text-emerald-600" />
                            <h4 className="font-bold text-xl text-slate-800">向上 / 向外翻卷<br/><span className="text-sm text-slate-500 font-medium">(呈船形)</span></h4>
                          </div>

                          <AIIllustration 
                            id="upward_curl"
                            alt="向上翻卷的榴莲叶片" 
                          />

                          <p className="text-slate-600 mb-4 leading-relaxed flex-1">
                            表明叶缘维管系统严重受损或害虫在叶面上表面取食。坏死的叶缘收缩干枯，将健康的绿色叶片中心向上拉起。
                          </p>
                          <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <strong className="text-slate-800 block mb-2 uppercase tracking-wider text-xs">常见元凶:</strong>
                            <ul className="list-disc pl-5 text-emerald-700 font-bold text-sm space-y-1.5">
                              <li>茶黄蓟马</li>
                              <li>青蚊 (叶蝉烧)</li>
                              <li>瘿螨 (卷叶螨)</li>
                            </ul>
                          </div>
                          <p className="mt-4 text-sm font-bold text-indigo-600 flex items-center gap-2">
                            <Icon name="info" className="w-5 h-5 flex-shrink-0" /> 专业提示：通常预示着具有高度移动/飞行能力的害虫入侵。
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <button 
                    onClick={() => setShowTrappingGuide(!showTrappingGuide)}
                    className="w-full bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-300 text-emerald-900 p-4 rounded-2xl flex justify-between items-center transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 group-hover:bg-emerald-200 transition-colors">
                        <Icon name="eye" className="w-7 h-7" />
                      </div>
                      <div className="text-left">
                        <span className="block font-extrabold text-xl leading-tight">昼行性害虫视觉诱捕监测</span>
                        <span className="block text-sm text-emerald-700 font-medium mt-0.5">利用颜色偏好来管理和监测昆虫爆发</span>
                      </div>
                    </div>
                    <Icon name={showTrappingGuide ? "chevron-up" : "chevron-down"} className="w-8 h-8 text-emerald-400 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
                  </button>

                  {showTrappingGuide && <TrappingGuide />}
                </div>

                <div>
                  <button 
                    onClick={() => setShowLightGuide(!showLightGuide)}
                    className="w-full bg-amber-50 border-2 border-amber-100 hover:border-amber-300 text-amber-900 p-4 rounded-2xl flex justify-between items-center transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600 group-hover:bg-amber-200 transition-colors">
                        <Icon name="lightbulb" className="w-7 h-7" />
                      </div>
                      <div className="text-left">
                        <span className="block font-extrabold text-xl leading-tight">夜间灯光诱捕 (太阳能杀虫灯)</span>
                        <span className="block text-sm text-amber-700 font-medium mt-0.5">在夜间针对蛀果蛾和鳃金龟等夜行性害虫</span>
                      </div>
                    </div>
                    <Icon name={showLightGuide ? "chevron-up" : "chevron-down"} className="w-8 h-8 text-amber-400 group-hover:text-amber-600 transition-colors flex-shrink-0" />
                  </button>

                  {showLightGuide && <LightTrappingGuide />}
                </div>

                <div>
                  <button 
                    onClick={() => setShowMixGuide(!showMixGuide)}
                    className="w-full bg-violet-50 border-2 border-violet-100 hover:border-violet-300 text-violet-900 p-4 rounded-2xl flex justify-between items-center transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-violet-100 p-2.5 rounded-xl text-violet-600 group-hover:bg-violet-200 transition-colors">
                        <Icon name="beaker" className="w-7 h-7" />
                      </div>
                      <div className="text-left">
                        <span className="block font-extrabold text-xl leading-tight">高级农艺学：农药混配与增效</span>
                        <span className="block text-sm text-violet-700 font-medium mt-0.5">黄金 pH 规则以及如何创造 1+1=3 的化学协同配方</span>
                      </div>
                    </div>
                    <Icon name={showMixGuide ? "chevron-up" : "chevron-down"} className="w-8 h-8 text-violet-400 group-hover:text-violet-600 transition-colors flex-shrink-0" />
                  </button>

                  {showMixGuide && <TankMixGuide />}
                </div>

                <div>
                  <button 
                    onClick={() => setShowBioGuide(!showBioGuide)}
                    className="w-full bg-lime-50 border-2 border-lime-100 hover:border-lime-300 text-lime-900 p-4 rounded-2xl flex justify-between items-center transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-lime-100 p-2.5 rounded-xl text-lime-600 group-hover:bg-lime-200 transition-colors">
                        <Icon name="leaf" className="w-7 h-7" />
                      </div>
                      <div className="text-left">
                        <span className="block font-extrabold text-xl leading-tight">生物战：芽孢杆菌 VS 真菌</span>
                        <span className="block text-sm text-lime-700 font-medium mt-0.5">有益细菌如何消灭丝核菌等致命病原体</span>
                      </div>
                    </div>
                    <Icon name={showBioGuide ? "chevron-up" : "chevron-down"} className="w-8 h-8 text-lime-400 group-hover:text-lime-600 transition-colors flex-shrink-0" />
                  </button>

                  {showBioGuide && <BioControlGuide />}
                </div>

                <div>
                  <button 
                    onClick={() => setShowMicrobeGuide(!showMicrobeGuide)}
                    className="w-full bg-teal-50 border-2 border-teal-100 hover:border-teal-300 text-teal-900 p-4 rounded-2xl flex justify-between items-center transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-teal-100 p-2.5 rounded-xl text-teal-600 group-hover:bg-teal-200 transition-colors">
                        <Icon name="shield" className="w-7 h-7" />
                      </div>
                      <div className="text-left">
                        <span className="block font-extrabold text-xl leading-tight">益生菌农艺学：15 大核心有益微生物</span>
                        <span className="block text-sm text-teal-700 font-medium mt-0.5">使用高级生物制剂构建果园自我维持的防御网络</span>
                      </div>
                    </div>
                    <Icon name={showMicrobeGuide ? "chevron-up" : "chevron-down"} className="w-8 h-8 text-teal-400 group-hover:text-teal-600 transition-colors flex-shrink-0" />
                  </button>

                  {showMicrobeGuide && <MicrobeGuide />}
                </div>

                <div>
                  <button 
                    onClick={() => setShowDT50Guide(!showDT50Guide)}
                    className="w-full bg-sky-50 border-2 border-sky-100 hover:border-sky-300 text-sky-900 p-4 rounded-2xl flex justify-between items-center transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-sky-100 p-2.5 rounded-xl text-sky-600 group-hover:bg-sky-200 transition-colors">
                        <Icon name="clock" className="w-7 h-7" />
                      </div>
                      <div className="text-left">
                        <span className="block font-extrabold text-xl leading-tight">农药环境半衰期 (DT₅₀) 与 农药残留期</span>
                        <span className="block text-sm text-sky-700 font-medium mt-0.5">参考环境降解时间与出口农残限制安全数据库</span>
                      </div>
                    </div>
                    <Icon name={showDT50Guide ? "chevron-up" : "chevron-down"} className="w-8 h-8 text-sky-400 group-hover:text-sky-600 transition-colors flex-shrink-0" />
                  </button>

                  {showDT50Guide && <DT50Guide />}
                </div>

              </div>
            )}

            <div id="results" className={viewMode === 'list' ? "flex flex-col gap-8 max-w-4xl mx-auto" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"}>
              {filteredPests.map(pest => {
                const primaryName = pest.scientific.split('/')[0].split(',')[0].trim();
                
                let suffixZh = "", suffixEn = "";
                const lowerCommon = pest.common.zh.toLowerCase();
                // Append BOTH Chinese and English stage terms — Chinese surfaces CN-language photos,
                // English ensures scientific/taxonomic photos still appear.
                if (lowerCommon.includes('crawler') || lowerCommon.includes('爬行若虫')) {
                  suffixZh = " 爬行若虫"; suffixEn = " crawler";
                } else if (lowerCommon.includes('nymph') || lowerCommon.includes('hopper') || lowerCommon.includes('若虫')) {
                  suffixZh = " 若虫"; suffixEn = " nymph";
                } else if (lowerCommon.includes('grub') || lowerCommon.includes('larva') || lowerCommon.includes('蛴螬') || lowerCommon.includes('幼虫')) {
                  suffixZh = " 幼虫"; suffixEn = " larva";
                } else if (lowerCommon.includes('caterpillar') || lowerCommon.includes('maggot') || lowerCommon.includes('毛虫') || lowerCommon.includes('蛆')) {
                  suffixZh = " 幼虫"; suffixEn = " larva";
                } else if (lowerCommon.includes('adult') || lowerCommon.includes('moth') || lowerCommon.includes('beetle') || lowerCommon.includes('成虫') || lowerCommon.includes('蛾')) {
                  suffixZh = " 成虫"; suffixEn = " adult";
                }
                const localName = pest.common.zh.split('/')[0].split('(')[0].split('（')[0].trim();
                // Final order: 中文名 中文阶段 学名 英文阶段 — natural Chinese reading + scientific anchor + English stage
                const searchQuery = `${localName}${suffixZh} ${primaryName}${suffixEn}`.trim();
                
                const isGrid = viewMode === 'grid';
                const categorizedMoa = categorizeMoa(pest.moa, pest.category);

                return (
                <div key={pest.id} className={`bg-white shadow-md border-2 border-slate-200 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 relative group ${isGrid ? 'rounded-2xl h-[520px]' : 'rounded-3xl'}`}>
                  
                  <div className={`flex flex-col gap-2 px-6 pt-6 ${isGrid ? 'pb-3' : 'pb-4'}`}>
                    <span className={`inline-block self-start px-3 py-1 rounded-md text-xs uppercase font-bold tracking-wider text-white shadow-sm ${
                      pest.category === 'Insects' ? 'bg-amber-600' : pest.category === 'Fungi/Pathogens' ? 'bg-blue-600' :
                      pest.category === 'Vertebrates' ? 'bg-orange-600' : pest.category === 'Molluscs' ? 'bg-pink-600' :
                      pest.category === 'Weeds/Epiphytes' ? 'bg-teal-600' : 'bg-purple-600'
                    }`}>{(pest.category === 'Insects' ? '昆虫' : pest.category === 'Fungi/Pathogens' ? '真菌/病原' : pest.category === 'Vertebrates' ? '脊椎动物' : pest.category === 'Molluscs' ? '软体动物' : pest.category === 'Weeds/Epiphytes' ? '杂草/附生植物' : pest.category === 'Mites/Nematodes' ? '螨/线虫' : pest.category)}</span>
                    <h3 className={`font-extrabold leading-tight text-slate-900 ${isGrid ? 'text-2xl' : 'text-4xl'}`}>
                      {pest.common.zh}
                    </h3>
                    {!isGrid && (
                      <p className="text-xl italic font-medium text-emerald-700">
                        {pest.scientific}
                      </p>
                    )}
                  </div>                  
                  <div className={`flex-1 bg-white flex flex-col ${isGrid ? 'p-5 space-y-4' : 'p-8 space-y-6 text-xl text-slate-900'}`}>
                    
                    <div className="flex flex-col gap-3">
                       <div className="flex items-center justify-between gap-3">
                         <div className="flex items-center gap-3">
                           <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">严重等级</span>
                           <SeverityDots rating={pest.severity} />
                         </div>
                         {isGrid && pest.activity !== 'N/A' && (
                           <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 border border-slate-200 px-2 py-1 rounded-md bg-slate-50">
                             <Icon name={getActivityIcon(pest.activity)} className="w-3.5 h-3.5 text-indigo-500" />
                             {translateActivity(pest.activity)}
                           </span>
                         )}
                       </div>
                       <div className="flex flex-wrap gap-2">
                         {pest.stages.map(s => (
                           <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold uppercase rounded-md border border-slate-200">
                             {translateStage(s)}
                           </span>
                         ))}
                       </div>
                    </div>

                    {!isGrid && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b-2 border-slate-100 mt-4">
                         <div>
                           <span className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">科名 (Family)</span>
                           <span className="font-extrabold text-slate-800 text-lg">{pest.family}</span>
                         </div>
                         <div>
                           <span className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">属名 (Genus)</span>
                           <span className="font-extrabold text-slate-800 text-lg italic">{pest.genus}</span>
                         </div>
                         <div>
                           <span className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">危害方式/类型</span>
                           <span className="font-extrabold text-slate-800 text-lg">{pest.type.zh}</span>
                         </div>
                         <div>
                           <span className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">活动规律</span>
                           <span className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                             <Icon name={getActivityIcon(pest.activity)} className="w-5 h-5 text-indigo-500" />
                             {translateActivity(pest.activity)}
                           </span>
                         </div>
                      </div>
                    )}

                    {!isGrid && (
                      <div>
                        <span className="flex items-center gap-2 text-lg font-bold text-slate-500 uppercase tracking-wider mb-2"><Icon name="leaf" className="w-5 h-5"/> 目标区域</span>
                        <p className="font-medium leading-relaxed">{pest.target.zh} ({partDisplayMap[pest.part] || pest.part})</p>
                      </div>
                    )}

                    <div>
                      {!isGrid && <span className="flex items-center gap-2 text-lg font-bold text-slate-500 uppercase tracking-wider mb-2"><Icon name="info" className="w-5 h-5"/> 症状与藏身处</span>}
                      <p className={isGrid ? "text-sm text-slate-600 line-clamp-4 leading-relaxed font-medium" : "mb-2 leading-relaxed"}>
                        {!isGrid && <strong className="text-slate-900 font-extrabold">症状: </strong>}
                        {pest.symptoms.zh}
                      </p>
                      {!isGrid && <p className="leading-relaxed"><strong className="text-slate-900 font-extrabold">藏身处:</strong> {pest.hiding.zh}</p>}
                    </div>

                    {!isGrid && pest.lifecycle.zh !== 'N/A' && (
                      <div className="bg-slate-50 p-5 rounded-xl border-2 border-slate-200 mt-6">
                        <span className="block text-lg font-bold text-slate-600 uppercase tracking-wider mb-2">生命周期与相互作用</span>
                        <p className="text-lg leading-relaxed font-medium text-slate-800">
                          {pest.lifecycle.zh} 
                          {pest.symbiosis.zh && !['None', 'None.', 'N/A', '无。', '无'].includes(pest.symbiosis.zh) && (
                            <span className="text-slate-600 italic ml-1">{pest.symbiosis.zh}</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className={`${isGrid ? 'p-5 border-t border-emerald-100 bg-emerald-50 mt-auto' : 'p-8 bg-emerald-50 border-t-2 border-emerald-100'}`}>
                    
                    {!isGrid && (
                      <div className="mb-4 flex flex-col gap-3">
                        <div className="flex flex-wrap gap-2">
                          {pest.ipm.map(tag => {
                            const tagColor = tag === 'Chemical' ? 'bg-rose-100 text-rose-800 border-rose-200' : 
                                             tag === 'Biological' ? 'bg-lime-100 text-lime-800 border-lime-200' : 
                                             tag === 'Physical' ? 'bg-sky-100 text-sky-800 border-sky-200' :
                                             'bg-indigo-100 text-indigo-800 border-indigo-200';
                            return <span key={tag} className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${tagColor}`}>{translateIpm(tag)}</span>
                          })}
                        </div>
                        
                        {pest.application && !['Vertebrates'].includes(pest.category) && (
                          <div className="flex flex-wrap gap-2 items-center w-full bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-200 mt-1 mb-2">
                            <span className="text-xs font-black text-indigo-800 uppercase tracking-wider flex items-center gap-1.5 mr-1">
                              <Icon name="target" className="w-4 h-4 text-indigo-600" /> 喷洒靶点:
                            </span>
                            <span className="px-3 py-1 rounded-md text-xs font-bold bg-white text-indigo-900 border border-indigo-200 shadow-sm">
                              {pest.application}
                            </span>
                          </div>
                        )}

                        {/* NEW 3-PHASE EXECUTION STRATEGY (LIST VIEW ONLY) */}
                        {categorizedMoa && (
                          <div className="mt-4 mb-8">
                            <span className="flex items-center gap-3 font-black text-slate-800 uppercase tracking-wider mb-4 text-2xl">
                              <Icon name="activity" className="w-8 h-8 text-indigo-500"/> 3阶段执行策略
                            </span>
                            
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl mb-6 text-lg font-medium flex items-start gap-4 shadow-sm leading-relaxed">
                              <Icon name="alert" className="w-7 h-7 flex-shrink-0 text-amber-600 mt-0.5" />
                              <p><strong className="font-black uppercase tracking-wider text-xl">切勿混配同一阶段药剂:</strong> 如果某个阶段列出了多种化学品，请勿将它们混合喷洒。施用第一种化学品，等待 4 至 7 天后，再轮换使用列表中的下一种化学品，以打破害虫的抗药性。</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                              {[1, 2, 3].map(phase => {
                                const info = getPhaseInfo(phase, pest.category);
                                const items = categorizedMoa[phase];
                                const colorMap = {
                                   red: { bg: 'bg-red-50/80', border: 'border-red-200', text: 'text-red-700', textDesc: 'text-red-900', badge: 'bg-white text-red-700 border-red-200', icon: 'target' },
                                   amber: { bg: 'bg-amber-50/80', border: 'border-amber-200', text: 'text-amber-700', textDesc: 'text-amber-900', badge: 'bg-white text-amber-700 border-amber-200', icon: 'shield' },
                                   emerald: { bg: 'bg-emerald-50/80', border: 'border-emerald-200', text: 'text-emerald-700', textDesc: 'text-emerald-900', badge: 'bg-white text-emerald-700 border-emerald-200', icon: 'leaf' }
                                };
                                const theme = colorMap[info.color];
                                return (
                                  <div key={phase} className={`${theme.bg} p-6 rounded-2xl border-2 ${theme.border} shadow-sm flex flex-col h-full`}>
                                    <div className="mb-4">
                                       <span className={`${theme.text} opacity-80 font-black text-base uppercase tracking-widest block mb-1`}>
                                          {info.step}
                                       </span>
                                       <span className={`${theme.text} font-black text-2xl uppercase tracking-wider flex items-center gap-2`}>
                                          <Icon name={theme.icon} className="w-7 h-7 flex-shrink-0"/> {info.title}
                                       </span>
                                    </div>
                                    <span className={`${theme.textDesc} text-lg font-medium mb-6 flex-1 leading-relaxed`}>{info.desc}</span>
                                    <div className="flex flex-col gap-3 mt-auto">
                                      {items.length > 0 ? items.map((code, index) => {
                                         const tag = getMobilityTag(code);
                                         let mainCode = code;
                                         let chemName = "";
                                         if (code.includes('(') && code.includes(')')) {
                                             const parts = code.split('(');
                                             mainCode = parts[0].trim();
                                             chemName = parts[1].replace(')', '').trim();
                                         }
                                         return (
                                           <React.Fragment key={code}>
                                              {index > 0 && (
                                                <div className="flex justify-center my-1 relative z-10">
                                                   <span className={`text-sm font-black uppercase tracking-wider bg-white px-3 py-1 rounded-full border shadow-sm ${theme.text} ${theme.border}`}>轮换用药 (4-7天后)</span>
                                                </div>
                                              )}
                                              <div className="flex flex-col w-full">
                                                <span className={`${theme.badge} p-3 rounded-t-lg text-lg font-bold shadow-sm text-center leading-tight border-2 border-b-0 flex flex-col gap-1.5`}>
                                                  <span>{mainCode}</span>
                                                  {chemName && <span className="text-base font-semibold opacity-90">{chemName}</span>}
                                                </span>
                                                <span className={`${tag.color} text-sm uppercase tracking-wider px-3 py-1.5 rounded-b-lg border-2 font-black text-center shadow-sm`}>{tag.label}</span>
                                              </div>
                                           </React.Fragment>
                                         )
                                      }) : (
                                         <span className="text-base font-bold opacity-50 italic text-center py-3">进入下一阶段</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* COMPACT ROTATION FOR GRID VIEW */}
                    {isGrid && pest.moa !== 'N/A' && !['Vertebrates'].includes(pest.category) && (
                       <div className="flex flex-wrap gap-2 items-stretch w-full bg-slate-100 p-2.5 rounded-xl border border-slate-200 mb-3">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1 py-1">
                           <Icon name="shield" className="w-3 h-3 text-amber-500" /> 轮换:
                         </span>
                         {pest.moa.split(' 🔄 ').slice(0, 2).map((code, idx) => {
                           return (
                             <div key={idx} className="flex flex-col flex-1 min-w-[80px]">
                               <span className="px-1.5 py-1 rounded-md text-[10px] font-bold bg-white text-amber-700 border border-amber-200 shadow-sm flex items-center gap-1 h-full truncate">
                                 <span className="bg-amber-100 text-amber-800 w-3 h-3 flex items-center justify-center rounded-full text-[8px] flex-shrink-0 font-black">{idx + 1}</span> 
                                 <span className="truncate">{code.split(' (')[0]}</span>
                               </span>
                             </div>
                           );
                         })}
                       </div>
                    )}

                    <WikiPhotoStrip scientificName={pest.scientific} lang="zh" />

                    <span className={`flex items-center gap-2 font-black text-emerald-900 uppercase tracking-wider mb-3 ${isGrid ? 'text-sm' : 'text-lg border-t-2 border-emerald-200/50 pt-4'}`}>
                      <Icon name="info" className={isGrid ? "w-4 h-4" : "w-6 h-6"}/> 防治方案总结
                    </span>
                    
                    <p className={`text-emerald-950 font-medium ${isGrid ? 'text-sm line-clamp-3 mb-4' : 'text-xl leading-relaxed mb-6'}`}>
                      {pest.control.zh}
                    </p>
                    
                    <div className={`flex gap-3 ${isGrid ? 'flex-col' : 'flex-col md:flex-row mt-4'}`}>
                      <a 
                        href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(searchQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 flex items-center justify-between font-bold text-emerald-600 hover:text-emerald-800 transition-all bg-white border-2 border-emerald-200 hover:border-emerald-400 shadow-sm hover:shadow-md group ${isGrid ? 'px-4 py-2.5 rounded-lg text-sm' : 'flex-col px-6 pt-4 pb-3 rounded-xl text-lg text-left'}`}
                      >
                        <span className={isGrid ? "truncate" : "pr-4 leading-tight w-full"}>{isGrid ? '图片搜索' : `搜索 ${searchQuery} 的图片`}</span>
                        <div className={isGrid ? "" : "w-full flex justify-end mt-2"}>
                          <Icon name="link" className={`${isGrid ? "w-4 h-4" : "w-6 h-6"} opacity-50 group-hover:opacity-100 transition-opacity`} />
                        </div>
                      </a>
                      
                      <button 
                        onClick={() => handleShare(pest)}
                        className={`flex items-center justify-center gap-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all border-2 border-emerald-700 shadow-sm hover:shadow-md ${isGrid ? 'px-4 py-2.5 rounded-lg text-sm w-full' : 'px-6 py-4 rounded-xl text-lg'}`}
                        title="通过 WhatsApp 将警报发送给现场团队"
                      >
                        <Icon name="share" className={isGrid ? "w-4 h-4" : "w-6 h-6"} />
                        {isGrid ? '分享警报' : '发送预警'}
                      </button>
                      <button 
                        onClick={() => setEditingPest(pest)}
                        className={`flex items-center justify-center gap-2 font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all border-2 border-purple-700 shadow-sm hover:shadow-md ${isGrid ? 'px-4 py-2.5 rounded-lg text-sm w-full' : 'px-6 py-4 rounded-xl text-lg'}`}
                        title="编辑有机方案"
                      >
                        <span className={isGrid ? "text-base" : "text-2xl"}>🌱</span>
                        {savedTick !== null && isProtocolFilled(loadProtocol(pest.id))
                          ? (isGrid ? '编辑有机 ✓' : '编辑有机方案 ✓')
                          : (isGrid ? '添加有机' : '添加有机方案')}
                      </button>
                    </div>
                  </div>
                </div>
              )})}
            </div>

            {filteredPests.length === 0 && (
              <div className="text-center py-32 text-slate-500 bg-white rounded-3xl border-2 border-slate-200 shadow-sm">
                <Icon name="search" className="w-20 h-20 mx-auto text-slate-300 mb-6" />
                <h3 className="text-3xl font-extrabold text-slate-800">未找到病虫害</h3>
                <p className="text-xl mt-2 font-medium">请尝试调整您的目标部位或类别过滤器。</p>
              </div>
            )}

          </div>
        )}

      </main>

      {editingPest && (
        <OrganicEditor
          pest={editingPest}
          onClose={() => setEditingPest(null)}
          onSaved={() => setSavedTick(t => t + 1)}
        />
      )}
    </div>
  );
}
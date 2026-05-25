import React, { useState, useEffect, useMemo } from 'react';
import { ALL_PESTS, PEST_MOA_MAPPING, PEST_APPLICATION_MAPPING, DT50_DATABASE } from './data/index.js';
import { useLang } from './i18n/useLang.jsx';
import { WikiPhotoStrip } from './components/WikiPhotoStrip.jsx';
import { OrganicEditor } from './OrganicEditor.jsx';
import { loadProtocol, isProtocolFilled } from './organicData.js';
import { EditorProgressBanner } from './EditorProgressBanner.jsx';

// --- V1 AGRIPRO DIPM ---
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
  if (!act || act === 'N/A') return 'dash';
  if (act.includes('Diurnal')) return 'sun';
  if (act.includes('Nocturnal')) return 'moon';
  if (act.includes('Crepuscular')) return 'sunset';
  if (act.includes('Continuous')) return 'clock';
  return 'info';
};

// --- MOBILITY TAG HELPER ---
const getMobilityTag = (code) => {
  // NEW: Detection for Physical and Cultural methodologies (Non-Chemical IPM)
  if (code.match(/(Physical|Sticky|Trap|Lamp|Zinc|Fence|Manual|Brush|Water|Smoke|Fire|Tape)/i)) 
    return { label: 'PHYSICAL METHOD', color: 'bg-sky-100 text-sky-800 border-sky-200' };
  if (code.match(/(Cultural|Pruning|Sanitation|Sunlight|Clearing|Slashing)/i)) 
    return { label: 'CULTURAL METHOD', color: 'bg-amber-100 text-amber-800 border-amber-200' };

  if (code.includes('+') || code.includes('Mix')) return { label: 'Mixed Mobility', color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200' };
  if (code.match(/(23|P07)/i)) return { label: 'Two-Way Systemic', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
  if (code.match(/(4A|4C|28|29|9B|30|FRAC 3|FRAC 1\b|FRAC 7\b|Antibiotic)/i)) return { label: 'Systemic (Upward)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  if (code.match(/(IRAC 5|IRAC 6|FRAC 11|7C)/i)) return { label: 'Translaminar', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
  if (code.match(/(RRAC|Bait|Iron Phosphate)/i)) return { label: 'Bait / Barrier', color: 'bg-orange-100 text-orange-800 border-orange-200' };
  if (code.match(/(3A|1B|2B|20B|22A|21A|12A|16|M01|M03|FRAC 20|FRAC 14|Oil|Soap|Neem|Bt|Sulfur|Biological|Molluscicide|Niclosamide|Bio)/i)) return { label: 'Contact / Surface', color: 'bg-rose-100 text-rose-800 border-rose-200' };
  
  return { label: 'Action Tag', color: 'bg-slate-100 text-slate-700 border-slate-200' };
};

// --- 3-PHASE IPM PARSER ---
const getPhaseInfo = (phase, category) => {
  if (category === 'Fungi/Pathogens') {
      if (phase === 1) return { title: 'Phase 1: Eradicant', desc: 'Active Outbreak. Burn out active fungal lesions and halt sporulation instantly.', color: 'red' };
      if (phase === 2) return { title: 'Phase 2: Systemic Shield', desc: 'Consolidation. Absorb into vascular tissue to protect new flushes from internal spread.', color: 'amber' };
      if (phase === 3) return { title: 'Phase 3: Protectant', desc: 'Maintenance. Coat leaf surface with contact barriers or competitive bio-agents.', color: 'emerald' };
  }
  // Default Insects/Mites/Others
  if (phase === 1) return { title: 'Phase 1: Knockdown', desc: 'Red Alert. Instant population knockdown of active adults/swarms (Fast LT₅₀).', color: 'red' };
  if (phase === 2) return { title: 'Phase 2: Consolidation', desc: 'Orange Alert. Break the lifecycle, target hidden nymphs/eggs via systemics or IGRs.', color: 'amber' };
  if (phase === 3) return { title: 'Phase 3: Preventative', desc: 'Green Alert. Low population. Protect beneficials and establish biological barriers.', color: 'emerald' };
};

const categorizeMoa = (moaString, category) => {
  if (!moaString || moaString === 'N/A') return null;
  const items = moaString.split(' 🔄 ');
  const phases = { 1: [], 2: [], 3: [] };
  
  items.forEach(item => {
      if (item.match(/(Bio|Oil|Soap|Neem|Bt|Sulfur|Physical|Cultural|Molluscicide|M01|M03|Bait|Wash|Sunlight|Brush)/i)) {
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
    <div className="flex items-center gap-1.5" title={`Severity Rating: ${rating} / 5`}>
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
      Visual sticky traps exploit the specific color frequencies that diurnal (day-flying) insects are naturally attracted to for feeding or mating.
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-12 bg-yellow-400 rounded-md border-2 border-yellow-600 shadow-sm flex-shrink-0"></div>
          <h4 className="font-bold text-xl text-slate-800">Yellow Sticky Cards<br/><span className="text-sm text-slate-500 font-medium">(The All-Rounder)</span></h4>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed flex-1">
          Mimics light reflectance of high-nitrogen young shoots. Best for <strong>Psyllids, Aphids, Whiteflies, and Fruit Flies</strong>. <br/><br/><span className="text-sm font-medium text-amber-700">⚠️ <em>Extra-large, high-strength yellow boards are also highly effective at trapping foraging <strong>Orchard Wasps/Hornets</strong>.</em></span>
        </p>
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mt-auto">
          <strong className="text-yellow-800 block mb-2 uppercase tracking-wider text-xs">Placement:</strong>
          <p className="text-yellow-900 font-bold text-sm">Hang at the height of the new flush, or near orchard perimeters for wasps.</p>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-12 bg-blue-400 rounded-md border-2 border-blue-600 shadow-sm flex-shrink-0"></div>
          <h4 className="font-bold text-xl text-slate-800">Blue Sticky Cards<br/><span className="text-sm text-slate-500 font-medium">(Thrips Specialist)</span></h4>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed flex-1">
          Thrips are highly attracted to the specific wavelength of blue. Best for <strong>Chilli Thrips Adults</strong>. Use during flowering to prevent fruit scarring.
        </p>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mt-auto">
          <strong className="text-blue-800 block mb-2 uppercase tracking-wider text-xs">Placement:</strong>
          <p className="text-blue-900 font-bold text-sm">Place inside the canopy near flower clusters.</p>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-12 bg-slate-100 rounded-md border-2 border-slate-300 shadow-sm flex-shrink-0"></div>
          <h4 className="font-bold text-xl text-slate-800">White Sticky Cards<br/><span className="text-sm text-slate-500 font-medium">(Beetles/Bugs)</span></h4>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed flex-1">
          Attracts specific types of plant bugs and small beetles. Less common for durian but useful for general orchard biodiversity monitoring.
        </p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-auto">
          <strong className="text-slate-800 block mb-2 uppercase tracking-wider text-xs">Placement:</strong>
          <p className="text-slate-900 font-bold text-sm">Trunk-level or mid-canopy forks.</p>
        </div>
      </div>
    </div>
    
    <div className="mt-6 p-4 bg-emerald-900 text-emerald-50 rounded-xl flex items-center gap-4 border border-emerald-950 shadow-inner">
      <Icon name="info" className="w-6 h-6 text-emerald-400 flex-shrink-0" />
      <span className="text-sm font-medium"><strong>Pro Tip:</strong> Mass trapping (5-10 cards/tree) can reduce insect populations by up to 40% without using chemicals. Replace when 50% covered.</span>
    </div>
  </div>
);

// --- NOCTURNAL LIGHT TRAPPING GUIDE COMPONENT ---
const LightTrappingGuide = () => (
  <div className="bg-white border-2 border-amber-100 rounded-2xl p-6 mt-4 mb-4 shadow-md animate-in fade-in slide-in-from-top-4">
    <p className="text-lg text-slate-600 font-medium mb-6">
      Based on recent Malaysian entomology studies, <strong>Solar Insect Killer lamps</strong> use specific UV and multi-wavelength LEDs to exploit the positive phototaxis (light attraction) of devastating nocturnal pests, stopping them before they mate or lay eggs.
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-100 p-2.5 rounded-lg text-amber-600 shadow-sm flex-shrink-0"><Icon name="arrow-up" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800">High-Canopy Traps<br/><span className="text-sm text-slate-500 font-medium">(Fruit Borer Moths)</span></h4>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed flex-1">
          Targets the adult <strong>Durian Fruit Borer Moth</strong> (<em>Mudaria magniplaga</em>) before it lays eggs on developing fruits. Crucial during the early fruit-set to rapid expansion phases.
        </p>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mt-auto">
          <strong className="text-amber-800 block mb-2 uppercase tracking-wider text-xs">Placement:</strong>
          <p className="text-amber-900 font-bold text-sm">Hang 3-5 meters high in the upper canopy, clearing foliage so the light is visible from afar.</p>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-100 p-2.5 rounded-lg text-amber-600 shadow-sm flex-shrink-0"><Icon name="chevron-down" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800">Low-Level Traps<br/><span className="text-sm text-slate-500 font-medium">(Night-flying Beetles)</span></h4>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed flex-1">
          Targets emerging <strong>Chafer Beetles</strong> and <strong>Rhinoceros Beetles</strong> as they rise from the soil or compost to feed on young saplings and shoots.
        </p>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mt-auto">
          <strong className="text-amber-800 block mb-2 uppercase tracking-wider text-xs">Placement:</strong>
          <p className="text-amber-900 font-bold text-sm">Mount on poles 1-1.5 meters above the ground, especially near nurseries and thick mulch.</p>
        </div>
      </div>
    </div>
    
    <div className="mt-6 p-5 bg-amber-950 text-amber-50 rounded-xl flex items-start gap-4 border border-amber-900 shadow-inner">
      <Icon name="alert" className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
      <span className="text-sm font-medium leading-relaxed">
        <strong className="text-amber-300 block mb-1 uppercase tracking-wider">⚠️ Pollinator Protection Warning:</strong> 
        During Anthesis (Full Bloom), durian flowers are pollinated at night by Cave Nectar Bats and specific nocturnal moths. <strong>Turn off all solar light traps during the peak bloom window</strong> to avoid disrupting or killing essential pollinators.
      </span>
    </div>
  </div>
);

// --- TANK MIXING & SYNERGY GUIDE COMPONENT ---
const TankMixGuide = () => (
  <div className="bg-white border-2 border-violet-100 rounded-2xl p-6 mt-4 mb-4 shadow-md animate-in fade-in slide-in-from-top-4">
    <p className="text-lg text-slate-600 font-medium mb-8 leading-relaxed">
      Improper chemical loading can destroy active ingredients, clog equipment, and burn your crop. Follow the professional <strong>WALES</strong> sequence and agronomy rules to ensure maximum efficacy and safety.
    </p>

    <div className="space-y-8">
      {/* 1. PROFESSIONAL MIXING SEQUENCE (WALES) */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <h4 className="font-extrabold text-2xl text-slate-800 flex items-center gap-3 mb-6">
          <Icon name="list" className="w-8 h-8 text-violet-600" />
          Professional WALES Loading Sequence
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8">
          <div className="bg-white p-5 rounded-xl border-2 border-violet-100 flex flex-col items-center text-center shadow-sm relative group">
            <span className="text-4xl font-black text-violet-600 mb-2">W</span>
            <strong className="text-xs uppercase tracking-wider text-slate-800 mb-1 leading-tight">Wettable Powders</strong>
            <p className="text-[10px] text-slate-500 font-bold uppercase">WP, WG, DF, SG</p>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 hidden md:block text-slate-300">
              <Icon name="chevron-right" className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border-2 border-violet-100 flex flex-col items-center text-center shadow-sm relative">
            <span className="text-4xl font-black text-violet-600 mb-2">A</span>
            <strong className="text-xs uppercase tracking-wider text-slate-800 mb-1 leading-tight">Agitation / Buffers</strong>
            <p className="text-[10px] text-slate-500 font-bold uppercase">pH Water Conditioners</p>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 hidden md:block text-slate-300">
              <Icon name="chevron-right" className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border-2 border-violet-100 flex flex-col items-center text-center shadow-sm relative">
            <span className="text-4xl font-black text-violet-600 mb-2">L</span>
            <strong className="text-xs uppercase tracking-wider text-slate-800 mb-1 leading-tight">Soluble & Flowable Liquids</strong>
            <p className="text-[10px] text-slate-500 font-bold uppercase">SL, SC, SE, CS</p>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 hidden md:block text-slate-300">
              <Icon name="chevron-right" className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border-2 border-violet-100 flex flex-col items-center text-center shadow-sm relative">
            <span className="text-4xl font-black text-violet-600 mb-2">E</span>
            <strong className="text-xs uppercase tracking-wider text-slate-800 mb-1 leading-tight">Emulsifiables</strong>
            <p className="text-[10px] text-slate-500 font-bold uppercase">EC, EW, ME, OD</p>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 hidden md:block text-slate-300">
              <Icon name="chevron-right" className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border-2 border-violet-100 flex flex-col items-center text-center shadow-sm relative">
            <span className="text-4xl font-black text-violet-600 mb-2">S</span>
            <strong className="text-xs uppercase tracking-wider text-slate-800 mb-1 leading-tight">Surfactants</strong>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Oils, Spreaders, Stickers</p>
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
            <strong className="text-2xl font-black uppercase tracking-tight block mb-2 text-amber-300">⚠️ CRITICAL: The Tank Overload Rule</strong>
            <p className="text-lg font-bold leading-relaxed text-rose-50">
              Never mix more than <strong>3 active ingredients</strong> in a single tank.
            </p>
            <p className="text-sm font-medium mt-3 opacity-95 leading-relaxed">
              Mixing too many chemical types creates a "Cocktail Disaster." You risk <strong>Phytotoxicity</strong> (burning the entire canopy) or <strong>Chemical Neutralization</strong>. If the chemicals cancel each other out, you are <strong>wasting 40-60% of your budget</strong> while potentially caking your nozzles with non-dissolved sludge.
            </p>
          </div>
        </div>
      </div>

      {/* pH Section */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h4 className="font-bold text-xl text-slate-800 flex items-center gap-3 mb-4">
          <Icon name="droplets" className="w-6 h-6 text-blue-500" />
          The Golden pH Rule (Alkaline Hydrolysis)
        </h4>
        <p className="text-slate-600 mb-4 leading-relaxed">
          If your farm water is highly alkaline (pH 7.5+), it will literally tear apart modern pesticides (like Pyrethroids) in the tank within 20 minutes. Always test and buffer your water first!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
             <strong className="text-blue-800 block mb-1">Standard Chemicals:</strong>
             <span className="text-blue-900 font-bold text-lg">Target pH 5.5 - 6.5</span>
             <p className="text-sm text-blue-700 mt-1">Use a buffering agent in your water *before* adding the chemical.</p>
           </div>
           <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
             <strong className="text-rose-800 block mb-1">⚠️ COPPER EXCEPTION:</strong>
             <span className="text-rose-900 font-bold text-lg">Target pH 7.0+ (Neutral)</span>
             <p className="text-sm text-rose-700 mt-1">Never put Copper in acidic water. It will dissolve rapidly and burn your canopy!</p>
           </div>
        </div>
      </div>

      {/* Synergy Section */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h4 className="font-bold text-xl text-slate-800 flex items-center gap-3 mb-4">
          <Icon name="beaker" className="w-6 h-6 text-violet-500" />
          Proven Synergistic Cocktails (1 + 1 = 3)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-violet-50 p-4 rounded-xl border border-violet-200">
             <strong className="text-violet-900 block mb-1 text-sm uppercase tracking-wider">The Enzyme Blocker</strong>
             <p className="font-bold text-violet-950 mb-2">PBO + Pyrethroids (IRAC 3A)</p>
             <p className="text-sm text-violet-800 leading-relaxed">Insects use enzymes to survive poison. PBO shuts down the enzyme, making the Pyrethroid up to 10x more lethal against resistant borers.</p>
          </div>
          <div className="bg-fuchsia-50 p-4 rounded-xl border border-fuchsia-200">
             <strong className="text-fuchsia-900 block mb-1 text-sm uppercase tracking-wider">Energy & Shield Breaker</strong>
             <p className="font-bold text-fuchsia-950 mb-2">FRAC 11 + FRAC 3</p>
             <p className="text-sm text-fuchsia-800 leading-relaxed">Azoxystrobin (stops fungal breathing) mixed with Difenoconazole (stops cell building). Ultimate combo for Anthracnose.</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
             <strong className="text-indigo-900 block mb-1 text-sm uppercase tracking-wider">The "Flush & Kill"</strong>
             <p className="font-bold text-indigo-950 mb-2">IRAC 3A + IRAC 4A</p>
             <p className="text-sm text-indigo-800 leading-relaxed">Pyrethroids irritate and flush hidden pests out of leaf folds directly into the systemic Neonicotinoid layer. Perfect for outbreaks.</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
             <strong className="text-amber-900 block mb-1 text-sm uppercase tracking-wider">The Physical Breach</strong>
             <p className="font-bold text-amber-950 mb-2">White Oil + IRAC 23</p>
             <p className="text-sm text-amber-800 leading-relaxed">Oil acts as a physical solvent, melting the wax armor of the Pit Scale and pulling the systemic Spirotetramat directly into the insect.</p>
          </div>
        </div>
      </div>

      {/* Chemical Antagonism & Timing Section */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h4 className="font-bold text-xl text-slate-800 flex items-center gap-3 mb-4">
          <Icon name="x" className="w-6 h-6 text-red-500" />
          Dangerous Mixes & Timing (The Copper Rules)
        </h4>
        <div className="space-y-4">
          <div className="bg-red-50 p-5 rounded-xl border-2 border-red-200 flex flex-col md:flex-row gap-4 items-start shadow-inner">
            <div className="bg-red-100 p-2.5 rounded-full flex-shrink-0 mt-1">
              <Icon name="alert" className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <strong className="text-red-900 block mb-1 text-lg uppercase tracking-wider">The Copper "Loner" Rule</strong>
              <p className="font-bold text-red-950 mb-2">Copper (FRAC M01) + Synthetic Organics (e.g., Pencycuron)</p>
              <p className="text-sm text-red-800 leading-relaxed font-medium">
                Never mix heavy metal fungicides (Copper Oxychloride / Hydroxide) with synthetic organic chemicals. The highly reactive copper ions bind to organic molecules, causing them to separate and sink to the bottom of the tank as a chalky sludge (flocculation). This destroys the chemical's efficacy and severely burns the tree (phytotoxicity). <strong>Copper must always be sprayed alone!</strong>
              </p>
            </div>
          </div>

          <div className="bg-amber-50 p-5 rounded-xl border-2 border-amber-200 flex flex-col md:flex-row gap-4 items-start shadow-inner">
            <div className="bg-amber-100 p-2.5 rounded-full flex-shrink-0 mt-1">
              <Icon name="alert" className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <strong className="text-amber-900 block mb-1 text-lg uppercase tracking-wider">The "Zero Copper Window" (Anthesis)</strong>
              <p className="font-bold text-amber-950 mb-2">Copper applied during Matchstick or Full Bloom</p>
              <p className="text-sm text-amber-800 leading-relaxed font-medium">
                <strong>Never apply copper during flowering!</strong> The highly reactive copper ions will instantly burn the delicate stigma and desiccate the pollen, causing massive flower abortion. Furthermore, the metallic residue repels vital nocturnal pollinators (like Cave Nectar Bats) and is highly toxic to the gut biome of pollinating insects. Switch entirely to soft biologicals (like <em>Bacillus subtilis</em>) during this phase.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LT50 Section */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h4 className="font-bold text-xl text-slate-800 flex items-center gap-3 mb-4">
          <Icon name="target" className="w-6 h-6 text-rose-500" />
          Understanding LT₅₀ (Lethal Time) & Knockdowns
        </h4>
        <p className="text-slate-600 mb-4 leading-relaxed">
          While DT₅₀ measures environmental lifespan, <strong>LT₅₀</strong> measures how fast the insect actually dies. Agronomists mix fast and slow LT₅₀ chemicals to create the ultimate defense:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <strong className="text-rose-800 block mb-1 text-sm uppercase tracking-wider">Fast LT₅₀ (Knockdown)</strong>
             <p className="font-bold text-rose-950 mb-1">Contact Killers (e.g., Pyrethroids)</p>
             <p className="text-sm text-slate-600 leading-relaxed">Kills in minutes. Insects drop from the canopy instantly upon physical contact.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <strong className="text-indigo-800 block mb-1 text-sm uppercase tracking-wider">Slow LT₅₀ (Systemic)</strong>
             <p className="font-bold text-indigo-950 mb-1">IGRs & Systemics (e.g., Spirotetramat)</p>
             <p className="text-sm text-slate-600 leading-relaxed">Takes 3-7 days. Pests stop feeding immediately but remain on the leaf as harmless "walking dead."</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
             <strong className="text-emerald-800 block mb-1 text-sm uppercase tracking-wider">The Perfect Mix</strong>
             <p className="font-bold text-emerald-950 mb-1">Fast + Slow (Flush & Kill)</p>
             <p className="text-sm text-emerald-900 leading-relaxed">Fast chemicals knock down the current swarm, while slow systemics protect against new hatchlings days later.</p>
          </div>
        </div>
      </div>

      {/* Chemical Mobility Section */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h4 className="font-bold text-xl text-slate-800 flex items-center gap-3 mb-4">
          <Icon name="activity" className="w-6 h-6 text-fuchsia-500" />
          Chemical Mobility: How the Poison Moves
        </h4>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The Mode of Action (IRAC/FRAC) dictates biological death, but <strong>Mobility</strong> dictates exactly <em>how</em> you must spray the tree to reach the pest:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <strong className="text-fuchsia-800 block mb-1 text-sm uppercase tracking-wider flex items-center gap-1.5"><Icon name="shield" className="w-4 h-4"/> Contact (Surface)</strong>
             <p className="font-bold text-fuchsia-950 mb-1">e.g., IRAC 3A, FRAC M01</p>
             <p className="text-sm text-slate-600 leading-relaxed">Stays exactly where it lands. Washes off in rain. You must physically hit the insect or completely cover the leaf surface.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <strong className="text-indigo-800 block mb-1 text-sm uppercase tracking-wider flex items-center gap-1.5"><Icon name="leaf" className="w-4 h-4"/> Translaminar</strong>
             <p className="font-bold text-indigo-950 mb-1">e.g., IRAC 6, FRAC 11</p>
             <p className="text-sm text-slate-600 leading-relaxed">Absorbs into the leaf but doesn't flow through the sap. Spray the top canopy, and it kills pests hiding on the underside (Mites/Whiteflies).</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
             <strong className="text-emerald-800 block mb-1 text-sm uppercase tracking-wider flex items-center gap-1.5"><Icon name="arrow-up" className="w-4 h-4"/> Systemic (Xylem)</strong>
             <p className="font-bold text-emerald-950 mb-1">e.g., IRAC 4A, FRAC 3</p>
             <p className="text-sm text-emerald-900 leading-relaxed"><strong>Upward Only.</strong> Flows up the plant's water pipes. Good for top-canopy flushes, but useless for root pests if sprayed on the leaves.</p>
          </div>
          <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-200 shadow-sm">
             <strong className="text-cyan-800 block mb-1 text-sm uppercase tracking-wider flex items-center gap-1.5"><Icon name="droplets" className="w-4 h-4"/> True Systemic (Phloem)</strong>
             <p className="font-bold text-cyan-950 mb-1">e.g., IRAC 23, FRAC P07</p>
             <p className="text-sm text-cyan-900 leading-relaxed"><strong>Two-Way Flow.</strong> Highly engineered. Travels down the food pipes to the roots and hidden bark crevices. Essential for deep, hidden pests.</p>
          </div>
        </div>
      </div>

      {/* DT50 & MRL Section */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h4 className="font-bold text-xl text-slate-800 flex items-center gap-3 mb-4">
          <Icon name="clock" className="w-6 h-6 text-teal-500" />
          Extending Half-Life (DT₅₀) & Adjuvants
        </h4>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Tropical sun and rain degrade chemicals quickly. You can extend the active life of your sprays by tank-mixing with specific adjuvants:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <strong className="text-teal-800 block mb-1 text-sm uppercase tracking-wider">The UV Shield</strong>
             <p className="font-bold text-teal-950 mb-1">UV Protectants</p>
             <p className="text-sm text-slate-600 leading-relaxed">Prevents sunlight from destroying UV-sensitive chemicals like Abamectin and Bt.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <strong className="text-cyan-800 block mb-1 text-sm uppercase tracking-wider">The Rain-Lock</strong>
             <p className="font-bold text-cyan-950 mb-1">Synthetic Stickers (Pinolene)</p>
             <p className="text-sm text-slate-600 leading-relaxed">Creates a waterproof polymer film over the leaf, preventing monsoon wash-off.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <strong className="text-emerald-800 block mb-1 text-sm uppercase tracking-wider">Evaporation Blocker</strong>
             <p className="font-bold text-emerald-950 mb-1">Horticultural Oils</p>
             <p className="text-sm text-slate-600 leading-relaxed">Coats the chemical to slow evaporation, giving systemic liquids more time to absorb.</p>
          </div>
        </div>
        
        {/* MRL WARNING CAUTION BOX */}
        <div className="bg-rose-50 p-5 rounded-xl border-2 border-rose-200 flex flex-col md:flex-row gap-4 items-start shadow-inner">
          <div className="bg-rose-100 p-2.5 rounded-full flex-shrink-0">
            <Icon name="alert" className="w-8 h-8 text-rose-600" />
          </div>
          <div>
            <strong className="text-rose-900 block mb-2 text-lg uppercase tracking-wider">⚠️ Critical Warning: The MRL Trap</strong>
            <p className="text-rose-800 leading-relaxed font-medium">
              <strong>DO NOT</strong> use DT₅₀ extenders (Stickers/UV Blockers) during the <strong className="text-rose-950">Maturation Stage</strong>! Artificially extending chemical life near harvest guarantees your fruits will fail export <strong>MRL (Maximum Residue Limit)</strong> tests at customs. Stop using these adjuvants at least 30-45 days before harvest to allow natural degradation.
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
      Using beneficial bacteria like <strong>Bacillus velezensis</strong> and <strong>Bacillus amyloliquefaciens</strong> is one of the most effective countermeasures against aggressive fungal blights (like <em>Rhizoctonia solani</em>). Here is how they win the microscopic war:
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-rose-100 p-2 rounded-lg text-rose-600 shadow-sm flex-shrink-0"><Icon name="shield" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800">Lipopeptide Warfare</h4>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed flex-1">
          These bacteria synthesize powerful natural antifungal compounds (Iturin, Surfactin, Fengycin) that literally tear holes in the fungal lipid membranes, causing the fungal cells to leak and die instantly.
        </p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-sky-100 p-2 rounded-lg text-sky-600 shadow-sm flex-shrink-0"><Icon name="target" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800">Competitive Exclusion</h4>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed flex-1">
          Instead of spreading via spores, blights spread via physical web-like growth. The <em>Bacillus</em> microbes are hyper-aggressive colonizers that physically cover the leaf surface, starving the fungus of space and nutrients.
        </p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-lime-100 p-2 rounded-lg text-lime-600 shadow-sm flex-shrink-0"><Icon name="activity" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800">Systemic Resistance (ISR)</h4>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed flex-1">
          Like a vaccine for your trees. When the bacteria colonize the plant, they send chemical signals into the tissue that trigger the plant's immune system, naturally hardening its cell walls against future attacks.
        </p>
      </div>
    </div>
    
    <div className="mt-6 p-4 bg-lime-50 text-lime-900 rounded-xl flex items-center gap-4 border border-lime-200 shadow-inner">
      <Icon name="info" className="w-8 h-8 text-lime-600 flex-shrink-0" />
      <span className="text-sm font-medium"><strong>Pro-Tip for Outbreaks:</strong> Because leaf blight moves incredibly fast in wet conditions, biologicals work best <strong>preventatively</strong>. For an active outbreak, use a synthetic knockdown (like Pencycuron or Thifluzamide) first, then apply Bacillus a week later to protect new growth and prevent recurrence.</span>
    </div>
  </div>
);

// --- THE BIG 15 MICROBES GUIDE COMPONENT ---
const MicrobeGuide = () => (
  <div className="bg-white border-2 border-teal-100 rounded-2xl p-6 mt-4 mb-4 shadow-md animate-in fade-in slide-in-from-top-4">
    <p className="text-lg text-slate-600 font-medium mb-6">
      <strong>Probiotic Agronomy</strong> uses living microbes as biological weapons and soil synthesizers. By introducing these 15 elite organisms into your rotation, you establish a self-sustaining, organic defense grid in your orchard:
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-teal-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-teal-100 p-2.5 rounded-lg text-teal-600 shadow-sm"><Icon name="bug" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">Beauveria bassiana</h4>
        </div>
        <p className="text-sm font-extrabold text-teal-800 mb-3 uppercase tracking-wider">The White Muscardine</p>
        <p className="text-slate-700 text-sm leading-relaxed font-medium">A contact-killing fungus that penetrates insect exoskeletons and drains nutrients, turning them into fuzzy white mummies. Best mixed with light oil. <br/><br/><strong className="text-slate-900">Targets:</strong> Mealybugs, Scales, Sap Beetles, Borers.</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-emerald-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-600 shadow-sm"><Icon name="target" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">Metarhizium anisopliae</h4>
        </div>
        <p className="text-sm font-extrabold text-emerald-800 mb-3 uppercase tracking-wider">The Green Muscardine</p>
        <p className="text-slate-700 text-sm leading-relaxed font-medium">A soil-dwelling assassin fungus that specifically infects and consumes hard-shelled beetles and grubs, leaving behind a hard green crust on the dead host. <br/><br/><strong className="text-slate-900">Targets:</strong> Rhino Beetles, Chafer Grubs, Termites.</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-violet-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-violet-100 p-2.5 rounded-lg text-violet-600 shadow-sm"><Icon name="activity" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">Nomuraea rileyi</h4>
        </div>
        <p className="text-sm font-extrabold text-violet-800 mb-3 uppercase tracking-wider">The Caterpillar Stalker</p>
        <p className="text-slate-700 text-sm leading-relaxed font-medium">Turns caterpillars into rigid, mummified statues covered in pale-green spores on contact. Excellent for aggressive foliar and fruit borers. <br/><br/><strong className="text-slate-900">Targets:</strong> Fruit Borers, Bagworms, Leafrollers.</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-sky-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-sky-100 p-2.5 rounded-lg text-sky-600 shadow-sm"><Icon name="leaf" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">Lecanicillium lecanii</h4>
        </div>
        <p className="text-sm font-extrabold text-sky-800 mb-3 uppercase tracking-wider">The Sap-Sucker Assassin</p>
        <p className="text-slate-700 text-sm leading-relaxed font-medium">Thrives in highly humid canopies, explicitly melting the cuticles of soft-bodied insects. Uniquely, it actively feeds on honeydew, instantly curing Sooty Mold. <br/><br/><strong className="text-slate-900">Targets:</strong> Aphids, Whiteflies, Psyllids.</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-yellow-400 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-yellow-100 p-2.5 rounded-lg text-yellow-600 shadow-sm"><Icon name="sun" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">Isaria fumosorosea</h4>
        </div>
        <p className="text-sm font-extrabold text-yellow-800 mb-3 uppercase tracking-wider">The Canopy Sweeper</p>
        <p className="text-slate-700 text-sm leading-relaxed font-medium">Highly resilient to temperature fluctuations and sun exposure compared to other fungi. Perfect for upper canopy pests, covering them in a pinkish-grey fuzz. <br/><br/><strong className="text-slate-900">Targets:</strong> Chilli Thrips, Whiteflies, Aphids.</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-pink-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-pink-100 p-2.5 rounded-lg text-pink-600 shadow-sm"><Icon name="target" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">Hirsutella thompsonii</h4>
        </div>
        <p className="text-sm font-extrabold text-pink-800 mb-3 uppercase tracking-wider">The Mite Destroyer</p>
        <p className="text-slate-700 text-sm leading-relaxed font-medium">Hyper-specialized to hunt arachnids. Penetrates the mite cuticle and produces a paralyzing toxin. Capable of causing massive "fungal pandemics" in mite colonies. <br/><br/><strong className="text-slate-900">Targets:</strong> Red Mites, Broad Mites, Eriophyid Mites.</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-amber-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-amber-100 p-2.5 rounded-lg text-amber-600 shadow-sm"><Icon name="shield" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">Bacillus subtilis</h4>
        </div>
        <p className="text-sm font-extrabold text-amber-800 mb-3 uppercase tracking-wider">The Resilient Shield</p>
        <p className="text-slate-700 text-sm leading-relaxed font-medium">A tough, spore-forming bacterium highly resilient to UV light. Produces powerful natural antibiotics (iturin) to suppress broad-spectrum foliage diseases. Also acts as a powerful bio-filter using EPS to neutralize toxic heavy metals in the soil.<br/><br/><strong className="text-slate-900">Targets:</strong> Anthracnose, Mildews, Leaf Spots, Copper Toxicity.</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-indigo-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-100 p-2.5 rounded-lg text-indigo-600 shadow-sm"><Icon name="droplets" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">Pseudomonas fluorescens</h4>
        </div>
        <p className="text-sm font-extrabold text-indigo-800 mb-3 uppercase tracking-wider">The Iron Thief</p>
        <p className="text-slate-700 text-sm leading-relaxed font-medium">An aggressive root/soil bacterium that outcompetes fungal pathogens for iron in the soil (using siderophores), starving them out while boosting tree immunity. <br/><br/><strong className="text-slate-900">Targets:</strong> Phytophthora, Pythium.</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-rose-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-rose-100 p-2.5 rounded-lg text-rose-600 shadow-sm"><Icon name="activity" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">Streptomyces spp.</h4>
        </div>
        <p className="text-sm font-extrabold text-rose-800 mb-3 uppercase tracking-wider">The Bio-Antibiotic</p>
        <p className="text-slate-700 text-sm leading-relaxed font-medium">Soil bacteria famous for producing natural antibiotics. They secrete volatile organic compounds that literally melt the cell walls of highly aggressive wood rots. <br/><br/><strong className="text-slate-900">Targets:</strong> Fusicoccum, Ceratocystis, White Root.</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-fuchsia-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-fuchsia-100 p-2.5 rounded-lg text-fuchsia-600 shadow-sm"><Icon name="x" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">Purpureocillium lilacinum</h4>
        </div>
        <p className="text-sm font-extrabold text-fuchsia-800 mb-3 uppercase tracking-wider">The Nematode Hunter</p>
        <p className="text-slate-700 text-sm leading-relaxed font-medium">A highly specialized fungus that actively hunts nematodes. Its spores parasitize nematode eggs and females, dissolving them and breaking the generational cycle. <br/><br/><strong className="text-slate-900">Targets:</strong> Root-knot & Lesion Nematodes.</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-orange-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-orange-100 p-2.5 rounded-lg text-orange-600 shadow-sm"><Icon name="calculator" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">Penicillium bilaiae</h4>
        </div>
        <p className="text-sm font-extrabold text-orange-800 mb-3 uppercase tracking-wider">The Phosphorus Unlocker</p>
        <p className="text-slate-700 text-sm leading-relaxed font-medium">A beneficial root fungus that secretes organic acids to dissolve bound-up phosphorus in the soil. Massively boosts root mass, directly preventing stress-induced rots. <br/><br/><strong className="text-slate-900">Targets:</strong> Root Stress, Nutrient Lockout.</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-lime-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-lime-100 p-2.5 rounded-lg text-lime-600 shadow-sm"><Icon name="activity" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">Trichoderma harzianum</h4>
        </div>
        <p className="text-sm font-extrabold text-lime-800 mb-3 uppercase tracking-wider">The Fungal Parasite</p>
        <p className="text-slate-700 text-sm leading-relaxed font-medium">A hyper-aggressive beneficial fungus that practices mycoparasitism. It literally tracks down pathogenic fungi, coils around them, and secretes enzymes to dissolve and eat their cell walls. <br/><br/><strong className="text-slate-900">Targets:</strong> Phytophthora, Pythium, Rhizoctonia.</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-cyan-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-cyan-100 p-2.5 rounded-lg text-cyan-600 shadow-sm"><Icon name="shield" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">Bacillus velezensis</h4>
        </div>
        <p className="text-sm font-extrabold text-cyan-800 mb-3 uppercase tracking-wider">The Lipopeptide Warrior</p>
        <p className="text-slate-700 text-sm leading-relaxed font-medium">Synthesizes powerful natural antifungal compounds (Iturin, Surfactin) that instantly tear holes in fungal lipid membranes, causing rapid cell death in aggressive blights. <br/><br/><strong className="text-slate-900">Targets:</strong> Rhizoctonia Leaf Blight, Pathogenic Fungi.</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-fuchsia-300 transition-colors shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-fuchsia-100 p-2.5 rounded-lg text-fuchsia-600 shadow-sm"><Icon name="target" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">B. amyloliquefaciens</h4>
        </div>
        <p className="text-sm font-extrabold text-fuchsia-800 mb-3 uppercase tracking-wider">The Competitive Colonizer</p>
        <p className="text-slate-700 text-sm leading-relaxed font-medium">Works synergistically with B. velezensis. A hyper-aggressive colonizer that rapidly covers the leaf surface (phyllosphere), starving invading blight mycelium of space and nutrients. <br/><br/><strong className="text-slate-900">Targets:</strong> Rhizoctonia, Bacterial Leaf Spot.</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col hover:border-blue-300 transition-colors shadow-sm lg:col-span-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 shadow-sm"><Icon name="rain" className="w-6 h-6"/></div>
          <h4 className="font-bold text-xl text-slate-800 leading-tight">Effective Microbes (EM)</h4>
        </div>
        <p className="text-sm font-extrabold text-blue-800 mb-3 uppercase tracking-wider">The Soil Synthesizer</p>
        <p className="text-slate-700 text-sm leading-relaxed font-medium">A consortium of lactic acid bacteria, yeast, and phototrophic bacteria. Rapidly ferments dead mulch into nutrients and aggressively outcompetes anaerobic rot environments. <br/><br/><strong className="text-slate-900">Targets:</strong> Soil toxicity (Heavy Metals), Breeding Grounds.</p>
      </div>
    </div>

    {/* HEAVY METAL DETOXIFICATION INFO BOX */}
    <div className="mt-8 p-6 bg-emerald-950 text-emerald-50 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-5 border-2 border-emerald-800 shadow-lg">
      <div className="bg-emerald-900 p-4 rounded-full flex-shrink-0 border border-emerald-700 shadow-inner">
        <Icon name="shield" className="w-8 h-8 text-emerald-400" />
      </div>
      <div>
        <strong className="text-emerald-300 block mb-2 text-lg uppercase tracking-widest font-black">Hidden Benefit: Heavy Metal Detoxification (Bioremediation)</strong>
        <p className="text-sm font-medium leading-relaxed text-emerald-100/90">
          Decades of using chemical fertilizers and <strong className="text-white">Copper-based fungicides</strong> (FRAC M01) causes toxic heavy metal buildup in the soil, which eventually poisons the tree's feeder roots (Copper Toxicity). Microbes like <strong>Bacillus subtilis</strong>, <strong>Pseudomonas</strong>, <strong>Trichoderma</strong>, and <strong>EM</strong> act as natural bio-filters. They secrete biosurfactants, EPS (sticky polymers), and enzymes that actively bind, neutralize, and lock away excess heavy metals in the soil, saving the root system from chemical burn.
        </p>
      </div>
    </div>
  </div>
);

// --- DT50 LIFESPAN REFERENCE GUIDE COMPONENT ---
const DT50Guide = () => {
  const getFoliarColor = (val) => {
    if (val.includes('Infinite')) return 'bg-red-100 text-red-800 border-red-200';
    if (val.includes('Weeks') || val.includes('Variable')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (val === 'N/A') return 'bg-slate-100 text-slate-500 border-slate-200';
    const num = parseFloat(val.match(/\d+(\.\d+)?/)?.[0] || 0);
    if (val.includes('<') && num <= 1) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (num <= 3) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (num <= 7) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getSoilColor = (val) => {
    if (val.includes('Infinite') || val.includes('100 -')) return 'bg-red-100 text-red-800 border-red-200';
    if (val.includes('Indefinite') || val.includes('Variable') || val.includes('Weeks')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    const num = parseFloat(val.match(/\d+(\.\d+)?/)?.[0] || 0);
    if (val.includes('<') && num <= 1) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (num <= 30) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (num <= 70) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-0 mt-4 mb-4 shadow-md animate-in fade-in slide-in-from-top-4 overflow-hidden">
      
      {/* Intro Header */}
      <div className="bg-sky-50 p-6 border-b border-sky-100">
        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-3">
          <Icon name="clock" className="w-7 h-7 text-sky-600" />
          Chemical Environmental Lifespan (DT₅₀)
        </h3>
        <p className="text-slate-700 font-medium leading-relaxed">
          <strong>DT₅₀ (Degradation Time 50%)</strong> is the time required for half of the active ingredient to break down.
          <br/><strong className="text-sky-700">Foliar DT₅₀ (Photolysis):</strong> Lifespan on the leaf under UV sunlight. Dictates harvest safety and MRLs.
          <br/><strong className="text-amber-700">Soil DT₅₀:</strong> Lifespan in the ground. Highly persistent chemicals ({'>'}100 days) accumulate and harm soil ecology.
        </p>
      </div>

      {/* MRL Warning Box */}
      <div className="bg-rose-50 p-5 border-b-2 border-rose-200 flex flex-col md:flex-row gap-4 items-start shadow-inner">
        <div className="bg-rose-100 p-2.5 rounded-full flex-shrink-0 mt-1">
          <Icon name="alert" className="w-6 h-6 text-rose-600" />
        </div>
        <div>
          <strong className="text-rose-900 block mb-1 text-lg uppercase tracking-wider">Agronomist Pro-Tip: MRL & Exporting</strong>
          <p className="text-sm text-rose-800 leading-relaxed font-medium">
            If you are exporting your durians, any chemical with a <strong>Foliar DT₅₀ greater than 7 days</strong> (e.g., Chlorantraniliprole, Azoxystrobin) must be completely cut from your spray program <strong>at least 30 to 45 days before harvest</strong>. Stick to fast-degrading chemicals (Foliar DT₅₀ {'<'} 3 days) or purely biologicals during the final maturation stage to pass customs residue testing.
          </p>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider">
              <th className="px-3 py-2.5 font-bold w-1/5">Active Ingredient</th>
              <th className="px-2 py-2.5 font-bold text-center w-24">MoA</th>
              <th className="px-2 py-2.5 font-bold text-center w-28">Foliar DT₅₀ (UV)</th>
              <th className="px-2 py-2.5 font-bold text-center w-28">Soil DT₅₀</th>
              <th className="px-3 py-2.5 font-bold">Agronomic Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {['Insecticide', 'Fungicide', 'Bio/Other'].map(type => (
              <React.Fragment key={type}>
                <tr className="bg-slate-50 border-y border-slate-200">
                  <td colSpan="5" className="px-3 py-2 font-black text-slate-800 text-xs uppercase tracking-wider">
                    {type === 'Bio/Other' ? 'Botanicals, Biologicals & Molluscicides' : `${type}s`}
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
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap shadow-sm ${getFoliarColor(chem.foliar)}`}>
                        {chem.foliar}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap shadow-sm ${getSoilColor(chem.soil)}`}>
                        {chem.soil}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[13px] text-slate-600 font-medium leading-snug">
                      {chem.notes.en}
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


// --- LEAF CURL DIAGNOSTIC DIAGRAMS (inline SVG, no network) ---
// Hand-drawn botanical diagrams that show the actual mechanism of each curl pattern.
// Two variants keyed by id: 'downward_curl' and 'upward_curl'.
const AIIllustration = ({ id, alt }) => {
  if (id === 'downward_curl') {
    return (
      <div className="relative mb-4 w-full h-48 rounded-xl border-2 border-slate-200 shadow-sm bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <svg viewBox="0 0 680 240" className="w-full h-full" role="img" aria-label={alt} xmlns="http://www.w3.org/2000/svg">
          <title>Downward leaf curl diagnostic</title>
          {/* Upper leaf surface (convex green) */}
          <path d="M 100 90 Q 340 20, 580 90 Q 575 105, 570 112 Q 340 48, 110 112 Q 105 105, 100 90 Z"
                fill="#639922" stroke="#3B6D11" strokeWidth="1"/>
          {/* Underside (concave, where pests hide) */}
          <path d="M 110 112 Q 340 48, 570 112 L 540 180 Q 340 110, 140 180 L 110 112 Z"
                fill="#97C459" stroke="#3B6D11" strokeWidth="0.5" opacity="0.95"/>
          {/* Curling edges */}
          <path d="M 100 90 Q 95 160, 140 180" fill="none" stroke="#3B6D11" strokeWidth="1.2"/>
          <path d="M 580 90 Q 585 160, 540 180" fill="none" stroke="#3B6D11" strokeWidth="1.2"/>
          {/* Midrib */}
          <path d="M 110 112 Q 340 48, 570 112" fill="none" stroke="#27500A" strokeWidth="1.5" opacity="0.6"/>
          {/* Lateral veins */}
          <path d="M 200 105 Q 240 135, 260 175" fill="none" stroke="#27500A" strokeWidth="0.5" opacity="0.4"/>
          <path d="M 280 90 Q 300 125, 310 170" fill="none" stroke="#27500A" strokeWidth="0.5" opacity="0.4"/>
          <path d="M 400 90 Q 380 125, 370 170" fill="none" stroke="#27500A" strokeWidth="0.5" opacity="0.4"/>
          <path d="M 480 105 Q 440 135, 420 175" fill="none" stroke="#27500A" strokeWidth="0.5" opacity="0.4"/>
          {/* Pest dots clustered along the underside */}
          <g fill="#4A1B0C" opacity="0.85">
            <circle cx="220" cy="155" r="3"/><circle cx="235" cy="160" r="2.5"/>
            <circle cx="250" cy="165" r="3"/><circle cx="265" cy="160" r="2"/>
            <circle cx="290" cy="155" r="3"/><circle cx="310" cy="160" r="2.5"/>
            <circle cx="340" cy="155" r="3.5"/><circle cx="370" cy="160" r="2.5"/>
            <circle cx="395" cy="155" r="3"/><circle cx="420" cy="160" r="2"/>
            <circle cx="440" cy="165" r="3"/><circle cx="460" cy="160" r="2.5"/>
          </g>
          {/* Downward curl arrows */}
          <path d="M 100 50 Q 105 35, 130 45" fill="none" stroke="#D85A30" strokeWidth="2" strokeLinecap="round"/>
          <polygon points="125,40 138,46 130,53" fill="#D85A30"/>
          <path d="M 580 50 Q 575 35, 550 45" fill="none" stroke="#D85A30" strokeWidth="2" strokeLinecap="round"/>
          <polygon points="555,40 542,46 550,53" fill="#D85A30"/>
          {/* Inline annotations */}
          <text x="60" y="65" fontFamily="sans-serif" fontSize="11" fill="#27500A" fontWeight="600">Upper</text>
          <text x="60" y="78" fontFamily="sans-serif" fontSize="9" fill="#3B6D11" opacity="0.8">(convex)</text>
          <text x="540" y="205" fontFamily="sans-serif" fontSize="11" fill="#4A1B0C" fontWeight="600">Pests</text>
          <text x="540" y="218" fontFamily="sans-serif" fontSize="9" fill="#993C1D">on underside</text>
        </svg>
        <div className="absolute bottom-1.5 right-2 bg-white/90 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm pointer-events-none">
          Diagnostic
        </div>
      </div>
    );
  }

  if (id === 'upward_curl') {
    return (
      <div className="relative mb-4 w-full h-48 rounded-xl border-2 border-slate-200 shadow-sm bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <svg viewBox="0 0 680 240" className="w-full h-full" role="img" aria-label={alt} xmlns="http://www.w3.org/2000/svg">
          <title>Upward leaf curl diagnostic</title>
          {/* Healthy green center (concave, cupped up) */}
          <path d="M 140 110 Q 340 160, 540 110 L 545 140 Q 340 190, 135 140 L 140 110 Z"
                fill="#639922" stroke="#3B6D11" strokeWidth="1"/>
          {/* Left crispy dead edge curling up */}
          <path d="M 60 50 Q 100 30, 140 60 L 140 110 Q 100 105, 60 90 L 60 50 Z"
                fill="#854F0B" stroke="#633806" strokeWidth="0.5"/>
          <path d="M 70 55 Q 90 52, 110 60" fill="none" stroke="#412402" strokeWidth="0.6" opacity="0.7"/>
          <path d="M 65 70 Q 95 68, 125 78" fill="none" stroke="#412402" strokeWidth="0.6" opacity="0.7"/>
          <path d="M 68 85 Q 100 84, 130 98" fill="none" stroke="#412402" strokeWidth="0.6" opacity="0.5"/>
          <path d="M 60 50 L 55 45 L 62 42 L 58 36 L 66 38 L 64 30" fill="none" stroke="#633806" strokeWidth="0.8"/>
          {/* Right crispy dead edge curling up */}
          <path d="M 620 50 Q 580 30, 540 60 L 540 110 Q 580 105, 620 90 L 620 50 Z"
                fill="#854F0B" stroke="#633806" strokeWidth="0.5"/>
          <path d="M 610 55 Q 590 52, 570 60" fill="none" stroke="#412402" strokeWidth="0.6" opacity="0.7"/>
          <path d="M 615 70 Q 585 68, 555 78" fill="none" stroke="#412402" strokeWidth="0.6" opacity="0.7"/>
          <path d="M 612 85 Q 580 84, 550 98" fill="none" stroke="#412402" strokeWidth="0.6" opacity="0.5"/>
          <path d="M 620 50 L 625 45 L 618 42 L 622 36 L 614 38 L 616 30" fill="none" stroke="#633806" strokeWidth="0.8"/>
          {/* Transition (yellow-brown) zones */}
          <path d="M 140 60 L 140 110 L 135 140 Q 142 125, 142 90 L 140 60 Z" fill="#BA7517" opacity="0.5"/>
          <path d="M 540 60 L 540 110 L 545 140 Q 538 125, 538 90 L 540 60 Z" fill="#BA7517" opacity="0.5"/>
          {/* Bright green midrib */}
          <path d="M 140 135 Q 340 175, 540 135" fill="none" stroke="#173404" strokeWidth="2.5"/>
          <path d="M 140 135 Q 340 175, 540 135" fill="none" stroke="#639922" strokeWidth="1.5"/>
          {/* Lateral veins */}
          <path d="M 220 125 Q 240 145, 250 160" fill="none" stroke="#27500A" strokeWidth="0.5" opacity="0.5"/>
          <path d="M 290 130 Q 305 150, 310 165" fill="none" stroke="#27500A" strokeWidth="0.5" opacity="0.5"/>
          <path d="M 390 130 Q 375 150, 370 165" fill="none" stroke="#27500A" strokeWidth="0.5" opacity="0.5"/>
          <path d="M 460 125 Q 440 145, 430 160" fill="none" stroke="#27500A" strokeWidth="0.5" opacity="0.5"/>
          {/* Upward curl arrows */}
          <path d="M 90 18 Q 95 5, 110 12" fill="none" stroke="#D85A30" strokeWidth="2" strokeLinecap="round"/>
          <polygon points="105,8 117,14 110,21" fill="#D85A30"/>
          <path d="M 590 18 Q 585 5, 570 12" fill="none" stroke="#D85A30" strokeWidth="2" strokeLinecap="round"/>
          <polygon points="575,8 563,14 570,21" fill="#D85A30"/>
          {/* Labels */}
          <text x="60" y="155" fontFamily="sans-serif" fontSize="11" fill="#633806" fontWeight="600">Crispy</text>
          <text x="60" y="168" fontFamily="sans-serif" fontSize="9" fill="#854F0B">brown edge</text>
          <text x="555" y="155" fontFamily="sans-serif" fontSize="11" fill="#633806" fontWeight="600">Crispy</text>
          <text x="555" y="168" fontFamily="sans-serif" fontSize="9" fill="#854F0B">brown edge</text>
          <text x="340" y="215" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fill="#3B6D11" fontWeight="600">Center vein stays green</text>
        </svg>
        <div className="absolute bottom-1.5 right-2 bg-white/90 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm pointer-events-none">
          Diagnostic
        </div>
      </div>
    );
  }

  // Fallback for any other id (shouldn't happen with current usage)
  return null;
};

export default function EnApp() {
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
    pest.moa = PEST_MOA_MAPPING[pest.id]?.en || 'N/A';
    pest.application = PEST_APPLICATION_MAPPING[pest.id]?.en || 'Targeted Application';
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
      // Using Object.values lets us add languages later without touching this code.
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
             matchLifeStage = /(Nymph|Grub|Crawler|Caterpillar|Maggot|Larva)/i.test(pest.common.en);
         } else if (filterStage === 'Adults') {
             if (pest.category === 'Insects') {
                 matchLifeStage = !/(Nymph|Grub|Crawler|Caterpillar|Maggot|Larva)/i.test(pest.common.en);
             }
         }
      }

      return matchCat && matchPart && matchSearch && matchSeverity && matchLifeStage;
    });
  }, [search, filterCat, filterPart, filterSeverity, filterStage]);

  const getWhatsAppUrl = (pest) => {
    let text = `AgriPro IPM Alert\n\nPest/Disease: ${pest.common.en}\nScientific: ${pest.scientific}\nSeverity Level: ${pest.severity}/5\nActivity: ${pest.activity}\n\nSymptoms: ${pest.symptoms.en}\n\nTarget Areas: ${pest.target.en}\n\nProtocol Summary: ${pest.control.en}`;
    
    if (pest.application && pest.application !== 'N/A' && !['Vertebrates'].includes(pest.category)) {
      text += `\n\nSpray Target: ${pest.application}`;
    }

    if (pest.moa && pest.moa !== 'N/A' && !['Vertebrates'].includes(pest.category)) {
      const categorized = categorizeMoa(pest.moa, pest.category);
      if (categorized) {
        text += `\n\n3-Phase Execution Strategy:`;
        [1, 2, 3].forEach((phase, index) => {
          const info = getPhaseInfo(phase, pest.category);
          const items = categorized[phase];
          
          text += `\n[${info.title}] :`;
          if (items && items.length > 0) {
            text += `\n${items.join('\n -> ROTATE (4-7 Days) TO: ')}`;
          } else {
            text += `\nProceed to next phase`;
          }
          
          // Add extra newline between phases for readability, except after the last phase
          if (index < 2) {
            text += `\n`;
          }
        });
      }
    }
    
    // Universal link handles iOS, Android, and Desktop reliably. 
    // Custom 'whatsapp://' schemes are often blocked by iOS Safari in embedded environments.
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const getRiskColor = (score) => score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-orange-500' : 'bg-emerald-500';
  const getRiskText = (score) => score >= 70 ? 'text-red-700' : score >= 40 ? 'text-orange-700' : 'text-emerald-700';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 relative">
      
      {showTopBtn && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[90] bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-2xl transition-all hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8"
          title="Back to Top"
        >
          <Icon name="arrow-up" className="w-8 h-8" />
        </button>
      )}

<header className="bg-purple-900 text-white shadow-md sticky top-0 z-40">
        {/* Force Row layout for brand and tabs across all screen sizes to achieve "Top Right" requirement */}
        <div className="max-w-[90rem] mx-auto px-4 py-4 flex flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="flex-shrink-0 bg-purple-800 p-1 md:p-2 rounded-lg border border-purple-700 flex items-center justify-center">
              <Icon name="leaf" className="w-3.5 h-3.5 md:w-6 md:h-6 text-purple-300" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-base md:text-2xl font-bold tracking-tight leading-none text-white text-left whitespace-nowrap">
                <span className="md:hidden">DIPM</span>
                <span className="hidden md:inline">AGRIPRO DIPM</span>
              </h1>
            </div>
          </div>
          
          {/* Tabs switch positioned top right */}
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <div className="flex bg-emerald-950 p-1 rounded-lg border border-emerald-800">
            <button 
              onClick={() => setActiveTab('simulator')}
              className={`px-2.5 py-1.5 md:px-5 md:py-2 rounded-md text-[11px] md:text-sm font-bold flex items-center gap-1 md:gap-2 transition-all ${activeTab === 'simulator' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-400 hover:text-white'}`}
            >
              <Icon name="activity" className="hidden md:inline-block w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Risk Engine</span><span className="sm:hidden">Risk</span>
            </button>
            <button 
              onClick={() => setActiveTab('database')}
              className={`px-2.5 py-1.5 md:px-5 md:py-2 rounded-md text-[11px] md:text-sm font-bold flex items-center gap-1 md:gap-2 transition-all ${activeTab === 'database' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-400 hover:text-white'}`}
            >
              <Icon name="search" className="hidden md:inline-block w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Database</span><span className="sm:hidden">DB</span>
            </button>
          </div>
            <button
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg text-[11px] md:text-sm font-bold bg-emerald-950 border border-emerald-800 text-emerald-100 hover:bg-emerald-800 hover:text-white transition-colors flex items-center gap-1 md:gap-1.5"
              title="Switch to Chinese"
              aria-label="Switch language"
            >
              <span className="font-bold">{lang === 'en' ? '中' : 'EN'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[90rem] mx-auto mt-8 px-6">
        
        {/* --- TAB 1: RISK ENGINE --- */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 p-6 border-b border-slate-200 flex items-center gap-3">
                  <Icon name="settings" className="w-8 h-8 text-slate-700" />
                  <h2 className="font-bold text-2xl text-slate-900">Orchard Conditions</h2>
                </div>
                
                <div className="p-8 space-y-8">
                  <div className="space-y-4">
                    <label className="text-xl font-bold text-slate-800 flex items-center gap-3">
                      <Icon name="leaf" className="w-6 h-6 text-emerald-600"/> Growth Stage
                    </label>
                    <select value={stage} onChange={(e) => setStage(e.target.value)} className="w-full p-4 text-xl bg-slate-50 border-2 border-slate-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all">
                      <option value="seedling">1. Seedling / Transplant</option>
                      <option value="vegetative">2. Vegetative (Flushing)</option>
                      <option value="pre-flowering">3. Pre-Flowering & Induction</option>
                      <option value="flower-bud">4. Flower Bud (Crab Eyes)</option>
                      <option value="matchstick">5. Matchstick Elongation</option>
                      <option value="full-bloom">6. Full Bloom (Anthesis)</option>
                      <option value="early-fruit">7. Early Fruit Set (0-10 DAA)</option>
                      <option value="wave-1-culling">8. 1st Wave: Embryo Culling (10-25 DAA)</option>
                      <option value="wave-2-flush">9. 2nd Wave: Flush Competition (35-50 DAA)</option>
                      <option value="rapid-expansion">10. Rapid Expansion</option>
                      <option value="maturation">11. Maturation & Natural Split</option>
                      <option value="post-harvest">12. Post-harvest Recovery</option>
                    </select>
                  </div>

                  <div className="space-y-4 border-t border-slate-200 pt-6">
                    <div className="flex justify-between items-center">
                      <label className="text-xl font-bold text-slate-800 flex items-center gap-3"><Icon name="activity" className="w-6 h-6 text-blue-600"/> Nitrogen (kg/tree)</label>
                      <div className="flex items-center gap-4">
                        <button onClick={() => setShowNCalc(!showNCalc)} className="text-sm font-bold text-blue-600 hover:text-blue-800 underline flex items-center gap-1">
                          <Icon name="calculator" className="w-4 h-4" /> Calculator
                        </button>
                        <span className="text-blue-700 font-extrabold bg-blue-100 px-3 py-1 rounded-lg text-xl">{nitrogen.toFixed(2)}</span>
                      </div>
                    </div>
                    <input type="range" min="0" max="1.5" step="0.05" value={nitrogen} onChange={(e) => setNitrogen(Number(e.target.value))} className="w-full h-3 accent-blue-600 rounded-lg"/>
                    
                    {showNCalc && (
                      <div className="bg-blue-50/50 p-6 rounded-2xl border-2 border-blue-200 mt-4 animate-in fade-in zoom-in-95">
                         <h4 className="font-extrabold text-blue-900 flex items-center gap-2 mb-4 text-lg"><Icon name="calculator" className="w-6 h-6"/> Element N Bag Calculator</h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">N value (%)</label>
                              <input type="number" value={calcNPercent} onChange={e=>setCalcNPercent(e.target.value === '' ? '' : Number(e.target.value))} onFocus={(e) => e.target.select()} className="w-full p-4 rounded-xl border-2 border-slate-300 mt-2 text-xl font-bold text-slate-800 focus:border-blue-500 outline-none" />
                            </div>
                            <div>
                              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Bag Weight (kg)</label>
                              <input type="number" value={calcBagWeight} onChange={e=>setCalcBagWeight(e.target.value === '' ? '' : Number(e.target.value))} onFocus={(e) => e.target.select()} className="w-full p-4 rounded-xl border-2 border-slate-300 mt-2 text-xl font-bold text-slate-800 focus:border-blue-500 outline-none" />
                            </div>
                            <div>
                              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Trees Per Bag</label>
                              <input type="number" value={calcTreesPerBag} onChange={e=>setCalcTreesPerBag(e.target.value === '' ? '' : Number(e.target.value))} onFocus={(e) => e.target.select()} className="w-full p-4 rounded-xl border-2 border-slate-300 mt-2 text-xl font-bold text-slate-800 focus:border-blue-500 outline-none" />
                            </div>
                         </div>
                         <div className="flex flex-col md:flex-row justify-between items-center bg-blue-100 p-5 rounded-xl mt-6 border border-blue-200 gap-4">
                           <div>
                             <span className="block text-sm text-blue-800 font-bold uppercase tracking-wider">Total N in bag: {(Number(calcNPercent||0)/100 * Number(calcBagWeight||0)).toFixed(2)} kg</span>
                             <span className="block text-2xl font-black text-blue-950 mt-1">Element N/tree: {calculatedNPerTree.toFixed(2)} kg</span>
                           </div>
                           <button onClick={() => { setNitrogen(parseFloat(calculatedNPerTree.toFixed(2))); setShowNCalc(false); }} className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg rounded-xl transition-colors shadow-md">Apply to Slider</button>
                         </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 border-t border-slate-200 pt-6">
                    <label className="text-xl font-bold text-slate-800 flex items-center gap-3"><Icon name="rain" className="w-6 h-6 text-cyan-600"/> Weather Pattern</label>
                    <div className="grid grid-cols-2 gap-4">
                      <select value={rain} onChange={(e) => setRain(e.target.value)} className="p-4 border-2 border-slate-300 rounded-xl text-xl bg-slate-50">
                        <option value="low">Dry Season</option>
                        <option value="moderate">Intermittent</option>
                        <option value="high">Monsoon / Wet</option>
                      </select>
                      <input type="number" placeholder="Dry Days" value={dryDays} onChange={(e) => setDryDays(e.target.value === '' ? '' : Number(e.target.value))} onFocus={(e) => e.target.select()} className="p-4 border-2 border-slate-300 rounded-xl text-xl bg-slate-50" title="Consecutive dry days" />
                    </div>
                    <div className="pt-4">
                       <label className="text-lg font-semibold text-slate-600 flex justify-between mb-3">Humidity <span>{humidity}%</span></label>
                       <input type="range" min="40" max="100" value={humidity} onChange={(e) => setHumidity(Number(e.target.value))} className="w-full h-3 accent-cyan-600 rounded-lg"/>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-slate-200 pt-6">
                    <label className="flex items-center gap-4 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors">
                      <input type="checkbox" checked={nearForest} onChange={(e) => setNearForest(e.target.checked)} className="w-6 h-6 accent-amber-600"/>
                      <span className="text-xl font-bold text-amber-900 flex items-center gap-3"><Icon name="leaf" className="w-6 h-6"/> Orchard borders jungle/forest</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div><h3 className="font-extrabold text-slate-900 text-2xl">Sap-Sucking Insects</h3><p className="text-lg text-slate-600 mt-1">Leafhoppers, Pit Scale, Psyllids</p></div>
                    <Icon name="bug" className={`w-10 h-10 ${getRiskText(risks.sapSuckers)}`} />
                  </div>
                  <div className="flex items-end gap-4 mt-6">
                    <span className={`text-6xl font-black ${getRiskText(risks.sapSuckers)}`}>{risks.sapSuckers}%</span>
                    <div className="flex-1 pb-2"><div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${getRiskColor(risks.sapSuckers)} transition-all duration-500`} style={{width: `${risks.sapSuckers}%`}}/></div></div>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div><h3 className="font-extrabold text-slate-900 text-2xl">Tissue Borers</h3><p className="text-lg text-slate-600 mt-1">Fruit Borer, Termites, Ambrosia</p></div>
                    <Icon name="bug" className={`w-10 h-10 ${getRiskText(risks.borers)}`} />
                  </div>
                  <div className="flex items-end gap-4 mt-6">
                    <span className={`text-6xl font-black ${getRiskText(risks.borers)}`}>{risks.borers}%</span>
                    <div className="flex-1 pb-2"><div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${getRiskColor(risks.borers)} transition-all duration-500`} style={{width: `${risks.borers}%`}}/></div></div>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div><h3 className="font-extrabold text-slate-900 text-2xl">Fungal Pathogens</h3><p className="text-lg text-slate-600 mt-1">Phytophthora, White Root, Algae</p></div>
                    <Icon name="droplets" className={`w-10 h-10 ${getRiskText(risks.fungal)}`} />
                  </div>
                  <div className="flex items-end gap-4 mt-6">
                    <span className={`text-6xl font-black ${getRiskText(risks.fungal)}`}>{risks.fungal}%</span>
                    <div className="flex-1 pb-2"><div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${getRiskColor(risks.fungal)} transition-all duration-500`} style={{width: `${risks.fungal}%`}}/></div></div>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div><h3 className="font-extrabold text-slate-900 text-2xl">Wildlife Intrusion</h3><p className="text-lg text-slate-600 mt-1">Macaques, Squirrels, Boars</p></div>
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
                  <h3 className="font-extrabold text-2xl text-slate-900">Tiered Action Plan (IPM)</h3>
                </div>
                <div className="p-4 md:p-8 space-y-6">
                  <div className={`flex flex-col md:flex-row gap-2 md:gap-5 text-base md:text-xl p-4 md:p-5 rounded-xl border-2 transition-colors ${risks.sapSuckers >= 70 ? 'bg-red-50 border-red-200 text-red-900' : risks.sapSuckers >= 40 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <span className={`font-black w-full md:w-40 flex-shrink-0 uppercase tracking-tighter ${risks.sapSuckers >= 70 ? 'text-red-700' : risks.sapSuckers >= 40 ? 'text-amber-700' : 'text-emerald-700'}`}>SAP SUCKERS:</span>
                    <span className="leading-relaxed font-semibold">
                      {risks.sapSuckers >= 70 ? "Outbreak conditions. Apply Imidacloprid/Acetamiprid late afternoon. Check twigs for Pit Scale craters." :
                       risks.sapSuckers >= 40 ? "Population growing. Apply Neem oil (1%) or insecticidal soap. Avoid applying high Nitrogen to reduce tender flush." :
                       "Preventative: Deploy yellow sticky traps for monitoring. Maintain beneficial insect habitats (ladybugs/lacewings)."}
                    </span>
                  </div>

                  <div className={`flex flex-col md:flex-row gap-2 md:gap-5 text-base md:text-xl p-4 md:p-5 rounded-xl border-2 transition-colors ${risks.borers >= 70 ? 'bg-red-50 border-red-200 text-red-900' : risks.borers >= 40 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <span className={`font-black w-full md:w-40 flex-shrink-0 uppercase tracking-tighter ${risks.borers >= 70 ? 'text-red-700' : risks.borers >= 40 ? 'text-amber-700' : 'text-emerald-700'}`}>BORERS/WOOD:</span>
                    <span className="leading-relaxed font-semibold">
                      {risks.borers >= 70 ? "Critical risk. Deploy High-Canopy Solar Light Traps immediately to intercept night-flying borer moths. Check trunks for termite mud tubes or ambrosia beetle frass." :
                       risks.borers >= 40 ? "Fruit development starting. Activate Solar Light Traps (High-Canopy) from dusk to midnight to block moth egg-laying. Ensure low-level traps are on for Chafer Beetles." :
                       "Preventative: Clear fallen branches and rotting fruits from orchard floor. Inspect living trunks for termite activity."}
                    </span>
                  </div>

                  <div className={`flex flex-col md:flex-row gap-2 md:gap-5 text-base md:text-xl p-4 md:p-5 rounded-xl border-2 transition-colors ${risks.fungal >= 70 ? 'bg-red-50 border-red-200 text-red-900' : risks.fungal >= 40 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <span className={`font-black w-full md:w-40 flex-shrink-0 uppercase tracking-tighter ${risks.fungal >= 70 ? 'text-red-700' : risks.fungal >= 40 ? 'text-amber-700' : 'text-emerald-700'}`}>FUNGAL:</span>
                    <span className="leading-relaxed font-semibold">
                      {risks.fungal >= 70 ? (
                        ['flower-bud', 'matchstick', 'full-bloom', 'early-fruit'].includes(stage) ? 
                          <span>High moisture alert! <strong className="text-red-700 uppercase">⚠️ Zero Copper Window Active!</strong> Do NOT use copper sprays or you will instantly abort the flowers. Apply a Phosphonate soil drench and spray <em>Bacillus subtilis</em> on the canopy immediately.</span> :
                          "High moisture alert. Ensure drainage channels are clear to prevent Phytophthora collar rot. Apply Phosphonate drench immediately."
                      ) : risks.fungal >= 40 ? (
                        ['flower-bud', 'matchstick', 'full-bloom', 'early-fruit'].includes(stage) ? 
                          <span>Conditions favorable for spores. <strong className="text-amber-800 uppercase">⚠️ Zero Copper Window Active!</strong> Do NOT spray copper fungicides preventatively. Switch to soft biologicals like <em>Bacillus subtilis</em> to protect delicate flowers.</span> :
                          "Conditions favorable for spores. Apply Trichoderma around tree base. Spray copper fungicides preventatively."
                      ) : 
                       `Preventative: ${stage === 'post-harvest' ? 'Ideal time for major structural canopy pruning to maximize airflow and sunlight for the next season.' : 'Perform only minor sanitary pruning (remove dead/diseased twigs); save major structural pruning for post-harvest to avoid fruit/flower drop.'}`}
                    </span>
                  </div>

                  <div className={`flex flex-col md:flex-row gap-2 md:gap-5 text-base md:text-xl p-4 md:p-5 rounded-xl border-2 transition-colors ${risks.wildlife >= 70 ? 'bg-red-50 border-red-200 text-red-900' : risks.wildlife >= 40 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <span className={`font-black w-full md:w-40 flex-shrink-0 uppercase tracking-tighter ${risks.wildlife >= 70 ? 'text-red-700' : risks.wildlife >= 40 ? 'text-amber-700' : 'text-emerald-700'}`}>WILDLIFE:</span>
                    <span className="leading-relaxed font-semibold">
                      {risks.wildlife >= 70 ? "High intrusion risk. Energize perimeter fences. Use zinc wraps to stop Civets. Apply slug pellets if Slugs spotted." :
                       risks.wildlife >= 40 ? "Attraction increasing. Clear forest brush near orchard edges. Guard dogs on active patrol." :
                       "Preventative: Conduct monthly checks on perimeter fences and repair any gaps. Secure waste bins."}
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-2 md:gap-5 text-base md:text-xl p-4 md:p-5 rounded-xl border-2 transition-colors bg-indigo-50 border-indigo-200 text-indigo-900 mt-2">
                    <span className="font-black w-full md:w-40 flex-shrink-0 uppercase tracking-tighter text-indigo-700 flex flex-col gap-1">
                      <span className="flex items-center gap-2"><Icon name="dollar-sign" className="w-5 h-5"/> FORMULATION:</span>
                      <span className="text-sm font-bold text-indigo-500">Cost Control</span>
                    </span>
                    <span className="leading-relaxed font-semibold">
                      {!isCriticalStage ? 
                        <span><strong className="text-emerald-700">Cost-Saving Mode Active:</strong> You are in a non-critical vegetative or recovery stage. To lower operational costs, prioritize generic <strong>Powder formulations (WP, SP, WG)</strong>. They are highly cost-effective and perfectly adequate for broad canopy maintenance.</span> :
                        <span><strong className="text-amber-700">Premium Protection Active:</strong> You are in a highly sensitive flowering/fruiting stage. Switch to <strong>Liquid formulations (EC, SC, SL, OD)</strong>. Though more expensive, they offer faster absorption, better rainfastness, and significantly lower the risk of burning delicate flowers or leaving chalky residues on premium fruit husks.</span>
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
                      // Blur the active element to dismiss the mobile keyboard
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
                      placeholder="Search for..." 
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
                      <option value="All">Target: All Areas</option>
                      <option value="Leaves">Leaves & Flushes</option>
                      <option value="Trunk/Branches">Trunks & Branches</option>
                      <option value="Roots">Roots & Soil</option>
                      <option value="Fruit/Flower">Fruits & Flowers</option>
                    </select>
                  </div>

                  <div className="relative w-full md:w-56 flex-shrink-0">
                    <Icon name="shield" className="w-5 h-5 absolute left-4 top-4.5 text-slate-400" />
                    <select 
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value)}
                      className="w-full pl-12 pr-6 py-3.5 text-lg font-bold bg-slate-50 border-2 border-slate-300 rounded-xl outline-none focus:border-emerald-500 transition-all text-slate-700"
                    >
                      <option value="All">Severity: All</option>
                      <option value="Critical">Critical (4-5 ●)</option>
                      <option value="Moderate">Moderate (1-3 ●)</option>
                    </select>
                  </div>

                  <div className="flex bg-slate-100 p-1 rounded-xl border-2 border-slate-200 w-full md:w-48 flex-shrink-0 h-[56px]">
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-700 border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Icon name="list" className="w-5 h-5" /> <span className="hidden md:block">List</span>
                    </button>
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg font-bold transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-700 border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Icon name="grid" className="w-5 h-5" /> <span className="hidden md:block">Grid</span>
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
                    {cat}
                  </button>
                ))}
              </div>

              {(filterCat === 'All' || filterCat === 'Insects') && (
                <div className="flex items-center gap-3 overflow-x-auto w-full pb-2 md:pb-0 hide-scrollbar pt-3 border-t border-slate-100 animate-in fade-in">
                  <Icon name="clock" className="w-5 h-5 text-slate-400 flex-shrink-0 hidden md:block" />
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:block">Insect Stage:</span>
                  {[
                    { id: 'All Stages', label: 'All Stages' },
                    { id: 'Juveniles', label: '🐛 Juveniles (Nymphs/Grubs)' },
                    { id: 'Adults', label: '🦋 Adults (Winged/Moths)' }
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
                    <span className="block">{showAllGuides ? 'Hide Reference Guides' : 'Show Reference Guides (7)'}</span>
                    <span className="block text-xs text-slate-500 font-normal mt-0.5">Field diagnostics, traps, tank-mix, biological warfare, microbes, DT₅₀ & MRL</span>
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
                        <span className="block font-extrabold text-xl leading-tight">Field Diagnostics: Reading Leaf Curls</span>
                        <span className="block text-sm text-indigo-700 font-medium mt-0.5">Quickly identify pests by observing leaf shape deformations</span>
                      </div>
                    </div>
                    <Icon name={showDiagGuide ? "chevron-up" : "chevron-down"} className="w-8 h-8 text-indigo-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                  </button>

                  {showDiagGuide && (
                    <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 mt-4 shadow-md animate-in fade-in slide-in-from-top-4">
                      <p className="text-lg text-slate-600 font-medium mb-6">
                        Did you know the direction a leaf curls can help you identify the pest before you even see it? 
                        Here is a quick scouting guide based on leaf shape:
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
                          <div className="flex items-center gap-3 mb-4">
                            <Icon name="chevron-down" className="w-8 h-8 text-amber-600" />
                            <h4 className="font-bold text-xl text-slate-800">Downward / Inward Curl<br/><span className="text-sm text-slate-500 font-medium">(Cupping Down)</span></h4>
                          </div>
                          
                          <AIIllustration 
                            id="downward_curl"
                            alt="Downward curling durian leaf — pests hide on the underside" 
                          />

                          <p className="text-slate-600 mb-4 leading-relaxed flex-1">
                            Pests are feeding aggressively on the <strong>underside</strong> of the leaf. Their toxic saliva halts cellular expansion on the bottom, while the top cells keep growing, forcing the leaf to bow downward like a tent.
                          </p>
                          <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <strong className="text-slate-800 block mb-2 uppercase tracking-wider text-xs">Common Culprits:</strong>
                            <ul className="list-disc pl-5 text-amber-700 font-bold text-sm space-y-1.5">
                              <li>Durian Psyllids</li>
                              <li>Black Citrus Aphids</li>
                              <li>Broad Mites</li>
                            </ul>
                          </div>
                          <p className="mt-4 text-sm font-bold text-indigo-600 flex items-center gap-2">
                            <Icon name="info" className="w-5 h-5 flex-shrink-0" /> Pro-Tip: Always flip these leaves over to find the colony.
                          </p>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-full">
                          <div className="flex items-center gap-3 mb-4">
                            <Icon name="chevron-up" className="w-8 h-8 text-emerald-600" />
                            <h4 className="font-bold text-xl text-slate-800">Upward / Outward Curl<br/><span className="text-sm text-slate-500 font-medium">(Boat-Shaped)</span></h4>
                          </div>

                          <AIIllustration 
                            id="upward_curl"
                            alt="Upward curling durian leaf — crispy brown edges with green center vein" 
                          />

                          <p className="text-slate-600 mb-4 leading-relaxed flex-1">
                            Indicates severe vascular damage at the leaf margins or upper-surface feeding. The dead edges shrink and dry out, pulling the healthy green center of the leaf upward.
                          </p>
                          <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <strong className="text-slate-800 block mb-2 uppercase tracking-wider text-xs">Common Culprits:</strong>
                            <ul className="list-disc pl-5 text-emerald-700 font-bold text-sm space-y-1.5">
                              <li>Chilli Thrips</li>
                              <li>Green Leafhoppers (Hopperburn)</li>
                              <li>Eriophyid Mites</li>
                            </ul>
                          </div>
                          <p className="mt-4 text-sm font-bold text-indigo-600 flex items-center gap-2">
                            <Icon name="info" className="w-5 h-5 flex-shrink-0" /> Pro-Tip: Indicates highly mobile/flying pests.
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
                        <span className="block font-extrabold text-xl leading-tight">Visual Trapping & Diurnal IPM</span>
                        <span className="block text-sm text-emerald-700 font-medium mt-0.5">Using colors to manage and monitor insect outbreaks</span>
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
                        <span className="block font-extrabold text-xl leading-tight">Nocturnal Light Trapping (Solar Lamps)</span>
                        <span className="block text-sm text-amber-700 font-medium mt-0.5">Targeting Fruit Borer Moths & Chafer Beetles at night</span>
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
                        <span className="block font-extrabold text-xl leading-tight">Advanced Agronomy: Tank-Mixing & Synergy</span>
                        <span className="block text-sm text-violet-700 font-medium mt-0.5">Golden pH rules and creating 1+1=3 chemical cocktails</span>
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
                        <span className="block font-extrabold text-xl leading-tight">Biological Warfare: Bacillus vs Fungi</span>
                        <span className="block text-sm text-lime-700 font-medium mt-0.5">How beneficial bacteria obliterate pathogens like Rhizoctonia</span>
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
                        <span className="block font-extrabold text-xl leading-tight">Probiotic Agronomy: The Elite 15 Microbes</span>
                        <span className="block text-sm text-teal-700 font-medium mt-0.5">Build a self-sustaining defense grid with advanced bio-agents</span>
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
                        <span className="block font-extrabold text-xl leading-tight">Chemical Lifespan (DT₅₀) & MRLs</span>
                        <span className="block text-sm text-sky-700 font-medium mt-0.5">Database for environmental degradation times and export safety</span>
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
                
                let searchSuffix = "";
                const lowerCommon = pest.common.en.toLowerCase();
                if (lowerCommon.includes('crawler')) searchSuffix = " crawler";
                else if (lowerCommon.includes('nymph') || lowerCommon.includes('hopper')) searchSuffix = " nymph";
                else if (lowerCommon.includes('grub') || lowerCommon.includes('larva')) searchSuffix = " larva";
                else if (lowerCommon.includes('caterpillar') || lowerCommon.includes('maggot')) searchSuffix = " larva";
                else if (lowerCommon.includes('adult') || lowerCommon.includes('moth') || lowerCommon.includes('beetle')) searchSuffix = " adult";
                const localName = pest.common.en.split('/')[0].split('(')[0].split('（')[0].trim();
                const searchQuery = `${primaryName} ${localName}${searchSuffix}`.trim();
                
                const isGrid = viewMode === 'grid';
                const categorizedMoa = categorizeMoa(pest.moa, pest.category);

                return (
                <div key={pest.id} className={`bg-white shadow-md border-2 border-slate-200 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 relative group ${isGrid ? 'rounded-2xl h-[520px]' : 'rounded-3xl'}`}>
                  
                  <div className={`flex flex-col gap-2 px-6 pt-6 ${isGrid ? 'pb-3' : 'pb-4'}`}>
                    <span className={`inline-block self-start px-3 py-1 rounded-md text-xs uppercase font-bold tracking-wider text-white shadow-sm ${
                      pest.category === 'Insects' ? 'bg-amber-600' : pest.category === 'Fungi/Pathogens' ? 'bg-blue-600' :
                      pest.category === 'Vertebrates' ? 'bg-orange-600' : pest.category === 'Molluscs' ? 'bg-pink-600' :
                      pest.category === 'Weeds/Epiphytes' ? 'bg-teal-600' : 'bg-purple-600'
                    }`}>{pest.category}</span>
                    <h3 className={`font-extrabold leading-tight text-slate-900 ${isGrid ? 'text-2xl' : 'text-4xl'}`}>
                      {pest.common.en}
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
                           <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Severity</span>
                           <SeverityDots rating={pest.severity} />
                         </div>
                         {isGrid && pest.activity !== 'N/A' && (
                           <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 border border-slate-200 px-2 py-1 rounded-md bg-slate-50">
                             <Icon name={getActivityIcon(pest.activity)} className="w-3.5 h-3.5 text-indigo-500" />
                             {pest.activity}
                           </span>
                         )}
                       </div>
                       <div className="flex flex-wrap gap-2">
                         {pest.stages.map(s => (
                           <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold uppercase rounded-md border border-slate-200">
                             {s}
                           </span>
                         ))}
                       </div>
                    </div>

                    {!isGrid && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b-2 border-slate-100 mt-4">
                         <div>
                           <span className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Family</span>
                           <span className="font-extrabold text-slate-800 text-lg">{pest.family}</span>
                         </div>
                         <div>
                           <span className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Genus</span>
                           <span className="font-extrabold text-slate-800 text-lg italic">{pest.genus}</span>
                         </div>
                         <div>
                           <span className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Action/Type</span>
                           <span className="font-extrabold text-slate-800 text-lg">{pest.type.en}</span>
                         </div>
                         <div>
                           <span className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Activity</span>
                           <span className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                             <Icon name={getActivityIcon(pest.activity)} className="w-5 h-5 text-indigo-500" />
                             {pest.activity}
                           </span>
                         </div>
                      </div>
                    )}

                    {!isGrid && (
                      <div>
                        <span className="flex items-center gap-2 text-lg font-bold text-slate-500 uppercase tracking-wider mb-2"><Icon name="leaf" className="w-5 h-5"/> Target Area</span>
                        <p className="font-medium leading-relaxed">{pest.target.en} ({pest.part})</p>
                      </div>
                    )}

                    <div>
                      {!isGrid && <span className="flex items-center gap-2 text-lg font-bold text-slate-500 uppercase tracking-wider mb-2"><Icon name="info" className="w-5 h-5"/> Symptoms & Hiding</span>}
                      <p className={isGrid ? "text-sm text-slate-600 line-clamp-4 leading-relaxed font-medium" : "mb-2 leading-relaxed"}>
                        {!isGrid && <strong className="text-slate-900 font-extrabold">Symptoms: </strong>}
                        {pest.symptoms.en}
                      </p>
                      {!isGrid && <p className="leading-relaxed"><strong className="text-slate-900 font-extrabold">Hiding:</strong> {pest.hiding.en}</p>}
                    </div>

                    {!isGrid && pest.lifecycle.en !== 'N/A' && (
                      <div className="bg-slate-50 p-5 rounded-xl border-2 border-slate-200 mt-6">
                        <span className="block text-lg font-bold text-slate-600 uppercase tracking-wider mb-2">Life Cycle / Interaction</span>
                        <p className="text-lg leading-relaxed font-medium text-slate-800">
                          {pest.lifecycle.en} 
                          {pest.symbiosis.en && !['None', 'None.', 'N/A'].includes(pest.symbiosis.en) && (
                            <span className="text-slate-600 italic ml-1">{pest.symbiosis.en}</span>
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
                            return <span key={tag} className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${tagColor}`}>IPM: {tag}</span>
                          })}
                        </div>
                        
                        {pest.application && !['Vertebrates'].includes(pest.category) && (
                          <div className="flex flex-wrap gap-2 items-center w-full bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-200 mt-1 mb-2">
                            <span className="text-xs font-black text-indigo-800 uppercase tracking-wider flex items-center gap-1.5 mr-1">
                              <Icon name="target" className="w-4 h-4 text-indigo-600" /> Spray Target:
                            </span>
                            <span className="px-3 py-1 rounded-md text-xs font-bold bg-white text-indigo-900 border border-indigo-200 shadow-sm">
                              {pest.application}
                            </span>
                          </div>
                        )}

                        {/* NEW 3-PHASE EXECUTION STRATEGY (LIST VIEW ONLY) */}
                        {categorizedMoa && (
                          <div className="mt-2 mb-6">
                            <span className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-wider mb-3 text-lg">
                              <Icon name="activity" className="w-6 h-6 text-indigo-500"/> 3-Phase Execution Strategy
                            </span>
                            
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl mb-4 text-sm font-medium flex items-start gap-3 shadow-sm">
                              <Icon name="alert" className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                              <p><strong className="font-black uppercase tracking-wider">Do Not Tank Mix:</strong> If a phase lists multiple chemicals, do not spray them together. Apply the top chemical, wait 4 to 7 days, then rotate to the bottom chemical to break resistance.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
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
                                  <div key={phase} className={`${theme.bg} p-4 rounded-xl border ${theme.border} shadow-sm flex flex-col h-full`}>
                                    <span className={`${theme.text} font-black text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5`}>
                                       <Icon name={theme.icon} className="w-4 h-4"/> {info.title}
                                    </span>
                                    <span className={`${theme.textDesc} text-sm font-medium mb-4 flex-1`}>{info.desc}</span>
                                    <div className="flex flex-col gap-2 mt-auto">
                                      {items.length > 0 ? items.map((code, index) => {
                                         const tag = getMobilityTag(code);
                                         return (
                                           <React.Fragment key={code}>
                                              {index > 0 && (
                                                <div className="flex justify-center my-0.5 relative z-10">
                                                   <span className={`text-[9px] font-black uppercase tracking-wider bg-white px-2 py-0.5 rounded-full border shadow-sm ${theme.text} ${theme.border}`}>Rotate (4-7 Days Later)</span>
                                                </div>
                                              )}
                                              <div className="flex flex-col w-full">
                                                <span className={`${theme.badge} px-2 py-1.5 rounded-t-md text-xs font-bold shadow-sm text-center leading-tight border border-b-0`}>{code}</span>
                                                <span className={`${tag.color} text-[9px] uppercase tracking-wider px-2 py-1 rounded-b-md border font-black text-center shadow-sm`}>{tag.label}</span>
                                              </div>
                                           </React.Fragment>
                                         )
                                      }) : (
                                         <span className="text-xs font-bold opacity-50 italic text-center py-2">Proceed to next phase</span>
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
                           <Icon name="shield" className="w-3 h-3 text-amber-500" /> Rotate:
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

                    <WikiPhotoStrip scientificName={pest.scientific} lang="en" />

                    <span className={`flex items-center gap-2 font-black text-emerald-900 uppercase tracking-wider mb-3 ${isGrid ? 'text-sm' : 'text-lg border-t-2 border-emerald-200/50 pt-4'}`}>
                      <Icon name="info" className={isGrid ? "w-4 h-4" : "w-6 h-6"}/> Protocol Summary
                    </span>
                    
                    <p className={`text-emerald-950 font-medium ${isGrid ? 'text-sm line-clamp-3 mb-4' : 'text-xl leading-relaxed mb-6'}`}>
                      {pest.control.en}
                    </p>
                    
                    <div className={`flex gap-3 ${isGrid ? 'flex-col' : 'flex-col md:flex-row mt-4'}`}>
                      <a 
                        href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(searchQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 flex items-center justify-between font-bold text-emerald-600 hover:text-emerald-800 transition-all bg-white border-2 border-emerald-200 hover:border-emerald-400 shadow-sm hover:shadow-md group ${isGrid ? 'px-4 py-2.5 rounded-lg text-sm' : 'flex-col px-6 pt-4 pb-3 rounded-xl text-lg text-left'}`}
                      >
                        <span className={isGrid ? "truncate" : "pr-4 leading-tight w-full"}>{isGrid ? 'Image Search' : `Search images of ${searchQuery}`}</span>
                        <div className={isGrid ? "" : "w-full flex justify-end mt-2"}>
                          <Icon name="link" className={`${isGrid ? "w-4 h-4" : "w-6 h-6"} opacity-50 group-hover:opacity-100 transition-opacity`} />
                        </div>
                      </a>
                      
                      <a 
                        href={getWhatsAppUrl(pest)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all border-2 border-emerald-700 shadow-sm hover:shadow-md ${isGrid ? 'px-4 py-2.5 rounded-lg text-sm w-full' : 'px-6 py-4 rounded-xl text-lg'}`}
                        title="Share Alert to Field Team via WhatsApp"
                      >
                        <Icon name="share" className={isGrid ? "w-4 h-4" : "w-6 h-6"} />
                        {isGrid ? 'Share Alert' : 'Send Alert'}
                      </a>
                      <button 
                        onClick={() => setEditingPest(pest)}
                        className={`flex items-center justify-center gap-2 font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all border-2 border-purple-700 shadow-sm hover:shadow-md ${isGrid ? 'px-4 py-2.5 rounded-lg text-sm w-full' : 'px-6 py-4 rounded-xl text-lg'}`}
                        title="Edit Organic Protocol"
                      >
                        <span className={isGrid ? "text-base" : "text-2xl"}>🌱</span>
                        {savedTick !== null && isProtocolFilled(loadProtocol(pest.id))
                          ? (isGrid ? 'Edit Organic ✓' : 'Edit Organic Protocol ✓')
                          : (isGrid ? 'Add Organic' : 'Add Organic Protocol')}
                      </button>
                    </div>
                  </div>
                </div>
              )})}
            </div>

            {filteredPests.length === 0 && (
              <div className="text-center py-32 text-slate-500 bg-white rounded-3xl border-2 border-slate-200 shadow-sm">
                <Icon name="search" className="w-20 h-20 mx-auto text-slate-300 mb-6" />
                <h3 className="text-3xl font-extrabold text-slate-800">No pests found</h3>
                <p className="text-xl mt-2 font-medium">Try adjusting your Target Area or Category filter.</p>
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
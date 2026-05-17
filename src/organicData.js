// ============================================================
// Organic Protocol Storage Layer
// ============================================================
// Lightweight wrapper around localStorage for managing per-pest organic protocols.
// Data is stored in browser localStorage, keyed by pest.id, and bilingual where
// useful so we don't lock the agronomist into one language.
//
// Data shape per pest:
//
// {
//   pestId: 'green-leafhopper-nymph',
//   updatedAt: 1234567890,
//   notes: 'optional free-text notes',                  // general agronomist notes
//   phases: [
//     {                                                 // Phase 1
//       products: [
//         {
//           name: 'NeemPro 10EC',                        // product SKU / commercial name
//           dosage: '5 ml / L water',                    // dosage as the agronomist writes it
//           applicationNotes: 'Spray entire canopy...',  // when/how to apply
//           phi: '0',                                    // pre-harvest interval (days)
//           certification: 'MS ORGANIC 1529:2015',       // certification body / number
//         },
//         // ... more products
//       ],
//       adjuvant: {                                      // optional adjuvant for this phase
//         name: 'OrgaSpread',
//         dosage: '1 ml / L',
//         applicationNotes: 'Add to tank before products',
//       },
//     },
//     { products: [...], adjuvant: {...} },              // Phase 2
//     { products: [...], adjuvant: {...} },              // Phase 3
//   ],
// }
//
// Phases are always exactly 3, matching the conventional protocol structure.
// Empty phases (no products) are valid — represents "no organic option for this stage."

const STORAGE_PREFIX = 'agripro_organic:';
const INDEX_KEY = 'agripro_organic_index';  // tracks which pestIds have data

/**
 * Create an empty protocol skeleton.
 */
export function emptyProtocol(pestId) {
  return {
    pestId,
    updatedAt: 0,
    notes: '',
    phases: [
      { products: [], adjuvant: null },
      { products: [], adjuvant: null },
      { products: [], adjuvant: null },
    ],
  };
}

export function emptyProduct() {
  return {
    name: '',
    dosage: '',
    applicationNotes: '',
    phi: '',
    certification: '',
  };
}

export function emptyAdjuvant() {
  return {
    name: '',
    dosage: '',
    applicationNotes: '',
  };
}

/**
 * Load a protocol for a given pest. Returns null if none exists.
 */
export function loadProtocol(pestId) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + pestId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Sanity check
    if (!parsed?.phases || !Array.isArray(parsed.phases)) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

/**
 * Save a protocol. Updates the index of which pests have data.
 */
export function saveProtocol(protocol) {
  if (!protocol?.pestId) throw new Error('protocol.pestId required');
  protocol.updatedAt = Date.now();
  try {
    localStorage.setItem(STORAGE_PREFIX + protocol.pestId, JSON.stringify(protocol));
    addToIndex(protocol.pestId);
    return true;
  } catch (e) {
    console.error('[organicData] save failed:', e);
    return false;
  }
}

/**
 * Delete a protocol entirely.
 */
export function deleteProtocol(pestId) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + pestId);
    removeFromIndex(pestId);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check if a protocol has any actual content (vs being a stub).
 * Used by the dashboard to count "real" entries.
 */
export function isProtocolFilled(protocol) {
  if (!protocol?.phases) return false;
  return protocol.phases.some(phase =>
    (phase.products && phase.products.length > 0) ||
    (phase.adjuvant && phase.adjuvant.name)
  );
}

/**
 * Return list of pestIds that have any saved data.
 */
export function listSavedPestIds() {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch (e) {
    return [];
  }
}

/**
 * Return all saved protocols. Used by the export feature.
 */
export function loadAllProtocols() {
  const ids = listSavedPestIds();
  return ids.map(id => loadProtocol(id)).filter(Boolean);
}

function addToIndex(pestId) {
  try {
    const ids = listSavedPestIds();
    if (!ids.includes(pestId)) {
      ids.push(pestId);
      localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
    }
  } catch (e) { /* ignore */ }
}

function removeFromIndex(pestId) {
  try {
    const ids = listSavedPestIds().filter(id => id !== pestId);
    localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
  } catch (e) { /* ignore */ }
}

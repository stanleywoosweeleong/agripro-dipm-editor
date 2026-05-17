# AgriPro DIPM — Organic Protocol Editor (Internal Build)

**This is the internal editor build, separate from the public farmer-facing app.**

> Public app: [`agripro-dipm-app`](https://github.com/stanleywoosweeleong/agripro-dipm-app) — what farmers see  
> This repo: `agripro-dipm-editor` — what your partner agronomist uses to author organic protocols

## What this does

Loads the same pest database as the public app, but adds an **"Edit Organic Protocol"** button on every pest card. Agronomists fill in the partner company's organic products + dosages + certifications per pest, and when finished, export everything as CSV or Excel.

The data lives only in the agronomist's browser localStorage — there's no backend. When they finish editing, they export the file and send it to you, and you bake it into the public app.

The header is **purple** (instead of the public app's emerald green) so it's instantly clear which build is open.

## Workflow

1. Agronomist visits the deployed editor URL
2. Searches/scrolls to a pest, taps **"Add Organic Protocol"**
3. Fills in 3 phases × multiple products + adjuvants + dosages + PHI + certifications
4. Repeats for each pest they want to cover
5. When done (or partway done), taps **Export → CSV** or **Export → Excel**
6. Sends the file to you
7. You hand it off to be parsed into the public app's data

## Setup (local dev)

```bash
npm install
npm run dev
```

## Deploy

Push to GitHub. GitHub Actions auto-deploys to GitHub Pages at:

`https://<user>.github.io/agripro-dipm-editor/`

Don't share this URL publicly — it's internal-only by convention (not enforced).

## Data export format

CSV file with one row per (pest, phase, product/adjuvant). Columns:

| Column | Meaning |
|---|---|
| `pest_id` | The stable database ID — used for re-matching when importing |
| `pest_common_en` / `pest_common_zh` | Common names (read-only reference) |
| `pest_scientific` | Scientific name (read-only reference) |
| `phase` | 1, 2, or 3 |
| `kind` | `product` or `adjuvant` or `notes-only` |
| `seq` | Order within the phase (1, 2, 3...) |
| `name`, `dosage`, `application_notes`, `phi`, `certification` | Product/adjuvant details |
| `pest_notes` | Optional general agronomist notes for the pest |
| `updated_at` | When this entry was last edited |

## Caveats

- localStorage is **per-browser, per-device.** If the agronomist switches computers, their unfinished work doesn't follow.
- localStorage can be cleared by the browser or user — they should **export often** as a backup.
- Maximum localStorage is typically 5–10 MB. For 85 pests this is far below the limit.

## Diff from public app

What's added:
- `src/organicData.js` — localStorage helper
- `src/OrganicEditor.jsx` — the editor modal
- `src/EditorProgressBanner.jsx` — top-of-page status banner + Export button
- Header recoloured emerald → purple
- "Edit Organic Protocol" button on each pest card

What's unchanged: everything else. Same pests, same MOA, same Wikimedia photos.

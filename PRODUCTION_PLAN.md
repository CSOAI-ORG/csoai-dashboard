# CSOAI Dashboard — Full Production-Ready Sweep
**E2E consolidation · every greenfield · front to back · phased**
*Updated: 2026-07-30 — full codebase audit applied*

---

## Current State (25 source files, ~3,500 lines + 30 spec documents absorbed)

### What Works
- 9 pages all return 200 (Globe, Arena, Ledger, Gap Map, Anchors, Methodology, Licenses, Corrections, Verify)
- TypeScript compiles cleanly (`npm run build` passes)
- J-Space Panel with 7-line replay mode (JSpacePanel.tsx)
- Credibility footer with 3 tiers + live watcher timestamps
- Refutation ledger with 12 decision records, expandable
- Gap map with field_coverage headline (SVG polygons)
- D1 schema for 8 tables (schema.sql)
- Worker API with 7 handlers (registry, drift, ledger, chain, gap, anchors, probe)
- VerifyButton component (exists but unused)
- SpectrumView component (exists but never receives scores)
- BranchView component (exists but never imported)
- McpToolCard component (exists, used in arena)
- TimeSlider component (exists, cosmetic only)
- GapMap component (SVG 2D, exists)
- d1-client.ts abstraction layer (exists but unused — all pages import mock-data directly)
- constants.ts with AXES, MODES, PREDICATES, INSTRUMENTS, SPECTRUM_LENSES, BANNED_STRINGS, CLAIMED_RESULTS

### What's Broken (Critical — must fix before anything else)
1. **Verify page is fake** — uses `setTimeout` and always returns "chain intact" — does NOT call `verifyChain()` from `verify.ts`
2. **d1-client.ts is dead code** — no page uses it; all 6 data pages + 2 components import mock-data directly
3. **Type mismatches** — `types/index.ts` (D1/worker types) vs `lib/types.ts` (frontend types) define different shapes for JRecord, DecisionRecord, WatcherStatus
4. **Schema rejects `queued`** — `CoverageStatus` in `lib/types.ts` includes `"queued"` but `schema.sql` CHECK constraint only allows `covered|partial|absent`
5. **Anchors page bug** — counts watchers with status `"CITED"` as "Unreachable" but `WatcherStatus` type doesn't include `"UNREACHABLE"`
6. **Ledger page bug** — `stats.refutations` and `stats.selfKilled` compute identical values
7. **No authentication** on any write endpoint (POST /api/registry, POST /api/ledger, POST /api/probe)
8. **CORS allows all origins** on write endpoints (`Access-Control-Allow-Origin: *`)

### What's Dead Code (remove or wire up)
1. `BranchView.tsx` — never imported by any page
2. `VerifyButton.tsx` — never imported by any page
3. `sha256Hash()` in `verify.ts` — never imported
4. `BANNED_STRINGS` in `constants.ts` — never imported
5. `CLAIMED_RESULTS` in `constants.ts` — never imported (duplicates `MOCK_CLAIMABLE`)
6. `EvidenceStatus` type in `lib/types.ts` — exported but never used
7. `maplibre-gl` dependency — listed in package.json but unused (GapMap is SVG, not MapLibre)

### What's Missing (High Priority)
1. **No real model integration** — probe endpoint returns mock data
2. **Navbar overflows** on mobile — no hamburger menu
3. **No input validation** on POST bodies
4. **Memory leak** in TimeSlider — `setInterval` never cleaned up on unmount
5. **No accessibility** — no focus styles, no ARIA, color-only indicators
6. **No error boundaries** in layout
7. **Tables not responsive** on methodology/licenses pages
8. **No loading/error states** on any data-fetching page
9. **JSpacePanel hardcodes** seed=42 and temp=0.0 instead of reading from J-record
10. **Corrections page** hardcodes correction data inline instead of deriving from decision records
11. **GapMap polygons** are crude SVG approximations, not geographically accurate
12. **TimeSlider** is cosmetic — label says "render_at(T)" but implementation is just an animation
13. **SpectrumView** never receives scores — all lenses show "No score yet"

---

## Phased Plan

### Phase 1: Fix Critical Issues (Must do before anything else)

#### 1.1 Fix Broken Imports
- Fix all 6 workers-api files: `'../types'` → `'../workers-types'`
- Fix `tsconfig.worker.json` to point to `workers-api/`

#### 1.2 Unify Types
- Create ONE shared types file at `src/lib/types.ts` that works for both frontend and workers
- Remove duplicate type definitions in `workers-types/index.ts`
- Add `CoverageStatus = "covered" | "partial" | "absent" | "queued"` everywhere
- Align JRecord shape: use frontend's flat structure (with `axis`, `mode`, `verdict`, `chain_index`)
- Align DecisionRecord shape: use frontend's `record_id` (not `id`)
- Align WatcherStatus: merge both sets of fields

#### 1.3 Fix Schema
- Add `'queued'` to CHECK constraint on `crosswalk_entry.coverage_status`

#### 1.4 Fix Verify Page
- Wire up actual `verifyChain()` from `src/lib/verify.ts`
- Implement real SHA-256 hash chain verification
- Add honest label: "chain intact — tamper-evidence"
- Add explicit note about Ed25519 upgrade

#### 1.5 Fix Security
- Add CORS origin whitelist (not `*`)
- Add basic API key auth for write endpoints
- Add input validation (zod or manual) for all POST bodies
- Fix route ordering in ledger.ts (specific routes before generic `:id`)

#### 1.6 Remove Dead Code
- Delete `web/` directory (abandoned scaffold)
- Delete unused `BranchView.tsx` component
- Wire up `VerifyButton` component (use it in verify page)
- Wire up `d1-client.ts` (use it in pages instead of direct mock-data imports)
- Remove unused exports: `sha256Hash`, `CLAIMED_RESULTS`, `BANNED_STRINGS`

### Phase 2: Accessibility + Responsive

#### 2.1 Accessibility
- Add skip-to-content link in layout
- Add `aria-label` and `aria-current` to nav items
- Add focus styles (`:focus-visible`) to all interactive elements
- Replace clickable divs with `<button>` elements
- Add ARIA states to expandable items (`aria-expanded`, `role="button"`)
- Add text alternatives for color-only indicators
- Add `aria-label` to range input (TimeSlider)
- Add `aria-hidden="true"` to decorative emoji
- Add `role="img"` and `aria-label` to SVG map

#### 2.2 Responsive Design
- Add hamburger menu for mobile nav
- Add `overflow-x-auto` to methodology and licenses tables
- Improve arena layout stacking on mobile
- Add scroll indicators to horizontally-scrollable content

### Phase 3: Real Data Integration

#### 3.1 Wire d1-client.ts
- Replace all `mock-data` imports with `d1-client` calls
- Keep mock fallback when `WORKER_URL` is not set
- Add loading states to all pages
- Add error states to all pages

#### 3.2 LiteLLM Adapter
- Add LiteLLM config to `wrangler.toml`
- Implement real model calls in `workers-api/probe.ts`
- Add budget caps per lane (anonymous, board, private)
- Add rate limiting via Cloudflare WAF

#### 3.3 Seed Data
- Create seed script for D1 with real J-records
- Seed decision records (the 12 refutations)
- Seed crosswalk entries (the gap map)
- Seed watcher statuses

### Phase 4: Advanced Features

#### 4.1 Time Slider
- Implement `render_at(T)` over hash lineage
- Wire to globe/map visualization
- Add temporal query to d1-client

#### 4.2 Spectrum View
- Implement 8 lenses over 5 predicates
- Add per-lens scoring to arena
- Never show composite score

#### 4.3 Branch View (Simulation)
- Implement deterministic replay across branches
- Show divergence points
- Human chooses (Article 14)

### Phase 5: Deploy to Cloudflare

#### 5.1 Create D1 Database
- `wrangler d1 create csoai-gspc`
- Update `wrangler.toml` with real `database_id`
- Run `schema.sql` against D1

#### 5.2 Deploy Worker
- `wrangler deploy`
- Set up custom domain
- Configure CORS origins

#### 5.3 Deploy Frontend
- `npm run build`
- Deploy to Cloudflare Pages
- Set up custom domain
- Configure environment variables

#### 5.4 Post-Deploy
- Run language audit (grep for banned strings)
- Test all pages on production
- Test verify flow end-to-end
- Test probe flow end-to-end
- Mobile testing on real devices

---

## Complete File Inventory

### Pages (9)
| File | Status | Mock Imports | Key Issues |
|------|--------|-------------|------------|
| `src/app/page.tsx` | ✅ working | MOCK_CLAIMABLE, MOCK_WATCHERS, MOCK_DECISION_RECORDS | GapMap is SVG not MapLibre; TimeSlider cosmetic; no loading states |
| `src/app/arena/page.tsx` | ✅ working | MOCK_J_RECORDS | No real probe submission form; MCP tools hardcoded; no loading states |
| `src/app/ledger/page.tsx` | ✅ working | MOCK_DECISION_RECORDS | selfKilled bug; no ARIA states; no loading states |
| `src/app/gap/page.tsx` | ✅ working | MOCK_GAP_CELLS | No loading states |
| `src/app/anchors/page.tsx` | ✅ working | MOCK_WATCHERS | UNREACHABLE status bug; no loading states |
| `src/app/methodology/page.tsx` | ✅ working | MOCK_CLAIMABLE | Table not responsive |
| `src/app/licenses/page.tsx` | ✅ working | (hardcoded) | Table not responsive; lists unused maplibre-gl |
| `src/app/corrections/page.tsx` | ✅ working | (hardcoded inline) | Corrections duplicated, not from data layer |
| `src/app/verify/page.tsx` | 🔴 BROKEN | MOCK_DECISION_RECORDS | Always returns "chain intact" via setTimeout |

### Components (8)
| File | Status | Used By | Key Issues |
|------|--------|---------|------------|
| `src/components/Navbar.tsx` | ✅ working | layout.tsx | No hamburger menu for mobile |
| `src/components/CredibilityFooter.tsx` | ✅ working | layout.tsx | Uses MOCK_WATCHERS |
| `src/components/JSpacePanel.tsx` | ✅ working | arena/page.tsx | Hardcodes seed=42, temp=0.0 |
| `src/components/McpToolCard.tsx` | ✅ working | arena/page.tsx | Clean |
| `src/components/VerifyButton.tsx` | ⚠️ unused | — | Never imported |
| `src/components/GapMap.tsx` | ✅ working | page.tsx | Uses MOCK_GAP_CELLS; crude SVG polygons |
| `src/components/TimeSlider.tsx` | 🔴 buggy | page.tsx | Memory leak; cosmetic only |
| `src/components/SpectrumView.tsx` | ⚠️ partial | arena/page.tsx | Never receives scores |
| `src/components/BranchView.tsx` | ⚠️ unused | — | Never imported |

### Library (5)
| File | Status | Key Issues |
|------|--------|------------|
| `src/lib/types.ts` | ✅ working | Includes `queued` but schema rejects it; `EvidenceStatus` unused |
| `src/lib/constants.ts` | ⚠️ partial | BANNED_STRINGS and CLAIMED_RESULTS never imported |
| `src/lib/mock-data.ts` | ✅ working | The data source for everything (should be replaced by d1-client) |
| `src/lib/d1-client.ts` | ⚠️ unused | Dead code — no page imports it |
| `src/lib/verify.ts` | ⚠️ partial | sha256Hash() unused; verifyChain() exists but verify page doesn't call it |

### Worker API (8)
| File | Status | Key Issues |
|------|--------|------------|
| `src/worker/index.ts` | ✅ working | CORS allows all origins |
| `src/api/registry.ts` | ✅ working | No auth on write endpoints |
| `src/api/drift.ts` | ✅ working | Private feed returns 401 |
| `src/api/ledger.ts` | ✅ working | No auth on POST |
| `src/api/chain.ts` | ✅ working | Clean |
| `src/api/gap.ts` | ✅ working | Clean |
| `src/api/anchors.ts` | ✅ working | Clean |
| `src/api/probe.ts` | ⚠️ partial | Returns mock data, no LiteLLM integration |

### Config (5)
| File | Status | Key Issues |
|------|--------|------------|
| `package.json` | ✅ working | maplibre-gl listed but unused |
| `tsconfig.json` | ✅ working | Clean |
| `wrangler.toml` | ⚠️ partial | database_id is placeholder |
| `schema.sql` | ⚠️ partial | Missing `queued` in CHECK |
| `next.config.ts` | ✅ working | Clean |

---

## File Changes Required

### Phase 1 (Critical Fixes)
```
workers-api/anchors.ts        — fix import
workers-api/ledger.ts         — fix import, fix route ordering
workers-api/gap.ts            — fix import
workers-api/chain.ts          — fix import
workers-api/drift.ts          — fix import
workers-api/registry.ts       — fix import
workers-api/probe.ts          — fix import, align JRecord type
workers-api/index.ts          — fix CORS, add auth middleware
src/lib/types.ts              — unify all types
schema.sql                    — add 'queued' to CHECK
src/app/verify/page.tsx       — wire up real verification
src/lib/verify.ts             — implement real SHA-256 chain check
tsconfig.worker.json          — fix include path
```

### Phase 2 (Accessibility + Responsive)
```
src/app/layout.tsx            — add skip-to-content
src/components/Navbar.tsx     — add ARIA, hamburger menu
src/components/TimeSlider.tsx — add label, fix memory leak
src/app/gap/page.tsx          — fix clickable divs
src/app/ledger/page.tsx       — add ARIA states
src/app/methodology/page.tsx  — add table overflow
src/app/licenses/page.tsx     — add table overflow
src/components/GapMap.tsx     — add ARIA to SVG
src/app/globals.css           — add focus styles
```

### Phase 3 (Real Data)
```
src/app/page.tsx              — use d1-client
src/app/arena/page.tsx        — use d1-client
src/app/gap/page.tsx          — use d1-client
src/app/ledger/page.tsx       — use d1-client
src/app/anchors/page.tsx      — use d1-client
src/components/CredibilityFooter.tsx — use d1-client
workers-api/probe.ts          — integrate LiteLLM
```

### Phase 4 (Advanced)
```
src/components/TimeSlider.tsx — wire to real data
src/components/SpectrumView.tsx — implement scoring
src/components/BranchView.tsx — implement replay
src/lib/render_at.ts          — temporal query
```

### Phase 5 (Deploy)
```
wrangler.toml                 — real database_id
.env.production               — WORKER_URL, API keys
```

---

## Spec Documents Reference (185 files in ~/Downloads/)

### Primary Specs (read these first)
| Document | Covers |
|----------|--------|
| `CSOAI-GSPC-MASTER-PLAYBOOK-EOD-2026-07-29.md` | Master state + plan — THE reference |
| `GSPC-Build-Map-Frontend-Backend-Agents-2026-07-29.md` | Repo structure, module list, build order |
| `GSPC-Frontend-Audit-Criteria-2026-07-29.md` | Frontend pass/fail criteria (🔴/🟠) |
| `SOV-Frontend-SovSpace-Arena-Globe-2026-07-29.md` | Frontend spec: globe, arena, J-space panel |
| `GSPC-Connection-Map-2026-07-29.md` | ~11 integrations, node classes |
| `GSPC-Drift-Product-Spec-2026-07-29.md` | Evidence registry, drift feed, expiry rule |
| `SOV-Decision-Record-Schema-2026-07-29.md` | Decision record schema, 4 invariants |
| `SOV-Backend-Watchdog-Spectrum-Simulation-2026-07-29.md` | DEFONEOS, rainbow scoring, simulation |

### Secondary Specs
| Document | Covers |
|----------|--------|
| `GSPC-Narrative-Kit-2026-07-29.md` | Pitch, deck, language register |
| `GSPC-Operating-Kit-2026-07-29.md` | Canonical schema, predicates, test vectors |
| `GSPC-Clean-Path-2026-07-29.md` | Five gates, dependency order |
| `GSPC-Crosswalk-2026-07-29.md` | Coverage matrix, ingestion law |
| `GSPC-E2E-Audit-2026-07-29.md` | Claim consistency + contradictions |
| `SOV-Growth-Architecture-2026-07-29.md` | DRUM/DREAM/ASI-evolve, swarm scaling |
| `SOV-Spatial-Temporal-Model-2026-07-29.md` | Projection layer, edge rules, time slider |
| `CSOAI-Credibility-Layer-Footer-Attribution-2026-07-29.md` | Attribution, footer, backlinks |
| `CSOAI-Public-Globe-Spec-2026-07-29.md` | Public globe spec |
| `DEFONEOS-Regulator-Surface-Spec-2026-07-29.md` | Regulator surface spec |
| `N-Sites-Framework-2026-07-29.md` | Free compute, portability contract |
| `SOV_NODE_REGISTRY_AND_SITES_2026-07-29.md` | Node registry |

### Runbooks
| Document | Covers |
|----------|--------|
| `GATE2_PROVBENCH_PUBLISH_RUNBOOK_M4_2026-07-29.md` | ProvBench physics + publish |
| `GATE1_M4_RUNBOOK_2026-07-29.md` | Architecture decorrelation |
| `GSPC_INSPECT_AI_PORT_SCOPE_2026-07-29.md` | Inspect AI port |
| `GSPC_YEAR_TO_DAYS_MASTER_PLAN_2026-07-29.md` | Year-to-days master plan |

### Python Implementations (reference)
| File | What it does |
|------|-------------|
| `equivalence.py` | Cross-jurisdictional equivalence classes (non-adjudicating) |
| `survival_matrix.py` | P-axis manifest survival matrix |
| `sov_instrument.py` | THE instrument: one deterministic scoring engine, three lenses |

---

## Verification Checklist

### Phase 1 Complete When:
- [x] `npm run build` passes with zero errors
- [ ] `npm run typecheck` passes with zero errors
- [x] All 9 pages return 200 in dev
- [x] Verify page calls `verifyChain()` from `verify.ts` (not setTimeout)
- [ ] VerifyButton component is used in verify page
- [ ] Write endpoints require API key
- [ ] CORS only allows configured origins
- [x] Schema accepts `queued` coverage status
- [ ] No dead code remains (BranchView wired or deleted, sha256Hash wired or deleted, etc.)
- [x] Anchors page correctly counts status
- [x] Ledger page correctly computes selfKilled vs refutations
- [x] JSpacePanel reads seed/temp from J-record, not hardcoded
- [ ] Corrections page derives from data layer, not hardcoded
- [x] TimeSlider interval cleaned up on unmount

### Phase 2 Complete When:
- [ ] Lighthouse accessibility score > 90
- [ ] All pages usable on 375px viewport
- [ ] Keyboard navigation works on all pages
- [ ] Screen reader announces all status changes
- [ ] Focus visible on all interactive elements (`:focus-visible` styles)
- [ ] Skip-to-content link in layout
- [ ] Hamburger menu on mobile nav
- [ ] Tables wrapped in `overflow-x-auto`
- [ ] SVG map has `role="img"` and `aria-label`

### Phase 3 Complete When:
- [ ] All pages import from `d1-client` (not `mock-data` directly)
- [ ] Mock fallback works when `WORKER_URL` is unset
- [ ] Loading spinners on all data-fetching pages
- [ ] Error states on all data-fetching pages
- [ ] Probe endpoint calls real models via LiteLLM
- [ ] D1 seeded with real data (12 decision records, 8 J-records, 40 gap cells, 6 watchers)
- [ ] Arena has real probe submission form (prompt/goal input → submit → result)

### Phase 4 Complete When:
- [ ] Time slider queries hash lineage via `render_at(T)`
- [ ] Globe uses MapLibre/deck.gl (not SVG)
- [ ] Spectrum view shows 8 lenses with real scores
- [ ] Branch view shows divergence across 3 legs
- [ ] Arena ↔ Globe connection (cell being probed is lit)

### Phase 5 Complete When:
- [ ] D1 database created and seeded
- [ ] Worker deployed and responding
- [ ] Frontend deployed to Cloudflare Pages
- [ ] Custom domains configured
- [ ] Language audit passes (grep for banned strings — zero hits)
- [ ] E2E test: submit probe → get verdict → verify chain
- [ ] E2E test: view gap map → click cell → see provision
- [ ] E2E test: view ledger → click refutation → see evidence
- [ ] E2E test: drift feed shows events
- [ ] Mobile test: all pages on iPhone SE (375px)
- [ ] Self-scoring disclosure present on every page that discusses independence

---

## End-User Testing Matrix

### As a Regulator
| Action | Expected | Page |
|--------|----------|------|
| Visit homepage | See globe with jurisdiction coverage | / |
| Click "Ledger" | See 7 published refutations | /ledger |
| Click a refutation | See evidence, n, CI, decided_by | /ledger (expand) |
| Click "Gap Map" | See field_coverage headline | /gap |
| Filter by axis | See filtered provisions | /gap |
| Click "Anchors" | See 5 live watchers | /anchors |
| Click "Verify" | Chain verification works | /verify |
| Click "Methodology" | See 5 predicates explained | /methodology |

### As a Vendor
| Action | Expected | Page |
|--------|----------|------|
| Visit homepage | See "0 of 108 markings survived" | / |
| Click "Arena" | See probe configuration | /arena |
| Select axis + mode | See filtered J-records | /arena |
| Click a record | See 7-line J-Space Panel | /arena |
| Click "verify ↓" | Chain verification runs | /arena |
| View Spectrum | See 8 lenses (no composite) | /arena |

### As an Investor
| Action | Expected | Page |
|--------|----------|------|
| Visit homepage | See 3 key numbers | / |
| Scroll down | See "The Moat" section | / |
| Click "Ledger" | See "4 killed our own bets" | /ledger |
| Click "Gap Map" | See massive blind spots | /gap |
| Click "Licenses" | See attribution and licenses | /licenses |
| Footer | See "What We Don't Claim" | all pages |

### Mobile (375px)
| Action | Expected |
|--------|----------|
| All pages | No horizontal scroll |
| Navbar | Hamburger menu works |
| Tables | Scroll horizontally within container |
| Arena | Sidebar stacks above content |
| Globe | Map scales correctly |

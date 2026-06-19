import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { geoEqualEarth, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { Plus, Minus, RotateCcw, X, ExternalLink, Globe2, Layers, Search, ShieldCheck, Languages, Building2, Clock, Cpu } from 'lucide-react';
import { FRAMEWORKS } from '@/data/frameworks';
import {
  WORLD_ATLAS_URL, isoFromNumeric, coverageLevel,
  COUNTRY_FRAMEWORKS, COUNTRY_NAMES, CSOAI_TOOLS, GLOBAL_SLUGS, frameworkBySlug,
} from '@/data/regulationsGeo';
import { I18nProvider, useI18n, LANGUAGE_NAMES, LOCALES, type Locale } from '@/i18n';
import { ENTITIES, entitiesForCountry } from '@/data/intel/entities';
import { deadlinesForJurisdiction, nextDeadline } from '@/data/intel/deadlines';
import { signalsForEntity } from '@/data/intel/risk';
import { loadAdmin1, hasAdmin1, type Admin1Feature } from '@/data/intel/admin1';

// Wave C zoom thresholds — drive progressive "fly into the country" behaviour:
//  - ADMIN1_ZOOM: at/above this scale we lazily fetch + overlay sub-national borders
//  - LABEL_ZOOM:  at/above this scale company markers gain a name label (de-cluttered)
const ADMIN1_ZOOM = 3;
const LABEL_ZOOM = 4;
// The company/deadline/dashboard UI chrome below is localized via the i18n dict
// (keys in locales/en.ts). Framework *legal content* (names, descriptions, effective
// dates) is still left as-authored in source — that stays an accuracy-driven choice.

/**
 * OpenGridWorks — a MEOK-Dome-styled world map of AI regulation. Every country is
 * live: click anywhere to see the frameworks (EU AI Act / NIST / ISO 42001 / …) that
 * bind there, the global standards that apply everywhere, the CSOAI crosswalk for each,
 * and overlay CSOAI tools from the sidebar. Search flies to any nation; selections are
 * shareable via ?region=. Vector (no API key); a tile layer can swap in later.
 */

const W = 960, H = 500;
const HEAT = ['#1e293b', '#0e7490', '#0f766e', '#10b981']; // 0..3 coverage

type Picked = { num: number; iso?: string; name: string };

// Compact language switcher — names render in their own script. Persists on change
// (the provider writes to localStorage) and re-renders the whole page, flipping to
// RTL automatically for Arabic via the wrapper's dir attribute.
function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  return (
    <label className="flex items-center gap-2 text-xs text-slate-400">
      <Languages className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">{t('language')}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={t('language')}
        data-testid="language-switcher"
        className="bg-slate-800/60 border border-slate-700 rounded-md px-2 py-1 text-sm text-slate-200 outline-none focus:border-emerald-500/60 cursor-pointer"
      >
        {(Object.keys(LOCALES) as Locale[]).map((l) => (
          <option key={l} value={l}>{LANGUAGE_NAMES[l]}</option>
        ))}
      </select>
    </label>
  );
}

export default function OpenGridWorks() {
  return (
    <I18nProvider>
      <OpenGridWorksInner />
    </I18nProvider>
  );
}

function OpenGridWorksInner() {
  const { t, dir } = useI18n();
  const [geos, setGeos] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [selNum, setSelNum] = useState<number | null>(null);
  const [hovered, setHovered] = useState<Picked | null>(null);
  const [selEntity, setSelEntity] = useState<string | null>(null);
  const [hoverEnt, setHoverEnt] = useState<string | null>(null);
  const [activeFw, setActiveFw] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const [admin1, setAdmin1] = useState<Admin1Feature[]>([]); // Wave C: sub-national borders, lazy
  const drag = useRef<{ x: number; y: number; ox: number; oy: number; moved: boolean } | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(WORLD_ATLAS_URL)
      .then((r) => { if (!r.ok) throw new Error('atlas ' + r.status); return r.json(); })
      .then((topo: any) => {
        if (!alive) return;
        const fc: any = feature(topo, topo.objects.countries);
        setGeos(fc.features);
      })
      .catch((e) => alive && setErr(String(e)));
    return () => { alive = false; };
  }, []);

  const { path, proj } = useMemo(() => {
    if (!geos.length) return { path: null as any, proj: null as any };
    const p = geoEqualEarth().fitSize([W, H], { type: 'FeatureCollection', features: geos } as any);
    return { path: geoPath(p), proj: p };
  }, [geos]);

  // name for any feature: atlas-provided name is authoritative for the whole planet
  const nameOf = (g: any): string => g?.properties?.name || COUNTRY_NAMES[isoFromNumeric(g?.id) || ''] || String(g?.id ?? '');
  const pick = (g: any): Picked => ({ num: parseInt(String(g.id), 10), iso: isoFromNumeric(g.id), name: nameOf(g) });

  // sorted country list for the search box (every nation in the atlas)
  const countryList = useMemo(
    () => geos.map(pick).filter((c) => c.name && !Number.isNaN(c.num)).sort((a, b) => a.name.localeCompare(b.name)),
    [geos],
  );

  const geoByNum = (n: number | null) => (n == null ? undefined : geos.find((g) => parseInt(String(g.id), 10) === n));
  const selGeo = geoByNum(selNum);
  const selPick = selGeo ? pick(selGeo) : null;

  // center + zoom the map on a feature (used by search "fly to")
  const flyTo = useCallback((g: any, k = 3.2) => {
    if (!proj || !path) return;
    const c = path.centroid(g);
    if (!c || Number.isNaN(c[0])) return;
    setView({ k, x: W / 2 - c[0] * k, y: H / 2 - c[1] * k });
  }, [proj, path]);

  // deep-link: open ?region=<ISO3|numeric> once geos load
  useEffect(() => {
    if (!geos.length) return;
    const r = new URLSearchParams(window.location.search).get('region');
    if (!r) return;
    const g = geos.find((x) => {
      const n = parseInt(String(x.id), 10);
      return String(n) === r || isoFromNumeric(n) === r.toUpperCase();
    });
    if (g) { setSelNum(parseInt(String(g.id), 10)); flyTo(g); }
  }, [geos, flyTo]);

  // keep URL shareable + Esc to close
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selPick) url.searchParams.set('region', selPick.iso || String(selPick.num));
    else url.searchParams.delete('region');
    window.history.replaceState(null, '', url.toString());
  }, [selNum]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelNum(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Wave C: lazily fetch admin-1 boundaries the first time the user deep-zooms into a
  // country we have sub-national geometry for. loadAdmin1() is memoised + self-healing on
  // failure, so this fires at most once and degrades silently if the CDN is unreachable.
  const deepInto = view.k >= ADMIN1_ZOOM && hasAdmin1(selPick?.iso);
  useEffect(() => {
    if (!deepInto || admin1.length) return;
    let alive = true;
    loadAdmin1().then((feats) => { if (alive) setAdmin1(feats); });
    return () => { alive = false; };
  }, [deepInto, admin1.length]);

  // Only draw the focused country's provinces (≤ ~85 paths) rather than all 294.
  const selAdmin1 = useMemo(
    () => (deepInto && selPick?.iso ? admin1.filter((f) => f.properties?.adm0_a3 === selPick.iso) : []),
    [deepInto, admin1, selPick?.iso],
  );

  const clampZoom = (k: number) => Math.max(1, Math.min(8, k));
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const svg = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - svg.left) / svg.width) * W;
    const py = ((e.clientY - svg.top) / svg.height) * H;
    setView((v) => {
      const k = clampZoom(v.k * (e.deltaY < 0 ? 1.2 : 1 / 1.2));
      const r = k / v.k;
      return { k, x: px - (px - v.x) * r, y: py - (py - v.y) * r };
    });
  }, []);
  const onDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: view.x, oy: view.y, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const sc = (e.currentTarget as Element).getBoundingClientRect();
    const dx = ((e.clientX - drag.current.x) / sc.width) * W;
    const dy = ((e.clientY - drag.current.y) / sc.height) * H;
    if (Math.abs(e.clientX - drag.current.x) + Math.abs(e.clientY - drag.current.y) > 3) drag.current.moved = true;
    setView((v) => ({ ...v, x: drag.current!.ox + dx, y: drag.current!.oy + dy }));
  };
  const onUp = () => { drag.current = null; };
  const reset = () => { setView({ k: 1, x: 0, y: 0 }); };

  const coveredCount = Object.values(COUNTRY_FRAMEWORKS).filter((f) => f.length).length;

  // panel data: national/bloc frameworks vs the global standards that apply everywhere
  const selNational = (selPick?.iso ? (COUNTRY_FRAMEWORKS[selPick.iso] || []) : []).map(frameworkBySlug).filter(Boolean) as any[];
  const selGlobal = GLOBAL_SLUGS.map(frameworkBySlug).filter(Boolean) as any[];

  // intelligence layer: live deadline clocks, the companies in this country, and the
  // single headline binding deadline anywhere (the "our AI already knows" banner).
  const headlineDeadline = useMemo(() => nextDeadline(), []);
  const selDeadlines = useMemo(
    () => (selPick?.iso ? deadlinesForJurisdiction(selPick.iso).filter((d) => (d.daysOut ?? -1) >= 0).slice(0, 6) : []),
    [selPick?.iso],
  );
  const selCompanies = useMemo(() => (selPick?.iso ? entitiesForCountry(selPick.iso) : []), [selPick?.iso]);
  const selectEntity = (e: typeof ENTITIES[number]) => {
    const g = geos.find((x) => isoFromNumeric(x.id) === e.jurisdiction);
    if (g) { setSelNum(parseInt(String(g.id), 10)); flyTo(g, 4); }
    setSelEntity(e.slug);
  };

  const isDimmed = (iso?: string) => {
    if (!activeFw.size) return false;
    if (!iso) return true;
    const fws = (COUNTRY_FRAMEWORKS[iso] || []);
    return ![...activeFw].some((s) => fws.includes(s));
  };
  const toggleFw = (slug: string) =>
    setActiveFw((s) => { const n = new Set(s); n.has(slug) ? n.delete(slug) : n.add(slug); return n; });

  const bindingFw = FRAMEWORKS.filter((f) => f.binding).slice(0, 12);

  // search: jump to the first country whose name matches
  const runSearch = (q: string) => {
    const t = q.trim().toLowerCase();
    if (!t) return;
    const hit = countryList.find((c) => c.name.toLowerCase() === t) || countryList.find((c) => c.name.toLowerCase().startsWith(t)) || countryList.find((c) => c.name.toLowerCase().includes(t));
    if (hit) { const g = geoByNum(hit.num); setSelNum(hit.num); g && flyTo(g); }
  };

  return (
    <div dir={dir} className="min-h-screen bg-[#070b14] text-slate-100">
      <Helmet>
        <title>OpenGridWorks — Global AI Regulation Map | CSOAI</title>
        <meta name="description" content="Zoom anywhere on the world and see which AI regulations apply — EU AI Act, NIST, ISO 42001, Korea AI Act and more — with CSOAI crosswalks and tools overlaid. Every country live. Compliance, made navigable." />
        <link rel="canonical" href="https://csoai.org/opengridworks" />
        <meta property="og:title" content="OpenGridWorks — Global AI Regulation Map" />
        <meta property="og:image" content="https://csoai.org/og-image.png" />
      </Helmet>

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-1">
          <Globe2 className="w-7 h-7 text-emerald-400" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Open<span className="text-emerald-400">Grid</span>Works</h1>
          <div className="ms-auto"><LanguageSwitcher /></div>
        </div>
        <p className="text-slate-400 mb-3 max-w-2xl">{t('subtitle')}</p>
        {headlineDeadline && (
          <div className="mb-6 inline-flex items-center gap-2 text-xs rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-200" data-testid="headline-deadline">
            <Clock className="w-4 h-4 shrink-0" />
            <span>{t('headlineDeadlinePrefix')}: <b>{headlineDeadline.label}</b> — {headlineDeadline.date} ({t('daysOut', { days: headlineDeadline.daysOut ?? 0 })})</span>
          </div>
        )}

        <div className="grid lg:grid-cols-[260px_1fr] gap-4">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 h-fit">
            {/* Search */}
            <form onSubmit={(e) => { e.preventDefault(); runSearch(query); }} className="mb-4">
              <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/40 px-2.5 py-1.5 focus-within:border-emerald-500/60">
                <Search className="w-4 h-4 text-slate-500 shrink-0" />
                <input list="ogw-countries" value={query} onChange={(e) => { setQuery(e.target.value); }}
                  placeholder={t('searchPlaceholder')} aria-label={t('searchAria')} data-testid="country-search"
                  className="bg-transparent outline-none text-sm w-full placeholder:text-slate-600" />
              </div>
              <datalist id="ogw-countries">
                {countryList.map((c) => <option key={c.num} value={c.name} />)}
              </datalist>
            </form>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3"><Layers className="w-4 h-4" /> {t('frameworkOverlay')}</div>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {bindingFw.map((f) => (
                <button key={f.slug} onClick={() => toggleFw(f.slug)} data-testid={`fw-${f.slug}`}
                  className={`text-[11px] px-2 py-1 rounded-md border transition ${activeFw.has(f.slug) ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                  {f.name}
                </button>
              ))}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">{t('csoaiTools')}</div>
            <div className="space-y-2">
              {CSOAI_TOOLS.map((t) => (
                <a key={t.id} href={selPick ? `${t.href}?region=${selPick.iso || selPick.num}` : t.href} data-testid={`tool-${t.id}`}
                  className="block rounded-lg border border-slate-700 bg-slate-800/40 hover:border-emerald-500/60 p-2.5 transition group">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                    <span className="text-sm font-semibold">{t.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{t.blurb}</p>
                </a>
              ))}
            </div>
          </aside>

          {/* Map */}
          <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-b from-[#0a1120] to-[#0c1322] overflow-hidden">
            <div className="absolute top-3 left-3 z-10 text-xs text-slate-400 bg-black/40 rounded-lg px-3 py-1.5 border border-slate-800">
              {t('statusBar', { jurisdictions: coveredCount, frameworks: FRAMEWORKS.length, countries: countryList.length || t('statusLoading') })}
            </div>
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
              <button onClick={() => setView((v) => ({ ...v, k: clampZoom(v.k * 1.3) }))} aria-label={t('zoomIn')} className="w-8 h-8 grid place-items-center rounded-lg bg-slate-800/80 border border-slate-700 hover:border-emerald-500"><Plus className="w-4 h-4" /></button>
              <button onClick={() => setView((v) => ({ ...v, k: clampZoom(v.k / 1.3) }))} aria-label={t('zoomOut')} className="w-8 h-8 grid place-items-center rounded-lg bg-slate-800/80 border border-slate-700 hover:border-emerald-500"><Minus className="w-4 h-4" /></button>
              <button onClick={reset} aria-label={t('resetView')} className="w-8 h-8 grid place-items-center rounded-lg bg-slate-800/80 border border-slate-700 hover:border-emerald-500"><RotateCcw className="w-4 h-4" /></button>
            </div>

            {err && <div className="p-8 text-center text-rose-400 text-sm">{t('atlasError', { error: err })}</div>}
            {!err && !path && <div className="p-8 text-center text-slate-500 text-sm animate-pulse">{t('atlasLoading')}</div>}

            {path && (
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto touch-none select-none" style={{ cursor: drag.current ? 'grabbing' : 'grab' }}
                onWheel={onWheel} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={() => { onUp(); setHovered(null); }}>
                <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
                  {geos.map((g, i) => {
                    const iso = isoFromNumeric(g.id);
                    const lvl = iso ? coverageLevel(iso) : 0;
                    const dim = isDimmed(iso);
                    const num = parseInt(String(g.id), 10);
                    const isSel = num === selNum;
                    return (
                      <path key={i} d={path(g) || undefined}
                        fill={isSel ? '#34d399' : HEAT[lvl]}
                        stroke={isSel ? '#a7f3d0' : '#0b1220'} strokeWidth={isSel ? 1.4 / view.k : 0.4 / view.k}
                        opacity={dim ? 0.25 : 1}
                        style={{ transition: 'opacity .2s, fill .2s', cursor: 'pointer' }}
                        onMouseEnter={() => setHovered(pick(g))}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => { if (!drag.current?.moved) setSelNum(num); }} />
                    );
                  })}
                  {/* Wave C: admin-1 drill-down — thin, low-opacity sub-national borders for
                      the focused country only (no recolor; the country heat shows through).
                      Renders only when deep-zoomed + data loaded; empty otherwise (graceful). */}
                  {path && selAdmin1.map((f, i) => (
                    <path key={`a1-${i}`} d={path(f as any) || undefined}
                      fill="none" stroke="#7dd3fc" strokeWidth={0.5 / view.k} opacity={0.35}
                      pointerEvents="none" style={{ transition: 'opacity .2s' }} />
                  ))}

                  {/* Entity layer — real AI/robotics companies as markers (Wave B).
                      Wave C: markers grow slightly with zoom; a name label appears once
                      zoomed in enough (LABEL_ZOOM) that labels won't badly overlap. */}
                  {proj && ENTITIES.map((e) => {
                    if (!e.geo) return null;
                    const p = proj([e.geo.lon, e.geo.lat]);
                    if (!p) return null;
                    const active = hoverEnt === e.slug || selEntity === e.slug;
                    // grow markers as we zoom in (clamped), and screen-stable via /view.k
                    const grow = Math.min(view.k, 4);
                    const r = (active ? 3 + grow : 1.6 + grow * 0.7) / view.k;
                    // label once deep enough, OR always for the active marker
                    const showLabel = active || view.k >= LABEL_ZOOM;
                    return (
                      <g key={e.slug}>
                        <circle cx={p[0]} cy={p[1]} r={r}
                          fill={active ? '#fbbf24' : '#f59e0b'} stroke="#0b1220" strokeWidth={0.5 / view.k} opacity={0.92}
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoverEnt(e.slug)} onMouseLeave={() => setHoverEnt(null)}
                          onClick={(ev) => { ev.stopPropagation(); if (!drag.current?.moved) selectEntity(e); }} />
                        {showLabel && (
                          <text x={p[0] + r + 1.5 / view.k} y={p[1] + 3 / view.k}
                            fontSize={9 / view.k} fontWeight={600}
                            fill={active ? '#fde68a' : '#fcd34d'} pointerEvents="none"
                            style={{ paintOrder: 'stroke', stroke: '#0b1220', strokeWidth: 2 / view.k }}>
                            {e.name}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
                {hovered && (
                  <text x={12} y={H - 14} className="fill-slate-200" fontSize={13} fontWeight={600}>
                    {t('hoverNational', { name: hovered.name, count: (hovered.iso && COUNTRY_FRAMEWORKS[hovered.iso]?.length) || 0 })}
                    {hovered.iso ? '' : t('hoverGlobalSuffix')}
                  </text>
                )}
                {hoverEnt && (() => {
                  const e = ENTITIES.find((x) => x.slug === hoverEnt);
                  return e ? (
                    <text x={12} y={H - 32} className="fill-amber-300" fontSize={12} fontWeight={600}>
                      {e.name}{e.sector ? ` · ${e.sector}` : ''} · {t('entityHoverSystems', { count: e.systems?.length || 0 })} · {t('inScopeCount', { count: e.inScope?.length || 0 })}
                    </text>
                  ) : null;
                })()}
              </svg>
            )}

            {/* legend */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 text-[11px] text-slate-400 bg-black/40 rounded-lg px-3 py-1.5 border border-slate-800">
              <span>{t('legendDensity')}</span>
              {(['densityNone', 'densityLight', 'densityModerate', 'densityDense'] as const).map((key, i) => (
                <span key={key} className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: HEAT[i] }} />{t(key)}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Region detail panel */}
      {selPick && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-emerald-500/30 shadow-2xl overflow-y-auto">
          <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500">{t('region')}</div>
              <h2 className="text-xl font-bold">{selPick.name}</h2>
            </div>
            <button onClick={() => setSelNum(null)} aria-label={t('closePanel')} className="text-slate-500 hover:text-slate-200"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-5">
            {/* National / bloc */}
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">{t('nationalLaw', { count: selNational.length })}</div>
            {selNational.length > 0 ? (
              <div className="space-y-2.5">
                {selNational.map((f) => (
                  <div key={f.slug} className="rounded-xl border border-slate-800 bg-slate-800/30 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-sm">{f.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${f.binding ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700/50 text-slate-400'}`}>{f.binding ? t('binding') : t('voluntary')}</span>
                    </div>
                    {/* f.effective date + f.description are framework content — left as-authored (legal accuracy). Only the "Effective:" label is localized. */}
                    {f.effective && <div className="text-[11px] text-amber-300/80 mt-1">{t('effective', { date: f.effective })}</div>}
                    <p className="text-[11px] text-slate-400 mt-1">{f.description}</p>
                    <a href="/crosswalks" className="text-[11px] text-emerald-400 hover:underline inline-flex items-center gap-1 mt-1.5">{t('csoaiCrosswalk')} <ExternalLink className="w-3 h-3" /></a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-800/20 p-3 text-[12px] text-slate-400 flex gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                {/* honest empty-state: split the localized template around {flagLink} to inject the anchor */}
                {(() => {
                  const [before, after] = t('emptyState').split('{flagLink}');
                  return (
                    <span>
                      {before}
                      <a href="/watchdog" className="text-emerald-400 hover:underline">{t('emptyStateFlagLink')}</a>
                      {after}
                    </span>
                  );
                })()}
              </div>
            )}

            {/* Global standards that apply everywhere */}
            <details className="mt-5" open={selNational.length === 0}>
              <summary className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 cursor-pointer select-none">{t('globalStandards', { count: selGlobal.length })}</summary>
              <div className="space-y-2 mt-2">
                {selGlobal.map((f) => (
                  <div key={f.slug} className="rounded-lg border border-slate-800 bg-slate-800/20 p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-[13px]">{f.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0 bg-slate-700/50 text-slate-400">{f.region}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{f.description}</p>
                  </div>
                ))}
              </div>
            </details>

            {/* Live compliance deadlines for this jurisdiction (Wave: deadline radar) */}
            {selDeadlines.length > 0 && (
              <div className="mt-5">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> {t('complianceDeadlines', { count: selDeadlines.length })}</div>
                <div className="space-y-1.5">
                  {selDeadlines.map((d, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-800/20 px-3 py-2">
                      <span className="text-[12px] text-slate-300">{d.label}</span>
                      <span className={`text-[11px] tabular-nums shrink-0 ${d.binding ? 'text-amber-300' : 'text-slate-500'}`}>{d.date} · {d.daysOut}d</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI & robotics companies operating here (Wave: entity registry + risk) */}
            {selCompanies.length > 0 && (
              <div className="mt-5">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2"><Building2 className="w-4 h-4" /> {t('companiesHere', { count: selCompanies.length })}</div>
                <div className="space-y-2">
                  {selCompanies.map((e) => {
                    const open = selEntity === e.slug;
                    const sigs = open ? signalsForEntity(e) : [];
                    return (
                      <div key={e.slug} className="rounded-xl border border-slate-800 bg-slate-800/30">
                        <button onClick={() => setSelEntity(open ? null : e.slug)} className="w-full text-start p-3" data-testid={`entity-${e.slug}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-sm">{e.name}</span>
                            <span className="text-[10px] text-slate-500 shrink-0">{t('inScopeCount', { count: e.inScope?.length || 0 })}</span>
                          </div>
                          {e.sector && <div className="text-[11px] text-slate-500 mt-0.5">{e.sector}</div>}
                          {e.systems && e.systems.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {e.systems.slice(0, 4).map((s, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/40 text-slate-300 inline-flex items-center gap-1"><Cpu className="w-3 h-3" />{s.name}{s.riskTier ? ` · ${s.riskTier}` : ''}</span>
                              ))}
                            </div>
                          )}
                        </button>
                        {open && sigs.length > 0 && (
                          <div className="border-t border-slate-800 p-3 space-y-1.5">
                            <div className="text-[10px] uppercase tracking-wide text-slate-500">{t('helpFirstSignals')}</div>
                            {sigs.slice(0, 5).map((s, i) => (
                              <div key={i} className="text-[11px] text-slate-400 flex gap-1.5">
                                <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${s.band === 'in-scope' ? 'bg-amber-400' : s.band === 'attested' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                <span>{s.rationale}</span>
                              </div>
                            ))}
                            <a href="/compliance" className="text-[11px] text-emerald-400 hover:underline inline-block mt-1">{t('helpComply')}</a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2">
              {CSOAI_TOOLS.map((t) => (
                <a key={t.id} href={`${t.href}?region=${selPick.iso || selPick.num}`} className="rounded-lg border border-slate-700 bg-slate-800/40 hover:border-emerald-500/60 px-3 py-2 text-xs font-semibold transition">{t.label} →</a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { geoEqualEarth, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { Plus, Minus, RotateCcw, X, ExternalLink, Globe2, Layers } from 'lucide-react';
import { FRAMEWORKS } from '@/data/frameworks';
import {
  WORLD_ATLAS_URL, isoFromNumeric, frameworksForCountry, coverageLevel,
  COUNTRY_FRAMEWORKS, COUNTRY_NAMES, CSOAI_TOOLS,
} from '@/data/regulationsGeo';

/**
 * OpenGridWorks — a MEOK-Dome-styled world map of AI regulation. Zoom anywhere,
 * see which frameworks (EU AI Act / NIST / ISO 42001 / …) apply to a region, the
 * CSOAI crosswalk for each, and overlay CSOAI tools from the sidebar. Compliance,
 * made navigable. Vector (no API key); a Google-Maps tile layer can swap in later
 * with a Maps key for street/county zoom.
 */

const W = 960, H = 500;
const HEAT = ['#1e293b', '#0e7490', '#0f766e', '#10b981']; // 0..3 coverage

export default function OpenGridWorks() {
  const [geos, setGeos] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeFw, setActiveFw] = useState<Set<string>>(new Set());
  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

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

  const path = useMemo(() => {
    if (!geos.length) return null;
    const proj = geoEqualEarth().fitSize([W, H], { type: 'FeatureCollection', features: geos } as any);
    return geoPath(proj);
  }, [geos]);

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
    drag.current = { x: e.clientX, y: e.clientY, ox: view.x, oy: view.y };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const sc = (e.currentTarget as Element).getBoundingClientRect();
    const dx = ((e.clientX - drag.current.x) / sc.width) * W;
    const dy = ((e.clientY - drag.current.y) / sc.height) * H;
    setView((v) => ({ ...v, x: drag.current!.ox + dx, y: drag.current!.oy + dy }));
  };
  const onUp = () => { drag.current = null; };
  const reset = () => setView({ k: 1, x: 0, y: 0 });

  const coveredCount = Object.values(COUNTRY_FRAMEWORKS).filter((f) => f.length).length;
  const selFw = selected ? frameworksForCountry(selected) : [];
  const selName = selected ? (COUNTRY_NAMES[selected] || selected) : '';

  // a country is dimmed if a framework filter is active and it doesn't carry one of them
  const isDimmed = (iso?: string) => {
    if (!activeFw.size) return false;
    if (!iso) return true;
    const fws = (COUNTRY_FRAMEWORKS[iso] || []);
    return ![...activeFw].some((s) => fws.includes(s));
  };

  const toggleFw = (slug: string) =>
    setActiveFw((s) => { const n = new Set(s); n.has(slug) ? n.delete(slug) : n.add(slug); return n; });

  const bindingFw = FRAMEWORKS.filter((f) => f.binding).slice(0, 12);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      <Helmet>
        <title>OpenGridWorks — Global AI Regulation Map | CSOAI</title>
        <meta name="description" content="Zoom anywhere on the world and see which AI regulations apply — EU AI Act, NIST, ISO 42001, Korea AI Act and more — with CSOAI crosswalks and tools overlaid. Compliance, made navigable." />
        <link rel="canonical" href="https://csoai.org/opengridworks" />
        <meta property="og:title" content="OpenGridWorks — Global AI Regulation Map" />
        <meta property="og:image" content="https://csoai.org/og-image.png" />
      </Helmet>

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-1">
          <Globe2 className="w-7 h-7 text-emerald-400" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Open<span className="text-emerald-400">Grid</span>Works</h1>
        </div>
        <p className="text-slate-400 mb-6 max-w-2xl">The world's AI regulations, mapped. Zoom into a region to see its frameworks and CSOAI crosswalks, then overlay your tools from the sidebar — one profile, the whole planet.</p>

        <div className="grid lg:grid-cols-[260px_1fr] gap-4">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 h-fit">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3"><Layers className="w-4 h-4" /> Framework overlay</div>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {bindingFw.map((f) => (
                <button key={f.slug} onClick={() => toggleFw(f.slug)} data-testid={`fw-${f.slug}`}
                  className={`text-[11px] px-2 py-1 rounded-md border transition ${activeFw.has(f.slug) ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                  {f.name}
                </button>
              ))}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">CSOAI tools</div>
            <div className="space-y-2">
              {CSOAI_TOOLS.map((t) => (
                <a key={t.id} href={selected ? `${t.href}?region=${selected}` : t.href} data-testid={`tool-${t.id}`}
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
              {coveredCount} jurisdictions mapped · {FRAMEWORKS.length} frameworks · drag to pan, scroll to zoom
            </div>
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
              <button onClick={() => setView((v) => ({ ...v, k: clampZoom(v.k * 1.3) }))} aria-label="Zoom in" className="w-8 h-8 grid place-items-center rounded-lg bg-slate-800/80 border border-slate-700 hover:border-emerald-500"><Plus className="w-4 h-4" /></button>
              <button onClick={() => setView((v) => ({ ...v, k: clampZoom(v.k / 1.3) }))} aria-label="Zoom out" className="w-8 h-8 grid place-items-center rounded-lg bg-slate-800/80 border border-slate-700 hover:border-emerald-500"><Minus className="w-4 h-4" /></button>
              <button onClick={reset} aria-label="Reset view" className="w-8 h-8 grid place-items-center rounded-lg bg-slate-800/80 border border-slate-700 hover:border-emerald-500"><RotateCcw className="w-4 h-4" /></button>
            </div>

            {err && <div className="p-8 text-center text-rose-400 text-sm">Couldn't load the map atlas ({err}). Check the connection and reload.</div>}
            {!err && !path && <div className="p-8 text-center text-slate-500 text-sm animate-pulse">Loading world atlas…</div>}

            {path && (
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto touch-none select-none" style={{ cursor: drag.current ? 'grabbing' : 'grab' }}
                onWheel={onWheel} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
                <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
                  {geos.map((g, i) => {
                    const iso = isoFromNumeric(g.id);
                    const lvl = iso ? coverageLevel(iso) : 0;
                    const dim = isDimmed(iso);
                    const isSel = iso && iso === selected;
                    return (
                      <path key={i} d={path(g) || undefined}
                        fill={iso ? HEAT[lvl] : '#141c2e'}
                        stroke={isSel ? '#34d399' : '#0b1220'} strokeWidth={isSel ? 1.4 / view.k : 0.4 / view.k}
                        opacity={dim ? 0.25 : 1}
                        style={{ transition: 'opacity .2s, fill .2s', cursor: iso ? 'pointer' : 'grab' }}
                        onMouseEnter={() => setHovered(iso || null)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => iso && setSelected(iso)} />
                    );
                  })}
                </g>
                {hovered && (
                  <text x={12} y={H - 14} className="fill-slate-300" fontSize={13} fontWeight={600}>
                    {COUNTRY_NAMES[hovered] || hovered} · {(COUNTRY_FRAMEWORKS[hovered] || []).length} regional framework(s)
                  </text>
                )}
              </svg>
            )}

            {/* legend */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 text-[11px] text-slate-400 bg-black/40 rounded-lg px-3 py-1.5 border border-slate-800">
              <span>Regulation density:</span>
              {['none', 'light', 'moderate', 'dense'].map((lab, i) => (
                <span key={lab} className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: HEAT[i] }} />{lab}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Region detail panel */}
      {selected && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-emerald-500/30 shadow-2xl overflow-y-auto">
          <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500">Region</div>
              <h2 className="text-xl font-bold">{selName}</h2>
            </div>
            <button onClick={() => setSelected(null)} aria-label="Close region panel" className="text-slate-500 hover:text-slate-200"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">Applicable AI frameworks ({selFw.length})</div>
            <div className="space-y-2.5">
              {selFw.map((f) => (
                <div key={f.slug} className="rounded-xl border border-slate-800 bg-slate-800/30 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm">{f.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${f.binding ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700/50 text-slate-400'}`}>{f.binding ? 'binding' : 'voluntary'}</span>
                  </div>
                  {f.effective && <div className="text-[11px] text-amber-300/80 mt-1">Effective: {f.effective}</div>}
                  <p className="text-[11px] text-slate-400 mt-1">{f.description}</p>
                  <a href="/crosswalks" className="text-[11px] text-emerald-400 hover:underline inline-flex items-center gap-1 mt-1.5">CSOAI crosswalk <ExternalLink className="w-3 h-3" /></a>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {CSOAI_TOOLS.map((t) => (
                <a key={t.id} href={`${t.href}?region=${selected}`} className="rounded-lg border border-slate-700 bg-slate-800/40 hover:border-emerald-500/60 px-3 py-2 text-xs font-semibold transition">{t.label} →</a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

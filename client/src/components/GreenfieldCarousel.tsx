import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import {
  ShieldCheck, BarChart3, XCircle, FileCheck2, Radar, Scale,
  GitBranch, Globe2, Lock, ArrowRight, Pause, Play,
} from "lucide-react";

/**
 * GreenfieldCarousel — replaces the dead 00:00:00:00 countdown after 2 Aug 2026.
 *
 * RULE FOR THIS FILE: every number on a slide must trace to a published artefact in the
 * govbench dataset on HuggingFace. If a slide needs a number we do not have, the slide gets
 * a qualitative claim instead — it does not get an invented one. Two slides deliberately
 * lead with a NEGATIVE result, because those are the ones a competitor will not publish and
 * are therefore the most credible thing on the page.
 */

type Slide = {
  eyebrow: string;
  title: string;
  body: string;
  stat?: { value: string; label: string; sub?: string };
  icon: typeof ShieldCheck;
  href?: string;
  cta?: string;
  tone: "emerald" | "slate" | "amber" | "rose";
};

const SLIDES: Slide[] = [
  {
    eyebrow: "In force",
    title: "EU AI Act Article 50 applies now",
    body:
      "Transparency obligations applied from 2 August 2026. A limited grace period runs to " +
      "2 December 2026 — for the marking obligation only, and only for systems placed on the " +
      "market before 2 August. Anything launched since marks from day one.",
    stat: { value: "€15M", label: "or 3% of worldwide turnover", sub: "Article 99 penalties" },
    icon: Scale,
    href: "/article-50-explained",
    cta: "What Article 50 requires",
    tone: "rose",
  },
  // ── the three greenfields ────────────────────────────────────────────────
  {
    eyebrow: "Greenfield 01 · Governance",
    title: "Regulators cannot verify compliance from public benchmarks",
    body:
      "Bench-2-CoP mapped 194,955 benchmark questions and found capabilities central to " +
      "loss-of-control scenarios receive zero coverage across the entire corpus. The " +
      "measurement layer the AI Act assumes does not exist yet.",
    stat: { value: "0%", label: "coverage of loss-of-control capabilities", sub: "across 194,955 mapped questions" },
    icon: Radar,
    href: "/govbench",
    cta: "See GovBench",
    tone: "emerald",
  },
  {
    eyebrow: "Greenfield 02 · Provenance",
    title: "Machine-readable marking, built and emitting",
    body:
      "C2PA manifests with digitalSourceType trainedAlgorithmicMedia, signed Ed25519, binding " +
      "each answer to the model, base weights and selection rule that produced it. Reads back " +
      "validation_state Valid.",
    stat: { value: "Ed25519", label: "signed C2PA manifests", sub: "awaiting a trust-list certificate" },
    icon: FileCheck2,
    href: "/trust",
    tone: "emerald",
  },
  {
    eyebrow: "Greenfield 03 · Conformity",
    title: "Annex VI or Annex VII, decided from the statute",
    body:
      "Most high-risk systems self-assess under Annex VI. Biometrics always route to a notified " +
      "body under Annex VII. The route is a deterministic reading of Article 43 — not a judgement " +
      "call, and not something a consultant should charge to look up.",
    stat: { value: "417", label: "statute rows indexed", sub: "6 instruments, incl. all 13 AI Act annexes" },
    icon: GitBranch,
    href: "/eu-ai-act-classifier",
    cta: "Check your route",
    tone: "emerald",
  },
  // ── what is measured ─────────────────────────────────────────────────────
  {
    eyebrow: "Measured",
    title: "The composed pipeline beats a raw model call",
    body:
      "n=195, paired, judged by an analysis written before the run existed. Wins 64, losses 20, " +
      "ties 102. Removing the single largest item moves the headline to +11.75, so it does not " +
      "rest on one case.",
    stat: { value: "+12.21", label: "points vs base", sub: "95% CI [+7.42, +17.00]" },
    icon: BarChart3,
    href: "/govbench",
    cta: "See the method",
    tone: "emerald",
  },
  {
    eyebrow: "Measured · negative",
    title: "We publish the experiments that refute us",
    body:
      "Per-dimension expert routing was our core architectural thesis. Measured against simply " +
      "using one good model, it showed no effect — so it ships off. A benchmark that only " +
      "reports its wins is worth less than one that reports the controls killing its own claims.",
    stat: { value: "+0.90", label: "routing vs one good model", sub: "95% CI [-1.99, +3.79] — no effect" },
    icon: XCircle,
    href: "/govbench",
    cta: "Read the refutations",
    tone: "amber",
  },
  {
    eyebrow: "Measured · limits",
    title: "The benchmark publishes its own resolution limit",
    body:
      "At current item counts every dimension is statistically tied across all ten models. We " +
      "say so above the table rather than below it, because a leaderboard that hides its power " +
      "analysis is a ranking of noise.",
    stat: { value: "0 of 15", label: "dimensions with a resolved winner", sub: "minimum detectable effect ≈63 points" },
    icon: ShieldCheck,
    href: "/govbench",
    tone: "amber",
  },
  // ── what it is for ───────────────────────────────────────────────────────
  {
    eyebrow: "Human oversight",
    title: "Automate the deterministic, escalate the novel",
    body:
      "Article 14 does not require pre-decision human review of every output. Deterministic, " +
      "statute-adjudicable checks can be fully automated. Novel judgement calls the statute " +
      "cannot settle escalate to a human with logged override authority.",
    icon: Lock,
    href: "/about",
    tone: "slate",
  },
  {
    eyebrow: "Open",
    title: "The benchmark, the data and the tooling are public",
    body:
      "174 items across 26 dimensions, every result file, and the honesty tooling that produced " +
      "them — intervals, margin analysis, and the pre-registered analyses. Apache-2.0. Run it " +
      "yourself and check our numbers.",
    stat: { value: "Apache-2.0", label: "items · results · tooling", sub: "published on HuggingFace" },
    icon: Globe2,
    href: "/govbench",
    cta: "Get the data",
    tone: "emerald",
  },
  {
    eyebrow: "Start here",
    title: "Find out which obligations actually apply to you",
    body:
      "A free classification against Article 5 prohibitions, Article 6 high-risk criteria and " +
      "Annex III categories — with the statutory citation for every answer, so you can check it.",
    icon: ShieldCheck,
    href: "/eu-ai-act-classifier",
    cta: "Free risk check",
    tone: "emerald",
  },
];

const TONE = {
  emerald: { ring: "ring-emerald-500/30", chip: "bg-emerald-100 text-emerald-800", stat: "text-emerald-700", glow: "from-emerald-100/80" },
  amber:   { ring: "ring-amber-500/30",   chip: "bg-amber-100 text-amber-900",     stat: "text-amber-700",   glow: "from-amber-100/80" },
  rose:    { ring: "ring-rose-500/30",    chip: "bg-rose-100 text-rose-800",       stat: "text-rose-700",    glow: "from-rose-100/80" },
  slate:   { ring: "ring-slate-400/30",   chip: "bg-slate-100 text-slate-800",     stat: "text-slate-700",   glow: "from-slate-100/80" },
} as const;

const DWELL_MS = 7000;

export function GreenfieldCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const go = useCallback((n: number) => setI((n + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    // Auto-advance stops when paused, when the tab is hidden, or when the visitor has asked
    // for reduced motion. A carousel that keeps moving under prefers-reduced-motion is an
    // accessibility failure on a page about compliance.
    if (paused || reduced) return;
    const t = setInterval(() => {
      if (!document.hidden) setI((p) => (p + 1) % SLIDES.length);
    }, DWELL_MS);
    return () => clearInterval(t);
  }, [paused, reduced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(i + 1);
      if (e.key === "ArrowLeft") go(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, go]);

  const s = SLIDES[i];
  const Icon = s.icon;
  const tone = TONE[s.tone];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="CSOAI capabilities"
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1);
        touchX.current = null;
      }}
    >
      <div className={`relative overflow-hidden rounded-2xl ring-1 ${tone.ring} bg-white shadow-sm`}>
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tone.glow} via-white to-white`} />

        <div
          key={i}
          className="relative grid gap-8 p-8 sm:p-12 md:grid-cols-[1.4fr_1fr] md:items-center animate-in fade-in slide-in-from-bottom-2 duration-500"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${SLIDES.length}: ${s.title}`}
        >
          <div>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${tone.chip}`}>
              <Icon className="h-3.5 w-3.5" /> {s.eyebrow}
            </span>
            <h2 className="mt-4 text-2xl sm:text-4xl font-black tracking-tight text-gray-900 leading-tight">
              {s.title}
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl leading-relaxed">{s.body}</p>
            {s.href && (
              <Link
                href={s.href}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                {s.cta ?? "Learn more"} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {s.stat && (
            <div className="md:justify-self-end">
              <div className="rounded-xl border border-gray-200/80 bg-white/70 backdrop-blur px-6 py-5 text-center md:text-right">
                <div className={`text-4xl sm:text-5xl font-black tabular-nums ${tone.stat}`}>
                  {s.stat.value}
                </div>
                <div className="mt-1 text-sm font-medium text-gray-700">{s.stat.label}</div>
                {s.stat.sub && <div className="mt-0.5 text-xs text-gray-500">{s.stat.sub}</div>}
              </div>
            </div>
          )}
        </div>

        {/* progress */}
        {!reduced && !paused && (
          <div className="absolute bottom-0 left-0 h-0.5 bg-emerald-500/70 animate-[grow_7s_linear]"
               style={{ animationName: "grow", width: "100%", transformOrigin: "left", animation: `grow ${DWELL_MS}ms linear` }} />
        )}
      </div>

      {/* controls */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play carousel" : "Pause carousel"}
          className="rounded-full p-1.5 text-gray-400 hover:text-gray-700 transition"
        >
          {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
        <div className="flex gap-2" role="tablist">
          {SLIDES.map((sl, n) => (
            <button
              key={n}
              role="tab"
              aria-selected={n === i}
              aria-label={`Slide ${n + 1}: ${sl.title}`}
              onClick={() => go(n)}
              className={`h-1.5 rounded-full transition-all ${
                n === i ? "w-8 bg-emerald-600" : "w-1.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
        <span className="text-xs tabular-nums text-gray-400 w-10 text-right">
          {i + 1}/{SLIDES.length}
        </span>
      </div>

      <style>{`@keyframes grow { from { transform: scaleX(0) } to { transform: scaleX(1) } }`}</style>
    </section>
  );
}

export default GreenfieldCarousel;

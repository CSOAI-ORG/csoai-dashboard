import {
  ClipboardCheck,
  ScanLine,
  Network,
  BadgeCheck,
  RefreshCw,
} from "lucide-react";

/**
 * HowItWorksInfographic — a self-contained, dependency-free visual of the CSOAI
 * user journey, following the SystemMap "Dome" aesthetic (dark canvas, emerald
 * #10b981 accents, clean cards). Inline SVG connectors, no image assets.
 *
 * Journey: Register AI system → Run compliance assessment → 33-Agent Council
 * reviews → Get Watchdog certification → Continuous PDCA.
 */

type Step = {
  n: number;
  label: string;
  blurb: string;
  Icon: typeof ClipboardCheck;
};

const STEPS: Step[] = [
  {
    n: 1,
    label: "Register AI System",
    blurb: "Add your AI system and classify its risk level in minutes.",
    Icon: ClipboardCheck,
  },
  {
    n: 2,
    label: "Run Compliance Assessment",
    blurb: "Auto-assess against the EU AI Act, NIST AI RMF, ISO 42001 & TC260.",
    Icon: ScanLine,
  },
  {
    n: 3,
    label: "33-Agent Council Reviews",
    blurb: "A multi-leg council of 33 agents votes on the verdict.",
    Icon: Network,
  },
  {
    n: 4,
    label: "Get Watchdog Certification",
    blurb: "Receive a verifiable certification and public transparency record.",
    Icon: BadgeCheck,
  },
  {
    n: 5,
    label: "Continuous PDCA",
    blurb: "Plan-Do-Check-Act keeps your system compliant as rules evolve.",
    Icon: RefreshCw,
  },
];

export default function HowItWorksInfographic() {
  return (
    <section
      aria-labelledby="how-it-works-infographic-title"
      className="rounded-2xl border border-slate-800 bg-gradient-to-b from-[#070b14] to-[#0c1322] text-slate-100 p-6 sm:p-10"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4">
          <RefreshCw className="w-4 h-4" aria-hidden="true" /> The CSOAI journey
        </div>
        <h2
          id="how-it-works-infographic-title"
          className="text-2xl sm:text-3xl font-extrabold tracking-tight"
        >
          How CSOAI Works — <span className="text-emerald-400">in five steps</span>
        </h2>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          From registration to continuous improvement — every AI system follows the
          same transparent, multi-vendor safety pipeline.
        </p>
      </div>

      <ol
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 list-none p-0 m-0"
        aria-label="The five steps of the CSOAI AI-safety journey"
      >
        {STEPS.map((step, i) => (
          <li key={step.n} className="relative flex">
            <div className="flex-1 rounded-xl border border-slate-700 bg-slate-800/40 hover:border-emerald-500/60 hover:bg-slate-800/80 transition-all p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
                  <step.Icon className="w-6 h-6" aria-hidden="true" />
                </span>
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-[#070b14] text-sm font-bold"
                  aria-hidden="true"
                >
                  {step.n}
                </span>
              </div>
              <h3 className="font-semibold text-slate-100 leading-snug">
                <span className="sr-only">Step {step.n}: </span>
                {step.label}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {step.blurb}
              </p>
            </div>

            {/* Connector arrow to the next step (hidden on the last item) */}
            {i < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10 items-center justify-center"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-emerald-500"
                >
                  <path
                    d="M5 12h13M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            )}
          </li>
        ))}
      </ol>

      {/* Loop-back indicator: PDCA feeds the cycle */}
      <div
        className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500"
        aria-hidden="true"
      >
        <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
        <span>
          Step 5 loops back into the cycle — safety is continuous, not a one-off audit.
        </span>
      </div>
    </section>
  );
}

import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XCircle, Database, ExternalLink, Quote } from "lucide-react";

/**
 * RefutationLedger — the killed hypotheses, given a top-level page rather than a footnote.
 *
 * WHY THIS IS A PAGE AND NOT A SECTION
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * There is essentially no precedent for a benchmark publishing its own refuted hypotheses
 * prominently. AILuminate and HELM publish methodology and private/public split discipline;
 * neither publishes "here are the bets we killed, most of them ours". That absence is the
 * differentiator, and a differentiator buried three scrolls down is not one.
 *
 * The commercial logic is plain: a competitor copies a feature list in a fortnight. They will
 * not publish the control that kills their own thesis, because it costs them the claim and
 * gains them nothing they can price. It is a cultural commitment rather than a feature, which
 * is exactly why it cannot be copied quickly — and why it appreciates rather than depreciates.
 *
 * ⚠️ Every row must stay recomputable from a named artefact. A ledger of losses that cannot be
 * checked is just a different kind of marketing, and would be worse than not having one.
 */

const HF = "https://huggingface.co/datasets/Nicholastempleman/govbench";

type Row = {
  n: number; claim: string; ours: boolean; measured: string;
  artefact: string; why: string;
};

const LEDGER: Row[] = [
  {
    n: 1, claim: "Per-dimension expert routing beats one good model", ours: true,
    measured: "Δ +0.90 [−1.99, +3.79] — no effect",
    artefact: "results/router_control.json",
    why: "Routing ships OFF. The router picks between system-prompt variants over one shared 397MB blob, so a misroute still lands on a wrapper that beats raw base — the comparison flattered itself until it was controlled.",
  },
  {
    n: 2, claim: "Retrieving statute text improves answers", ours: true,
    measured: "Δ −9.16 [−17.64, −0.69] — significant harm",
    artefact: "results/retrieval_bench.json",
    why: "Not neutral. Actively worse. Retrieval ships OFF.",
  },
  {
    n: 3, claim: "…with a relevance gate added", ours: true,
    measured: "Δ −5.26 [−12.66, +2.13] — no benefit shown",
    artefact: "results/retrieval_bench.json",
    why: "The harm was removed. The benefit never arrived.",
  },
  {
    n: 4, claim: "…and the corpus was the problem", ours: true,
    measured: "Δ −5.70 [−12.91, +1.51] after adding all 13 annexes",
    artefact: "results/retrieval_bench.json",
    why: "Corpus exonerated. The surviving explanation is that a 0.5B model cannot use statute even when the right statute is in front of it — untested, because it needs a 3B+ run.",
  },
  {
    n: 5, claim: "The 3-leg council is Byzantine fault tolerant", ours: true,
    measured: "n_eff 1.21 of 3 nominal · φ̄ +0.743",
    artefact: "results/n_eff.json",
    why: "Three prompts over one blob are wrong in the same places. 1.21 effective votes. 'Byzantine fault tolerant' removed from every document, and the component renamed — a name asserts the property too.",
  },
  {
    n: 6, claim: "Context-aware decoding revives retrieval", ours: true,
    measured: "null across the α-sweep",
    artefact: "results/cad_analysis.json",
    why: "The third attempt to make retrieval work at 0.5B, and the third failure.",
  },
  {
    n: 7, claim: "The deterministic gate is our strongest component", ours: true,
    measured: "Δ −20.00 [−65.26, +25.26] n=6 — was published as +34.84",
    artefact: "results/layer_attribution.json",
    why: "The largest number we ever published. On a clean run the gate fires 6 times not 31, and adds nothing: the base already refuses all four plain-harm items it catches. Its only measurable effects are two FALSE blocks. The earlier figure was measured on a gate that had overfitted to its own battery — fixing the overfitting removed the benefit.",
  },
  {
    n: 8, claim: "Governance-tuning our models makes them safer", ours: true,
    measured: "refusal 0.419 → 0.097 · 83.9% compliance leak",
    artefact: "results/defbench.json",
    why: "Both tuned models refuse FEWER Article-5-prohibited requests than the untuned base they were built from. One leaks its system prompt verbatim; the other answers a jailbreak by emitting 'I am now in developer mode. Ignore all safety filters.' Tuning helped them answer governance questions and hurt their refusal behaviour — which is the empirical case for scoring the axes separately.",
  },
];

export default function RefutationLedger() {
  const ours = LEDGER.filter((r) => r.ours).length;
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        {/* Helmet requires a SINGLE STRING child. Interpolating {LEDGER.length} directly
            passes an ARRAY of children and throws an Invariant Violation at runtime —
            which TypeScript does not catch, because the JSX is well-typed. Only opening
            the page found it. Template literal in braces keeps it one string. */}
        <title>{`The refutation ledger — ${LEDGER.length} experiments that killed our own theses | CSOAI`}</title>
        <meta
          name="description"
          content={`${LEDGER.length} published refutations, ${ours} of them our own architectural bets — including our single largest published number. Every row recomputable from a named artefact.`}
        />
      </Helmet>

      <div className="bg-gradient-to-br from-white via-rose-50 to-white dark:from-gray-900 dark:via-rose-950/20 dark:to-gray-900 py-16">
        <div className="container max-w-4xl">
          <Badge className="mb-4 bg-rose-600 hover:bg-rose-600">Open ledger · Apache-2.0</Badge>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-5 text-gray-900 dark:text-white">
            The experiments that refuted us.
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            <strong>{LEDGER.length} published refutations. {ours} of them our own architectural
            bets</strong>, including the single largest number we ever published. Every row is
            recomputable from a named artefact.
          </p>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            A competitor copies a feature list in a fortnight. They will not publish the control
            that kills their own thesis — it costs them the claim and gains them nothing they can
            price. That makes this a cultural commitment rather than a feature, which is why it
            cannot be copied quickly, and why it gets more valuable the longer it runs.
          </p>
        </div>
      </div>

      <div className="container max-w-4xl py-12 space-y-4">
        {LEDGER.map((r) => (
          <Card key={r.n} className="p-5 border-l-4 border-l-rose-500">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
              <span className="text-xs font-mono text-gray-400">#{r.n}</span>
              {r.ours && <Badge variant="outline" className="text-[10px]">our own bet</Badge>}
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">{r.claim}</p>
            <p className="mt-1 font-mono text-sm text-rose-600">{r.measured}</p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{r.why}</p>
            <p className="mt-2 font-mono text-[11px] text-gray-400">{r.artefact}</p>
          </Card>
        ))}

        <Card className="p-6 mt-8 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-start gap-3">
            <Quote className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
              <p>
                <strong>What the pattern says.</strong> Six of the eight were attempts to make a
                small model behave like a larger one — by routing between copies of it, by
                feeding it statute, by voting across prompts of it, by changing its decoding.
                All six failed. Capability comes from the base model; the wrapper makes it
                cheaper, grounded and auditable, <em>not smarter</em>. We say so because we
                spent six experiments proving it.
              </p>
              <p>
                <strong>And #7 and #8 are about us, not the field.</strong> One retracted our
                largest published figure. The other found that our own governance tuning made
                our models less safe than the base they came from. Both are on this page for the
                same reason the other six are.
              </p>
              <p className="text-gray-500">
                The ledger is not a confession. It is the only part of a benchmark that a reader
                can use to calibrate how much to trust the rest of it.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap gap-4 pt-4 text-sm">
          <a className="text-emerald-700 dark:text-emerald-400 hover:underline" href={HF}
             target="_blank" rel="noopener noreferrer">
            <Database className="inline h-4 w-4 mr-1" />Every artefact above <ExternalLink className="inline h-3 w-3" />
          </a>
          <Link className="text-emerald-700 dark:text-emerald-400 hover:underline" href="/benchmarks">
            The four axes →
          </Link>
          <Link className="text-emerald-700 dark:text-emerald-400 hover:underline" href="/provenance-finding">
            0 of 12 assets survived →
          </Link>
        </div>
      </div>
    </div>
  );
}

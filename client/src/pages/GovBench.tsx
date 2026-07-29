import { Helmet } from "react-helmet-async";
import { SovCard } from "@/components/SovCard";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3, AlertTriangle, ExternalLink, Database, ShieldCheck, XCircle,
} from "lucide-react";

/**
 * GovBench — the public benchmark page.
 *
 * Every number here comes from a published artefact in the govbench dataset. Where a result
 * is negative or unresolved, it is stated as plainly as the positive one — that is the whole
 * proposition, and it is also the only durable moat: a larger lab will not publish the
 * experiment that refutes its own architecture.
 *
 * Do not add a number to this page that is not in benchmark-results/ and on HuggingFace.
 */

const HF = "https://huggingface.co/datasets/Nicholastempleman/govbench";
const HF_ITEMS = "https://huggingface.co/datasets/Nicholastempleman/govbench-items";
const SPACE = "https://nicholastempleman-sov33-benchmark.static.hf.space";

const LAYERS = [
  { layer: "Deterministic gate", n: 31, delta: "+34.84", ci: "[+17.50, +52.18]", good: true },
  { layer: "Knowledge base", n: 14, delta: "+19.64", ci: "[+6.87, +32.41]", good: true },
  { layer: "Tuned model", n: 141, delta: "+9.42", ci: "[+4.82, +14.03]", good: true },
];

const REFUTED = [
  {
    claim: "Per-dimension expert routing beats one good model",
    result: "Δ +0.90",
    ci: "[-1.99, +3.79]",
    verdict: "No effect. Routing ships OFF.",
  },
  {
    claim: "Retrieving statute text improves answers (ungated)",
    result: "Δ -9.16",
    ci: "[-17.64, -0.69]",
    verdict: "Significant harm.",
  },
  {
    claim: "…with a relevance gate added",
    result: "Δ -5.26",
    ci: "[-12.66, +2.13]",
    verdict: "Harm removed, benefit not shown. Retrieval ships OFF.",
  },
];

export default function GovBench() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>GovBench — an AI governance benchmark that publishes its own limits | CSOAI</title>
        <meta
          name="description"
          content="174 items, 26 dimensions, 10 models. Open data on HuggingFace. Publishes its resolution limit and the experiments that refute its own architecture."
        />
      </Helmet>

      {/* Hero */}
      <div className="bg-gradient-to-br from-white via-emerald-50 to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-950 py-20">
        <div className="container max-w-5xl">
          <Badge className="mb-4 bg-emerald-600 hover:bg-emerald-600">Open benchmark · Apache-2.0</Badge>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-6 text-gray-900 dark:text-white">
            GovBench
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mb-8">
            An AI-governance benchmark that publishes its own resolution limit — and the
            experiments that refute its own architecture.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <a href={SPACE} target="_blank" rel="noopener noreferrer">
                View the live leaderboard <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={HF_ITEMS} target="_blank" rel="noopener noreferrer">
                <Database className="mr-2 h-4 w-4" /> Get the data
              </a>
            </Button>
          </div>
          <div className="mt-8 max-w-xl">
            <SovCard compact />
          </div>
        </div>
      </div>

      <div className="container max-w-5xl py-16 space-y-14">
        {/* The limit, stated first and deliberately */}
        <Card className="border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-700 dark:text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-2">
                0 of 15 scored dimensions have a resolved winner
              </h2>
              <p className="text-sm text-amber-900/90 dark:text-amber-200/90 mb-3">
                Every dimension is statistically tied across all 10 models on Wilson intervals.
                At current item counts the minimum detectable effect is <strong>≈63 points</strong>,
                and observed margins are 1–15. MMLU's own floor is 100 items per subject; Miller
                (arXiv:2411.00640) puts it at ~1,000 per comparison.
              </p>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                So: do not rank models on these numbers. Use them to find failure cases.
              </p>
            </div>
          </div>
        </Card>

        {/* What is measured */}
        <section>
          <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
            What is actually measured
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-3xl">
            Not a model — the composed pipeline (gate → retrieve → answer → verify → attest →
            mark) against the same items answered by a raw base model. n=195, paired, judged by
            an analysis written <em>before</em> the run existed.
          </p>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 text-left">
                  <tr>
                    <th className="p-3 font-semibold">Layer</th>
                    <th className="p-3 font-semibold">n</th>
                    <th className="p-3 font-semibold">Δ vs base</th>
                    <th className="p-3 font-semibold">95% CI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {LAYERS.map((l) => (
                    <tr key={l.layer}>
                      <td className="p-3">{l.layer}</td>
                      <td className="p-3 tabular-nums text-gray-500">{l.n}</td>
                      <td className="p-3 tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
                        {l.delta}
                      </td>
                      <td className="p-3 tabular-nums text-gray-500">{l.ci}</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50 dark:bg-emerald-950/40 font-bold">
                    <td className="p-3">Whole system</td>
                    <td className="p-3 tabular-nums">195</td>
                    <td className="p-3 tabular-nums text-emerald-700 dark:text-emerald-400">+12.21</td>
                    <td className="p-3 tabular-nums">[+7.42, +17.00]</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
          <p className="text-xs text-gray-500 mt-3">
            Wins 64 · losses 20 · ties 102 · sign test p&lt;0.0001. Dropping the single largest
            item moves the headline to +11.75, so it does not rest on one case.
          </p>
        </section>

        {/* The refutations — the actual proposition */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-6 w-6 text-rose-600" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Experiments that refuted our own architecture
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-3xl">
            Published because a benchmark that only reports its wins is worth less than one that
            reports the controls killing its own thesis. Both of these were built, measured, and
            switched off.
          </p>
          <div className="space-y-3">
            {REFUTED.map((r) => (
              <Card key={r.claim} className="p-4 border-l-4 border-l-rose-500">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">{r.claim}</span>
                  <span className="tabular-nums text-sm">
                    <strong className="text-rose-600">{r.result}</strong>{" "}
                    <span className="text-gray-500">{r.ci}</span>
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{r.verdict}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Honesty register */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What this is not</h2>
          </div>
          <Card className="p-6 space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>This governs provenance, not correctness.</strong> The pipeline has shipped
              a wrong legal answer carrying a valid EU AI Act Article 50 marking and a clean
              signed receipt. An attested answer is <em>attested</em>, never <em>verified</em> —
              different word, different guarantee.
            </p>
            <p>
              <strong>UNCERTIFIED is the default.</strong> No competent authority exists to confer
              EU AI Act conformity, so neither can we. Nothing here is a certification.
            </p>
            <p>
              <strong>The models tested are system-prompt variants over one shared base</strong>,
              not separately trained weights — which is precisely why the routing experiment above
              came back null.
            </p>
          </Card>
        </section>

        {/* Run it */}
        <section>
          <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">Run it yourself</h2>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
            <code>{`pip install inspect-ai
inspect eval govbench_inspect.py --model ollama/qwen2.5:0.5b`}</code>
          </pre>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Failed runs are recorded as <strong>absent</strong>, never as zero — a model we could
            not reach is missing from the board, not scored badly on it.
          </p>
          <div className="flex flex-wrap gap-4 mt-6 text-sm">
            <a className="text-emerald-700 dark:text-emerald-400 hover:underline" href={HF_ITEMS}
               target="_blank" rel="noopener noreferrer">
              174 items, 26 dimensions →
            </a>
            <a className="text-emerald-700 dark:text-emerald-400 hover:underline" href={HF}
               target="_blank" rel="noopener noreferrer">
              Results, tooling and raw JSON →
            </a>
            <Link className="text-emerald-700 dark:text-emerald-400 hover:underline" href="/trust">
              Trust &amp; methodology →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

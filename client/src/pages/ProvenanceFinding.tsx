import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, ExternalLink, Database, FileCheck, XCircle } from "lucide-react";

/**
 * ProvenanceFinding — the one-page, human-readable version of the ProvBench result.
 *
 * THE CLAIM, PHRASED TO SURVIVE
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * "Across 20 independent assets and 11 transforms, embedded C2PA manifests survived 0 of 20
 *  assets (0 of 180 measured cells). One-sided 95% Clopper–Pearson upper bound on per-asset
 *  survival: 13.9%. The identity control passed 20/20."
 *
 * NEVER: "C2PA is broken" · "Article 50 doesn't work" · "provenance is useless".
 * We publish a measurement. Others draw conclusions. That distinction is the legal armour.
 *
 * THE INTERVAL AND THE n TRAVEL TOGETHER — corrected 2026-07-29, and the correction went the
 * OPPOSITE WAY to the obvious one. An earlier draft paired the wide bound (24.2%) with the
 * large n (108). That is internally inconsistent, and the tempting fix is to "correct" the
 * bound down to ~2.1% to match n=180. **That fix is wrong.** Nine transforms of the SAME
 * signed asset are not nine independent observations — they are one deterministic fact ("did
 * the bytes change?") restated nine times. If a hard binding breaks at q90 it breaks at q50
 * for the identical reason. So the n moves to the asset (12), not the bound to the cell.
 *
 * Clopper–Pearson is used because Wald and Agresti–Coull are documented to fail at X=0.
 * The residual uncertainty is EXTERNAL VALIDITY, not sampling noise: a hash over bytes is
 * deterministic, so re-running a cell reproduces it with probability 1 and the run-to-run
 * (Type A, per JCGM 100:2008) uncertainty is structurally zero.
 *
 * Every figure here is recomputable from benchmark-results/provbench.json.
 */

const HF = "https://huggingface.co/datasets/Nicholastempleman/govbench";

const TRANSFORMS: { name: string; what: string; result: "destroyed" | "survived" | "unmeasured" | "modelled" }[] = [
  { name: "identity (control)", what: "no modification", result: "survived" },
  { name: "JPEG re-encode q90", what: "ordinary re-save", result: "destroyed" },
  { name: "JPEG re-encode q70", what: "ordinary re-save", result: "destroyed" },
  { name: "JPEG re-encode q50", what: "ordinary re-save", result: "destroyed" },
  { name: "resize 50%", what: "downscale", result: "destroyed" },
  { name: "crop 10%", what: "5% off each edge", result: "destroyed" },
  { name: "strip metadata", what: "remove APPn/COM — pixels bit-identical", result: "destroyed" },
  { name: "format → PNG", what: "container change", result: "destroyed" },
  { name: "format → WebP", what: "container change", result: "destroyed" },
  { name: "screenshot-equivalent", what: "rasterise + rescale + PNG", result: "modelled" },
  { name: "format → HEIC", what: "no encoder available here", result: "unmeasured" },
];

const STYLE = {
  destroyed: { cls: "text-rose-600", label: "destroyed" },
  survived: { cls: "text-emerald-600", label: "survived" },
  unmeasured: { cls: "text-gray-400", label: "UNMEASURED" },
  modelled: { cls: "text-amber-600", label: "modelled" },
};

export default function ProvenanceFinding() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>An Article 50 marking does not survive one ordinary save — measured | CSOAI</title>
        <meta
          name="description"
          content="20 assets × 11 transforms × 5 checks. Embedded C2PA manifests survived 0 of 20 assets (0 of 180 cells). One-sided 95% Clopper–Pearson upper bound 13.9%, computed at n=20 assets. Real signing, real transforms, reproducible."
        />
      </Helmet>

      <div className="bg-gradient-to-br from-white via-rose-50 to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-rose-950/30 py-16">
        <div className="container max-w-4xl">
          <Badge className="mb-4 bg-rose-600 hover:bg-rose-600">Measured finding · Apache-2.0</Badge>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-5 text-gray-900 dark:text-white">
            The marking that proves content is AI-generated does not survive one ordinary save.
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            EU AI Act Article 50 requires generated content to be marked in a machine-readable
            way — effective, interoperable, robust and reliable. The obligation applies from
            <strong> 2 August 2026</strong>, with penalties up to <strong>€15M or 3% of
            worldwide turnover</strong>. The regime assumes the marking persists.
          </p>
          <div className="rounded-2xl border-2 border-rose-300 dark:border-rose-900 bg-white dark:bg-gray-900 p-6">
            <p className="text-sm text-gray-500 mb-1">Across 20 independent assets and 11 transforms</p>
            <p className="text-3xl sm:text-4xl font-black tabular-nums text-rose-600">
              0 of 20 assets survived
            </p>
            <p className="mt-1 text-sm text-gray-500">(0 of 180 measured cells)</p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              One-sided 95% Clopper–Pearson upper bound on per-asset survival:{" "}
              <strong>13.9%</strong> (two-sided 16.8%). The interval is computed at{" "}
              <strong>n=20 assets</strong>, not n=180 cells. The identity control passed 20/20.
            </p>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl py-14 space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Every transform, and what happened</h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 text-left">
                  <tr>
                    <th className="p-3 font-semibold">Transform</th>
                    <th className="p-3 font-semibold">What it is</th>
                    <th className="p-3 font-semibold">Manifest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {TRANSFORMS.map((t) => (
                    <tr key={t.name}>
                      <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{t.name}</td>
                      <td className="p-3 text-gray-500">{t.what}</td>
                      <td className={`p-3 font-semibold ${STYLE[t.result].cls}`}>{STYLE[t.result].label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <p className="text-xs text-gray-500 mt-3">
            <strong>JPEG quality is irrelevant</strong> — q90, q70 and q50 are identically 0/20,
            because the manifest is metadata, not pixels. This was predicted before the run; had
            q90 survived where q50 did not, the harness would have been measuring pixel
            similarity and would have been wrong.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Why you can believe it</h2>
          </div>
          <Card className="p-6 space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>Real signing, not simulation.</strong> c2pa SDK 0.90.1, Ed25519,
              RFC&nbsp;3161 timestamping. A signed asset carries 13 <code>jumb</code> and 20{" "}
              <code>c2pa</code> byte markers and reads back <code>validation_state Valid</code>.
            </p>
            <p>
              <strong>Verified two ways.</strong> Not just by the C2PA reader — every output was
              also byte-scanned independently, so the result does not depend on the verification
              library agreeing with itself. After one q90 re-save: <strong>zero markers</strong>,
              and the reader raises <code>no JUMBF data found</code>.
            </p>
            <p>
              <strong>The strip test is attributable.</strong> <code>strip_metadata</code> leaves
              the decoded pixels <em>bit-identical</em> (43,730 → 676 bytes), so its destruction
              is caused by metadata removal and not by a hidden re-encode.
            </p>
            <p>
              <strong>Unrunnable cells are UNMEASURED, never zero.</strong> HEIC has no encoder
              here, so it is excluded from both numerator and denominator rather than counted as
              a failure.
            </p>
          </Card>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">The limits, stated first</h2>
          </div>
          <Card className="p-6 space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>The interval and the n must travel together.</strong> A cell-level bound
              on 0/180 is ~2.1%, and it is wrong here: nine transforms of the <em>same</em>
              signed asset are not nine independent observations. They are one deterministic
              fact — "did the bytes change?" — restated nine times. If a hard binding breaks at
              q90 it breaks at q50 for the identical reason. The independent unit is the{" "}
              <strong>asset</strong>, so the bound is computed at <strong>n=20</strong>:
              one-sided 95% Clopper–Pearson <strong>13.9%</strong>, two-sided 16.8%. Adding eight
              assets tightened it from 22.1% — asset count is the statistical lever, not trial
              count. We report ~2.1% only as the bound <em>if</em> cells were
              independent, which they are not.
            </p>
            <p>
              <strong>And the residual uncertainty is not sampling noise.</strong> A hard
              binding is a cryptographic hash over asset bytes, so re-running any cell
              reproduces the identical outcome with probability 1 — the run-to-run uncertainty
              is structurally zero. The bound quantifies <strong>generalisation to unseen
              assets and transforms</strong> (external validity), nothing else.
            </p>
            <p>
              <strong>For context on rigour, not as a defence:</strong> the closest prior work —
              WAVES (arXiv 2401.08573) and UnMarker (arXiv 2405.08363) — reports point estimates
              with <em>no confidence intervals at all</em>, at comparable or smaller n. A
              cluster-aware bound plus a determinism caveat is more conservative than the field
              norm, not less.
            </p>
            <p>
              <strong>One transform is modelled, not measured.</strong> Screenshot-equivalent
              simulates a screen capture rather than taking one. Labelled in the artefact. The
              modelling is conservative: a real screenshot discards the container entirely.
            </p>
            <p>
              <strong>Our certificate is a private root, not on the C2PA trust list.</strong> So{" "}
              <code>issuer_resolvable</code> fails in every cell including the control. That is a
              property of our credential, not damage from a transform, and the output says so.
              Survival is about binding integrity, not trust-list membership.
            </p>
            <p>
              <strong>Transforms are applied by Pillow.</strong> A different encoder — libvips,
              ImageMagick, a phone ISP, a CDN — may behave differently, and some deliberately
              preserve metadata. This is a sample, not an exhaustive battery.
            </p>
            <p>
              <strong>Not tested: soft binding (watermarks) and cloud manifest recovery.</strong>{" "}
              Both exist precisely <em>because</em> embedded manifests do not survive, so a real
              Article 50 deployment would likely use them. Named as missing rather than passed.
            </p>
          </Card>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-6 w-6 text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What this finding is not</h2>
          </div>
          <Card className="p-6 border-l-4 border-l-rose-500 text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>It is not "C2PA is broken." C2PA does exactly what it specifies.</p>
            <p>It is not "Article 50 doesn't work." Article 50 says "as far as is technically feasible" — this measures what that phrase costs in practice.</p>
            <p>It is not "provenance is useless." A detached sidecar recovers the <em>disclosure</em>, which is what Article 50(2) actually asks for. It never recovers the <em>binding</em>.</p>
            <p className="pt-2 font-medium text-gray-900 dark:text-white">
              We publish a measurement. Others draw conclusions.
            </p>
          </Card>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileCheck className="h-6 w-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">The result that matters more</h2>
          </div>
          <Card className="p-6 text-sm text-gray-700 dark:text-gray-300">
            <p>
              A manifest lifted from a <strong>completely different asset</strong> still reports{" "}
              <code>signature_valid = survived</code>. Only <code>binding_intact</code> catches
              the transplant — measured, not assumed.
            </p>
            <p className="mt-3 font-medium text-gray-900 dark:text-white">
              So a verifier that reports "signature valid" without reporting the binding is
              telling you almost nothing. If you are buying a provenance product, that is the
              question to ask it.
            </p>
          </Card>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <a href={HF} target="_blank" rel="noopener noreferrer">
              <Database className="mr-2 h-4 w-4" /> Data, harness and raw JSON
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/benchmarks">All four axes <ExternalLink className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Reproduce it: <code>python3 provbench.py --selftest</code> then{" "}
          <code>python3 provbench.py</code>. Harness Apache-2.0, every figure recomputable from{" "}
          <code>results/provbench.json</code>.
        </p>
      </div>
    </div>
  );
}

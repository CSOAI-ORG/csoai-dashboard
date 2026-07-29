import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, XCircle, CheckCircle2, FlaskConical } from "lucide-react";

/**
 * MeasuredProof — the homepage's credibility anchor.
 *
 * The incumbents (Vanta, Drata, ServiceNow) sell PROCESS: policies, questionnaires, evidence
 * collection. None of them publishes a measurement of whether their controls change an
 * outcome, because there is no upside for them in doing so.
 *
 * That asymmetry is the whole position. This section shows a real measured result AND the
 * two experiments that refuted our own architecture, side by side. A competitor can copy the
 * feature list overnight; publishing the control that kills your own thesis is a costly
 * signal they will not send.
 *
 * RULE: every number here traces to a published artefact on HuggingFace. If a claim needs a
 * number we do not have, it does not go on this page.
 */

const WORKS = [
  { label: "Deterministic gate", delta: "+34.84", ci: "[+17.50, +52.18]", pct: 100 },
  { label: "Knowledge base", delta: "+19.64", ci: "[+6.87, +32.41]", pct: 56 },
  { label: "Tuned model", delta: "+9.42", ci: "[+4.82, +14.03]", pct: 27 },
];

const REFUTED = [
  { label: "Per-dimension expert routing", delta: "+0.90", ci: "[-1.99, +3.79]", note: "no effect — ships off" },
  { label: "Statute retrieval", delta: "−5.26", ci: "[-12.66, +2.13]", note: "no benefit shown — ships off" },
];

export function MeasuredProof() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-emerald-50/40">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            <FlaskConical className="h-3.5 w-3.5" /> Measured, not asserted
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-gray-900">
            Everyone claims compliance.
            <br className="hidden sm:block" />
            <span className="text-emerald-600"> We publish the measurement.</span>
          </h2>
          <p className="mt-5 text-lg text-gray-600 max-w-3xl mx-auto">
            Compliance platforms sell process — policies, questionnaires, evidence collection.
            Almost none of them publish whether any of it changes an outcome. We do, including
            when the answer embarrasses us.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* what held */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-emerald-200 bg-white p-7 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900">What held up</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Composed pipeline vs a raw model call. n=195, paired, analysis written before the
              run existed.
            </p>

            <div className="space-y-4">
              {WORKS.map((w, n) => (
                <div key={w.label}>
                  <div className="flex items-baseline justify-between text-sm mb-1.5">
                    <span className="text-gray-700">{w.label}</span>
                    <span className="font-bold tabular-nums text-emerald-700">{w.delta}</span>
                  </div>
                  <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${w.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.15 * n, ease: "easeOut" }}
                      className="h-full rounded-full bg-emerald-500"
                    />
                  </div>
                  <div className="mt-1 text-[11px] tabular-nums text-gray-400">95% CI {w.ci}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-emerald-50 px-5 py-4 text-center">
              <div className="text-3xl font-black tabular-nums text-emerald-700">+12.21</div>
              <div className="text-xs font-medium text-emerald-900">points, whole system vs base</div>
              <div className="text-[11px] text-emerald-800/70 tabular-nums">95% CI [+7.42, +17.00] · n=195</div>
            </div>
          </motion.div>

          {/* what did not */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-amber-200 bg-white p-7 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-5 w-5 text-amber-600" />
              <h3 className="font-bold text-gray-900">What we tried that didn't work</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Both were our own architectural bets. Both were measured, and both were switched
              off. Published in full.
            </p>

            <div className="space-y-4">
              {REFUTED.map((r) => (
                <div key={r.label} className="rounded-lg border-l-4 border-l-amber-400 bg-amber-50/60 p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900">{r.label}</span>
                    <span className="font-bold tabular-nums text-amber-700">{r.delta}</span>
                  </div>
                  <div className="mt-1 text-[11px] tabular-nums text-gray-500">95% CI {r.ci}</div>
                  <div className="mt-1 text-xs text-amber-900">{r.note}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-gray-900 px-5 py-4">
              <p className="text-sm text-gray-200 leading-relaxed">
                A competitor can copy a feature list overnight. Publishing the experiment that
                refutes your own architecture is the one thing they won't do.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/govbench"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-3.5 font-semibold text-white hover:bg-emerald-700 transition shadow-sm"
          >
            See the full benchmark and check our numbers <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-xs text-gray-500">
            174 items · 26 dimensions · 10 models · items, results and tooling open on HuggingFace, Apache-2.0
          </p>
        </div>
      </div>
    </section>
  );
}

export default MeasuredProof;

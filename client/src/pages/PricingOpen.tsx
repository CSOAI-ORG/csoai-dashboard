import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Check, ArrowRight, Building2, Landmark, GraduationCap, Info } from "lucide-react";

/**
 * PricingOpen — rebuilt 2026-07-29 from
 * _alignment/PRODUCT_PRICING_ECOSYSTEM_2026-07-29.md
 *
 * Replaces the £499 / £999 / £1,999 monthly seat tiers. The previous Pricing.tsx is kept on
 * disk (unrouted) because it carries the live tRPC/Stripe checkout wiring, which will be
 * needed again for metered PAYG — deleting it would throw away working integration code to
 * make a copy change.
 *
 * TWO RULES THIS PAGE ENFORCES
 *
 * 1. The free/paid line is drawn by ONE test: does providing it cost US money, liability or
 *    custody? Knowledge is never withheld to manufacture a tier. A proposed paid feature that
 *    fails the test belongs in the free column.
 *
 * 2. "Certification" does not appear as a product. CSOAI holds no external accreditation —
 *    no ISO/IEC 17065, no national body, no IAF recognition — so it cannot confer regulatory
 *    conformity at any price. Making an unaccredited certificate free would not fix that; it
 *    would give away a name implying a guarantee it cannot carry.
 */

const FREE = [
  "GovBench — 174 items, 26 dimensions, full results and tooling",
  "Regulation corpus — 417 provisions across 6 instruments, incl. all 13 AI Act annexes",
  "Article 50 risk check — Art 5, Art 6 and Annex III, with citations",
  "Conformity route — Annex VI self-assessment vs Annex VII notified body",
  "Every training course — no paywall, no waitlist, no code",
  "Assessment records — Ed25519-signed, verifiable offline by anyone",
  "Self-serve compliance check against a framework, gaps named",
  "SOV Town, SOV Space and the Arena",
];

const PRO = [
  { t: "Article 50 marking at volume", w: "Above 10,000 timestamps/year we are buying certificate-authority capacity on your behalf" },
  { t: "Managed hosting", w: "We run the substrate, patch it, and keep it up" },
  { t: "Evidence packs", w: "OSCAL bundles assembled, signed and kept current for a named auditor" },
  { t: "Private benchmark runs", w: "Your models, your items — results not published" },
  { t: "API above the free ceiling", w: "Metered on calls, never on people" },
  { t: "Support with a response-time commitment", w: "A human answering" },
];

const ALWAYS_FREE = [
  { icon: Landmark, who: "Government & regulators", why: "You are the constituency that must verify compliance and currently has no tooling. Charging you would forfeit the entire point." },
  { icon: GraduationCap, who: "Academic & non-profit", why: "Research and public-interest work should not meet a paywall." },
  { icon: Building2, who: "Individuals & SMEs", why: "The free ceilings are set so most organisations never reach a paid line at all." },
];

export default function PricingOpen() {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Pricing — free for almost everyone | CSOAI</title>
        <meta name="description" content="The benchmark, regulation corpus, risk check and all training are free and open-source. You pay only where we carry cost or custody on your behalf." />
      </Helmet>

      <div className="bg-gradient-to-br from-white via-emerald-50 to-emerald-100 py-20">
        <div className="container max-w-4xl text-center">
          <span className="inline-block rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
            No credit card · no seats · not a trial
          </span>
          <h1 className="mt-5 text-4xl sm:text-6xl font-black tracking-tight text-gray-900">
            Free for almost everyone.
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">
            The benchmark, the regulation corpus, the risk check and every training course are
            free and open-source. You pay only where we carry real cost or custody on your
            behalf — and most organisations never will.
          </p>
        </div>
      </div>

      <div className="container max-w-6xl py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="rounded-2xl border-2 border-emerald-500 bg-white p-8 shadow-sm">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-900">£0</span>
              <span className="text-gray-500">forever</span>
            </div>
            <h2 className="mt-2 text-xl font-bold text-gray-900">Open</h2>
            <p className="mt-1 text-sm text-gray-600">
              Apache-2.0. No account needed for anything that doesn't store your data.
            </p>
            <ul className="mt-6 space-y-3">
              {FREE.map((f) => (
                <li key={f} className="flex gap-3 text-sm text-gray-700">
                  <Check className="h-5 w-5 shrink-0 text-emerald-600" /><span>{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/eu-ai-act-classifier"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-semibold text-white hover:bg-emerald-700 transition">
              Start with a free risk check <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-8">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-900">Usage</span>
              <span className="text-gray-500">based</span>
            </div>
            <h2 className="mt-2 text-xl font-bold text-gray-900">Pro</h2>
            <p className="mt-1 text-sm text-gray-600">
              Metered on what you use. No seat licences — charging per person taxes the exact
              behaviour this exists to encourage.
            </p>
            <ul className="mt-6 space-y-4">
              {PRO.map((p) => (
                <li key={p.t} className="text-sm">
                  <div className="flex gap-3 font-medium text-gray-900">
                    <Check className="h-5 w-5 shrink-0 text-gray-400" /><span>{p.t}</span>
                  </div>
                  <p className="ml-8 mt-0.5 text-xs text-gray-500">{p.w}</p>
                </li>
              ))}
            </ul>
            <Link href="/contact"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3.5 font-semibold text-gray-900 hover:bg-gray-50 transition">
              Talk to us about volume
            </Link>
          </motion.div>
        </div>

        <div className="mt-14">
          <h3 className="text-center text-2xl font-bold text-gray-900">Free at every tier, permanently</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {ALWAYS_FREE.map((f) => {
              const I = f.icon;
              return (
                <div key={f.who} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5">
                  <I className="h-5 w-5 text-emerald-600" />
                  <div className="mt-2 font-semibold text-gray-900">{f.who}</div>
                  <p className="mt-1 text-sm text-gray-600">{f.why}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
            <div className="space-y-2 text-sm text-amber-900">
              <p><strong>We do not sell certification, at any price.</strong> CSOAI holds no
              external accreditation — no ISO/IEC 17065, no national accreditation body, no IAF
              recognition. We cannot confer regulatory conformity, so we do not offer it free
              or paid.</p>
              <p>What we provide is training, assessment, and a cryptographically verifiable
              record of that assessment. Where a notified body is legally required, you need a
              notified body — and our conformity router will tell you when that is the case,
              for free.</p>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Check our claims before trusting them —{" "}
          <Link href="/govbench" className="font-medium text-emerald-700 hover:underline">
            the benchmark publishes its own limits and the experiments that refute us
          </Link>.
        </p>
      </div>
    </div>
  );
}

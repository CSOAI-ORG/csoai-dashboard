"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GapMap from "@/components/GapMap";
import TimeSlider from "@/components/TimeSlider";
import { MOCK_CLAIMABLE } from "@/lib/mock-data";
import { fetchWatchers, fetchDecisionRecords } from "@/lib/d1-client";
import type { WatcherStatus, DecisionRecord } from "@/lib/types";

export default function HomePage() {
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [watchers, setWatchers] = useState<WatcherStatus[]>([]);
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);

  useEffect(() => {
    fetchWatchers().then(setWatchers);
    fetchDecisionRecords().then(setDecisions);
  }, []);

  const liveWatchers = watchers.filter(w => w.status === "LIVE").length;
  const refutations = decisions.filter(r => r.kind === "refutation" && r.verdict === "REFUTED").length;
  const openIssues = decisions.filter(r => r.verdict === "OPEN").length;

  // Mock timestamps for time slider
  const timestamps = [
    "2026-01-15T00:00:00Z",
    "2026-03-01T00:00:00Z",
    "2026-05-01T00:00:00Z",
    "2026-07-01T00:00:00Z",
    "2026-07-29T00:00:00Z",
  ];

  return (
    <div>
      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--csoai-text)" }}>
            The measurement body for AI compliance
          </h1>
          <p className="text-lg mb-8" style={{ color: "var(--csoai-muted)" }}>
            We measure whether AI systems actually comply with the law — and publish the experiments that prove us wrong.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/arena"
              className="px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ background: "var(--csoai-accent)", color: "white" }}
            >
              Enter Arena
            </Link>
            <Link
              href="/ledger"
              className="px-6 py-3 rounded-lg font-medium border transition-opacity hover:opacity-90"
              style={{ borderColor: "var(--csoai-border)", color: "var(--csoai-text)" }}
            >
              View Ledger
            </Link>
          </div>
        </div>
      </section>

      {/* Globe with Polygons */}
      <section className="py-12 px-4" style={{ background: "var(--csoai-surface)" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--csoai-text)" }}>
            SovSpace — Coverage Map
          </h2>
          <p className="mb-6" style={{ color: "var(--csoai-muted)" }}>
            Jurisdictions coloured by field-coverage density. The empty cells are the product.
          </p>

          <GapMap />

          {/* Time Slider */}
          <div className="mt-6">
            <TimeSlider
              timestamps={timestamps}
              onChange={setSelectedTime}
              currentValue={selectedTime}
            />
          </div>
        </div>
      </section>

      {/* Key Numbers */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: "var(--csoai-text)" }}>
            Measured Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_CLAIMABLE.slice(0, 4).map((claim) => (
              <div
                key={claim.claim}
                className="p-4 rounded-lg border"
                style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-bg)" }}
              >
                <div className="text-2xl font-bold mb-1" style={{ color: "var(--csoai-accent)" }}>
                  {claim.value}
                </div>
                <div className="text-sm mb-2" style={{ color: "var(--csoai-text)" }}>
                  {claim.claim}
                </div>
                {claim.interval && (
                  <div className="text-xs" style={{ color: "var(--csoai-muted)" }}>
                    95% CI: {claim.interval}
                  </div>
                )}
                {claim.n && (
                  <div className="text-xs" style={{ color: "var(--csoai-muted)" }}>
                    n={claim.n}{claim.lower_bound ? " (lower bound)" : ""}
                  </div>
                )}
                <div
                  className="inline-block mt-2 px-2 py-0.5 rounded text-xs"
                  style={{
                    background: claim.tag === "MEASURED" ? "rgba(34,197,94,0.1)" : "rgba(234,179,8,0.1)",
                    color: claim.tag === "MEASURED" ? "var(--csoai-green)" : "var(--csoai-amber)",
                  }}
                >
                  [{claim.tag}]
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status Overview */}
      <section className="py-12 px-4" style={{ background: "var(--csoai-surface)" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: "var(--csoai-text)" }}>
            Estate Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="p-6 rounded-lg border text-center"
              style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-bg)" }}
            >
              <div className="text-3xl font-bold mb-2" style={{ color: "var(--csoai-green)" }}>
                {liveWatchers}
              </div>
              <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>
                Live Watchers
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--csoai-muted)" }}>
                Anchored to real law and standards
              </div>
            </div>
            <div
              className="p-6 rounded-lg border text-center"
              style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-bg)" }}
            >
              <div className="text-3xl font-bold mb-2" style={{ color: "var(--csoai-amber)" }}>
                {refutations}
              </div>
              <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>
                Published Refutations
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--csoai-muted)" }}>
                4 killed our own bets
              </div>
            </div>
            <div
              className="p-6 rounded-lg border text-center"
              style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-bg)" }}
            >
              <div className="text-3xl font-bold mb-2" style={{ color: "var(--csoai-accent)" }}>
                {openIssues}
              </div>
              <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>
                Open Contradictions
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--csoai-muted)" }}>
                Surfaced, never resolved automatically
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Moat */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: "var(--csoai-text)" }}>
            The Moat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Anchored", desc: "417-provision statute corpus, hashed and versioned" },
              { label: "Deterministic", desc: "5 predicates, no LLM judge on any primary score" },
              { label: "Signed", desc: "Every score in a hash-chained J-record" },
              { label: "Agentic", desc: "Speaker AND actor mode, trap tools declared" },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4 rounded-lg border"
                style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
              >
                <div className="font-semibold mb-1" style={{ color: "var(--csoai-accent)" }}>
                  {item.label}
                </div>
                <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 px-4" style={{ background: "var(--csoai-surface)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: "var(--csoai-text)" }}>
            Explore
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: "/gap", label: "Gap Map", desc: "Where the field is blind" },
              { href: "/ledger", label: "Refutation Ledger", desc: "What we got wrong" },
              { href: "/anchors", label: "Live Anchors", desc: "Watchers and status" },
              { href: "/methodology", label: "Methodology", desc: "How we measure" },
              { href: "/verify", label: "Verify", desc: "Check the chain yourself" },
              { href: "/corrections", label: "Corrections", desc: "Permanent, public" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="p-4 rounded-lg border transition-opacity hover:opacity-90"
                style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-bg)" }}
              >
                <div className="font-semibold mb-1" style={{ color: "var(--csoai-text)" }}>
                  {link.label}
                </div>
                <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>
                  {link.desc}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

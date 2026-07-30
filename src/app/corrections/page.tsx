"use client";

import { useState, useEffect } from "react";
import { fetchDecisionRecords } from "@/lib/d1-client";
import type { DecisionRecord } from "@/lib/types";

export default function CorrectionsPage() {
  const [corrections, setCorrections] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDecisionRecords({ kind: "correction" })
      .then((data) => {
        setCorrections(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load corrections");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse" style={{ color: "var(--csoai-muted)" }}>Loading corrections...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-4 rounded-lg border" style={{ borderColor: "var(--csoai-red)", background: "rgba(239,68,68,0.1)" }}>
            <div style={{ color: "var(--csoai-red)" }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--csoai-text)" }}>
          Corrections
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--csoai-muted)" }}>
          Permanent, public. Every correction is a signed decision record that supersedes the original.
          The history of being wrong <em>is</em> the ledger.
        </p>

        {/* Corrections from data layer */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--csoai-text)" }}>
            Published Corrections
          </h2>
          {corrections.length === 0 ? (
            <div className="p-6 rounded-lg border" style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}>
              <div style={{ color: "var(--csoai-muted)" }}>No corrections published yet.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {corrections.map((record) => (
                <div
                  key={record.record_id}
                  className="p-6 rounded-lg border"
                  style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-sm" style={{ color: "var(--csoai-muted)" }}>
                      {record.record_id}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ background: "rgba(234,179,8,0.1)", color: "var(--csoai-amber)" }}
                    >
                      {record.kind}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-xs"
                      style={{
                        background: record.verdict === "OPEN" ? "rgba(234,179,8,0.1)" : "rgba(34,197,94,0.1)",
                        color: record.verdict === "OPEN" ? "var(--csoai-amber)" : "var(--csoai-green)",
                      }}
                    >
                      {record.verdict}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="font-semibold mb-1" style={{ color: "var(--csoai-text)" }}>
                      {record.claim}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium mb-1" style={{ color: "var(--csoai-muted)" }}>
                      Evidence
                    </div>
                    <div className="text-sm" style={{ color: "var(--csoai-text)" }}>
                      {record.evidence}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs" style={{ color: "var(--csoai-muted)" }}>
                    <span>Decided by: {record.decided_by}</span>
                    <span>Date: {record.decided_on}</span>
                    {record.sigil_link && <span>Signed: {record.sigil_link}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* The Discipline */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--csoai-text)" }}>
            The Discipline
          </h2>
          <div
            className="p-6 rounded-lg border"
            style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
          >
            <ul className="space-y-3 text-sm" style={{ color: "var(--csoai-text)" }}>
              <li>
                <strong>Never delete. Always supersede.</strong> A wrong record stays in the chain
                with <code>superseded_by</code> set. The history of being wrong <em>is</em> the ledger.
              </li>
              <li>
                <strong>A tag may never be dropped or upgraded silently.</strong> [LEAD] → [MEASURED] requires
                a new record with <code>supersedes</code> and a <code>method_ref</code>.
              </li>
              <li>
                <strong>n &lt; 20 forces lower_bound: true.</strong> Structurally set, not remembered.
              </li>
              <li>
                <strong>Contradiction is surfaced, never resolved automatically.</strong> Two live records
                with opposing verdicts → both get <code>contested_by</code> and render as OPEN.
              </li>
            </ul>
          </div>
        </section>

        {/* Self-Scoring Disclosure */}
        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--csoai-text)" }}>
            Self-Scoring Disclosure
          </h2>
          <div
            className="p-6 rounded-lg border"
            style={{ borderColor: "var(--csoai-accent)", background: "rgba(59,130,246,0.1)" }}
          >
            <p className="text-sm" style={{ color: "var(--csoai-text)" }}>
              MEOK&apos;s own systems appear on the public board, scored by the same harness, the same items
              and the same predicates as everyone else, with training provenance published. We do not exempt ourselves.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { fetchDecisionRecords } from "@/lib/d1-client";
import type { DecisionRecord } from "@/lib/types";

const KIND_COLORS: Record<string, string> = {
  refutation: "var(--csoai-red)",
  claim: "var(--csoai-green)",
  correction: "var(--csoai-amber)",
  settled: "var(--csoai-muted)",
  law: "var(--csoai-accent)",
  definition: "var(--csoai-accent)",
  blocked: "var(--csoai-red)",
};

const VERDICT_BADGES: Record<string, { bg: string; text: string }> = {
  REFUTED: { bg: "rgba(239,68,68,0.1)", text: "var(--csoai-red)" },
  CONFIRMED: { bg: "rgba(34,197,94,0.1)", text: "var(--csoai-green)" },
  SETTLED: { bg: "rgba(100,116,139,0.1)", text: "var(--csoai-muted)" },
  OPEN: { bg: "rgba(234,179,8,0.1)", text: "var(--csoai-amber)" },
  SUPERSEDED: { bg: "rgba(100,116,139,0.1)", text: "var(--csoai-muted)" },
};

export default function LedgerPage() {
  const [records, setRecords] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchDecisionRecords()
      .then(setRecords)
      .catch(() => setError("Failed to load ledger records"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  const filtered = filter === "all"
    ? records
    : records.filter(r => r.kind === filter || r.verdict === filter);

  const stats = {
    total: records.length,
    refutations: records.filter(r => r.kind === "refutation" && r.verdict === "REFUTED").length,
    selfKilled: records.filter(r => r.kind === "refutation" && r.verdict === "REFUTED" && r.decided_by === "lane").length,
    open: records.filter(r => r.verdict === "OPEN").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--csoai-border)", borderTopColor: "var(--csoai-accent)" }} />
          <div className="mt-3 text-sm" style={{ color: "var(--csoai-muted)" }}>Loading ledger...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-sm mb-3" style={{ color: "var(--csoai-red)" }}>{error}</div>
          <button onClick={load} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--csoai-accent)", color: "white" }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--csoai-text)" }}>
            Refutation Ledger
          </h1>
          <p className="text-lg" style={{ color: "var(--csoai-muted)" }}>
            {stats.refutations} published refutations — {stats.selfKilled} killed our own bets.
            The moat: a competitor copies a feature list in a week; they will not publish the experiment that kills their own thesis.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Records", value: stats.total },
            { label: "Refutations", value: stats.refutations },
            { label: "Self-Killed", value: stats.selfKilled },
            { label: "Open Issues", value: stats.open },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-lg border text-center"
              style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
            >
              <div className="text-2xl font-bold" style={{ color: "var(--csoai-accent)" }}>
                {stat.value}
              </div>
              <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "refutation", "claim", "correction", "settled", "law", "definition", "blocked"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 text-sm rounded-md transition-colors"
              style={{
                background: filter === f ? "var(--csoai-accent)" : "var(--csoai-surface)",
                color: filter === f ? "white" : "var(--csoai-muted)",
                border: `1px solid ${filter === f ? "var(--csoai-accent)" : "var(--csoai-border)"}`,
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Records */}
        <div className="space-y-4">
          {filtered.map((record) => (
            <div
              key={record.record_id}
              className="border rounded-lg overflow-hidden"
              style={{ borderColor: "var(--csoai-border)" }}
            >
              {/* Header */}
              <div
                className="p-4 cursor-pointer flex items-start justify-between"
                style={{ background: "var(--csoai-surface)" }}
                onClick={() => setExpanded(expanded === record.record_id ? null : record.record_id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm" style={{ color: "var(--csoai-muted)" }}>
                      {record.record_id}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        background: VERDICT_BADGES[record.verdict]?.bg || "var(--csoai-surface)",
                        color: VERDICT_BADGES[record.verdict]?.text || "var(--csoai-muted)",
                      }}
                    >
                      {record.verdict}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-xs"
                      style={{
                        background: `${KIND_COLORS[record.kind]}20`,
                        color: KIND_COLORS[record.kind],
                      }}
                    >
                      {record.kind}
                    </span>
                    {record.tag && (
                      <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          background: record.tag === "REFUTED" ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
                          color: record.tag === "REFUTED" ? "var(--csoai-red)" : "var(--csoai-green)",
                        }}
                      >
                        [{record.tag}]
                      </span>
                    )}
                  </div>
                  <div className="font-medium" style={{ color: "var(--csoai-text)" }}>
                    {record.claim}
                  </div>
                </div>
                <div className="text-sm ml-4" style={{ color: "var(--csoai-muted)" }}>
                  {expanded === record.record_id ? "▲" : "▼"}
                </div>
              </div>

              {/* Expanded content */}
              {expanded === record.record_id && (
                <div className="p-4 border-t" style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-bg)" }}>
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-1" style={{ color: "var(--csoai-muted)" }}>
                      Evidence
                    </div>
                    <div className="text-sm" style={{ color: "var(--csoai-text)" }}>
                      {record.evidence}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {record.n && (
                      <div>
                        <div style={{ color: "var(--csoai-muted)" }}>n</div>
                        <div style={{ color: "var(--csoai-text)" }}>
                          {record.n}{record.lower_bound ? " (lower bound)" : ""}
                        </div>
                      </div>
                    )}
                    {record.interval && (
                      <div>
                        <div style={{ color: "var(--csoai-muted)" }}>95% CI</div>
                        <div style={{ color: "var(--csoai-text)" }}>{record.interval}</div>
                      </div>
                    )}
                    <div>
                      <div style={{ color: "var(--csoai-muted)" }}>Decided by</div>
                      <div style={{ color: "var(--csoai-text)" }}>{record.decided_by}</div>
                    </div>
                    <div>
                      <div style={{ color: "var(--csoai-muted)" }}>Date</div>
                      <div style={{ color: "var(--csoai-text)" }}>{record.decided_on}</div>
                    </div>
                  </div>

                  {record.sigil_link && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--csoai-border)" }}>
                      <div className="text-xs" style={{ color: "var(--csoai-muted)" }}>
                        Signed: {record.sigil_link}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-8 p-4 rounded-lg" style={{ background: "var(--csoai-surface)" }}>
          <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>
            <strong>The discipline:</strong> A wrong record stays in the chain with <code>superseded_by</code> set.
            The history of being wrong <em>is</em> the ledger. Deletion would destroy the moat.
          </div>
        </div>
      </div>
    </div>
  );
}

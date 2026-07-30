"use client";

import { useState } from "react";
import type { JRecord } from "@/lib/types";
import { verifyChain } from "@/lib/verify";

interface JSpacePanelProps {
  record: JRecord;
  compact?: boolean;
}

const VERDICT_COLORS = {
  PASS: "var(--csoai-green)",
  FAIL: "var(--csoai-red)",
  INCOMPLETE: "var(--csoai-amber)",
  UNKNOWN: "var(--csoai-muted)",
};

export default function JSpacePanel({ record, compact = false }: JSpacePanelProps) {
  const [verifyState, setVerifyState] = useState<{
    loading: boolean;
    result?: { valid: boolean; message: string };
  }>({ loading: false });

  const handleVerify = async () => {
    setVerifyState({ loading: true });
    const result = await verifyChain([record]);
    setVerifyState({ loading: false, result });
  };

  const verdictColor = VERDICT_COLORS[record.verdict];

  return (
    <div
      className="rounded-lg border font-mono text-sm"
      style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
    >
      <div className="px-4 py-2 border-b" style={{ borderColor: "var(--csoai-border)" }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--csoai-muted)" }}>
          J-Space Panel
        </span>
        <span className="ml-2 text-xs" style={{ color: "var(--csoai-muted)" }}>
          record #{record.chain_index}
        </span>
      </div>

      <div className="p-4 space-y-2">
        {/* 1. Anchored */}
        <div className="flex gap-2">
          <span style={{ color: "var(--csoai-accent)" }}>&#9656;</span>
          <span style={{ color: "var(--csoai-muted)" }}>anchored</span>
          <span>
            {record.anchor.instrument} {record.anchor.provision}
            {" "}&middot;{" "}
            <span className="text-xs" style={{ color: "var(--csoai-muted)" }}>
              corpus_hash {record.anchor.corpus_hash.slice(0, 8)}&hellip;{record.anchor.corpus_hash.slice(-4)}
            </span>
          </span>
        </div>

        {/* 2. Probe sent */}
        <div className="flex gap-2">
          <span style={{ color: "var(--csoai-accent)" }}>&#9656;</span>
          <span style={{ color: "var(--csoai-muted)" }}>probe sent</span>
          <span>
            {record.subject.model}
            {record.harness && (
              <> &middot; seed {record.harness.seed} &middot; temp {record.harness.temperature}</>
            )}
          </span>
        </div>

        {/* 3. Response */}
        {!compact && (
          <div className="flex gap-2">
            <span style={{ color: "var(--csoai-accent)" }}>&#9656;</span>
            <span style={{ color: "var(--csoai-muted)" }}>response</span>
            <span className="truncate max-w-md" style={{ color: "var(--csoai-muted)" }}>
              {record.response.slice(0, 80)}{record.response.length > 80 ? "..." : ""}
            </span>
          </div>
        )}

        {/* 4. Predicate */}
        <div className="flex gap-2">
          <span style={{ color: "var(--csoai-accent)" }}>&#9656;</span>
          <span style={{ color: "var(--csoai-muted)" }}>predicate</span>
          <span>
            {record.predicate.type}
            {" "}&rarr;{" "}
            <span style={{ color: "var(--csoai-text)" }}>{record.predicate.reason}</span>
            {" "}
            <span className="text-xs" style={{ color: "var(--csoai-muted)" }}>
              pointer: {record.predicate.pointer}
            </span>
          </span>
        </div>

        {/* 5. Verdict */}
        <div className="flex gap-2">
          <span style={{ color: "var(--csoai-accent)" }}>&#9656;</span>
          <span style={{ color: "var(--csoai-muted)" }}>verdict</span>
          <span className="font-semibold" style={{ color: verdictColor }}>
            {record.verdict}
          </span>
          <span style={{ color: "var(--csoai-muted)" }}>&middot; deterministic</span>
        </div>

        {/* 6. Budget (actor mode) */}
        {record.budget && (
          <div className="flex gap-2">
            <span style={{ color: "var(--csoai-accent)" }}>&#9656;</span>
            <span style={{ color: "var(--csoai-muted)" }}>budget</span>
            <span>
              step_cap {record.budget.step_cap} &middot; steps_used {record.budget.steps_used}
            </span>
          </div>
        )}

        {/* 7. Signed */}
        <div className="flex gap-2 items-center">
          <span style={{ color: "var(--csoai-accent)" }}>&#9656;</span>
          <span style={{ color: "var(--csoai-muted)" }}>signed</span>
          <span>
            J-record #{record.chain_index.toLocaleString()} &middot; {record.sigil_link}
          </span>
          <button
            onClick={handleVerify}
            disabled={verifyState.loading}
            className="ml-2 px-2 py-0.5 text-xs rounded border transition-colors"
            style={{
              borderColor: "var(--csoai-border)",
              color: "var(--csoai-accent)",
              background: "transparent",
            }}
          >
            {verifyState.loading ? "verifying..." : "verify \u2193"}
          </button>
        </div>

        {/* Verify result */}
        {verifyState.result && (
          <div
            className="ml-6 mt-1 p-2 rounded text-xs"
            style={{
              background: verifyState.result.valid ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              color: verifyState.result.valid ? "var(--csoai-green)" : "var(--csoai-red)",
            }}
          >
            {verifyState.result.valid ? "\u2713" : "\u2717"} {verifyState.result.message}
            <div className="mt-1 text-xs" style={{ color: "var(--csoai-muted)" }}>
              This verifies tamper-evidence, not authenticity. Ed25519 signature verification: production upgrade.
            </div>
          </div>
        )}

        {/* INCOMPLETE state */}
        {record.verdict === "INCOMPLETE" && (
          <div
            className="ml-6 mt-1 p-2 rounded text-xs"
            style={{ background: "rgba(245,158,11,0.1)", color: "var(--csoai-amber)" }}
          >
            passed: null &middot; step-cap exhaustion &middot; never PASS on an incomplete path
          </div>
        )}
      </div>
    </div>
  );
}

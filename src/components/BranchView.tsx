"use client";

import type { JRecord } from "@/lib/types";

interface Branch {
  id: string;
  name: string;
  records: JRecord[];
  divergedAt?: number;
}

interface BranchViewProps {
  branches: Branch[];
  onSelect?: (branch: Branch) => void;
}

export default function BranchView({ branches, onSelect }: BranchViewProps) {
  // Find divergence point
  const findDivergence = () => {
    if (branches.length < 2) return null;

    for (let i = 0; i < Math.max(...branches.map(b => b.records.length)); i++) {
      const verdicts = branches.map(b => b.records[i]?.verdict);
      const unique = new Set(verdicts);
      if (unique.size > 1) return i;
    }
    return null;
  };

  const divergencePoint = findDivergence();

  return (
    <div
      className="p-4 rounded-lg border"
      style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium" style={{ color: "var(--csoai-text)" }}>
          Branch View — Simulation
        </div>
        <div className="text-xs" style={{ color: "var(--csoai-muted)" }}>
          Deterministic replay across declared branches
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="border rounded-lg overflow-hidden cursor-pointer transition-opacity hover:opacity-90"
            style={{ borderColor: "var(--csoai-border)" }}
            onClick={() => onSelect?.(branch)}
          >
            <div className="p-3" style={{ background: "var(--csoai-bg)" }}>
              <div className="font-medium text-sm" style={{ color: "var(--csoai-text)" }}>
                {branch.name}
              </div>
            </div>

            <div className="p-3 space-y-2">
              {branch.records.map((record, i) => {
                const isDivergence = divergencePoint !== null && i === divergencePoint;

                return (
                  <div
                    key={record.record_id}
                    className="flex items-center gap-2 text-xs"
                    style={{
                      background: isDivergence ? "rgba(239,68,68,0.1)" : "transparent",
                      padding: isDivergence ? "4px" : "0",
                      borderRadius: isDivergence ? "4px" : "0",
                    }}
                  >
                    <span style={{ color: "var(--csoai-accent)" }}>▸</span>
                    <span style={{ color: "var(--csoai-muted)" }}>
                      {record.predicate.type}
                    </span>
                    <span
                      className="font-medium"
                      style={{
                        color: record.verdict === "PASS" ? "var(--csoai-green)" :
                               record.verdict === "FAIL" ? "var(--csoai-red)" :
                               "var(--csoai-amber)",
                      }}
                    >
                      {record.verdict}
                    </span>
                    {isDivergence && (
                      <span style={{ color: "var(--csoai-red)" }}>
                        ← divergence
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Divergence summary */}
      {divergencePoint !== null && (
        <div
          className="mt-4 p-3 rounded-lg"
          style={{ background: "rgba(239,68,68,0.1)" }}
        >
          <div className="text-sm" style={{ color: "var(--csoai-red)" }}>
            Divergence at step {divergencePoint + 1}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--csoai-muted)" }}>
            The human chooses. Article 14 is the only judgement in the loop.
          </div>
        </div>
      )}

      {/* Discipline */}
      <div className="mt-4 text-xs" style={{ color: "var(--csoai-muted)" }}>
        <strong>What it is not:</strong> Not prediction. Not a vote. Not resolution.
        Divergence is shown, never adjudicated.
      </div>
    </div>
  );
}

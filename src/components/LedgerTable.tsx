"use client";

import { useState } from "react";
import type { DecisionRecord, DecisionKind, DecisionVerdict, Tag } from "@/lib/types";
import SpectrumBadge from "./SpectrumBadge";

const VERDICT_COLORS: Record<DecisionVerdict, string> = {
  REFUTED: "var(--csoai-red)",
  CONFIRMED: "var(--csoai-green)",
  SETTLED: "var(--csoai-accent)",
  SUPERSEDED: "var(--csoai-muted)",
  OPEN: "var(--csoai-amber)",
};

interface LedgerTableProps {
  records: DecisionRecord[];
  showFilters?: boolean;
}

export default function LedgerTable({ records, showFilters = true }: LedgerTableProps) {
  const [filterKind, setFilterKind] = useState<DecisionKind | "all">("all");
  const [filterVerdict, setFilterVerdict] = useState<DecisionVerdict | "all">("all");
  const [filterTag, setFilterTag] = useState<Tag | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = records.filter((r) => {
    if (filterKind !== "all" && r.kind !== filterKind) return false;
    if (filterVerdict !== "all" && r.verdict !== filterVerdict) return false;
    if (filterTag !== "all" && r.tag !== filterTag) return false;
    return true;
  });

  const kinds: DecisionKind[] = ["refutation", "claim", "correction", "settled", "law", "definition", "blocked"];
  const verdicts: DecisionVerdict[] = ["REFUTED", "CONFIRMED", "SETTLED", "SUPERSEDED", "OPEN"];
  const tags: Tag[] = ["MEASURED", "LEAD", "GREENFIELD", "VENDOR", "REFUTED"];

  return (
    <div>
      {showFilters && (
        <div className="flex flex-wrap gap-4 mb-6 p-4 rounded-lg border" style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}>
          <FilterGroup label="Kind" value={filterKind} onChange={setFilterKind} options={kinds} allLabel="All kinds" />
          <FilterGroup label="Verdict" value={filterVerdict} onChange={setFilterVerdict} options={verdicts} allLabel="All verdicts" />
          <FilterGroup label="Tag" value={filterTag} onChange={setFilterTag} options={tags} allLabel="All tags" />
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((record) => (
          <div
            key={record.record_id}
            className="p-4 rounded-lg border cursor-pointer transition-opacity hover:opacity-90"
            style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
            onClick={() => setExpanded(expanded === record.record_id ? null : record.record_id)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs" style={{ color: "var(--csoai-muted)" }}>
                  {record.record_id}
                </span>
                {record.tag && <SpectrumBadge tag={record.tag} />}
                <span
                  className="px-2 py-0.5 text-xs rounded"
                  style={{ background: `${VERDICT_COLORS[record.verdict]}20`, color: VERDICT_COLORS[record.verdict] }}
                >
                  {record.verdict}
                </span>
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--csoai-bg)", color: "var(--csoai-muted)" }}>
                  {record.kind}
                </span>
              </div>
              <span className="text-xs" style={{ color: "var(--csoai-muted)" }}>
                {record.decided_on} &middot; {record.decided_by}
              </span>
            </div>

            <h3 className="font-medium mb-1">{record.claim}</h3>

            {expanded === record.record_id && (
              <div className="mt-3 space-y-2">
                <p className="text-sm" style={{ color: "var(--csoai-muted)" }}>{record.evidence}</p>

                {(record.n || record.interval) && (
                  <div className="flex items-center gap-3 text-xs font-mono" style={{ color: "var(--csoai-muted)" }}>
                    {record.n && <span>n={record.n}</span>}
                    {record.interval && <span>{record.interval}</span>}
                    {record.lower_bound && (
                      <span style={{ color: "var(--csoai-amber)" }}>lower bound</span>
                    )}
                  </div>
                )}

                {record.contested_by && record.contested_by.length > 0 && (
                  <div className="text-xs" style={{ color: "var(--csoai-amber)" }}>
                    contested by: {record.contested_by.join(", ")}
                  </div>
                )}

                {record.sigil_link && (
                  <div className="text-xs font-mono" style={{ color: "var(--csoai-muted)" }}>
                    sigil: {record.sigil_link}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-sm" style={{ color: "var(--csoai-muted)" }}>
          No records match the current filters.
        </div>
      )}
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: T | "all";
  onChange: (v: T | "all") => void;
  options: T[];
  allLabel: string;
}) {
  return (
    <div>
      <label className="text-xs block mb-1" style={{ color: "var(--csoai-muted)" }}>{label}</label>
      <div className="flex gap-1 flex-wrap">
        <FilterButton active={value === "all"} onClick={() => onChange("all")}>{allLabel}</FilterButton>
        {options.map((opt) => (
          <FilterButton key={opt} active={value === opt} onClick={() => onChange(opt)}>
            {opt}
          </FilterButton>
        ))}
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="px-2 py-1 text-xs rounded transition-colors"
      style={{
        background: active ? "rgba(59,130,246,0.2)" : "var(--csoai-bg)",
        color: active ? "var(--csoai-accent)" : "var(--csoai-muted)",
        border: active ? "1px solid var(--csoai-accent)" : "1px solid var(--csoai-border)",
      }}
    >
      {children}
    </button>
  );
}

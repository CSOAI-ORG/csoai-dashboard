"use client";

import { useState, useEffect } from "react";
import { fetchGapCells } from "@/lib/d1-client";
import type { GapCell, Axis, Mode, CoverageStatus } from "@/lib/types";
import { AXES, MODES } from "@/lib/constants";

const COVERAGE_COLORS: Record<string, string> = {
  covered: "var(--csoai-green)",
  partial: "var(--csoai-amber)",
  absent: "var(--csoai-red)",
  queued: "var(--csoai-accent)",
};

const COVERAGE_SYMBOLS: Record<string, string> = {
  covered: "\u2713",
  partial: "~",
  absent: "\u2717",
  queued: "\u25CB",
};

const GAP_REASONS: Record<string, string> = {
  no_benchmark: "No benchmark exists",
  wrong_granularity: "Wrong granularity",
  speaker_only: "Speaker-only coverage",
  bare_model_only: "Bare model only",
  judgement_based: "Judgement-based",
};

export default function GapPage() {
  const [cells, setCells] = useState<GapCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAxis, setFilterAxis] = useState<Axis | "all">("all");
  const [filterMode, setFilterMode] = useState<Mode | "all">("all");
  const [filterCoverage, setFilterCoverage] = useState<CoverageStatus | "all">("all");

  const load = () => {
    setLoading(true);
    setError(null);
    fetchGapCells()
      .then(setCells)
      .catch(() => setError("Failed to load gap data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = cells.filter((c) => {
    if (filterAxis !== "all" && c.axis !== filterAxis) return false;
    if (filterMode !== "all" && c.mode !== filterMode) return false;
    if (filterCoverage !== "all" && c.field_coverage !== filterCoverage) return false;
    return true;
  });

  const absent = cells.filter((c) => c.field_coverage === "absent").length;
  const partial = cells.filter((c) => c.field_coverage === "partial").length;
  const covered = cells.filter((c) => c.field_coverage === "covered").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--csoai-border)", borderTopColor: "var(--csoai-accent)" }} />
          <div className="mt-3 text-sm" style={{ color: "var(--csoai-muted)" }}>Loading gap map...</div>
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gap Map</h1>
        <p className="text-lg" style={{ color: "var(--csoai-muted)" }}>
          <span style={{ color: "var(--csoai-red)" }}>{absent}</span> of {cells.length} measured cells have{" "}
          <strong>no field coverage</strong> — no benchmark anywhere measures this provision.
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--csoai-amber)" }}>
          field_coverage is the headline. gspc_coverage is internal only.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Absent (blind spots)", count: absent, color: "var(--csoai-red)" },
          { label: "Partial", count: partial, color: "var(--csoai-amber)" },
          { label: "Covered", count: covered, color: "var(--csoai-green)" },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-lg border"
            style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
          >
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</div>
            <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 rounded-lg border" style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}>
        <div>
          <label className="text-xs block mb-1" style={{ color: "var(--csoai-muted)" }}>Axis</label>
          <div className="flex gap-1">
            <FilterButton active={filterAxis === "all"} onClick={() => setFilterAxis("all")}>All</FilterButton>
            {AXES.map((a) => (
              <FilterButton key={a.id} active={filterAxis === a.id} onClick={() => setFilterAxis(a.id)}>
                {a.id[0].toUpperCase()}
              </FilterButton>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: "var(--csoai-muted)" }}>Mode</label>
          <div className="flex gap-1">
            <FilterButton active={filterMode === "all"} onClick={() => setFilterMode("all")}>All</FilterButton>
            {MODES.map((m) => (
              <FilterButton key={m.id} active={filterMode === m.id} onClick={() => setFilterMode(m.id)}>
                {m.label}
              </FilterButton>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: "var(--csoai-muted)" }}>Coverage</label>
          <div className="flex gap-1">
            <FilterButton active={filterCoverage === "all"} onClick={() => setFilterCoverage("all")}>All</FilterButton>
            {(["absent", "partial", "covered"] as const).map((s) => (
              <FilterButton key={s} active={filterCoverage === s} onClick={() => setFilterCoverage(s)}>
                {s[0].toUpperCase() + s.slice(1)}
              </FilterButton>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--csoai-border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--csoai-surface)" }}>
              <th className="text-left p-3 text-xs font-semibold" style={{ color: "var(--csoai-muted)" }}>Provision</th>
              <th className="text-left p-3 text-xs font-semibold" style={{ color: "var(--csoai-muted)" }}>Instrument</th>
              <th className="text-left p-3 text-xs font-semibold" style={{ color: "var(--csoai-muted)" }}>Axis</th>
              <th className="text-left p-3 text-xs font-semibold" style={{ color: "var(--csoai-muted)" }}>Mode</th>
              <th className="text-center p-3 text-xs font-semibold" style={{ color: "var(--csoai-muted)" }}>Field</th>
              <th className="text-center p-3 text-xs font-semibold" style={{ color: "var(--csoai-muted)" }}>GSPC</th>
              <th className="text-left p-3 text-xs font-semibold" style={{ color: "var(--csoai-muted)" }}>Gap Reason</th>
              <th className="text-left p-3 text-xs font-semibold" style={{ color: "var(--csoai-muted)" }}>Source</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cell, i) => (
              <tr key={i} className="border-t transition-colors hover:opacity-90" style={{ borderColor: "var(--csoai-border)" }}>
                <td className="p-3 font-mono text-xs">{cell.provision}</td>
                <td className="p-3 text-xs" style={{ color: "var(--csoai-muted)" }}>{cell.instrument}</td>
                <td className="p-3">
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(59,130,246,0.15)", color: "var(--csoai-accent)" }}>
                    {cell.axis[0].toUpperCase()}
                  </span>
                </td>
                <td className="p-3 text-xs" style={{ color: "var(--csoai-muted)" }}>{cell.mode}</td>
                <td className="p-3 text-center">
                  <CoverageBadge status={cell.field_coverage} />
                </td>
                <td className="p-3 text-center">
                  <CoverageBadge status={cell.gspc_coverage} />
                </td>
                <td className="p-3 text-xs" style={{ color: cell.gap_reason ? "var(--csoai-amber)" : "var(--csoai-muted)" }}>
                  {cell.gap_reason ? GAP_REASONS[cell.gap_reason] || cell.gap_reason : "—"}
                </td>
                <td className="p-3 text-xs" style={{ color: "var(--csoai-muted)" }}>
                  {cell.field_source || "—"}
                  {cell.field_granularity && (
                    <span className="ml-1 text-xs" style={{ color: "var(--csoai-amber)" }}>({cell.field_granularity})</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-sm" style={{ color: "var(--csoai-muted)" }}>
          No cells match the current filters.
        </div>
      )}

      <div className="mt-4 text-xs" style={{ color: "var(--csoai-muted)" }}>
        Showing {filtered.length} of {cells.length} cells
      </div>
    </div>
  );
}

function CoverageBadge({ status }: { status: string }) {
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
      style={{
        background: `${COVERAGE_COLORS[status] || "var(--csoai-muted)"}20`,
        color: COVERAGE_COLORS[status] || "var(--csoai-muted)",
      }}
      title={status}
    >
      {COVERAGE_SYMBOLS[status] || "?"}
    </span>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
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

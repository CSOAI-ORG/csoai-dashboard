"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchJRecords } from "@/lib/d1-client";
import JSpacePanel from "@/components/JSpacePanel";
import McpToolCard from "@/components/McpToolCard";
import SpectrumView from "@/components/SpectrumView";
import BranchView from "@/components/BranchView";
import type { JRecord } from "@/lib/types";

export default function ArenaPage() {
  const [selectedAxis, setSelectedAxis] = useState<string>("safety");
  const [selectedMode, setSelectedMode] = useState<string>("speaker");
  const [selectedRecord, setSelectedRecord] = useState<JRecord | null>(null);
  const [records, setRecords] = useState<JRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchJRecords()
      .then(setRecords)
      .catch(() => setError("Failed to load arena records"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = records.filter(r =>
    (selectedAxis === "all" || r.axis === selectedAxis) &&
    (selectedMode === "all" || r.mode === selectedMode)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--csoai-border)", borderTopColor: "var(--csoai-accent)" }} />
          <div className="mt-3 text-sm" style={{ color: "var(--csoai-muted)" }}>Loading arena...</div>
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--csoai-text)" }}>
            The Arena
          </h1>
          <p className="text-lg" style={{ color: "var(--csoai-muted)" }}>
            Probe · response · verdict · live J-space panel.
            Every zoom bottoms out in a signed record with a working verify button.
          </p>
          {/* Globe context link */}
          <div className="mt-2">
            <Link
              href="/"
              className="text-sm underline"
              style={{ color: "var(--csoai-accent)" }}
            >
              ← Back to SovSpace globe
            </Link>
            <span className="text-sm ml-2" style={{ color: "var(--csoai-muted)" }}>
              The cell being probed is lit in context
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Probe Configuration */}
            <div
              className="border rounded-lg p-4"
              style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
            >
              <h3 className="font-semibold mb-4" style={{ color: "var(--csoai-text)" }}>
                Probe Configuration
              </h3>

              {/* Axis selector */}
              <div className="mb-4">
                <label className="text-sm mb-2 block" style={{ color: "var(--csoai-muted)" }}>Axis</label>
                <div className="grid grid-cols-2 gap-2">
                  {["governance", "safety", "provenance", "continuity"].map((axis) => (
                    <button
                      key={axis}
                      onClick={() => setSelectedAxis(axis)}
                      className="px-3 py-2 text-sm rounded-md transition-colors"
                      style={{
                        background: selectedAxis === axis ? "var(--csoai-accent)" : "var(--csoai-bg)",
                        color: selectedAxis === axis ? "white" : "var(--csoai-text)",
                      }}
                    >
                      {axis.charAt(0).toUpperCase() + axis.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode selector */}
              <div className="mb-4">
                <label className="text-sm mb-2 block" style={{ color: "var(--csoai-muted)" }}>Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {["speaker", "actor"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSelectedMode(mode)}
                      className="px-3 py-2 text-sm rounded-md transition-colors"
                      style={{
                        background: selectedMode === mode ? "var(--csoai-accent)" : "var(--csoai-bg)",
                        color: selectedMode === mode ? "white" : "var(--csoai-text)",
                      }}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* MCP Tool Cards */}
              <div className="mb-4">
                <label className="text-sm mb-2 block" style={{ color: "var(--csoai-muted)" }}>
                  MCP Tools (declared)
                </label>
                <div className="space-y-2">
                  <McpToolCard
                    name="search"
                    description="Search the knowledge base"
                    permitted={true}
                    isTrap={false}
                    callsUsed={2}
                  />
                  <McpToolCard
                    name="database_write"
                    description="Write to database"
                    permitted={true}
                    isTrap={false}
                    callsUsed={0}
                  />
                  <McpToolCard
                    name="biometric_categorise"
                    description="Categorize biometric data"
                    permitted={false}
                    isTrap={true}
                    trapProvision="Art 5(1)(f)"
                  />
                </div>
              </div>
            </div>

            {/* Spectrum View */}
            <SpectrumView />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* J-Records List */}
            <div className="space-y-4 mb-6">
              {filtered.map((record) => (
                <div
                  key={record.record_id}
                  className="border rounded-lg overflow-hidden cursor-pointer transition-opacity hover:opacity-90"
                  style={{
                    borderColor: selectedRecord?.record_id === record.record_id ? "var(--csoai-accent)" : "var(--csoai-border)",
                    background: "var(--csoai-surface)",
                  }}
                  onClick={() => setSelectedRecord(record)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm" style={{ color: "var(--csoai-muted)" }}>
                          {record.record_id}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            background: record.verdict === "PASS" ? "rgba(34,197,94,0.1)" :
                                       record.verdict === "FAIL" ? "rgba(239,68,68,0.1)" :
                                       "rgba(234,179,8,0.1)",
                            color: record.verdict === "PASS" ? "var(--csoai-green)" :
                                   record.verdict === "FAIL" ? "var(--csoai-red)" :
                                   "var(--csoai-amber)",
                          }}
                        >
                          {record.verdict}
                        </span>
                        <span className="text-xs" style={{ color: "var(--csoai-muted)" }}>
                          {record.axis} · {record.mode}
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: "var(--csoai-muted)" }}>
                        {record.subject.model}
                      </span>
                    </div>

                    <div className="text-sm mb-2" style={{ color: "var(--csoai-text)" }}>
                      {record.predicate.reason}
                    </div>

                    <div className="flex items-center gap-4 text-xs" style={{ color: "var(--csoai-muted)" }}>
                      <span>{record.anchor.instrument} · {record.anchor.provision}</span>
                      {record.budget && (
                        <span>budget: {record.budget.steps_used}/{record.budget.step_cap}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* J-Space Panel (the moat) */}
            {selectedRecord && (
              <JSpacePanel record={selectedRecord} />
            )}
          </div>
        </div>

        {/* Branch View — Simulation Divergence */}
        {selectedRecord?.mode === "actor" && (
          <div className="mt-8">
            <BranchView
              branches={[
                {
                  id: "compliant",
                  name: "Compliant Path",
                  records: records.filter(r => r.mode === "actor" && r.verdict === "PASS"),
                },
                {
                  id: "violating",
                  name: "Violating Path",
                  records: records.filter(r => r.mode === "actor" && r.verdict === "FAIL"),
                },
                {
                  id: "incomplete",
                  name: "Incomplete Path",
                  records: records.filter(r => r.mode === "actor" && r.verdict === "INCOMPLETE"),
                },
              ].filter(b => b.records.length > 0)}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 p-4 rounded-lg" style={{ background: "var(--csoai-surface)" }}>
          <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>
            <strong>The moat made visible:</strong> Watching it refuse to fake a pass is more persuasive than any claim about rigour.
            Seven lines, every one a fact with a pointer. INCOMPLETE renders visibly. Failure is as legible as success.
          </div>
        </div>
      </div>
    </div>
  );
}

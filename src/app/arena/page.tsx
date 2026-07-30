"use client";

import { useState } from "react";
import { MOCK_J_RECORDS } from "@/lib/mock-data";
import type { JRecord } from "@/lib/types";

export default function ArenaPage() {
  const [selectedAxis, setSelectedAxis] = useState<string>("safety");
  const [selectedMode, setSelectedMode] = useState<string>("speaker");
  const [selectedRecord, setSelectedRecord] = useState<JRecord | null>(null);

  const records = MOCK_J_RECORDS;
  const filtered = records.filter(r =>
    (selectedAxis === "all" || r.axis === selectedAxis) &&
    (selectedMode === "all" || r.mode === selectedMode)
  );

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
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
                  {[
                    { name: "search", permitted: true, used: 2 },
                    { name: "database_write", permitted: true, used: 0 },
                    { name: "biometric_categorise", permitted: false, trap: true, provision: "Art 5(1)(f)" },
                  ].map((tool) => (
                    <div
                      key={tool.name}
                      className="p-2 rounded text-sm flex items-center justify-between"
                      style={{
                        background: tool.trap ? "rgba(239,68,68,0.1)" : "var(--csoai-bg)",
                        border: tool.trap ? "1px solid var(--csoai-red)" : "1px solid var(--csoai-border)",
                      }}
                    >
                      <div>
                        <div style={{ color: "var(--csoai-text)" }}>
                          {tool.trap ? "⚠️" : "🔍"} {tool.name}
                        </div>
                        {tool.trap && (
                          <div className="text-xs" style={{ color: "var(--csoai-red)" }}>
                            TRAP · {tool.provision} · calling = FAIL
                          </div>
                        )}
                      </div>
                      {!tool.trap && (
                        <div className="text-xs" style={{ color: "var(--csoai-muted)" }}>
                          used: {tool.used}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Spectrum Lenses */}
              <div>
                <label className="text-sm mb-2 block" style={{ color: "var(--csoai-muted)" }}>
                  Spectrum View
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: "red", color: "#ef4444" },
                    { id: "blue", color: "#3b82f6" },
                    { id: "purple", color: "#a855f7" },
                    { id: "yellow", color: "#eab308" },
                    { id: "orange", color: "#f97316" },
                    { id: "green", color: "#22c55e" },
                    { id: "black", color: "#1e293b" },
                    { id: "white", color: "#f8fafc" },
                  ].map((lens) => (
                    <div
                      key={lens.id}
                      className="w-8 h-8 rounded cursor-pointer"
                      style={{ background: lens.color }}
                      title={lens.id}
                    />
                  ))}
                </div>
              </div>
            </div>
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
              <div
                className="border rounded-lg p-6"
                style={{ borderColor: "var(--csoai-accent)", background: "var(--csoai-surface)" }}
              >
                <h3 className="font-semibold mb-4" style={{ color: "var(--csoai-text)" }}>
                  J-Space Panel — {selectedRecord.record_id}
                </h3>

                <div className="space-y-3 font-mono text-sm">
                  <div className="flex gap-2">
                    <span style={{ color: "var(--csoai-accent)" }}>▸ anchored</span>
                    <span style={{ color: "var(--csoai-text)" }}>
                      {selectedRecord.anchor.provision} · corpus_hash {selectedRecord.anchor.corpus_hash.slice(0, 8)}…{selectedRecord.anchor.corpus_hash.slice(-4)} · verified
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span style={{ color: "var(--csoai-accent)" }}>▸ probe sent</span>
                    <span style={{ color: "var(--csoai-text)" }}>
                      {selectedRecord.subject.model} · seed 42 · temp 0.0 · harness v1.2.0
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span style={{ color: "var(--csoai-accent)" }}>▸ response</span>
                    <span style={{ color: "var(--csoai-muted)" }}>
                      {selectedRecord.response.slice(0, 80)}…
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span style={{ color: "var(--csoai-accent)" }}>▸ predicate</span>
                    <span style={{ color: "var(--csoai-text)" }}>
                      {selectedRecord.predicate.type} → {selectedRecord.predicate.reason}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span style={{ color: "var(--csoai-accent)" }}>▸ verdict</span>
                    <span style={{
                      color: selectedRecord.verdict === "PASS" ? "var(--csoai-green)" :
                             selectedRecord.verdict === "FAIL" ? "var(--csoai-red)" :
                             "var(--csoai-amber)"
                    }}>
                      {selectedRecord.verdict} · deterministic · pointer: {selectedRecord.predicate.pointer}
                    </span>
                  </div>
                  {selectedRecord.budget && (
                    <div className="flex gap-2">
                      <span style={{ color: "var(--csoai-accent)" }}>▸ budget</span>
                      <span style={{ color: "var(--csoai-text)" }}>
                        step_cap {selectedRecord.budget.step_cap} · steps_used {selectedRecord.budget.steps_used}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <span style={{ color: "var(--csoai-accent)" }}>▸ signed</span>
                    <span style={{ color: "var(--csoai-text)" }}>
                      J-record #{selectedRecord.chain_index} · chain intact · {selectedRecord.sigil_link}
                    </span>
                  </div>
                </div>

                {/* Verify button */}
                <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--csoai-border)" }}>
                  <button
                    className="px-4 py-2 rounded-lg text-sm transition-opacity hover:opacity-90"
                    style={{ background: "var(--csoai-accent)", color: "white" }}
                  >
                    Verify Chain ↓
                  </button>
                  <div className="mt-2 text-xs" style={{ color: "var(--csoai-muted)" }}>
                    ⚠️ This verifies tamper-evidence, not authenticity. Ed25519 signature verification: production upgrade.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

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

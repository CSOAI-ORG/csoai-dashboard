"use client";

import { SPECTRUM_LENSES } from "@/lib/constants";

interface SpectrumViewProps {
  scores?: Record<string, { value: number; n?: number; interval?: string }>;
}

export default function SpectrumView({ scores }: SpectrumViewProps) {
  return (
    <div
      className="p-4 rounded-lg border"
      style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium" style={{ color: "var(--csoai-text)" }}>
          Spectrum View
        </div>
        <div className="text-xs" style={{ color: "var(--csoai-muted)" }}>
          8 lenses, no composite
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SPECTRUM_LENSES.map((lens) => {
          const score = scores?.[lens.id];

          return (
            <div
              key={lens.id}
              className="p-3 rounded-lg"
              style={{ background: "var(--csoai-bg)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ background: lens.color }}
                />
                <span className="font-medium text-sm" style={{ color: "var(--csoai-text)" }}>
                  {lens.name}
                </span>
              </div>

              <div className="text-xs mb-2" style={{ color: "var(--csoai-muted)" }}>
                {lens.description}
              </div>

              {score ? (
                <div>
                  <div className="text-lg font-bold" style={{ color: lens.color }}>
                    {score.value}
                  </div>
                  {score.n && (
                    <div className="text-xs" style={{ color: "var(--csoai-muted)" }}>
                      n={score.n}{score.interval ? ` · ${score.interval}` : ""}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs" style={{ color: "var(--csoai-muted)" }}>
                  No score yet
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Purple highlight - the differentiator */}
      <div
        className="mt-4 p-3 rounded-lg"
        style={{ background: "rgba(168,85,247,0.1)", border: "1px solid var(--csoai-purple, #a855f7)" }}
      >
        <div className="text-sm font-medium" style={{ color: "var(--csoai-purple, #a855f7)" }}>
          Purple — the differentiator
        </div>
        <div className="text-xs" style={{ color: "var(--csoai-muted)" }}>
          Protection +34.84 AT 0.011 cost · the pair nobody else reports
        </div>
      </div>
    </div>
  );
}

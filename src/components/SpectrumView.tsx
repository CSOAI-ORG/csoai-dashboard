"use client";

import { SPECTRUM_LENSES } from "@/lib/constants";

const MOCK_SCORES: Record<string, { value: number; n: number; interval: string }> = {
  red: { value: 78.3, n: 31, interval: "[+17.50, +52.18]" },
  blue: { value: 0.667, n: 7, interval: "protection × (1 − over_block)" },
  purple: { value: 34.84, n: 31, interval: "[+17.50, +52.18]" },
  yellow: { value: 66.0, n: 12, interval: "[0, 22.1%]" },
  orange: { value: 44.1, n: 12, interval: "[0, 22.1%]" },
  green: { value: 52.7, n: 14, interval: "[+6.87, +32.41]" },
  black: { value: 43.7, n: 141, interval: "[+4.82, +14.03]" },
  white: { value: 83.7, n: 195, interval: "[+7.42, +17.00]" },
};

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
          8 lenses · no composite · each measured independently
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SPECTRUM_LENSES.map((lens) => {
          const data = scores?.[lens.id] ?? MOCK_SCORES[lens.id];

          return (
            <div
              key={lens.id}
              className="p-3 rounded-lg"
              style={{ background: "var(--csoai-bg)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: lens.color }}
                />
                <span className="font-medium text-sm" style={{ color: "var(--csoai-text)" }}>
                  {lens.name}
                </span>
              </div>

              <div className="text-xs mb-2 leading-relaxed" style={{ color: "var(--csoai-muted)" }}>
                {lens.description}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold tabular-nums" style={{ color: lens.color }}>
                  {data.value}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: "var(--csoai-surface)",
                    color: "var(--csoai-muted)",
                  }}
                >
                  {lens.predicate}
                </span>
              </div>

              <div className="text-xs mt-1 tabular-nums" style={{ color: "var(--csoai-muted)" }}>
                n={data.n} · {data.interval}
              </div>
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
        <div className="text-xs mt-1" style={{ color: "var(--csoai-muted)" }}>
          Protection +34.84 AT 0.011 cost · the pair nobody else reports · red + blue on the same item
        </div>
      </div>
    </div>
  );
}

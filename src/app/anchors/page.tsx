"use client";

import { MOCK_WATCHERS } from "@/lib/mock-data";

const STATUS_COLORS: Record<string, string> = {
  LIVE: "var(--csoai-green)",
  THROTTLED: "var(--csoai-amber)",
  UNREACHABLE: "var(--csoai-red)",
  CITED: "var(--csoai-muted)",
  AUTHORED: "var(--csoai-muted)",
};

export default function AnchorsPage() {
  const liveCount = MOCK_WATCHERS.filter(w => w.status === "LIVE").length;
  const totalCount = MOCK_WATCHERS.length;

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--csoai-text)" }}>
            Live Anchors
          </h1>
          <p className="text-lg" style={{ color: "var(--csoai-muted)" }}>
            {liveCount} of {totalCount} watchers live. Anchored to real law and standards —
            fetched on a cron, hashed, cached. A live probe reads the cached hash, never the authority.
          </p>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Watchers", value: totalCount, color: "var(--csoai-text)" },
            { label: "Live", value: liveCount, color: "var(--csoai-green)" },
            { label: "Throttled", value: MOCK_WATCHERS.filter(w => w.status === "THROTTLED").length, color: "var(--csoai-amber)" },
            { label: "Unreachable", value: MOCK_WATCHERS.filter(w => w.status === "CITED").length, color: "var(--csoai-muted)" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-lg border text-center"
              style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
            >
              <div className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Watcher List */}
        <div className="space-y-4">
          {MOCK_WATCHERS.map((watcher) => (
            <div
              key={watcher.source}
              className="border rounded-lg p-6"
              style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: STATUS_COLORS[watcher.status] }}
                    />
                    <h3 className="text-lg font-semibold" style={{ color: "var(--csoai-text)" }}>
                      {watcher.source}
                    </h3>
                    <span
                      className="px-2 py-0.5 rounded text-xs"
                      style={{
                        background: `${STATUS_COLORS[watcher.status]}20`,
                        color: STATUS_COLORS[watcher.status],
                      }}
                    >
                      {watcher.status}
                    </span>
                  </div>
                  <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>
                    {watcher.jurisdiction} · {watcher.provisions_tracked} provisions tracked
                  </div>
                </div>
                {watcher.url && watcher.url !== "local" && (
                  <a
                    href={watcher.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline"
                    style={{ color: "var(--csoai-accent)" }}
                  >
                    Source →
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div style={{ color: "var(--csoai-muted)" }}>Last Checked</div>
                  <div style={{ color: "var(--csoai-text)" }}>
                    {watcher.last_checked ? new Date(watcher.last_checked).toLocaleString() : "Never"}
                  </div>
                </div>
                <div>
                  <div style={{ color: "var(--csoai-muted)" }}>Provisions</div>
                  <div style={{ color: "var(--csoai-text)" }}>
                    {watcher.provisions_tracked}
                  </div>
                </div>
                <div>
                  <div style={{ color: "var(--csoai-muted)" }}>Serves</div>
                  <div style={{ color: "var(--csoai-text)" }}>
                    {watcher.jurisdiction === "ALL" ? "All axes" :
                     watcher.jurisdiction === "EU" ? "G, S" :
                     watcher.jurisdiction === "UK" ? "G" :
                     watcher.jurisdiction === "US" ? "C" : "P"}
                  </div>
                </div>
              </div>

              {watcher.status === "THROTTLED" && (
                <div className="mt-4 p-3 rounded-lg" style={{ background: "rgba(234,179,8,0.1)" }}>
                  <div className="text-sm" style={{ color: "var(--csoai-amber)" }}>
                    ⚠️ Throttled — mechanism proven but cannot verify daily recovery from current IP.
                    Config change needed: point Safety at a second authority.
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 p-4 rounded-lg" style={{ background: "var(--csoai-surface)" }}>
          <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>
            <strong>Critical property:</strong> Anchors are fetched on a cron, hashed, cached.
            A live probe reads the cached hash, never the authority.
            Anchor throttling cannot break the arena — it only delays drift detection.
          </div>
        </div>
      </div>
    </div>
  );
}

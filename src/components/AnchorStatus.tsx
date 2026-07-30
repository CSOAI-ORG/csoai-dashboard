import type { WatcherStatus } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  LIVE: "var(--csoai-green)",
  THROTTLED: "var(--csoai-amber)",
  UNREACHABLE: "var(--csoai-red)",
  CITED: "var(--csoai-muted)",
  AUTHORED: "var(--csoai-muted)",
};

interface AnchorStatusProps {
  watcher: WatcherStatus;
}

export default function AnchorStatus({ watcher }: AnchorStatusProps) {
  const statusColor = STATUS_COLORS[watcher.status] || "var(--csoai-muted)";

  return (
    <div
      className="border rounded-lg p-4 transition-opacity hover:opacity-90"
      style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full animate-pulse-dot"
            style={{ background: statusColor }}
          />
          <div>
            <h3 className="font-medium text-sm" style={{ color: "var(--csoai-text)" }}>
              {watcher.source}
            </h3>
            <div className="text-xs" style={{ color: "var(--csoai-muted)" }}>
              {watcher.jurisdiction} &middot; {watcher.provisions_tracked} provisions
            </div>
          </div>
        </div>
        <span
          className="px-2 py-0.5 text-xs rounded"
          style={{ background: `${statusColor}20`, color: statusColor }}
        >
          {watcher.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div style={{ color: "var(--csoai-muted)" }}>Last Checked</div>
          <div style={{ color: "var(--csoai-text)" }}>
            {watcher.last_checked ? formatTimeAgo(watcher.last_checked) : "Never"}
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
        <div className="mt-3 p-2 rounded text-xs" style={{ background: "rgba(234,179,8,0.1)", color: "var(--csoai-amber)" }}>
          Throttled — mechanism proven but cannot verify daily recovery from current IP.
        </div>
      )}

      {watcher.url && watcher.url !== "local" && (
        <a
          href={watcher.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs underline"
          style={{ color: "var(--csoai-accent)" }}
        >
          Source &rarr;
        </a>
      )}
    </div>
  );
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours === 1) return "1h ago";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

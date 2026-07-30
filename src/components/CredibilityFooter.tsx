import { MOCK_WATCHERS } from "@/lib/mock-data";

export default function CredibilityFooter() {
  return (
    <footer className="border-t mt-auto" style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Anchored To — live timestamps */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--csoai-muted)" }}>
            Anchored To
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {MOCK_WATCHERS.map((w) => (
              <div key={w.source} className="flex items-center gap-2 text-sm">
                <span
                  className="w-2 h-2 rounded-full animate-pulse-dot"
                  style={{
                    background: w.status === "LIVE" ? "var(--csoai-green)" :
                                w.status === "THROTTLED" ? "var(--csoai-amber)" :
                                "var(--csoai-muted)",
                  }}
                />
                <span style={{ color: "var(--csoai-text)" }}>{w.source}</span>
                <span className="text-xs" style={{ color: "var(--csoai-muted)" }}>
                  {w.provisions_tracked} provisions · last checked {formatTimeAgo(w.last_checked)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Built With */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--csoai-muted)" }}>
            Built With
          </h3>
          <p className="text-sm" style={{ color: "var(--csoai-muted)" }}>
            MapLibre GL JS (BSD-3) · deck.gl (MIT) · Next.js (MIT) · Cloudflare Workers
            {" "}&middot;{" "}
            <a href="/licenses" className="underline" style={{ color: "var(--csoai-accent)" }}>
              full dependency + licence manifest
            </a>
          </p>
        </div>

        {/* Open */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--csoai-muted)" }}>
            Open
          </h3>
          <p className="text-sm" style={{ color: "var(--csoai-muted)" }}>
            Benchmarks (CC BY 4.0) · Harness (Apache-2.0) · SBOM · Chain
            {" "}&middot;{" "}
            <a href="/ledger" className="underline" style={{ color: "var(--csoai-accent)" }}>Refutation ledger</a>
            {" "}&middot;{" "}
            <a href="/methodology" className="underline" style={{ color: "var(--csoai-accent)" }}>Methodology</a>
            {" "}&middot;{" "}
            <a href="/gap" className="underline" style={{ color: "var(--csoai-accent)" }}>Gap map</a>
          </p>
        </div>

        {/* What We Don't Claim */}
        <div className="mb-6 p-4 rounded-lg" style={{ background: "var(--csoai-bg)", border: "1px solid var(--csoai-border)" }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--csoai-amber)" }}>
            What We Don&apos;t Claim
          </h3>
          <ul className="text-sm space-y-1" style={{ color: "var(--csoai-muted)" }}>
            <li>Not a certifier &middot; not an enforcer &middot; no accreditation chain</li>
            <li>Our own systems are scored on this board, no exemption</li>
            <li>We measure. Others enforce. The distinction is the business.</li>
          </ul>
        </div>

        {/* Legal */}
        <div className="text-xs" style={{ color: "var(--csoai-muted)" }}>
          <p>
            &copy; CSOAI &middot; Contains public sector information licensed under the Open Government Licence v3.0
            {" "}&middot; &copy; European Union
            {" "}&middot; &copy; OpenStreetMap contributors
          </p>
          <p className="mt-1">
            Current as of the last watcher pass. Not &ldquo;live&rdquo; without qualification.
          </p>
        </div>
      </div>
    </footer>
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

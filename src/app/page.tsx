export default function HomePage() {
  return (
    <div className="min-h-screen px-4 py-16" style={{ background: "var(--csoai-bg)" }}>
      <main className="mx-auto max-w-4xl">
        <section className="text-center">
          <p className="mb-4 text-sm font-medium" style={{ color: "var(--csoai-muted)" }}>
            CSOAI Ltd · UK Companies House 16939677 · incorporated 2 January 2026
          </p>
          <h1 className="mb-6 text-4xl font-bold" style={{ color: "var(--csoai-text)" }}>
            Council of AI
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed" style={{ color: "var(--csoai-muted)" }}>
            Independent AI measurement with published tests, signed evidence, free verification and public corrections.
            We measure; we do not certify, accredit or issue legal-compliance determinations.
          </p>
          <a
            href="https://councilof.ai/"
            className="inline-block rounded-lg px-6 py-3 font-medium"
            style={{ background: "var(--csoai-accent)", color: "white" }}
          >
            Open the current Council of AI
          </a>
        </section>

        <section className="mt-12 rounded-xl border p-6" style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}>
          <h2 className="mb-4 text-xl font-bold" style={{ color: "var(--csoai-text)" }}>Current public source of truth</h2>
          <div className="grid gap-3 text-sm">
            <a href="https://councilof.ai/api/gspc" style={{ color: "var(--csoai-accent)" }}>Living measurement board</a>
            <a href="https://councilof.ai/gspc-verify" style={{ color: "var(--csoai-accent)" }}>Free verification</a>
            <a href="https://councilof.ai/api/corrections" style={{ color: "var(--csoai-accent)" }}>Public corrections ledger</a>
            <a href="https://councilof.ai/claim-maintenance/" style={{ color: "var(--csoai-accent)" }}>Claim Maintenance</a>
            <a href="https://councilof.ai/llms.txt" style={{ color: "var(--csoai-accent)" }}>Machine-readable company and claim boundary</a>
          </div>
        </section>

        <section className="mt-8 rounded-xl border p-6" style={{ borderColor: "var(--csoai-border)" }}>
          <h2 className="mb-3 text-lg font-bold" style={{ color: "var(--csoai-text)" }}>Legacy dashboard notice</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--csoai-muted)" }}>
            This repository is retained as a legacy/reference dashboard. Historical copy about certification, legal compliance,
            pricing, framework counts or agent counts is not a current CSOAI claim. Current statements and mutable figures are
            published from councilof.ai and its named live APIs.
          </p>
        </section>
      </main>
    </div>
  );
}

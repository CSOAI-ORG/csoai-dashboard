export default function CorrectionsPage() {
  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--csoai-text)" }}>
          Corrections
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--csoai-muted)" }}>
          Permanent, public. Every correction is a signed decision record that supersedes the original.
          The history of being wrong <em>is</em> the ledger.
        </p>

        {/* The Three Corrections from Today */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--csoai-text)" }}>
            2026-07-29 — Three Corrections Caught
          </h2>
          <div className="space-y-4">
            {[
              {
                id: "DR-0001",
                drift: "The CI",
                what: "24.2% → '3.43%' → ?",
                resolution: "Asset is the unit, n=12. One-sided 22.1%. Nine transforms of one asset are one deterministic fact restated. Cell-level 3.43% assumes independence that doesn't hold.",
                note: "Pinned DR-0012.",
              },
              {
                id: "DR-0003",
                drift: "0/108 measured or modelled?",
                what: "Confusion between measured and modelled results",
                resolution: "MEASURED. Traced to provbench.py — real c2pa SDK 0.90.1, real signing, real transforms, three-state outcomes. A modelled look-alike file was conflated with it. No refutation #8.",
                note: "Confirmed.",
              },
              {
                id: "DR-0004",
                drift: "Cron 'deployed'",
                what: "Claimed as live when it was only authored",
                resolution: "AUTHORED. Never pushed, never triggered. Overclaimed twice. Now an earned flag — settable only by a remote run writing a signed proof.",
                note: "Stays OPEN until deployed.",
              },
            ].map((correction) => (
              <div
                key={correction.id}
                className="p-6 rounded-lg border"
                style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-sm" style={{ color: "var(--csoai-muted)" }}>
                    {correction.id}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-xs"
                    style={{ background: "rgba(234,179,8,0.1)", color: "var(--csoai-amber)" }}
                  >
                    correction
                  </span>
                </div>

                <div className="mb-4">
                  <div className="font-semibold mb-1" style={{ color: "var(--csoai-text)" }}>
                    Drift: {correction.drift}
                  </div>
                  <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>
                    {correction.what}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium mb-1" style={{ color: "var(--csoai-muted)" }}>
                    Resolution
                  </div>
                  <div className="text-sm" style={{ color: "var(--csoai-text)" }}>
                    {correction.resolution}
                  </div>
                </div>

                <div className="text-xs" style={{ color: "var(--csoai-muted)" }}>
                  {correction.note}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The Discipline */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--csoai-text)" }}>
            The Discipline
          </h2>
          <div
            className="p-6 rounded-lg border"
            style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
          >
            <ul className="space-y-3 text-sm" style={{ color: "var(--csoai-text)" }}>
              <li>
                <strong>Never delete. Always supersede.</strong> A wrong record stays in the chain
                with <code>superseded_by</code> set. The history of being wrong <em>is</em> the ledger.
              </li>
              <li>
                <strong>A tag may never be dropped or upgraded silently.</strong> [LEAD] → [MEASURED] requires
                a new record with <code>supersedes</code> and a <code>method_ref</code>.
              </li>
              <li>
                <strong>n &lt; 20 forces lower_bound: true.</strong> Structurally set, not remembered.
              </li>
              <li>
                <strong>Contradiction is surfaced, never resolved automatically.</strong> Two live records
                with opposing verdicts → both get <code>contested_by</code> and render as OPEN.
              </li>
            </ul>
          </div>
        </section>

        {/* Self-Scoring Disclosure */}
        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--csoai-text)" }}>
            Self-Scoring Disclosure
          </h2>
          <div
            className="p-6 rounded-lg border"
            style={{ borderColor: "var(--csoai-accent)", background: "rgba(59,130,246,0.1)" }}
          >
            <p className="text-sm" style={{ color: "var(--csoai-text)" }}>
              MEOK&apos;s own systems appear on the public board, scored by the same harness, the same items
              and the same predicates as everyone else, with training provenance published. We do not exempt ourselves.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function LicensesPage() {
  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: "var(--csoai-text)" }}>
          Licenses & Attribution
        </h1>

        {/* Open Source Licenses */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--csoai-text)" }}>
            Open Source Dependencies
          </h2>
          <div className="overflow-x-auto">
            <div
              className="border rounded-lg overflow-hidden"
              style={{ borderColor: "var(--csoai-border)" }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ background: "var(--csoai-surface)" }}>
                    <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: "var(--csoai-muted)" }}>Package</th>
                    <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: "var(--csoai-muted)" }}>License</th>
                    <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: "var(--csoai-muted)" }}>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Next.js", license: "MIT", purpose: "Web framework" },
                    { name: "React", license: "MIT", purpose: "UI library" },
                    { name: "Tailwind CSS", license: "MIT", purpose: "Styling" },
                    { name: "Cloudflare Workers", license: "Apache-2.0", purpose: "Edge compute" },
                    { name: "@noble/ed25519", license: "MIT", purpose: "Signature verification" },
                  ].map((dep) => (
                  <tr key={dep.name} className="border-t" style={{ borderColor: "var(--csoai-border)" }}>
                    <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--csoai-text)" }}>{dep.name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--csoai-muted)" }}>{dep.license}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--csoai-muted)" }}>{dep.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Data Sources */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--csoai-text)" }}>
            Data Sources & Attribution
          </h2>
          <div className="space-y-4">
            {[
              {
                source: "legislation.gov.uk",
                license: "Open Government Licence v3.0",
                attribution: "Contains public sector information licensed under the Open Government Licence v3.0",
                url: "https://www.legislation.gov.uk",
              },
              {
                source: "EUR-Lex",
                license: "European Union reuse policy",
                attribution: "© European Union, 1998-2026",
                url: "https://eur-lex.europa.eu",
              },
              {
                source: "OpenStreetMap",
                license: "Open Database License (ODbL)",
                attribution: "© OpenStreetMap contributors",
                url: "https://www.openstreetmap.org",
              },
              {
                source: "Natural Earth",
                license: "Public Domain",
                attribution: "Boundary data from Natural Earth",
                url: "https://www.naturalearthdata.com",
              },
              {
                source: "geoBoundaries",
                license: "CC BY 4.0",
                attribution: "Administrative boundaries from geoBoundaries",
                url: "https://www.geoboundaries.org",
              },
            ].map((source) => (
              <div
                key={source.source}
                className="p-4 rounded-lg border"
                style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold" style={{ color: "var(--csoai-text)" }}>{source.source}</div>
                    <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>{source.license}</div>
                  </div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline"
                    style={{ color: "var(--csoai-accent)" }}
                  >
                    Source →
                  </a>
                </div>
                <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>
                  {source.attribution}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CSOAI Licenses */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--csoai-text)" }}>
            CSOAI Licenses
          </h2>
          <div className="space-y-4">
            <div
              className="p-4 rounded-lg border"
              style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
            >
              <div className="font-semibold mb-2" style={{ color: "var(--csoai-text)" }}>
                Benchmarks
              </div>
              <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>
                CC BY 4.0 — You are free to share and adapt the benchmark data, provided you give appropriate credit.
              </div>
            </div>
            <div
              className="p-4 rounded-lg border"
              style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
            >
              <div className="font-semibold mb-2" style={{ color: "var(--csoai-text)" }}>
                Harness
              </div>
              <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>
                Apache-2.0 — The scoring harness is open source.
              </div>
            </div>
          </div>
        </section>

        {/* Never */}
        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--csoai-text)" }}>
            What We Never Use
          </h2>
          <div
            className="p-4 rounded-lg border"
            style={{
              borderColor: "var(--csoai-red)",
              background: "rgba(239,68,68,0.1)",
            }}
          >
            <ul className="space-y-2 text-sm" style={{ color: "var(--csoai-text)" }}>
              <li>• No vendor logos without written permission AND a signed relationship</li>
              <li>• No GADM boundary data (non-commercial license)</li>
              <li>• No Mapbox/Cesium-ion tokens in the client (keyless basemap)</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

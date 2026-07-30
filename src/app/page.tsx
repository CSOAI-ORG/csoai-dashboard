"use client";

import { useEffect, useRef, useState } from "react";
import { MOCK_GAP_CELLS } from "@/lib/mock-data";
import type { CoverageStatus } from "@/lib/types";

// Jurisdiction polygons (simplified bounding boxes for mock)
const JURISDICTIONS: Record<string, { center: [number, number]; bounds: [[number, number], [number, number]] }> = {
  EU: { center: [10, 50], bounds: [[-10, 35], [30, 60]] },
  UK: { center: [-2, 54], bounds: [[-8, 49], [2, 59]] },
  US: { center: [-95, 38], bounds: [[-125, 25], [-65, 50]] },
  INT: { center: [0, 20], bounds: [[-180, -60], [180, 80]] },
};

const COVERAGE_COLORS: Record<CoverageStatus, string> = {
  covered: "#22c55e",
  partial: "#f59e0b",
  absent: "#ef4444",
  queued: "#3b82f6",
};

export default function GlobePage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Aggregate coverage by jurisdiction
  const jurisdictionCoverage = MOCK_GAP_CELLS.reduce((acc, cell) => {
    const inst = cell.instrument;
    const jurisdiction = inst === "EU-AI-ACT" ? "EU" : inst === "GDPR" ? "EU" : inst === "NIST-IR-8547" ? "US" : inst === "RFC-9964" ? "INT" : "EU";
    if (!acc[jurisdiction]) acc[jurisdiction] = { total: 0, absent: 0, partial: 0, covered: 0 };
    acc[jurisdiction].total++;
    if (cell.field_coverage === "absent" || cell.field_coverage === "partial" || cell.field_coverage === "covered") {
      acc[jurisdiction][cell.field_coverage]++;
    }
    return acc;
  }, {} as Record<string, { total: number; absent: number; partial: number; covered: number }>);

  useEffect(() => {
    if (!mapContainer.current || mapLoaded) return;

    // Dynamic import of maplibre-gl to avoid SSR issues
    import("maplibre-gl").then((maplibregl) => {
      const map = new maplibregl.Map({
        container: mapContainer.current!,
        style: {
          version: 8,
          sources: {
            "osm": {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "&copy; OpenStreetMap contributors",
            },
          },
          layers: [{
            id: "osm",
            type: "raster",
            source: "osm",
          }],
        },
        center: [10, 30],
        zoom: 1.5,
        ...({ projection: { name: "globe" } } as any),
      });

      map.on("load", () => {
        setMapLoaded(true);

        // Add atmosphere effect for globe
        (map as any).setFog({
          color: "rgb(10, 10, 15)",
          "high-color": "rgb(36, 92, 223)",
          "horizon-blend": 0.02,
          "space-color": "rgb(5, 5, 15)",
          "star-intensity": 0.6,
        });

        // Add jurisdiction markers
        Object.entries(JURISDICTIONS).forEach(([id, jur]) => {
          const coverage = jurisdictionCoverage[id];
          if (!coverage) return;

          const absentRatio = coverage.absent / coverage.total;
          const color = absentRatio > 0.5 ? COVERAGE_COLORS.absent :
                        absentRatio > 0 ? COVERAGE_COLORS.partial :
                        COVERAGE_COLORS.covered;

          // Add marker
          const el = document.createElement("div");
          el.className = "jurisdiction-marker";
          el.style.cssText = `
            width: 24px; height: 24px; border-radius: 50%;
            background: ${color}; border: 2px solid rgba(255,255,255,0.3);
            cursor: pointer; opacity: 0.9;
          `;

          const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
            <div style="font-family: system-ui; padding: 4px;">
              <strong>${id}</strong><br/>
              <span style="color: #ef4444">${coverage.absent} absent</span> ·
              <span style="color: #f59e0b">${coverage.partial} partial</span> ·
              <span style="color: #22c55e">${coverage.covered} covered</span>
            </div>
          `);

          new maplibregl.Marker({ element: el })
            .setLngLat(jur.center)
            .setPopup(popup)
            .addTo(map);

          el.addEventListener("click", () => setSelectedJurisdiction(id));
        });
      });
    });

    return () => {};
  }, [mapLoaded, jurisdictionCoverage]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SovSpace</h1>
        <p className="text-lg" style={{ color: "var(--csoai-muted)" }}>
          Jurisdictions coloured by field-coverage density. The empty cells are the product.
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--csoai-muted)" }}>
          &copy; OpenStreetMap contributors &middot; Polygons, not pins &middot; No IP geolocation
        </p>
      </div>

      {/* Map */}
      <div
        ref={mapContainer}
        className="w-full rounded-lg border overflow-hidden"
        style={{ height: "500px", borderColor: "var(--csoai-border)" }}
      />

      {/* Jurisdiction details */}
      {selectedJurisdiction && (
        <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}>
          <h3 className="font-semibold mb-2">{selectedJurisdiction} — Coverage Details</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {(["absent", "partial", "covered"] as const).map((status) => {
              const count = jurisdictionCoverage[selectedJurisdiction]?.[status] || 0;
              return (
                <div key={status} className="text-center">
                  <div className="text-xl font-bold" style={{ color: COVERAGE_COLORS[status] }}>{count}</div>
                  <div style={{ color: "var(--csoai-muted)" }}>{status}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-sm" style={{ color: "var(--csoai-muted)" }}>
        <span className="font-semibold">Legend:</span>
        {(["absent", "partial", "covered"] as const).map((status) => (
          <span key={status} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ background: COVERAGE_COLORS[status] }} />
            {status}
          </span>
        ))}
      </div>
    </div>
  );
}

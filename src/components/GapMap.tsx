"use client";

import { MOCK_GAP_CELLS } from "@/lib/mock-data";
import type { CoverageStatus } from "@/lib/types";

// Jurisdiction polygons (simplified for 2D map)
const JURISDICTION_POLYGONS: Record<string, { path: string; center: [number, number] }> = {
  EU: {
    path: "M 5,40 L 15,38 25,38 30,42 28,48 20,52 10,50 5,45 Z",
    center: [15, 45],
  },
  UK: {
    path: "M -5,50 -3,48 0,49 2,52 0,55 -3,54 -5,52 Z",
    center: [-2, 52],
  },
  US: {
    path: "M -120,30 -100,28 -80,30 -70,35 -75,42 -85,45 -100,42 -115,38 -120,35 Z",
    center: [-95, 37],
  },
  INT: {
    path: "M -180,-60 180,-60 180,80 -180,80 Z",
    center: [0, 20],
  },
};

const COVERAGE_COLORS: Record<CoverageStatus, string> = {
  covered: "#22c55e",
  partial: "#f59e0b",
  absent: "#ef4444",
  queued: "#3b82f6",
};

export default function GapMap() {
  // Aggregate coverage by jurisdiction
  const jurisdictionCoverage = MOCK_GAP_CELLS.reduce((acc, cell) => {
    const inst = cell.instrument;
    const jurisdiction = inst === "EU-AI-ACT" ? "EU" :
                        inst === "GDPR" ? "EU" :
                        inst === "NIST-IR-8547" ? "US" :
                        inst === "RFC-9964" ? "INT" : "EU";
    if (!acc[jurisdiction]) acc[jurisdiction] = { total: 0, absent: 0, partial: 0, covered: 0 };
    acc[jurisdiction].total++;
    if (cell.field_coverage === "absent" || cell.field_coverage === "partial" || cell.field_coverage === "covered") {
      acc[jurisdiction][cell.field_coverage]++;
    }
    return acc;
  }, {} as Record<string, { total: number; absent: number; partial: number; covered: number }>);

  const getJurisdictionColor = (id: string) => {
    const coverage = jurisdictionCoverage[id];
    if (!coverage) return COVERAGE_COLORS.absent;
    const absentRatio = coverage.absent / coverage.total;
    return absentRatio > 0.5 ? COVERAGE_COLORS.absent :
           absentRatio > 0 ? COVERAGE_COLORS.partial :
           COVERAGE_COLORS.covered;
  };

  return (
    <div className="w-full">
      <svg
        viewBox="-180 -60 360 140"
        className="w-full h-auto"
        style={{ background: "var(--csoai-bg)" }}
      >
        {/* Grid lines */}
        {[-150, -100, -50, 0, 50, 100, 150].map(x => (
          <line key={`v${x}`} x1={x} y1={-60} x2={x} y2={80} stroke="var(--csoai-border)" strokeWidth="0.3" />
        ))}
        {[-40, -20, 0, 20, 40, 60].map(y => (
          <line key={`h${y}`} x1={-180} y1={y} x2={180} y2={y} stroke="var(--csoai-border)" strokeWidth="0.3" />
        ))}

        {/* Jurisdiction polygons */}
        {Object.entries(JURISDICTION_POLYGONS).map(([id, jur]) => {
          const coverage = jurisdictionCoverage[id];
          const color = getJurisdictionColor(id);
          const opacity = coverage ? 0.6 : 0.2;

          return (
            <g key={id}>
              <path
                d={jur.path}
                fill={color}
                fillOpacity={opacity}
                stroke={color}
                strokeWidth="1"
                strokeOpacity="0.8"
                className="cursor-pointer hover:fillOpacity-80 transition-all"
              />
              {/* Label */}
              <text
                x={jur.center[0]}
                y={jur.center[1]}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="8"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {id}
              </text>
              {/* Coverage stats */}
              {coverage && (
                <text
                  x={jur.center[0]}
                  y={jur.center[1] + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="5"
                  opacity="0.8"
                  className="pointer-events-none"
                >
                  {coverage.absent} absent · {coverage.partial} partial · {coverage.covered} covered
                </text>
              )}
            </g>
          );
        })}

        {/* OSM Attribution */}
        <text x="-175" y="75" fill="var(--csoai-muted)" fontSize="4">
          © OpenStreetMap contributors · Polygons, not pins · No IP geolocation
        </text>
      </svg>
    </div>
  );
}

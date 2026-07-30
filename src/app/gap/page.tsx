import { MOCK_GAP_CELLS } from "@/lib/mock-data";
import type { GapCell, Axis, Mode } from "@/lib/types";
import { AXES, MODES, INSTRUMENTS } from "@/lib/constants";

const COVERAGE_COLORS: Record<string, string> = {
  covered: "var(--csoai-green)",
  partial: "var(--csoai-amber)",
  absent: "var(--csoai-red)",
  queued: "var(--csoai-accent)",
};

export default function GapPage() {
  const totalProvisions = INSTRUMENTS.reduce((sum, i) => sum + i.provisions, 0);
  const absent = MOCK_GAP_CELLS.filter((c) => c.field_coverage === "absent").length;
  const partial = MOCK_GAP_CELLS.filter((c) => c.field_coverage === "partial").length;
  const covered = MOCK_GAP_CELLS.filter((c) => c.field_coverage === "covered").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gap Map</h1>
        <p className="text-lg" style={{ color: "var(--csoai-muted)" }}>
          <span style={{ color: "var(--csoai-red)" }}>{absent}</span> of {MOCK_GAP_CELLS.length} measured cells have{" "}
          <strong>no field coverage</strong> — no benchmark anywhere measures this provision.
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--csoai-amber)" }}>
          field_coverage is the headline. gspc_coverage is internal only.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Absent (no coverage)", count: absent, color: "var(--csoai-red)" },
          { label: "Partial", count: partial, color: "var(--csoai-amber)" },
          { label: "Covered", count: covered, color: "var(--csoai-green)" },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-lg border"
            style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
          >
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</div>
            <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-2" style={{ color: "var(--csoai-muted)" }}>Provision</th>
              <th className="text-left p-2" style={{ color: "var(--csoai-muted)" }}>Instrument</th>
              {AXES.map((axis) =>
                MODES.map((mode) => (
                  <th
                    key={`${axis.id}-${mode.id}`}
                    className="text-center p-2 text-xs"
                    style={{ color: "var(--csoai-muted)" }}
                  >
                    {axis.id.charAt(0).toUpperCase()}:{mode.id.charAt(0).toUpperCase()}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {groupedRows(MOCK_GAP_CELLS).map(([key, cells]) => {
              const [provision, instrument] = key.split("|");
              return (
                <tr key={key} className="border-t" style={{ borderColor: "var(--csoai-border)" }}>
                  <td className="p-2 font-mono text-xs">{provision}</td>
                  <td className="p-2 text-xs" style={{ color: "var(--csoai-muted)" }}>{instrument}</td>
                  {AXES.map((axis) =>
                    MODES.map((mode) => {
                      const cell = cells.find(
                        (c) => c.axis === axis.id && c.mode === mode.id
                      );
                      return (
                        <td key={`${axis.id}-${mode.id}`} className="p-2 text-center">
                          {cell ? (
                            <span
                              className="inline-block w-6 h-6 rounded text-xs font-bold leading-6"
                              style={{
                                background: `${COVERAGE_COLORS[cell.field_coverage]}20`,
                                color: COVERAGE_COLORS[cell.field_coverage],
                              }}
                              title={cell.gap_reason || cell.field_coverage}
                            >
                              {cell.field_coverage === "covered"
                                ? "\u2713"
                                : cell.field_coverage === "partial"
                                ? "~"
                                : "\u2717"}
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--csoai-muted)" }}>—</span>
                          )}
                        </td>
                      );
                    })
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-xs" style={{ color: "var(--csoai-muted)" }}>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded" style={{ background: `${COVERAGE_COLORS.covered}40` }} />
          Covered
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded" style={{ background: `${COVERAGE_COLORS.partial}40` }} />
          Partial
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded" style={{ background: `${COVERAGE_COLORS.absent}40` }} />
          Absent (blind spot)
        </div>
      </div>
    </div>
  );
}

function groupedRows(cells: GapCell[]): [string, GapCell[]][] {
  const map = new Map<string, GapCell[]>();
  for (const cell of cells) {
    const key = `${cell.provision}|${cell.instrument}`;
    const arr = map.get(key) || [];
    arr.push(cell);
    map.set(key, arr);
  }
  return Array.from(map.entries());
}

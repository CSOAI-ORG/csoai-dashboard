"use client";

import { useState, useEffect } from "react";
import { fetchDriftEvents } from "@/lib/d1-client";
import { INSTRUMENTS } from "@/lib/constants";

interface DriftEvent {
  id: string;
  detected_at: string;
  instrument: string;
  provision: string;
  hash_before: string;
  hash_after: string;
  change_class: string;
  source_authority: string;
  source_uri: string;
  packs_staled: string[];
  systems_affected: string[];
  registrants_affected: string[];
}

const CHANGE_CLASS_COLORS: Record<string, string> = {
  amended: "var(--csoai-accent)",
  superseded: "var(--csoai-amber)",
  repealed: "var(--csoai-red)",
  guidance_added: "var(--csoai-green)",
  corrigendum: "var(--csoai-muted)",
};

export default function DriftPage() {
  const [events, setEvents] = useState<DriftEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterInstrument, setFilterInstrument] = useState<string>("all");

  useEffect(() => {
    fetchDriftEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  const filtered = filterInstrument === "all"
    ? events
    : events.filter(e => e.instrument === filterInstrument);

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12" style={{ color: "var(--csoai-muted)" }}>Loading drift feed...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--csoai-text)" }}>
            Drift Feed
          </h1>
          <p className="text-lg" style={{ color: "var(--csoai-muted)" }}>
            &ldquo;Here&apos;s what changed in the law, and which of your evidence just expired.&rdquo;
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--csoai-amber)" }}>
            Deterministic end to end. A hash changed or it didn&apos;t. No judgement, no LLM.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Events", value: events.length, color: "var(--csoai-accent)" },
            { label: "Systems Affected", value: new Set(events.flatMap(e => e.systems_affected)).size, color: "var(--csoai-amber)" },
            { label: "Registrants Affected", value: new Set(events.flatMap(e => e.registrants_affected)).size, color: "var(--csoai-red)" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-lg border text-center"
              style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
            >
              <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-sm" style={{ color: "var(--csoai-muted)" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilterInstrument("all")}
            className="px-3 py-1.5 text-xs rounded transition-colors"
            style={{
              background: filterInstrument === "all" ? "rgba(59,130,246,0.2)" : "var(--csoai-bg)",
              color: filterInstrument === "all" ? "var(--csoai-accent)" : "var(--csoai-muted)",
              border: filterInstrument === "all" ? "1px solid var(--csoai-accent)" : "1px solid var(--csoai-border)",
            }}
          >
            All instruments
          </button>
          {INSTRUMENTS.map((inst) => (
            <button
              key={inst.id}
              onClick={() => setFilterInstrument(inst.id)}
              className="px-3 py-1.5 text-xs rounded transition-colors"
              style={{
                background: filterInstrument === inst.id ? "rgba(59,130,246,0.2)" : "var(--csoai-bg)",
                color: filterInstrument === inst.id ? "var(--csoai-accent)" : "var(--csoai-muted)",
                border: filterInstrument === inst.id ? "1px solid var(--csoai-accent)" : "1px solid var(--csoai-border)",
              }}
            >
              {inst.id}
            </button>
          ))}
        </div>

        {/* Event Timeline */}
        <div className="space-y-4">
          {filtered.map((event) => (
            <div
              key={event.id}
              className="border rounded-lg p-4"
              style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: CHANGE_CLASS_COLORS[event.change_class] || "var(--csoai-muted)" }}
                  />
                  <span className="font-mono text-xs" style={{ color: "var(--csoai-muted)" }}>
                    {event.id}
                  </span>
                  <span
                    className="px-2 py-0.5 text-xs rounded"
                    style={{ background: `${CHANGE_CLASS_COLORS[event.change_class] || "var(--csoai-muted)"}20`, color: CHANGE_CLASS_COLORS[event.change_class] || "var(--csoai-muted)" }}
                  >
                    {event.change_class}
                  </span>
                </div>
                <span className="text-xs" style={{ color: "var(--csoai-muted)" }}>
                  {new Date(event.detected_at).toLocaleString()}
                </span>
              </div>

              <div className="mb-3">
                <span className="font-medium" style={{ color: "var(--csoai-text)" }}>
                  {event.instrument} &middot; {event.provision}
                </span>
                {event.source_authority && (
                  <span className="ml-2 text-xs" style={{ color: "var(--csoai-muted)" }}>
                    via {event.source_authority}
                  </span>
                )}
              </div>

              {/* Hash change */}
              <div className="mb-3 p-2 rounded text-xs font-mono" style={{ background: "var(--csoai-bg)" }}>
                <div style={{ color: "var(--csoai-red)" }}>
                  &minus; {event.hash_before.slice(0, 16)}&hellip;
                </div>
                <div style={{ color: "var(--csoai-green)" }}>
                  + {event.hash_after.slice(0, 16)}&hellip;
                </div>
              </div>

              {/* Impact */}
              {(event.systems_affected.length > 0 || event.packs_staled.length > 0) && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {event.systems_affected.length > 0 && (
                    <span style={{ color: "var(--csoai-amber)" }}>
                      {event.systems_affected.length} system{event.systems_affected.length > 1 ? "s" : ""} affected
                    </span>
                  )}
                  {event.packs_staled.length > 0 && (
                    <span style={{ color: "var(--csoai-red)" }}>
                      {event.packs_staled.length} evidence pack{event.packs_staled.length > 1 ? "s" : ""} staled
                    </span>
                  )}
                </div>
              )}

              {/* Source link */}
              {event.source_uri && (
                <a
                  href={event.source_uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs underline"
                  style={{ color: "var(--csoai-accent)" }}
                >
                  Source &rarr;
                </a>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm" style={{ color: "var(--csoai-muted)" }}>
            No drift events match the current filter.
          </div>
        )}
      </div>
    </div>
  );
}

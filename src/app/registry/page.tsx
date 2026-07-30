"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchRegistrants } from "@/lib/d1-client";

interface Registrant {
  id: string;
  legal_name: string;
  jurisdiction: string;
  role: string;
  instruments: string[];
  self_declared: boolean;
  notify: string[];
  cadence: string;
  created_at: string;
  systems: {
    id: string;
    name: string;
    kind: string;
    model_family: string;
    version: string;
    mode_scope: string[];
  }[];
}

export default function RegistryPage() {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrants().then((data) => {
      setRegistrants(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12" style={{ color: "var(--csoai-muted)" }}>Loading registry...</div>
        </div>
      </div>
    );
  }

  const totalSystems = registrants.reduce((sum, r) => sum + r.systems.length, 0);

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--csoai-text)" }}>
            Evidence Registry
          </h1>
          <p className="text-lg" style={{ color: "var(--csoai-muted)" }}>
            {registrants.length} registrants, {totalSystems} systems.{" "}
            <span style={{ color: "var(--csoai-amber)" }}>
              Registration is the subscription — we can tell you when your evidence expires.
            </span>
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Registrants", value: registrants.length, color: "var(--csoai-accent)" },
            { label: "Systems", value: totalSystems, color: "var(--csoai-green)" },
            { label: "Instruments Covered", value: new Set(registrants.flatMap(r => r.instruments)).size, color: "var(--csoai-amber)" },
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

        {/* Registrant List */}
        <div className="space-y-4">
          {registrants.map((registrant) => (
            <div
              key={registrant.id}
              className="border rounded-lg overflow-hidden"
              style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
            >
              <div
                className="p-4 cursor-pointer transition-opacity hover:opacity-90"
                onClick={() => setExpanded(expanded === registrant.id ? null : registrant.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium" style={{ color: "var(--csoai-text)" }}>
                      {registrant.legal_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(59,130,246,0.15)", color: "var(--csoai-accent)" }}>
                        {registrant.role}
                      </span>
                      <span className="text-xs" style={{ color: "var(--csoai-muted)" }}>
                        {registrant.jurisdiction} &middot; {registrant.cadence} updates
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs" style={{ color: "var(--csoai-muted)" }}>
                    {registrant.id}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {registrant.instruments.map((inst) => (
                    <span
                      key={inst}
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: "var(--csoai-bg)", color: "var(--csoai-muted)" }}
                    >
                      {inst}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expanded: Systems */}
              {expanded === registrant.id && (
                <div className="border-t p-4" style={{ borderColor: "var(--csoai-border)" }}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--csoai-muted)" }}>
                    Registered Systems ({registrant.systems.length})
                  </h4>
                  <div className="space-y-2">
                    {registrant.systems.map((system) => (
                      <div
                        key={system.id}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ background: "var(--csoai-bg)" }}
                      >
                        <div>
                          <div className="font-medium text-sm" style={{ color: "var(--csoai-text)" }}>
                            {system.name}
                          </div>
                          <div className="text-xs" style={{ color: "var(--csoai-muted)" }}>
                            {system.kind} &middot; {system.model_family} {system.version}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {system.mode_scope.map((mode) => (
                            <span
                              key={mode}
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: mode === "actor" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)", color: mode === "actor" ? "var(--csoai-red)" : "var(--csoai-green)" }}
                            >
                              {mode}
                            </span>
                          ))}
                          <span className="font-mono text-xs" style={{ color: "var(--csoai-muted)" }}>
                            {system.id}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 p-6 rounded-lg border text-center" style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}>
          <h3 className="font-semibold mb-2" style={{ color: "var(--csoai-text)" }}>Register Your Systems</h3>
          <p className="text-sm mb-4" style={{ color: "var(--csoai-muted)" }}>
            Registration is the subscription. We can tell you when your evidence expires.
          </p>
          <div className="text-xs" style={{ color: "var(--csoai-amber)" }}>
            API endpoint: POST /api/registry/registrant
          </div>
        </div>
      </div>
    </div>
  );
}

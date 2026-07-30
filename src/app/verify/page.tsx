"use client";

import { useState, useEffect } from "react";
import { fetchJRecords } from "@/lib/d1-client";
import VerifyButton from "@/components/VerifyButton";
import type { JRecord } from "@/lib/types";

export default function VerifyPage() {
  const [records, setRecords] = useState<JRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJRecords()
      .then((data) => {
        setRecords(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load records");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse" style={{ color: "var(--csoai-muted)" }}>Loading records...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="p-4 rounded-lg border" style={{ borderColor: "var(--csoai-red)", background: "rgba(239,68,68,0.1)" }}>
            <div style={{ color: "var(--csoai-red)" }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--csoai-text)" }}>
          Verify the Chain
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--csoai-muted)" }}>
          Check the integrity of the signed record chain yourself. Verification runs client-side —
          you don&apos;t take our word for it.
        </p>

        {/* Verify Button */}
        <div
          className="p-8 rounded-lg border text-center mb-8"
          style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
        >
          <VerifyButton records={records} />

          <div className="mt-4 text-xs" style={{ color: "var(--csoai-muted)" }}>
            {records.length} records available for verification
          </div>
        </div>

        {/* Important Note */}
        <div
          className="p-6 rounded-lg border mb-8"
          style={{
            borderColor: "var(--csoai-amber)",
            background: "rgba(234,179,8,0.1)",
          }}
        >
          <h3 className="font-semibold mb-2" style={{ color: "var(--csoai-amber)" }}>
            What This Verifies
          </h3>
          <div className="text-sm space-y-2" style={{ color: "var(--csoai-text)" }}>
            <p>
              <strong>Today:</strong> This verifies <em>tamper-evidence</em> — the chain of sha256 hashes
              is intact and no records have been modified.
            </p>
            <p>
              <strong>Not yet:</strong> This does not verify <em>authenticity</em> via cryptographic signatures.
              Ed25519 signature verification is a production upgrade.
            </p>
            <p>
              <strong>The rule:</strong> The button may only claim what the cryptography currently does.
              Not what it will do.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div
          className="p-6 rounded-lg border"
          style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}
        >
          <h3 className="font-semibold mb-4" style={{ color: "var(--csoai-text)" }}>
            How Verification Works
          </h3>
          <div className="space-y-4 text-sm" style={{ color: "var(--csoai-muted)" }}>
            <div className="flex gap-3">
              <span className="font-bold" style={{ color: "var(--csoai-accent)" }}>1.</span>
              <span>Each record contains a sigil_link — a hash of the record content</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold" style={{ color: "var(--csoai-accent)" }}>2.</span>
              <span>Records are ordered by chain_index — each index must be sequential</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold" style={{ color: "var(--csoai-accent)" }}>3.</span>
              <span>Verification checks that no gaps exist and all sigil links are valid</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold" style={{ color: "var(--csoai-accent)" }}>4.</span>
              <span>A broken chain means at least one record was modified after signing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

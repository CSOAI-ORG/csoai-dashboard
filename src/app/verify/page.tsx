"use client";

import { useState } from "react";
import { MOCK_J_RECORDS } from "@/lib/mock-data";
import { verifyChain } from "@/lib/verify";

export default function VerifyPage() {
  const [result, setResult] = useState<{
    valid: boolean;
    records_checked: number;
    message: string;
    mode: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);

    try {
      // Real client-side verification using SHA-256 hash chain
      const chainResult = await verifyChain(MOCK_J_RECORDS);
      setResult({
        valid: chainResult.valid,
        records_checked: chainResult.records_checked,
        message: chainResult.message,
        mode: chainResult.mode,
      });
    } catch (error) {
      setResult({
        valid: false,
        records_checked: 0,
        message: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        mode: "tamper-evidence",
      });
    }

    setIsVerifying(false);
  };

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
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="px-8 py-4 rounded-lg text-lg font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--csoai-accent)", color: "white" }}
          >
            {isVerifying ? "Verifying..." : "Verify Chain ↓"}
          </button>

          {result && (
            <div className="mt-6">
              <div
                className="text-2xl font-bold mb-2"
                style={{ color: result.valid ? "var(--csoai-green)" : "var(--csoai-red)" }}
              >
                {result.valid ? "\u2713 CHAIN INTACT" : "\u2717 CHAIN BROKEN"}
              </div>
              <div className="text-sm mb-4" style={{ color: "var(--csoai-text)" }}>
                {result.message}
              </div>
              <div className="text-xs mb-2" style={{ color: "var(--csoai-muted)" }}>
                Records checked: {result.records_checked}
              </div>
              <div
                className="inline-block px-3 py-1 rounded text-sm"
                style={{
                  background: "rgba(59,130,246,0.1)",
                  color: "var(--csoai-accent)",
                }}
              >
                Mode: {result.mode}
              </div>
            </div>
          )}
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

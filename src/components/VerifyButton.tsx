"use client";

import { useState } from "react";
import { verifyChain } from "@/lib/verify";
import type { JRecord } from "@/lib/types";

interface VerifyButtonProps {
  records: JRecord[];
  className?: string;
}

export default function VerifyButton({ records, className = "" }: VerifyButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "valid" | "invalid">("idle");
  const [message, setMessage] = useState("");

  const handleVerify = async () => {
    setState("loading");
    const result = await verifyChain(records);
    setState(result.valid ? "valid" : "invalid");
    setMessage(result.message);
  };

  const colors = {
    idle: { bg: "transparent", border: "var(--csoai-border)", text: "var(--csoai-accent)" },
    loading: { bg: "transparent", border: "var(--csoai-border)", text: "var(--csoai-muted)" },
    valid: { bg: "rgba(34,197,94,0.1)", border: "var(--csoai-green)", text: "var(--csoai-green)" },
    invalid: { bg: "rgba(239,68,68,0.1)", border: "var(--csoai-red)", text: "var(--csoai-red)" },
  };

  const c = colors[state];

  return (
    <div className={className}>
      <button
        onClick={handleVerify}
        disabled={state === "loading"}
        className="px-4 py-2 text-sm rounded-md border transition-colors"
        style={{ background: c.bg, borderColor: c.border, color: c.text }}
      >
        {state === "loading" ? "Verifying..." : state === "idle" ? "verify \u2193" : state === "valid" ? "\u2713 chain intact" : "\u2717 chain broken"}
      </button>

      {state !== "idle" && state !== "loading" && (
        <div className="mt-2 text-xs space-y-1">
          <div style={{ color: c.text }}>{message}</div>
          <div style={{ color: "var(--csoai-muted)" }}>
            This verifies tamper-evidence, not authenticity.
            <br />
            Ed25519 signature verification: production upgrade.
          </div>
        </div>
      )}
    </div>
  );
}

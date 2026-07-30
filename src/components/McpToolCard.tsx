import { clsx } from "clsx";

interface McpToolCardProps {
  name: string;
  description: string;
  permitted: boolean;
  isTrap: boolean;
  trapProvision?: string;
  callsUsed?: number;
  lit?: boolean;
}

export default function McpToolCard({
  name,
  description,
  permitted,
  isTrap,
  trapProvision,
  callsUsed = 0,
  lit = false,
}: McpToolCardProps) {
  return (
    <div
      className={clsx("rounded-lg border p-3 text-sm transition-all", lit && "ring-1")}
      style={{
        borderColor: isTrap ? "var(--csoai-red)" : "var(--csoai-border)",
        background: lit ? "rgba(59,130,246,0.05)" : "var(--csoai-surface)",
        outline: lit ? "1px solid var(--csoai-accent)" : undefined,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        {isTrap ? (
          <span style={{ color: "var(--csoai-red)" }}>&#9888;&#65039;</span>
        ) : (
          <span style={{ color: "var(--csoai-green)" }}>&#128269;</span>
        )}
        <span className="font-medium">{name}</span>
        {isTrap && (
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.15)", color: "var(--csoai-red)" }}>
            TRAP
          </span>
        )}
      </div>
      <p className="text-xs" style={{ color: "var(--csoai-muted)" }}>{description}</p>
      {trapProvision && (
        <p className="text-xs mt-1" style={{ color: "var(--csoai-red)" }}>
          {trapProvision} &middot; calling this = FAIL
        </p>
      )}
      <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: "var(--csoai-muted)" }}>
        <span>{permitted ? "permitted" : "forbidden"}</span>
        {callsUsed > 0 && <span>&middot; used: {callsUsed}</span>}
      </div>
    </div>
  );
}

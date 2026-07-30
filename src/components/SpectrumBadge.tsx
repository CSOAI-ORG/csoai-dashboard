import type { Tag } from "@/lib/types";

const TAG_COLORS: Record<Tag, string> = {
  MEASURED: "var(--csoai-green)",
  LEAD: "var(--csoai-accent)",
  GREENFIELD: "#a855f7",
  VENDOR: "var(--csoai-amber)",
  REFUTED: "var(--csoai-red)",
};

interface SpectrumBadgeProps {
  tag: Tag;
  className?: string;
}

export default function SpectrumBadge({ tag, className = "" }: SpectrumBadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs rounded font-mono ${className}`}
      style={{
        background: `${TAG_COLORS[tag]}20`,
        color: TAG_COLORS[tag],
      }}
    >
      {tag}
    </span>
  );
}

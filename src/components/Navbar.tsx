"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { href: "/", label: "Globe" },
  { href: "/arena", label: "Arena" },
  { href: "/ledger", label: "Ledger" },
  { href: "/gap", label: "Gap Map" },
  { href: "/anchors", label: "Anchors" },
  { href: "/methodology", label: "Methodology" },
  { href: "/licenses", label: "Licenses" },
  { href: "/corrections", label: "Corrections" },
  { href: "/verify", label: "Verify" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b" style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <span style={{ color: "var(--csoai-accent)" }}>CSOAI</span>
          <span className="text-xs font-normal" style={{ color: "var(--csoai-muted)" }}>
            measurement body
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                pathname === item.href
                  ? "font-medium"
                  : "hover:opacity-80"
              )}
              style={{
                color: pathname === item.href ? "var(--csoai-accent)" : "var(--csoai-muted)",
                background: pathname === item.href ? "rgba(59,130,246,0.1)" : "transparent",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

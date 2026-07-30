"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Globe" },
  { href: "/arena", label: "Arena" },
  { href: "/ledger", label: "Ledger" },
  { href: "/gap", label: "Gap Map" },
  { href: "/drift", label: "Drift" },
  { href: "/registry", label: "Registry" },
  { href: "/anchors", label: "Anchors" },
  { href: "/methodology", label: "Methodology" },
  { href: "/verify", label: "Verify" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b" style={{ borderColor: "var(--csoai-border)", background: "var(--csoai-surface)" }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <span style={{ color: "var(--csoai-accent)" }}>CSOAI</span>
          <span className="text-xs font-normal" style={{ color: "var(--csoai-muted)" }}>
            measurement body
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "px-3 py-1.5 text-sm rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                pathname === item.href ? "font-medium" : "hover:opacity-80"
              )}
              style={{
                color: pathname === item.href ? "var(--csoai-accent)" : "var(--csoai-muted)",
                background: pathname === item.href ? "rgba(59,130,246,0.1)" : "transparent",
                outlineColor: "var(--csoai-accent)",
              }}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ color: "var(--csoai-text)", outlineColor: "var(--csoai-accent)" }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {isMobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t" style={{ borderColor: "var(--csoai-border)" }}>
          <div className="px-4 py-2 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "block px-3 py-2 text-sm rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                  pathname === item.href ? "font-medium" : "hover:opacity-80"
                )}
                style={{
                  color: pathname === item.href ? "var(--csoai-accent)" : "var(--csoai-muted)",
                  background: pathname === item.href ? "rgba(59,130,246,0.1)" : "transparent",
                  outlineColor: "var(--csoai-accent)",
                }}
                aria-current={pathname === item.href ? "page" : undefined}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

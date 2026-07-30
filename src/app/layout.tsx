import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CredibilityFooter from "@/components/CredibilityFooter";

export const metadata: Metadata = {
  title: "CSOAI — The Measurement Body",
  description: "Measuring what the measurement layer misses. Governance, Safety, Provenance, Continuity — deterministic, signed, anchored to the law.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <CredibilityFooter />
      </body>
    </html>
  );
}

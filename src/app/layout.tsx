import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CredibilityFooter from "@/components/CredibilityFooter";

export const metadata: Metadata = {
  title: "CSOAI — AI Compliance Measurement",
  description: "Measuring whether AI systems comply with the law. Deterministic, signed, anchored.",
  keywords: ["AI", "compliance", "measurement", "governance", "EU AI Act", "GSPC"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <CredibilityFooter />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Council of AI — CSOAI Ltd",
  description:
    "CSOAI Ltd operates Council of AI: independent AI measurement, signed evidence, free verification and public corrections. Measurement, not certification.",
  alternates: {
    canonical: "https://councilof.ai/",
  },
  openGraph: {
    title: "Council of AI — independent AI measurement",
    description:
      "Published tests, signed evidence, free verification and public corrections. Measurement, not certification.",
    url: "https://councilof.ai/",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

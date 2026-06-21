import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { GitBranch, Shield, Award, Globe, ExternalLink, Newspaper, Mail, MessageSquare } from "lucide-react";

const stats = [
  { label: "Public Repos", value: "533", icon: GitBranch },
  { label: "Attestation Certs", value: "6,471", icon: Shield },
  { label: "Sigils Minted", value: "1,041", icon: Award },
  { label: "MCP Servers", value: "408", icon: Globe },
];

const releases = [
  {
    title: "Sovereign Temple — Public v3",
    date: "June 21, 2026",
    tag: "MIT License",
    description:
      "Sanitized public release of our sovereign AI infrastructure. Sigil Bus, Ed25519 attestation, swarm coordination, A2A protocol, and 47 agent hives. No personal data. Built for the community.",
    link: "https://github.com/CSOAI-ORG/sovereign-temple",
    linkText: "github.com/CSOAI-ORG/sovereign-temple",
  },
  {
    title: "MEOK Attestation SDK — PyPI 3.1.0",
    date: "June 20, 2026",
    tag: "pip install meok-sdk",
    description:
      "Python SDK for cryptographic attestation, Ed25519 sigil verification, and multi-agent trust. Production-ready with 6,471+ certs on-chain.",
    link: "https://pypi.org/project/meok-sdk/",
    linkText: "pypi.org/project/meok-sdk",
  },
  {
    title: "HIVE 1 — Compliance Infrastructure",
    date: "July 4, 2026 target",
    tag: "51 MCP servers",
    description:
      "Full compliance attestation product for enterprise AI governance. 51 MCP servers, BFT council coordination, tri-brain architecture. Launching Independence Day.",
    link: "https://proofof.ai",
    linkText: "proofof.ai",
  },
];

const links = [
  { label: "GitHub", href: "https://github.com/CSOAI-ORG" },
  { label: "ProofOf.AI", href: "https://proofof.ai" },
  { label: "MEOK.AI", href: "https://meok.ai" },
  { label: "CSOAI.ORG", href: "https://csoai.org" },
];

export default function Press() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-br from-white via-emerald-50 to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-950 py-24">
          <div className="container max-w-4xl space-y-4">
            <Skeleton className="h-8 w-32 bg-white/10" />
            <Skeleton className="h-16 w-full bg-white/10" />
          </div>
        </div>
        <div className="container py-20">
          <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-12 w-2/3 mx-auto" />
            <div className="grid md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Press — CSOAI / MEOK</title>
        <meta name="description" content="CSOAI press page. Building sovereign AI infrastructure. Open by default." />
      </Helmet>

      {/* Hero */}
      <div className="bg-gradient-to-br from-white via-emerald-50 to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-950 text-gray-900 dark:text-white py-24">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 text-emerald-700 border-emerald-300 bg-emerald-50/50">
            <Newspaper className="w-3 h-3 mr-1" /> Press & Media
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            CSOAI / MEOK Press
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Building sovereign AI infrastructure. Open by default.
          </p>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-16">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="p-6 text-center border border-emerald-100 hover:border-emerald-300 transition-colors"
            >
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
              <div className="text-2xl md:text-3xl font-bold text-emerald-700">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 uppercase tracking-wider mt-1">
                {stat.label}
              </div>
            </Card>
          ))}
        </div>

        {/* Latest Releases */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-emerald-500 rounded-full inline-block" />
          Latest Releases
        </h2>
        <div className="space-y-6 mb-16">
          {releases.map((release) => (
            <Card
              key={release.title}
              className="p-6 border border-gray-200 hover:border-emerald-300 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {release.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {release.tag}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mb-3">{release.date}</p>
              <p className="text-gray-700 mb-4">{release.description}</p>
              <a
                href={release.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium text-sm"
              >
                {release.linkText}
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </Card>
          ))}
        </div>

        {/* Press Mentions */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-emerald-500 rounded-full inline-block" />
          Press Mentions
        </h2>
        <Card className="p-8 text-center border border-dashed border-gray-300 mb-16">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 mb-4">
            No press coverage yet. We&apos;re building in public. If you&apos;re writing about
            sovereign AI, multi-agent governance, or AI attestation, get in touch.
          </p>
          <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50" asChild>
            <a href="mailto:press@meok.ai">
              <Mail className="w-4 h-4 mr-2" />
              Contact Press
            </a>
          </Button>
        </Card>

        {/* Links */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-emerald-500 rounded-full inline-block" />
          Links
        </h2>
        <div className="flex flex-wrap gap-3 mb-16">
          {links.map((link) => (
            <Badge
              key={link.label}
              variant="outline"
              className="px-4 py-2 text-sm border-emerald-200 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
              asChild
            >
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            </Badge>
          ))}
        </div>

        {/* Contact */}
        <div className="border-t border-gray-200 pt-8 text-center">
          <p className="text-gray-600 mb-1">
            Press inquiries:{" "}
            <a href="mailto:press@meok.ai" className="text-emerald-600 hover:underline">
              press@meok.ai
            </a>
          </p>
          <p className="text-sm text-gray-400">
            CSOAI Ltd · UK · Registered Company
          </p>
        </div>
      </div>
    </div>
  );
}

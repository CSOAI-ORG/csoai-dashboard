import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Bot,
  Coins,
  Building2,
  FileText,
  Handshake,
  Network,
  ChevronDown,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const competitors = ["CSOAI", "Credo AI", "Holistic AI", "IBM watsonx.governance"];

const comparisonData = [
  { feature: "Multi-framework crosswalks (22 frameworks)", values: ["yes", "partial", "partial", "partial"] },
  { feature: "Public transparency / Watchdog hub", values: ["yes", "no", "no", "no"] },
  { feature: "Global AI regulation map", values: ["yes", "no", "partial", "no"] },
  { feature: "Independent certification (CEASAI)", values: ["yes", "no", "no", "no"] },
  { feature: "Self-serve & transparent pricing", values: ["yes", "no", "no", "no"] },
  { feature: "Agentic 33-Agent Council monitoring", values: ["yes", "no", "no", "no"] },
  { feature: "Free EU AI Act risk classifier", values: ["yes", "no", "no", "no"] },
  { feature: "multi-leg consensus", values: ["yes", "no", "no", "no"] },
  { feature: "EU AI Act compliance mapping", values: ["yes", "yes", "yes", "yes"] },
  { feature: "NIST AI RMF mapping", values: ["yes", "yes", "partial", "yes"] },
  { feature: "ISO 42001 mapping", values: ["yes", "yes", "partial", "yes"] },
  { feature: "Bias detection", values: ["yes", "partial", "yes", "yes"] },
  { feature: "Pricing model", values: ["Self-serve £3.5K–£150K", "Demo-gated", "Demo-gated", "Enterprise / usage-based"] },
];

const faqs = [
  {
    question: "Can't I just use Credo AI or OneTrust?",
    answer:
      "Credo AI and OneTrust are excellent compliance platforms — they help you document risks, generate reports, and map frameworks. But they are software vendors, not certification bodies. CSOAI is the only organization that can independently certify your AI systems and your people meet safety standards. You need both: compliance software to manage the work, and a certification body to prove you've done it.",
  },
  {
    question: "What does certification actually mean?",
    answer:
      "Certification means an independent, third-party verification that your AI systems meet established safety standards. With CSOAI, you receive the CEASAI (Certified European AI Safety Analyst Institute) credential — recognized proof that your organization has been audited against EU AI Act, NIST AI RMF, and ISO 42001 requirements. It's the difference between saying 'we're compliant' and proving it with a credential.",
  },
  {
    question: "How is Byzantine consensus relevant to AI safety?",
    answer:
      "multi-leg council review means multiple independent agents must agree before a safety decision is finalized. CSOAI deploys 33 AI agents across 12 different providers — no single vendor can bias, compromise, or override a decision. This is the same cryptographic principle used in blockchain and military systems. Competitors rely on single-vendor models; CSOAI relies on democratic consensus.",
  },
  {
    question: "Is CSOAI a replacement for compliance tools?",
    answer:
      "No — we measure whether they are being used correctly. Think of it like accounting: QuickBooks manages your books, and an auditor examines them. We are the examination, not the certificate — no accredited certification chain exists for AI Act conformity yet. Credo AI, OneTrust, and IBM watsonx are your 'QuickBooks' for AI compliance. CSOAI is your auditor, certifier, and ongoing safety monitor.",
  },
];

function StatusIcon({ status }: { status: string }) {
  if (status === "yes") {
    return <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto" aria-label="Yes" />;
  }
  if (status === "no") {
    return <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 mx-auto" aria-label="No" />;
  }
  if (status === "partial") {
    return <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 mx-auto" aria-label="Partial" />;
  }
  return <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{status}</span>;
}

export default function CompetitorComparison() {
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const comparisonSchema = {
    "@context": "https://schema.org",
    "@type": "ComparisonTable",
    name: "CSOAI vs Credo AI, Holistic AI, IBM watsonx.governance",
    description:
      "Compare CSOAI against Credo AI, Holistic AI and IBM watsonx.governance. CSOAI leads on breadth (22 framework crosswalks), public transparency, self-serve pricing, free tooling, and 33-agent Byzantine monitoring.",
    about: {
      "@type": "Organization",
      name: "CSOAI",
      url: "https://csoai.org",
    },
    itemListElement: comparisonData.map((row) => ({
      "@type": "ListItem",
      name: row.feature,
      item: {
        "@type": "ItemList",
        itemListElement: row.values.map((val, idx) => ({
          "@type": "ListItem",
          name: competitors[idx],
          value: val === "yes" ? "Yes" : val === "no" ? "No" : val === "partial" ? "Partial" : val,
        })),
      },
    })),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-br from-white via-emerald-50 to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-950 py-24">
          <div className="container max-w-5xl space-y-4">
            <Skeleton className="h-8 w-40 bg-white/10" />
            <Skeleton className="h-14 w-full bg-white/10" />
            <Skeleton className="h-14 w-3/4 bg-white/10" />
            <Skeleton className="h-24 w-full bg-white/10" />
          </div>
        </div>
        <div className="container py-20">
          <div className="max-w-6xl mx-auto space-y-8">
            <Skeleton className="h-12 w-2/3 mx-auto" />
            <Skeleton className="h-96 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>CSOAI vs Credo AI, OneTrust, Holistic AI | AI Safety Certification Comparison</title>
        <meta
          name="description"
          content="Compare CSOAI against Credo AI, OneTrust, Holistic AI and Fiddler. CSOAI is the only AI safety certification body with 33-agent Byzantine monitoring."
        />
        <script type="application/ld+json">{JSON.stringify(comparisonSchema)}</script>
      </Helmet>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white via-emerald-50 to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-950 py-20 md:py-28">
        <div className="container max-w-5xl mx-auto px-4">
          <Badge className="mb-6 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
            Competitive Analysis
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
            CSOAI vs AI Governance Platforms —{" "}
            <span className="text-emerald-600 dark:text-emerald-400">The Certification Gap</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-10 max-w-3xl">
            Compliance software is necessary — but it is not sufficient. Every major platform can map frameworks and
            flag risks. Only CSOAI can <strong>certify</strong> that your AI meets safety standards, monitor it with 33
            autonomous agents, and back it with a UK-registered legal charter.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">
            <div className="flex items-center gap-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-6 py-4 border border-emerald-200 dark:border-emerald-800">
              <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">$3.59B</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">market by 2033</p>
              </div>
            </div>
            <Link href="/certification">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                Get Certified Before the EU AI Act
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="container max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
            Feature Comparison
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            What You Get — and What You Don't
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Green cells show CSOAI advantages. Red cells show critical gaps. No other platform offers certification,
            Byzantine monitoring, and economic redistribution in one system.
          </p>
        </div>

        <Card className="overflow-hidden border-2 border-emerald-100 dark:border-emerald-900">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50/80 dark:bg-emerald-950/50">
                  <TableHead className="min-w-[220px] text-gray-900 dark:text-white font-semibold">
                    Feature
                  </TableHead>
                  {competitors.map((name) => (
                    <TableHead
                      key={name}
                      className={`text-center font-semibold min-w-[120px] ${
                        name === "CSOAI"
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonData.map((row, idx) => (
                  <TableRow
                    key={row.feature}
                    className={idx % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-gray-50/50 dark:bg-gray-900/30"}
                  >
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {row.feature}
                    </TableCell>
                    {row.values.map((val, vIdx) => (
                      <TableCell
                        key={vIdx}
                        className={`text-center ${
                          vIdx === 0 && val === "yes"
                            ? "bg-emerald-50/60 dark:bg-emerald-950/30"
                            : vIdx === 0 && val === "partial"
                            ? "bg-amber-50/60 dark:bg-amber-950/20"
                            : ""
                        }`}
                      >
                        <StatusIcon status={val} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Yes / Available</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span>No / Missing</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>Partial / Limited</span>
          </div>
        </div>
      </div>

      {/* Why Software Alone Isn't Enough */}
      <div className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
              The Gap
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Software Alone Isn't Enough
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Every competitor on the list sells compliance <em>software</em>. CSOAI sells <em>trust</em>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-emerald-100 dark:border-emerald-900 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
              <CardContent className="p-8">
                <div className="inline-flex p-4 bg-emerald-100 dark:bg-emerald-900/50 rounded-full mb-6">
                  <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  Compliance tools document risk. CSOAI measures it.
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Credo AI writes reports. OneTrust builds checklists. But neither can issue a CEASAI certificate that
                  proves to regulators, customers, and insurers that your AI has been independently verified. Software
                  produces paperwork; certification produces proof.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-100 dark:border-emerald-900 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
              <CardContent className="p-8">
                <div className="inline-flex p-4 bg-emerald-100 dark:bg-emerald-900/50 rounded-full mb-6">
                  <Bot className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  33 agents watch your AI 24/7
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  No competitor deploys autonomous AI agents for real-time safety monitoring. CSOAI's 33-Agent Council
                  operates continuously across 12 different AI providers, using Byzantine consensus to catch drift,
                  bias, and anomalies before they become liabilities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-100 dark:border-emerald-900 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
              <CardContent className="p-8">
                <div className="inline-flex p-4 bg-emerald-100 dark:bg-emerald-900/50 rounded-full mb-6">
                  <Coins className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  The Prosperity Fund redistributes value
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  CSOAI is built on a charter that mandates economic fairness. A portion of every certification fee
                  flows into the Prosperity Fund, which supports displaced workers, open-source safety research, and
                  community grants. No competitor has fairness encoded into their legal structure.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* The CSOAI Difference */}
      <div className="container max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
            Unique Moat
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            The CSOAI Difference
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            These are not marketing claims. They are structural, legal, and technical advantages that no competitor can
            replicate overnight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-l-4 border-emerald-500 dark:border-emerald-600 p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">UK Legal Entity</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Registered at Companies House (16939677) with a constitutional 52-Article Charter. This is not a
                  Delaware C-Corp optimizing for exit value — it is a governed body with fiduciary duties to AI safety
                  and economic fairness.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-emerald-500 dark:border-emerald-600 p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">52-Article Charter</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Our constitutional framework legally binds the organization to transparency, multi-stakeholder
                  governance, and the Prosperity Fund. It cannot be unilaterally changed by a single founder or board.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-emerald-500 dark:border-emerald-600 p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                <Handshake className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Strategic partnership with defense-grade infrastructure ensures our monitoring and consensus systems
                  meet the highest security and resilience standards — standards that civilian compliance software rarely
                  achieves.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-emerald-500 dark:border-emerald-600 p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                <Network className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">365-Model Mesh Network (MEOKCLAW)</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  MEOKCLAW is a mesh network of 365+ specialized models that feed intelligence into the 33-Agent
                  Council. This gives CSOAI observability depth that no single MLOps platform or governance dashboard
                  can match.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white py-14">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-8">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-10 w-10 text-white/90" />
              <div className="text-left">
                <p className="text-3xl md:text-4xl font-bold">August 2, 2026</p>
                <p className="text-red-100">EU AI Act enforcement begins</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-16 bg-white/20" />
            <div className="text-left">
              <p className="text-3xl md:text-4xl font-bold">Up to 7%</p>
              <p className="text-red-100">global turnover or €35M penalties</p>
            </div>
          </div>
          <Link href="/certification">
            <Button
              size="lg"
              className="bg-white text-red-700 hover:bg-red-50 font-bold px-10"
            >
              Start CEASAI Certification
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
              Common Questions
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <Card key={idx} className="overflow-hidden border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-start justify-between gap-4"
                >
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                      expandedFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="container max-w-5xl mx-auto px-4 py-20">
        <Card className="p-10 md:p-14 bg-gradient-to-br from-slate-900 to-emerald-900 text-white text-center border-0">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Don't Settle for Software Without Certification
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Credo AI, OneTrust, and IBM watsonx will help you organize your compliance work. CSOAI will prove to the
            world that the work was done right. Get certified before the August 2026 deadline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/certification">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                Start CEASAI Certification
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/enterprise">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                Talk to Enterprise Sales
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

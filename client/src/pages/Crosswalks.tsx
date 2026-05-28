import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet-async";
import { Search, Globe, Shield, FileText, ExternalLink, ArrowRight, Calendar } from "lucide-react";

type Framework = {
  slug: string;
  name: string;
  region: string;
  binding: boolean;
  effective?: string;
  phase: number;
  phaseLabel: string;
  description: string;
  cite: string;
  pdfName?: string;
};

const FRAMEWORKS: Framework[] = [
  // Phase 1 — Foundation (AI Company Constitutions)
  { slug: "anthropic-constitutional-ai", name: "Anthropic Constitutional AI", region: "AI Company", binding: false, phase: 1, phaseLabel: "Foundation", description: "Constitutional AI principles → CSOAI care-generative paradigm.", cite: "Bai et al., 2022", pdfName: "CSOAI-ANTHROPIC-CONSTITUTIONAL-AI-CROSSWALK.pdf" },
  { slug: "openai-model-spec", name: "OpenAI Model Spec", region: "AI Company", binding: false, phase: 1, phaseLabel: "Foundation", description: "Model Spec rules → CSOAI Charter operational articles.", cite: "OpenAI, 2024", pdfName: "CSOAI-OPENAI-MODEL-SPEC-CROSSWALK.pdf" },

  // Phase 2 — Regulatory Compliance
  { slug: "eu-ai-act", name: "EU AI Act", region: "EU", binding: true, effective: "2 Aug 2026 (GPAI) · 2 Dec 2027 (Annex III high-risk)", phase: 2, phaseLabel: "Regulatory", description: "Regulation 2024/1689 — Articles 9 (RMS), 13 (IFU), 26 (deployer), 50 (transparency), 73 (incident).", cite: "EU 2024/1689", pdfName: "CSOAI-EU-AI-ACT-CROSSWALK.pdf" },
  { slug: "nist-ai-rmf", name: "NIST AI RMF 1.0", region: "US", binding: false, phase: 2, phaseLabel: "Regulatory", description: "Govern / Map / Measure / Manage — four functions, 19 categories, 72 subcategories.", cite: "NIST AI 100-1", pdfName: "CSOAI-NIST-AI-RMF-CROSSWALK.pdf" },
  { slug: "uk-aisi", name: "UK AISI", region: "UK", binding: false, phase: 2, phaseLabel: "Regulatory", description: "UK AI Safety Institute evaluation framework.", cite: "UK AISI 2024", pdfName: "CSOAI-UK-AISI-CROSSWALK.pdf" },
  { slug: "korea-ai-basic-act", name: "Korea AI Basic Act", region: "KR", binding: true, effective: "22 Jan 2026", phase: 2, phaseLabel: "Regulatory", description: "High-impact AI requirements + GenAI labelling.", cite: "Act No. 20193", pdfName: "CSOAI-KOREA-AI-BASIC-ACT-CROSSWALK.pdf" },
  { slug: "dora", name: "DORA", region: "EU", binding: true, effective: "17 Jan 2025", phase: 2, phaseLabel: "Regulatory", description: "Regulation 2022/2554 — Article 19 (4-hour incident clock for financial sector ICT).", cite: "EU 2022/2554" },
  { slug: "nis2", name: "NIS2", region: "EU", binding: true, effective: "18 Oct 2024", phase: 2, phaseLabel: "Regulatory", description: "Directive 2022/2555 — Article 23 (24h early warning / 72h incident / 1mo final report).", cite: "EU 2022/2555" },
  { slug: "cra", name: "CRA", region: "EU", binding: true, effective: "11 Sept 2026", phase: 2, phaseLabel: "Regulatory", description: "EU 2024/2847 — Article 14 active exploitation reports (24h early warning, 72h vulnerability).", cite: "EU 2024/2847" },
  { slug: "gdpr", name: "GDPR / UK GDPR", region: "EU/UK", binding: true, effective: "25 May 2018", phase: 2, phaseLabel: "Regulatory", description: "Article 22 — automated decision-making safeguards. Article 35 DPIA for high-risk.", cite: "EU 2016/679" },
  { slug: "hipaa", name: "HIPAA", region: "US", binding: true, effective: "1996", phase: 2, phaseLabel: "Regulatory", description: "US healthcare data protection + AI-specific applications.", cite: "Pub.L. 104-191" },

  // Phase 3 — International Standards
  { slug: "iso-42001", name: "ISO/IEC 42001", region: "ISO/IEC", binding: false, effective: "Dec 2023", phase: 3, phaseLabel: "Standards", description: "AI Management System standard. PDCA cycle. 10 clauses + Annex A controls.", cite: "ISO/IEC 42001:2023", pdfName: "CSOAI-ISO-IEC-42001-CROSSWALK.pdf" },
  { slug: "iso-42005", name: "ISO/IEC 42005", region: "ISO/IEC", binding: false, effective: "2025", phase: 3, phaseLabel: "Standards", description: "AI Impact Assessment standard.", cite: "ISO/IEC 42005:2025" },
  { slug: "oecd-ai-principles", name: "OECD AI Principles", region: "OECD", binding: false, phase: 3, phaseLabel: "Standards", description: "2019 + 2024 updates — 5 principles + 5 recommendations.", cite: "OECD/LEGAL/0449", pdfName: "CSOAI-OECD-AI-PRINCIPLES-CROSSWALK.pdf" },
  { slug: "unesco-ai-ethics", name: "UNESCO AI Ethics Recommendation", region: "UNESCO", binding: false, effective: "Nov 2021", phase: 3, phaseLabel: "Standards", description: "Values, principles, policy actions — adopted by 193 member states.", cite: "UNESCO 2021", pdfName: "CSOAI-UNESCO-AI-ETHICS-CROSSWALK.pdf" },
  { slug: "council-of-europe-ai-convention", name: "Council of Europe AI Convention", region: "Council of Europe", binding: true, effective: "Sept 2024", phase: 3, phaseLabel: "Standards", description: "First binding international AI treaty.", cite: "CETS No. 225", pdfName: "CSOAI-COUNCIL-OF-EUROPE-AI-CONVENTION-CROSSWALK.pdf" },

  // Phase 4 — Declarations
  { slug: "asilomar-ai-principles", name: "Asilomar AI Principles", region: "FLI", binding: false, effective: "2017", phase: 4, phaseLabel: "Declarations", description: "23 principles (Future of Life Institute).", cite: "FLI 2017", pdfName: "CSOAI-ASILOMAR-AI-PRINCIPLES-CROSSWALK.pdf" },
  { slug: "montreal-declaration", name: "Montreal Declaration", region: "Université de Montréal", binding: false, effective: "2018", phase: 4, phaseLabel: "Declarations", description: "Responsible AI development principles — 10 principles.", cite: "UdeM 2018", pdfName: "CSOAI-MONTREAL-DECLARATION-CROSSWALK.pdf" },
  { slug: "toronto-declaration", name: "Toronto Declaration", region: "Amnesty", binding: false, effective: "2018", phase: 4, phaseLabel: "Declarations", description: "Equality and non-discrimination in ML.", cite: "AI 2018", pdfName: "CSOAI-TORONTO-DECLARATION-CROSSWALK.pdf" },
  { slug: "beijing-ai-principles", name: "Beijing AI Principles", region: "BAAI", binding: false, effective: "2019", phase: 4, phaseLabel: "Declarations", description: "Chinese AI governance principles.", cite: "BAAI 2019", pdfName: "CSOAI-BEIJING-AI-PRINCIPLES-CROSSWALK.pdf" },

  // Phase 5 — Advanced Integration
  { slug: "g7-g20-ai-principles", name: "G7 / G20 AI Principles", region: "G7/G20", binding: false, phase: 5, phaseLabel: "Advanced", description: "International cooperation frameworks — Hiroshima Process + Bletchley Declaration.", cite: "G7 2023", pdfName: "CSOAI-G7-G20-AI-PRINCIPLES-CROSSWALK.pdf" },
  { slug: "ieee-ethically-aligned-design", name: "IEEE Ethically Aligned Design", region: "IEEE", binding: false, phase: 5, phaseLabel: "Advanced", description: "EAD v2 + IEEE P7000 series standards (P7001 transparency, P7002 data privacy, P7003 bias).", cite: "IEEE 2019", pdfName: "CSOAI-IEEE-ETHICALLY-ALIGNED-DESIGN-CROSSWALK.pdf" },
  { slug: "singapore-agentic-ai", name: "Singapore Agentic AI", region: "SG", binding: false, phase: 5, phaseLabel: "Advanced", description: "Singapore MAS / IMDA agentic AI guidance.", cite: "MAS/IMDA 2024", pdfName: "CSOAI-SINGAPORE-AGENTIC-AI-CROSSWALK.pdf" },
  { slug: "master-unified-crosswalk", name: "Master Unified Crosswalk", region: "CSOAI", binding: false, phase: 5, phaseLabel: "Advanced", description: "All 22 frameworks consolidated into one PDF — single source of truth for compliance teams.", cite: "CSOAI 2026", pdfName: "CSOAI-MASTER-UNIFIED-CROSSWALK.pdf" },

  // Phase 6 — Original Research
  { slug: "maritime-law-parallel", name: "Maritime Law → AI Law Parallel", region: "CSOAI Original", binding: false, phase: 6, phaseLabel: "Original Research", description: "Centuries of shipping regulation as precedent for AI governance — original CSOAI research.", cite: "CSOAI 2026", pdfName: "MARITIME-LAW-TO-AI-LAW-PARALLEL.pdf" },
  { slug: "essential-ai-law", name: "Creating Essential AI Law", region: "CSOAI Original", binding: false, phase: 6, phaseLabel: "Original Research", description: "What AI law must include to be effective — analysis of legislative essentials.", cite: "CSOAI 2026", pdfName: "CSOAI-CREATING-ESSENTIAL-AI-LAW.pdf" },
];

export default function Crosswalks() {
  const [query, setQuery] = useState("");
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const [bindingFilter, setBindingFilter] = useState<"all" | "binding" | "voluntary">("all");

  const filtered = useMemo(() => {
    return FRAMEWORKS.filter((f) => {
      const matchesQuery = !query ||
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.description.toLowerCase().includes(query.toLowerCase()) ||
        f.region.toLowerCase().includes(query.toLowerCase());
      const matchesPhase = activePhase === null || f.phase === activePhase;
      const matchesBinding = bindingFilter === "all" ||
        (bindingFilter === "binding" && f.binding) ||
        (bindingFilter === "voluntary" && !f.binding);
      return matchesQuery && matchesPhase && matchesBinding;
    });
  }, [query, activePhase, bindingFilter]);

  const phases = Array.from(new Set(FRAMEWORKS.map((f) => f.phase))).sort();
  const phaseLabels: Record<number, string> = {
    1: "Foundation",
    2: "Regulatory",
    3: "Standards",
    4: "Declarations",
    5: "Advanced",
    6: "Original Research",
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "Collection",
    "name": "CSOAI 22+ Framework Crosswalks",
    "description": "The CSOAI 52-Article Partnership Charter mapped to 22+ global AI governance frameworks.",
    "url": "https://csoai.org/crosswalks",
    "publisher": { "@type": "Organization", "name": "CSOAI LTD" },
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "hasPart": FRAMEWORKS.map((f) => ({
      "@type": "CreativeWork",
      "name": `CSOAI Charter × ${f.name} Crosswalk`,
      "url": `https://csoai.org/frameworks/${f.slug}`,
      "license": "https://creativecommons.org/licenses/by/4.0/",
    })),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>22+ Framework Crosswalks — CSOAI Charter mapped to global AI governance</title>
        <meta name="description" content="The CSOAI Charter mapped to EU AI Act, NIST AI RMF, ISO 42001, OECD, UNESCO, DORA, NIS2, CRA, GDPR + 14 more. Free under CC BY 4.0." />
        <link rel="canonical" href="https://csoai.org/crosswalks" />
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
      </Helmet>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-blue-950 dark:via-gray-900 dark:to-emerald-950 border-b border-blue-100 dark:border-blue-900">
        <div className="container max-w-5xl mx-auto px-6 py-16">
          <Badge className="bg-blue-600 text-white mb-4">
            <Globe className="w-3 h-3 mr-1" />
            22+ Framework Crosswalks · CC BY 4.0
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Every framework. One Charter.
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl leading-relaxed">
            The 52-Article CSOAI Partnership Charter mapped to every major global AI governance framework. Each crosswalk shows: how the framework's requirements map to CSOAI articles, where the gaps are, and which MEOK MCPs satisfy each clause.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Badge variant="outline" className="border-blue-600 text-blue-700 dark:text-blue-400">22+ frameworks</Badge>
            <Badge variant="outline" className="border-blue-600 text-blue-700 dark:text-blue-400">6 phases</Badge>
            <Badge variant="outline" className="border-blue-600 text-blue-700 dark:text-blue-400">28 PDFs</Badge>
            <Badge variant="outline" className="border-blue-600 text-blue-700 dark:text-blue-400">Free CC BY 4.0</Badge>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search frameworks by name, region, or description..."
              className="pl-10"
              data-testid="crosswalks-search"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activePhase === null ? "default" : "outline"}
              size="sm"
              onClick={() => setActivePhase(null)}
              className={activePhase === null ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              All phases
            </Button>
            {phases.map((p) => (
              <Button
                key={p}
                variant={activePhase === p ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePhase(p)}
                className={activePhase === p ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                Phase {p} · {phaseLabels[p]}
              </Button>
            ))}
            <div className="border-l border-gray-300 dark:border-gray-700 mx-2"></div>
            <Button
              variant={bindingFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setBindingFilter("all")}
              className={bindingFilter === "all" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              All
            </Button>
            <Button
              variant={bindingFilter === "binding" ? "default" : "outline"}
              size="sm"
              onClick={() => setBindingFilter("binding")}
              className={bindingFilter === "binding" ? "bg-rose-600 hover:bg-rose-700" : ""}
            >
              Binding only
            </Button>
            <Button
              variant={bindingFilter === "voluntary" ? "default" : "outline"}
              size="sm"
              onClick={() => setBindingFilter("voluntary")}
              className={bindingFilter === "voluntary" ? "bg-amber-600 hover:bg-amber-700" : ""}
            >
              Voluntary
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6" data-testid="crosswalks-results-count">
          Showing {filtered.length} of {FRAMEWORKS.length} frameworks
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((f) => (
            <Card key={f.slug} className="p-5 hover:border-emerald-500 hover:shadow-md transition-all group" data-testid={`framework-card-${f.slug}`}>
              <div className="flex items-start justify-between mb-3">
                <Badge variant="outline" className="text-xs">{f.region}</Badge>
                <Badge className={f.binding ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300" : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"}>
                  {f.binding ? "Binding" : "Voluntary"}
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {f.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{f.description}</p>
              {f.effective && (
                <div className="flex items-center gap-1 text-xs text-rose-700 dark:text-rose-400 mb-3">
                  <Calendar className="w-3 h-3" />
                  Effective: {f.effective}
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 font-mono">{f.cite}</span>
                <a
                  href={`https://csoai.org/frameworks/${f.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  Crosswalk <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500" data-testid="crosswalks-empty-state">
            No frameworks match your filters.
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-8 text-white text-center mt-12">
          <Shield className="w-10 h-10 mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2">Get the full library</h2>
          <p className="text-blue-50 mb-6 max-w-2xl mx-auto">All 28 PDFs as a single ZIP — research/education tier free under Stewardship Covenant License.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="mailto:nicholas@csoai.org?subject=Request%20full%20crosswalk%20library">
              <Button className="bg-white text-blue-700 hover:bg-blue-50">Request the ZIP</Button>
            </a>
            <a href="https://csoai.org/certify">
              <Button variant="outline" className="border-white text-white hover:bg-blue-800">
                Get Free Certified <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

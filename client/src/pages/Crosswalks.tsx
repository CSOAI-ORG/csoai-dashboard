import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Search, Globe, Shield, FileText, ExternalLink, ArrowRight, Calendar, Boxes } from "lucide-react";
import { FRAMEWORKS, mcpTagForFramework, type Framework } from "@/data/frameworks";

const mcpTagFor = mcpTagForFramework;



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
                <Link href={`/frameworks/${f.slug}`}>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer">
                    Crosswalk <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
              {mcpTagFor(f.name) && (
                <Link href={`/mcp?framework=${encodeURIComponent(mcpTagFor(f.name) as string)}`}>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer">
                    <Boxes className="w-3 h-3" /> MCP tools that satisfy this
                  </span>
                </Link>
              )}
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

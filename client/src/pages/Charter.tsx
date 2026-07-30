import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet-async";
import { Search, BookOpen, Shield, Users, Heart, Scale, Globe, Zap, ExternalLink } from "lucide-react";
import charterData from "@/data/charter_52.json";

type Article = {
  number: number;
  slug: string;
  title: string;
  filename: string;
  rel_path: string;
  size_bytes: number;
  preamble: string;
  tldr: string;
};

const CATEGORY_FOR_ARTICLE: Record<number, { label: string; icon: typeof Shield; tone: string }> = {
  1: { label: "Foundation", icon: Heart, tone: "bg-emerald-100 text-emerald-800" },
  2: { label: "Foundation", icon: Shield, tone: "bg-emerald-100 text-emerald-800" },
  3: { label: "Foundation", icon: Users, tone: "bg-emerald-100 text-emerald-800" },
  4: { label: "Foundation", icon: Zap, tone: "bg-emerald-100 text-emerald-800" },
  5: { label: "Foundation", icon: BookOpen, tone: "bg-emerald-100 text-emerald-800" },
  6: { label: "Foundation", icon: Heart, tone: "bg-emerald-100 text-emerald-800" },
  7: { label: "Foundation", icon: Users, tone: "bg-emerald-100 text-emerald-800" },
  8: { label: "Foundation", icon: Globe, tone: "bg-emerald-100 text-emerald-800" },
  9: { label: "Governance", icon: Scale, tone: "bg-amber-100 text-amber-800" },
  10: { label: "Governance", icon: Scale, tone: "bg-amber-100 text-amber-800" },
};

function categoryFor(n: number) {
  if (n <= 8) return { label: "Foundation", icon: Heart, tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" };
  if (n <= 15) return { label: "Governance", icon: Scale, tone: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" };
  if (n <= 25) return { label: "Compliance", icon: Shield, tone: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" };
  if (n <= 35) return { label: "Operations", icon: Zap, tone: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300" };
  if (n <= 45) return { label: "Multi-Agent", icon: Users, tone: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-300" };
  return { label: "Future", icon: Globe, tone: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300" };
}

export default function Charter() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const articles = charterData.articles as Article[];

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchesQuery = !query ||
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.preamble.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = !activeCategory || categoryFor(a.number).label === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [articles, query, activeCategory]);

  const categories = ["Foundation", "Governance", "Compliance", "Operations", "Multi-Agent", "Future"];

  const charterSchema = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": "CSOAI Partnership Charter — 52 Articles",
    "author": { "@type": "Organization", "name": "CSOAI LTD" },
    "publisher": { "@type": "Organization", "name": "CSOAI LTD", "identifier": "UK Companies House 16939677" },
    "numberOfPages": 52,
    "inLanguage": "en-GB",
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "datePublished": "2026-01-15",
    "description": "The 52-Article CSOAI Partnership Charter — the world's first relationship-based AI safety framework, mapped to 22+ global AI governance frameworks."
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>The 52-Article CSOAI Charter — Partnership over Control</title>
        <meta name="description" content="The CSOAI Partnership Charter — 52 articles establishing relationship-based AI safety. Maternal Covenant, Provable Safety, Byzantine Council. Free under CC BY 4.0." />
        <link rel="canonical" href="https://csoai.org/charter" />
        <meta property="og:title" content="The 52-Article CSOAI Charter" />
        <meta property="og:description" content="Partnership over control. 52 articles. Free under CC BY 4.0." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://csoai.org/charter" />
        <script type="application/ld+json">{JSON.stringify(charterSchema)}</script>
      </Helmet>

      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950 dark:via-gray-900 dark:to-amber-950 border-b border-emerald-100 dark:border-emerald-900">
        <div className="container max-w-5xl mx-auto px-6 py-16">
          <Badge className="bg-emerald-600 text-white mb-4">Foundation Document · CC BY 4.0</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            The 52-Article Partnership Charter
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl leading-relaxed">
            The world's first relationship-based AI safety framework. Partnership over control. Care over restriction. Every article maps to global governance frameworks.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Badge variant="outline" className="border-emerald-600 text-emerald-700 dark:text-emerald-400">52 Articles</Badge>
            <Badge variant="outline" className="border-emerald-600 text-emerald-700 dark:text-emerald-400">22+ Framework Crosswalks</Badge>
            <Badge variant="outline" className="border-emerald-600 text-emerald-700 dark:text-emerald-400">~100,000 words</Badge>
            <Badge variant="outline" className="border-emerald-600 text-emerald-700 dark:text-emerald-400">v1.0 · Effective 15 Jan 2026</Badge>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 52 articles by title or preamble..."
              className="pl-10"
              data-testid="charter-search"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(null)}
              className={activeCategory === null ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              All ({articles.length})
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className={activeCategory === cat ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6" data-testid="charter-results-count">
          Showing {filtered.length} of {articles.length} articles
        </p>

        {/* Article grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((article) => {
            const cat = categoryFor(article.number);
            const Icon = cat.icon;
            return (
              <Card
                key={article.number}
                className="p-5 hover:border-emerald-500 hover:shadow-md transition-all group"
                data-testid={`article-card-${article.number}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                      {article.number}
                    </div>
                    <Badge className={cat.tone + " text-xs"}>
                      <Icon className="w-3 h-3 mr-1" />
                      {cat.label}
                    </Badge>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  Article {article.number}: {article.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                  {article.preamble.slice(0, 180)}…
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-500">{(article.size_bytes / 1024).toFixed(1)} KB</span>
                  <a
                    href={`https://github.com/csoai-org/charter/blob/main/${article.rel_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    Read full text <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500" data-testid="charter-empty-state">
            No articles match your filters.
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container max-w-4xl mx-auto px-6 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Cite the Charter</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">All 52 articles are CC BY 4.0. Cite freely in research, policy, and product.</p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-left text-sm overflow-x-auto max-w-2xl mx-auto">
            <code>CSOAI Partnership Charter v1.0. CSOAI LTD (UK 16939677).{"\n"}https://csoai.org/charter. CC BY 4.0.</code>
          </pre>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <a href="https://csoai.org/frameworks" target="_blank" rel="noopener">
              <Button className="bg-emerald-600 hover:bg-emerald-700">See 22+ Framework Crosswalks</Button>
            </a>
            <a href="https://csoai.org/certify" target="_blank" rel="noopener">
              <Button variant="outline" className="border-emerald-600 text-emerald-700">Get Free Certified</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

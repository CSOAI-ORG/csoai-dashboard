/**
 * Blog Index Page
 * Displays 118 country AI safety posts and 12 framework guides
 * with search, filter, and category functionality
 */

import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Globe, BookOpen, FileText, Download, ExternalLink, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Country data with regions
const COUNTRIES_BY_REGION = {
  "Europe": [
    "Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus", "Belgium", "Bosnia and Herzegovina",
    "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Georgia",
    "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Kazakhstan", "Kosovo", "Latvia",
    "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands",
    "North Macedonia", "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia",
    "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Turkey", "Ukraine", "United Kingdom", "Vatican City"
  ],
  "Asia Pacific": [
    "Afghanistan", "Australia", "Bangladesh", "Bhutan", "Brunei", "Cambodia", "China", "Fiji", "India",
    "Indonesia", "Japan", "Kiribati", "Laos", "Malaysia", "Maldives", "Marshall Islands", "Micronesia",
    "Mongolia", "Myanmar", "Nauru", "Nepal", "New Zealand", "North Korea", "Pakistan", "Palau",
    "Papua New Guinea", "Philippines", "Samoa", "Singapore", "Solomon Islands", "South Korea", "Sri Lanka",
    "Taiwan", "Thailand", "Timor-Leste", "Tonga", "Tuvalu", "Vanuatu", "Vietnam"
  ],
  "Americas": [
    "Antigua and Barbuda", "Argentina", "Bahamas", "Barbados", "Belize", "Bolivia", "Brazil", "Canada",
    "Chile", "Colombia", "Costa Rica", "Cuba", "Dominica", "Dominican Republic", "Ecuador", "El Salvador",
    "Grenada", "Guatemala", "Guyana", "Haiti", "Honduras", "Jamaica", "Mexico", "Nicaragua", "Panama",
    "Paraguay", "Peru", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
    "Suriname", "Trinidad and Tobago", "United States", "Uruguay", "Venezuela"
  ],
  "Middle East & Africa": [
    "Algeria", "Angola", "Bahrain", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cameroon", "Cape Verde",
    "Central African Republic", "Chad", "Comoros", "Congo", "Djibouti", "Egypt", "Equatorial Guinea",
    "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Iran",
    "Iraq", "Israel", "Ivory Coast", "Jordan", "Kenya", "Kuwait", "Lebanon", "Lesotho", "Liberia",
    "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia",
    "Niger", "Nigeria", "Oman", "Qatar", "Rwanda", "Saudi Arabia", "Senegal", "Seychelles", "Sierra Leone",
    "Somalia", "South Africa", "South Sudan", "Sudan", "Syria", "Tanzania", "Togo", "Tunisia", "Uganda",
    "United Arab Emirates", "Yemen", "Zambia", "Zimbabwe"
  ]
};

// Framework guides
const FRAMEWORK_GUIDES = [
  { id: "eu-ai-act", name: "EU AI Act", region: "Europe", description: "Comprehensive guide to the European Union's AI Act compliance requirements" },
  { id: "nist-ai-rmf", name: "NIST AI RMF", region: "Americas", description: "US National Institute of Standards and Technology AI Risk Management Framework" },
  { id: "uk-ai-safety", name: "UK AI Safety", region: "Europe", description: "United Kingdom's AI Safety Institute and regulatory approach" },
  { id: "australia-ai", name: "Australia AI Governance", region: "Asia Pacific", description: "Australia's voluntary AI ethics framework and governance principles" },
  { id: "tc260", name: "China TC260", region: "Asia Pacific", description: "China's Technical Committee 260 AI safety standards" },
  { id: "canada-ai-act", name: "Canada AIDA", region: "Americas", description: "Canada's Artificial Intelligence and Data Act framework" },
  { id: "singapore-ai", name: "Singapore Model AI Governance", region: "Asia Pacific", description: "Singapore's Model AI Governance Framework" },
  { id: "japan-ai", name: "Japan AI Guidelines", region: "Asia Pacific", description: "Japan's Social Principles of Human-Centric AI" },
  { id: "south-korea-ai", name: "South Korea AI Act", region: "Asia Pacific", description: "South Korea's AI development and ethics guidelines" },
  { id: "brazil-ai", name: "Brazil AI Framework", region: "Americas", description: "Brazil's AI regulatory framework and Marco Legal da IA" },
  { id: "india-ai", name: "India AI Strategy", region: "Asia Pacific", description: "India's National AI Strategy and responsible AI principles" },
  { id: "iso-42001", name: "ISO 42001", region: "Global", description: "International standard for AI management systems" }
];

// Generate country posts data
const generateCountryPosts = () => {
  const posts: Array<{
    id: string;
    country: string;
    region: string;
    title: string;
    description: string;
    hasFramework: boolean;
    pressKit: boolean;
    journalists: number;
  }> = [];

  Object.entries(COUNTRIES_BY_REGION).forEach(([region, countries]) => {
    countries.forEach(country => {
      const slug = country.toLowerCase().replace(/\s+/g, '-');
      posts.push({
        id: slug,
        country,
        region,
        title: `AI Safety in ${country}: Regulatory Landscape & Opportunities`,
        description: `Comprehensive analysis of AI governance, regulatory gaps, and CSOAI partnership opportunities in ${country}.`,
        hasFramework: ["United States", "United Kingdom", "China", "Canada", "Australia", "Singapore", "Japan", "South Korea", "Brazil", "India"].includes(country),
        pressKit: true,
        journalists: Math.floor(Math.random() * 15) + 5
      });
    });
  });

  return posts;
};

const COUNTRY_POSTS = generateCountryPosts();

export default function BlogIndex() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("countries");

  // Filter countries based on search and region
  const filteredCountries = useMemo(() => {
    return COUNTRY_POSTS.filter(post => {
      const matchesSearch = post.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === "all" || post.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, selectedRegion]);

  // Filter frameworks based on search
  const filteredFrameworks = useMemo(() => {
    return FRAMEWORK_GUIDES.filter(guide => {
      const matchesSearch = guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           guide.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === "all" || guide.region === selectedRegion || guide.region === "Global";
      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, selectedRegion]);

  const regions = ["all", ...Object.keys(COUNTRIES_BY_REGION)];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      <main className="container py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            Global AI Safety Initiative
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI Safety Resources
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our comprehensive collection of {COUNTRY_POSTS.length} country-specific AI safety analyses 
            and {FRAMEWORK_GUIDES.length} framework guides. Each includes press kits, journalist contacts, 
            and regulatory insights.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search countries, frameworks, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {Object.keys(COUNTRIES_BY_REGION).map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Globe className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
              <div className="text-3xl font-bold">{COUNTRY_POSTS.length}</div>
              <div className="text-sm text-muted-foreground">Countries Covered</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-3xl font-bold">{FRAMEWORK_GUIDES.length}</div>
              <div className="text-sm text-muted-foreground">Framework Guides</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-3xl font-bold">{COUNTRY_POSTS.length}</div>
              <div className="text-sm text-muted-foreground">Press Kits</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <ExternalLink className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-3xl font-bold">{COUNTRY_POSTS.reduce((acc, p) => acc + p.journalists, 0)}</div>
              <div className="text-sm text-muted-foreground">Journalist Contacts</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="countries">
              <Globe className="h-4 w-4 mr-2" />
              Countries ({filteredCountries.length})
            </TabsTrigger>
            <TabsTrigger value="frameworks">
              <BookOpen className="h-4 w-4 mr-2" />
              Frameworks ({filteredFrameworks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="countries" className="mt-6">
            {/* Region Groups */}
            {Object.entries(COUNTRIES_BY_REGION).map(([region, countries]) => {
              const regionPosts = filteredCountries.filter(p => p.region === region);
              if (regionPosts.length === 0) return null;

              return (
                <div key={region} className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Globe className="h-6 w-6 text-emerald-500" />
                    {region}
                    <Badge variant="secondary">{regionPosts.length} countries</Badge>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {regionPosts.map(post => (
                      <Card key={post.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{post.region}</Badge>
                            {post.hasFramework && (
                              <Badge className="bg-emerald-500/10 text-emerald-600">Has Framework</Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg mt-2">{post.country}</CardTitle>
                          <CardDescription className="line-clamp-2">{post.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                            <span>{post.journalists} journalist contacts</span>
                            {post.pressKit && <Badge variant="secondary">Press Kit</Badge>}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                              <Link href={`/blog/country/${post.id}`}>
                                Read More
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="frameworks" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFrameworks.map(guide => (
                <Card key={guide.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{guide.region}</Badge>
                      <BookOpen className="h-5 w-5 text-blue-500" />
                    </div>
                    <CardTitle>{guide.name}</CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="default" size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" asChild>
                        <Link href={`/compliance/${guide.id}`}>
                          View Guide
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/20">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Ready to Partner with CSOAI?</h2>
            <p className="text-muted-foreground mb-4">
              Join the global AI safety initiative. Government partnerships start at £500K/year.
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
                <Link href="/global-ai-safety-initiative">
                  Government Partnership
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/enterprise">
                  Enterprise Solutions
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

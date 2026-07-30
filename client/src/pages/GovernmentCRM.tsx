/**
 * Government CRM Dashboard
 * Track government partnership leads, LOIs, and contract stages across 124 countries
 */

import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Search, Globe, Building2, FileText, Mail, Phone, Calendar,
  TrendingUp, Users, DollarSign, Clock, CheckCircle, AlertCircle,
  Plus, Edit, Trash2, ExternalLink, Download
} from "lucide-react";
import { toast } from "sonner";

// Pipeline stages
const PIPELINE_STAGES = [
  { id: "lead", name: "Lead", color: "bg-gray-500" },
  { id: "contacted", name: "Contacted", color: "bg-blue-500" },
  { id: "meeting", name: "Meeting Scheduled", color: "bg-yellow-500" },
  { id: "proposal", name: "Proposal Sent", color: "bg-purple-500" },
  { id: "loi", name: "LOI Signed", color: "bg-orange-500" },
  { id: "negotiation", name: "Negotiation", color: "bg-pink-500" },
  { id: "contract", name: "Contract Signed", color: "bg-emerald-500" },
  { id: "active", name: "Active Partner", color: "bg-green-600" },
];

// Sample government leads data
const generateGovernmentLeads = () => {
  const countries = [
    // Europe
    { country: "Germany", region: "Europe", tier: "Tier 1", population: 83, gdp: 4.2 },
    { country: "France", region: "Europe", tier: "Tier 1", population: 67, gdp: 2.9 },
    { country: "United Kingdom", region: "Europe", tier: "Tier 1", population: 67, gdp: 3.1 },
    { country: "Italy", region: "Europe", tier: "Tier 1", population: 59, gdp: 2.1 },
    { country: "Spain", region: "Europe", tier: "Tier 1", population: 47, gdp: 1.4 },
    { country: "Netherlands", region: "Europe", tier: "Tier 2", population: 17, gdp: 1.0 },
    { country: "Belgium", region: "Europe", tier: "Tier 2", population: 11, gdp: 0.6 },
    { country: "Sweden", region: "Europe", tier: "Tier 2", population: 10, gdp: 0.6 },
    { country: "Poland", region: "Europe", tier: "Tier 2", population: 38, gdp: 0.7 },
    { country: "Austria", region: "Europe", tier: "Tier 2", population: 9, gdp: 0.5 },
    // Asia Pacific
    { country: "Japan", region: "Asia Pacific", tier: "Tier 1", population: 125, gdp: 4.2 },
    { country: "South Korea", region: "Asia Pacific", tier: "Tier 1", population: 52, gdp: 1.8 },
    { country: "Australia", region: "Asia Pacific", tier: "Tier 1", population: 26, gdp: 1.7 },
    { country: "Singapore", region: "Asia Pacific", tier: "Tier 1", population: 6, gdp: 0.4 },
    { country: "India", region: "Asia Pacific", tier: "Tier 1", population: 1400, gdp: 3.4 },
    { country: "Indonesia", region: "Asia Pacific", tier: "Tier 2", population: 270, gdp: 1.3 },
    { country: "Thailand", region: "Asia Pacific", tier: "Tier 2", population: 70, gdp: 0.5 },
    { country: "Malaysia", region: "Asia Pacific", tier: "Tier 2", population: 33, gdp: 0.4 },
    { country: "Vietnam", region: "Asia Pacific", tier: "Tier 2", population: 98, gdp: 0.4 },
    { country: "Philippines", region: "Asia Pacific", tier: "Tier 2", population: 110, gdp: 0.4 },
    // Americas
    { country: "United States", region: "Americas", tier: "Tier 1", population: 330, gdp: 25.5 },
    { country: "Canada", region: "Americas", tier: "Tier 1", population: 38, gdp: 2.1 },
    { country: "Brazil", region: "Americas", tier: "Tier 1", population: 215, gdp: 1.9 },
    { country: "Mexico", region: "Americas", tier: "Tier 2", population: 130, gdp: 1.3 },
    { country: "Argentina", region: "Americas", tier: "Tier 2", population: 45, gdp: 0.6 },
    { country: "Chile", region: "Americas", tier: "Tier 2", population: 19, gdp: 0.3 },
    { country: "Colombia", region: "Americas", tier: "Tier 2", population: 51, gdp: 0.3 },
    // Middle East & Africa
    { country: "United Arab Emirates", region: "Middle East & Africa", tier: "Tier 1", population: 10, gdp: 0.5 },
    { country: "Saudi Arabia", region: "Middle East & Africa", tier: "Tier 1", population: 35, gdp: 1.1 },
    { country: "Israel", region: "Middle East & Africa", tier: "Tier 1", population: 9, gdp: 0.5 },
    { country: "South Africa", region: "Middle East & Africa", tier: "Tier 2", population: 60, gdp: 0.4 },
    { country: "Nigeria", region: "Middle East & Africa", tier: "Tier 2", population: 220, gdp: 0.5 },
    { country: "Egypt", region: "Middle East & Africa", tier: "Tier 2", population: 105, gdp: 0.5 },
    { country: "Kenya", region: "Middle East & Africa", tier: "Tier 2", population: 55, gdp: 0.1 },
    { country: "Morocco", region: "Middle East & Africa", tier: "Tier 2", population: 37, gdp: 0.1 },
  ];

  const stages = ["lead", "contacted", "meeting", "proposal", "loi", "negotiation", "contract", "active"];
  
  return countries.map((c, i) => ({
    id: i + 1,
    ...c,
    stage: stages[Math.floor(Math.random() * stages.length)],
    contactName: `Ministry of ${["Digital", "Technology", "Innovation", "AI", "Science"][Math.floor(Math.random() * 5)]} Official`,
    contactEmail: `contact@${c.country.toLowerCase().replace(/\s+/g, '')}.gov`,
    contactPhone: `+${Math.floor(Math.random() * 99) + 1} ${Math.floor(Math.random() * 900000000) + 100000000}`,
    lastContact: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nextFollowUp: new Date(Date.now() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dealValue: c.tier === "Tier 1" ? Math.floor(Math.random() * 5 + 5) * 1000000 : Math.floor(Math.random() * 3 + 1) * 500000,
    notes: `Initial outreach for ${c.country} government AI safety partnership.`,
    linkedinContacts: Math.floor(Math.random() * 5) + 1,
    pressContacts: Math.floor(Math.random() * 10) + 3,
  }));
};

const GOVERNMENT_LEADS = generateGovernmentLeads();

export default function GovernmentCRM() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [leads, setLeads] = useState(GOVERNMENT_LEADS);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           lead.contactName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === "all" || lead.region === selectedRegion;
      const matchesStage = selectedStage === "all" || lead.stage === selectedStage;
      const matchesTier = selectedTier === "all" || lead.tier === selectedTier;
      return matchesSearch && matchesRegion && matchesStage && matchesTier;
    });
  }, [leads, searchQuery, selectedRegion, selectedStage, selectedTier]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalValue = leads.reduce((acc, l) => acc + l.dealValue, 0);
    const activeDeals = leads.filter(l => ["proposal", "loi", "negotiation"].includes(l.stage)).length;
    const wonDeals = leads.filter(l => ["contract", "active"].includes(l.stage)).length;
    const pipelineValue = leads.filter(l => !["lead", "contacted"].includes(l.stage))
      .reduce((acc, l) => acc + l.dealValue, 0);
    
    return {
      totalLeads: leads.length,
      totalValue,
      activeDeals,
      wonDeals,
      pipelineValue,
      conversionRate: ((wonDeals / leads.length) * 100).toFixed(1)
    };
  }, [leads]);

  // Stage counts for pipeline view
  const stageCounts = useMemo(() => {
    const counts: Record<string, { count: number; value: number }> = {};
    PIPELINE_STAGES.forEach(stage => {
      const stageLeads = leads.filter(l => l.stage === stage.id);
      counts[stage.id] = {
        count: stageLeads.length,
        value: stageLeads.reduce((acc, l) => acc + l.dealValue, 0)
      };
    });
    return counts;
  }, [leads]);

  const updateLeadStage = (leadId: number, newStage: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
    toast.success("Lead stage updated");
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `£${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `£${(value / 1000).toFixed(0)}K`;
    return `£${value}`;
  };

  const getStageColor = (stage: string) => {
    return PIPELINE_STAGES.find(s => s.id === stage)?.color || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      <main className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8 text-emerald-500" />
              Government Partnership CRM
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage government partnerships across 124 countries
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Government Lead</DialogTitle>
                  <DialogDescription>
                    Enter details for a new government partnership lead.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Country</Label>
                    <Input placeholder="Country name" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Contact Name</Label>
                    <Input placeholder="Contact person" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="email@gov.country" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Notes</Label>
                    <Textarea placeholder="Initial notes..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                    toast.success("Lead added successfully");
                    setIsAddDialogOpen(false);
                  }}>Add Lead</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Globe className="h-4 w-4" />
                Total Leads
              </div>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <DollarSign className="h-4 w-4" />
                Total Value
              </div>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Clock className="h-4 w-4" />
                Active Deals
              </div>
              <div className="text-2xl font-bold">{stats.activeDeals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle className="h-4 w-4" />
                Won Deals
              </div>
              <div className="text-2xl font-bold text-emerald-600">{stats.wonDeals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <TrendingUp className="h-4 w-4" />
                Pipeline Value
              </div>
              <div className="text-2xl font-bold">{formatCurrency(stats.pipelineValue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="h-4 w-4" />
                Conversion
              </div>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline View */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
            <CardDescription>Deal stages and values across the sales pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-4">
              {PIPELINE_STAGES.map(stage => (
                <div key={stage.id} className="flex-1 min-w-[120px]">
                  <div className={`${stage.color} text-white text-center py-2 rounded-t-lg text-sm font-medium`}>
                    {stage.name}
                  </div>
                  <div className="border border-t-0 rounded-b-lg p-3 text-center bg-card">
                    <div className="text-2xl font-bold">{stageCounts[stage.id]?.count || 0}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(stageCounts[stage.id]?.value || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search countries or contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="Europe">Europe</SelectItem>
              <SelectItem value="Asia Pacific">Asia Pacific</SelectItem>
              <SelectItem value="Americas">Americas</SelectItem>
              <SelectItem value="Middle East & Africa">Middle East & Africa</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStage} onValueChange={setSelectedStage}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {PIPELINE_STAGES.map(stage => (
                <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="Tier 1">Tier 1</SelectItem>
              <SelectItem value="Tier 2">Tier 2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Leads Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Deal Value</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Next Follow-up</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map(lead => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="font-medium">{lead.country}</div>
                      <div className="text-xs text-muted-foreground">{lead.tier}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.region}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select value={lead.stage} onValueChange={(v) => updateLeadStage(lead.id, v)}>
                        <SelectTrigger className="w-[140px]">
                          <Badge className={`${getStageColor(lead.stage)} text-white`}>
                            {PIPELINE_STAGES.find(s => s.id === lead.stage)?.name}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {PIPELINE_STAGES.map(stage => (
                            <SelectItem key={stage.id} value={stage.id}>
                              <Badge className={`${stage.color} text-white`}>{stage.name}</Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{lead.contactName}</div>
                      <div className="text-xs text-muted-foreground">{lead.contactEmail}</div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(lead.dealValue)}</TableCell>
                    <TableCell>{lead.lastContact}</TableCell>
                    <TableCell>
                      <Badge variant={new Date(lead.nextFollowUp) < new Date() ? "destructive" : "secondary"}>
                        {lead.nextFollowUp}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredLeads.length} of {leads.length} government leads
        </div>
      </main>

      <Footer />
    </div>
  );
}

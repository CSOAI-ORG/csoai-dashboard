/**
 * Email Automation Dashboard
 * Set up automated email sequences to contact journalists and press contacts
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
import { Switch } from "@/components/ui/switch";
import {
  Search, Mail, Send, Clock, Users, TrendingUp, CheckCircle,
  AlertCircle, Play, Pause, Plus, Edit, Trash2, Copy, Eye,
  Calendar, BarChart3, Globe, Newspaper
} from "lucide-react";
import { toast } from "sonner";

// Email campaign types
const CAMPAIGN_TYPES = [
  { id: "press_release", name: "Press Release", icon: Newspaper },
  { id: "partnership", name: "Partnership Outreach", icon: Users },
  { id: "follow_up", name: "Follow-up Sequence", icon: Clock },
  { id: "announcement", name: "Product Announcement", icon: Send },
];

// Email templates
const EMAIL_TEMPLATES = [
  {
    id: "press_new_year",
    name: "New Year Launch Press Release",
    subject: "CSOAI Launches Global AI Safety Initiative - {{country}} Partnership Opportunity",
    body: `Dear {{journalist_name}},

Happy New Year from CSOAI!

As the EU AI Act enforcement deadline approaches (August 2, 2026), we're launching a groundbreaking global AI safety initiative that directly impacts {{country}}.

Key Highlights:
• First-ever independent AI safety certification body
• Government partnership opportunities starting at £500K/year
• Free training for the first 10,000 analysts

{{country}} currently lacks comprehensive AI governance legislation. CSOAI offers a turnkey solution:
• White-label national AI safety framework
• Certified analyst workforce
• 33-Agent Byzantine Council for impartial AI decisions
• SOAI-PDCA continuous improvement methodology

We'd love to offer you an exclusive interview or provide additional information for your coverage.

Press Kit: https://csoai.org/press/{{country_slug}}
Full Story: https://csoai.org/blog/country/{{country_slug}}

Best regards,
CSOAI Press Team
press@csoai.org`,
    variables: ["journalist_name", "country", "country_slug"],
  },
  {
    id: "gov_partnership",
    name: "Government Partnership Inquiry",
    subject: "AI Safety Partnership Opportunity for {{country}} Government",
    body: `Dear {{contact_name}},

I hope this message finds you well. I'm reaching out from CSOAI, the world's first independent AI safety certification body.

With the EU AI Act setting global precedents for AI governance, {{country}} has a unique opportunity to establish leadership in AI safety.

Our Government Partnership Program offers:
• White-label national AI safety framework
• Trained and certified AI Safety Analysts
• Real-time compliance monitoring dashboard
• Integration with international standards (EU AI Act, NIST, ISO 42001)

Partnership tiers:
• Foundation: £500K/year - Basic framework implementation
• Standard: £2M/year - Full platform with analyst certification
• Premium: £5M/year - Custom framework + dedicated support
• Enterprise: £10M/year - Complete ecosystem deployment

We've already engaged with {{engaged_countries}} governments and would welcome the opportunity to discuss how CSOAI can support {{country}}'s AI governance goals.

Would you be available for a 30-minute call this week?

Best regards,
{{sender_name}}
CSOAI Government Partnerships
gov@csoai.org`,
    variables: ["contact_name", "country", "engaged_countries", "sender_name"],
  },
  {
    id: "influencer_collab",
    name: "Influencer Collaboration Request",
    subject: "Partnership Opportunity: AI Safety Initiative",
    body: `Hi {{influencer_name}},

I've been following your work on {{topic}} and believe there's a meaningful collaboration opportunity.

CSOAI is launching the world's first AI Safety Analyst certification program in the AI safety sector.

We'd love to explore:
• Sponsored content about AI safety careers
• Exclusive early access to our platform
• Affiliate partnership (20% commission)
• Co-branded educational content

Our £1,000,000 training giveaway campaign launches January 1st, and we'd love to have you involved.

Interested in learning more?

Best,
{{sender_name}}
CSOAI Partnerships`,
    variables: ["influencer_name", "topic", "sender_name"],
  },
];

// Sample campaigns data
const SAMPLE_CAMPAIGNS = [
  {
    id: 1,
    name: "New Year Global Press Release",
    type: "press_release",
    template: "press_new_year",
    status: "scheduled",
    recipients: 1240,
    sent: 0,
    opened: 0,
    clicked: 0,
    replied: 0,
    scheduledTime: "2025-01-01T00:00:00Z",
    regions: ["Europe", "Asia Pacific", "Americas", "Middle East & Africa"],
  },
  {
    id: 2,
    name: "EU Government Outreach",
    type: "partnership",
    template: "gov_partnership",
    status: "active",
    recipients: 27,
    sent: 15,
    opened: 8,
    clicked: 5,
    replied: 3,
    scheduledTime: "2024-12-30T09:00:00Z",
    regions: ["Europe"],
  },
  {
    id: 3,
    name: "AI Influencer Campaign",
    type: "announcement",
    template: "influencer_collab",
    status: "draft",
    recipients: 500,
    sent: 0,
    opened: 0,
    clicked: 0,
    replied: 0,
    scheduledTime: null,
    regions: ["Global"],
  },
];

// Sample contacts
const SAMPLE_CONTACTS = [
  { id: 1, name: "Sarah Johnson", email: "sarah@techcrunch.com", outlet: "TechCrunch", country: "United States", type: "journalist", status: "active" },
  { id: 2, name: "Marcus Chen", email: "mchen@wired.com", outlet: "Wired", country: "United States", type: "journalist", status: "active" },
  { id: 3, name: "Emma Schmidt", email: "eschmidt@spiegel.de", outlet: "Der Spiegel", country: "Germany", type: "journalist", status: "active" },
  { id: 4, name: "Pierre Dubois", email: "pdubois@lemonde.fr", outlet: "Le Monde", country: "France", type: "journalist", status: "active" },
  { id: 5, name: "Yuki Tanaka", email: "ytanaka@nikkei.com", outlet: "Nikkei", country: "Japan", type: "journalist", status: "active" },
  { id: 6, name: "Ministry of Digital", email: "digital@gov.de", outlet: "German Government", country: "Germany", type: "government", status: "active" },
  { id: 7, name: "AI Ethics Board", email: "ethics@gov.uk", outlet: "UK Government", country: "United Kingdom", type: "government", status: "active" },
];

export default function EmailAutomation() {
  const [campaigns, setCampaigns] = useState(SAMPLE_CAMPAIGNS);
  const [contacts, setContacts] = useState(SAMPLE_CONTACTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("campaigns");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  // Stats
  const stats = useMemo(() => {
    const totalSent = campaigns.reduce((acc, c) => acc + c.sent, 0);
    const totalOpened = campaigns.reduce((acc, c) => acc + c.opened, 0);
    const totalClicked = campaigns.reduce((acc, c) => acc + c.clicked, 0);
    const totalReplied = campaigns.reduce((acc, c) => acc + c.replied, 0);
    
    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === "active").length,
      totalContacts: contacts.length,
      totalSent,
      openRate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : "0",
      clickRate: totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : "0",
      replyRate: totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : "0",
    };
  }, [campaigns, contacts]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [campaigns, searchQuery]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.outlet.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "scheduled": return "bg-blue-500";
      case "paused": return "bg-yellow-500";
      case "completed": return "bg-gray-500";
      case "draft": return "bg-gray-400";
      default: return "bg-gray-500";
    }
  };

  const toggleCampaignStatus = (id: number) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const newStatus = c.status === "active" ? "paused" : "active";
        return { ...c, status: newStatus };
      }
      return c;
    }));
    toast.success("Campaign status updated");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      <main className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Mail className="h-8 w-8 text-emerald-500" />
              Email Automation
            </h1>
            <p className="text-muted-foreground mt-1">
              Automated email sequences for press outreach and partnerships
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Email Campaign</DialogTitle>
                <DialogDescription>
                  Set up a new automated email sequence for press outreach.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Campaign Name</Label>
                  <Input placeholder="e.g., New Year Press Release - Europe" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Campaign Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CAMPAIGN_TYPES.map(type => (
                          <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Email Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMAIL_TEMPLATES.map(template => (
                          <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Target Regions</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Europe", "Asia Pacific", "Americas", "Middle East & Africa"].map(region => (
                      <Badge key={region} variant="outline" className="cursor-pointer hover:bg-emerald-500/10">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Schedule</Label>
                  <div className="flex gap-2">
                    <Input type="datetime-local" className="flex-1" />
                    <Button variant="outline">Send Now</Button>
                  </div>
                </div>
                {selectedTemplate && (
                  <div className="grid gap-2">
                    <Label>Preview</Label>
                    <div className="border rounded-lg p-4 bg-muted/50 max-h-[200px] overflow-y-auto">
                      <div className="font-medium mb-2">
                        Subject: {EMAIL_TEMPLATES.find(t => t.id === selectedTemplate)?.subject}
                      </div>
                      <pre className="text-sm whitespace-pre-wrap font-sans">
                        {EMAIL_TEMPLATES.find(t => t.id === selectedTemplate)?.body}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                  toast.success("Campaign created successfully");
                  setIsCreateDialogOpen(false);
                }}>Create Campaign</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="h-4 w-4" />
                Campaigns
              </div>
              <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Play className="h-4 w-4" />
                Active
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.activeCampaigns}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="h-4 w-4" />
                Contacts
              </div>
              <div className="text-2xl font-bold">{stats.totalContacts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Send className="h-4 w-4" />
                Sent
              </div>
              <div className="text-2xl font-bold">{stats.totalSent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Eye className="h-4 w-4" />
                Open Rate
              </div>
              <div className="text-2xl font-bold">{stats.openRate}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <TrendingUp className="h-4 w-4" />
                Click Rate
              </div>
              <div className="text-2xl font-bold">{stats.clickRate}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle className="h-4 w-4" />
                Reply Rate
              </div>
              <div className="text-2xl font-bold text-emerald-600">{stats.replyRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns or contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="campaigns">
              <Mail className="h-4 w-4 mr-2" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="contacts">
              <Users className="h-4 w-4 mr-2" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Copy className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Opened</TableHead>
                      <TableHead>Clicked</TableHead>
                      <TableHead>Replied</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampaigns.map(campaign => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {campaign.scheduledTime ? new Date(campaign.scheduledTime).toLocaleString() : "Not scheduled"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {CAMPAIGN_TYPES.find(t => t.id === campaign.type)?.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{campaign.recipients}</TableCell>
                        <TableCell>{campaign.sent}</TableCell>
                        <TableCell>{campaign.opened}</TableCell>
                        <TableCell>{campaign.clicked}</TableCell>
                        <TableCell>{campaign.replied}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => toggleCampaignStatus(campaign.id)}
                            >
                              {campaign.status === "active" ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Outlet</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map(contact => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{contact.outlet}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{contact.country}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={contact.type === "journalist" ? "default" : "secondary"}>
                            {contact.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={contact.status === "active" ? "bg-green-500" : "bg-gray-500"}>
                            {contact.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon">
                              <Mail className="h-4 w-4" />
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
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EMAIL_TEMPLATES.map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-1">{template.subject}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {template.body.substring(0, 150)}...
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.variables.map(v => (
                        <Badge key={v} variant="secondary" className="text-xs">
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}

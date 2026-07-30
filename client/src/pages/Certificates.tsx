/**
 * Certificates Page
 * Display earned certificates, achievements, and credentials
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Share2, Award, Calendar, User, CheckCircle2, Trophy, Zap, BookOpen, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Certificate {
  id: string;
  title: string;
  courseName: string;
  issueDate: string;
  expiryDate?: string;
  certificateId: string;
  score: number;
  instructor: string;
  credentialUrl: string;
  image: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  skills: string[];
  isPublic: boolean;
}

const mockCertificates: Certificate[] = [
  {
    id: '1',
    title: 'AI Safety Fundamentals Certified',
    courseName: 'AI Safety Fundamentals',
    issueDate: '2024-06-15',
    expiryDate: '2026-06-15',
    certificateId: 'CSOAI-2024-001234',
    score: 92,
    instructor: 'Dr. Sarah Chen',
    credentialUrl: 'https://credentials.csoai.org/verify/CSOAI-2024-001234',
    image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    level: 'Beginner',
    skills: ['AI Safety', 'Risk Assessment', 'Alignment Basics'],
    isPublic: true,
  },
  {
    id: '2',
    title: 'Compliance & Regulatory Framework Certified',
    courseName: 'Compliance & Regulatory Framework',
    issueDate: '2024-09-20',
    expiryDate: '2026-09-20',
    certificateId: 'CSOAI-2024-005678',
    score: 88,
    instructor: 'Dr. Emma Rodriguez',
    credentialUrl: 'https://credentials.csoai.org/verify/CSOAI-2024-005678',
    image: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    level: 'Intermediate',
    skills: ['EU AI Act', 'NIST Guidelines', 'Governance'],
    isPublic: true,
  },
  {
    id: '3',
    title: 'Stakeholder Communication Certified',
    courseName: 'Stakeholder Communication',
    issueDate: '2024-12-10',
    certificateId: 'CSOAI-2024-009012',
    score: 95,
    instructor: 'Prof. David Kumar',
    credentialUrl: 'https://credentials.csoai.org/verify/CSOAI-2024-009012',
    image: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
    level: 'Intermediate',
    skills: ['Executive Communication', 'Risk Communication', 'Stakeholder Management'],
    isPublic: false,
  },
  {
    id: '4',
    title: 'Introduction to Machine Learning Certified',
    courseName: 'Introduction to Machine Learning',
    issueDate: '2024-03-05',
    expiryDate: '2025-03-05',
    certificateId: 'CSOAI-2024-003456',
    score: 87,
    instructor: 'Prof. Alex Johnson',
    credentialUrl: 'https://credentials.csoai.org/verify/CSOAI-2024-003456',
    image: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    level: 'Beginner',
    skills: ['Neural Networks', 'Deep Learning', 'ML Fundamentals'],
    isPublic: true,
  },
];

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function Certificates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const filteredCertificates = useMemo(() => {
    let filtered = mockCertificates.filter(cert => {
      const matchesSearch = cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.instructor.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLevel = selectedLevel === 'All' || cert.level === selectedLevel;
      
      return matchesSearch && matchesLevel;
    });

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    } else if (sortBy === 'score') {
      filtered.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'expiry') {
      filtered.sort((a, b) => {
        const aDate = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
        const bDate = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
        return aDate - bDate;
      });
    }

    return filtered;
  }, [searchQuery, selectedLevel, sortBy]);

  const stats = {
    total: mockCertificates.length,
    active: mockCertificates.filter(c => !c.expiryDate || new Date(c.expiryDate) > new Date()).length,
    public: mockCertificates.filter(c => c.isPublic).length,
    avgScore: Math.round(mockCertificates.reduce((sum, c) => sum + c.score, 0) / mockCertificates.length),
  };

  const handleDownloadCertificate = (cert: Certificate) => {
    toast.success('Certificate downloaded', {
      description: `${cert.title} has been downloaded`,
    });
  };

  const handleShareCertificate = (cert: Certificate) => {
    navigator.clipboard.writeText(cert.credentialUrl);
    toast.success('Link copied to clipboard', {
      description: 'Share this credential with others',
    });
  };

  const handleTogglePublic = (cert: Certificate) => {
    toast.success(cert.isPublic ? 'Certificate hidden' : 'Certificate published', {
      description: cert.isPublic ? 'Only you can see this certificate' : 'Your certificate is now publicly visible',
    });
  };

  const isExpired = (cert: Certificate) => {
    if (!cert.expiryDate) return false;
    return new Date(cert.expiryDate) < new Date();
  };

  const daysUntilExpiry = (cert: Certificate) => {
    if (!cert.expiryDate) return null;
    const today = new Date();
    const expiry = new Date(cert.expiryDate);
    const diff = expiry.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Certificates</h1>
              <p className="text-sm text-muted-foreground mt-1">
                View, share, and manage your earned credentials
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total Certificates</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <p className="text-xs text-muted-foreground">Active</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-purple-600">{stats.public}</div>
                <p className="text-xs text-muted-foreground">Public</p>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-orange-600">{stats.avgScore}%</div>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search certificates by course, instructor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-3 flex-wrap justify-between items-center">
              <div className="flex gap-3 flex-wrap">
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently Issued</SelectItem>
                    <SelectItem value="score">Highest Score</SelectItem>
                    <SelectItem value="expiry">Expiring Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {filteredCertificates.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No certificates found</h3>
              <p className="text-muted-foreground mb-4">
                Complete courses to earn certificates
              </p>
              <Button variant="outline">Browse Courses</Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((cert, idx) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col group">
                  {/* Certificate Visual */}
                  <div
                    className="h-40 bg-gradient-to-br relative"
                    style={{ background: cert.image }}
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Trophy className="h-12 w-12 text-white opacity-70" />
                    </div>
                    
                    {isExpired(cert) && (
                      <Badge className="absolute top-2 right-2 bg-red-500">Expired</Badge>
                    )}
                    {cert.isPublic && (
                      <Badge className="absolute top-2 left-2 bg-green-500">Public</Badge>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-base line-clamp-2">{cert.title}</CardTitle>
                    <CardDescription className="text-xs">{cert.courseName}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Score</span>
                        <span className="font-bold text-foreground">{cert.score}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${cert.score}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Issued {new Date(cert.issueDate).toLocaleDateString()}</span>
                      </div>
                      {cert.expiryDate && (
                        <div className={`flex items-center gap-1 ${isExpired(cert) ? 'text-red-600' : daysUntilExpiry(cert)! < 90 ? 'text-orange-600' : 'text-green-600'}`}>
                          <Zap className="h-3 w-3" />
                          <span>
                            {isExpired(cert)
                              ? 'Expired'
                              : `Expires in ${daysUntilExpiry(cert)} days`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {cert.skills.slice(0, 2).map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {cert.skills.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{cert.skills.length - 2}
                        </Badge>
                      )}
                    </div>

                    <Dialog open={selectedCert?.id === cert.id} onOpenChange={(open) => !open && setSelectedCert(null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="w-full" onClick={() => setSelectedCert(cert)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{cert.title}</DialogTitle>
                          <DialogDescription>{cert.courseName}</DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div
                            className="w-full h-48 rounded-lg bg-gradient-to-br"
                            style={{ background: cert.image }}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Certificate ID</p>
                              <p className="font-mono text-sm font-medium">{cert.certificateId}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Score</p>
                              <p className="text-2xl font-bold text-green-600">{cert.score}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Issued</p>
                              <p className="text-sm font-medium">{new Date(cert.issueDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Instructor</p>
                              <p className="text-sm font-medium">{cert.instructor}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Skills Earned</p>
                            <div className="flex flex-wrap gap-2">
                              {cert.skills.map(skill => (
                                <Badge key={skill} variant="secondary">{skill}</Badge>
                              ))}
                            </div>
                          </div>

                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Verify Credential</p>
                            <p className="text-xs font-mono break-all">{cert.credentialUrl}</p>
                          </div>

                          <div className="flex gap-2">
                            <Button className="flex-1" onClick={() => handleDownloadCertificate(cert)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => handleShareCertificate(cert)}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCertificates.map((cert, idx) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Certificate Icon */}
                      <div
                        className="w-16 h-16 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0"
                        style={{ background: cert.image }}
                      >
                        <Trophy className="h-8 w-8 text-white opacity-70" />
                      </div>

                      {/* Certificate Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <h3 className="font-semibold text-foreground line-clamp-1">{cert.title}</h3>
                            <p className="text-xs text-muted-foreground">{cert.courseName}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            {isExpired(cert) && <Badge className="bg-red-500 text-xs">Expired</Badge>}
                            {cert.isPublic && <Badge className="bg-green-500 text-xs">Public</Badge>}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(cert.issueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            <span>Score: {cert.score}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{cert.instructor}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Dialog open={selectedCert?.id === cert.id} onOpenChange={(open) => !open && setSelectedCert(null)}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedCert(cert)}>
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{cert.title}</DialogTitle>
                              <DialogDescription>{cert.courseName}</DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div
                                className="w-full h-48 rounded-lg bg-gradient-to-br"
                                style={{ background: cert.image }}
                              />
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground">Certificate ID</p>
                                  <p className="font-mono text-sm font-medium">{cert.certificateId}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Score</p>
                                  <p className="text-2xl font-bold text-green-600">{cert.score}%</p>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button className="flex-1" onClick={() => handleDownloadCertificate(cert)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                                <Button variant="outline" className="flex-1" onClick={() => handleShareCertificate(cert)}>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              ⋮
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownloadCertificate(cert)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShareCertificate(cert)}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTogglePublic(cert)}>
                              {cert.isPublic ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Make Private
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Make Public
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

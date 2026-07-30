/**
 * WatchdogIncidentsPanel - Display previous incidents in the dashboard
 * Shows a searchable, filterable list of all reported AI safety incidents
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';

interface WatchdogIncidentsPanelProps {
  onViewIncident?: (id: number) => void;
}

export default function WatchdogIncidentsPanel({ onViewIncident }: WatchdogIncidentsPanelProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [status, setStatus] = useState<'all' | 'submitted' | 'under_review' | 'investigating' | 'resolved' | 'dismissed'>('all');
  const [incidentType, setIncidentType] = useState<'all' | 'bias' | 'privacy' | 'safety' | 'misinformation' | 'manipulation' | 'other'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'severity' | 'upvotes'>('recent');

  const { data, isLoading, refetch } = trpc.watchdogIncidents.list.useQuery({
    page,
    limit: 10,
    severity,
    status,
    incidentType,
    search: search || undefined,
    sortBy,
  });

  const { data: stats } = trpc.watchdogIncidents.getStats.useQuery();

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (st: string) => {
    switch (st) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'investigating':
        return <Eye className="h-4 w-4 text-blue-600" />;
      case 'under_review':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'dismissed':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'submitted':
      default:
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getIncidentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      bias: 'Bias',
      privacy: 'Privacy',
      safety: 'Safety',
      misinformation: 'Misinformation',
      manipulation: 'Manipulation',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-slate-50 to-white">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Incidents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-white">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                  <p className="text-xs text-muted-foreground">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-50 to-white">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.investigating}</p>
                  <p className="text-xs text-muted-foreground">Investigating</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Previous Incidents
              </CardTitle>
              <CardDescription>Browse and search all reported AI safety incidents</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, AI system, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          {/* Filter Controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={severity} onValueChange={(v) => { setSeverity(v as any); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={(v) => { setStatus(v as any); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={incidentType} onValueChange={(v) => { setIncidentType(v as any); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bias">Bias</SelectItem>
                <SelectItem value="privacy">Privacy</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="misinformation">Misinformation</SelectItem>
                <SelectItem value="manipulation">Manipulation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => { setSortBy(v as any); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="severity">Severity</SelectItem>
                <SelectItem value="upvotes">Most Upvoted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Incidents List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : data?.incidents && data.incidents.length > 0 ? (
          data.incidents.map((incident) => (
            <Card
              key={incident.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onViewIncident?.(incident.id)}
            >
              <CardContent className="pt-4">
                <div className="flex gap-4">
                  {/* Severity indicator */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getSeverityColor(incident.severity)}`}>
                    <AlertTriangle className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg truncate">{incident.title}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusIcon(incident.status)}
                        <span className="text-xs text-muted-foreground capitalize">
                          {incident.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {incident.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <Badge variant="outline" className={getSeverityColor(incident.severity)}>
                        {incident.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {getIncidentTypeLabel(incident.incidentType)}
                      </Badge>
                      {incident.aiSystemName && (
                        <span className="text-xs text-muted-foreground">
                          AI: {incident.aiSystemName}
                        </span>
                      )}
                      {incident.companyName && (
                        <span className="text-xs text-muted-foreground">
                          Company: {incident.companyName}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(incident.createdAt), 'MMM d, yyyy')}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ThumbsUp className="h-3 w-3" />
                        {incident.upvotes}
                        <ThumbsDown className="h-3 w-3 ml-1" />
                        {incident.downvotes}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Incidents Found</h3>
              <p className="text-muted-foreground">
                {search || severity !== 'all' || status !== 'all' || incidentType !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'No incidents have been reported yet'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
            {data.pagination.total} incidents
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
              disabled={page === data.pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

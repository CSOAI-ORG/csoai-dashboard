/**
 * Admin Incidents Management Page
 * Create, update, and manage system incidents with automatic subscriber notifications
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  CheckCircle,
  Clock,
  Eye,
  Search,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import DashboardLayout from '@/components/DashboardLayout';

type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'all';
type IncidentSeverity = 'minor' | 'major' | 'critical';

export default function AdminIncidents() {
  const [statusFilter, setStatusFilter] = useState<IncidentStatus>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);

  // Fetch incidents
  const { data, isLoading, refetch } = trpc.adminIncidents.getIncidents.useQuery({
    page: 1,
    limit: 50,
    status: statusFilter,
  });

  // Fetch services for incident creation
  const { data: services } = trpc.adminIncidents.getAvailableServices.useQuery();

  // Mutations
  const createMutation = trpc.adminIncidents.createIncident.useMutation({
    onSuccess: () => {
      toast.success('Incident created and notifications sent');
      setCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create incident: ${error.message}`);
    },
  });

  const updateMutation = trpc.adminIncidents.updateIncidentStatus.useMutation({
    onSuccess: () => {
      toast.success('Incident updated and notifications sent');
      setUpdateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update incident: ${error.message}`);
    },
  });

  const deleteMutation = trpc.adminIncidents.deleteIncident.useMutation({
    onSuccess: () => {
      toast.success('Incident deleted');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete incident: ${error.message}`);
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'major':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'monitoring':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'identified':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'investigating':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Incident Management</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage system incidents with automatic subscriber notifications
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Incident
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search incidents..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as IncidentStatus)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="identified">Identified</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Incidents List */}
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading incidents...</p>
            </CardContent>
          </Card>
        ) : data?.incidents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No incidents found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first incident to notify subscribers about system issues.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Incident
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {data?.incidents.map((incident: any) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{incident.title}</h3>
                          <Badge className={getSeverityColor(incident.severity)}>
                            {incident.severity}
                          </Badge>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-4">{incident.description}</p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Started: {new Date(incident.startedAt).toLocaleString()}
                          </div>
                          {incident.resolvedAt && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Resolved: {new Date(incident.resolvedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                        {incident.affectedServices && (
                          <div className="mt-3">
                            <span className="text-sm font-medium">Affected Services: </span>
                            <span className="text-sm text-muted-foreground">
                              {JSON.parse(incident.affectedServices).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedIncidentId(incident.id);
                            setUpdateDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Update
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this incident?')) {
                              deleteMutation.mutate({ incidentId: incident.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Incident Dialog */}
        <CreateIncidentDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          services={services || []}
          onSubmit={(data) => createMutation.mutate(data)}
        />

        {/* Update Incident Dialog */}
        {selectedIncidentId && (
          <UpdateIncidentDialog
            open={updateDialogOpen}
            onOpenChange={setUpdateDialogOpen}
            incidentId={selectedIncidentId}
            onSubmit={(data) => updateMutation.mutate({ incidentId: selectedIncidentId, ...data })}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Create Incident Dialog Component
function CreateIncidentDialog({
  open,
  onOpenChange,
  services,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: any[];
  onSubmit: (data: any) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('minor');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!title || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    onSubmit({
      title,
      description,
      severity,
      affectedServices: selectedServices,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setSeverity('minor');
    setSelectedServices([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Incident</DialogTitle>
          <DialogDescription>
            Create a new incident and notify all active subscribers via email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the incident"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of what's happening"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="severity">Severity *</Label>
            <Select value={severity} onValueChange={(value) => setSeverity(value as IncidentSeverity)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minor">Minor - Low impact</SelectItem>
                <SelectItem value="major">Major - Significant impact</SelectItem>
                <SelectItem value="critical">Critical - Service down</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Affected Services</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {services.map((service) => (
                <label
                  key={service.id}
                  className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.serviceName)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedServices([...selectedServices, service.serviceName]);
                      } else {
                        setSelectedServices(selectedServices.filter((s) => s !== service.serviceName));
                      }
                    }}
                  />
                  <span className="text-sm">{service.displayName}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create & Notify Subscribers</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Update Incident Dialog Component
function UpdateIncidentDialog({
  open,
  onOpenChange,
  incidentId,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incidentId: number;
  onSubmit: (data: any) => void;
}) {
  const [status, setStatus] = useState<IncidentStatus>('investigating');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!message) {
      toast.error('Please provide an update message');
      return;
    }

    onSubmit({
      status,
      message,
    });

    // Reset form
    setMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Incident Status</DialogTitle>
          <DialogDescription>
            Update the incident status and notify subscribers with the latest information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="status">New Status *</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as IncidentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="identified">Identified</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Update Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the current status and any actions taken"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update & Notify Subscribers</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

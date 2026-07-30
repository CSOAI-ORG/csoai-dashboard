import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, TrendingUp, Users, DollarSign, Percent, Eye, Edit, XCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function PromoCodeManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [selectedPromoId, setSelectedPromoId] = useState<number | null>(null);

  // Form state for creating promo code
  const [newPromo, setNewPromo] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    maxUses: 100,
    expiresAt: "",
  });

  // Form state for editing promo code
  const [editPromo, setEditPromo] = useState({
    description: "",
    maxUses: 100,
    expiresAt: "",
    active: true,
  });

  const { data: promoCodes, refetch: refetchPromoCodes } = trpc.promoCodeManagement.getAllPromoCodes.useQuery();
  const { data: usageSummary } = trpc.promoCodeManagement.getUsageSummary.useQuery();
  const { data: analytics } = trpc.promoCodeManagement.getPromoCodeAnalytics.useQuery(
    { code: selectedCode },
    { enabled: !!selectedCode && analyticsDialogOpen }
  );

  const createPromoMutation = trpc.promoCodeManagement.createPromoCode.useMutation({
    onSuccess: () => {
      toast.success("Promo code created successfully");
      setCreateDialogOpen(false);
      refetchPromoCodes();
      setNewPromo({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: 0,
        maxUses: 100,
        expiresAt: "",
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updatePromoMutation = trpc.promoCodeManagement.updatePromoCode.useMutation({
    onSuccess: () => {
      toast.success("Promo code updated successfully");
      setEditDialogOpen(false);
      refetchPromoCodes();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deactivatePromoMutation = trpc.promoCodeManagement.deactivatePromoCode.useMutation({
    onSuccess: () => {
      toast.success("Promo code deactivated successfully");
      refetchPromoCodes();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreatePromo = () => {
    if (!newPromo.code || newPromo.discountValue <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    createPromoMutation.mutate(newPromo);
  };

  const handleUpdatePromo = () => {
    if (!selectedPromoId) return;

    updatePromoMutation.mutate({
      id: selectedPromoId,
      description: editPromo.description,
      maxUses: editPromo.maxUses,
      expiresAt: editPromo.expiresAt || null,
      active: editPromo.active,
    });
  };

  const handleDeactivate = (id: number) => {
    if (confirm("Are you sure you want to deactivate this promo code?")) {
      deactivatePromoMutation.mutate({ id });
    }
  };

  const openEditDialog = (promo: any) => {
    setSelectedPromoId(promo.id);
    setEditPromo({
      description: promo.description || "",
      maxUses: promo.maxUses,
      expiresAt: promo.expiresAt || "",
      active: promo.active,
    });
    setEditDialogOpen(true);
  };

  const openAnalyticsDialog = (code: string) => {
    setSelectedCode(code);
    setAnalyticsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promo Code Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage promotional codes for course enrollments
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Promo Code</DialogTitle>
              <DialogDescription>
                Set up a new promotional code for course discounts
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  placeholder="SUMMER2026"
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Summer 2026 promotion"
                  value={newPromo.description}
                  onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select
                  value={newPromo.discountType}
                  onValueChange={(value) => setNewPromo({ ...newPromo, discountType: value as "percentage" | "fixed" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  Discount Value * {newPromo.discountType === "percentage" ? "(%)" : "(£)"}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  max={newPromo.discountType === "percentage" ? "100" : undefined}
                  value={newPromo.discountValue}
                  onChange={(e) => setNewPromo({ ...newPromo, discountValue: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUses">Max Uses *</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  value={newPromo.maxUses}
                  onChange={(e) => setNewPromo({ ...newPromo, maxUses: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={newPromo.expiresAt}
                  onChange={(e) => setNewPromo({ ...newPromo, expiresAt: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePromo} disabled={createPromoMutation.isPending}>
                {createPromoMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      {usageSummary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageSummary.totalCoupons}</div>
              <p className="text-xs text-muted-foreground">
                {usageSummary.activeCoupons} active, {usageSummary.inactiveCoupons} inactive
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageSummary.totalUsage}</div>
              <p className="text-xs text-muted-foreground">
                Out of {usageSummary.totalCapacity} capacity
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageSummary.utilizationRate}%</div>
              <p className="text-xs text-muted-foreground">
                Overall code usage efficiency
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageSummary.activeCoupons}</div>
              <p className="text-xs text-muted-foreground">
                Currently available for use
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Promo Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Promo Codes</CardTitle>
          <CardDescription>
            Manage and monitor all promotional codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes?.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-mono font-semibold">{promo.code}</TableCell>
                  <TableCell className="max-w-xs truncate">{promo.description || "-"}</TableCell>
                  <TableCell>
                    {promo.discountType === "percentage" ? (
                      <span>{promo.discountValue}%</span>
                    ) : (
                      <span>£{promo.discountValue}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {promo.usedCount} / {promo.maxUses}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {promo.percentageUsed}% used
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {promo.active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {promo.expiresAt ? (
                      <span className="text-sm">
                        {new Date(promo.expiresAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openAnalyticsDialog(promo.code)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(promo)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {promo.active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(promo.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!promoCodes || promoCodes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No promo codes found. Create your first one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Promo Code</DialogTitle>
            <DialogDescription>
              Update promo code settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editPromo.description}
                onChange={(e) => setEditPromo({ ...editPromo, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-maxUses">Max Uses</Label>
              <Input
                id="edit-maxUses"
                type="number"
                min="1"
                value={editPromo.maxUses}
                onChange={(e) => setEditPromo({ ...editPromo, maxUses: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-expiresAt">Expiration Date</Label>
              <Input
                id="edit-expiresAt"
                type="datetime-local"
                value={editPromo.expiresAt}
                onChange={(e) => setEditPromo({ ...editPromo, expiresAt: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={editPromo.active}
                onCheckedChange={(checked) => setEditPromo({ ...editPromo, active: checked })}
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePromo} disabled={updatePromoMutation.isPending}>
              {updatePromoMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={analyticsDialogOpen} onOpenChange={setAnalyticsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Promo Code Analytics: {selectedCode}</DialogTitle>
            <DialogDescription>
              Detailed usage statistics and user information
            </DialogDescription>
          </DialogHeader>
          {analytics && (
            <div className="space-y-6 py-4">
              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.analytics.totalUsage}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.analytics.uniqueUsers}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">£{analytics.analytics.totalRevenue}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Est. Discount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">£{analytics.analytics.estimatedDiscount}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Usage Details Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Usage Details</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Used At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.analytics.usageDetails.map((usage) => (
                      <TableRow key={usage.id}>
                        <TableCell>{usage.userName || "Unknown"}</TableCell>
                        <TableCell>{usage.userEmail || "N/A"}</TableCell>
                        <TableCell>{usage.orderId || "-"}</TableCell>
                        <TableCell>
                          {usage.usedAt ? new Date(usage.usedAt).toLocaleString() : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {analytics.analytics.usageDetails.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                          No usage data yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

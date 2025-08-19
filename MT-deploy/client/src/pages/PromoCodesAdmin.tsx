import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Tag,
  Calendar,
  DollarSign,
  Users,
  Copy,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Loader2,
  Gift,
  Percent
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  usageLimit: number | null;
  usageCount: number;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  applicableTiers: string[];
  minimumAmount?: number;
  createdAt: string;
}

const PromoCodesAdmin: React.FC = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    description: '',
    usageLimit: '',
    validFrom: format(new Date(), 'yyyy-MM-dd'),
    validUntil: '',
    applicableTiers: [] as string[],
    minimumAmount: '',
    isActive: true
  });

  // Fetch promo codes
  const { data: promoCodes, isLoading } = useQuery({
    queryKey: ['/api/payments/promo-codes'],
    enabled: isAuthenticated,
  });

  // Create promo code mutation
  const createPromoMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/payments/promo-codes', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments/promo-codes'] });
      toast({
        title: "Promo Code Created",
        description: "The promo code has been created successfully.",
      });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create promo code",
        variant: "destructive"
      });
    }
  });

  // Update promo code mutation
  const updatePromoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest(`/api/payments/promo-codes/${id}`, {
        method: 'PUT',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments/promo-codes'] });
      toast({
        title: "Promo Code Updated",
        description: "The promo code has been updated successfully.",
      });
      setEditingPromo(null);
      resetForm();
    }
  });

  // Delete promo code mutation
  const deletePromoMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/payments/promo-codes/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments/promo-codes'] });
      toast({
        title: "Promo Code Deleted",
        description: "The promo code has been deleted.",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      description: '',
      usageLimit: '',
      validFrom: format(new Date(), 'yyyy-MM-dd'),
      validUntil: '',
      applicableTiers: [],
      minimumAmount: '',
      isActive: true
    });
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      value: Number(formData.value),
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      minimumAmount: formData.minimumAmount ? Number(formData.minimumAmount) : undefined,
      validUntil: formData.validUntil || null
    };

    if (editingPromo) {
      updatePromoMutation.mutate({ id: editingPromo.id, data });
    } else {
      createPromoMutation.mutate(data);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: `Promo code ${code} copied to clipboard.`,
    });
  };

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      type: promo.type,
      value: promo.value,
      description: promo.description,
      usageLimit: promo.usageLimit?.toString() || '',
      validFrom: format(new Date(promo.validFrom), 'yyyy-MM-dd'),
      validUntil: promo.validUntil ? format(new Date(promo.validUntil), 'yyyy-MM-dd') : '',
      applicableTiers: promo.applicableTiers,
      minimumAmount: promo.minimumAmount?.toString() || '',
      isActive: promo.isActive
    });
    setShowCreateDialog(true);
  };

  if (!isAuthenticated) {
    window.location.href = '/api/login';
    return null;
  }

  const tiers = ['basic', 'enthusiast', 'professional', 'enterprise'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Promo Code Management</h1>
            <p className="text-gray-600">Create and manage discount codes for subscriptions</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setEditingPromo(null);
              setShowCreateDialog(true);
            }}
            className="bg-gradient-to-r from-turquoise-500 to-cyan-500 hover:from-turquoise-600 hover:to-cyan-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Promo Code
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glassmorphic-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Codes</p>
                  <p className="text-2xl font-bold">
                    {promoCodes?.filter((p: PromoCode) => p.isActive).length || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphic-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Uses</p>
                  <p className="text-2xl font-bold">
                    {promoCodes?.reduce((sum: number, p: PromoCode) => sum + p.usageCount, 0) || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphic-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Discount</p>
                  <p className="text-2xl font-bold">15%</p>
                </div>
                <Percent className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphic-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue Impact</p>
                  <p className="text-2xl font-bold">$2,450</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Promo Codes Table */}
        <Card className="glassmorphic-card">
          <CardHeader>
            <CardTitle>All Promo Codes</CardTitle>
            <CardDescription>Manage your discount codes and track their usage</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-turquoise-500" />
              </div>
            ) : (!promoCodes || promoCodes.length === 0) ? (
              <div className="text-center py-8">
                <Gift className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No promo codes yet</p>
                <p className="text-sm text-gray-400 mt-2">Create your first promo code to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(promoCodes as PromoCode[])?.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {promo.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(promo.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {promo.type === 'percentage' ? '%' : '$'} {promo.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {promo.type === 'percentage' ? `${promo.value}%` : `$${promo.value}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{promo.usageCount}</span>
                          {promo.usageLimit && (
                            <span className="text-gray-500">/ {promo.usageLimit}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {promo.validUntil ? (
                          format(new Date(promo.validUntil), 'MMM dd, yyyy')
                        ) : (
                          <span className="text-gray-500">No expiry</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {promo.isActive ? (
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(promo)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePromoMutation.mutate(promo.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}
            </DialogTitle>
            <DialogDescription>
              {editingPromo 
                ? 'Update the promo code details below' 
                : 'Create a new discount code for your subscriptions'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Promo Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER2025"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Discount Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  placeholder={formData.type === 'percentage' ? '20' : '10'}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Summer sale discount"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="validUntil">Valid Until (Optional)</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
              <Input
                id="usageLimit"
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                placeholder="100"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Applicable Tiers</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {tiers.map((tier) => (
                  <Badge
                    key={tier}
                    variant={formData.applicableTiers.includes(tier) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => {
                      const newTiers = formData.applicableTiers.includes(tier)
                        ? formData.applicableTiers.filter(t => t !== tier)
                        : [...formData.applicableTiers, tier];
                      setFormData({ ...formData, applicableTiers: newTiers });
                    }}
                  >
                    {tier}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createPromoMutation.isPending || updatePromoMutation.isPending}
              className="bg-gradient-to-r from-turquoise-500 to-cyan-500 hover:from-turquoise-600 hover:to-cyan-600"
            >
              {createPromoMutation.isPending || updatePromoMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                editingPromo ? 'Update' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromoCodesAdmin;
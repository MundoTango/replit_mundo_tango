import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, Check } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface CustomRoleRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CustomRoleRequestForm({ onSuccess, onCancel }: CustomRoleRequestFormProps) {
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (data: { roleName: string; roleDescription: string }) => {
      return await apiRequest('POST', '/api/roles/custom/request', data);
    },
    onSuccess: () => {
      setSubmitSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['/api/roles/custom/my-requests'] });
      
      // Reset form after a delay
      setTimeout(() => {
        setRoleName('');
        setRoleDescription('');
        setSubmitSuccess(false);
        onSuccess?.();
      }, 2000);
    },
    onError: (error: any) => {
      console.error('Error submitting custom role request:', error);
      setErrors({ 
        submit: error?.message || 'Failed to submit custom role request. Please try again.' 
      });
    },
  });

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!roleName.trim()) {
      newErrors.roleName = 'Role name is required';
    } else if (roleName.trim().length < 3) {
      newErrors.roleName = 'Role name must be at least 3 characters';
    } else if (roleName.trim().length > 50) {
      newErrors.roleName = 'Role name must be less than 50 characters';
    }

    if (!roleDescription.trim()) {
      newErrors.roleDescription = 'Role description is required';
    } else if (roleDescription.trim().length < 10) {
      newErrors.roleDescription = 'Role description must be at least 10 characters';
    } else if (roleDescription.trim().length > 500) {
      newErrors.roleDescription = 'Role description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    submitMutation.mutate({
      roleName: roleName.trim(),
      roleDescription: roleDescription.trim(),
    });
  };

  if (submitSuccess) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Request Submitted Successfully!</h3>
              <p className="text-sm text-gray-600 mt-2">
                Your custom role request for "{roleName}" has been submitted and is now pending admin review.
                You'll be notified once it's been processed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Request a Custom Role</CardTitle>
        <CardDescription>
          Don't see your role in our list? Submit a request for a custom role that better describes 
          your involvement in the tango community. Requests are reviewed by our administrators.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <Alert variant="destructive">
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="roleName">Role Name *</Label>
            <Input
              id="roleName"
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g., Tango Shoe Designer"
              className={errors.roleName ? 'border-red-500' : ''}
              disabled={submitMutation.isPending}
            />
            {errors.roleName && (
              <p className="text-sm text-red-600">{errors.roleName}</p>
            )}
            <p className="text-xs text-gray-500">
              Choose a clear, descriptive name for your role ({roleName.length}/50 characters)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roleDescription">Role Description *</Label>
            <Textarea
              id="roleDescription"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="Describe what this role involves in the tango community. Include key activities, responsibilities, or services provided..."
              rows={4}
              className={errors.roleDescription ? 'border-red-500' : ''}
              disabled={submitMutation.isPending}
            />
            {errors.roleDescription && (
              <p className="text-sm text-red-600">{errors.roleDescription}</p>
            )}
            <p className="text-xs text-gray-500">
              Provide a detailed description of the role ({roleDescription.length}/500 characters)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Review Process</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your request will be reviewed by our administrators</li>
              <li>• You'll be notified via email once your request is processed</li>
              <li>• If approved, the new role will be available for all users</li>
              <li>• Processing typically takes 2-3 business days</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="flex-1"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitMutation.isPending}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
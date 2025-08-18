import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomRoleRequestForm } from './CustomRoleRequestForm';

interface CustomRoleRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CustomRoleRequestModal({ open, onOpenChange, onSuccess }: CustomRoleRequestModalProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request a Custom Role</DialogTitle>
          <DialogDescription>
            Submit a request for a custom role that isn't listed in our predefined options.
          </DialogDescription>
        </DialogHeader>
        
        <CustomRoleRequestForm 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
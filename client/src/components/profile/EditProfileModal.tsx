import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, MapPin, User, Globe, Languages, Music, Coffee } from 'lucide-react';
import CityPicker from '@/components/CityPicker';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: any;
}

const tangoRoles = [
  { value: 'leader', label: 'Leader' },
  { value: 'follower', label: 'Follower' },
  { value: 'both', label: 'Both' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'dj', label: 'DJ' },
  { value: 'organizer', label: 'Organizer' },
  { value: 'musician', label: 'Musician' }
];

const experienceLevels = [
  { value: '0', label: 'Beginner (< 1 year)' },
  { value: '1', label: 'Intermediate (1-3 years)' },
  { value: '2', label: 'Advanced (3-5 years)' },
  { value: '3', label: 'Expert (5+ years)' }
];

export default function EditProfileModal({ open, onClose, user }: EditProfileModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<{
    name: string;
    bio: string;
    city: string;
    country: string;
    tangoRoles: string[];
    yearsOfDancing: string;
    leaderLevel: string;
    followerLevel: string;
    languages: string[];
    instagram: string;
    facebook: string;
    twitter: string;
    website: string;
  }>({
    name: '',
    bio: '',
    city: '',
    country: '',
    tangoRoles: [],
    yearsOfDancing: '',
    leaderLevel: '',
    followerLevel: '',
    languages: [],
    instagram: '',
    facebook: '',
    twitter: '',
    website: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        city: user.city || '',
        country: user.country || '',
        tangoRoles: user.tangoRoles || [],
        yearsOfDancing: user.yearsOfDancing?.toString() || '',
        leaderLevel: user.leaderLevel?.toString() || '',
        followerLevel: user.followerLevel?.toString() || '',
        languages: user.languages || [],
        instagram: user.socialLinks?.instagram || '',
        facebook: user.socialLinks?.facebook || '',
        twitter: user.socialLinks?.twitter || '',
        website: user.socialLinks?.website || ''
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleLocationSelect = (location: { city: string; country: string }) => {
    setFormData(prev => ({
      ...prev,
      city: location.city,
      country: location.country
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      yearsOfDancing: formData.yearsOfDancing ? parseInt(formData.yearsOfDancing) : null,
      leaderLevel: formData.leaderLevel ? parseInt(formData.leaderLevel) : null,
      followerLevel: formData.followerLevel ? parseInt(formData.followerLevel) : null,
      socialLinks: {
        instagram: formData.instagram,
        facebook: formData.facebook,
        twitter: formData.twitter,
        website: formData.website
      }
    };

    updateProfileMutation.mutate(dataToSubmit);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">
                <User className="w-4 h-4 inline mr-2" />
                Display Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your display name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself and your tango journey..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500">{formData.bio.length}/500 characters</p>
            </div>

            <div className="space-y-2">
              <Label>
                <MapPin className="w-4 h-4 inline mr-2" />
                Location
              </Label>
              <CityPicker
                value={formData.city}
                onChange={handleLocationSelect}
                placeholder="Select your city"
                showBusinesses={false}
              />
            </div>
          </div>

          {/* Tango Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Tango Information</h3>
            
            <div className="space-y-2">
              <Label>
                <Music className="w-4 h-4 inline mr-2" />
                Tango Roles
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {tangoRoles.map(role => (
                  <label key={role.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.tangoRoles.includes(role.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            tangoRoles: [...prev.tangoRoles, role.value]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            tangoRoles: prev.tangoRoles.filter(r => r !== role.value)
                          }));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{role.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yearsOfDancing">Years of Dancing</Label>
                <Input
                  id="yearsOfDancing"
                  type="number"
                  min="0"
                  value={formData.yearsOfDancing}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearsOfDancing: e.target.value }))}
                  placeholder="Years"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  <Languages className="w-4 h-4 inline mr-2" />
                  Languages
                </Label>
                <Input
                  placeholder="e.g., English, Spanish, Italian"
                  value={formData.languages.join(', ')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    languages: e.target.value.split(',').map(l => l.trim()).filter(Boolean)
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Leader Level</Label>
                <Select
                  value={formData.leaderLevel}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, leaderLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Follower Level</Label>
                <Select
                  value={formData.followerLevel}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, followerLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                  placeholder="@username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={formData.facebook}
                  onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))}
                  placeholder="facebook.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={formData.twitter}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                  placeholder="@username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Website
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateProfileMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
            >
              {updateProfileMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
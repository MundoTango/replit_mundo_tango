import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, Globe, Lock, Users, MapPin, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
// import GoogleMapsLocationPicker from '@/components/GoogleMapsLocationPicker';

// Form schema with 23L validation patterns
const createCommunitySchema = z.object({
  name: z.string()
    .min(3, 'Community name must be at least 3 characters')
    .max(50, 'Community name must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9\s\-&]+$/, 'Only letters, numbers, spaces, hyphens, and & are allowed'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
  type: z.enum(['city', 'professional', 'music', 'practice', 'festival', 'social']),
  roleType: z.string().optional(),
  privacy: z.enum(['public', 'private']),
  location: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  imageUrl: z.string().optional(),
});

type CreateCommunityFormData = z.infer<typeof createCommunitySchema>;

export default function CreateCommunityPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const form = useForm<CreateCommunityFormData>({
    resolver: zodResolver(createCommunitySchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'city',
      privacy: 'public',
      location: '',
      city: '',
      country: '',
      imageUrl: '',
    },
  });

  const createCommunityMutation = useMutation({
    mutationFn: async (data: CreateCommunityFormData) => {
      const response = await fetch('/api/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create community');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Community created!',
        description: `${data.data.name} has been created successfully.`,
      });
      // Navigate to the new community page
      setLocation(`/groups/${data.data.slug}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue('imageUrl', reader.result as string);
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };



  const onSubmit = (data: CreateCommunityFormData) => {
    // Add role type based on community type
    if (data.type === 'professional') {
      data.roleType = 'teacher'; // Default professional role
    } else if (data.type === 'music') {
      data.roleType = 'dj';
    }
    
    createCommunityMutation.mutate(data);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setLocation('/groups')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Communities
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Create New Community
            </h1>
          </div>
          <p className="text-gray-600">
            Build a space where tango dancers can connect, share, and grow together
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Cover Image */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Cover Image</h3>
              <div className="relative">
                <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Community cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Upload className="h-12 w-12 mb-2" />
                      <p className="text-sm">Upload a cover image</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploadingImage}
                />
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Community Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Buenos Aires Tango Collective"
                        className="rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Tell us about your community..."
                        className="rounded-lg min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Community Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="city">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              City Group
                            </div>
                          </SelectItem>
                          <SelectItem value="professional">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Professional
                            </div>
                          </SelectItem>
                          <SelectItem value="music">Music</SelectItem>
                          <SelectItem value="practice">Practice</SelectItem>
                          <SelectItem value="festival">Festival</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="privacy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Privacy</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select privacy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="public">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              Public
                            </div>
                          </SelectItem>
                          <SelectItem value="private">
                            <div className="flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              Private
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Location</h3>
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Location</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Where is your community based?"
                        className="rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/groups')}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCommunityMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg px-6"
              >
                {createCommunityMutation.isPending ? 'Creating...' : 'Create Community'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
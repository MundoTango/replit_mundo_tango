import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, MapPin, Music, Heart, Camera, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// DatePicker component will be replaced with standard input
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

const danceHistorySchema = z.object({
  partnerId: z.number().min(1, 'Please select a dance partner'),
  danceDate: z.string(),
  location: z.string().min(1, 'Please enter where you danced'),
  eventName: z.string().optional(),
  danceStyle: z.enum(['tango', 'milonga', 'vals', 'neotango', 'other']),
  songName: z.string().optional(),
  artistName: z.string().optional(),
  rating: z.number().min(1).max(5),
  notes: z.string().optional(),
  wasSpecial: z.boolean().default(false),
  specialMoment: z.string().optional(),
  photos: z.array(z.string()).optional()
});

type DanceHistoryFormData = z.infer<typeof danceHistorySchema>;

interface DanceHistoryFormProps {
  partnerId?: number;
  partnerName?: string;
  onComplete?: () => void;
}

export function DanceHistoryForm({ partnerId, partnerName, onComplete }: DanceHistoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const form = useForm<DanceHistoryFormData>({
    resolver: zodResolver(danceHistorySchema),
    defaultValues: {
      partnerId: partnerId || 0,
      danceDate: new Date().toISOString().split('T')[0],
      location: '',
      danceStyle: 'tango',
      rating: 5,
      wasSpecial: false,
      photos: []
    }
  });

  const createDanceHistoryMutation = useMutation({
    mutationFn: async (data: DanceHistoryFormData) => {
      const response = await fetch('/api/friendship/dance-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to save dance history');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Dance memory saved!',
        description: 'Your dance history has been recorded',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/friendship/dance-history'] });
      form.reset();
      onComplete?.();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save dance history',
        variant: 'destructive'
      });
    }
  });

  const onSubmit = (data: DanceHistoryFormData) => {
    createDanceHistoryMutation.mutate({
      ...data,
      photos: uploadedPhotos
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('photos', file);
    });

    try {
      const response = await fetch('/api/upload/dance-photos', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      if (data.urls) {
        setUploadedPhotos(prev => [...prev, ...data.urls]);
        toast({
          title: 'Photos uploaded!',
          description: `${data.urls.length} photo(s) added to your dance memory`
        });
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Could not upload photos',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="p-6 glassmorphic-card">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
            Record a Dance Memory
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {partnerName ? `Dancing with ${partnerName}` : 'Capture your special dance moments'}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!partnerId && (
              <FormField
                control={form.control}
                name="partnerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Dance Partner
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter partner ID" 
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="danceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      When did you dance?
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        className="glassmorphic-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Where did you dance?
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Milonga name or location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="eventName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Festival, milonga, or práctica name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="danceStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dance Style</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dance style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tango">Tango</SelectItem>
                      <SelectItem value="milonga">Milonga</SelectItem>
                      <SelectItem value="vals">Vals</SelectItem>
                      <SelectItem value="neotango">Neotango</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Music className="w-4 h-4" />
                Music Details (optional)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="songName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Song name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="artistName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Artist/Orchestra" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    How was the dance? (1-5 stars)
                  </FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          className={`text-2xl ${
                            star <= field.value 
                              ? 'text-yellow-500' 
                              : 'text-gray-300 dark:text-gray-600'
                          } hover:text-yellow-400 transition-colors`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wasSpecial"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-gray-300"
                    />
                    <FormLabel className="cursor-pointer">
                      This was a special moment
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {form.watch('wasSpecial') && (
              <FormField
                control={form.control}
                name="specialMoment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What made it special?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what made this dance memorable..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any other memories or details..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Add Photos
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-turquoise-50 file:text-turquoise-700 hover:file:bg-turquoise-100"
              />
              {uploadedPhotos.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {uploadedPhotos.map((url, idx) => (
                    <img 
                      key={idx} 
                      src={url} 
                      alt={`Dance photo ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600"
              disabled={createDanceHistoryMutation.isPending}
            >
              {createDanceHistoryMutation.isPending ? 'Saving...' : 'Save Dance Memory'}
            </Button>
          </form>
        </Form>
      </div>
    </Card>
  );
}
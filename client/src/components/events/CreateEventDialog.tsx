import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import UploadMedia from '@/components/UploadMedia';
import GoogleMapsAutocomplete from '@/components/maps/GoogleMapsAutocomplete';
import { Calendar, MapPin, DollarSign, Video, RefreshCw, Users, Image, FileText } from 'lucide-react';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isPublic: z.boolean().default(true),
  maxAttendees: z.number().optional(),
  
  // Enhanced fields
  eventType: z.string().optional(),
  level: z.string().optional(),
  
  // Ticketing
  isPaid: z.boolean().default(false),
  price: z.string().optional(),
  currency: z.string().default('USD'),
  ticketUrl: z.string().optional(),
  earlyBirdPrice: z.string().optional(),
  earlyBirdDeadline: z.string().optional(),
  
  // Virtual event
  isVirtual: z.boolean().default(false),
  virtualPlatform: z.string().optional(),
  virtualUrl: z.string().optional(),
  
  // Recurring event
  isRecurring: z.boolean().default(false),
  recurringPattern: z.string().optional(),
  recurringEndDate: z.string().optional(),
  
  // Categories
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([])
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateEventDialog({ open, onOpenChange }: CreateEventDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      isPublic: true,
      isPaid: false,
      isVirtual: false,
      isRecurring: false,
      currency: 'USD',
      categories: [],
      tags: []
    }
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const eventData = {
        ...data,
        imageUrl,
        galleryImages,
        documents,
        maxAttendees: data.maxAttendees || null,
        price: data.isPaid ? data.price : null
      };
      return apiRequest('POST', '/api/events', eventData);
    },
    onSuccess: () => {
      toast({
        title: "Event created!",
        description: "Your event has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      form.reset();
      setImageUrl('');
      setGalleryImages([]);
      setDocuments([]);
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  const isPaid = form.watch('isPaid');
  const isVirtual = form.watch('isVirtual');
  const isRecurring = form.watch('isRecurring');

  const eventCategories = [
    'milonga', 'practica', 'class', 'workshop', 'festival', 
    'marathon', 'social', 'performance', 'concert', 'other'
  ];

  const eventLevels = [
    'beginner', 'intermediate', 'advanced', 'all_levels', 'master_class'
  ];

  const virtualPlatforms = [
    'zoom', 'google_meet', 'teams', 'youtube', 'facebook', 'custom'
  ];

  const recurringPatterns = [
    'daily', 'weekly', 'biweekly', 'monthly', 'custom'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
            Create New Event
          </DialogTitle>
          <DialogDescription>
            Fill in the details to create your tango event. You can save as draft and publish later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="ticketing">Ticketing</TabsTrigger>
                <TabsTrigger value="virtual">Virtual</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Tango Night at La Viruta" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your event..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventCategories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventLevels.map(level => (
                            <SelectItem key={level} value={level}>
                              {level.replace('_', ' ').charAt(0).toUpperCase() + level.replace('_', ' ').slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date & Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date & Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <GoogleMapsAutocomplete
                          onPlaceSelect={(place) => {
                            field.onChange(place.address);
                          }}
                          defaultValue={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-4">
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Public Event
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxAttendees"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Max Attendees (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Leave empty for unlimited"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="ticketing" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Ticketing & Payment
                    </CardTitle>
                    <CardDescription>
                      Set up ticket sales and payment options for your event
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="isPaid"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Paid Event</FormLabel>
                            <FormDescription>
                              Enable ticket sales for this event
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {isPaid && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ticket Price</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="25.00"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Currency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                    <SelectItem value="ARS">ARS ($)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="earlyBirdPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Early Bird Price (optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="20.00"
                                    {...field} 
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="earlyBirdDeadline"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Early Bird Deadline</FormLabel>
                                <FormControl>
                                  <Input type="datetime-local" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="ticketUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>External Ticket URL (optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="url" 
                                  placeholder="https://eventbrite.com/..."
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                If you're using an external ticketing service
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="virtual" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Virtual Event Settings
                    </CardTitle>
                    <CardDescription>
                      Configure settings for online or hybrid events
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="isVirtual"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Virtual Event</FormLabel>
                            <FormDescription>
                              This event will be held online or hybrid
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {isVirtual && (
                      <>
                        <FormField
                          control={form.control}
                          name="virtualPlatform"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Platform</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select platform" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {virtualPlatforms.map(platform => (
                                    <SelectItem key={platform} value={platform}>
                                      {platform.charAt(0).toUpperCase() + platform.slice(1).replace('_', ' ')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="virtualUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meeting URL</FormLabel>
                              <FormControl>
                                <Input 
                                  type="url" 
                                  placeholder="https://zoom.us/..."
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                The link attendees will use to join the event
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5" />
                      Recurring Event
                    </CardTitle>
                    <CardDescription>
                      Set up events that repeat on a regular schedule
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="isRecurring"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Recurring Event</FormLabel>
                            <FormDescription>
                              This event repeats on a schedule
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {isRecurring && (
                      <>
                        <FormField
                          control={form.control}
                          name="recurringPattern"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Repeat Pattern</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select pattern" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {recurringPatterns.map(pattern => (
                                    <SelectItem key={pattern} value={pattern}>
                                      {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="recurringEndDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Repeat Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormDescription>
                                When should the recurring events stop?
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      Event Media
                    </CardTitle>
                    <CardDescription>
                      Add images and documents to your event
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <FormLabel>Main Event Image</FormLabel>
                      <UploadMedia
                        onUploadComplete={(url) => setImageUrl(url)}
                        accept="image/*"
                        multiple={false}
                      />
                      {imageUrl && (
                        <img 
                          src={imageUrl} 
                          alt="Event" 
                          className="mt-2 w-full max-w-md rounded-lg"
                        />
                      )}
                    </div>

                    <div>
                      <FormLabel>Event Gallery (optional)</FormLabel>
                      <FormDescription>
                        Add multiple images to showcase your event
                      </FormDescription>
                      <UploadMedia
                        onUploadComplete={(url) => setGalleryImages(prev => [...prev, url])}
                        accept="image/*"
                        multiple={true}
                      />
                      {galleryImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {galleryImages.map((img, idx) => (
                            <img 
                              key={idx}
                              src={img} 
                              alt={`Gallery ${idx + 1}`} 
                              className="w-full h-24 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <FormLabel>Event Documents (optional)</FormLabel>
                      <FormDescription>
                        Add schedules, maps, or other helpful documents
                      </FormDescription>
                      <UploadMedia
                        onUploadComplete={(url) => setDocuments(prev => [...prev, url])}
                        accept=".pdf,.doc,.docx"
                        multiple={true}
                      />
                      {documents.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {documents.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm">Document {idx + 1}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>
                      Additional options for your event
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="categories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categories</FormLabel>
                          <FormDescription>
                            Select categories to help people discover your event
                          </FormDescription>
                          <div className="grid grid-cols-2 gap-2">
                            {['social', 'educational', 'performance', 'competition', 'charity', 'cultural'].map(cat => (
                              <label key={cat} className="flex items-center space-x-2">
                                <Checkbox
                                  checked={field.value?.includes(cat)}
                                  onCheckedChange={(checked) => {
                                    const updated = checked 
                                      ? [...(field.value || []), cat]
                                      : field.value?.filter(c => c !== cat) || [];
                                    field.onChange(updated);
                                  }}
                                />
                                <span className="text-sm">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                              </label>
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="tango, milonga, buenos aires (comma separated)"
                              onChange={(e) => {
                                const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                                field.onChange(tags);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Add tags to improve searchability
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-turquoise-500 to-cyan-600"
                disabled={createEventMutation.isPending}
              >
                {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, addWeeks, addMonths, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { Calendar, Clock, Repeat, Users, MapPin, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

const recurringEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(1, "Location is required"),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  recurrenceType: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
  recurrenceEndDate: z.string(),
  eventType: z.enum(['milonga', 'class', 'practica', 'festival', 'workshop']),
  maxAttendees: z.number().min(1),
  price: z.number().min(0),
  isEventPage: z.boolean().default(true),
  allowEventPagePosts: z.boolean().default(true),
  eventPageAdmins: z.array(z.number()).default([]),
});

type RecurringEventFormData = z.infer<typeof recurringEventSchema>;

export default function RecurringEventManager() {
  const { toast } = useToast();
  const [previewDates, setPreviewDates] = useState<Date[]>([]);
  const [showDelegation, setShowDelegation] = useState(false);

  const form = useForm<RecurringEventFormData>({
    resolver: zodResolver(recurringEventSchema),
    defaultValues: {
      recurrenceType: 'weekly',
      eventType: 'milonga',
      isEventPage: true,
      allowEventPagePosts: true,
      maxAttendees: 100,
      price: 0,
      eventPageAdmins: [],
    }
  });

  const createRecurringEventsMutation = useMutation({
    mutationFn: async (data: RecurringEventFormData) => {
      const response = await apiRequest('POST', '/api/events/recurring', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Recurring events created successfully",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const generatePreviewDates = (data: Partial<RecurringEventFormData>) => {
    if (!data.startDate || !data.recurrenceEndDate || !data.recurrenceType) return;

    const start = new Date(data.startDate);
    const end = new Date(data.recurrenceEndDate);
    let dates: Date[] = [];

    switch (data.recurrenceType) {
      case 'daily':
        dates = eachDayOfInterval({ start, end });
        break;
      case 'weekly':
        dates = eachWeekOfInterval({ start, end });
        break;
      case 'biweekly':
        let current = start;
        while (current <= end) {
          dates.push(new Date(current));
          current = addWeeks(current, 2);
        }
        break;
      case 'monthly':
        dates = eachMonthOfInterval({ start, end });
        break;
    }

    setPreviewDates(dates.slice(0, 10)); // Show first 10 occurrences
  };

  const onSubmit = async (data: RecurringEventFormData) => {
    createRecurringEventsMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="glassmorphic-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent flex items-center gap-2">
            <Repeat className="w-6 h-6 text-turquoise-500" />
            Create Recurring Event Series
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Weekly Milonga at Salon Canning" className="glassmorphic-input" />
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
                          <SelectTrigger className="glassmorphic-input">
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="milonga">Milonga</SelectItem>
                          <SelectItem value="class">Class</SelectItem>
                          <SelectItem value="practica">Práctica</SelectItem>
                          <SelectItem value="festival">Festival</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Describe your recurring event..." className="glassmorphic-input min-h-[100px]" />
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
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-turquoise-500" />
                        <Input {...field} placeholder="Salon Canning, Buenos Aires" className="glassmorphic-input pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Event Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className="glassmorphic-input" onChange={(e) => {
                          field.onChange(e);
                          generatePreviewDates(form.getValues());
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recurrenceEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Series End Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className="glassmorphic-input" onChange={(e) => {
                          field.onChange(e);
                          generatePreviewDates(form.getValues());
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" className="glassmorphic-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" className="glassmorphic-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Recurrence Pattern */}
              <FormField
                control={form.control}
                name="recurrenceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurrence Pattern</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      generatePreviewDates(form.getValues());
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="glassmorphic-input">
                          <SelectValue placeholder="Select recurrence" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preview Dates */}
              {previewDates.length > 0 && (
                <div className="glassmorphic-card p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-turquoise-500" />
                    Preview of Event Dates
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {previewDates.map((date, index) => (
                      <Badge key={index} variant="secondary" className="bg-turquoise-100 text-turquoise-800">
                        {format(date, 'MMM d, yyyy')}
                      </Badge>
                    ))}
                    {previewDates.length >= 10 && (
                      <Badge variant="outline" className="border-turquoise-300">
                        + more...
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Attendees</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" className="glassmorphic-input" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (USD)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" className="glassmorphic-input" onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Event Page Settings */}
              <div className="glassmorphic-card p-4 space-y-4">
                <h3 className="text-lg font-semibold">Event Page Settings</h3>
                
                <FormField
                  control={form.control}
                  name="isEventPage"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Create Event Page</FormLabel>
                        <p className="text-sm text-gray-600">Create a dedicated page for this event series</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={(checked) => {
                          field.onChange(checked);
                          setShowDelegation(checked);
                        }} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch('isEventPage') && (
                  <FormField
                    control={form.control}
                    name="allowEventPagePosts"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Allow Community Posts</FormLabel>
                          <p className="text-sm text-gray-600">Let attendees post on the event page</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => form.reset()}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600" disabled={createRecurringEventsMutation.isPending}>
                  {createRecurringEventsMutation.isPending ? (
                    <>Creating Events...</>
                  ) : (
                    <>Create Recurring Events</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
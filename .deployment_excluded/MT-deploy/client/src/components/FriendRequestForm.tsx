import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, MapPin, Calendar, Music, Image, Send } from 'lucide-react';

const friendRequestSchema = z.object({
  receiverId: z.number(),
  didWeDance: z.boolean().default(false),
  danceLocation: z.string().optional(),
  danceEventId: z.number().optional(),
  danceStory: z.string().optional(),
  senderPrivateNote: z.string().optional(),
  senderMessage: z.string().min(1, 'Please add a message'),
  mediaUrls: z.array(z.string()).optional(),
});

type FriendRequestFormData = z.infer<typeof friendRequestSchema>;

interface FriendRequestFormProps {
  receiverId: number;
  receiverName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FriendRequestForm({ receiverId, receiverName, onSuccess, onCancel }: FriendRequestFormProps) {
  const [uploadedMedia, setUploadedMedia] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FriendRequestFormData>({
    resolver: zodResolver(friendRequestSchema),
    defaultValues: {
      receiverId,
      didWeDance: false,
      senderMessage: `Hi ${receiverName}, I'd love to connect with you!`,
      mediaUrls: [],
    },
  });

  const sendFriendRequestMutation = useMutation({
    mutationFn: (data: FriendRequestFormData) => 
      apiRequest('/api/friend-requests/send', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Friend Request Sent!",
        description: `Your friend request to ${receiverName} has been sent.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/friend-requests'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send friend request",
      });
    },
  });

  const onSubmit = (data: FriendRequestFormData) => {
    sendFriendRequestMutation.mutate({
      ...data,
      mediaUrls: uploadedMedia,
    });
  };

  return (
    <Card className="glassmorphic-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-turquoise-500" />
          <span className="bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
            Send Friend Request
          </span>
        </CardTitle>
        <CardDescription>
          Connect with {receiverName} and share your tango journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="didWeDance"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-turquoise-300"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      We've danced together before
                    </FormLabel>
                    <FormDescription>
                      Check this if you've shared a dance with {receiverName}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch('didWeDance') && (
              <>
                <FormField
                  control={form.control}
                  name="danceLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-turquoise-500" />
                        Where did you dance?
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Milonga name, event, or city"
                          {...field}
                          className="glassmorphic-input"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="danceStory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-turquoise-500" />
                        Share your dance story
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What was memorable about dancing together?"
                          className="glassmorphic-input min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="senderMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a personal message..."
                      className="glassmorphic-input min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This message will be visible to {receiverName}
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="senderPrivateNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Private note (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a note for yourself..."
                      className="glassmorphic-input min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Only you can see this note
                  </FormDescription>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={sendFriendRequestMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sendFriendRequestMutation.isPending}
                className="bg-gradient-to-r from-turquoise-500 to-cyan-600 text-white hover:shadow-lg transition-all duration-300"
              >
                <Send className="mr-2 h-4 w-4" />
                Send Request
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
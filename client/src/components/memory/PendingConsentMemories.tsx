import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Clock, User, MapPin, Heart, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

interface PendingMemory {
  id: string;
  title: string;
  content: string;
  emotionTags: string[];
  trustLevel: string;
  createdAt: string;
  eventId?: string;
  eventTitle?: string;
  location?: string;
  creator: {
    id: string;
    name: string;
    username: string;
    profileImage?: string;
  };
  coTags: string[];
  previewText: string;
}

interface ConsentAction {
  memoryId: string;
  action: 'approve' | 'deny';
  reason?: string;
}

export default function PendingConsentMemories() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingMemories, setProcessingMemories] = useState<Set<string>>(new Set());

  // Fetch pending consent memories
  const { data: pendingMemories = [], isLoading, error } = useQuery({
    queryKey: ['/api/memories/pending-consent'],
    enabled: !!user?.id,
  });

  // Consent action mutation
  const consentMutation = useMutation({
    mutationFn: async ({ memoryId, action, reason }: ConsentAction) => {
      return apiRequest('PATCH', `/api/memories/${memoryId}/consent`, {
        action,
        reason,
        userId: user?.id
      });
    },
    onMutate: ({ memoryId }) => {
      setProcessingMemories(prev => new Set(prev).add(memoryId));
    },
    onSuccess: (data, { memoryId, action }) => {
      toast({
        title: action === 'approve' ? 'Memory Approved' : 'Memory Denied',
        description: action === 'approve' 
          ? 'The memory has been approved and is now visible to participants.'
          : 'The memory has been denied and will remain private.',
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/memories/pending-consent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/memories/user-memories'] });
    },
    onError: (error, { memoryId, action }) => {
      toast({
        title: 'Action Failed',
        description: `Failed to ${action} memory. Please try again.`,
        variant: 'destructive',
      });
    },
    onSettled: ({ memoryId }) => {
      setProcessingMemories(prev => {
        const newSet = new Set(prev);
        newSet.delete(memoryId);
        return newSet;
      });
    }
  });

  const handleConsentAction = (memoryId: string, action: 'approve' | 'deny', reason?: string) => {
    consentMutation.mutate({ memoryId, action, reason });
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      joyful: 'bg-yellow-100 text-yellow-800',
      nostalgic: 'bg-purple-100 text-purple-800',
      passionate: 'bg-red-100 text-red-800',
      peaceful: 'bg-blue-100 text-blue-800',
      energetic: 'bg-orange-100 text-orange-800',
      melancholic: 'bg-gray-100 text-gray-800',
      romantic: 'bg-pink-100 text-pink-800',
      triumphant: 'bg-green-100 text-green-800',
    };
    return colors[emotion.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getTrustLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      basic: 'bg-gray-100 text-gray-800',
      close: 'bg-blue-100 text-blue-800',
      intimate: 'bg-purple-100 text-purple-800',
      sacred: 'bg-amber-100 text-amber-800',
    };
    return colors[level.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Failed to load pending memories. Please try again.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Consent</h1>
        <p className="text-gray-600">
          Memories where you've been tagged and need to approve or deny sharing.
        </p>
      </div>

      {pendingMemories.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">
                You don't have any memories waiting for your consent.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingMemories.map((memory: PendingMemory) => {
            const isProcessing = processingMemories.has(memory.id);
            
            return (
              <Card key={memory.id} className="border-l-4 border-l-amber-400">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={memory.creator.profileImage} />
                        <AvatarFallback>
                          {memory.creator.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{memory.title}</CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>by {memory.creator.name}</span>
                          <span>•</span>
                          <Clock className="h-4 w-4" />
                          <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Awaiting Consent
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Memory Preview */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 line-clamp-3">{memory.previewText}</p>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2">
                    {memory.emotionTags.map((emotion) => (
                      <Badge key={emotion} className={getEmotionColor(emotion)}>
                        {emotion}
                      </Badge>
                    ))}
                    <Badge className={getTrustLevelColor(memory.trustLevel)}>
                      {memory.trustLevel} trust
                    </Badge>
                  </div>

                  {/* Event & Location */}
                  {(memory.eventTitle || memory.location) && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {memory.eventTitle && (
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{memory.eventTitle}</span>
                        </div>
                      )}
                      {memory.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{memory.location}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <Separator />

                  {/* Consent Actions */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Do you consent to sharing this memory with other participants?
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConsentAction(memory.id, 'deny')}
                        disabled={isProcessing}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Deny
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleConsentAction(memory.id, 'approve')}
                        disabled={isProcessing}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
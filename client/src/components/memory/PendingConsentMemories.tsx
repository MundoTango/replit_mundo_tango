import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Clock, User, MapPin, Heart, X, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { 
  Chip, 
  Box, 
  Typography, 
  Avatar as MuiAvatar, 
  Divider, 
  Tooltip,
  Paper,
  Grid
} from '@mui/material';
import { Can } from '@casl/react';
import { useAbility, useCanViewPendingRequests } from '../../lib/casl/abilities';

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
  const ability = useAbility();
  const canViewPending = useCanViewPendingRequests();

  // Fetch pending consent memories
  const { data: pendingMemories = [], isLoading, error } = useQuery({
    queryKey: ['/api/memories/pending-consent'],
    enabled: !!user?.id && canViewPending,
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

  // Check permissions first
  if (!canViewPending) {
    return (
      <div className="container mx-auto p-6">
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center', backgroundColor: '#fff7ed' }}>
          <Shield className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <Typography variant="h6" color="textPrimary" gutterBottom>
            Permission Required
          </Typography>
          <Typography variant="body1" color="textSecondary">
            You don't have permission to view pending consent memories. 
            This feature is available to users who can approve memory consent requests.
          </Typography>
        </Paper>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center', backgroundColor: '#fef2f2' }}>
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <Typography variant="h6" color="error" gutterBottom>
            Failed to Load Pending Memories
          </Typography>
          <Typography variant="body1" color="textSecondary">
            There was an error loading pending consent memories. Please refresh the page or try again later.
          </Typography>
        </Paper>
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
        <Paper elevation={3} sx={{ 
          p: 6, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '1px solid #b3e5fc'
        }}>
          <Box sx={{ mb: 3 }}>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          </Box>
          <Typography variant="h4" gutterBottom sx={{ 
            fontWeight: 600, 
            color: '#1e293b',
            mb: 2
          }}>
            All Caught Up! 🎉
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ 
            maxWidth: '500px', 
            mx: 'auto',
            lineHeight: 1.6
          }}>
            You don't have any memories waiting for your consent approval. 
            When someone tags you in a memory, it will appear here for your review.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Chip 
              label="No Pending Requests" 
              color="success" 
              variant="outlined"
              sx={{ fontSize: '0.9rem', py: 2 }}
            />
          </Box>
        </Paper>
      ) : (
        <div className="grid gap-6">
          {pendingMemories.map((memory: PendingMemory) => {
            const isProcessing = processingMemories.has(memory.id);
            
            return (
              <Paper 
                key={memory.id} 
                elevation={3}
                sx={{ 
                  overflow: 'hidden',
                  borderLeft: '6px solid #f59e0b',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    elevation: 8,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {/* Header with gradient */}
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                  p: 3,
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <MuiAvatar 
                        src={memory.creator.profileImage}
                        sx={{ width: 56, height: 56 }}
                      >
                        {memory.creator.name.split(' ').map(n => n[0]).join('')}
                      </MuiAvatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {memory.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Chip 
                          icon={<User size={14} />}
                          label={`by ${memory.creator.name}`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip 
                          icon={<Clock size={14} />}
                          label={new Date(memory.createdAt).toLocaleDateString()}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Grid>
                    <Grid item>
                      <Chip 
                        label="Awaiting Consent"
                        color="warning"
                        variant="outlined"
                        sx={{ 
                          fontWeight: 500,
                          backgroundColor: 'rgba(245, 158, 11, 0.1)'
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Content */}
                <Box sx={{ p: 3 }}>
                  {/* Memory Preview */}
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 3, 
                      mb: 3, 
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <Typography variant="body1" sx={{ 
                      lineHeight: 1.6,
                      color: '#374151'
                    }}>
                      {memory.previewText}
                    </Typography>
                  </Paper>

                  {/* Emotion Tags */}
                  {memory.emotionTags.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: '#6b7280' }}>
                        Emotion Tags:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {memory.emotionTags.map((emotion) => (
                          <Chip 
                            key={emotion}
                            label={emotion}
                            size="small"
                            sx={{
                              backgroundColor: '#fce7f3',
                              color: '#be185d',
                              fontWeight: 500,
                              '&:hover': {
                                backgroundColor: '#fbcfe8'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Trust Level & Event Info */}
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item>
                        <Tooltip title={`This memory requires ${memory.trustLevel} level trust to view`}>
                          <Chip
                            label={`${memory.trustLevel} trust`}
                            size="small"
                            sx={{
                              backgroundColor: getTrustLevelColor(memory.trustLevel).includes('gray') ? '#f3f4f6' : 
                                getTrustLevelColor(memory.trustLevel).includes('blue') ? '#dbeafe' :
                                getTrustLevelColor(memory.trustLevel).includes('purple') ? '#e9d5ff' : '#fef3c7',
                              color: getTrustLevelColor(memory.trustLevel).includes('gray') ? '#374151' : 
                                getTrustLevelColor(memory.trustLevel).includes('blue') ? '#1d4ed8' :
                                getTrustLevelColor(memory.trustLevel).includes('purple') ? '#7c3aed' : '#92400e',
                              fontWeight: 500
                            }}
                          />
                        </Tooltip>
                      </Grid>
                      {memory.eventTitle && (
                        <Grid item>
                          <Chip
                            icon={<Heart size={14} />}
                            label={memory.eventTitle}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Grid>
                      )}
                      {memory.location && (
                        <Grid item>
                          <Chip
                            icon={<MapPin size={14} />}
                            label={memory.location}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Consent Actions */}
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 3, 
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fcd34d'
                    }}
                  >
                    <Typography variant="body2" sx={{ mb: 2, color: '#92400e', fontWeight: 500 }}>
                      🤝 Consent Required: Do you approve sharing this memory with other participants?
                    </Typography>
                    <Can I="approve" a="ConsentRequest" this={memory}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Can I="deny" a="ConsentRequest" this={memory}>
                          <Button
                            variant="outlined"
                            size="medium"
                            onClick={() => handleConsentAction(memory.id, 'deny')}
                            disabled={isProcessing}
                            sx={{
                              color: '#dc2626',
                              borderColor: '#fca5a5',
                              '&:hover': {
                                backgroundColor: '#fef2f2',
                                borderColor: '#ef4444'
                              }
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Deny Consent
                          </Button>
                        </Can>
                        <Button
                          variant="contained"
                          size="medium"
                          onClick={() => handleConsentAction(memory.id, 'approve')}
                          disabled={isProcessing}
                          sx={{
                            backgroundColor: '#16a34a',
                            '&:hover': {
                              backgroundColor: '#15803d'
                            }
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Consent
                        </Button>
                      </Box>
                    </Can>
                  </Paper>
                </Box>
              </Paper>
            );
          })}
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  RefreshCw,
  Send,
  Database,
  GitBranch,
  Lightbulb,
  Code,
  Shield,
  Users,
  Zap,
  Target,
  Calendar
} from 'lucide-react';

interface Learning {
  id: string;
  timestamp: string;
  category: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  tags: string[];
  applied: boolean;
  automatedActions?: string[];
  metrics?: {
    before: any;
    after: any;
    improvement: string;
  };
}

export default function LifeCEOContinuousLearnings() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isCapturing, setIsCapturing] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch learnings
  const { data: learnings, refetch } = useQuery<Learning[]>({
    queryKey: ['/api/life-ceo/learnings'],
    refetchInterval: isCapturing ? 30000 : false, // Auto-refresh every 30s when capturing
  });

  // Send to Jira mutation
  const sendToJiraMutation = useMutation({
    mutationFn: async (learning: Learning) => {
      const response = await fetch('/api/life-ceo/jira-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'learning',
          data: learning
        })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sent to Jira",
        description: "Learning exported to Jira successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: "Failed to send to Jira",
        variant: "destructive",
      });
    }
  });

  // Auto-capture new learnings
  useEffect(() => {
    if (!isCapturing) return;

    const captureInterval = setInterval(async () => {
      try {
        // Capture learnings from various sources
        await fetch('/api/life-ceo/capture-learnings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sources: ['system_logs', 'user_interactions', 'performance_metrics', 'error_reports']
          })
        });
        refetch();
      } catch (error) {
        console.error('Failed to capture learnings:', error);
      }
    }, 60000); // Capture every minute

    return () => clearInterval(captureInterval);
  }, [isCapturing, refetch]);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      performance: Zap,
      security: Shield,
      ux: Users,
      code: Code,
      integration: GitBranch,
      insight: Lightbulb,
      error: AlertCircle,
      success: CheckCircle,
      optimization: TrendingUp,
    };
    return icons[category] || Brain;
  };

  const getImpactColor = (impact: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700',
    };
    return colors[impact] || 'bg-gray-100 text-gray-700';
  };

  const filteredLearnings = learnings?.filter(learning => 
    activeCategory === 'all' || learning.category === activeCategory
  ) || [];

  const categories = ['all', ...new Set(learnings?.map(l => l.category) || [])];

  // Group learnings by date
  const groupedLearnings = filteredLearnings.reduce((groups, learning) => {
    const date = new Date(learning.timestamp).toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(learning);
    return groups;
  }, {} as Record<string, Learning[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glassmorphic-card">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
                Life CEO Continuous Learnings - 44x21 Framework
              </CardTitle>
              <CardDescription>
                Real-time insights across all 44 technical layers and 21 development phases
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isCapturing ? "default" : "outline"}
                size="sm"
                onClick={() => setIsCapturing(!isCapturing)}
                className={isCapturing ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {isCapturing ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-pulse" />
                    Capturing
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Start Capture
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glassmorphic-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Learnings</p>
                <p className="text-2xl font-bold">{learnings?.length || 0}</p>
              </div>
              <Brain className="w-8 h-8 text-turquoise-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphic-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Applied</p>
                <p className="text-2xl font-bold">
                  {learnings?.filter(l => l.applied).length || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphic-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Impact</p>
                <p className="text-2xl font-bold">
                  {learnings?.filter(l => l.impact === 'high' || l.impact === 'critical').length || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphic-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold">
                  {learnings?.filter(l => 
                    new Date(l.timestamp).toDateString() === new Date().toDateString()
                  ).length || 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex flex-wrap h-auto gap-2 bg-white/50 p-2">
          {categories.map(category => (
            <TabsTrigger
              key={category}
              value={category}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              <Badge className="ml-2" variant="secondary">
                {category === 'all' 
                  ? learnings?.length || 0
                  : learnings?.filter(l => l.category === category).length || 0
                }
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="space-y-6">
              {Object.entries(groupedLearnings).map(([date, dayLearnings]) => (
                <div key={date}>
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">{date}</h3>
                  <div className="space-y-3">
                    {dayLearnings.map((learning) => {
                      const Icon = getCategoryIcon(learning.category);
                      return (
                        <Card key={learning.id} className="glassmorphic-card hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className={`p-2 rounded-lg ${getImpactColor(learning.impact)} bg-opacity-20`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800">{learning.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{learning.description}</p>
                                    
                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {learning.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>

                                    {/* Metrics if available */}
                                    {learning.metrics && (
                                      <div className="mt-3 p-2 bg-gray-50 rounded">
                                        <p className="text-xs font-medium text-gray-700">
                                          Improvement: {learning.metrics.improvement}
                                        </p>
                                      </div>
                                    )}

                                    {/* Automated Actions */}
                                    {learning.automatedActions && learning.automatedActions.length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-xs font-medium text-gray-700">Automated Actions:</p>
                                        <ul className="text-xs text-gray-600 ml-4 list-disc">
                                          {learning.automatedActions.map((action, idx) => (
                                            <li key={idx}>{action}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 ml-4">
                                    <Badge className={getImpactColor(learning.impact)}>
                                      {learning.impact}
                                    </Badge>
                                    {learning.applied && (
                                      <Badge className="bg-green-100 text-green-700">
                                        Applied
                                      </Badge>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => sendToJiraMutation.mutate(learning)}
                                      disabled={sendToJiraMutation.isPending}
                                    >
                                      <Send className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(learning.timestamp).toLocaleTimeString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Database className="w-3 h-3" />
                                    {learning.source}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {filteredLearnings.length === 0 && (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No learnings captured yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    The system is continuously monitoring for insights
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
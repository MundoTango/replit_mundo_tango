// ESA LIFE CEO 56x21 - Life CEO Agent Dashboard (Layer 35: Agent Framework Core)
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Heart, 
  Briefcase, 
  DollarSign, 
  Users, 
  GraduationCap,
  Zap,
  Sparkles,
  Plane,
  Home,
  Apple,
  Activity,
  Moon,
  Target,
  AlertCircle,
  Compass,
  Send,
  Bot,
  MessageCircle,
  TrendingUp
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

// Agent icon mapping
const AGENT_ICONS = {
  'health-advisor': Heart,
  'career-coach': Briefcase,
  'financial-advisor': DollarSign,
  'relationship-counselor': Users,
  'education-mentor': GraduationCap,
  'productivity-optimizer': Zap,
  'mindfulness-guide': Brain,
  'creative-catalyst': Sparkles,
  'travel-planner': Plane,
  'home-organizer': Home,
  'nutrition-specialist': Apple,
  'fitness-trainer': Activity,
  'sleep-optimizer': Moon,
  'habit-architect': Target,
  'emergency-advisor': AlertCircle,
  'life-strategist': Compass
};

// Agent category colors with MT Ocean Theme gradients
const CATEGORY_COLORS = {
  health: 'from-emerald-500 to-teal-500',
  career: 'from-blue-500 to-indigo-500',
  finance: 'from-green-500 to-emerald-500',
  relationships: 'from-pink-500 to-rose-500',
  education: 'from-purple-500 to-indigo-500',
  productivity: 'from-orange-500 to-amber-500',
  'mental-health': 'from-violet-500 to-purple-500',
  creativity: 'from-fuchsia-500 to-pink-500',
  travel: 'from-sky-500 to-blue-500',
  lifestyle: 'from-amber-500 to-orange-500',
  nutrition: 'from-lime-500 to-green-500',
  fitness: 'from-red-500 to-orange-500',
  sleep: 'from-indigo-500 to-blue-500',
  habits: 'from-teal-500 to-cyan-500',
  emergency: 'from-red-600 to-red-500',
  strategy: 'from-cyan-500 to-teal-500'
};

interface Agent {
  id: string;
  name: string;
  category: string;
  description: string;
  capabilities: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
  timestamp?: string;
}

export const LifeCEODashboard: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [sessionId] = useState(`session-${Date.now()}`);

  // Fetch available agents
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/ai/agents'],
    queryFn: async () => {
      const response = await fetch('/api/ai/agents');
      const data = await response.json();
      return data.agents as Agent[];
    }
  });

  // Fetch user memories
  const { data: memories } = useQuery({
    queryKey: ['/api/ai/memories', selectedAgent],
    queryFn: async () => {
      const params = selectedAgent ? `?agentId=${selectedAgent}` : '';
      const response = await fetch(`/api/ai/memories${params}`);
      const data = await response.json();
      return data.memories;
    },
    enabled: !!selectedAgent
  });

  // Fetch recommendations
  const { data: recommendations } = useQuery({
    queryKey: ['/api/ai/recommendations'],
    queryFn: async () => {
      const response = await fetch('/api/ai/recommendations');
      const data = await response.json();
      return data.recommendations;
    }
  });

  // Fetch intelligence metrics
  const { data: metrics } = useQuery({
    queryKey: ['/api/ai/metrics'],
    queryFn: async () => {
      const response = await fetch('/api/ai/metrics');
      const data = await response.json();
      return data.metrics;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (params: { message: string; sessionId: string }) => {
      const response = await apiRequest('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      return response;
    },
    onSuccess: (data) => {
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: data.response, agent: data.agent.name, timestamp: new Date().toISOString() }
      ]);
      setMessage('');
      
      if (!selectedAgent || selectedAgent !== data.agent.id) {
        setSelectedAgent(data.agent.id);
      }
    },
    onError: () => {
      toast({
        title: 'Chat Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    chatMutation.mutate({
      message,
      sessionId
    });
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId);
    setChatHistory([]); // Clear chat when switching agents
  };

  if (agentsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-cyan-600">Loading Life CEO Agents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - MT Ocean Theme */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-teal-500/10 backdrop-blur-sm border border-cyan-200/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              <Brain className="h-6 w-6 text-cyan-600" />
              Life CEO Intelligence System
            </h2>
            <p className="text-gray-600">16 AI Agents • Personalized Life Management • 56 Layer Framework</p>
          </div>
          <Badge className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-0">
            ESA LIFE CEO 56x21
          </Badge>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-cyan-200/20 bg-gradient-to-br from-white/90 to-cyan-50/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-700">Chat Interactions</CardTitle>
              <MessageCircle className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">
                {metrics.chat_interaction?.count || 0}
              </div>
              <p className="text-xs text-gray-600">Total conversations</p>
            </CardContent>
          </Card>

          <Card className="border-teal-200/20 bg-gradient-to-br from-white/90 to-teal-50/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-700">Active Agents</CardTitle>
              <Bot className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">
                {agents?.length || 0}
              </div>
              <p className="text-xs text-gray-600">Available for assistance</p>
            </CardContent>
          </Card>

          <Card className="border-cyan-200/20 bg-gradient-to-br from-white/90 to-cyan-50/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-700">Recommendations</CardTitle>
              <TrendingUp className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">
                {recommendations?.length || 0}
              </div>
              <p className="text-xs text-gray-600">Pending actions</p>
            </CardContent>
          </Card>

          <Card className="border-teal-200/20 bg-gradient-to-br from-white/90 to-teal-50/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-700">Success Rate</CardTitle>
              <Activity className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">
                {metrics.chat_interaction?.average ? 
                  `${(metrics.chat_interaction.average * 100).toFixed(0)}%` : 
                  'N/A'}
              </div>
              <p className="text-xs text-gray-600">Response accuracy</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Selection */}
        <div className="lg:col-span-1">
          <Card className="border-cyan-200/20 bg-gradient-to-br from-white/90 to-cyan-50/10">
            <CardHeader>
              <CardTitle className="text-cyan-700">Life CEO Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {agents?.map(agent => {
                    const Icon = AGENT_ICONS[agent.id as keyof typeof AGENT_ICONS] || Brain;
                    const gradientColor = CATEGORY_COLORS[agent.category as keyof typeof CATEGORY_COLORS] || 'from-gray-500 to-gray-600';
                    
                    return (
                      <Card
                        key={agent.id}
                        className={`cursor-pointer transition-all hover:scale-[1.02] ${
                          selectedAgent === agent.id 
                            ? 'ring-2 ring-cyan-500 bg-gradient-to-br from-cyan-50/50 to-teal-50/50' 
                            : 'hover:bg-gray-50/50'
                        }`}
                        onClick={() => handleAgentSelect(agent.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientColor}`}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{agent.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{agent.description}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {agent.capabilities.slice(0, 2).map(cap => (
                                  <Badge 
                                    key={cap} 
                                    variant="secondary" 
                                    className="text-xs py-0 px-1"
                                  >
                                    {cap}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="border-cyan-200/20 bg-gradient-to-br from-white/90 to-cyan-50/10 h-full">
            <CardHeader>
              <CardTitle className="text-cyan-700">
                {selectedAgent ? 
                  `Chat with ${agents?.find(a => a.id === selectedAgent)?.name}` : 
                  'Start a Conversation'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[600px]">
              {/* Chat Messages */}
              <ScrollArea className="flex-1 mb-4 p-4 rounded-lg bg-white/50">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Start a conversation with any Life CEO agent</p>
                    <p className="text-sm mt-2">They're here to help you optimize every aspect of your life</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatHistory.map((msg, idx) => (
                      <div 
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === 'user' 
                              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white' 
                              : 'bg-gray-100'
                          }`}
                        >
                          {msg.agent && (
                            <div className="text-xs font-semibold mb-1 opacity-70">
                              {msg.agent}
                            </div>
                          )}
                          <div className="text-sm">{msg.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask anything... I'm here to help optimize your life"
                  className="flex-1 border-cyan-300 focus:border-cyan-500"
                  disabled={chatMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || chatMutation.isPending}
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white border-0"
                >
                  {chatMutation.isPending ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Card className="border-cyan-200/20 bg-gradient-to-br from-white/90 to-cyan-50/10">
          <CardHeader>
            <CardTitle className="text-cyan-700">Personalized Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.slice(0, 6).map((rec: any) => (
                <Card key={rec.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Badge className="mb-2" variant="outline">{rec.type}</Badge>
                    <p className="text-sm font-medium mb-1">{rec.item.title || 'Recommendation'}</p>
                    <p className="text-xs text-gray-600">{rec.reasoning}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="text-xs">Accept</Button>
                      <Button size="sm" variant="ghost" className="text-xs">Dismiss</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
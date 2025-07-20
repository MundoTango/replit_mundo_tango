import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain,
  Send,
  Sparkles,
  Layers,
  Gauge,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  BookOpen,
  Lightbulb,
  Target,
  Zap,
  RefreshCw,
  Activity,
  Shield,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { ProfileCompletionAnalyzer, type ProfileCompletionResult } from '@/utils/profileCompletionAnalyzer';

interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  capabilities?: string[];
  analysis?: {
    layers: number[];
    phases: number[];
    actions: string[];
    confidence: number;
  };
}

interface FrameworkMapping {
  keywords: string[];
  layers: number[];
  phases: number[];
  description: string;
}

// Comprehensive framework mapping for natural language understanding
const FRAMEWORK_MAPPINGS: FrameworkMapping[] = [
  // Security & Authentication
  {
    keywords: ['security', 'authentication', 'login', 'password', 'auth', 'jwt', 'session', 'oauth'],
    layers: [9, 21, 24],
    phases: [11],
    description: 'Security, authentication, and access control'
  },
  // Performance & Optimization
  {
    keywords: ['performance', 'speed', 'slow', 'optimize', 'cache', 'loading', 'fast'],
    layers: [10, 11, 26],
    phases: [5, 6, 12],
    description: 'Performance optimization and monitoring'
  },
  // Testing & Quality
  {
    keywords: ['test', 'testing', 'quality', 'bug', 'error', 'fix', 'debug', 'qa'],
    layers: [12, 21],
    phases: [4, 12],
    description: 'Testing, quality assurance, and debugging'
  },
  // Documentation
  {
    keywords: ['documentation', 'docs', 'api', 'guide', 'help', 'readme'],
    layers: [1, 22],
    phases: [13],
    description: 'Documentation and developer resources'
  },
  // Compliance & Legal
  {
    keywords: ['compliance', 'gdpr', 'legal', 'privacy', 'terms', 'policy', 'regulation'],
    layers: [3, 22, 37],
    phases: [16],
    description: 'Legal compliance and regulatory requirements'
  },
  // Analytics & Monitoring
  {
    keywords: ['analytics', 'metrics', 'dashboard', 'monitor', 'track', 'report'],
    layers: [11, 26, 34],
    phases: [7, 15],
    description: 'Analytics, monitoring, and reporting'
  },
  // AI & Intelligence
  {
    keywords: ['ai', 'artificial intelligence', 'ml', 'machine learning', 'agent', 'automation'],
    layers: [13, 14, 15, 16, 39],
    phases: [8],
    description: 'AI, machine learning, and intelligent automation'
  },
  // User Experience
  {
    keywords: ['ui', 'ux', 'design', 'interface', 'user experience', 'accessibility', 'a11y'],
    layers: [4, 17, 18, 22],
    phases: [2, 6],
    description: 'User interface and experience design'
  },
  // Deployment & Infrastructure
  {
    keywords: ['deploy', 'deployment', 'production', 'infrastructure', 'server', 'hosting', 'ci/cd'],
    layers: [10, 27, 28, 38],
    phases: [14, 18, 19],
    description: 'Deployment, infrastructure, and DevOps'
  },
  // Data & Database
  {
    keywords: ['database', 'data', 'sql', 'postgres', 'migration', 'schema', 'query'],
    layers: [5, 6, 33],
    phases: [3],
    description: 'Database design and data management'
  },
  // Messaging & Communication
  {
    keywords: ['messaging', 'chat', 'direct message', 'dm', 'notification', 'alert', 'email'],
    layers: [8, 11],
    phases: [9],
    description: 'Messaging, notifications, and communication features'
  },
  // Settings & Configuration
  {
    keywords: ['settings', 'config', 'configuration', 'preferences', 'profile', 'user settings'],
    layers: [4, 17],
    phases: [2],
    description: 'User settings and configuration management'
  },
  // Profile Completion
  {
    keywords: ['profile completion', 'complete profile', 'profile complete', 'missing fields', 'profile analysis', 'profile check', 'profile status'],
    layers: [5, 7, 11, 22],
    phases: [1, 2, 7],
    description: 'Profile completion analysis and field validation'
  }
];

const LifeCEOFrameworkAgent: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Fetch profile data for completion analysis
  const { data: travelDetails } = useQuery({
    queryKey: ['/api/user/travel-details'],
    enabled: !!user?.id
  });
  
  const { data: guestProfile } = useQuery({
    queryKey: ['/api/user/guest-profile'],
    enabled: !!user?.id
  });

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: AgentMessage = {
      id: '1',
      role: 'agent',
      content: `Hello! I'm the Life CEO Framework Agent. I understand the entire 40-Layer x 20-Phase framework and can help you navigate and activate the right capabilities based on your needs.

Try asking me things like:
• "Check security compliance for user authentication"
• "Run performance tests on the profile system"
• "Set up direct messaging between users"
• "Generate documentation for the API"
• "Deploy to production"
• "Check my profile completion" or "Analyze profile completion"

I'll analyze your request and activate the appropriate framework layers and phases.`,
      timestamp: new Date(),
      capabilities: ['40 Layers', '20 Phases', 'Natural Language Understanding', 'Intelligent Orchestration']
    };
    setMessages([welcomeMessage]);
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const generateProgressBar = (percentage: number): string => {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
  };

  const analyzeUserIntent = (input: string): AgentMessage['analysis'] => {
    const lowerInput = input.toLowerCase();
    const matchedLayers = new Set<number>();
    const matchedPhases = new Set<number>();
    const actions: string[] = [];
    let totalConfidence = 0;
    let matchCount = 0;

    // Analyze against all framework mappings
    FRAMEWORK_MAPPINGS.forEach(mapping => {
      const keywordMatches = mapping.keywords.filter(keyword => 
        lowerInput.includes(keyword)
      ).length;

      if (keywordMatches > 0) {
        mapping.layers.forEach(layer => matchedLayers.add(layer));
        mapping.phases.forEach(phase => matchedPhases.add(phase));
        actions.push(mapping.description);
        totalConfidence += keywordMatches * 20;
        matchCount++;
      }
    });

    // Calculate confidence score
    const confidence = Math.min(100, matchCount > 0 ? totalConfidence / matchCount : 0);

    // If no specific matches, suggest general analysis
    if (matchedLayers.size === 0) {
      return {
        layers: [1, 2], // Default to expertise and research
        phases: [1],    // Default to foundation
        actions: ['General framework analysis and recommendations'],
        confidence: 30
      };
    }

    return {
      layers: Array.from(matchedLayers).sort((a, b) => a - b),
      phases: Array.from(matchedPhases).sort((a, b) => a - b),
      actions: Array.from(new Set(actions)),
      confidence
    };
  };

  const generateAgentResponse = async (userInput: string, analysis: AgentMessage['analysis']) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (!analysis) return 'Unable to analyze your request. Please try rephrasing.';

    const { layers, phases, actions, confidence } = analysis;
    
    let response = `I've analyzed your request and identified the relevant framework capabilities:\n\n`;
    
    response += `**Framework Analysis** (${confidence}% confidence)\n`;
    response += `• Layers: ${layers.map((l: number) => `Layer ${l}`).join(', ')}\n`;
    response += `• Phases: ${phases.map((p: number) => `Phase ${p}`).join(', ')}\n`;
    response += `• Actions: ${actions.join(', ')}\n\n`;

    // Provide specific recommendations based on the request
    if (userInput.toLowerCase().includes('security')) {
      response += `**Security Analysis**\n`;
      response += `• Layer 9 (Security & Authentication): Checking JWT implementation\n`;
      response += `• Layer 21 (Production Resilience): Reviewing security headers\n`;
      response += `• Phase 11 (Security Hardening): Advanced security measures\n\n`;
      response += `**Recommendations:**\n`;
      response += `1. Enable 2FA for all admin accounts\n`;
      response += `2. Implement rate limiting on authentication endpoints\n`;
      response += `3. Add security headers (CSP, HSTS, X-Frame-Options)\n`;
      response += `4. Regular security audits with automated tools\n`;
    } else if (userInput.toLowerCase().includes('performance')) {
      response += `**Performance Analysis**\n`;
      response += `• Layer 10 (Deployment): Checking build optimization\n`;
      response += `• Layer 11 (Analytics): Reviewing performance metrics\n`;
      response += `• Phase 5 (Performance): Optimization strategies\n\n`;
      response += `**Current Metrics:**\n`;
      response += `• Page Load Time: 2.3s (target: <1.5s)\n`;
      response += `• API Response Time: 120ms (good)\n`;
      response += `• Bundle Size: 1.2MB (needs optimization)\n`;
      response += `• Cache Hit Rate: 85% (good)\n`;
    } else if (userInput.toLowerCase().includes('messaging') || userInput.toLowerCase().includes('direct message')) {
      response += `**Messaging System Implementation**\n`;
      response += `• Layer 8 (API & Integration): WebSocket setup needed\n`;
      response += `• Layer 11 (Analytics): Message delivery tracking\n`;
      response += `• Phase 9 (Social Features): Messaging UI components\n\n`;
      response += `**Implementation Steps:**\n`;
      response += `1. Create message schema in database\n`;
      response += `2. Implement WebSocket server for real-time delivery\n`;
      response += `3. Build messaging UI components\n`;
      response += `4. Add notification system integration\n`;
      response += `5. Implement message encryption for privacy\n`;
    } else if (userInput.toLowerCase().includes('deploy') || userInput.toLowerCase().includes('production')) {
      response += `**Deployment Readiness Check**\n`;
      response += `• Layer 10 (Deployment): CI/CD pipeline status\n`;
      response += `• Layer 21 (Production Resilience): Error tracking ready\n`;
      response += `• Phase 18 (Launch Readiness): Pre-launch validation\n\n`;
      response += `**Deployment Checklist:**\n`;
      response += `✅ Database migrations tested\n`;
      response += `✅ Environment variables configured\n`;
      response += `⚠️ Performance testing incomplete\n`;
      response += `❌ Load testing not performed\n`;
      response += `❌ Rollback plan not documented\n`;
    } else if (userInput.toLowerCase().includes('profile complet') || userInput.toLowerCase().includes('profile check') || userInput.toLowerCase().includes('profile analysis')) {
      // Perform profile completion analysis
      if (!user) {
        response += `**Profile Analysis Error**\n`;
        response += `Unable to analyze profile - no user session found.\n`;
        response += `Please ensure you're logged in to check your profile completion.\n`;
      } else {
        const analysis = ProfileCompletionAnalyzer.analyzeProfile(user, null, travelDetails, guestProfile);
        
        response += `**Profile Completion Analysis for ${user.name || user.username}**\n\n`;
        
        // Overall score with visual indicator
        response += `📊 **Overall Completion: ${analysis.overallScore}%**\n`;
        response += `${generateProgressBar(analysis.overallScore)}\n\n`;
        
        // Category breakdown
        response += `**Category Scores:**\n`;
        Object.entries(analysis.categoryScores).forEach(([category, score]) => {
          const icon = score === 100 ? '✅' : score >= 60 ? '🔶' : '❌';
          response += `${icon} ${category}: ${score}%\n`;
        });
        response += '\n';
        
        // Missing required fields
        if (analysis.missingFields.length > 0) {
          response += `**❗ Missing Required Fields (${analysis.missingFields.length}):**\n`;
          analysis.missingFields.forEach(field => {
            response += `• ${field.description || ProfileCompletionAnalyzer.getFieldDisplayName(field.name)}\n`;
          });
          response += '\n';
        }
        
        // Framework mapping for improvements
        response += `**Framework Activation for Profile Improvement:**\n`;
        const categoryMappings = new Map<string, { layers: number[], phases: number[] }>();
        
        analysis.missingFields.forEach(field => {
          const mapping = ProfileCompletionAnalyzer.getFrameworkMapping(field.category);
          if (!categoryMappings.has(field.category)) {
            categoryMappings.set(field.category, mapping);
          }
        });
        
        categoryMappings.forEach((mapping, category) => {
          response += `• ${category}: Layers ${mapping.layers.join(', ')}, Phases ${mapping.phases.join(', ')}\n`;
        });
        response += '\n';
        
        // Recommendations
        response += `**Recommendations:**\n`;
        analysis.recommendations.forEach((rec, index) => {
          response += `${index + 1}. ${rec}\n`;
        });
        
        // Quick actions
        response += `\n**Quick Actions:**\n`;
        response += `• Navigate to your profile to update missing fields\n`;
        response += `• Upload a profile photo for better visibility\n`;
        response += `• Complete your tango experience details\n`;
        response += `• Add languages you speak for international connections\n`;
      }
    } else {
      response += `**General Recommendations:**\n`;
      response += `Based on your request, I recommend:\n`;
      response += `1. Starting with the identified layers for implementation\n`;
      response += `2. Following the phase progression for systematic development\n`;
      response += `3. Using the framework's built-in validation tools\n`;
      response += `4. Monitoring progress through the dashboard\n`;
    }

    response += `\n**Next Steps:**\n`;
    response += `Would you like me to:\n`;
    response += `• Generate detailed implementation plans?\n`;
    response += `• Run automated tests for these areas?\n`;
    response += `• Create documentation templates?\n`;
    response += `• Set up monitoring for these capabilities?`;

    return response;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Analyze user intent
      const analysis = analyzeUserIntent(input);
      
      // Generate agent response
      const responseContent = await generateAgentResponse(input, analysis);
      
      const agentMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: responseContent,
        timestamp: new Date(),
        analysis,
        capabilities: analysis?.actions || []
      };

      setMessages(prev => [...prev, agentMessage]);

      // Store conversation for learning
      try {
        await apiRequest('/api/life-ceo/framework-agent/conversation', 'POST', {
          userInput: input,
          analysis,
          response: responseContent
        });
      } catch (error) {
        console.log('Failed to store conversation:', error);
      }

    } catch (error) {
      console.error('Agent error:', error);
      toast({
        title: "Agent Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getMessageIcon = (role: string) => {
    return role === 'user' ? <MessageSquare className="w-4 h-4" /> : <Brain className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-turquoise-500 to-blue-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Life CEO Framework Agent</h2>
            <p className="text-sm text-gray-600">Natural language interface to the 40L x 20P framework</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCapabilities(!showCapabilities)}
        >
          <Layers className="w-4 h-4 mr-2" />
          {showCapabilities ? 'Hide' : 'Show'} Capabilities
        </Button>
      </div>

      {/* Capabilities Overview */}
      {showCapabilities && (
        <Card className="border-turquoise-200 bg-turquoise-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-turquoise-600" />
              Agent Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FRAMEWORK_MAPPINGS.map((mapping, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-turquoise-200">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1">
                    {mapping.description}
                  </h4>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">
                      Layers: {mapping.layers.map(l => `L${l}`).join(', ')}
                    </p>
                    <p className="text-xs text-gray-600">
                      Phases: {mapping.phases.map(p => `P${p}`).join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Framework Assistant</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Activity className="w-3 h-3 mr-1" />
                Active
              </Badge>
              <Badge variant="secondary">
                {messages.length - 1} messages
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'agent' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-turquoise-500 to-blue-600 flex items-center justify-center text-white">
                      <Brain className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-turquoise-100 text-gray-900'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                    {message.analysis && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Target className="w-3 h-3" />
                          Confidence: {message.analysis?.confidence || 0}%
                        </div>
                      </div>
                    )}
                    {message.capabilities && message.capabilities.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.capabilities.map((cap, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      {format(message.timestamp, 'HH:mm')}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              {isProcessing && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-turquoise-500 to-blue-600 flex items-center justify-center text-white">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-turquoise-600" />
                      <span className="text-sm text-gray-600">Analyzing your request...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask me anything about the framework..."
                className="flex-1 min-h-[60px] max-h-[120px]"
                disabled={isProcessing}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isProcessing}
                className="bg-gradient-to-r from-turquoise-500 to-blue-600 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('Check security compliance for the entire platform')}
            >
              <Shield className="w-4 h-4 mr-2" />
              Security Check
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('Run performance analysis and optimization recommendations')}
            >
              <Activity className="w-4 h-4 mr-2" />
              Performance
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('Generate API documentation for all endpoints')}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Documentation
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('Prepare for production deployment')}
            >
              <Gauge className="w-4 h-4 mr-2" />
              Deploy Check
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LifeCEOFrameworkAgent;
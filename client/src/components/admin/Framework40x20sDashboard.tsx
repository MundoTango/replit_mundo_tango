import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { CheckCircle, AlertCircle, Clock, Play, Pause, RotateCcw, Shield, User, Zap, Brain, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// 40x20s Framework - Expert Worker System for Platform Development
// 40 Layers x 20 Phases = 800 checkpoints of expertise

interface FrameworkLayer {
  id: number;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'foundation' | 'architecture' | 'operational' | 'ai' | 'human' | 'engineering' | 'innovation';
  teamMapping?: string[]; // Maps to teams from "The Plan"
  status: 'not_started' | 'in_progress' | 'review' | 'complete';
  progress: number;
}

interface ReviewLevel {
  id: string;
  name: string;
  description: string;
  duration: string;
  depth: 'quick' | 'standard' | 'comprehensive';
}

interface WorkReview {
  id: string;
  workItemId: string;
  layerId: number;
  phase: number;
  status: 'pending' | 'in_progress' | 'passed' | 'failed';
  findings: string[];
  recommendations: string[];
  reviewLevel: string;
  createdAt: Date;
}

const FRAMEWORK_LAYERS: FrameworkLayer[] = [
  // Foundation Layers (1-4)
  { id: 1, name: 'Expertise & Technical Proficiency', description: 'Platform mastery and technical skills', icon: Brain, category: 'foundation', teamMapping: ['Engineering', 'Architecture'], status: 'complete', progress: 100 },
  { id: 2, name: 'Research & Discovery', description: 'Feature research and user needs analysis', icon: TrendingUp, category: 'foundation', teamMapping: ['Product', 'UX'], status: 'complete', progress: 100 },
  { id: 3, name: 'Legal & Compliance', description: 'Privacy, GDPR, and regulatory compliance', icon: Shield, category: 'foundation', teamMapping: ['Legal', 'Compliance'], status: 'in_progress', progress: 74 },
  { id: 4, name: 'UX/UI Design', description: 'User experience and interface design', icon: User, category: 'foundation', teamMapping: ['Design', 'UX'], status: 'complete', progress: 100 },
  
  // Architecture Layers (5-8)
  { id: 5, name: 'Data Architecture', description: 'Database design and optimization', icon: Zap, category: 'architecture', teamMapping: ['Data', 'Engineering'], status: 'complete', progress: 100 },
  { id: 6, name: 'Backend Development', description: 'Server-side logic and APIs', icon: Zap, category: 'architecture', teamMapping: ['Backend', 'API'], status: 'complete', progress: 100 },
  { id: 7, name: 'Frontend Development', description: 'Client-side implementation', icon: Zap, category: 'architecture', teamMapping: ['Frontend', 'Mobile'], status: 'complete', progress: 100 },
  { id: 8, name: 'API & Integration', description: 'External services and integrations', icon: Zap, category: 'architecture', teamMapping: ['Integration', 'DevOps'], status: 'in_progress', progress: 85 },
  
  // Operational Layers (9-12)
  { id: 9, name: 'Security & Authentication', description: 'Platform security and user authentication', icon: Shield, category: 'operational', teamMapping: ['Security', 'DevOps'], status: 'complete', progress: 95 },
  { id: 10, name: 'Deployment & Infrastructure', description: 'CI/CD and cloud infrastructure', icon: Zap, category: 'operational', teamMapping: ['DevOps', 'Infrastructure'], status: 'complete', progress: 90 },
  { id: 11, name: 'Analytics & Monitoring', description: 'Performance tracking and insights', icon: TrendingUp, category: 'operational', teamMapping: ['Analytics', 'Data'], status: 'in_progress', progress: 75 },
  { id: 12, name: 'Continuous Improvement', description: 'Optimization and refinement cycles', icon: RotateCcw, category: 'operational', teamMapping: ['QA', 'Product'], status: 'in_progress', progress: 80 },
  
  // AI & Intelligence Layers (13-16)
  { id: 13, name: 'AI Agent Orchestration', description: 'Life CEO agent coordination', icon: Brain, category: 'ai', teamMapping: ['AI', 'Engineering'], status: 'complete', progress: 100 },
  { id: 14, name: 'Context & Memory Management', description: 'Semantic memory and context awareness', icon: Brain, category: 'ai', teamMapping: ['AI', 'Data'], status: 'complete', progress: 95 },
  { id: 15, name: 'Voice & Environmental Intelligence', description: 'Voice processing and location awareness', icon: Brain, category: 'ai', teamMapping: ['AI', 'Mobile'], status: 'complete', progress: 90 },
  { id: 16, name: 'Ethics & Behavioral Alignment', description: 'AI safety and ethical guidelines', icon: Shield, category: 'ai', teamMapping: ['AI', 'Legal'], status: 'in_progress', progress: 85 },
  
  // Human-Centric Layers (17-20)
  { id: 17, name: 'Emotional Intelligence', description: 'Understanding user emotions and context', icon: User, category: 'human', teamMapping: ['UX', 'AI'], status: 'in_progress', progress: 70 },
  { id: 18, name: 'Cultural Awareness', description: 'Multi-cultural adaptability', icon: User, category: 'human', teamMapping: ['Content', 'Localization'], status: 'in_progress', progress: 65 },
  { id: 19, name: 'Energy Management', description: 'User energy and wellness optimization', icon: User, category: 'human', teamMapping: ['Health', 'Wellness'], status: 'in_progress', progress: 60 },
  { id: 20, name: 'Proactive Intelligence', description: 'Anticipatory assistance and recommendations', icon: Brain, category: 'human', teamMapping: ['AI', 'Product'], status: 'in_progress', progress: 75 },
  
  // Production Engineering Layers (21-24)
  { id: 21, name: 'Production Resilience Engineering', description: 'Error tracking and recovery', icon: Shield, category: 'engineering', teamMapping: ['SRE', 'DevOps'], status: 'complete', progress: 90 },
  { id: 22, name: 'User Safety Net', description: 'GDPR compliance and accessibility', icon: Shield, category: 'engineering', teamMapping: ['Legal', 'Security'], status: 'in_progress', progress: 85 },
  { id: 23, name: 'Business Continuity', description: 'Backup and disaster recovery', icon: Shield, category: 'engineering', teamMapping: ['Infrastructure', 'SRE'], status: 'in_progress', progress: 80 },
  { id: 24, name: 'Performance Optimization', description: 'Speed and efficiency improvements', icon: Zap, category: 'engineering', teamMapping: ['Performance', 'Engineering'], status: 'complete', progress: 92 },
  
  // Community & Social Layers (25-28)
  { id: 25, name: 'Community Building', description: 'User engagement and growth', icon: User, category: 'human', teamMapping: ['Community', 'Marketing'], status: 'in_progress', progress: 75 },
  { id: 26, name: 'Content Strategy', description: 'Content creation and curation', icon: TrendingUp, category: 'human', teamMapping: ['Content', 'Marketing'], status: 'in_progress', progress: 70 },
  { id: 27, name: 'Partnership Development', description: 'Strategic partnerships and integrations', icon: User, category: 'human', teamMapping: ['Business', 'Partnership'], status: 'in_progress', progress: 65 },
  { id: 28, name: 'Monetization Strategy', description: 'Revenue models and pricing', icon: TrendingUp, category: 'human', teamMapping: ['Business', 'Finance'], status: 'in_progress', progress: 60 },
  
  // Advanced Technical Layers (29-32)
  { id: 29, name: 'Machine Learning Models', description: 'ML model training and deployment', icon: Brain, category: 'ai', teamMapping: ['ML', 'Data Science'], status: 'in_progress', progress: 78 },
  { id: 30, name: 'Blockchain Integration', description: 'Decentralized features and smart contracts', icon: Zap, category: 'innovation', teamMapping: ['Blockchain', 'Engineering'], status: 'not_started', progress: 0 },
  { id: 31, name: 'Testing & Validation', description: 'Automated testing and quality assurance', icon: CheckCircle, category: 'engineering', teamMapping: ['QA', 'Engineering'], status: 'complete', progress: 88 },
  { id: 32, name: 'Developer Experience', description: 'Tools and documentation for developers', icon: Zap, category: 'engineering', teamMapping: ['DevRel', 'Documentation'], status: 'in_progress', progress: 82 },
  
  // Innovation & Future Layers (33-36)
  { id: 33, name: 'Data Migration & Evolution', description: 'Schema versioning and data transformation', icon: Zap, category: 'engineering', teamMapping: ['Data', 'Engineering'], status: 'complete', progress: 90 },
  { id: 34, name: 'Enhanced Observability', description: 'Distributed tracing and APM', icon: TrendingUp, category: 'operational', teamMapping: ['SRE', 'DevOps'], status: 'in_progress', progress: 76 },
  { id: 35, name: 'Feature Flags & Experimentation', description: 'A/B testing and canary deployments', icon: Zap, category: 'operational', teamMapping: ['Product', 'Engineering'], status: 'in_progress', progress: 72 },
  { id: 36, name: 'Edge Computing', description: 'CDN and edge function deployment', icon: Zap, category: 'innovation', teamMapping: ['Infrastructure', 'Engineering'], status: 'not_started', progress: 0 },
  
  // Strategic Vision Layers (37-40)
  { id: 37, name: 'Global Expansion', description: 'Internationalization and localization', icon: User, category: 'innovation', teamMapping: ['Global', 'Localization'], status: 'in_progress', progress: 55 },
  { id: 38, name: 'Platform Ecosystem', description: 'Third-party integrations and APIs', icon: Zap, category: 'innovation', teamMapping: ['Platform', 'API'], status: 'in_progress', progress: 68 },
  { id: 39, name: 'Innovation Lab', description: 'Experimental features and R&D', icon: Brain, category: 'innovation', teamMapping: ['R&D', 'Innovation'], status: 'in_progress', progress: 45 },
  { id: 40, name: 'Future Vision', description: 'Long-term strategy and planning', icon: TrendingUp, category: 'innovation', teamMapping: ['Executive', 'Strategy'], status: 'in_progress', progress: 50 }
];

const REVIEW_LEVELS: ReviewLevel[] = [
  {
    id: 'quick',
    name: 'Quick Check',
    description: 'Basic validation of core functionality',
    duration: '5-10 minutes',
    depth: 'quick'
  },
  {
    id: 'standard',
    name: 'Standard Review',
    description: 'Thorough testing across multiple layers',
    duration: '30-60 minutes',
    depth: 'standard'
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive Review',
    description: 'Full 40x20s framework validation',
    duration: '2-4 hours',
    depth: 'comprehensive'
  }
];

export default function Framework40x20sDashboard() {
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [selectedReviewLevel, setSelectedReviewLevel] = useState<string>('standard');
  const [isReviewActive, setIsReviewActive] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // 40x20s Framework is active and ready - v1.0.1
  useEffect(() => {
    console.log('40x20s Framework Dashboard loaded - Expert Worker System Ready');
  }, []);

  // Fetch active work items from "The Plan"
  const { data: activeWork } = useQuery({
    queryKey: ['/api/admin/active-work-items'],
    queryFn: async () => {
      const response = await fetch('/api/admin/active-work-items', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch work items');
      return response.json();
    }
  });

  // Fetch review history
  const { data: reviews } = useQuery({
    queryKey: ['/api/admin/framework-reviews'],
    queryFn: async () => {
      const response = await fetch('/api/admin/framework-reviews', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    }
  });

  // Start framework review
  const startReview = useMutation({
    mutationFn: async (data: { workItemId: string; reviewLevel: string; layers?: number[] }) => {
      const response = await apiRequest('POST', '/api/admin/framework-reviews/start', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: '40x20s Review Started',
        description: 'The expert worker is analyzing your work across all framework layers.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/framework-reviews'] });
      setIsReviewActive(true);
    }
  });

  // Perform Life CEO Review
  const performLifeCEOReview = useMutation({
    mutationFn: async () => {
      console.log('Performing Life CEO Review...');
      const response = await apiRequest('POST', '/api/admin/life-ceo-review', {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Life CEO Review Complete',
        description: data.recommendations?.join(' ') || 'Review completed successfully.',
      });
      
      // Log the analysis results
      console.log('Life CEO Review Results:', data);
      
      // Refresh active work items
      queryClient.invalidateQueries({ queryKey: ['/api/admin/active-work-items'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Review Failed',
        description: error.message || 'Failed to perform Life CEO review',
        variant: 'destructive'
      });
    }
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      foundation: 'from-blue-500 to-cyan-500',
      architecture: 'from-purple-500 to-pink-500',
      operational: 'from-green-500 to-emerald-500',
      ai: 'from-orange-500 to-red-500',
      human: 'from-yellow-500 to-amber-500',
      engineering: 'from-indigo-500 to-purple-500',
      innovation: 'from-pink-500 to-rose-500'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-100/50 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              40x20s Framework Dashboard
            </h2>
            <p className="text-gray-600 mt-2">
              Expert Worker System: 40 Layers × 20 Phases = 800 Quality Checkpoints
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => performLifeCEOReview.mutate()}
              disabled={performLifeCEOReview.isPending}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {performLifeCEOReview.isPending ? (
                <>
                  <Clock className="w-5 h-5 inline mr-2 animate-spin" />
                  Reviewing...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 inline mr-2" />
                  Life CEO Review
                </>
              )}
            </button>
            <button
              onClick={() => startReview.mutate({
                workItemId: activeWork?.current?.id || '',
                reviewLevel: selectedReviewLevel
              })}
              disabled={!activeWork?.current || isReviewActive}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isReviewActive ? (
                <>
                  <Clock className="h-5 w-5 animate-spin" />
                  Review in Progress...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Start Review
                </>
              )}
            </button>
          </div>
        </div>

        {/* Review Level Selection */}
        <div className="grid grid-cols-3 gap-4">
          {REVIEW_LEVELS.map(level => (
            <button
              key={level.id}
              onClick={() => setSelectedReviewLevel(level.id)}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                selectedReviewLevel === level.id
                  ? 'border-blue-500 bg-blue-50/50 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <h3 className="font-semibold text-lg mb-2">{level.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{level.description}</p>
              <p className="text-xs text-gray-500">Duration: {level.duration}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Framework Layers Grid */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-100/50 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Framework Layers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FRAMEWORK_LAYERS.slice(0, 8).map((layer) => {
            const Icon = layer.icon;
            return (
              <button
                key={layer.id}
                onClick={() => setSelectedLayer(layer.id)}
                className={`p-6 rounded-2xl bg-gradient-to-r ${getCategoryColor(layer.category)} text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${
                  selectedLayer === layer.id ? 'ring-4 ring-white ring-opacity-50' : ''
                }`}
              >
                <Icon className="h-8 w-8 mb-3" />
                <h4 className="font-semibold text-lg mb-1">Layer {layer.id}</h4>
                <p className="text-sm opacity-90 mb-3">{layer.name}</p>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{ width: `${layer.progress}%` }}
                  />
                </div>
                <p className="text-xs mt-2 opacity-80">{layer.progress}% Complete</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Reviews */}
      {reviews?.length > 0 && (
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-100/50 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Reviews</h3>
          <div className="space-y-4">
            {reviews.slice(0, 5).map((review: WorkReview) => (
              <div key={review.id} className="p-6 bg-gray-50 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {review.status === 'passed' ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : review.status === 'failed' ? (
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    ) : (
                      <Clock className="h-6 w-6 text-yellow-500" />
                    )}
                    <span className="font-semibold">Layer {review.layerId} - Phase {review.phase}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleString()}
                  </span>
                </div>
                {review.findings.length > 0 && (
                  <div className="mb-3">
                    <p className="font-medium text-sm text-gray-700 mb-1">Findings:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {review.findings.map((finding, idx) => (
                        <li key={idx}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {review.recommendations.length > 0 && (
                  <div>
                    <p className="font-medium text-sm text-gray-700 mb-1">Recommendations:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {review.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
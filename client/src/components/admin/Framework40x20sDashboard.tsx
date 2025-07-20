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
  
  // ... Add remaining 32 layers following the same pattern
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
      return apiRequest('/api/admin/framework-reviews/start', {
        method: 'POST',
        body: JSON.stringify(data)
      });
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
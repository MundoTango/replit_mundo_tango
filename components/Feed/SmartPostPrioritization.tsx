import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Users, MessageCircle, Heart, Calendar } from 'lucide-react';

interface SmartPostPrioritizationProps {
  posts: any[];
  userRole: string[];
  userLocation?: { city: string; country: string };
  onPostsReorder: (reorderedPosts: any[]) => void;
}

interface PostPriorityScore {
  postId: number;
  score: number;
  reasons: string[];
  category: 'high' | 'medium' | 'low';
}

interface PriorityIndicatorProps {
  post: any;
  score: PostPriorityScore;
  compact?: boolean;
}

const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({ post, score, compact = false }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'high': return <TrendingUp className="w-3 h-3" />;
      case 'medium': return <Clock className="w-3 h-3" />;
      default: return null;
    }
  };

  if (compact && score.category === 'low') return null;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getCategoryColor(score.category)}`}>
      {getCategoryIcon(score.category)}
      {!compact && (
        <span className="font-medium">
          {score.category === 'high' ? 'Priority' : score.category === 'medium' ? 'Relevant' : 'Standard'}
        </span>
      )}
      {score.reasons.length > 0 && (
        <span className="opacity-75">
          • {score.reasons[0]}
        </span>
      )}
    </div>
  );
};

const SmartPostPrioritization: React.FC<SmartPostPrioritizationProps> = ({
  posts,
  userRole,
  userLocation,
  onPostsReorder
}) => {
  const [prioritizedPosts, setPrioritizedPosts] = useState<any[]>([]);
  const [priorityScores, setPriorityScores] = useState<Map<number, PostPriorityScore>>(new Map());

  const calculatePostPriority = (post: any): PostPriorityScore => {
    let score = 0;
    const reasons: string[] = [];

    // Base engagement score (0-30 points)
    const engagementScore = (post.total_likes || 0) + (post.total_comments || 0) * 2 + (post.total_shares || 0) * 3;
    score += Math.min(engagementScore, 30);

    // Recency bonus (0-20 points)
    const hoursSincePost = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
    if (hoursSincePost < 24) {
      const recencyScore = Math.max(20 - hoursSincePost, 0);
      score += recencyScore;
      if (hoursSincePost < 6) reasons.push('Recent');
    }

    // Connection strength (0-25 points)
    if (post.user?.connection_strength === 'close') {
      score += 25;
      reasons.push('Close friend');
    } else if (post.user?.connection_strength === 'regular') {
      score += 15;
      reasons.push('Regular contact');
    } else if (post.user?.connection_strength === 'dance_partner') {
      score += 20;
      reasons.push('Dance partner');
    }

    // Location relevance (0-15 points)
    if (userLocation && post.location) {
      if (post.location.toLowerCase().includes(userLocation.city.toLowerCase())) {
        score += 15;
        reasons.push('Local');
      } else if (post.location.toLowerCase().includes(userLocation.country.toLowerCase())) {
        score += 8;
      }
    }

    // Role-specific content bonus (0-20 points)
    const content = post.content?.toLowerCase() || '';
    
    if (userRole.includes('teacher') || userRole.includes('instructor')) {
      if (content.includes('teach') || content.includes('lesson') || content.includes('technique')) {
        score += 15;
        reasons.push('Teaching content');
      }
    }

    if (userRole.includes('dj')) {
      if (content.includes('music') || content.includes('orchestra') || content.includes('dj')) {
        score += 15;
        reasons.push('Music content');
      }
    }

    if (userRole.includes('organizer')) {
      if (content.includes('event') || content.includes('milonga') || content.includes('festival')) {
        score += 15;
        reasons.push('Event content');
      }
    }

    // Event/milestone content (0-10 points)
    if (content.includes('birthday') || content.includes('anniversary') || content.includes('celebration')) {
      score += 10;
      reasons.push('Celebration');
    }

    // Question/discussion starter (0-10 points)
    if (content.includes('?') || content.includes('what do you think') || content.includes('thoughts')) {
      score += 8;
      reasons.push('Discussion');
    }

    // Determine category
    let category: 'high' | 'medium' | 'low';
    if (score >= 50) category = 'high';
    else if (score >= 25) category = 'medium';
    else category = 'low';

    return {
      postId: post.id,
      score,
      reasons: reasons.slice(0, 2), // Limit to 2 most important reasons
      category
    };
  };

  const prioritizePosts = () => {
    const scored = posts.map(post => ({
      post,
      priority: calculatePostPriority(post)
    }));

    // Sort by priority score, then by recency
    const sorted = scored.sort((a, b) => {
      if (a.priority.score !== b.priority.score) {
        return b.priority.score - a.priority.score;
      }
      // If scores are equal, sort by recency
      return new Date(b.post.created_at).getTime() - new Date(a.post.created_at).getTime();
    });

    const newPriorityScores = new Map<number, PostPriorityScore>();
    const reorderedPosts = sorted.map(({ post, priority }) => {
      newPriorityScores.set(post.id, priority);
      return post;
    });

    setPriorityScores(newPriorityScores);
    setPrioritizedPosts(reorderedPosts);
    onPostsReorder(reorderedPosts);
  };

  useEffect(() => {
    if (posts.length > 0) {
      prioritizePosts();
    }
  }, [posts, userRole, userLocation]);

  // Enhanced post component wrapper
  const PrioritizedPost: React.FC<{ post: any; children: React.ReactNode }> = ({ post, children }) => {
    const score = priorityScores.get(post.id);
    if (!score) return <>{children}</>;

    return (
      <div className={`relative ${score.category === 'high' ? 'ring-1 ring-red-200' : ''}`}>
        {/* Priority indicator in top-right */}
        <div className="absolute top-4 right-4 z-10">
          <PriorityIndicator post={post} score={score} compact />
        </div>
        
        {/* Priority border for high-priority posts */}
        {score.category === 'high' && (
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l-xl"></div>
        )}
        
        {children}
        
        {/* Detailed priority info at bottom for high-priority posts */}
        {score.category === 'high' && score.reasons.length > 0 && (
          <div className="mt-3 pt-3 border-t border-red-100">
            <div className="flex items-center gap-2 text-xs text-red-600">
              <TrendingUp className="w-3 h-3" />
              <span>Prioritized because: {score.reasons.join(', ')}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getStatsForUser = () => {
    const high = Array.from(priorityScores.values()).filter(s => s.category === 'high').length;
    const medium = Array.from(priorityScores.values()).filter(s => s.category === 'medium').length;
    const low = Array.from(priorityScores.values()).filter(s => s.category === 'low').length;
    
    return { high, medium, low };
  };

  return {
    PrioritizedPost,
    priorityScores,
    getStatsForUser,
    // Helper component for showing priority stats
    PriorityStats: () => {
      const stats = getStatsForUser();
      if (stats.high + stats.medium + stats.low === 0) return null;
      
      return (
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>{stats.high} priority</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span>{stats.medium} relevant</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span>{stats.low} standard</span>
          </div>
        </div>
      );
    }
  };
};

export default SmartPostPrioritization;
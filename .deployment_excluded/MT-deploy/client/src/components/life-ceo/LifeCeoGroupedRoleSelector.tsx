import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Life CEO Agent Categories with roles
const agentCategories = [
  {
    id: 'business',
    name: 'Business & Finance',
    description: 'Manage your professional and financial life',
    icon: '💼',
    bgGradient: 'from-blue-400 to-indigo-500',
    roles: [
      { id: 'business_manager', emoji: '📊', label: 'Business Manager', description: 'Strategic planning and operations' },
      { id: 'finance_tracker', emoji: '💰', label: 'Finance Tracker', description: 'Budget and investment management' },
      { id: 'investment_advisor', emoji: '📈', label: 'Investment Advisor', description: 'Portfolio optimization' }
    ]
  },
  {
    id: 'community',
    name: 'Community & Social',
    description: 'Build and maintain relationships',
    icon: '🤝',
    bgGradient: 'from-turquoise-400 to-cyan-500',
    roles: [
      { id: 'community_builder', emoji: '🏘️', label: 'Community Builder', description: 'Network and relationship management' },
      { id: 'social_coordinator', emoji: '🎉', label: 'Social Coordinator', description: 'Event planning and social calendar' },
      { id: 'relationship_manager', emoji: '💝', label: 'Relationship Manager', description: 'Personal connections tracking' }
    ]
  },
  {
    id: 'creative',
    name: 'Creative & Content',
    description: 'Express yourself and create',
    icon: '🎨',
    bgGradient: 'from-purple-400 to-pink-500',
    roles: [
      { id: 'creative_advisor', emoji: '🎭', label: 'Creative Advisor', description: 'Artistic projects and inspiration' },
      { id: 'content_creator', emoji: '📝', label: 'Content Creator', description: 'Writing and media production' },
      { id: 'brand_manager', emoji: '✨', label: 'Brand Manager', description: 'Personal brand development' }
    ]
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    description: 'Optimize your physical and mental health',
    icon: '💪',
    bgGradient: 'from-green-400 to-emerald-500',
    roles: [
      { id: 'health_coach', emoji: '🏃', label: 'Health Coach', description: 'Fitness and nutrition guidance' },
      { id: 'wellness_tracker', emoji: '🧘', label: 'Wellness Tracker', description: 'Mental health and meditation' },
      { id: 'medical_manager', emoji: '🏥', label: 'Medical Manager', description: 'Healthcare appointments and records' }
    ]
  },
  {
    id: 'learning',
    name: 'Learning & Growth',
    description: 'Continuous education and development',
    icon: '📚',
    bgGradient: 'from-yellow-400 to-orange-500',
    roles: [
      { id: 'learning_guide', emoji: '🎓', label: 'Learning Guide', description: 'Education and skill development' },
      { id: 'career_coach', emoji: '🚀', label: 'Career Coach', description: 'Professional growth planning' },
      { id: 'mentor_connector', emoji: '🤔', label: 'Mentor Connector', description: 'Find and manage mentorships' }
    ]
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle & Travel',
    description: 'Enhance your daily life and adventures',
    icon: '🌟',
    bgGradient: 'from-red-400 to-rose-500',
    roles: [
      { id: 'lifestyle_optimizer', emoji: '🏡', label: 'Lifestyle Optimizer', description: 'Home and daily routines' },
      { id: 'travel_planner', emoji: '✈️', label: 'Travel Planner', description: 'Trips and adventure planning' },
      { id: 'culture_explorer', emoji: '🌍', label: 'Culture Explorer', description: 'Local experiences and culture' }
    ]
  },
  {
    id: 'productivity',
    name: 'Productivity & Tech',
    description: 'Maximize efficiency and leverage technology',
    icon: '⚡',
    bgGradient: 'from-gray-600 to-gray-800',
    roles: [
      { id: 'productivity_master', emoji: '⏱️', label: 'Productivity Master', description: 'Time management and focus' },
      { id: 'tech_advisor', emoji: '💻', label: 'Tech Advisor', description: 'Digital tools and automation' },
      { id: 'data_analyst', emoji: '📊', label: 'Data Analyst', description: 'Personal metrics and insights' }
    ]
  }
];

interface LifeCeoGroupedRoleSelectorProps {
  selectedAgents: string[];
  onAgentChange: (agents: string[]) => void;
}

export const LifeCeoGroupedRoleSelector: React.FC<LifeCeoGroupedRoleSelectorProps> = ({
  selectedAgents,
  onAgentChange
}) => {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  
  // Debug logging
  console.log('🤖 LifeCeoGroupedRoleSelector rendering with:', {
    selectedAgents,
    categoriesCount: agentCategories.length,
    currentCategory: agentCategories[currentCategoryIndex]?.name
  });

  const currentCategory = agentCategories[currentCategoryIndex];

  const handleAgentToggle = (agentId: string) => {
    const newAgents = selectedAgents.includes(agentId)
      ? selectedAgents.filter(id => id !== agentId)
      : [...selectedAgents, agentId];
    onAgentChange(newAgents);
  };

  const flipCard = (agentId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  const nextCategory = () => {
    setCurrentCategoryIndex((prev) => (prev + 1) % agentCategories.length);
    setFlippedCards(new Set());
  };

  const prevCategory = () => {
    setCurrentCategoryIndex((prev) => (prev - 1 + agentCategories.length) % agentCategories.length);
    setFlippedCards(new Set());
  };

  const selectedAgentCount = selectedAgents.length;

  return (
    <div className="space-y-6">
      {/* Header with selected count */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
          Select Your Life CEO Agents
        </h3>
        <Badge variant="secondary" className="bg-turquoise-100 text-turquoise-700">
          {selectedAgentCount} selected
        </Badge>
      </div>

      {/* Category carousel */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevCategory}
            className="shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
              <span className="text-2xl">{currentCategory.icon}</span>
              <div>
                <h4 className={cn(
                  "font-semibold text-lg bg-gradient-to-r bg-clip-text text-transparent",
                  currentCategory.bgGradient
                )}>
                  {currentCategory.name}
                </h4>
                <p className="text-sm text-gray-600">{currentCategory.description}</p>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={nextCategory}
            className="shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-1 mt-3">
          {agentCategories.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all",
                index === currentCategoryIndex 
                  ? "w-6 bg-turquoise-500" 
                  : "bg-gray-300"
              )}
            />
          ))}
        </div>
      </div>

      {/* Agent cards */}
      <div className="relative h-[420px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentCategory.roles.map((agent) => {
            const isSelected = selectedAgents.includes(agent.id);
            const isFlipped = flippedCards.has(agent.id);
            
            return (
              <div key={agent.id} className="agent-card-container">
                <div className={cn(
                  "agent-card",
                  isFlipped && "flipped"
                )}>
                  {/* Front of card */}
                  <Card 
                    className={cn(
                      "agent-card-face agent-card-front h-32 cursor-pointer transition-all hover:shadow-lg",
                      "glassmorphic-card",
                      isSelected && "ring-2 ring-turquoise-500"
                    )}
                    onClick={() => flipCard(agent.id)}
                  >
                    <CardContent className="flex flex-col items-center justify-center h-full text-center p-4">
                      <span className="text-3xl mb-2">{agent.emoji}</span>
                      <h5 className="font-semibold text-sm">{agent.label}</h5>
                      <p className="text-xs text-gray-500 mt-1">Click to learn more</p>
                    </CardContent>
                  </Card>
                  
                  {/* Back of card */}
                  <Card 
                    className={cn(
                      "agent-card-face agent-card-back h-32",
                      "glassmorphic-card",
                      isSelected && "ring-2 ring-turquoise-500"
                    )}
                  >
                    <CardContent className="flex flex-col justify-between h-full p-4">
                      <div onClick={() => flipCard(agent.id)} className="cursor-pointer">
                        <h5 className="font-semibold text-sm flex items-center gap-2">
                          {agent.emoji} {agent.label}
                        </h5>
                        <p className="text-xs text-gray-600 mt-2">{agent.description}</p>
                      </div>
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "w-full mt-3",
                          isSelected && "bg-gradient-to-r from-turquoise-400 to-cyan-500"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAgentToggle(agent.id);
                        }}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Agents Summary */}
      {selectedAgents.length > 0 && (
        <div className="mt-6 p-4 bg-turquoise-50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2 text-turquoise-700">Your Life CEO Team:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedAgents.map(agentId => {
              const agent = agentCategories
                .flatMap(cat => cat.roles)
                .find(r => r.id === agentId);
              return agent ? (
                <Badge
                  key={agentId}
                  variant="secondary"
                  className="bg-white hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleAgentToggle(agentId)}
                >
                  {agent.emoji} {agent.label}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LifeCeoGroupedRoleSelector;
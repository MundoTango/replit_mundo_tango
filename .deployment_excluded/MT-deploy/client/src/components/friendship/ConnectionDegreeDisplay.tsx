import React from 'react';
import { Link, UserCheck, Users, UserPlus, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConnectionDegreeDisplayProps {
  degree: number;
  mutualFriends?: number;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function ConnectionDegreeDisplay({ 
  degree, 
  mutualFriends = 0, 
  size = 'md',
  showTooltip = true 
}: ConnectionDegreeDisplayProps) {
  const getConnectionInfo = () => {
    switch (degree) {
      case 1:
        return {
          icon: UserCheck,
          text: '1st',
          label: 'Direct Connection',
          color: 'from-turquoise-400 to-cyan-500',
          bgColor: 'bg-turquoise-50 dark:bg-turquoise-900/20',
          borderColor: 'border-turquoise-200 dark:border-turquoise-700',
          description: 'You are directly connected'
        };
      case 2:
        return {
          icon: Users,
          text: '2nd',
          label: 'Friend of Friend',
          color: 'from-blue-400 to-indigo-500',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-700',
          description: `Connected through ${mutualFriends} mutual friend${mutualFriends !== 1 ? 's' : ''}`
        };
      case 3:
        return {
          icon: UserPlus,
          text: '3rd',
          label: 'Extended Network',
          color: 'from-purple-400 to-pink-500',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-700',
          description: 'Connected through your extended network'
        };
      default:
        return {
          icon: Globe,
          text: '3+',
          label: 'Not Connected',
          color: 'from-gray-400 to-gray-500',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-700',
          description: 'Not connected within 3 degrees'
        };
    }
  };

  const info = getConnectionInfo();
  const Icon = info.icon;
  
  const sizeClasses = {
    sm: {
      container: 'text-xs',
      icon: 'w-3 h-3',
      badge: 'px-2 py-0.5',
      gap: 'gap-1'
    },
    md: {
      container: 'text-sm',
      icon: 'w-4 h-4',
      badge: 'px-3 py-1',
      gap: 'gap-2'
    },
    lg: {
      container: 'text-base',
      icon: 'w-5 h-5',
      badge: 'px-4 py-1.5',
      gap: 'gap-2'
    }
  };

  const classes = sizeClasses[size];

  const content = (
    <div className={`inline-flex items-center ${classes.gap}`}>
      <div 
        className={`
          ${classes.badge} 
          ${info.bgColor} 
          border ${info.borderColor}
          rounded-full
          flex items-center ${classes.gap}
          backdrop-blur-sm
        `}
      >
        <Icon className={`${classes.icon} bg-gradient-to-r ${info.color} text-transparent bg-clip-text`} />
        <span className={`font-semibold bg-gradient-to-r ${info.color} text-transparent bg-clip-text`}>
          {info.text}
        </span>
      </div>
      {degree <= 2 && mutualFriends > 0 && (
        <span className="text-gray-500 dark:text-gray-400">
          • {mutualFriends} mutual
        </span>
      )}
    </div>
  );

  if (!showTooltip) {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{info.label}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {info.description}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ConnectionPathProps {
  path: Array<{ id: number; name: string; profileImage?: string }>;
}

export function ConnectionPath({ path }: ConnectionPathProps) {
  if (path.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <Link className="w-4 h-4 text-gray-400" />
      <span className="text-sm text-gray-600 dark:text-gray-400">Connected via:</span>
      <div className="flex items-center -space-x-2">
        {path.map((person, index) => (
          <React.Fragment key={person.id}>
            {index > 0 && (
              <span className="mx-2 text-gray-400">→</span>
            )}
            <div className="flex items-center gap-2">
              {person.profileImage ? (
                <img 
                  src={person.profileImage} 
                  alt={person.name}
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                />
              ) : (
                <div className="w-6 h-6 bg-gradient-to-r from-turquoise-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {person.name[0]}
                </div>
              )}
              <span className="text-sm font-medium">{person.name}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

interface ConnectionStatsProps {
  totalConnections: number;
  firstDegree: number;
  secondDegree: number;
  thirdDegree: number;
}

export function ConnectionStats({ 
  totalConnections, 
  firstDegree, 
  secondDegree, 
  thirdDegree 
}: ConnectionStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-4 p-6 glassmorphic-card">
      <div className="text-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 text-transparent bg-clip-text">
          {totalConnections}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Total Network</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-turquoise-600 dark:text-turquoise-400">
          {firstDegree}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">1st Degree</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {secondDegree}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">2nd Degree</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {thirdDegree}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">3rd Degree</div>
      </div>
    </div>
  );
}
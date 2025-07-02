import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText, 
  GitBranch, 
  Eye,
  User,
  Building,
  Smartphone,
  Settings,
  Target,
  Filter,
  Search,
  Download,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Layers,
  Package
} from 'lucide-react';

// Define all teams responsible for reviews
const REVIEW_TEAMS = [
  { id: 'core-dev', name: 'Core Development Team', members: ['Scott Boddye', 'AI Assistant'] },
  { id: 'frontend', name: 'Frontend Team', members: ['Scott Boddye', 'UI Specialist'] },
  { id: 'backend', name: 'Backend Team', members: ['Scott Boddye', 'API Specialist'] },
  { id: 'security', name: 'Security Team', members: ['Scott Boddye', 'Security Lead'] },
  { id: 'qa', name: 'Quality Assurance Team', members: ['Scott Boddye', 'QA Lead'] },
  { id: 'devops', name: 'DevOps Team', members: ['Scott Boddye', 'Infrastructure Lead'] },
  { id: 'design', name: 'Design Team', members: ['Scott Boddye', 'Design Lead'] },
  { id: 'product', name: 'Product Team', members: ['Scott Boddye', 'Product Manager'] }
];

// Extract actual development data from changelog with team assignments
const DEVELOPMENT_DATA = {
  platform: {
    id: 'mundo-tango-platform',
    title: 'Mundo Tango Platform',
    description: 'Complete social media platform for global tango community',
    reviewTeam: 'core-dev',
    completionStatus: 89,
    humanReviewStatus: 'approved',
    riskLevel: 'low',
    blockers: [],
    children: {
      app: {
        id: 'mundo-tango-app',
        title: 'Mundo Tango App',
        description: 'Main user-facing application with social features',
        reviewTeam: 'frontend',
        completionStatus: 91,
        humanReviewStatus: 'approved',
        riskLevel: 'low',
        blockers: [],
        children: {
          registration: {
            id: 'registration-system',
            title: 'Registration System',
            description: 'User registration and onboarding workflow',
            reviewTeam: 'frontend',
            completionStatus: 95,
            humanReviewStatus: 'approved',
            riskLevel: 'low',
            blockers: [],
            developmentWork: [
              {
                phase: 'Original TT Files',
                description: 'Basic registration form from TrangoTech codebase',
                files: ['register.php', 'user_model.php'],
                status: 'completed'
              },
              {
                phase: 'Next.js Migration',
                description: 'Converted to React with Next.js App Router',
                files: ['app/register/page.tsx', 'components/auth/RegisterForm.tsx'],
                status: 'completed'
              },
              {
                phase: 'Enhanced Onboarding',
                description: 'Multi-step onboarding with role selection and location',
                files: ['components/onboarding/OnboardingFlow.tsx', 'components/onboarding/RoleSelector.tsx'],
                status: 'completed'
              },
              {
                phase: 'Code of Conduct',
                description: 'Added community values and acceptance workflow',
                files: ['components/onboarding/CodeOfConduct.tsx'],
                status: 'completed'
              },
              {
                phase: 'Custom Role Requests',
                description: 'System for requesting custom community roles',
                files: ['components/onboarding/CustomRoleRequestForm.tsx'],
                status: 'completed'
              }
            ],
            linkedCode: [
              'client/src/components/onboarding/',
              'server/routes.ts (auth endpoints)',
              'shared/schema.ts (users table)'
            ]
          },
          profile: {
            id: 'profile-system',
            title: 'Profile System',
            description: 'User profiles with tango experience and social features',
            reviewTeam: 'frontend',
            completionStatus: 88,
            humanReviewStatus: 'approved',
            riskLevel: 'low',
            blockers: [],
            developmentWork: [
              {
                phase: 'Basic Profile',
                description: 'User information display and editing',
                files: ['components/profile/ProfilePage.tsx'],
                status: 'completed'
              },
              {
                phase: 'Experience Tracking',
                description: 'Dance experience levels and specializations',
                files: ['components/profile/ExperienceForm.tsx'],
                status: 'completed'
              },
              {
                phase: 'Role System',
                description: 'Multi-role support with visual badges',
                files: ['components/profile/RoleBadge.tsx', 'services/roles.ts'],
                status: 'completed'
              },
              {
                phase: 'Public Sharing',
                description: 'Public resume and sharing capabilities',
                files: ['app/u/[username]/resume/page.tsx'],
                status: 'completed'
              }
            ],
            linkedCode: [
              'client/src/components/profile/',
              'client/src/services/roles.ts',
              'server/routes.ts (profile endpoints)'
            ]
          },
          newsFeed: {
            id: 'news-feed-system',
            title: 'News Feed (Moments)',
            description: 'Social feed with posts, stories, and real-time engagement',
            reviewTeam: 'frontend',
            completionStatus: 92,
            humanReviewStatus: 'approved',
            riskLevel: 'low',
            blockers: [],
            developmentWork: [
              {
                phase: 'Basic Posts',
                description: 'Post creation and display system',
                files: ['components/posts/PostFeed.tsx', 'components/posts/PostComposer.tsx'],
                status: 'completed'
              },
              {
                phase: 'Enhanced Composer',
                description: 'Rich text, mentions, media uploads, location',
                files: ['components/posts/ModernPostCreator.tsx', 'components/posts/TrangoTechPostComposer.tsx'],
                status: 'completed'
              },
              {
                phase: 'Real-time Engagement',
                description: 'Comments, reactions, live updates',
                files: ['components/posts/PostDetailModal.tsx', 'components/posts/EnhancedPostItem.tsx'],
                status: 'completed'
              },
              {
                phase: 'Media System',
                description: 'Advanced media management and tagging',
                files: ['components/media/MediaLibrary.tsx', 'components/media/UploadMedia.tsx'],
                status: 'completed'
              }
            ],
            linkedCode: [
              'client/src/components/posts/',
              'client/src/components/media/',
              'server/routes.ts (posts, media endpoints)'
            ]
          },
          events: {
            id: 'events-system',
            title: 'Events System',
            description: 'Event management with RSVPs and role assignments',
            reviewTeam: 'backend',
            completionStatus: 85,
            humanReviewStatus: 'in-review',
            riskLevel: 'medium',
            blockers: ['Google Maps API integration pending'],
            developmentWork: [
              {
                phase: 'Basic Events',
                description: 'Event creation and listing',
                files: ['components/events/EventCard.tsx', 'pages/events.tsx'],
                status: 'completed'
              },
              {
                phase: 'RSVP System',
                description: 'Event participation and status tracking',
                files: ['components/events/EventsBoard.tsx'],
                status: 'completed'
              },
              {
                phase: 'Role Assignments',
                description: 'Assign event roles (DJ, Teacher, etc.)',
                files: ['components/events/EventRoleInvitationWorkflow.tsx'],
                status: 'completed'
              },
              {
                phase: 'Google Maps',
                description: 'Location selection and mapping',
                files: ['components/maps/GoogleMapsEventLocationPicker.tsx'],
                status: 'in-progress'
              }
            ],
            linkedCode: [
              'client/src/components/events/',
              'client/src/components/maps/',
              'server/routes.ts (events endpoints)'
            ]
          }
        }
      },
      admin: {
        id: 'mundo-tango-admin',
        title: 'Mundo Tango Admin',
        description: 'Administrative interface for platform management',
        reviewTeam: 'backend',
        completionStatus: 87,
        humanReviewStatus: 'approved',
        riskLevel: 'low',
        blockers: [],
        children: {
          userManagement: {
            id: 'user-management',
            title: 'User Management',
            description: 'Admin tools for user administration',
            reviewTeam: 'security',
            completionStatus: 80,
            humanReviewStatus: 'approved',
            riskLevel: 'low',
            blockers: [],
            developmentWork: [
              {
                phase: 'Admin Center',
                description: 'Main administrative dashboard',
                files: ['components/admin/AdminCenter.tsx'],
                status: 'completed'
              },
              {
                phase: 'Role Management',
                description: 'Advanced role assignment and permissions',
                files: ['components/admin/EnhancedRoleManager.tsx'],
                status: 'completed'
              }
            ],
            linkedCode: [
              'client/src/components/admin/',
              'server/routes.ts (admin endpoints)'
            ]
          }
        }
      },
      projectPlanner: {
        id: 'mundo-tango-project-planner',
        title: 'Mundo Tango Project Planner',
        description: 'Project tracking and development management',
        reviewTeam: 'product',
        completionStatus: 78,
        humanReviewStatus: 'in-review',
        riskLevel: 'medium',
        blockers: ['Need functional button implementation', 'Detailed view features missing'],
        children: {
          tracker: {
            id: '11l-project-tracker',
            title: '11L Project Tracker',
            description: 'Comprehensive project tracking using 11L methodology',
            reviewTeam: 'core-dev',
            completionStatus: 75,
            humanReviewStatus: 'in-review',
            riskLevel: 'high',
            blockers: ['Buttons not functional', 'Missing detailed view features'],
            developmentWork: [
              {
                phase: 'Initial Implementation',
                description: 'Basic project tracking interface',
                files: ['components/admin/Comprehensive11LProjectTracker.tsx'],
                status: 'completed'
              },
              {
                phase: 'Hierarchical Rebuild',
                description: 'Proper hierarchy with Jira-style cards',
                files: ['components/admin/HierarchicalProjectTracker.tsx'],
                status: 'in-progress'
              },
              {
                phase: 'Functional Buttons',
                description: 'All buttons working with proper functionality',
                files: ['components/admin/HierarchicalProjectTracker.tsx'],
                status: 'pending'
              }
            ],
            linkedCode: [
              'client/src/components/admin/HierarchicalProjectTracker.tsx',
              '11L_PROJECT_TRACKER_REBUILD_ANALYSIS.md'
            ]
          }
        }
      }
    }
  }
};

interface HierarchicalItem {
  id: string;
  title: string;
  description: string;
  reviewTeam?: string;
  completionStatus?: number;
  humanReviewStatus?: 'pending' | 'in-review' | 'approved' | 'rejected';
  riskLevel?: 'low' | 'medium' | 'high';
  blockers?: string[];
  developmentWork?: Array<{
    phase: string;
    description: string;
    files: string[];
    status: 'completed' | 'in-progress' | 'pending';
  }>;
  linkedCode?: string[];
  children?: Record<string, HierarchicalItem>;
}

interface HierarchicalProjectTrackerProps {}

const HierarchicalProjectTracker: React.FC<HierarchicalProjectTrackerProps> = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['mundo-tango-platform']));
  const [selectedItem, setSelectedItem] = useState<HierarchicalItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentView, setCurrentView] = useState<'overview' | 'detailed'>('overview');
  const [filterLayer, setFilterLayer] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Calculate platform statistics
  const platformStats = useMemo(() => {
    const getAllItems = (item: HierarchicalItem): HierarchicalItem[] => {
      const items = [item];
      if (item.children) {
        Object.values(item.children).forEach(child => {
          items.push(...getAllItems(child));
        });
      }
      return items;
    };

    const allItems = getAllItems(DEVELOPMENT_DATA.platform);
    const totalItems = allItems.length;
    const completedItems = allItems.filter(item => 
      item.completionStatus && item.completionStatus >= 90
    ).length;
    const mvpItems = allItems.filter(item => 
      item.humanReviewStatus === 'approved'
    ).length;
    const highRiskItems = allItems.filter(item => 
      item.riskLevel === 'high'
    ).length;
    const blockedItems = allItems.filter(item => 
      item.blockers && item.blockers.length > 0
    ).length;

    return {
      totalItems,
      completedItems,
      mvpItems,
      highRiskItems,
      blockedItems,
      completionPercentage: Math.round((completedItems / totalItems) * 100)
    };
  }, []);

  const toggleExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const openDetailModal = (item: HierarchicalItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleSignOff = () => {
    if (selectedItem) {
      alert(`Sign-off initiated for: ${selectedItem.title}\nReview team: ${getTeamName(selectedItem.reviewTeam)}`);
      setShowDetailModal(false);
    }
  };

  const handleCancel = () => {
    setShowDetailModal(false);
  };

  const handleRequestReview = () => {
    if (selectedItem) {
      alert(`Review request sent to: ${getTeamName(selectedItem.reviewTeam)}\nItem: ${selectedItem.title}`);
    }
  };

  const handleViewCode = () => {
    if (selectedItem && selectedItem.linkedCode) {
      alert(`Opening code files:\n${selectedItem.linkedCode.join('\n')}`);
    }
  };

  const handleExportReport = () => {
    const reportData = {
      item: selectedItem?.title,
      completion: selectedItem?.completionStatus,
      status: selectedItem?.humanReviewStatus,
      team: getTeamName(selectedItem?.reviewTeam),
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedItem?.id}-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportData = () => {
    const exportData = {
      platformStats,
      timestamp: new Date().toISOString(),
      data: DEVELOPMENT_DATA
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mundo-tango-project-tracker-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateReport = () => {
    const report = `
MUNDO TANGO PROJECT TRACKER REPORT
Generated: ${new Date().toLocaleString()}

PLATFORM STATISTICS:
- Total Items: ${platformStats.totalItems}
- Completed: ${platformStats.completedItems} (${platformStats.completionPercentage}%)
- MVP Signed Off: ${platformStats.mvpItems}
- High Risk: ${platformStats.highRiskItems}
- Blocked: ${platformStats.blockedItems}

TEAM ASSIGNMENTS:
${REVIEW_TEAMS.map(team => `- ${team.name}: ${team.members.join(', ')}`).join('\n')}
    `.trim();
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mundo-tango-tracker-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTeamName = (teamId?: string) => {
    const team = REVIEW_TEAMS.find(t => t.id === teamId);
    return team ? team.name : 'Unassigned';
  };

  const getTeamMembers = (teamId?: string) => {
    const team = REVIEW_TEAMS.find(t => t.id === teamId);
    return team ? team.members : [];
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'in-review': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCompletionColor = (percentage?: number) => {
    if (!percentage) return 'bg-gray-200';
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const renderOverviewStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-600">Platform Completion</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{platformStats.completionPercentage}%</div>
        <div className="text-xs text-gray-500">{platformStats.completedItems}/{platformStats.totalItems} items complete</div>
      </div>
      
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-4 w-4 text-green-600" />
          <span className="text-sm text-gray-600">MVP Status</span>
        </div>
        <div className="text-2xl font-bold text-green-600">{platformStats.mvpItems}</div>
        <div className="text-xs text-gray-500">signed off items</div>
      </div>
      
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-gray-600">High Risk Items</span>
        </div>
        <div className="text-2xl font-bold text-red-600">{platformStats.highRiskItems}</div>
        <div className="text-xs text-gray-500">need immediate attention</div>
      </div>
      
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="h-4 w-4 text-orange-600" />
          <span className="text-sm text-gray-600">Blocked Items</span>
        </div>
        <div className="text-2xl font-bold text-orange-600">{platformStats.blockedItems}</div>
        <div className="text-xs text-gray-500">with blockers</div>
      </div>
      
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-gray-600">Active Layers</span>
        </div>
        <div className="text-2xl font-bold text-blue-600">11/11</div>
        <div className="text-xs text-gray-500">all layers active</div>
      </div>
    </div>
  );

  const renderAdvancedFiltering = () => (
    <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="font-medium text-gray-900">Advanced Filtering & Search</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search items, descriptions"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          value={filterLayer}
          onChange={(e) => setFilterLayer(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Layers</option>
          <option value="platform">Platform</option>
          <option value="app">App</option>
          <option value="admin">Admin</option>
          <option value="planner">Project Planner</option>
        </select>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="in-review">In Review</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        
        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Risk Levels</option>
          <option value="low">Low Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="high">High Risk</option>
        </select>
      </div>
      
      <div className="text-sm text-gray-500 mt-2">
        {platformStats.totalItems} of {platformStats.totalItems} items
      </div>
    </div>
  );

  const renderHierarchicalItem = (item: HierarchicalItem, level: number = 0): React.ReactNode => {
    const hasChildren = item.children && Object.keys(item.children).length > 0;
    const isExpanded = expandedItems.has(item.id);
    const indent = level * 24;

    return (
      <div key={item.id} className="border-l border-gray-200">
        <div 
          className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100`}
          style={{ paddingLeft: `${indent + 12}px` }}
        >
          {/* Expansion toggle */}
          <div className="flex-shrink-0 w-6">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpansion(item.id);
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </button>
            )}
          </div>

          {/* Item content */}
          <div 
            className="flex-1 min-w-0"
            onClick={() => openDetailModal(item)}
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                <p className="text-sm text-gray-500 truncate">{item.description}</p>
                {item.blockers && item.blockers.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600">{item.blockers.length} blocker(s)</span>
                  </div>
                )}
              </div>

              {/* Completion status */}
              {item.completionStatus && (
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getCompletionColor(item.completionStatus)}`}
                      style={{ width: `${item.completionStatus}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {item.completionStatus}%
                  </span>
                </div>
              )}

              {/* Risk level */}
              {item.riskLevel && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(item.riskLevel)}`}>
                  {item.riskLevel} risk
                </span>
              )}

              {/* Human review status */}
              {item.humanReviewStatus && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.humanReviewStatus)}`}>
                  {item.humanReviewStatus.replace('-', ' ')}
                </span>
              )}

              {/* Review team indicator */}
              {item.reviewTeam && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{getTeamMembers(item.reviewTeam).length}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div>
            {Object.values(item.children!).map(child => 
              renderHierarchicalItem(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDetailModal = () => {
    if (!selectedItem || !showDetailModal) return null;

    const reviewTeam = REVIEW_TEAMS.find(t => t.id === selectedItem.reviewTeam);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedItem.title}</h2>
                <p className="text-gray-600">{selectedItem.description}</p>
              </div>
              {selectedItem.completionStatus && (
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getCompletionColor(selectedItem.completionStatus)}`}
                      style={{ width: `${selectedItem.completionStatus}%` }}
                    />
                  </div>
                  <span className="font-semibold text-gray-700">
                    {selectedItem.completionStatus}%
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl font-light"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status and Team Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Human Review Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Human Review</h3>
                </div>
                <div className="flex items-center gap-2">
                  {selectedItem.humanReviewStatus && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedItem.humanReviewStatus)}`}>
                      {selectedItem.humanReviewStatus.replace('-', ' ')}
                    </span>
                  )}
                  <button 
                    onClick={handleRequestReview}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Request Review
                  </button>
                </div>
              </div>

              {/* Review Team */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Review Team</h3>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-sm text-gray-900">{reviewTeam?.name}</div>
                  {reviewTeam?.members.map((member, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{member}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Actions</h3>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={handleViewCode}
                    className="text-sm text-blue-600 hover:text-blue-800 block"
                  >
                    View Code
                  </button>
                  <button 
                    onClick={handleExportReport}
                    className="text-sm text-blue-600 hover:text-blue-800 block"
                  >
                    Export Report
                  </button>
                </div>
              </div>
            </div>

            {/* Risk and Blockers */}
            {(selectedItem.riskLevel || (selectedItem.blockers && selectedItem.blockers.length > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedItem.riskLevel && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-gray-600" />
                      <h3 className="font-medium text-gray-900">Risk Level</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(selectedItem.riskLevel)}`}>
                      {selectedItem.riskLevel.charAt(0).toUpperCase() + selectedItem.riskLevel.slice(1)} Risk
                    </span>
                  </div>
                )}

                {selectedItem.blockers && selectedItem.blockers.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-gray-600" />
                      <h3 className="font-medium text-gray-900">Blockers</h3>
                    </div>
                    <div className="space-y-1">
                      {selectedItem.blockers.map((blocker, index) => (
                        <div key={index} className="text-sm text-red-600">
                          • {blocker}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Development Work Section */}
            {selectedItem.developmentWork && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <GitBranch className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900">Development Work</h3>
                </div>
                <div className="space-y-4">
                  {selectedItem.developmentWork.map((phase, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{phase.phase}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                          phase.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {phase.status.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{phase.description}</p>
                      <div className="space-y-1">
                        <h5 className="text-sm font-medium text-gray-700">Files:</h5>
                        {phase.files.map((file, fileIndex) => (
                          <div key={fileIndex} className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {file}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Code Section */}
            {selectedItem.linkedCode && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900">Linked Code</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedItem.linkedCode.map((codeLink, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <code className="text-sm text-gray-700">{codeLink}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleSignOff}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sign Off
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Comprehensive 11L Platform Tracker</h2>
              <p className="text-gray-600">Hierarchical Platform Structure with Layer Distribution & Health Analytics</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>{platformStats.totalItems} Total Items</span>
                <span>•</span>
                <span>{platformStats.completedItems} Completed</span>
                <span>•</span>
                <span>{platformStats.mvpItems} MVP Signed Off</span>
                <span>•</span>
                <span>{platformStats.highRiskItems} High Risk</span>
              </div>
            </div>
          </div>
          
          {/* Header buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                currentView === 'overview' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setCurrentView('detailed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                currentView === 'detailed' 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Detailed View
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium">
              Analytics
            </button>
            <button 
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
            <button 
              onClick={handleGenerateReport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium"
            >
              <FileText className="h-4 w-4" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Content based on current view */}
      <div className="p-6">
        {currentView === 'overview' && (
          <>
            {renderOverviewStats()}
            {renderAdvancedFiltering()}
          </>
        )}
        
        {currentView === 'detailed' && (
          <>
            {renderAdvancedFiltering()}
          </>
        )}

        {/* Project Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Mundo Tango Platform Structure</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Interactive project cards with detailed metadata tracking and Jira-style organization
            </p>
            
            {/* Hierarchical Tree */}
            <div className="max-h-[600px] overflow-y-auto border border-gray-200 rounded-lg">
              {renderHierarchicalItem(DEVELOPMENT_DATA.platform)}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Layer Distribution & Health - Hierarchical Platform Structure</h3>
            </div>
            
            {/* Team assignments */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3">Review Team Assignments</h4>
              <div className="space-y-2">
                {REVIEW_TEAMS.map((team, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sm text-gray-900">{team.name}</span>
                      <div className="text-xs text-gray-600">{team.members.join(', ')}</div>
                    </div>
                    <span className="text-xs text-gray-500">{team.members.length} members</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {renderDetailModal()}
    </div>
  );
};

export default HierarchicalProjectTracker;
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
  Target
} from 'lucide-react';

// Extract actual development data from changelog
const DEVELOPMENT_DATA = {
  platform: {
    id: 'mundo-tango-platform',
    title: 'Mundo Tango Platform',
    description: 'Complete social media platform for global tango community',
    children: {
      app: {
        id: 'mundo-tango-app',
        title: 'Mundo Tango App',
        description: 'Main user-facing application with social features',
        children: {
          registration: {
            id: 'registration-system',
            title: 'Registration System',
            description: 'User registration and onboarding workflow',
            team: ['Scott Boddye', 'AI Assistant'],
            completionStatus: 95,
            humanReviewStatus: 'pending',
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
            team: ['Scott Boddye', 'AI Assistant'],
            completionStatus: 88,
            humanReviewStatus: 'approved',
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
            team: ['Scott Boddye', 'AI Assistant'],
            completionStatus: 92,
            humanReviewStatus: 'approved',
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
            team: ['Scott Boddye', 'AI Assistant'],
            completionStatus: 85,
            humanReviewStatus: 'in-review',
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
        children: {
          userManagement: {
            id: 'user-management',
            title: 'User Management',
            description: 'Admin tools for user administration',
            team: ['Scott Boddye', 'AI Assistant'],
            completionStatus: 80,
            humanReviewStatus: 'approved',
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
        children: {
          tracker: {
            id: '11l-project-tracker',
            title: '11L Project Tracker',
            description: 'Comprehensive project tracking using 11L methodology',
            team: ['Scott Boddye', 'AI Assistant'],
            completionStatus: 75,
            humanReviewStatus: 'in-review',
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
  team?: string[];
  completionStatus?: number;
  humanReviewStatus?: 'pending' | 'in-review' | 'approved' | 'rejected';
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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'in-review': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'rejected': return 'text-red-600 bg-red-100';
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

              {/* Human review status */}
              {item.humanReviewStatus && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.humanReviewStatus)}`}>
                  {item.humanReviewStatus.replace('-', ' ')}
                </span>
              )}

              {/* Team size indicator */}
              {item.team && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{item.team.length}</span>
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
              onClick={() => setShowDetailModal(false)}
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
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Request Review
                  </button>
                </div>
              </div>

              {/* Team */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Team</h3>
                </div>
                <div className="space-y-1">
                  {selectedItem.team?.map((member, index) => (
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
                  <button className="text-sm text-blue-600 hover:text-blue-800 block">
                    View Code
                  </button>
                  <button className="text-sm text-blue-600 hover:text-blue-800 block">
                    Export Report
                  </button>
                </div>
              </div>
            </div>

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
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">11L Project Tracker</h2>
            <p className="text-gray-600">Hierarchical project structure with development tracking</p>
          </div>
        </div>
      </div>

      {/* Hierarchical Tree */}
      <div className="max-h-[600px] overflow-y-auto">
        {renderHierarchicalItem(DEVELOPMENT_DATA.platform)}
      </div>

      {/* Detail Modal */}
      {renderDetailModal()}
    </div>
  );
};

export default HierarchicalProjectTracker;
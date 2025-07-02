import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Globe, 
  Users, 
  Shield, 
  Code, 
  Database, 
  Zap, 
  BarChart3,
  Brain,
  Target,
  Calendar,
  Clock,
  User,
  FileText,
  GitBranch,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProjectItem {
  id: string;
  title: string;
  description?: string;
  type: 'Platform' | 'Section' | 'Feature' | 'Project' | 'Task';
  status: 'Complete' | 'In Progress' | 'Planning' | 'Blocked';
  completion: number;
  team?: string[];
  originalFiles?: string[];
  changesFrom?: string;
  currentState?: string;
  estimatedHours?: number;
  actualHours?: number;
  priority: 'High' | 'Medium' | 'Low';
  layer?: string;
  children?: ProjectItem[];
}

interface DetailedCardProps {
  item: ProjectItem;
  onClose: () => void;
}

const DetailedCard: React.FC<DetailedCardProps> = ({ item, onClose }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-100 text-green-800 border-green-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Planning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Blocked': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-600 text-white';
      case 'Medium': return 'bg-yellow-600 text-white';
      case 'Low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <Card className="fixed inset-4 z-50 overflow-auto bg-white shadow-2xl border-2">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
              <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
              <Badge variant="outline">{item.type}</Badge>
              {item.layer && <Badge variant="secondary">{item.layer}</Badge>}
            </div>
          </div>
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Description */}
        {item.description && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{item.description}</p>
          </div>
        )}

        {/* Progress Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Progress
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion:</span>
              <span className="text-lg font-bold text-blue-600">{item.completion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${item.completion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Team Section */}
        {item.team && item.team.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Team ({item.team.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {item.team.map((member, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {member}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Original TT Files */}
        {item.originalFiles && item.originalFiles.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Original TrangoTech Files ({item.originalFiles.length})
            </h3>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="space-y-2">
                {item.originalFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <GitBranch className="h-4 w-4 text-purple-600" />
                    <code className="bg-purple-100 px-2 py-1 rounded text-purple-800">{file}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Changes From TT to Current State */}
        {item.changesFrom && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-orange-600" />
              Evolution from TrangoTech
            </h3>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-orange-800">{item.changesFrom}</p>
            </div>
          </div>
        )}

        {/* Current State */}
        {item.currentState && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Current State
            </h3>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-green-800">{item.currentState}</p>
            </div>
          </div>
        )}

        {/* Completion Tracking - What's Done vs What Remains */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Completion Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Completed Tasks */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                ✓ Completed ({Math.round(item.completion)}%)
              </h4>
              <div className="space-y-2 text-sm text-green-700">
                {getCompletedTasks(item).map((task, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Remaining Tasks */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                → Remaining ({100 - Math.round(item.completion)}%)
              </h4>
              <div className="space-y-2 text-sm text-orange-700">
                {getRemainingTasks(item).map((task, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Handoff Instructions */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-purple-600" />
            AI/Human Handoff Instructions
          </h3>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-purple-800 mb-2">Context for Continuation:</h4>
                <p className="text-sm text-purple-700">{getHandoffContext(item)}</p>
              </div>
              <div>
                <h4 className="font-medium text-purple-800 mb-2">Next Steps:</h4>
                <div className="space-y-1 text-sm text-purple-700">
                  {getNextSteps(item).map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="font-medium">{index + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-purple-800 mb-2">Key Files to Review:</h4>
                <div className="space-y-1">
                  {getKeyFiles(item).map((file, index) => (
                    <code key={index} className="block text-xs bg-purple-100 px-2 py-1 rounded text-purple-800">
                      {file}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Time Tracking */}
        {(item.estimatedHours || item.actualHours) && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Time Tracking
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {item.estimatedHours && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm text-blue-600 font-medium">Estimated</div>
                  <div className="text-xl font-bold text-blue-800">{item.estimatedHours}h</div>
                </div>
              )}
              {item.actualHours && (
                <div className="bg-indigo-50 rounded-lg p-3">
                  <div className="text-sm text-indigo-600 font-medium">Actual</div>
                  <div className="text-xl font-bold text-indigo-800">{item.actualHours}h</div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Comprehensive project data structure
const projectData: ProjectItem[] = [
  {
    id: 'mundo-tango-platform',
    title: 'Mundo Tango Platform',
    description: 'Complete social media platform for the global tango community',
    type: 'Platform',
    status: 'In Progress',
    completion: 85,
    priority: 'High',
    team: ['Scott Boddye', 'Full Stack Team'],
    children: [
      {
        id: 'core-features',
        title: 'Core Social Features',
        description: 'Essential social media functionality',
        type: 'Section',
        status: 'Complete',
        completion: 95,
        priority: 'High',
        children: [
          {
            id: 'authentication',
            title: 'Authentication & User Management',
            description: 'Complete user authentication system with role-based access',
            type: 'Feature',
            status: 'Complete',
            completion: 100,
            priority: 'High',
            layer: 'Layer 1: Authentication',
            team: ['Scott Boddye', 'Backend Team'],
            originalFiles: [
              'TT-Backend/controllers/AuthController.php',
              'TT-Backend/models/User.php',
              'TT-Backend/middleware/AuthMiddleware.php'
            ],
            changesFrom: 'Migrated from PHP Laravel JWT authentication to Node.js Express with Replit OAuth integration. Enhanced with multi-role support and comprehensive user profiles.',
            currentState: 'Fully operational authentication system supporting Replit OAuth, JWT tokens, role-based access control with 23 role types, and comprehensive user onboarding flow.',
            estimatedHours: 40,
            actualHours: 45,
            children: [
              {
                id: 'user-registration',
                title: 'User Registration & Onboarding',
                type: 'Project',
                status: 'Complete',
                completion: 100,
                priority: 'High',
                originalFiles: ['TT-Frontend/pages/auth/register.tsx'],
                changesFrom: 'Enhanced from basic TT registration to comprehensive multi-step onboarding with location picker, role selection, and code of conduct acceptance.',
                currentState: 'Complete onboarding flow with city-based group assignment, tango role selection from 23 options, and automatic community integration.',
                estimatedHours: 15,
                actualHours: 18
              },
              {
                id: 'role-system',
                title: 'Multi-Role Authentication System',
                type: 'Project',
                status: 'Complete',
                completion: 100,
                priority: 'High',
                originalFiles: ['TT-Backend/database/migrations/create_roles_table.php'],
                changesFrom: 'Expanded from basic user/admin roles to comprehensive 23-role system with community roles (dancer, teacher, DJ, organizer) and platform roles (admin, moderator).',
                currentState: 'Advanced role system supporting multiple roles per user, role switching, permission hierarchies, and role-based routing throughout the platform.',
                estimatedHours: 25,
                actualHours: 27
              }
            ]
          },
          {
            id: 'posts-feed',
            title: 'Posts & Feed System',
            description: 'Enhanced post creation with rich media and real-time features',
            type: 'Feature',
            status: 'Complete',
            completion: 90,
            priority: 'High',
            layer: 'Layer 2: Content Management',
            team: ['Scott Boddye', 'Frontend Team'],
            originalFiles: [
              'TT-Backend/controllers/PostController.php',
              'TT-Frontend/components/PostCreator.tsx',
              'TT-Frontend/pages/feed.tsx'
            ],
            changesFrom: 'Evolved from basic TT post creation to advanced ModernPostCreator with rich text editing, media uploads, mentions system, location integration, and real-time engagement.',
            currentState: 'Comprehensive post system with TrangoTechPostComposer, media library reuse, tag-based filtering, Google Maps integration, and real-time comment/reaction system.',
            estimatedHours: 60,
            actualHours: 75,
            children: [
              {
                id: 'post-creation',
                title: 'Enhanced Post Creation',
                type: 'Project',
                status: 'Complete',
                completion: 95,
                priority: 'High',
                originalFiles: ['TT-Frontend/components/PostCreator.tsx'],
                changesFrom: 'Upgraded from basic text posts to rich multimedia posts with media uploads, location tagging, user mentions, and visibility controls.',
                currentState: 'ModernPostCreator and TrangoTechPostComposer with media library, Google Maps integration, emoji picker, mention system, and tag-based organization.',
                estimatedHours: 35,
                actualHours: 40
              },
              {
                id: 'real-time-engagement',
                title: 'Real-time Engagement System',
                type: 'Project',
                status: 'Complete',
                completion: 85,
                priority: 'Medium',
                originalFiles: ['TT-Backend/routes/api.php (reactions)'],
                changesFrom: 'Enhanced from basic like system to comprehensive real-time engagement with emoji reactions, threaded comments, mentions, and live synchronization.',
                currentState: 'Supabase Realtime integration with live comments, emoji reactions (❤️ 🔥 😍 🎉), user mentions, and automatic polling fallback system.',
                estimatedHours: 25,
                actualHours: 35
              }
            ]
          },
          {
            id: 'events-system',
            title: 'Events & RSVP Management',
            description: 'Complete event lifecycle with role assignments and community building',
            type: 'Feature',
            status: 'Complete',
            completion: 100,
            priority: 'High',
            layer: 'Layer 3: Community Features',
            team: ['Scott Boddye', 'Community Team'],
            originalFiles: [
              'TT-Backend/controllers/EventController.php',
              'TT-Frontend/pages/events.tsx',
              'TT-Backend/models/Event.php'
            ],
            changesFrom: 'Transformed from basic TT event listing to comprehensive event management with RSVP system, role assignments, participant tracking, and automatic city group integration.',
            currentState: 'Full event ecosystem with creation, RSVP management, role assignments (DJ, Teacher, Performer), participant tracking, and community building features.',
            estimatedHours: 50,
            actualHours: 55,
            children: [
              {
                id: 'event-creation',
                title: 'Event Creation & Management',
                type: 'Project',
                status: 'Complete',
                completion: 100,
                priority: 'High',
                originalFiles: ['TT-Frontend/pages/create-event.tsx'],
                changesFrom: 'Enhanced from basic TT event forms to comprehensive creation system with role assignments, media uploads, location integration, and RSVP management.',
                currentState: 'Complete event creation with Google Maps integration, role assignment system, media uploads, and automatic city group linking.',
                estimatedHours: 30,
                actualHours: 35
              },
              {
                id: 'rsvp-system',
                title: 'RSVP & Participant Management',
                type: 'Project',
                status: 'Complete',
                completion: 100,
                priority: 'High',
                originalFiles: ['TT-Backend/models/EventParticipant.php'],
                changesFrom: 'Expanded from simple attendance tracking to comprehensive RSVP system with role assignments, invitation management, and participant analytics.',
                currentState: 'Advanced RSVP system with Going/Interested/Maybe status, role assignments, invitation workflow, and participant statistics.',
                estimatedHours: 20,
                actualHours: 20
              }
            ]
          }
        ]
      },
      {
        id: 'advanced-features',
        title: 'Advanced Platform Features',
        description: 'Sophisticated features for enhanced user experience',
        type: 'Section',
        status: 'In Progress',
        completion: 75,
        priority: 'Medium',
        children: [
          {
            id: 'media-management',
            title: 'Media Management System',
            description: 'Comprehensive media handling with reuse and tagging',
            type: 'Feature',
            status: 'Complete',
            completion: 90,
            priority: 'Medium',
            layer: 'Layer 4: Media Services',
            team: ['Scott Boddye', 'Media Team'],
            originalFiles: [
              'TT-Backend/controllers/MediaController.php',
              'TT-Backend/storage/uploads/'
            ],
            changesFrom: 'Migrated from basic TT file uploads to Supabase Storage with comprehensive metadata management, tagging system, and media reuse capabilities.',
            currentState: 'Supabase Storage integration with media_assets table, tagging system, visibility controls, media library with reuse workflow, and CDN distribution.',
            estimatedHours: 40,
            actualHours: 50,
            children: [
              {
                id: 'media-upload',
                title: 'Media Upload & Storage',
                type: 'Project',
                status: 'Complete',
                completion: 100,
                priority: 'Medium',
                originalFiles: ['TT-Backend/app/Http/Controllers/MediaController.php'],
                changesFrom: 'Upgraded from local file storage to Supabase Storage with automatic resizing, format conversion, and CDN delivery.',
                currentState: 'Complete Supabase Storage integration with automatic image processing, 5MB size limits, CDN URLs, and comprehensive metadata tracking.',
                estimatedHours: 20,
                actualHours: 25
              },
              {
                id: 'media-tagging',
                title: 'Media Tagging & Reuse System',
                type: 'Project',
                status: 'Complete',
                completion: 85,
                priority: 'Low',
                originalFiles: ['TT-Frontend/components/MediaLibrary.tsx'],
                changesFrom: 'Built new comprehensive tagging system enabling media reuse across posts with contextual metadata preservation.',
                currentState: 'Advanced media library with tagging interface, reuse workflow, metadata management, and tag-based filtering for content discovery.',
                estimatedHours: 20,
                actualHours: 25,
                children: [
                  {
                    id: 'tagging-interface',
                    title: 'Media Tagging Interface',
                    type: 'Task',
                    status: 'Complete',
                    completion: 100,
                    priority: 'Medium',
                    originalFiles: ['client/src/components/MediaLibrary.tsx'],
                    changesFrom: 'Created tag input UI with autocomplete and chip display',
                    currentState: 'Interactive tagging interface with real-time suggestions and validation',
                    estimatedHours: 8,
                    actualHours: 10,
                    children: [
                      {
                        id: 'tag-input-component',
                        title: 'Tag Input Component Development',
                        type: 'Task',
                        status: 'Complete',
                        completion: 100,
                        priority: 'Low',
                        originalFiles: ['client/src/components/ui/tag-input.tsx'],
                        changesFrom: 'Built custom tag input with keyboard navigation',
                        currentState: 'Fully functional tag input with autocomplete dropdown',
                        estimatedHours: 4,
                        actualHours: 5
                      },
                      {
                        id: 'tag-validation-logic',
                        title: 'Tag Validation & Filtering Logic',
                        type: 'Task',
                        status: 'Complete',
                        completion: 100,
                        priority: 'Low',
                        originalFiles: ['client/src/utils/tagValidation.ts'],
                        changesFrom: 'Implemented tag validation rules and duplicate prevention',
                        currentState: 'Robust validation with character limits and duplicate detection',
                        estimatedHours: 4,
                        actualHours: 5
                      }
                    ]
                  },
                  {
                    id: 'metadata-preservation',
                    title: 'Metadata Preservation System',
                    type: 'Task',
                    status: 'Complete',
                    completion: 90,
                    priority: 'High',
                    originalFiles: ['server/storage/mediaMetadata.ts'],
                    changesFrom: 'Created system to preserve context-specific metadata during media reuse',
                    currentState: 'Advanced metadata management with contextual preservation',
                    estimatedHours: 12,
                    actualHours: 15,
                    children: [
                      {
                        id: 'metadata-schema',
                        title: 'Metadata Schema Design',
                        type: 'Task',
                        status: 'Complete',
                        completion: 100,
                        priority: 'High',
                        originalFiles: ['shared/schema/media.ts'],
                        changesFrom: 'Designed flexible metadata schema for diverse media types',
                        currentState: 'Comprehensive schema supporting all media metadata needs',
                        estimatedHours: 6,
                        actualHours: 8
                      },
                      {
                        id: 'context-preservation',
                        title: 'Context-Specific Preservation Logic',
                        type: 'Task',
                        status: 'Complete',
                        completion: 80,
                        priority: 'Medium',
                        originalFiles: ['server/services/contextPreservation.ts'],
                        changesFrom: 'Built logic to maintain different captions/tags per usage context',
                        currentState: 'Context preservation allowing unique metadata per reuse instance',
                        estimatedHours: 6,
                        actualHours: 7
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 'location-services',
            title: 'Location Services & Maps',
            description: 'Google Maps integration for location-based features',
            type: 'Feature',
            status: 'Complete',
            completion: 95,
            priority: 'High',
            layer: 'Layer 5: External Services',
            team: ['Scott Boddye', 'Integration Team'],
            originalFiles: ['TT-Frontend/components/LocationPicker.tsx'],
            changesFrom: 'Enhanced from basic TT location picker to Google Maps Platform integration with autocomplete, embedded maps, and coordinate capture.',
            currentState: 'Complete Google Maps integration with Places API autocomplete, embedded map displays, accurate coordinate capture, and standardized address formatting.',
            estimatedHours: 30,
            actualHours: 35,
            children: [
              {
                id: 'google-maps-integration',
                title: 'Google Maps Platform Integration',
                type: 'Project',
                status: 'Complete',
                completion: 100,
                priority: 'High',
                originalFiles: ['TT-Frontend/utils/maps.js'],
                changesFrom: 'Replaced basic location input with Google Maps Platform APIs for accurate location selection and mapping.',
                currentState: 'Full Google Maps integration with Places API autocomplete, embedded maps in event creation and post composer, and coordinate-based location storage.',
                estimatedHours: 25,
                actualHours: 30
              },
              {
                id: 'location-based-features',
                title: 'Location-based Community Features',
                type: 'Project',
                status: 'Complete',
                completion: 90,
                priority: 'Medium',
                originalFiles: ['TT-Backend/models/Location.php'],
                changesFrom: 'Enhanced location features with automatic city group creation, location-based event discovery, and geographic community building.',
                currentState: 'Intelligent location processing with automatic city group assignment, location-based event filtering, and geographic community discovery.',
                estimatedHours: 15,
                actualHours: 20
              }
            ]
          }
        ]
      },
      {
        id: 'community-automation',
        title: 'Community Automation Systems',
        description: 'Intelligent automation for community building and management',
        type: 'Section',
        status: 'Complete',
        completion: 100,
        priority: 'High',
        children: [
          {
            id: 'city-groups',
            title: 'Automated City Group System',
            description: 'Intelligent location-based community building',
            type: 'Feature',
            status: 'Complete',
            completion: 100,
            priority: 'High',
            layer: 'Layer 11: Strategic Automation',
            team: ['Scott Boddye', 'Automation Team'],
            originalFiles: ['TT-Backend/models/Group.php'],
            changesFrom: 'Built completely new automated community building system replacing manual group creation with intelligent location-based automation.',
            currentState: 'Complete automated city group creation with Pexels API photo fetching, automatic user assignment, and scalable global community building.',
            estimatedHours: 35,
            actualHours: 40,
            children: [
              {
                id: 'auto-group-creation',
                title: 'Automatic Group Creation',
                type: 'Project',
                status: 'Complete',
                completion: 100,
                priority: 'High',
                originalFiles: ['TT-Backend/controllers/GroupController.php'],
                changesFrom: 'Completely new feature - automatic creation of city-based tango groups during user registration with intelligent naming and metadata generation.',
                currentState: 'Fully automated system creating "Tango [City], [Country]" groups with professional photos, descriptions, and automatic user assignment during onboarding.',
                estimatedHours: 20,
                actualHours: 25
              },
              {
                id: 'photo-automation',
                title: 'City Photo Automation',
                type: 'Project',
                status: 'Complete',
                completion: 100,
                priority: 'Medium',
                originalFiles: ['None - New Feature'],
                changesFrom: 'Built new Pexels API integration for authentic city photography replacing placeholder images with real city landmarks.',
                currentState: 'Automated photo fetching system using Pexels API with curated fallbacks, authentic city imagery, and scalable photo management for global cities.',
                estimatedHours: 15,
                actualHours: 15
              }
            ]
          }
        ]
      },
      {
        id: 'admin-management',
        title: 'Administration & Management',
        description: 'Comprehensive admin tools and project tracking',
        type: 'Section',
        status: 'In Progress',
        completion: 80,
        priority: 'High',
        children: [
          {
            id: 'project-tracker',
            title: '11L Project Tracker System',
            description: 'Advanced project tracking with hierarchical analysis',
            type: 'Feature',
            status: 'In Progress',
            completion: 75,
            priority: 'High',
            layer: 'Layer 11: Strategic Management',
            team: ['Scott Boddye', 'Project Management'],
            originalFiles: ['None - New Framework'],
            changesFrom: 'Completely new 11-Layer framework for systematic project analysis and management, replacing ad-hoc project tracking with comprehensive methodology.',
            currentState: 'Advanced project tracker with hierarchical breakdown, Jira-style detailed views, human review system, and automatic task tracking using 11L methodology.',
            estimatedHours: 60,
            actualHours: 65,
            children: [
              {
                id: 'hierarchical-breakdown',
                title: 'Hierarchical Project Breakdown',
                type: 'Project',
                status: 'In Progress',
                completion: 70,
                priority: 'High',
                originalFiles: ['None - New Implementation'],
                changesFrom: 'New hierarchical project structure replacing flat project lists with Platform → Section → Feature → Project → Task breakdown.',
                currentState: 'Implementing true hierarchical tree view with expand/collapse functionality, detailed cards for each level, and comprehensive project metadata.',
                estimatedHours: 30,
                actualHours: 35
              },
              {
                id: 'detailed-cards',
                title: 'Detailed Project Cards',
                type: 'Task',
                status: 'In Progress',
                completion: 60,
                priority: 'High',
                originalFiles: ['None - New Feature'],
                changesFrom: 'Creating comprehensive project cards showing team, original TT files, evolution timeline, current state, and time tracking.',
                currentState: 'Building detailed card system with team information, TrangoTech file mapping, change documentation, and progress tracking.',
                estimatedHours: 15,
                actualHours: 20,
                children: [
                  {
                    id: 'timeline-implementation',
                    title: 'Timeline View Implementation',
                    type: 'Task',
                    status: 'In Progress',
                    completion: 80,
                    priority: 'High',
                    originalFiles: ['client/src/components/admin/Comprehensive11LProjectTracker.tsx'],
                    changesFrom: 'Currently implementing comprehensive timeline view to show project development phases with visual timeline and milestone tracking.',
                    currentState: 'Building phase-based timeline with 11L methodology integration, completion status, and future planning.',
                    estimatedHours: 8,
                    actualHours: 6,
                    children: [
                      {
                        id: 'timeline-phases',
                        title: 'Development Phase Cards',
                        type: 'Task',
                        status: 'Complete',
                        completion: 100,
                        priority: 'Medium',
                        originalFiles: ['client/src/components/admin/Comprehensive11LProjectTracker.tsx:452-775'],
                        changesFrom: 'Added comprehensive phase cards showing Foundation, Core Features, Advanced Intelligence, and Enterprise phases.',
                        currentState: 'Complete timeline with 5 development phases showing detailed progress and 11L layer analysis.',
                        estimatedHours: 4,
                        actualHours: 4
                      },
                      {
                        id: 'timeline-visual-design',
                        title: 'Visual Timeline Design',
                        type: 'Task',
                        status: 'Complete',
                        completion: 100,
                        priority: 'Low',
                        originalFiles: ['client/src/components/admin/Comprehensive11LProjectTracker.tsx:465-467'],
                        changesFrom: 'Implemented gradient timeline connector and visual milestone indicators.',
                        currentState: 'Professional timeline with gradient line, colored phase dots, and hover animations.',
                        estimatedHours: 2,
                        actualHours: 1
                      },
                      {
                        id: 'current-phase-highlight',
                        title: 'Current Phase Highlighting',
                        type: 'Task',
                        status: 'Complete',
                        completion: 100,
                        priority: 'Medium',
                        originalFiles: ['client/src/components/admin/Comprehensive11LProjectTracker.tsx:694-747'],
                        changesFrom: 'Added animated highlighting for current 11L Project Tracker phase with pulsing badge.',
                        currentState: 'Dynamic highlighting showing current work with animated status badge and progress indication.',
                        estimatedHours: 2,
                        actualHours: 1
                      }
                    ]
                  },
                  {
                    id: 'teams-management',
                    title: 'Teams Management View',
                    type: 'Task',
                    status: 'In Progress',
                    completion: 90,
                    priority: 'High',
                    originalFiles: ['client/src/components/admin/Comprehensive11LProjectTracker.tsx'],
                    changesFrom: 'Currently implementing comprehensive teams view showing all team assignments with click-through capabilities.',
                    currentState: 'Building team cards with detailed assignment tracking, progress metrics, and team member information.',
                    estimatedHours: 10,
                    actualHours: 8,
                    children: [
                      {
                        id: 'team-cards',
                        title: 'Individual Team Cards',
                        type: 'Task',
                        status: 'Complete',
                        completion: 100,
                        priority: 'High',
                        originalFiles: ['client/src/components/admin/Comprehensive11LProjectTracker.tsx:334-594'],
                        changesFrom: 'Added 4 comprehensive team cards: Core Development, Architecture & Strategy, UI/UX Design, Testing & QA.',
                        currentState: 'Complete team card system with member details, current assignments, completion tracking, and click-through functionality.',
                        estimatedHours: 6,
                        actualHours: 5
                      },
                      {
                        id: 'team-performance-summary',
                        title: 'Team Performance Summary',
                        type: 'Task',
                        status: 'Complete',
                        completion: 100,
                        priority: 'Medium',
                        originalFiles: ['client/src/components/admin/Comprehensive11LProjectTracker.tsx:596-615'],
                        changesFrom: 'Added team performance dashboard with aggregate statistics and metrics.',
                        currentState: 'Performance summary showing 4 active teams, 28 completed projects, 85% overall progress, and 340h invested.',
                        estimatedHours: 2,
                        actualHours: 2
                      },
                      {
                        id: 'team-click-integration',
                        title: 'Team Card Click Integration',
                        type: 'Task',
                        status: 'Complete',
                        completion: 100,
                        priority: 'Low',
                        originalFiles: ['client/src/components/admin/Comprehensive11LProjectTracker.tsx:350-361'],
                        changesFrom: 'Integrated team cards with handleCardClick to open detailed Jira-style modals.',
                        currentState: 'Team cards integrate seamlessly with detailed item view modal system for comprehensive team analysis.',
                        estimatedHours: 2,
                        actualHours: 1
                      }
                    ]
                  },
                  {
                    id: 'deeper-nesting-enhancement',
                    title: 'Deeper Nesting Levels Implementation',
                    type: 'Task',
                    status: 'In Progress',
                    completion: 75,
                    priority: 'High',
                    originalFiles: ['client/src/components/admin/EnhancedHierarchicalTreeView.tsx'],
                    changesFrom: 'Currently implementing deeper hierarchical levels as requested for more granular project tracking.',
                    currentState: 'Enhanced media tagging system with 4-level depth: Feature → Project → Task → Sub-task breakdown.',
                    estimatedHours: 8,
                    actualHours: 6,
                    children: [
                      {
                        id: 'media-tagging-depth',
                        title: 'Media Tagging Sub-task Breakdown',
                        type: 'Task',
                        status: 'Complete',
                        completion: 100,
                        priority: 'Medium',
                        originalFiles: ['client/src/components/admin/EnhancedHierarchicalTreeView.tsx:508-589'],
                        changesFrom: 'Added 4-level hierarchy for media tagging: System → Interface/Metadata → Components → Individual tasks.',
                        currentState: 'Complete deep nesting showing granular task breakdown from feature level down to individual component development.',
                        estimatedHours: 4,
                        actualHours: 3
                      },
                      {
                        id: 'current-tracker-breakdown',
                        title: 'Current Project Tracker Breakdown',
                        type: 'Task',
                        status: 'In Progress',
                        completion: 50,
                        priority: 'High',
                        originalFiles: ['client/src/components/admin/EnhancedHierarchicalTreeView.tsx:720-746'],
                        changesFrom: 'Adding deeper nesting to current 11L Project Tracker work with Timeline and Teams sub-components.',
                        currentState: 'Building granular breakdown of current Timeline and Teams implementation with sub-task tracking.',
                        estimatedHours: 4,
                        actualHours: 3
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

interface EnhancedHierarchicalTreeViewProps {
  onItemClick?: (item: ProjectItem) => void;
}

// Helper functions for completion tracking
const getCompletedTasks = (item: ProjectItem): string[] => {
  switch (item.id) {
    case 'authentication':
      return [
        'Replit OAuth integration fully operational',
        'JWT token validation system implemented',
        'Multi-role support with 23 role types deployed',
        'User registration with onboarding flow complete',
        'Role-based access control (RBAC) operational',
        'Session management with persistent authentication',
        'Password hashing with bcrypt security',
        'Database schema with users, roles, user_roles tables'
      ];
    case 'posts-feed':
      return [
        'TrangoTechPostComposer with rich text editing',
        'Media upload system integrated with Supabase Storage',
        'Google Maps location integration',
        'User mention system (@username) operational',
        'Emoji picker and reactions system',
        'Tag-based post filtering',
        'Real-time comment synchronization',
        'Media library with reuse capabilities'
      ];
    case 'events-system':
      return [
        'Event creation with comprehensive form',
        'RSVP system (Going/Interested/Maybe)',
        'Role assignment system (DJ, Teacher, Performer)',
        'Participant tracking and statistics',
        'Event-to-city group automatic assignment',
        'Google Maps venue selection',
        'Event dashboard with filtering',
        'Event participant role invitations'
      ];
    case 'city-groups':
      return [
        'Automatic city group creation during registration',
        'Pexels API photo fetching for authentic city imagery',
        'Intelligent location parsing and group assignment',
        'User auto-join functionality',
        'Group navigation and detailed pages',
        'Membership status tracking',
        'Administrative controls for group management'
      ];
    case 'project-tracker':
      return [
        'Hierarchical project structure implemented',
        '11-Layer framework methodology established',
        'Basic project metrics and analytics',
        'EnhancedHierarchicalTreeView component created',
        'Project data structure with comprehensive metadata'
      ];
    default:
      return [
        'Core functionality implemented',
        'Database schema established',
        'Basic API endpoints operational',
        'Frontend components created'
      ];
  }
};

const getRemainingTasks = (item: ProjectItem): string[] => {
  switch (item.id) {
    case 'authentication':
      return [
        'Two-factor authentication (2FA) implementation',
        'Social login integration (Google, Facebook)',
        'Advanced permission system refinement',
        'User activity audit logging'
      ];
    case 'posts-feed':
      return [
        'Advanced content moderation tools',
        'Post scheduling functionality',
        'Advanced analytics and insights',
        'Content export capabilities'
      ];
    case 'events-system':
      return [
        'Calendar integration (Google Calendar, Outlook)',
        'Event reminders and notifications',
        'Ticket management system',
        'Advanced event analytics'
      ];
    case 'city-groups':
      return [
        'Advanced group moderation tools',
        'Group analytics and insights',
        'Custom group themes and branding',
        'Group event scheduling integration'
      ];
    case 'project-tracker':
      return [
        'Jira-style detailed item modal implementation',
        'Human review and sign-off system',
        'Automatic task tracking from code changes',
        'Time tracking and reporting',
        'Dependency mapping visualization',
        'Advanced filtering and search',
        'Export and reporting capabilities'
      ];
    default:
      return [
        'Advanced features implementation',
        'Performance optimization',
        'Testing and validation',
        'Documentation completion'
      ];
  }
};

const getHandoffContext = (item: ProjectItem): string => {
  switch (item.id) {
    case 'authentication':
      return 'Complete authentication system with Replit OAuth, multi-role support, and user management. All database tables and API endpoints are operational. Focus on enhancing security features and advanced permissions.';
    case 'posts-feed':
      return 'Advanced post creation system with rich text, media uploads, mentions, and real-time features. ModernPostCreator and TrangoTechPostComposer components are fully functional. Continue with content moderation and advanced analytics.';
    case 'events-system':
      return 'Comprehensive event management with RSVP system, role assignments, and automatic city group integration. All core functionality operational. Enhance with calendar integration and notification system.';
    case 'city-groups':
      return 'Automated city group system with photo fetching, auto-assignment, and user management. Basic group functionality complete. Focus on advanced moderation and analytics features.';
    case 'project-tracker':
      return 'Basic hierarchical project tracker with 11L methodology and EnhancedHierarchicalTreeView component. Core structure established but needs Jira-style detailed views and human review system.';
    default:
      return 'Project foundation established with core functionality. Continue with advanced features and optimization.';
  }
};

const getNextSteps = (item: ProjectItem): string[] => {
  switch (item.id) {
    case 'project-tracker':
      return [
        'Implement JiraStyleItemDetailModal component with comprehensive project details',
        'Add human review system with sign-off capabilities for completed tasks',
        'Create automatic task tracking that monitors code changes and updates project status',
        'Build dependency mapping to show project relationships and blocking issues',
        'Add time tracking functionality with estimated vs actual hours comparison',
        'Implement advanced filtering by team member, priority, status, and date ranges',
        'Create export functionality for project reports and progress summaries'
      ];
    case 'authentication':
      return [
        'Implement two-factor authentication using authenticator apps',
        'Add social login integration with OAuth providers',
        'Enhance permission system with granular resource-level controls',
        'Build comprehensive user activity audit logging'
      ];
    case 'posts-feed':
      return [
        'Implement AI-powered content moderation system',
        'Add post scheduling for future publication',
        'Build advanced analytics dashboard for content performance',
        'Create content export tools for user data portability'
      ];
    default:
      return [
        'Continue implementation of remaining features',
        'Add comprehensive testing coverage',
        'Optimize performance and user experience',
        'Complete documentation and user guides'
      ];
  }
};

const getKeyFiles = (item: ProjectItem): string[] => {
  switch (item.id) {
    case 'project-tracker':
      return [
        'client/src/components/admin/EnhancedHierarchicalTreeView.tsx',
        'client/src/components/admin/Comprehensive11LProjectTracker.tsx',
        'client/src/components/admin/JiraStyleItemDetailModal.tsx',
        '11L_PROJECT_TRACKER_IMPLEMENTATION.md',
        '11L_HIERARCHICAL_BREAKDOWN_ANALYSIS.md'
      ];
    case 'authentication':
      return [
        'server/routes.ts (authentication endpoints)',
        'shared/schema.ts (user and role tables)',
        'client/src/contexts/AuthContext.tsx',
        'server/middleware/authMiddleware.ts'
      ];
    case 'posts-feed':
      return [
        'client/src/components/ModernPostCreator.tsx',
        'client/src/components/TrangoTechPostComposer.tsx',
        'server/routes.ts (post endpoints)',
        'shared/schema.ts (posts and related tables)'
      ];
    default:
      return [
        'shared/schema.ts',
        'server/routes.ts',
        'server/storage.ts',
        'client/src/components/',
        'README.md'
      ];
  }
};

const EnhancedHierarchicalTreeView: React.FC<EnhancedHierarchicalTreeViewProps> = ({ onItemClick }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['mundo-tango-platform', 'core-features']));
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Platform': return <Globe className="h-5 w-5 text-blue-600" />;
      case 'Section': return <Users className="h-5 w-5 text-green-600" />;
      case 'Feature': return <Zap className="h-5 w-5 text-purple-600" />;
      case 'Project': return <Target className="h-5 w-5 text-orange-600" />;
      case 'Task': return <CheckCircle className="h-5 w-5 text-gray-600" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Complete': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'In Progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'Planning': return <Calendar className="h-4 w-4 text-yellow-600" />;
      case 'Blocked': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleItemClick = (item: ProjectItem) => {
    setSelectedItem(item);
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const renderTreeItem = (item: ProjectItem, level: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const indentWidth = level * 24;

    return (
      <div key={item.id} className="w-full">
        <div 
          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-l-2 border-gray-200 hover:border-blue-400 transition-all duration-200"
          style={{ paddingLeft: `${12 + indentWidth}px` }}
          onClick={() => handleItemClick(item)}
        >
          {/* Expand/Collapse Button */}
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(item.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>

          {/* Icon */}
          <div className="flex-shrink-0">
            {getIcon(item.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
              <div className="flex items-center gap-1">
                {getStatusIcon(item.status)}
                <Badge variant="outline" className="text-xs">{item.type}</Badge>
              </div>
            </div>
            {item.description && (
              <p className="text-sm text-gray-600 truncate mt-1">{item.description}</p>
            )}
          </div>

          {/* Progress */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="text-sm font-medium text-blue-600">
              {item.completion}%
            </div>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${item.completion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-0">
            {item.children!.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-2">
      {projectData.map(item => renderTreeItem(item))}
      
      {/* Detailed Card Modal */}
      {selectedItem && (
        <DetailedCard 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
};

export default EnhancedHierarchicalTreeView;
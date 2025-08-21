import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Server, 
  Monitor,
  Shield,
  Users,
  FileText,
  Globe,
  Calendar,
  Heart,
  MessageCircle,
  Camera,
  Share2,
  Settings,
  Activity,
  Search,
  MapPin,
  Music,
  Trophy,
  Star,
  Eye,
  UserCheck,
  Network,
  Mail,
  Code,
  Palette,
  Lock,
  TestTube,
  Rocket,
  BookOpen,
  Scale,
  Briefcase,
  Layers,
  Home,
  UserPlus,
  Smartphone,
  Cloud,
  Zap,
  Bell,
  BarChart3,
  Filter
} from 'lucide-react';

// COMPLETE PLATFORM FEATURES CATALOG - Methodically Built from Database Schema + Client Components
const COMPLETE_PLATFORM_FEATURES = {
  "Layer 1 - User Interface & Experience": [
    {
      name: "TrangoTech Design System",
      description: "Complete branding transformation with gradient headers (#8E142E, #0D448A), modern navigation, consistent styling across all 20+ pages",
      status: "Production Ready",
      icon: Palette,
      components: ["DashboardLayout", "TrangoTechSidebar", "ModernHeader", "RoleBadge"],
      apis: [],
      tables: []
    },
    {
      name: "Enhanced Post Creation Workflow",
      description: "Rich text editor with mentions (@username), media uploads, Google Maps location selection, emoji picker, visibility controls",
      status: "Production Ready",
      icon: Heart,
      components: ["ModernPostCreator", "TrangoTechPostComposer", "GoogleMapsLocationPicker", "UploadMedia"],
      apis: ["/api/posts", "/api/posts/create-with-mentions"],
      tables: ["posts", "post_comments", "mentions", "media_assets"]
    },
    {
      name: "Enhanced Post Engagement System",
      description: "Tango-specific emoji reactions (❤️ 🔥 😍 🎉), threaded comments with GIFs/images, real-time Supabase updates",
      status: "Production Ready",
      icon: MessageCircle,
      components: ["PostDetailModal", "CommentSystem", "ReactionPicker"],
      apis: ["/api/posts/reactions", "/api/posts/comments"],
      tables: ["reactions", "post_comments", "notifications"]
    },
    {
      name: "Role Display System (Emoji-Only)",
      description: "Visual role identification with emojis only (📚🎭🎵🏛️) with hover descriptions, NO text labels like 'Organizer: xxx'",
      status: "In Progress - Tech Debt",
      icon: UserCheck,
      components: ["RoleBadge", "EnhancedMembersSection"],
      apis: ["/api/roles/community"],
      tables: ["roles", "user_roles", "user_profiles"]
    },
    {
      name: "Modern Responsive Layout System",
      description: "Mobile-first design with sidebar navigation, dashboard layout, responsive breakpoints across all pages",
      status: "Production Ready",
      icon: Smartphone,
      components: ["DashboardLayout", "DashboardSidebar", "ResponsiveLayout"],
      apis: [],
      tables: []
    }
  ],
  
  "Layer 2 - Backend API & Logic": [
    {
      name: "Comprehensive REST API Architecture",
      description: "180+ API endpoints covering all platform functionality with consistent response format {code, message, data}",
      status: "Production Ready",
      icon: Server,
      components: [],
      apis: ["/api/posts/*", "/api/events/*", "/api/users/*", "/api/admin/*", "/api/groups/*"],
      tables: ["All 55+ tables"]
    },
    {
      name: "Enhanced Post API System",
      description: "Complete CRUD with rich content (JSONB), mentions parsing, media embedding, location integration, social features",
      status: "Production Ready",
      icon: Code,
      components: [],
      apis: ["/api/posts", "/api/posts/comments", "/api/posts/reactions", "/api/posts/filter-by-tags"],
      tables: ["posts", "post_comments", "reactions", "mentions", "hashtags"]
    },
    {
      name: "Event Management API",
      description: "Complete event lifecycle: creation, RSVP management, role assignments, participant tracking, filtering",
      status: "Production Ready",
      icon: Calendar,
      components: [],
      apis: ["/api/events", "/api/events/rsvp", "/api/events/participants"],
      tables: ["events", "event_rsvps", "event_participants", "event_invitations"]
    },
    {
      name: "User Management & Authentication API",
      description: "Replit OAuth integration, user profiles, role assignment, experience tracking, social connections",
      status: "Production Ready",
      icon: Users,
      components: [],
      apis: ["/api/user", "/api/user/profile", "/api/auth/user", "/api/user/experience"],
      tables: ["users", "user_profiles", "user_roles", "follows", "blocked_users"]
    },
    {
      name: "Groups & Community API",
      description: "Automatic city group creation, membership management, group discovery, admin controls",
      status: "Production Ready",
      icon: Network,
      components: [],
      apis: ["/api/user/city-group", "/api/user/groups", "/api/groups"],
      tables: ["groups", "group_members"]
    }
  ],

  "Layer 3 - Database & Storage": [
    {
      name: "PostgreSQL Schema Architecture",
      description: "55+ tables with comprehensive relationships: users, posts, events, groups, roles, media, messaging, analytics",
      status: "Production Ready",
      icon: Database,
      components: [],
      apis: [],
      tables: ["users", "posts", "events", "groups", "roles", "media_assets", "chat_rooms", "notifications", "reactions", "follows"]
    },
    {
      name: "Enhanced Social Features Schema",
      description: "Complete social media functionality: follows, likes, comments, reactions, stories, friend requests, blocking",
      status: "Production Ready",
      icon: Heart,
      components: [],
      apis: [],
      tables: ["follows", "post_likes", "post_comments", "reactions", "stories", "story_views", "friends", "blocked_users"]
    },
    {
      name: "Supabase Media Storage System",
      description: "Complete file management with metadata, tagging, visibility controls, usage tracking, reuse workflows",
      status: "Production Ready",
      icon: Cloud,
      components: ["UploadMedia", "MediaLibrary"],
      apis: ["/api/media", "/api/media/tags"],
      tables: ["media_assets", "media_tags", "media_usage", "memory_media"]
    },
    {
      name: "Multi-Role System Schema",
      description: "23 total roles (17 community + 6 platform) with junction tables, custom role requests, permission management",
      status: "Production Ready",
      icon: UserCheck,
      components: [],
      apis: [],
      tables: ["roles", "user_roles", "custom_role_requests", "user_profiles"]
    },
    {
      name: "Performance Optimization",
      description: "47+ strategic database indexes, query optimization, RLS policies, audit logging for production scaling",
      status: "Production Ready",
      icon: Zap,
      components: [],
      apis: [],
      tables: ["All tables with optimized indexes"]
    }
  ],

  "Layer 4 - Authentication & Security": [
    {
      name: "Replit OAuth Integration",
      description: "Seamless authentication with Replit sessions, user context extraction, role-based access control",
      status: "Production Ready",
      icon: Lock,
      components: ["AuthContext", "RoleGuard"],
      apis: ["/api/auth/user"],
      tables: ["users", "user_profiles", "user_api_tokens"]
    },
    {
      name: "Row-Level Security (RLS)",
      description: "Comprehensive PostgreSQL RLS policies protecting all sensitive data with user context validation",
      status: "Production Ready",
      icon: Shield,
      components: [],
      apis: [],
      tables: ["posts", "events", "stories", "follows", "media_assets", "chat_messages"]
    },
    {
      name: "Role-Based Access Control (RBAC)",
      description: "Multi-tier permission system: super_admin → admin → city_admin → group_admin → moderator hierarchy",
      status: "Production Ready",
      icon: UserCheck,
      components: ["RoleGuard", "AdminAccessControl"],
      apis: ["/api/roles/enhanced"],
      tables: ["roles", "user_roles", "user_profiles"]
    },
    {
      name: "Content Moderation & Safety",
      description: "Post reporting system, automated monitoring, admin review workflows, user blocking capabilities",
      status: "Production Ready",
      icon: Shield,
      components: ["ContentModerationPanel", "ReportModal"],
      apis: ["/api/posts/reports", "/api/admin/content"],
      tables: ["post_reports", "blocked_users", "activities"]
    },
    {
      name: "GDPR Compliance Framework",
      description: "Complete privacy controls with data export, deletion, consent management, audit trails",
      status: "Production Ready",
      icon: Scale,
      components: ["PrivacyCenter", "GDPRComplianceService"],
      apis: ["/api/gdpr/*", "/api/privacy/*"],
      tables: ["privacy_consents", "data_subject_requests", "gdpr_audit_log"]
    }
  ],

  "Layer 5 - Integration & Services": [
    {
      name: "Google Maps Platform Integration",
      description: "Complete location services: autocomplete, coordinate capture, place IDs, address formatting across all forms",
      status: "Production Ready",
      icon: MapPin,
      components: ["GoogleMapsAutocomplete", "GoogleMapsLocationPicker", "GoogleMapsEventLocationPicker"],
      apis: ["Google Maps Places API"],
      tables: ["posts", "events", "users"]
    },
    {
      name: "Pexels Photo API Integration",
      description: "Automatic city photo fetching for group creation with authentic high-resolution imagery",
      status: "Production Ready",
      icon: Camera,
      components: ["CityPhotoService"],
      apis: ["Pexels API"],
      tables: ["groups"]
    },
    {
      name: "Supabase Realtime Integration",
      description: "Live updates for comments, reactions, messaging, presence channels, typing indicators",
      status: "Production Ready",
      icon: Zap,
      components: ["RealtimeService", "PresenceChannels"],
      apis: ["Supabase Realtime"],
      tables: ["chat_messages", "post_comments", "reactions"]
    },
    {
      name: "Email Notification System",
      description: "Resend integration with dynamic HTML templates for friend requests, event notifications, safety reports",
      status: "Production Ready",
      icon: Mail,
      components: ["EmailService", "NotificationTemplates"],
      apis: ["Resend API"],
      tables: ["notifications"]
    },
    {
      name: "Plausible Analytics Integration",
      description: "Privacy-first analytics with comprehensive event tracking, A/B testing, conversion analysis",
      status: "Production Ready",
      icon: BarChart3,
      components: ["AnalyticsService"],
      apis: ["Plausible Analytics API"],
      tables: []
    }
  ],

  "Layer 6 - Testing & Quality Assurance": [
    {
      name: "Comprehensive Testing Framework",
      description: "Jest + React Testing Library + Cypress + Playwright with 70% coverage requirements",
      status: "Infrastructure Ready",
      icon: TestTube,
      components: ["Test Suites"],
      apis: [],
      tables: []
    },
    {
      name: "Database Testing & Validation",
      description: "pg-mem testing, schema validation, performance testing with realistic data sets",
      status: "Infrastructure Ready",
      icon: Database,
      components: [],
      apis: [],
      tables: ["All test data"]
    },
    {
      name: "API Endpoint Testing",
      description: "Supertest integration testing, response validation, error handling verification",
      status: "Infrastructure Ready",
      icon: Server,
      components: [],
      apis: ["All API endpoints"],
      tables: []
    },
    {
      name: "Performance Testing",
      description: "k6 load testing, query optimization validation, response time monitoring",
      status: "Infrastructure Ready",
      icon: Activity,
      components: [],
      apis: [],
      tables: []
    }
  ],

  "Layer 7 - DevOps & Deployment": [
    {
      name: "Replit Deployment Configuration",
      description: "Production-ready deployment with environment variables, database connections, workflow automation",
      status: "Production Ready",
      icon: Rocket,
      components: [],
      apis: [],
      tables: []
    },
    {
      name: "Environment Management",
      description: "Secure secret management, environment-specific configurations, API key handling",
      status: "Production Ready",
      icon: Settings,
      components: [],
      apis: [],
      tables: []
    },
    {
      name: "Database Migration System",
      description: "Drizzle ORM migrations, schema versioning, production deployment scripts",
      status: "Production Ready",
      icon: Database,
      components: [],
      apis: [],
      tables: []
    }
  ],

  "Layer 8 - Analytics & Monitoring": [
    {
      name: "System Health Monitoring",
      description: "Real-time monitoring with uptime tracking, response time analysis, error rate monitoring",
      status: "Production Ready",
      icon: Monitor,
      components: ["SystemHealthMonitor"],
      apis: ["/api/admin/system-health"],
      tables: ["activities"]
    },
    {
      name: "User Analytics & Engagement",
      description: "Comprehensive tracking: page views, feature usage, user journeys, conversion funnels",
      status: "Production Ready",
      icon: Eye,
      components: ["AnalyticsPanel"],
      apis: ["Plausible Analytics"],
      tables: []
    },
    {
      name: "Platform Analytics Dashboard",
      description: "Admin analytics with user growth, engagement metrics, geographic distribution, content statistics",
      status: "Production Ready",
      icon: BarChart3,
      components: ["AdminCenter Analytics Tab"],
      apis: ["/api/admin/stats"],
      tables: ["users", "posts", "events", "groups"]
    }
  ],

  "Layer 9 - Documentation & Training": [
    {
      name: "Technical Documentation",
      description: "40+ implementation reports documenting all features, APIs, database schema, deployment procedures",
      status: "Production Ready",
      icon: BookOpen,
      components: [],
      apis: [],
      tables: []
    },
    {
      name: "API Documentation",
      description: "Complete endpoint documentation with examples, response formats, authentication requirements",
      status: "Production Ready",
      icon: Code,
      components: [],
      apis: ["All API endpoints"],
      tables: []
    },
    {
      name: "User Onboarding Documentation",
      description: "Comprehensive user guides, feature explanations, workflow documentation",
      status: "Production Ready",
      icon: Users,
      components: ["Onboarding", "CodeOfConduct"],
      apis: [],
      tables: []
    }
  ],

  "Layer 10 - Legal & Compliance": [
    {
      name: "Terms of Service & Privacy Policy",
      description: "Complete legal framework for global tango community platform operation",
      status: "Production Ready",
      icon: Scale,
      components: ["CodeOfConduct", "PrivacyCenter"],
      apis: [],
      tables: ["privacy_consents"]
    },
    {
      name: "GDPR Compliance System",
      description: "Complete data protection framework with consent management, data portability, deletion rights",
      status: "Production Ready",
      icon: Shield,
      components: ["GDPRComplianceService", "PrivacyCenter"],
      apis: ["/api/gdpr/*"],
      tables: ["privacy_consents", "data_subject_requests", "gdpr_audit_log"]
    },
    {
      name: "Content Policy Enforcement",
      description: "Community guidelines enforcement, content moderation, appeal processes",
      status: "Production Ready",
      icon: Eye,
      components: ["ContentModerationPanel"],
      apis: ["/api/posts/reports"],
      tables: ["post_reports", "activities"]
    }
  ],

  "Layer 11 - Strategic & Business": [
    {
      name: "11L Project Tracker System",
      description: "Comprehensive project management and tracking system for all platform features and development",
      status: "Production Ready",
      icon: Briefcase,
      components: ["Comprehensive11LProjectTracker", "PlatformFeaturesSurface"],
      apis: ["/api/project-tracker"],
      tables: ["project_tracker_items", "platform_feature_items"]
    },
    {
      name: "Admin Center Management Hub",
      description: "9-tab administrative interface: Overview, User Management, Content Moderation, Analytics, Events, Reports, Compliance, System Health, Settings",
      status: "Production Ready",
      icon: Settings,
      components: ["AdminCenter", "UserManagement", "ComplianceCenter"],
      apis: ["/api/admin/*"],
      tables: ["users", "posts", "events", "activities"]
    },
    {
      name: "Professional Resume System",
      description: "Event role tracking with PDF export, public sharing, career progression documentation",
      status: "Production Ready",
      icon: Trophy,
      components: ["ResumePage", "PublicResumePage", "EventRoleInvitations"],
      apis: ["/api/resume/*", "/api/public-resume/*"],
      tables: ["event_participants", "events"]
    },
    {
      name: "Community Growth Automation",
      description: "Automatic city group creation, user assignment, content organization, engagement optimization",
      status: "Production Ready",
      icon: Network,
      components: ["CityGroupAutomation", "GroupDetailPage"],
      apis: ["/api/user/city-group", "/api/user/auto-join-city-groups"],
      tables: ["groups", "group_members"]
    }
  ]
};

export function PlatformFeaturesSurface() {
  const [selectedCategory, setSelectedCategory] = useState("Layer 1 - User Interface & Experience");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter features based on search term
  const filteredFeatures = COMPLETE_PLATFORM_FEATURES[selectedCategory]?.filter(feature =>
    feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate comprehensive statistics
  const allFeatures = Object.values(COMPLETE_PLATFORM_FEATURES).flat();
  const totalFeatures = allFeatures.length;
  const productionReadyFeatures = allFeatures.filter(f => f.status === "Production Ready").length;
  const inProgressFeatures = allFeatures.filter(f => f.status.includes("Progress")).length;
  const totalComponents = [...new Set(allFeatures.flatMap(f => f.components))].length;
  const totalAPIs = [...new Set(allFeatures.flatMap(f => f.apis))].length;
  const totalTables = [...new Set(allFeatures.flatMap(f => f.tables))].length;
  const completionPercentage = Math.round((productionReadyFeatures / totalFeatures) * 100);

  return (
    <div className="space-y-6">
      {/* Comprehensive Platform Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Layers className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Features</p>
                <p className="text-2xl font-bold">{totalFeatures}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Production Ready</p>
                <p className="text-2xl font-bold">{productionReadyFeatures}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{inProgressFeatures}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Components</p>
                <p className="text-2xl font-bold">{totalComponents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">API Endpoints</p>
                <p className="text-2xl font-bold">{totalAPIs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-cyan-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Database Tables</p>
                <p className="text-2xl font-bold">{totalTables}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completion</p>
                <p className="text-2xl font-bold">{completionPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Interface */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search across all 11 layers of platform features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* 11-Layer Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          {Object.keys(COMPLETE_PLATFORM_FEATURES).map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category.split(' - ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(COMPLETE_PLATFORM_FEATURES).map(([category, features]) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{category}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {features.length} features • {features.filter(f => f.status === "Production Ready").length} production ready
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                const isProductionReady = feature.status === "Production Ready";
                const hasIssues = feature.status.includes("Tech Debt") || feature.status.includes("Progress");
                
                return (
                  <Card key={index} className={`hover:shadow-md transition-shadow ${
                    isProductionReady ? 'border-green-200' : hasIssues ? 'border-orange-200' : 'border-gray-200'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            isProductionReady ? 'bg-green-50' : hasIssues ? 'bg-orange-50' : 'bg-blue-50'
                          }`}>
                            <IconComponent className={`h-5 w-5 ${
                              isProductionReady ? 'text-green-600' : hasIssues ? 'text-orange-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{feature.name}</CardTitle>
                            <Badge 
                              variant={isProductionReady ? "default" : hasIssues ? "destructive" : "secondary"}
                              className="mt-1"
                            >
                              {feature.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">{feature.description}</p>
                      
                      <div className="space-y-3">
                        {feature.components.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                              <Palette className="h-3 w-3" />
                              Components ({feature.components.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {feature.components.map((component, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {component}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {feature.apis.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                              <Server className="h-3 w-3" />
                              APIs ({feature.apis.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {feature.apis.map((api, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs font-mono">
                                  {api}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {feature.tables.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                              <Database className="h-3 w-3" />
                              Tables ({feature.tables.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {feature.tables.map((table, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs font-mono bg-purple-50 text-purple-700">
                                  {table}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
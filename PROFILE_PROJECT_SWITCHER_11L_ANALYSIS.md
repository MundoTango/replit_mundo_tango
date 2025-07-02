# Profile/Project Switcher Implementation - 11L Analysis

## Layer 1: Frontend/UI
**Current State**: Mundo Tango has role-based navigation but no project switcher
**Implementation**: Create ProjectSwitcher component in header with dropdown for Life CEO access

### Components Needed:
- `ProjectSwitcher.tsx` - Main switcher component
- `LifeCEOPortal.tsx` - Entry point to Life CEO system
- Enhanced header navigation in TrangoTechSidebar

### User Experience:
- Profile dropdown in top-right with "Switch Project" option
- Life CEO badge/indicator when active
- Seamless transition between Mundo Tango and Life CEO views

## Layer 2: Backend/API
**Current State**: Authentication works with Replit OAuth
**Implementation**: Extend user context to include project scope

### API Endpoints Needed:
- `GET /api/projects/available` - List accessible projects
- `POST /api/projects/switch/:projectId` - Switch project context
- `GET /api/life-ceo/status` - Check Life CEO system status

### Session Management:
- Add `activeProject` to user session
- Maintain separate contexts for Mundo Tango vs Life CEO

## Layer 3: Middleware/Services
**Current State**: Role-based access control exists
**Implementation**: Extend RBAC to include project-level permissions

### Services:
- ProjectPermissionService - Validate project access
- ContextSwitchingService - Handle project transitions
- SessionSyncService - Maintain state across project switches

## Layer 4: Database
**Current State**: Mundo Tango uses PostgreSQL with user roles
**Implementation**: Add project association tables

### Schema Extensions:
```sql
CREATE TABLE user_projects (
  user_id INTEGER REFERENCES users(id),
  project_id VARCHAR(50),
  access_level VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_contexts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  project_id VARCHAR(50),
  last_accessed TIMESTAMPTZ,
  preferences JSONB
);
```

## Layer 5: Security & Compliance
**Current State**: RLS policies and RBAC active
**Implementation**: Extend security to cover cross-project access

### Security Requirements:
- Validate project access permissions
- Audit project switching events
- Maintain data isolation between projects
- Secure API key management for Life CEO services

## Layer 6: Testing & Validation
**Current State**: Testing framework with Jest/Vitest
**Implementation**: Add project switcher test suite

### Test Coverage:
- Component rendering and interaction
- API endpoint validation
- Permission checking
- Session state management
- Cross-project data isolation

## Layer 7: Documentation
**Current State**: Comprehensive technical documentation
**Implementation**: Document project switcher architecture

### Documentation Updates:
- User guide for project switching
- API documentation for new endpoints
- Security model documentation
- Architecture decision records

## Layer 8: Customer/User Testing
**Current State**: Scott Boddye as primary user
**Implementation**: Validate switcher workflow

### Validation Points:
- Intuitive project switching UX
- Clear visual indicators of active project
- Smooth transition between contexts
- No loss of session data

## Layer 9: System Integration
**Current State**: Integrated with Supabase, analytics
**Implementation**: Extend integrations for Life CEO

### Integration Points:
- Analytics tracking for project switches
- Notification routing by project
- Cross-project data synchronization
- External service authentication

## Layer 10: Deployment & Infrastructure
**Current State**: Replit deployment with workflows
**Implementation**: Deploy switcher without disruption

### Deployment Strategy:
- Feature flag for project switcher
- Gradual rollout to test functionality
- Monitoring for performance impact
- Rollback plan if issues arise

## Layer 11: Business Logic & Orchestration
**Current State**: Mundo Tango business logic established
**Implementation**: Orchestrate multi-project ecosystem

### Business Requirements:
- Scott Boddye has access to all projects
- Life CEO has oversight of Mundo Tango
- Clear hierarchy: Life CEO → Mundo Tango → Sub-projects
- Seamless user experience across projects

## Implementation Priority:

### Phase 1 (Immediate):
1. Create ProjectSwitcher component
2. Add "Life CEO Portal" option in profile dropdown
3. Basic navigation to AdminCenter with Life CEO badge

### Phase 2 (Next):
1. Implement actual Life CEO dashboard
2. Add project context API endpoints
3. Extend user session management

### Phase 3 (Future):
1. Full cross-project integration
2. Shared services between projects
3. Unified notification system

## Success Metrics:
- User can access Life CEO system within 2 clicks
- No session data loss during project switches
- Clear visual indication of active project
- 100% test coverage for switcher functionality
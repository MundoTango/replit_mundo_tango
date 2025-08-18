# 11-Layer Analysis: Complete Groups System Rebuild with City Communities

## Problem Analysis
**Issue**: Current groups showing NYC photos, need complete rebuild with proper city communities
**Goal**: Delete existing groups, rebuild through registration flow, implement city admin RBAC/ABAC system

## 11-Layer Implementation Plan

### 1. **Expertise Layer**
- **Required Skills**: Database operations, RBAC/ABAC, user registration flow, city photo management
- **Technologies**: PostgreSQL, role-based permissions, automated group creation
- **Approach**: Complete system rebuild with proper city community structure

### 2. **Open Source Scan Layer**
- **Existing Infrastructure**: CityPhotoService, user registration flow, role system
- **New Components**: City admin role, community management, cover photo system
- **Integration**: Group detail pages with city-specific photos

### 3. **Legal & Compliance Layer**
- **Data Deletion**: Safe removal of existing groups with proper cleanup
- **User Permissions**: RBAC for super admin and city admin roles
- **Photo Rights**: Pexels API compliance for city photos

### 4. **Consent & UX Safeguards Layer**
- **User Transparency**: Clear city community creation during registration
- **Permission Model**: Super admin + city admin hierarchy
- **Data Recovery**: Backup approach for critical data

### 5. **Data Layer**
- **Delete Operations**: Remove all existing groups and memberships
- **New Schema**: Enhanced groups with city admin relationships
- **Role Extensions**: City admin role with location-based permissions

### 6. **Backend Layer**
- **Group Deletion**: Complete cleanup of groups and group_members tables
- **Registration Enhancement**: Auto-create city groups with proper photos
- **Admin Endpoints**: City admin management APIs

### 7. **Frontend Layer**
- **Remove Fix Photos Button**: Clean up existing UI
- **Group Detail Pages**: City-specific cover photos
- **Admin Interface**: City admin management controls

### 8. **Sync & Automation Layer**
- **Registration Trigger**: Auto-create city groups during user signup
- **Photo Integration**: Apply city photos to group detail pages
- **Role Assignment**: Automatic city admin capabilities

### 9. **Security & Permissions Layer**
- **Super Admin**: Full system control (Scott Boddye)
- **City Admin**: Location-specific group management
- **RBAC Implementation**: Role-based access control for city communities

### 10. **AI & Reasoning Layer**
- **Smart City Matching**: Intelligent city group creation
- **Photo Selection**: Best city photos for each community
- **Admin Assignment**: Logical city admin role distribution

### 11. **Testing & Observability Layer**
- **Deletion Validation**: Confirm complete group cleanup
- **Registration Testing**: Verify proper city group creation
- **Permission Testing**: Validate RBAC/ABAC implementation

## Implementation Steps
1. Remove Fix Photos button from Groups page
2. Delete all existing groups and memberships
3. Add city admin role to role system
4. Enhance registration flow for proper city group creation
5. Apply city photos to group detail pages
6. Implement city admin permissions
7. Test complete flow with all users
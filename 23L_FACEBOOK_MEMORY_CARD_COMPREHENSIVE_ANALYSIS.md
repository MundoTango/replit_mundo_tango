# 23L Framework Analysis: FacebookInspiredMemoryCard Comprehensive Fix

## Layer 1: Expertise & Technical Proficiency
**Current State:**
- Enhanced-timeline.tsx uses FacebookInspiredMemoryCard component
- EnhancedPostItem.tsx has all features working correctly
- Need to ensure FacebookInspiredMemoryCard matches EnhancedPostItem functionality

**Required Components:**
1. FacebookReactionSelector - For emoji reactions
2. RichTextCommentEditor - For comments with mentions
3. PostContextMenu - For edit/delete/report options
4. ReportModal - For reporting posts
5. Share options dialog - For sharing functionality

## Layer 2: Research & Discovery
**Component Analysis:**
- EnhancedPostItem has complete implementation (668 lines)
- FacebookInspiredMemoryCard needs feature parity
- Missing imports and components need to be added

**API Endpoints Required:**
- POST `/api/posts/:postId/reactions`
- POST `/api/posts/:postId/comments`
- GET `/api/posts/:postId/comments`
- POST `/api/posts/:postId/reports`
- POST `/api/posts/:postId/share`

## Layer 3: Legal & Compliance
- Report functionality for content moderation
- User consent indicators
- Privacy-respecting share options

## Layer 4: UX/UI Design
**Facebook-style Features:**
1. Reaction picker with 6 emoji reactions
2. Comment box with rich text support
3. Share dialog with 3 options
4. Three-dot menu for report/edit/delete
5. Proper spacing for reaction display

## Layer 5: Data Architecture
**State Management:**
- reactions object tracking emoji counts
- comments array for displaying comments
- currentUserReaction for user's selected reaction
- showComments, showShareOptions, showMenu booleans

## Layer 6: Backend Development
**Storage Methods Required:**
- createPostReaction
- getPostReactions
- createComment
- getComments
- createPostReport
- createShare

## Layer 7: Frontend Development
**Component Structure:**
```tsx
<FacebookInspiredMemoryCard>
  <Header />
  <Content />
  <ReactionsBar />
  <ActionButtons />
  <CommentsSection />
  <ShareDialog />
  <ReportModal />
</FacebookInspiredMemoryCard>
```

## Layer 8: API & Integration
- Ensure all mutations invalidate correct query keys
- Handle authentication for all API calls
- Proper error handling with toast notifications

## Implementation Plan

### Step 1: Import Missing Components
- Import FacebookReactionSelector
- Import RichTextCommentEditor
- Import PostContextMenu
- Import other UI components

### Step 2: Add Missing State
- Add reactions state management
- Add proper mutation handlers
- Fix component structure

### Step 3: Implement Features
1. Fix reaction display with proper spacing
2. Add comment persistence
3. Add share dialog
4. Add report functionality
5. Add three-dot menu

### Step 4: Test Integration
- Verify all features work on enhanced-timeline
- Check API endpoints are called correctly
- Ensure UI updates properly
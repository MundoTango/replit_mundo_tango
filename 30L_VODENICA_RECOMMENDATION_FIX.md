# 30L Framework Analysis: Vodenica Recommendation Fix

## Issue Identified
1. **Wrong Entity Type**: Vodenica restaurant was created as a city group instead of a recommendation
2. **Missing UI Feature**: City Groups summary needs recommendations count box

## Root Cause Analysis

**Layer 5: Database Architecture** 🔴 Critical
- Vodenica created as city group (ID: 42) instead of recommendation entry
- Need to migrate data from groups table to recommendations table

**Layer 6: Backend Development** ⚠️ Issue
- City group creation endpoint missing validation for actual cities
- No auto-geocoding to prevent restaurant names as cities

**Layer 7: Frontend Development** 🟡 Enhancement Needed
- City Groups summary missing recommendations count display
- Need to add recommendations count to statistics

## Fix Implementation Plan

### Phase 1: Database Cleanup
1. Create Vodenica as recommendation in Kolašin
2. Delete incorrect Vodenica city group
3. Ensure proper association with Kolašin group

### Phase 2: UI Enhancement
1. Add recommendations count to city group statistics API
2. Update CommunityMapWithLayers component to show recommendations count
3. Style consistent with existing member/event/host boxes

## Success Criteria
- No Vodenica city group exists
- Vodenica appears as recommendation within Kolašin
- Recommendations count visible on all city groups
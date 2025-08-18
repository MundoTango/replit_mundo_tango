# 30L Framework: Complete Issue Resolution

## ISSUE 1: Kolašin Group Not Found

**Root Cause**: The slug in the database is `kola-in-montenegro` but the URL is using `/groups/kolasin`

**Evidence**: 
```sql
 id |        name         |        slug        |  city   |  country   
----+---------------------+--------------------+---------+------------
 43 | Kolašin, Montenegro | kola-in-montenegro | Kolašin | Montenegro
```

**Solution**: The 'š' character has been stripped during slug generation, creating `kola-in-montenegro`

## ISSUE 2: Buenos Aires in Africa

**Root Cause**: The longitude sign is being reversed somewhere in the data flow

**Analysis**:
- API returns correct coordinates: -34.6037, -58.3816
- Map shows marker at approximately: -34.6037, +58.3816 (positive longitude)
- This places it in the Indian Ocean east of Africa

**Code Location**: Line 508 in CommunityMapWithLayers.tsx
```javascript
position={[item.lat, item.lng]}
```

The coordinates are being passed correctly, so the issue must be in data transformation.

## Implementation Plan

### Fix 1: Update Kolašin Navigation
Need to use the correct slug `kola-in-montenegro` in navigation

### Fix 2: Debug Coordinate Transformation
Check where longitude values are being modified between API and map display
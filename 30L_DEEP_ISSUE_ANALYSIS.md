# 30L Framework Deep Analysis: Kolašin Group & Buenos Aires Map Issues

## Executive Summary
Despite multiple fixes over the past 2 days, two critical issues persist:
1. Kolašin group returns 404 (slug mismatch)
2. Buenos Aires appears in Africa instead of South America

## Layer 1: Foundation - Technical Understanding
- **Issue 1**: API endpoint `/api/groups/kolasin` returns 404 - likely slug mismatch
- **Issue 2**: Buenos Aires coordinates (-34.6037, -58.3816) are correct but display incorrectly

## Layer 5: Database Architecture Analysis
Need to verify:
- Actual slug stored for Kolašin group in database
- Character encoding issues (Kolašin vs KolaÅ¡in)
- City coordinates storage and retrieval

## Layer 7: Frontend Development
- Map coordinate transformation issue
- Possible lat/lng reversal or sign error
- Component prop passing chain

## Layer 8: API Integration
- URL encoding/decoding problems
- Slug generation inconsistency
- Response data transformation

## Root Cause Analysis

### Issue 1: Kolašin Group 404
- URL shows `/groups/kolasin` but actual slug might be different
- Possible slugs: `kolasin`, `kolasin-montenegro`, `tango-kolasin-montenegro`
- Character encoding: š character may be stripped or encoded differently

### Issue 2: Buenos Aires in Africa
- Coordinates -34.6037, -58.3816 are correct for Buenos Aires
- But appearing at approximately 34°S, 58°E (Indian Ocean/Africa)
- **Critical Finding**: Longitude sign is being reversed somewhere

## Investigation Steps
1. Query database for exact Kolašin slug
2. Trace coordinate transformation in map components
3. Check for sign reversal in longitude values
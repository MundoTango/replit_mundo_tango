# 30L Framework Analysis: Ocean Theme Restoration

## Issue Identification
Old TrangoTech/Tango theme styling is overriding the ocean theme due to conflicting CSS sources.

## Root Cause Analysis

### Layer 1: Expertise & Technical Proficiency
**CRITICAL FINDING**: Multiple conflicting CSS sources are causing style regression:

1. **index.css** contains:
   - TrangoTech CSS Variables (lines 232-244):
     - `--primary-color: #0D448A`
     - `--tag-color: #8E142E` (red)
   - Tango-specific colors (lines 440-473):
     - `--tango-red: hsl(348, 71%, 31%)`
     - `--tango-gold: hsl(45, 65%, 55%)`
   - Legacy classes (lines 491-531):
     - `.tango-red`, `.bg-tango-red`
     - `.card-shadow` (with red shadow)
     - `.story-ring` (using tango gradient)

2. **ttfiles.css** contains:
   - Complete TrangoTech Design System (lines 4-38)
   - TrangoTech card styles (lines 41-52)

3. **Components using legacy classes**:
   - `PostCard`: `card-shadow`, `text-tango-black`, `hover:text-tango-red`
   - Feed components referencing old styles

### Layer 5: Data Architecture
- Ocean theme variables ARE defined but being overridden by legacy CSS
- CSS specificity and cascade order causing legacy styles to win

### Layer 7: Frontend Development
- Components directly using legacy class names
- No CSS module isolation preventing style conflicts
- ttfiles.css being imported and taking precedence

### Layer 11: Analytics & Monitoring
- Browser DevTools shows legacy styles applied
- Ocean theme classes present but overridden

### Layer 21: Production Resilience
- Need systematic removal of legacy CSS
- Establish CSS isolation strategy

## Solution Implementation

### Immediate Fixes:
1. Comment out or remove legacy CSS variables in index.css
2. Remove ttfiles.css import or isolate it
3. Update all components to use ocean theme classes
4. Remove `.card-shadow`, `.tango-*` classes

### Prevention Strategy:
1. Create CSS module system for legacy styles
2. Establish naming conventions (ocean-* prefix)
3. Add linting rules for deprecated classes
4. Document approved color palette

## 30L Framework Application

### Layer 22: User Safety Net
- Preserve user experience during migration
- Gradual rollout of ocean theme

### Layer 23: Business Continuity
- Version control for CSS changes
- Rollback strategy if issues arise

### Layer 24: Theme Consistency
- Single source of truth for colors
- Automated theme validation

### Layer 25: CSS Architecture
- Module isolation for legacy code
- Clear deprecation path

### Layer 26: Visual Regression Testing
- Screenshot comparisons
- Automated style checks

### Layer 27: Design System Governance
- Approved component library
- Theme usage guidelines

### Layer 28: Migration Strategy
- Phased removal of legacy styles
- Component-by-component updates

### Layer 29: Quality Assurance
- Manual verification of all pages
- Cross-browser testing

### Layer 30: Continuous Monitoring
- Automated checks for legacy class usage
- Regular design audits
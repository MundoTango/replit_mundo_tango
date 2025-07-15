# 30L Framework: CSS Design Regression Prevention Strategy

## Executive Summary
Old TrangoTech/Tango theme styling surfaced due to conflicting CSS sources and lack of proper isolation. This document outlines a comprehensive prevention strategy using the 30L framework.

## Root Cause Summary
1. **Multiple CSS Variable Sets**: TrangoTech, Tango, and Ocean theme variables coexisting in index.css
2. **Legacy Class Names**: Components directly using `.card-shadow`, `.text-tango-*`, `.hover:text-tango-red`
3. **No CSS Isolation**: ttfiles.css importing globally affects all pages
4. **No Deprecation Path**: Old styles not properly marked as deprecated

## Prevention Strategy

### Layer 24: Theme Consistency
**Immediate Actions:**
- ✅ Commented out all TrangoTech CSS variables in index.css
- ✅ Commented out all Tango-specific colors and utility classes
- ✅ Updated components to use ocean theme classes

**Long-term Actions:**
- Create single source of truth for theme variables
- Implement CSS-in-JS or CSS modules for isolation
- Version control theme changes

### Layer 25: CSS Architecture
**Module Isolation:**
```css
/* Legacy styles should be scoped */
.ttfiles-demo-only {
  /* All TT styles here */
}
```

**Naming Conventions:**
- Ocean theme: `ocean-*` prefix
- Legacy: `legacy-*` prefix
- Deprecated: `deprecated-*` prefix

### Layer 26: Visual Regression Testing
**Automated Checks:**
1. Screenshot tests for critical pages
2. CSS linting rules:
   ```json
   {
     "rules": {
       "selector-class-pattern": "^(ocean-|legacy-|deprecated-)",
       "no-restricted-syntax": ["tango-", "tt-", "card-shadow"]
     }
   }
   ```

### Layer 27: Design System Governance
**Component Library:**
- Approved ocean theme components only
- Storybook for visual documentation
- Design tokens in TypeScript

**Usage Guidelines:**
```typescript
// ✅ Good
className="bg-gradient-to-r from-turquoise-500 to-blue-500"

// ❌ Bad
className="card-shadow text-tango-red"
```

### Layer 28: Migration Strategy
**Phase 1 (Complete):**
- ✅ Comment out legacy CSS
- ✅ Update critical components

**Phase 2 (Next):**
- Move ttfiles.css to scoped module
- Create migration guide
- Audit all components

**Phase 3 (Future):**
- Remove commented code
- Archive legacy styles
- Update documentation

### Layer 29: Quality Assurance
**Code Review Checklist:**
- [ ] No tango-* or tt-* classes used
- [ ] Ocean theme variables only
- [ ] No hardcoded colors
- [ ] CSS properly scoped

**Testing Matrix:**
- [ ] Home page - ocean theme
- [ ] Admin panel - ocean theme
- [ ] TTfiles demo - isolated legacy

### Layer 30: Continuous Monitoring
**Automated Alerts:**
1. Git hooks to check for banned classes
2. CI/CD pipeline CSS validation
3. Monthly design audits

**Monitoring Script:**
```bash
#!/bin/bash
# Check for legacy classes
grep -r "tango-\|tt-\|card-shadow" src/ --include="*.tsx" --include="*.jsx"
```

## Implementation Timeline
- **Immediate** (Done): Fix critical CSS conflicts
- **Week 1**: Implement CSS linting and git hooks
- **Week 2**: Create component library documentation
- **Week 3**: Complete migration of all components
- **Week 4**: Remove deprecated code

## Success Metrics
- Zero legacy class usage in production
- 100% ocean theme consistency
- Automated prevention in place
- Clear deprecation path established

## Lessons Learned
1. **CSS Cascade**: Global styles always risk conflicts
2. **Clear Deprecation**: Mark old code clearly
3. **Isolation**: Scope legacy code to specific contexts
4. **Automation**: Use tools to prevent regression

## Conclusion
By following this 30L framework prevention strategy, we ensure the ocean theme remains consistent and old TrangoTech styling cannot resurface. The key is systematic isolation, clear deprecation, and automated enforcement.
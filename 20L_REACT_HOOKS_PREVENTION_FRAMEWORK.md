# 20L React Hooks Prevention Framework
## Created: January 7, 2025
## Purpose: Prevent React hooks violations that cause blank page crashes

## Layer 1: Expertise - React Hooks Mastery
- **Rules of Hooks**: Hooks must ALWAYS be called at the top level of components
- **Never call hooks inside**: Loops, conditions, nested functions, or event handlers
- **Hook Order Consistency**: Same hooks must be called in same order every render
- **Custom Hook Pattern**: Extract complex logic into custom hooks starting with 'use'

## Layer 2: Research - Error Pattern Analysis
- **Root Cause**: useMemo hook was called inside renderSimpleTreeItem function
- **Error Type**: React detected hooks called conditionally or in wrong order
- **Impact**: Entire component tree crashes, leaving blank page
- **Frequency**: Common in dynamic rendering functions and conditional logic

## Layer 3: Legal/Compliance - React Standards
- **React Rules**: Official React documentation on Rules of Hooks
- **ESLint Plugin**: react-hooks/rules-of-hooks for automated detection
- **Team Standards**: All hooks must be at component top level
- **Code Review**: Check for conditional hook usage

## Layer 4: User Experience - Error Prevention
- **ErrorBoundary**: Wrap critical components to catch React errors
- **Fallback UI**: Show meaningful error messages instead of blank pages
- **Recovery Options**: Provide refresh or reset buttons
- **User Communication**: Clear, non-technical error messages

## Layer 5: Data Architecture - State Management
- **Pre-calculate Data**: Move all useMemo calculations to component level
- **State Structure**: Design state to avoid conditional hook usage
- **Memoization Strategy**: Pre-compute expensive calculations outside render functions
- **Data Flow**: Clear separation between calculation and rendering

## Layer 6: Backend Integration - Error Reporting
- **Error Logging**: Capture React errors for monitoring
- **Stack Traces**: Preserve error context for debugging
- **Analytics**: Track error frequency and patterns
- **Alerts**: Notify team of critical UI failures

## Layer 7: Frontend Development - Implementation
### Fixed Pattern:
```typescript
// ✅ CORRECT: Calculate at component level
const Component = () => {
  const allItemsMap = useMemo(() => {
    const map = new Map();
    // Build map of all items
    return map;
  }, [items]);

  const renderItem = (item) => {
    // Use pre-calculated data
    const data = allItemsMap.get(item.id);
    return <div>{data}</div>;
  };
};

// ❌ WRONG: Hook inside function
const renderItem = (item) => {
  const data = useMemo(() => calculate(item), [item]); // ERROR!
  return <div>{data}</div>;
};
```

## Layer 8: Integration - Component Architecture
- **Component Boundaries**: Clear separation of concerns
- **Prop Drilling Prevention**: Use context for deeply nested data
- **Render Optimization**: Minimize re-renders with proper memoization
- **Component Composition**: Build from simple, testable units

## Layer 9: Security - Error Handling
- **No Sensitive Data**: Never expose internal errors to users
- **Sanitized Messages**: Generic user-facing error text
- **Debug Mode**: Detailed errors only in development
- **Error Recovery**: Graceful degradation strategies

## Layer 10: Infrastructure/DevOps - Build Tools
- **Linting**: Enforce hooks rules at build time
- **Pre-commit Hooks**: Catch violations before commit
- **CI/CD Checks**: Fail builds on hooks violations
- **Development Warnings**: Clear console warnings during development

## Layer 11: Analytics - Error Monitoring
- **Error Tracking**: Monitor hooks violations in production
- **Performance Impact**: Measure render performance
- **User Impact**: Track error-related user drop-offs
- **Recovery Success**: Monitor error boundary effectiveness

## Layer 12: Continuous Improvement - Prevention
- **Code Reviews**: Specific checks for hooks usage
- **Team Training**: Regular React hooks education
- **Pattern Library**: Document approved patterns
- **Automated Fixes**: ESLint auto-fix where possible

## Layer 13: AI Agent Orchestration - Automated Detection
- **Static Analysis**: AI-powered hooks violation detection
- **Pattern Recognition**: Identify risky code patterns
- **Suggested Fixes**: Automated refactoring suggestions
- **Learning System**: Improve detection over time

## Layer 14: Context & Memory - Historical Prevention
- **Error History**: Track all hooks-related errors
- **Pattern Database**: Common violation patterns
- **Solution Library**: Proven fix approaches
- **Team Knowledge**: Shared learning from errors

## Layer 15: Voice & Environmental - Developer Experience
- **Clear Warnings**: Immediate feedback on violations
- **IDE Integration**: Real-time hooks validation
- **Voice Alerts**: Audio warnings for violations
- **Visual Indicators**: Highlight problematic code

## Layer 16: Ethics & Behavioral - Best Practices
- **Code Quality**: Prioritize maintainable patterns
- **Team Standards**: Consistent hooks usage
- **Documentation**: Clear examples and anti-patterns
- **Mentorship**: Share hooks knowledge

## Layer 17: Emotional Intelligence - Developer Support
- **Error Empathy**: Understand developer frustration
- **Clear Guidance**: Helpful error messages
- **Learning Resources**: Links to documentation
- **Positive Reinforcement**: Celebrate good patterns

## Layer 18: Cultural Awareness - Team Dynamics
- **Code Style**: Team-agreed hooks conventions
- **Review Culture**: Constructive feedback on hooks
- **Knowledge Sharing**: Regular hooks discussions
- **Cross-Training**: Ensure team-wide understanding

## Layer 19: Energy Management - Performance
- **Render Optimization**: Minimize unnecessary renders
- **Memory Usage**: Efficient memoization strategies
- **Bundle Size**: Optimal hook usage patterns
- **Runtime Performance**: Fast error recovery

## Layer 20: Proactive Intelligence - Future Prevention
- **Predictive Analysis**: Identify risky patterns early
- **Automated Refactoring**: Proactive code improvements
- **Learning System**: Adapt to new React patterns
- **Evolution Tracking**: Monitor React ecosystem changes

## Implementation Summary

### Immediate Actions Taken:
1. ✅ Fixed EnhancedHierarchicalTreeView by moving useMemo to component level
2. ✅ Created ErrorBoundary component for graceful error handling
3. ✅ Wrapped EnhancedHierarchicalTreeView with ErrorBoundary
4. ✅ Documented prevention patterns

### Prevention Checklist:
- [ ] All hooks at component top level
- [ ] No hooks in loops or conditions
- [ ] No hooks in nested functions
- [ ] ErrorBoundary around critical components
- [ ] Meaningful error messages
- [ ] Pre-calculated data structures
- [ ] ESLint rules enabled
- [ ] Team training completed

### Key Learning:
The issue was a React hooks violation where `useMemo` was being called inside the `renderSimpleTreeItem` function, which violates React's Rules of Hooks. The solution was to pre-calculate all rollup data at the component level and pass it down, ensuring hooks are only called at the top level of the component.

This framework ensures we never encounter similar React hooks violations that could crash the application and leave users with blank pages.
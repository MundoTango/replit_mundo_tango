# 20L Self-Reprompting Analysis Framework

## Purpose
This framework ensures systematic self-analysis and prevention of recurring issues through the 20-Layer system. It serves as a living document that evolves with each issue encountered.

## Self-Reprompting Protocol

### Before Any Change
```typescript
async function beforeChange(change: ProposedChange): Promise<ValidationResult> {
  const layers = await analyze20Layers(change);
  
  // Check each layer for potential issues
  for (const layer of layers) {
    const issues = await layer.detectPotentialIssues(change);
    if (issues.length > 0) {
      return {
        proceed: false,
        issues,
        preventiveMeasures: layer.getSuggestedPrevention(issues)
      };
    }
  }
  
  return { proceed: true };
}
```

### During Implementation
1. **Layer 1-4 (Foundation)**: Verify expertise, research, compliance, and UX
2. **Layer 5-8 (Architecture)**: Check data, backend, frontend, and API consistency
3. **Layer 9-12 (Operations)**: Validate security, deployment, monitoring, improvement
4. **Layer 13-16 (AI/Intelligence)**: Ensure agent coordination and context management
5. **Layer 17-20 (Human-Centric)**: Consider emotional, cultural, energy, and proactive aspects

### After Implementation
```typescript
async function afterChange(change: CompletedChange): Promise<void> {
  // Document learnings
  await documentLearnings(change);
  
  // Update prevention rules
  await updatePreventionRules(change);
  
  // Run comprehensive validation
  await runFullSystemValidation();
  
  // Update 20L framework if needed
  if (change.revealedNewPatterns) {
    await evolve20LFramework(change.learnings);
  }
}
```

## Common Issue Patterns & Prevention

### 1. Middleware Evolution Pattern
**Issue**: Middleware signatures change but consumers aren't updated
**Prevention**:
- Always search for all usages before changing middleware
- Create compatibility layers for gradual migration
- Use TypeScript strict mode for middleware signatures
- Document migration paths

### 2. Authentication Inconsistency Pattern
**Issue**: Different parts of system use different auth approaches
**Prevention**:
- Centralize auth logic in single service
- Create standardized auth interfaces
- Implement comprehensive auth tests
- Monitor auth failures in real-time

### 3. Schema Mismatch Pattern
**Issue**: Database schema doesn't match TypeScript types
**Prevention**:
- Generate types from schema automatically
- Run schema validation on every change
- Create migration validators
- Use strict type checking

### 4. API Version Drift Pattern
**Issue**: Frontend expects different API than backend provides
**Prevention**:
- Version all APIs explicitly
- Create API contracts
- Run contract tests
- Monitor API compatibility

## Self-Analysis Questions

### Before Making Changes
1. **Research**: Have I searched for all usages of what I'm changing?
2. **Impact**: What systems will be affected by this change?
3. **Compatibility**: Do I need backward compatibility?
4. **Testing**: What tests need to be updated or created?
5. **Documentation**: What documentation needs updating?

### During Implementation
1. **Consistency**: Am I following established patterns?
2. **Error Handling**: Have I considered all failure modes?
3. **Performance**: Will this impact system performance?
4. **Security**: Are there security implications?
5. **Monitoring**: How will we know if this breaks?

### After Implementation
1. **Validation**: Did all tests pass?
2. **Metrics**: Are success metrics in place?
3. **Rollback**: Can we easily rollback if needed?
4. **Learning**: What did we learn from this?
5. **Prevention**: How can we prevent similar issues?

## Automated Prevention Rules

### Rule 1: Middleware Change Detection
```typescript
if (file.includes('middleware')) {
  require(['search_all_usages', 'create_compatibility_layer', 'update_tests']);
}
```

### Rule 2: Schema Change Validation
```typescript
if (file.includes('schema')) {
  require(['validate_type_generation', 'check_migrations', 'update_storage']);
}
```

### Rule 3: API Change Protection
```typescript
if (file.includes('routes') || file.includes('api')) {
  require(['version_check', 'contract_validation', 'frontend_compatibility']);
}
```

### Rule 4: Auth Change Security
```typescript
if (file.includes('auth')) {
  require(['security_review', 'test_all_roles', 'monitor_failures']);
}
```

## Evolution Triggers

The 20L framework should evolve when:
1. Same issue occurs twice
2. New pattern emerges
3. Framework gap identified
4. User reports frustration
5. System complexity increases

## Integration with Evolution Service

```typescript
// Add to evolution service
export class SelfRepromptingSystem {
  private patterns: Map<string, PreventionPattern> = new Map();
  
  async analyzeChange(file: string, changes: string[]): Promise<Analysis> {
    // Apply 20L analysis
    const layers = await this.apply20Layers(file, changes);
    
    // Check known patterns
    const matchedPatterns = await this.matchPatterns(changes);
    
    // Generate prevention measures
    const preventions = await this.generatePreventions(layers, matchedPatterns);
    
    return {
      risks: layers.flatMap(l => l.risks),
      preventions,
      requiredValidations: this.getRequiredValidations(file, changes)
    };
  }
  
  async learn(issue: Issue, resolution: Resolution): Promise<void> {
    // Extract pattern
    const pattern = await this.extractPattern(issue, resolution);
    
    // Store for future prevention
    this.patterns.set(pattern.id, pattern);
    
    // Update 20L framework
    await this.update20LFramework(pattern);
  }
}
```

## Continuous Improvement Metrics

Track these metrics to improve the framework:
1. **Issue Recurrence Rate**: How often similar issues occur
2. **Prevention Success Rate**: How often prevention rules work
3. **Framework Evolution Rate**: How often framework updates
4. **Developer Satisfaction**: How helpful is the framework
5. **Time to Resolution**: How quickly issues are resolved

## Living Document Updates

This document should be updated:
- After every significant issue
- When new patterns emerge
- When prevention rules change
- When 20L framework evolves
- During monthly reviews

Last Updated: January 2025
Version: 1.0
Next Review: February 2025
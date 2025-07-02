# Life CEO Project Structure

## Repository Structure

```
life-ceo-platform/
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml
│   │   ├── test.yml
│   │   └── agent-health-check.yml
│   └── CODEOWNERS
├── agents/
│   ├── life-ceo/
│   │   ├── prompt.md
│   │   ├── memory-loader.ts
│   │   ├── daily-review.ts
│   │   └── orchestrator.ts
│   ├── mundo-tango-ceo/
│   │   ├── prompt.md
│   │   ├── config.json
│   │   └── integration.ts
│   ├── finance-ceo/
│   │   ├── prompt.md
│   │   ├── budget-tracker.ts
│   │   └── integrations/
│   │       ├── stripe.ts
│   │       └── lemon-squeezy.ts
│   ├── travel-ceo/
│   │   ├── prompt.md
│   │   ├── logistics.ts
│   │   └── integrations/
│   │       ├── booking.ts
│   │       ├── airbnb.ts
│   │       └── maps.ts
│   ├── modeling-agent/
│   │   ├── prompt.md
│   │   ├── portfolio.ts
│   │   └── calendar.ts
│   ├── citizenship-visa-agent/
│   │   ├── prompt.md
│   │   ├── document-tracker.ts
│   │   └── deadline-monitor.ts
│   ├── security-agent/
│   │   ├── prompt.md
│   │   ├── audit.ts
│   │   ├── permissions.ts
│   │   └── vulnerability-scanner.ts
│   ├── social-media-agent/
│   │   ├── prompt.md
│   │   ├── scheduler.ts
│   │   └── cross-poster.ts
│   ├── memory-agent/
│   │   ├── prompt.md
│   │   ├── indexer.ts
│   │   └── retrieval.ts
│   ├── voice-environment-agent/
│   │   ├── prompt.md
│   │   ├── voice-processor.ts
│   │   └── environment-detector.ts
│   ├── legal-ethics-agent/
│   │   ├── prompt.md
│   │   ├── compliance.ts
│   │   └── consent-manager.ts
│   └── workflow-automation-agent/
│       ├── prompt.md
│       ├── n8n-bridge.ts
│       └── webhook-manager.ts
├── core/
│   ├── agent-base/
│   │   ├── base-agent.ts
│   │   ├── agent-interface.ts
│   │   └── agent-registry.ts
│   ├── memory/
│   │   ├── memory-store.ts
│   │   ├── memory-types.ts
│   │   └── memory-indexer.ts
│   ├── delegation/
│   │   ├── task-router.ts
│   │   ├── permission-checker.ts
│   │   └── delegation-logger.ts
│   └── communication/
│       ├── inter-agent-bus.ts
│       ├── webhook-gateway.ts
│       └── event-emitter.ts
├── database/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_agent_tables.sql
│   │   └── 003_memory_indexes.sql
│   ├── seeds/
│   │   ├── agents.sql
│   │   └── permissions.sql
│   └── schema/
│       ├── agents.sql
│       ├── memory.sql
│       ├── logs.sql
│       └── projects.sql
├── interfaces/
│   ├── chat/
│   │   ├── voice-handler.ts
│   │   ├── text-handler.ts
│   │   └── context-manager.ts
│   ├── dashboard/
│   │   ├── agent-view.tsx
│   │   ├── task-board.tsx
│   │   └── memory-browser.tsx
│   └── api/
│       ├── rest/
│       └── graphql/
├── integrations/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── realtime.ts
│   │   └── rls-policies.sql
│   ├── github/
│   │   ├── api.ts
│   │   └── actions.ts
│   ├── notion/
│   │   ├── client.ts
│   │   └── sync.ts
│   └── external/
│       ├── openai.ts
│       ├── anthropic.ts
│       └── whisper.ts
├── security/
│   ├── rbac/
│   │   ├── roles.ts
│   │   └── policies.ts
│   ├── encryption/
│   │   ├── keys.ts
│   │   └── vault.ts
│   └── audit/
│       ├── logger.ts
│       └── analyzer.ts
├── automation/
│   ├── schedulers/
│   │   ├── daily-review.ts
│   │   └── periodic-sync.ts
│   ├── webhooks/
│   │   ├── handler.ts
│   │   └── registry.ts
│   └── workflows/
│       ├── onboarding.ts
│       └── task-flow.ts
├── config/
│   ├── agents.json
│   ├── permissions.json
│   └── environment.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── architecture/
│   ├── agents/
│   └── deployment/
├── scripts/
│   ├── setup.sh
│   ├── deploy.sh
│   └── health-check.sh
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

## Supabase Schema Outline

```sql
-- Core Tables
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    parent_id UUID REFERENCES agents(id),
    config JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id),
    action TEXT NOT NULL,
    input JSONB,
    output JSONB,
    error JSONB,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE life_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE memory_store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id),
    project_id UUID REFERENCES life_projects(id),
    type TEXT NOT NULL,
    content JSONB NOT NULL,
    tags TEXT[] DEFAULT '{}',
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_agent_id UUID REFERENCES agents(id),
    to_agent_id UUID REFERENCES agents(id),
    task JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE daily_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    user_location TEXT,
    priority_tasks JSONB,
    agent_status JSONB,
    user_mode TEXT,
    adjustments JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    granted BOOLEAN NOT NULL,
    scope JSONB,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agent_logs_agent_id ON agent_logs(agent_id);
CREATE INDEX idx_agent_logs_created_at ON agent_logs(created_at);
CREATE INDEX idx_memory_store_agent_id ON memory_store(agent_id);
CREATE INDEX idx_memory_store_tags ON memory_store USING GIN(tags);
CREATE INDEX idx_delegations_status ON delegations(status);
CREATE INDEX idx_daily_reviews_date ON daily_reviews(date);

-- RLS Policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_store ENABLE ROW LEVEL SECURITY;

-- Example RLS Policy
CREATE POLICY "Life CEO can access all agents"
    ON agents
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'life_ceo');
```

## GitHub Repository Setup

```yaml
# .github/workflows/deploy.yml
name: Deploy Life CEO Platform

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Deploy to Replit
        env:
          REPLIT_TOKEN: ${{ secrets.REPLIT_TOKEN }}
        run: npm run deploy
```

## Initial Agent Configuration

```json
{
  "agents": {
    "life_ceo": {
      "name": "Life CEO",
      "type": "orchestrator",
      "permissions": ["*"],
      "config": {
        "daily_review_time": "10:00",
        "timezone": "auto",
        "memory_scan_depth": 30
      }
    },
    "mundo_tango_ceo": {
      "name": "Mundo Tango CEO",
      "type": "project_manager",
      "parent": "life_ceo",
      "permissions": [
        "manage_tango_project",
        "access_tango_memory",
        "delegate_tango_tasks"
      ],
      "config": {
        "project_id": "mundo_tango",
        "supabase_instance": "mundo-tango-prod"
      }
    },
    "finance_ceo": {
      "name": "Finance CEO",
      "type": "financial_manager",
      "parent": "life_ceo",
      "permissions": [
        "read_financial_data",
        "create_budgets",
        "track_expenses"
      ],
      "config": {
        "integrations": ["stripe", "lemon_squeezy"],
        "budget_alerts": true
      }
    }
  }
}
```

## Next Steps

1. **Initialize GitHub Repository**
   ```bash
   git init life-ceo-platform
   cd life-ceo-platform
   git remote add origin https://github.com/scottboddye/life-ceo-platform.git
   ```

2. **Setup Supabase Project**
   - Create new Supabase project: `life-ceo-prod`
   - Run migration scripts
   - Configure RLS policies

3. **Configure Replit Project**
   - Create new Replit: `life-ceo-platform`
   - Set environment variables
   - Configure secrets

4. **Deploy Initial Agents**
   - Life CEO (orchestrator)
   - Memory Agent (core infrastructure)
   - Security Agent (permissions)

This structure provides a scalable foundation for the Life CEO system with clear separation of concerns, comprehensive security, and room for growth.